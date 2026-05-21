import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Wallet, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/LOGO-black.svg";
import { useLoadingContext } from "../context/LoadingContext";
import { findUser } from "../api";
import { toast } from "react-toastify";
import WalletPickerModal from "../components/shared/WalletPickerModal";
import { CONNECTOR_KEYS } from "../config/wallets.js";
import { isBitgetProviderAvailable } from "../utils/bitgetWallet.js";

export default function Landing() {
  const { setLoading } = useLoadingContext();
  const navigate = useNavigate();
  const { connectWallet, authenticate, setReferralCode, isAuthenticated } =
    useAuth();
  const [searchParams] = useSearchParams();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [connectBusy, setConnectBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (window.innerWidth >= 1024) {
        navigate("/desktop/wallet", { replace: true });
      } else {
        navigate("/soft-white/wallet", { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  const runConnectFlow = async (connectorKey) => {
    setConnectBusy(true);
    setLoading(true);
    try {
      const connectedAddress = await connectWallet(connectorKey);
      if (!connectedAddress) {
        return;
      }

      const response = await findUser(connectedAddress);

      if (response.user) {
        const authSuccess = await authenticate(connectedAddress);
        if (!authSuccess) {
          toast.error(
            "Sign-in did not complete. Open your wallet app, approve the message on Polygon, and try again.",
          );
          return;
        }
        if (window.innerWidth >= 1024) {
          navigate("/desktop/wallet", { replace: true });
        } else {
          navigate("/soft-white/wallet", { replace: true });
        }
      } else {
        const ref = searchParams.get("ref");
        navigate(ref ? `/register?ref=${encodeURIComponent(ref)}` : "/register");
      }
    } catch (error) {
      console.error("Connect error:", error);
      const msg = error?.response
        ? error.response.data?.message || "Could not reach the server."
        : "Connection failed. Check your network and try again.";
      toast.error(msg);
    } finally {
      setConnectBusy(false);
      setLoading(false);
      setPickerOpen(false);
    }
  };

  const handleOpenPicker = () => {
    if (isBitgetProviderAvailable()) {
      runConnectFlow(CONNECTOR_KEYS.bitget);
      return;
    }
    setPickerOpen(true);
  };

  const handleSelectWallet = (key) => {
    runConnectFlow(key || CONNECTOR_KEYS.bitget);
  };

  const init = useCallback(() => {
    const refparams = searchParams.get("ref") || "";
    if (refparams) {
      setReferralCode(refparams);
    }
  }, [searchParams, setReferralCode]);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="min-h-screen bg-[#F3F5F7] flex flex-col relative font-sans md:justify-center md:items-center">
      <div className="flex-1 flex items-center justify-center p-6 md:flex-none md:p-0 md:mb-12">
        <img src={Logo} alt="PolyWallet" className="h-10 w-auto" />
      </div>

      <div className="w-full max-w-md mx-auto p-6 pb-20 md:max-w-none md:w-auto md:p-0 md:pb-0">
        <div className="bg-white rounded-[32px] p-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] md:w-[400px] md:p-8">
          <button
            type="button"
            onClick={handleOpenPicker}
            disabled={connectBusy}
            className="w-full h-16 bg-[#0F1115] text-white rounded-[24px] font-bold text-lg flex items-center justify-center gap-2.5 hover:bg-black hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg disabled:opacity-70"
          >
            <Wallet size={24} />
            Connect Wallet
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.2em] text-gray-400/80 uppercase md:mt-12">
          <ShieldCheck size={14} />
          <span>Secure & Encrypted</span>
        </div>
      </div>

      <WalletPickerModal
        open={pickerOpen}
        onClose={() => !connectBusy && setPickerOpen(false)}
        onSelect={handleSelectWallet}
        busy={connectBusy}
      />
    </div>
  );
}
