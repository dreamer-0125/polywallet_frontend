import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAccount, useChainId, useConnect, useConnectors } from "wagmi";
import { getAccount } from "@wagmi/core";
import { config as wagmiConfig } from "../config/index.js";
import { polygon } from "wagmi/chains";
import {
  createUser,
  findUser,
  requestAuthChallenge,
  verifyAuthSignature,
  fetchAuthSession,
  logoutApi,
  fetchMe,
} from "../api";
import { toast } from "react-toastify";
import {
  ensurePolygonChain,
  isPolygonChain,
  NO_POLYGON_CHAIN_MESSAGE,
  WRONG_NETWORK_MESSAGE,
} from "../utils/polygonChain";
import {
  safeConnect,
  resolveConnector,
  resolvePreferredConnector,
  NO_BITGET_WALLET_MSG,
} from "../utils/walletConnection.js";
import { isMobileWebWithoutBitget } from "../utils/walletConnectMobile.js";
import { clearAuthToken } from "../utils/authToken.js";
import { CONNECTOR_KEYS } from "../config/wallets.js";
import { hydrateUser } from "../utils/userDisplay.js";
import { confirmAuthSessionAndSuppressUnauthorized } from "../utils/authSession.js";
import { isBitgetInAppBrowser } from "../utils/bitgetWallet.js";
import {
  getSignErrorMessage,
  isMobileBrowser,
  isWalletConnectActive,
  signChallengeWithWallet,
} from "../utils/walletSign";

