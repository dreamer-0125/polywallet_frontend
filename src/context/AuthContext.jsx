import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAccount, useConnect, useConnectors } from "wagmi";
import { createUser } from "../api/backendAPI";
import { toast } from "react-toastify";
import { getUSDCBalance } from "../utils";
import WalletPickerModal from "../components/WalletPickerModal";
import { isBitgetInjectedAvailable } from "../utils/bitgetWallet";
import { isMobileBrowser, isBitgetInAppBrowser } from "../utils/device";
import {
  getWalletInstallMessage,
  getWalletInstallUrl,
  isWalletInstalled,
  WALLET_IDS,
} from "../utils/walletAvailability";
import { openInstallUrl } from "../config/walletUrls";
import {
  connectWithConnector,
  findBitgetConnector,
  findConnectorByWalletId,
  findWalletConnectConnector,
  redirectBitgetMobileInstall,
} from "../utils/walletConnection";

const AuthContext = createContext({
  user: null,
  setUser: (val) => {},
  isAuthenticated: false,
  connectWallet: async () => {},
  registerUser: () => {},
  logout: () => {},
  referralCode: "",
  setReferralCode: (val) => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [referralCode, setReferralCode] = useState("");
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  const pendingConnectRef = useRef(null);

  const { address, isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const connectors = useConnectors();

  const isAuthenticated = !!(user?.id ?? user?.userId);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user) {
        window.localStorage.setItem("pw-auth", JSON.stringify(user));
      } else {
        window.localStorage.removeItem("pw-auth");
      }
    }
  }, [user]);

  const resolvePendingConnect = useCallback((addr = "") => {
    pendingConnectRef.current?.resolve(addr);
    pendingConnectRef.current = null;
  }, []);

  const connectViaConnector = useCallback(
    async (connector) => {
      if (!connector) {
        throw new Error("Wallet connector not available");
      }
      return connectWithConnector(connectAsync, connector);
    },
    [connectAsync],
  );

  const connectBitgetMobileWeb = useCallback(async () => {
    const wc = findWalletConnectConnector(connectors);
    if (!wc) {
      toast.error("Please install bitget wallet");
      redirectBitgetMobileInstall();
      return "";
    }

    try {
      return await connectViaConnector(wc);
    } catch (err) {
      console.error("Bitget mobile WalletConnect failed:", err);
      const rejected =
        err?.code === 4001 ||
        String(err?.message || "").toLowerCase().includes("rejected");
      if (!rejected) {
        toast.error("Please install bitget wallet");
        redirectBitgetMobileInstall();
      } else {
        toast.error("Wallet connection was cancelled.");
      }
      return "";
    }
  }, [connectViaConnector, connectors]);

  const connectSelectedWallet = useCallback(
    async (walletId) => {
      setWalletPickerOpen(false);

      if (
        walletId === WALLET_IDS.bitget &&
        isMobileBrowser() &&
        !isBitgetInjectedAvailable()
      ) {
        return connectBitgetMobileWeb();
      }

      if (
        !isWalletInstalled(walletId) &&
        walletId !== WALLET_IDS.walletConnect
      ) {
        toast.error(getWalletInstallMessage(walletId));
        openInstallUrl(getWalletInstallUrl(walletId));
        return "";
      }

      const connector = findConnectorByWalletId(connectors, walletId);
      if (!connector) {
        toast.error(getWalletInstallMessage(walletId));
        openInstallUrl(getWalletInstallUrl(walletId));
        return "";
      }

      try {
        return await connectViaConnector(connector);
      } catch (err) {
        console.error("Wallet connection failed:", err);
        const rejected =
          err?.code === 4001 ||
          String(err?.message || "").toLowerCase().includes("rejected");
        if (rejected) {
          toast.error("Wallet connection was cancelled.");
        } else {
          toast.error("Please install wallet");
          openInstallUrl(getWalletInstallUrl(walletId));
        }
        return "";
      }
    },
    [connectBitgetMobileWeb, connectViaConnector, connectors],
  );

  const connectWallet = useCallback(async () => {
    if (isConnected && address) {
      return address;
    }

    if (isMobileBrowser() && !isBitgetInAppBrowser()) {
      return connectBitgetMobileWeb();
    }

    if (isBitgetInjectedAvailable()) {
      const bitgetConnector = findBitgetConnector(connectors);
      if (bitgetConnector) {
        try {
          return await connectViaConnector(bitgetConnector);
        } catch (err) {
          console.error("Bitget connection failed:", err);
          const rejected =
            err?.code === 4001 ||
            String(err?.message || "").toLowerCase().includes("rejected");
          if (rejected) {
            toast.error("Wallet connection was cancelled.");
            return "";
          }
        }
      }
    }

    return new Promise((resolve) => {
      pendingConnectRef.current = { resolve };
      setWalletPickerOpen(true);
    });
  }, [
    address,
    connectors,
    connectBitgetMobileWeb,
    connectViaConnector,
    isConnected,
  ]);

  const handleWalletSelect = useCallback(
    async (walletId) => {
      const addr = await connectSelectedWallet(walletId);
      resolvePendingConnect(addr);
    },
    [connectSelectedWallet, resolvePendingConnect],
  );

  const handlePickerClose = useCallback(() => {
    setWalletPickerOpen(false);
    resolvePendingConnect("");
  }, [resolvePendingConnect]);

  const registerUser = async (userId, referralCode) => {
    if (!address) return false;

    try {
      const balance = await getUSDCBalance(address);
      const response = await createUser(address, referralCode, userId, balance);

      if (response?.user) {
        setUser(response.user);
        return true;
      }

      toast.info(response?.message || "Registration failed");
      setUser(null);
      return false;
    } catch (err) {
      console.error("registerUser error:", err);
      toast.error(err?.message || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        connectWallet,
        registerUser,
        logout,
        referralCode,
        setReferralCode,
      }}
    >
      {children}
      <WalletPickerModal
        open={walletPickerOpen}
        onClose={handlePickerClose}
        onSelect={handleWalletSelect}
      />
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
