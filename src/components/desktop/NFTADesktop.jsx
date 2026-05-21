import React, { useMemo } from "react";
import LayoutADesktop from "./LayoutADesktop";
import HeaderActionsA from "../variant-a/HeaderActionsA";
import {
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  X,
  Plus,
  Minus,
  Gift,
} from "lucide-react";
import { useLocale } from "../../i18n";
import { useWalletConfig, formatRatePercent } from "../../context/WalletConfigContext";
import NftStatsRow from "../nft/NftStatsRow";
import NftCollectionTitle from "../nft/NftCollectionTitle";
import NftMintPriceCard from "../nft/NftMintPriceCard";
import { useNftCollection } from "../../hooks/useNftCollection";

function NftHeroVisual() {
  return (
    
    <div className="absolute inset-0 flex items-center justify-center origin-center animate-[nft-logo-drift_9s_ease-in-out_infinite]">
      <svg className="relative z-10 flex h-[min(46vh,300px)] w-[min(46vh,300px)] max-h-[62%] max-w-[62%] items-center justify-center overflow-hidden overflow-visible" role="img" aria-label="NFT" viewBox="-34, -30, 246, 202" preserveAspectRatio="xMidYMid meet">
                <polygon points="0 62.8 0 23 34.5 3 69 23 69 62.8 34.5 82.7" fill="rgba(56, 189, 248)" stroke="rgba(255, 255, 255)" stroke-width="2.3" stroke-linejoin="round"/>
                
                <polygon points="33.8 122.6 33.8 82.8 68.3 62.9 102.8 82.8 102.8 122.6 68.3 142.5" fill="rgba(56, 189, 248)" stroke="rgba(255, 255, 255)" stroke-width="2.3" stroke-linejoin="round"/>
                <polygon points="109.9 119.6 109.9 79.8 144.3 59.8 178.8 79.8 178.8 119.6 144.3 139.5" fill="rgba(56, 189, 248)" stroke="rgba(255, 255, 255)" stroke-width="2.3" stroke-linejoin="round"/>
                <polygon points="76 59.7 76 19.9 110.5 0 145 19.9 145 59.7 110.5 79.6" fill="rgba(56, 189, 248)" stroke="rgba(255, 255, 255)" stroke-width="2.3" stroke-linejoin="round"/>
                <path d="M110.5 8 137.5 23.8" fill="rgba(56, 189, 248)" stroke="rgba(255, 255, 255, 0.25)" stroke-width="4" stroke-linejoin="round"></path>
                <path d="M34.8 11.5 62 27" fill="rgba(56, 189, 248)" stroke="rgba(255, 255, 255, 0.25)" stroke-width="4" stroke-linejoin="round"></path>
                <path d="M144.3 68.5 171.3 84.1" fill="rgba(56, 189, 248)" stroke="rgba(255, 255, 255, 0.25)" stroke-width="4" stroke-linejoin="round"></path>
                <path d="M68.3 71.5 95.4 87" fill="rgba(56, 189, 248)" stroke="rgba(255, 255, 255, 0.25)" stroke-width="4" stroke-linejoin="round"></path>
      </svg>
    </div>
  );
}

