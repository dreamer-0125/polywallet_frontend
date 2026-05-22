import React, { createContext, useContext, useState, useEffect } from "react";
import { useAccount, useConnect, useConnectors } from "wagmi";
import { polygon } from "wagmi/chains";
import { createUser } from "../api/backendAPI";
import { toast } from "react-toastify";
import { getUSDCBalance } from "../utils";

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

  // wagmi state
  const { address, isConnected } = useAccount();
  const { connectAsync } = useConnect();

  const isAuthenticated = !!(user?.id ?? user?.userId);
  const connectors = useConnectors();

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user) {
        window.localStorage.setItem("pw-auth", JSON.stringify(user));
      } else {
        window.localStorage.removeItem("pw-auth");
      }
    }
  }, [user]);

  const connectWallet = async () => {
    if (isConnected && address) {
      return address;
    }

    const connector =
      connectors.find((c) => c.type === "injected") ?? connectors[0];

    if (!connector) {
      toast.error("No wallet found. Install MetaMask or use WalletConnect.");
      return "";
    }

    try {
      const connectRes = await connectAsync({
        connector,
        chainId: polygon.id,
      });
      const connectedAddress = connectRes.accounts?.[0] ?? "";
      if (!connectedAddress) {
        toast.error("Failed to connect wallet");
        return "";
      }
      return connectedAddress;
    } catch (err) {
      console.error("Wallet connection failed:", err);
      const rejected =
        err?.code === 4001 ||
        String(err?.message || "").toLowerCase().includes("rejected");
      toast.error(
        rejected ? "Wallet connection was cancelled." : "Failed to connect wallet.",
      );
      return "";
    }
  };

  // Step 2: Register
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
      window.location.href = "/"; // Hard redirect to clear any component state if needed, or just navigate
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
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