const AuthContext = createContext({
  user: null,
  setUser: (val) => {},
  isAuthenticated: false,
  connectWallet: async () => "",
  authenticate: async () => false,
  registerUser: async (referralCode, polyWalletID) => false,
  logout: () => {},
  referralCode: "",
  setReferralCode: (val) => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [referralCode, setReferralCode] = useState("");
  const [sessionChecked, setSessionChecked] = useState(false);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectAsync } = useConnect();
  const connectors = useConnectors();
  const wrongChainNotifiedRef = useRef(null);
  const refreshInFlightRef = useRef(null);
  const mismatchCheckTimerRef = useRef(null);
  const authBootstrapRef = useRef(false);
  const unauthorizedHandledRef = useRef(false);
  const isAuthenticated = !!user?.id;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchAuthSession();
        if (cancelled) return;
        if (res?.success && res.user) {
          setUser(hydrateUser(res.user));
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setSessionChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      if (authBootstrapRef.current || unauthorizedHandledRef.current) return;
      unauthorizedHandledRef.current = true;
      toast.info("Please sign in again with your wallet.");
      setUser(null);
      clearAuthToken();
      logoutApi().catch(() => {});
      setTimeout(() => {
        unauthorizedHandledRef.current = false;
      }, 5000);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // Only log out on a stable wallet mismatch — not during WC reconnect flicker (common on mobile).
  useEffect(() => {
    if (mismatchCheckTimerRef.current) {
      clearTimeout(mismatchCheckTimerRef.current);
      mismatchCheckTimerRef.current = null;
    }

    if (
      authBootstrapRef.current ||
      !sessionChecked ||
      !user?.walletAddress ||
      !address ||
      !isConnected
    ) {
      return undefined;
    }

    // WalletConnect / Bitget in-app: address can flicker on mobile — skip mismatch logout.
    if (isWalletConnectActive() || isBitgetInAppBrowser()) {
      return undefined;
    }

    mismatchCheckTimerRef.current = setTimeout(() => {
      const sessionAddr = user.walletAddress?.toLowerCase();
      const liveAddr = address?.toLowerCase();
      if (!sessionAddr || !liveAddr) return;
      if (sessionAddr !== liveAddr) {
        toast.warn(
          "Connected wallet does not match your PolyWallet account. Sign in with the correct wallet.",
        );
        setUser(null);
        logoutApi().catch(() => {});
      }
    }, 8000);

    return () => {
      if (mismatchCheckTimerRef.current) {
        clearTimeout(mismatchCheckTimerRef.current);
        mismatchCheckTimerRef.current = null;
      }
    };
  }, [sessionChecked, user?.walletAddress, address, isConnected]);

  useEffect(() => {
    if (!isConnected) return;
    if (isPolygonChain(chainId)) {
      wrongChainNotifiedRef.current = null;
      return;
    }

    if (wrongChainNotifiedRef.current !== chainId) {
      wrongChainNotifiedRef.current = chainId;
      toast.error(WRONG_NETWORK_MESSAGE);
    }
  }, [chainId, isConnected]);

  const notifyPolygonRequired = (result) => {
    if (result.missingChain) {
      toast.warn(NO_POLYGON_CHAIN_MESSAGE);
    } else {
      toast.error(WRONG_NETWORK_MESSAGE);
    }
  };

  const requirePolygonNetwork = async (chainHint) => {
    const result = await ensurePolygonChain({ chainId: chainHint ?? chainId });
    if (!result.ok) {
      notifyPolygonRequired(result);
    }
    return result.ok;
  };

  /**
   * @param {string} [connectorKey] — CONNECTOR_KEYS.bitget | injected | walletConnect
   */
  const connectWallet = async (connectorKey = CONNECTOR_KEYS.bitget) => {
    let connector = null;
    let usedBitget = false;

    if (connectorKey === CONNECTOR_KEYS.bitget) {
      const picked = await resolvePreferredConnector(connectors);
      connector = picked.connector;
      usedBitget = picked.isBitget;
      if (!usedBitget) {
        toast.warn(NO_BITGET_WALLET_MSG);
        if (isMobileWebWithoutBitget()) {
          toast.info(
            "Opening Bitget Wallet — approve the connection request, then return to this browser.",
            { autoClose: 10000 },
          );
        }
      }
    } else {
      connector = resolveConnector(connectors, connectorKey);
    }

    if (!connector) {
      toast.error(
        "No wallet available. Install Bitget Wallet or MetaMask, or use WalletConnect.",
      );
      return "";
    }

    const isWalletConnect = connector.type === "walletConnect";

    let connectedAddress = "";
    let connectedChainId = chainId;

    try {
      const result = await safeConnect(connectAsync, connector);
      connectedAddress = result.address;
      connectedChainId = result.chainId;
    } catch (err) {
      console.error("Wallet connection failed:", err);
      const rejected =
        err?.code === 4001 ||
        String(err?.message || "")
          .toLowerCase()
          .includes("rejected");
      const mobileWcHint =
        isWalletConnect && isMobileWebWithoutBitget()
          ? "Could not open WalletConnect. Try again and pick Bitget Wallet from the wallet list."
          : "Failed to connect wallet. Unlock your wallet and try again.";
      toast.error(rejected ? "Wallet connection was cancelled." : mobileWcHint);
      return "";
    }

    if (!connectedAddress) {
      toast.error("Failed to connect wallet");
      return "";
    }

    if (isWalletConnect) {
      await new Promise((resolve) =>
        setTimeout(resolve, isMobileWebWithoutBitget() ? 2500 : 1200),
      );
    } else if (isMobileBrowser()) {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    let onPolygon = await requirePolygonNetwork(connectedChainId);
    if (!onPolygon && isWalletConnect) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onPolygon = await requirePolygonNetwork();
    }
    if (!onPolygon) {
      return "";
    }

    return connectedAddress;
  };

  const authenticate = async (walletAddressOverride) => {
    const walletAddress = walletAddressOverride || address;
    if (!walletAddress) {
      toast.error("Please connect wallet first");
      return false;
    }

    if (!(await requirePolygonNetwork())) {
      return false;
    }

    try {
      const challengeRes = await requestAuthChallenge(walletAddress);
      if (!challengeRes.success) {
        toast.error(challengeRes.message || "Failed to get authentication challenge");
        return false;
      }

      const { message } = challengeRes.challenge;

      if (isMobileBrowser() && isWalletConnectActive()) {
        toast.info(
          "Approve the sign-in message in your wallet app (Polygon network).",
        );
      }

      let signature;
      try {
        signature = await signChallengeWithWallet(walletAddress, message);
      } catch (err) {
        console.error("User rejected signature or signing failed:", err);
        toast.error(getSignErrorMessage(err));
        return false;
      }

      const verifyRes = await verifyAuthSignature(
        walletAddress,
        signature,
        message,
      );
      if (!verifyRes.success) {
        toast.error(verifyRes.message || "Authentication failed");
        return false;
      }

      if (verifyRes.user) {
        setUser(hydrateUser(verifyRes.user));
      } else {
        const userRes = await findUser(walletAddress);
        if (userRes?.user) setUser(hydrateUser(userRes.user));
      }

      try {
        const sessionRes = await fetchAuthSession();
        if (sessionRes?.success && sessionRes.user) {
          setUser(hydrateUser(sessionRes.user));
        }
      } catch {
        /* verify already set user */
      }

      await confirmAuthSessionAndSuppressUnauthorized();

      return true;
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Authentication failed");
      return false;
    }
  };

  // Step 3: Register — referralCode first, then polyWalletID (display "User ID")
  const registerUser = async (referralInput = "", polyWalletID = "") => {
    const walletAddress =
      address ?? getAccount(wagmiConfig).address ?? "";
    if (!walletAddress) {
      toast.error("Wallet disconnected. Connect your wallet and try again.");
      return false;
    }

    if (!(await requirePolygonNetwork())) {
      return false;
    }

    authBootstrapRef.current = true;
    try {
      const referCode = String(referralInput || referralCode || "")
        .trim()
        .toUpperCase();
      if (!/^[A-Z0-9]{6}$/.test(referCode)) {
        toast.error("A valid 6-character referral code is required");
        return false;
      }
      const walletID = polyWalletID || walletAddress.slice(2, 12);

      const response = await createUser(walletAddress, referCode, walletID);

      if (response.user) {
        setUser(hydrateUser(response.user));

        const authOk = await authenticate(walletAddress);
        if (!authOk) {
          toast.warn(
            "Account created. Approve the sign-in message in your wallet to finish signing in.",
          );
          return false;
        }

        const session = await confirmAuthSessionAndSuppressUnauthorized();
        if (session?.user) {
          setUser(hydrateUser(session.user));
        }
        return true;
      }

      toast.warn(response.message || "Registration failed");
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed");
      return false;
    } finally {
      setTimeout(() => {
        authBootstrapRef.current = false;
      }, 12_000);
    }
  };

  const refreshUser = useCallback(async () => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const run = (async () => {
      try {
        const res = await fetchMe();
        if (res?.success && res.user) {
          setUser(hydrateUser(res.user));
          return hydrateUser(res.user);
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 429) {
          return null;
        }
        if (status === 404 || !err?.response) {
          try {
            const res = await fetchAuthSession();
            if (res?.success && res.user) {
              const hydrated = hydrateUser(res.user);
              setUser((prev) => (prev ? { ...prev, ...hydrated } : hydrated));
              return hydrated;
            }
          } catch {
            /* ignore */
          }
        }
      }
      return null;
    })();

    refreshInFlightRef.current = run;
    try {
      return await run;
    } finally {
      if (refreshInFlightRef.current === run) {
        refreshInFlightRef.current = null;
      }
    }
  }, []);

  // Poll while logged in; refresh when returning from background (common on mobile)
  useEffect(() => {
    if (!user?.id) return;
    const id = setInterval(refreshUser, 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refreshUser();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user?.id, refreshUser]);

  const logout = useCallback(async () => {
    setUser(null);
    clearAuthToken();
    try {
      await logoutApi();
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        sessionChecked,
        connectWallet,
        authenticate,
        registerUser,
        logout,
        refreshUser,
        referralCode,
        setReferralCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
