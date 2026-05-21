import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAccount, useChainId, useConnect, useConnectors } from "wagmi";
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
  openBitgetInstallPage,
  isBitgetInAppBrowser,
} from "../utils/bitgetWallet.js";
import { NO_BITGET_WALLET_MSG } from "../config/wallets.js";
import { resolveBitgetConnector } from "../utils/walletConnectors.js";
import { safeConnect } from "../utils/walletConnection.js";
import {
  createBitgetWalletConnectHandoff,
  getLastBitgetWalletConnectUri,
  isMobileWebWithoutBitget,
  openBitgetWalletConnectUri,
} from "../utils/walletConnectMobile.js";
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

  const isAuthenticated = !!user?.id;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchAuthSession();
        if (cancelled) return;
        if (res?.success && res.user) {
          setUser(res.user);
          // Immediately fetch full user data (with transactions) without waiting for 30s poll
          try {
            const meRes = await fetchMe();
            if (!cancelled && meRes?.success && meRes.user) {
              setUser(meRes.user);
            }
          } catch {
            /* ignore — session data already set above */
          }
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
      setUser(null);
      logoutApi().catch(() => {});
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    if (!sessionChecked || !user?.walletAddress || !address || !isConnected) return;
    const timer = setTimeout(() => {
      if (user.walletAddress.toLowerCase() !== address.toLowerCase()) {
        toast.warn(
          "Connected wallet does not match your PolyWallet account. Sign in with the correct wallet.",
        );
        setUser(null);
        logoutApi().catch(() => {});
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [sessionChecked, user, address, isConnected]);

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

  const connectWallet = async () => {
    const handoff = isMobileWebWithoutBitget()
      ? createBitgetWalletConnectHandoff()
      : null;

    const { connector, isBitget, needsInstall } =
      await resolveBitgetConnector(connectors);

    if (!connector) {
      toast.error(
        "Cannot connect. Install Bitget Wallet and try again.",
      );
      openBitgetInstallPage();
      return "";
    }

    if (needsInstall) {
      toast.warn(NO_BITGET_WALLET_MSG);
      openBitgetInstallPage();
      if (isMobileWebWithoutBitget()) {
        toast.info(
          "After installing Bitget Wallet, approve the connection in the app, then return to Chrome. Tap this message to reopen Bitget.",
          {
            autoClose: 15000,
            onClick: () => {
              const uri = getLastBitgetWalletConnectUri();
              if (uri) openBitgetWalletConnectUri(uri);
            },
          },
        );
      } else {
        toast.info(
          "Install the Bitget Wallet extension, refresh this page, then tap Connect Wallet again.",
          { autoClose: 12000 },
        );
      }
    } else if (isBitgetInAppBrowser()) {
      toast.info("Connecting with Bitget Wallet…");
    }

    let connectedAddress = "";
    let connectedChainId = chainId;

    if (isConnected && address) {
      connectedAddress = address;
    } else {
      try {
        const result = await safeConnect(connectAsync, connector, { handoff });
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
          isMobileWebWithoutBitget()
            ? "Could not connect to Bitget Wallet. Install the app, then tap Connect again."
            : "Failed to connect Bitget Wallet. Unlock your wallet and try again.";
        toast.error(rejected ? "Wallet connection was cancelled." : mobileWcHint);
        return "";
      }
    }

    if (!connectedAddress) {
      toast.error("Failed to connect wallet");
      return "";
    }

    if (!isBitget && isWalletConnectActive()) {
      await new Promise((resolve) =>
        setTimeout(resolve, isMobileWebWithoutBitget() ? 2500 : 1200),
      );
    } else if (isMobileBrowser()) {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    const onPolygon = await requirePolygonNetwork(connectedChainId);
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
          "Approve the sign-in message in Bitget Wallet (Polygon network).",
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
        setUser(verifyRes.user);
      } else {
        const userRes = await findUser(walletAddress);
        if (userRes?.user) setUser(userRes.user);
      }

      return true;
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Authentication failed");
      return false;
    }
  };

  // Step 3: Register — referralCode first, then polyWalletID (display "User ID")
  const registerUser = async (referralInput = "", polyWalletID = "") => {
    if (!address) return false;

    if (!(await requirePolygonNetwork())) {
      return false;
    }

    try {
      const referCode = referralInput || referralCode || "000000";
      const walletID = polyWalletID || address.slice(2, 12);

      const response = await createUser(address, referCode, walletID);

      if (response.user) {
        setUser(response.user);
        return true;
      } else {
        toast.warn(response.message || "Registration failed");
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed");
      return false;
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
          setUser(res.user);
          return res.user;
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
              setUser((prev) => (prev ? { ...prev, ...res.user } : res.user));
              return res.user;
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