export default function NFTADesktop() {
  const { t } = useLocale();
  const { balanceInterestApy, maxPointApy } = useWalletConfig();
  const privileges = useMemo(
    () => [
      {
        icon: Sparkles,
        labelKey: "exclusiveAirdropRewards",
        labelDefault: "Exclusive Airdrop Rewards",
        color: "text-yellow-600 bg-yellow-50",
      },
      {
        icon: Zap,
        labelKey: "upToPointBoost",
        labelDefault: `Up to ${formatRatePercent(maxPointApy)} Point Boost`,
        color: "text-purple-600 bg-purple-50",
      },
      {
        icon: TrendingUp,
        labelKey: "apyDailyInterestLabel",
        labelDefault: `${formatRatePercent(balanceInterestApy)} APY Daily Interest`,
        color: "text-green-600 bg-green-50",
      },
      {
        icon: ShieldCheck,
        labelKey: "ambassadorProgramAccess",
        labelDefault: "Ambassador Program Access",
        color: "text-blue-600 bg-blue-50",
      },
    ],
    [balanceInterestApy, maxPointApy]
  );
  const {
    user,
    showMintModal,
    setShowMintModal,
    quantity,
    setQuantity,
    displayNftData,
    ownedCount,
    rankLabel,
    supplyLabel,
    maxSupply,
    mintProgress,
    remainingNfts,
    heroMintLabel,
    handleNftMint,
  } = useNftCollection();

  return (
    <LayoutADesktop>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              {t("collection", "Collection")}
            </span>
            <h1 className="font-desktop text-2xl font-extrabold text-gray-900 tracking-tight">  
              PolyWallet
              <span className="font-light text-gray-400"> / </span>
              <span className="font-light text-gray-400">
                {displayNftData.nftSeries || "Genesis"}
              </span>
            </h1>
          </div>
          <HeaderActionsA />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.92fr)] gap-5">
          {/* Left: narrow hero */}
          <div className="min-w-0">
            <div className="h-full min-h-[520px] rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-1.5 shadow-[0_30px_70px_-24px_rgba(15,23,42,0.55)] ring-1 ring-white/5">
              <div className="relative h-full min-h-[508px] overflow-hidden rounded-[26px] bg-[#0b1220]">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(56,189,248,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.18) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                <div className="pointer-events-none select-none w-full h-full max-w-full max-h-full" aria-hidden="true">
                  <NftHeroVisual />
                </div>
                <div class="absolute bottom-10 left-1/2 -translate-x-1/2 w-72 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"></div>

                <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                  {displayNftData.nftSeries} {t("edition", "Edition")}
                </span>
                <span className="absolute top-4 right-4 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold tabular-nums text-white/90 backdrop-blur-md">
                  {heroMintLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Right: badges → title → stats → mint */}
          <div className="min-w-0 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                  {t("liveMint", "Live Mint")}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-500">
                  {t("verified", "Verified")}
                </span>
              </div>

              <NftCollectionTitle displayNftData={displayNftData} />
            </div>

            <NftStatsRow
              ownedCount={ownedCount}
              rankLabel={rankLabel}
              supplyLabel={supplyLabel}
              maxSupply={maxSupply}
              variant="desktop"
            />

            <NftMintPriceCard
              displayNftData={displayNftData}
              mintProgress={mintProgress}
              variant="desktop"
            />
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowMintModal(true)}
                className="flex h-14 w-full items-center justify-center gap-2.5 rounded-[20px] bg-gray-900 text-base font-bold text-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.35)] transition-all hover:bg-black active:scale-[0.98]"
              >
                <Gift size={20} strokeWidth={2} />
                {t("mintNft", "Mint NFT")}
              </button>
            </div>
            

            
          </div>
        </div>

        {/* Privileges */}
        <div>
          <div className="flex items-baseline justify-between mb-4 px-1">
            <div className="flex items-baseline gap-3">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">
                {t("holder", "Holder Benefits")}
              </span>
              <h3 className="font-desktop text-2xl font-extrabold text-gray-900 tracking-tight">
                {t("privileges", "Privileges")}
              </h3>
            </div>
            <span className="text-xs font-bold text-gray-400">
              {t("perksCountShort", "04 Perks")}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {privileges.map((item, i) => (
              <div
                key={item.labelKey}
                className="bg-white p-5 rounded-[24px] border border-gray-200/80 shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <item.icon size={18} strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-bold tabular-nums text-gray-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold leading-snug text-gray-900">
                  {t(item.labelKey, item.labelDefault)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showMintModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
            onClick={() => setShowMintModal(false)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-[420px] rounded-[32px] bg-white p-6 shadow-2xl animate-pop-in">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">
                {t("mintNft", "Mint NFT")}
              </h2>
              <button
                type="button"
                onClick={() => setShowMintModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="rounded-[20px] border border-gray-100 bg-gray-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {t("quantity", "Quantity")}
                  </span>
                  <span className="font-black text-gray-900">
                    {quantity} {t("nftLabel", "NFT")}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
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
                    type="button"
                    onClick={() => setQuantity(Math.min(100, quantity + 1))}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-black"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 rounded-[20px] border border-gray-100 bg-gray-50 p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {t("pricePerNft", "Price per NFT")}
                  </span>
                  <span className="font-bold text-gray-900">
                    ${displayNftData.nftPrice.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {t("quantity", "Quantity")}
                  </span>
                  <span className="font-bold text-gray-900">{quantity}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between">
                  <span className="font-bold text-gray-700">
                    {t("totalCost", "Total Cost")}
                  </span>
                  <span className="text-2xl font-black text-gray-900">
                    $
                    {(displayNftData.nftPrice * quantity).toLocaleString(
                      "en-US",
                    )}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNftMint}
                className="w-full rounded-[20px] bg-blue-600 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-700 active:scale-[0.98]"
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
