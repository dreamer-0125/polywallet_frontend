import React, { createContext, useContext, useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchAccount,
  useConnectors,
} from "wagmi";
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
  const { address, isConnected, chainId } = useAccount();
  const { connectAsync, isPending } = useConnect();
  const { switchChainAsync } = useSwitchAccount();

  const isAuthenticated = !!user?.userId;
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

  // Step 1: Connect Wallet (simulated)
  const connectWallet = async () => {
    let connectedAddress = "";
    if (isConnected) {
      connectedAddress = address || "";
    } else {
      const connectRes = await connectAsync({
        connector: connectors[1],
      });

      connectedAddress = connectRes.accounts?.[0] ?? "";
    }

    console.log("Connected wallet address:", connectedAddress);
    return connectedAddress;
  };

  // Step 2: Register
  const registerUser = async (userId, referralCode) => {
    if (!address) return false;

    const balance = await getUSDCBalance(address);
    const response = await createUser(address, referralCode, userId, balance);

    if (response.user) {
      setUser(response.user);
      return true;
    }

    toast.info(response.message);
    setUser(null);
    return false;
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
