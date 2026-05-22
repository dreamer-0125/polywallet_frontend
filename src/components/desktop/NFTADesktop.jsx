import React, { useCallback, useEffect, useState } from "react";
import LayoutADesktop from "./LayoutADesktop";
import HeaderActionsA from "../variant-a/HeaderActionsA";
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
import { getNftData, nftMint } from "../../api/backendAPI";
import { toast } from "react-toastify";
import { useLoadingContext } from "../../context/LoadingContext";
import { useAuth } from "../../context/AuthContext";

export default function NFTADesktop() {
  const { t } = useLocale();
  const { setLoading } = useLoadingContext();
  const { user, setUser } = useAuth();
  const [showMintModal, setShowMintModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [nftData, setNftData] = useState({});

  const init = useCallback(async () => {
    setLoading(true);
    const response = await getNftData(user.id);

    if (response.nftData) {
      const nftData = response.nftData;
      setNftData(nftData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    init();
  }, [user]);

  const handleNftMint = async () => {
    const amount = nftData.nftPrice * quantity;
    if (amount > user.polyBalance) {
      toast.info("Your Balance is insufficient!");
      return;
    }
    setLoading(true);
    const response = await nftMint(user.id, quantity);
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
    <LayoutADesktop>
      <div className="space-y-6">
        {/* Header with Page Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {t("navNft", "NFT")}
          </h1>
          <HeaderActionsA />
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-12 gap-5">
          {/* Left Column (Image) - 7 cols */}
          <div className="col-span-7">
            <div className="bg-white rounded-[40px] p-2 shadow-sm border border-gray-200 h-full min-h-[380px]">
              <div className="bg-gray-50 rounded-[32px] h-full w-full relative overflow-hidden flex items-center justify-center group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

                <div className="relative z-10 transform group-hover:scale-105 transition-transform duration-700">
                  <div className="w-40 h-40 bg-white rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.08)] flex items-center justify-center border border-white/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-[40px]"></div>
                    <Box
                      size={50}
                      className="text-gray-900 relative z-10"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Info) - 5 cols */}
          <div className="col-span-5 flex flex-col justify-between">
            <div className="flex flex-col gap-5">
              {/* Owned Status */}
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg shadow-gray-200">
                    <Layers size={26} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {t("owned", "Owned")}
                    </p>
                    <span className="mt-1 inline-flex items-center rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 border border-blue-100">
                      {t(user.rank, user.rank)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-4xl font-black text-gray-900 leading-none">
                    {user.nftAmount.toLocaleString("en-US")}
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {t("nfts", "NFTs")}
                  </span>
                </div>
              </div>

              {/* Price & Progress */}
              <div className="pt-2">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <p className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wide">
                      {t("mintPrice", "Mint Price")}
                    </p>
                    <p className="text-gray-900 text-4xl font-black tracking-tight">
                      ${nftData?.nftPrice?.toLocaleString("en-US")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 text-xs font-bold flex items-center gap-1 justify-end mb-1">
                      <Sparkles size={12} /> {t("limited", "Limited")}
                    </p>
                    <p className="text-gray-400 text-sm font-mono font-bold">
                      {nftData?.mintedNfts?.toLocaleString("en-US")} /{" "}
                      {nftData?.nftLimited?.toLocaleString("en-US")}
                    </p>
                  </div>
                </div>

                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                    style={{
                      width: `${(nftData?.mintedNfts / nftData?.nftLimited) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Mint Button aligned to bottom of right block */}
            <div>
              <button
                onClick={() => setShowMintModal(true)}
                className="w-full h-14 bg-gray-900 text-white rounded-[24px] font-bold text-lg shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:bg-black hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <Box size={22} strokeWidth={2} />
                {t("mintNft", "Mint NFT")}
              </button>
            </div>
          </div>
        </div>

        {/* Benefits List (Bottom) */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-200 space-y-5">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-gray-900 text-lg">
              {t("privileges", "Privileges")}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <div
                key={i}
                className="flex gap-4 items-center group p-3 rounded-[20px] hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
              >
                <div
                  className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 transition-colors ${item.color}`}
                >
                  <item.icon size={24} />
                </div>
                <p className="font-bold text-gray-900 text-base">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mint Modal - Kept Same */}
      {showMintModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
            onClick={() => setShowMintModal(false)}
          ></div>

          <div className="bg-white w-full max-w-[420px] rounded-[32px] p-6 shadow-2xl relative z-10 animate-pop-in">
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
            </div>
          </div>
        </div>
      )}
    </LayoutADesktop>
  );
}
