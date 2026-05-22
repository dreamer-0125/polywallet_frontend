import React, { useCallback, useEffect, useState } from "react";
import LayoutA from "./LayoutA";
import HeaderActionsA from "./HeaderActionsA";
import {
  Box,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { useLocale } from "../../i18n";
import Logo from "../../assets/LOGO-black.svg";
import { useLoadingContext } from "../../context/LoadingContext";
import { getNftData, nftMint } from "../../api/backendAPI";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function NFTA() {
  const { t } = useLocale();
  const { setLoading } = useLoadingContext();
  const { user, setUser } = useAuth();
  const [showMintModal, setShowMintModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [nftData, setNftData] = useState({});

  const init = useCallback(async () => {
    setLoading(true);
    const response = await getNftData(user.id);

    console.log(response);
    if (response.nftData) {
      setNftData(response.nftData);
    }
    setLoading(false);
  }, [user.nftAmount]);

  useEffect(() => {
    init();
  }, []);

  const handleNftMint = async () => {
    const amount = nftData.nftPrice * quantity;
    if (amount > user.polyBalance) {
        toast.info("Your Balance is insufficient!");
        return;
    }
    setLoading(true);
    const response = await nftMint(user.id, quantity);
    console.log(response)
    if (response.user) {
        toast.success("NFT minted successfully!");
        setUser(response.user);
    } else {
        toast.info("Please try again later!");
    }
    setShowMintModal(false);
    setLoading(false);

  };

  return (
    <LayoutA>
      <div className="px-6 pt-2 pb-4 space-y-4">
        {/* Header with Logo */}
        <div className="flex items-center justify-between sticky top-0 z-40 bg-[#F9FAFB]/80 backdrop-blur-xl py-2 -mx-6 px-6 border-b border-gray-100/50">
          <img src={Logo} alt="PolyWallet" className="h-5 w-auto" />
          <HeaderActionsA />
        </div>

        {/* Bento Grid Layout - REORDERED */}
        <div className="grid grid-cols-2 gap-4">
          {/* 1. Poly NFT Box (Image) */}
          <div className="col-span-2 bg-white rounded-[32px] p-1 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden group relative">
            <div className="bg-gray-50 rounded-[28px] p-6 h-72 relative overflow-hidden flex items-center justify-center">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-100/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

              <div className="relative z-10 group-hover:scale-105 transition-transform duration-500">
                <div className="w-24 h-24 bg-white rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex items-center justify-center border border-white/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-[24px]"></div>
                  <Box
                    size={40}
                    className="text-gray-900 relative z-10"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Mint Button */}
          <div className="col-span-2">
            <button
              onClick={() => setShowMintModal(true)}
              className="w-full h-14 bg-gray-900 text-white rounded-[20px] font-bold text-lg shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:bg-black hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <Box size={20} strokeWidth={2} />
              {t("mintNft", "Mint NFT")}
            </button>
          </div>

          {/* 3. Progress Bar & Price Section */}
          <div className="col-span-2 pt-2 pb-2">
            <div className="flex justify-between items-end mb-2 px-1">
              <div>
                <p className="text-gray-400 text-xs font-bold mb-0.5 uppercase tracking-wide">
                  {t("mintPrice", "Mint Price")}
                </p>
                <p className="text-gray-900 text-2xl font-black tracking-tight">
                  ${nftData?.nftPrice?.toLocaleString("en-US")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-600 text-xs font-bold flex items-center gap-1 justify-end mb-1">
                  <Sparkles size={10} /> {t("limited", "Limited")}
                </p>
                <p className="text-gray-400 text-xs font-mono font-bold">
                  {nftData?.mintedNfts?.toLocaleString("en-US")} /{" "}
                  {nftData?.nftLimited?.toLocaleString("en-US")}
                </p>
              </div>
            </div>

            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                style={{ width: `${(nftData?.mintedNfts / nftData?.nftLimited) * 100}%`}}
              ></div>
            </div>
          </div>

          {/* 4. Benefits List (Privileges) */}
          <div className="col-span-2 bg-white rounded-[32px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">
                {t("privileges", "Privileges")}
              </h3>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: Sparkles,
                  label: t(
                    "exclusiveAirdropRewards",
                    "Exclusive Airdrop Rewards",
                  ),
                  color: "text-yellow-600 bg-yellow-50",
                },
                {
                  icon: Zap,
                  label: t("upToPointBoost", "Up to 60% Point Boost"),
                  color: "text-purple-600 bg-purple-50",
                },
                {
                  icon: TrendingUp,
                  label: t("apyDailyInterestLabel", "10% APY Daily Interest"),
                  color: "text-green-600 bg-green-50",
                },
                {
                  icon: ShieldCheck,
                  label: t(
                    "ambassadorProgramAccess",
                    "Ambassador Program Access",
                  ),
                  color: "text-blue-600 bg-blue-50",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-center group">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${item.color}`}
                  >
                    <item.icon size={20} />
                  </div>
                  <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Owned Status (Moved to Bottom) */}
          <div className="col-span-2 bg-white p-5 rounded-[28px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg shadow-gray-200">
                <Layers size={22} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">
                  {t("owned", "Owned")}
                </p>
                <span className="mt-1 inline-flex items-center rounded-full bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 border border-blue-100">
                  {t(user.rank, user.rank)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-gray-900">
                {(user?.nftAmount ?? 0).toLocaleString("en-US")}
              </span>
              <span className="text-sm font-bold text-gray-400 ml-1">
                {t("nfts", "NFTs")}
              </span>
            </div>
          </div>
        </div>

        {/* Mint Modal */}
        {showMintModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-0 sm:px-4 pb-0 sm:pb-0">
            <div
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
              onClick={() => setShowMintModal(false)}
            ></div>

            <div className="bg-white w-full sm:w-[400px] rounded-t-[32px] sm:rounded-[40px] p-6 pb-12 sm:pb-6 shadow-2xl relative z-10 animate-slide-up sm:animate-pop-in">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">
                  {t("mintNft", "Mint NFT")}
                </h2>
                <button
                  onClick={() => setShowMintModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-[20px] border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-500 uppercase text-xs tracking-wider">
                      {t("quantity", "Quantity")}
                    </span>
                    <span className="font-black text-gray-900">
                      {quantity} {t("nftLabel", "NFT")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center text-gray-900 hover:bg-gray-50"
                    >
                      <Minus size={20} />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={100}
                      value={quantity}
                      onChange={(event) => {
                        const next = Math.max(
                          1,
                          Math.min(
                            100,
                            Number.parseInt(event.target.value || "1", 10),
                          ),
                        );
                        setQuantity(Number.isFinite(next) ? next : 1);
                      }}
                      className="w-24 bg-transparent text-center text-3xl font-black text-gray-900 outline-none"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(100, quantity + 1))}
                      className="w-12 h-12 bg-gray-900 rounded-xl shadow-lg flex items-center justify-center text-white hover:bg-black"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-[20px] border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      {t("pricePerNft", "Price per NFT")}
                    </span>
                    <span className="font-bold text-gray-900">
                      ${nftData?.nftPrice?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      {t("quantity", "Quantity")}
                    </span>
                    <span className="font-bold text-gray-900">{quantity}</span>
                  </div>
                  <div className="h-px bg-gray-200"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-700">
                      {t("totalCost", "Total Cost")}
                    </span>
                    <span className="text-2xl font-black text-gray-900">
                      ${(nftData?.nftPrice * quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleNftMint}
                  className="w-full py-4 bg-blue-600 text-white rounded-[20px] font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all"
                >
                  {t("confirmMint", "Confirm Mint")}
                </button>

                <button
                  onClick={() => setShowMintModal(false)}
                  className="w-full py-3 bg-transparent text-gray-400 font-bold text-sm hover:text-gray-600"
                >
                  {t("cancel", "Cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutA>
  );
}
