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
  getInjectedConnector,
  isPolygonChain,
  NO_INJECTED_WALLET_MESSAGE,
  NO_POLYGON_CHAIN_MESSAGE,
  WRONG_NETWORK_MESSAGE,
} from "../utils/polygonChain";
import {
  getSignErrorMessage,
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
    if (!sessionChecked || !user?.walletAddress || !address) return;
    if (user.walletAddress.toLowerCase() !== address.toLowerCase()) {
      setUser(null);
      logoutApi().catch(() => {});
    }
  }, [sessionChecked, user, address]);

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

    if (user) {
      setUser(null);
      logoutApi().catch(() => {});
    }
  }, [chainId, isConnected, user]);

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
    const hasInjectedProvider =
      typeof window !== "undefined" && !!window.ethereum?.request;
    const injectedConnector = hasInjectedProvider
      ? getInjectedConnector(connectors)
      : null;
    const walletConnectConnector =
      connectors.find((c) => c.type === "walletConnect") ??
      connectors.find((c) => String(c.id).toLowerCase().includes("walletconnect")) ??
      null;

    const preferredConnector = injectedConnector ?? walletConnectConnector;
    if (!preferredConnector) {
      toast.error(
        "No wallet connector available. Install MetaMask (mobile/extension) or enable WalletConnect.",
      );
      return "";
    }
    if (!injectedConnector && preferredConnector === walletConnectConnector) {
      // More helpful than the injected-only message on mobile browsers.
      toast.info("Opening WalletConnect… choose your wallet app to continue.");
    } else if (!injectedConnector) {
      toast.error(NO_INJECTED_WALLET_MESSAGE);
      return "";
    }

    let connectedAddress = "";
    let connectedChainId = chainId;

    if (isConnected && address) {
      connectedAddress = address;
    } else {
      try {
        const connectRes = await connectAsync({
          connector: preferredConnector,
          chainId: polygon.id,
        });
        connectedAddress = connectRes.accounts?.[0] ?? "";
        connectedChainId = connectRes.chainId;
      } catch (err) {
        console.error("Wallet connection failed:", err);
        const rejected =
          err?.code === 4001 ||
          String(err?.message || "")
            .toLowerCase()
            .includes("rejected");
        const missingProvider =
          !hasInjectedProvider &&
          (String(err?.message || "").toLowerCase().includes("provider") ||
            String(err?.message || "").toLowerCase().includes("injected") ||
            String(err?.message || "").toLowerCase().includes("ethereum"));
        toast.error(
          rejected
            ? "Wallet connection was cancelled."
            : missingProvider
              ? "No browser wallet detected. On mobile, use WalletConnect or open this site inside your wallet’s in-app browser."
              : "Failed to connect wallet. Unlock your wallet and try again.",
        );
        return "";
      }
    }

    if (!connectedAddress) {
      toast.error("Failed to connect wallet");
      return "";
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
    try {
      const res = await fetchMe();
      if (res?.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      // /me not yet deployed (404) or transient error — fall back to session endpoint
      // so balance/rank still refreshes even before the backend is redeployed
      if (err?.response?.status === 404 || !err?.response) {
        try {
          const res = await fetchAuthSession();
          if (res?.success && res.user) {
            setUser((prev) => (prev ? { ...prev, ...res.user } : res.user));
          }
        } catch {
          /* ignore */
        }
      }
    }
  }, []);

  // Poll every 10 s while user is logged in so admin balance edits reflect quickly
  useEffect(() => {
    if (!user?.id) return;
    const id = setInterval(refreshUser, 10_000);
    return () => clearInterval(id);
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
