import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  QrCode,
  ArrowRight,
  Check,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext"; // We'll need to export mock login from here or just use context
import Logo from "../assets/LOGO-black.svg";
import { shortAddr } from "../utils";
import { useAccount } from "wagmi";
import { checkParent_api, createUser } from "../api";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { address } = useAccount();
  const { registerUser, user, setUser, referralCode, setReferralCode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    referralCode: referralCode,
  });
  const [errors, setErrors] = useState({ userId: "", referralCode: "" });

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      const normalized = ref.trim().toUpperCase().slice(0, 6);
      setReferralCode(normalized);
      setFormData((prev) => ({ ...prev, referralCode: normalized }));
    }
  }, [searchParams, setReferralCode]);

  const handleUserIdChange = (e) => {
    const val = e.target.value;
    let newError = "";

    if (val.length > 12) {
      newError = "Maximum 12 characters allowed";
    } else if (/\s/.test(val)) {
      newError = "No spaces allowed";
    } else if (!/^[a-zA-Z0-9]*$/.test(val)) {
      newError = "Only alphanumeric characters allowed";
    }

    setErrors((prev) => ({ ...prev, userId: newError }));
    setFormData((prev) => ({ ...prev, userId: val }));
  };

  const handleReferralChange = (e) => {
    const val = e.target.value.toUpperCase();
    let newError = "";

    if (val.length > 6) {
      newError = "Maximum 6 characters allowed";
    } else if (!/^[A-Z0-9]*$/.test(val)) {
      newError = "Only alphanumeric characters allowed";
    }

    setErrors((prev) => ({ ...prev, referralCode: newError }));
    setFormData((prev) => ({ ...prev, referralCode: val }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (value.length === 0) return; // Don't error on empty blur? Or maybe yes? User said "entered 2 chars". So only if > 0.

    let newError = "";
    if (name === "userId") {
      if (value.length < 3) newError = "Minimum 3 characters required";
    } else if (name === "referralCode") {
      if (value.length < 6)
        newError = "Referral Code must be exactly 6 characters";
    }

    if (newError) {
      setErrors((prev) => ({ ...prev, [name]: newError }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final check before submit (e.g. min length)
    const userIdError =
      formData.userId.length < 3
        ? "Minimum 3 characters required"
        : errors.userId;
    const referralError =
      formData.referralCode.length !== 6
        ? "Referral Code must be exactly 6 characters"
        : errors.referralCode;

    if (userIdError || referralError) {
      setErrors({ userId: userIdError, referralCode: referralError });
      return;
    }

    setIsLoading(true);
    try {
      const response = await checkParent_api(formData.referralCode);
      if (!response.flag) {
        toast.info("Referral Code is not correct");
        return;
      }

      // AuthContext: registerUser(referralCode, polyWalletID) — same order as API create body
      const result = await registerUser(formData.referralCode, formData.userId);
      //const result = true;
      if (result) {
        if (window.innerWidth >= 1024) {
          navigate("/desktop/wallet");
        } else {
          navigate("/soft-white/wallet");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-purple-50 to-transparent pointer-events-none"></div>

      {/* Header */}
      <header className="px-6 py-6 mt-10 flex justify-center items-center relative z-10 w-full max-w-md mx-auto">
        <button
          onClick={() => navigate("/")}
          className="absolute left-6 w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <img src={Logo} alt="PolyWallet" className="h-9 w-auto" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12 w-full max-w-md mx-auto relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-[40px] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-white/60 w-full">
          {/* Removed Header Titles as requested */}

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            {/* Connected Wallet Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Connected Wallet
              </label>
              <div className="bg-gray-50 rounded-[20px] px-5 py-4 flex items-center justify-between border border-gray-100">
                <span className="font-mono text-sm font-bold text-gray-600">
                  {shortAddr(address)}
                </span>
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Check size={14} strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* User ID Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                User ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter your user ID"
                  value={formData.userId}
                  name="userId"
                  onBlur={handleBlur}
                  onChange={handleUserIdChange}
                  className={`w-full bg-white border rounded-[20px] pl-12 pr-5 py-4 font-bold text-gray-900 outline-none focus:ring-4 transition-all placeholder:text-gray-300 ${errors.userId ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/10"}`}
                />
              </div>
              {errors.userId && (
                <p className="text-xs font-bold text-red-500 ml-1 animate-pulse">
                  {errors.userId}
                </p>
              )}
            </div>

            {/* Referral Code Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Referral Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <QrCode size={20} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter referral code"
                  value={formData.referralCode}
                  name="referralCode"
                  onBlur={handleBlur}
                  onChange={handleReferralChange}
                  className={`w-full bg-white border rounded-[20px] pl-12 pr-5 py-4 font-bold text-gray-900 outline-none focus:ring-4 transition-all placeholder:text-gray-300 ${errors.referralCode ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 focus:border-purple-500 focus:ring-purple-500/10"}`}
                />
              </div>
              {errors.referralCode && (
                <p className="text-xs font-bold text-red-500 ml-1 animate-pulse">
                  {errors.referralCode}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || errors.userId || errors.referralCode}
              className="w-full h-16 bg-gray-900 text-white rounded-[22px] font-bold text-lg shadow-lg hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
