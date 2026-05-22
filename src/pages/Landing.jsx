import React, { useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Wallet, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/LOGO-black.svg";
import { findUser } from "../api/backendAPI";
import { useLoadingContext } from "../context/LoadingContext";
import { getUSDCBalance } from "../utils";
import { toast } from "react-toastify";

export default function Landing() {
  const { setLoading } = useLoadingContext();
  const navigate = useNavigate();
  const { connectWallet, setUser, setReferralCode } = useAuth();
  const [searchParams] = useSearchParams();

  const handleConnect = async () => {
    setLoading(true);
    try {
      const connectedAddress = await connectWallet();
      if (!connectedAddress) {
        return;
      }

      let balance = "0";
      try {
        balance = await getUSDCBalance(connectedAddress);
      } catch (balanceErr) {
        console.warn("Could not read USDC balance:", balanceErr);
      }

      const response = await findUser(connectedAddress, balance);
      if (response?.user) {
        setUser(response.user);
        if (window.innerWidth >= 1024) {
          navigate("/desktop/wallet");
        } else {
          navigate("/soft-white/wallet");
        }
      } else {
        const ref = searchParams.get("ref");
        navigate(ref ? `/register?ref=${encodeURIComponent(ref)}` : "/register");
      }
    } catch (error) {
      console.error("Connect flow error:", error);
      toast.error(
        error?.message || "Connection failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const init = useCallback(async () => {
    const refparams = searchParams.get("ref") || "";
    if (refparams != "") {
      setReferralCode(refparams);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="min-h-screen bg-[#F3F5F7] flex flex-col relative font-sans md:justify-center md:items-center">
      {/* 1. Logo (Centered vertically in the main area) */}
      <div className="flex-1 flex items-center justify-center p-6 md:flex-none md:p-0 md:mb-12">
        <img src={Logo} alt="PolyWallet" className="h-10 w-auto" />
      </div>

      {/* 2. Footer Section (Button + Encrypted Badge) */}
      <div className="w-full max-w-md mx-auto p-6 pb-10 md:max-w-none md:w-auto md:p-0 md:pb-0">
        <div className="bg-white rounded-[32px] p-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] md:w-[400px] md:p-8">
          <button
            onClick={handleConnect}
            className="w-full h-16 bg-[#0F1115] text-white rounded-[24px] font-bold text-lg flex items-center justify-center gap-2.5 hover:bg-black hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg"
          >
            <Wallet size={24} className="text-white" strokeWidth={2.5} />
            <span>Connect Wallet</span>
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400/80 font-bold text-[10px] tracking-[0.2em] uppercase md:mt-12">
          <ShieldCheck size={14} />
          <span>Secure & Encrypted</span>
        </div>
      </div>
    </div>
  );
}
