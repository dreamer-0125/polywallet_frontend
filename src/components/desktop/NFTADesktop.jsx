import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { getNftData, nftMint } from "../../api";
import { toast } from "react-toastify";
import { useLoadingContext } from "../../context/LoadingContext";
import { useAuth } from "../../context/AuthContext";
import { useWalletConfig, formatRatePercent } from "../../context/WalletConfigContext";

const DEFAULT_NFT_DATA = {
  nftPrice: 1000,
  mintedNfts: 0,
  nftLimited: 1000,
  remainingNfts: 1000,
  nftSeries: "Genesis",
  nftName: "Genesis Cube",
  nftEdition: 1,
  nftDescription:
    "A limited edition collectible granting holders lifetime privileges across the PolyWallet ecosystem.",
};

function formatSupply(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return `${k % 1 === 0 ? k : k.toFixed(1)}K`;
  }
  return n.toLocaleString("en-US");
}

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
  const { setLoading } = useLoadingContext();
  const { user, setUser, refreshUser } = useAuth();
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
  const [showMintModal, setShowMintModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [nftData, setNftData] = useState({});

  const displayNftData = { ...DEFAULT_NFT_DATA, ...nftData };
  const ownedCount = Number(user?.nftAmount ?? 0);
  const rankLabel = user?.rank || "—";
  const remainingNfts =
    displayNftData.remainingNfts ??
    Math.max(0, Number(displayNftData.nftLimited) - Number(displayNftData.mintedNfts));
  const supplyLabel = remainingNfts.toLocaleString("en-US");
  const mintedDisplay = displayNftData.mintedNfts.toLocaleString("en-US");
  const limitedDisplay = displayNftData.nftLimited.toLocaleString("en-US");
  const limitedShort = formatSupply(displayNftData.nftLimited);
  const heroMintLabel = `${displayNftData.mintedNfts.toLocaleString("en-US")} / ${limitedShort}`;
  const mintProgress =
    displayNftData.nftLimited > 0
      ? Math.min(
          100,
          (displayNftData.mintedNfts / displayNftData.nftLimited) * 100,
        )
      : 0;

  const loadNftData = useCallback(async () => {
    try {
      const response = await getNftData();
      if (response?.nftData) {
        setNftData(response.nftData);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const init = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    await loadNftData();
    setLoading(false);
  }, [user?.id, setLoading, loadNftData]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!user?.id) return;
    const id = setInterval(loadNftData, 30_000);
    return () => clearInterval(id);
  }, [user?.id, loadNftData]);

  const handleNftMint = async () => {
    const numericQuantity = Number(quantity);
    const amount = displayNftData.nftPrice * numericQuantity;
    if (amount > Number(user.polyBalance)) {
      toast.info("Your Balance is insufficient!");
      return;
    }
    setLoading(true);
    try {
      const response = await nftMint(numericQuantity);
      if (response?.user) {
        toast.success("NFT minted successfully!");
        setUser((prev) =>
          prev ? { ...prev, ...response.user } : response.user,
        );
        if (response.nftData) {
          setNftData(response.nftData);
        } else {
          await loadNftData();
        }
        await refreshUser();
      } else {
        toast.info(response?.message || "Please try again later!");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Mint failed";
      toast.error(msg);
    } finally {
      setShowMintModal(false);
      setLoading(false);
    }
  };

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

              <h2 className="text-[32px] font-extrabold leading-[1.08] tracking-tight text-gray-900">
                {displayNftData.nftName || t("genesisCube", "Genesis Cube")}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500">
                {displayNftData.nftDescription ||
                  t(
                    "genesisCubeDescription",
                    "A limited edition collectible granting holders lifetime privileges across the PolyWallet ecosystem.",
                  )}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 min-w-0">
              <div className="min-w-0 rounded-[18px] border border-gray-200/80 bg-white p-3.5 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  {t("owned", "Owned")}
                </p>
                <p className="mt-1 text-2xl font-black tabular-nums leading-none text-gray-900">
                  {ownedCount.toLocaleString("en-US")}
                </p>
              </div>
              <div className="min-w-0 rounded-[18px] border border-gray-200/80 bg-white p-3.5 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  {t("rank", "Rank")}
                </p>
                <p
                  className="mt-1 truncate px-0.5 text-sm font-black leading-tight text-blue-600 sm:text-xl"
                  title={rankLabel}
                >
                  {rankLabel}
                </p>
              </div>
              <div className="min-w-0 rounded-[18px] border border-gray-200/80 bg-white p-3.5 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  {t("remaining", "Remaining")}
                </p>
                <p className="mt-1 text-2xl font-black tabular-nums leading-none text-gray-900">
                  {supplyLabel}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {t("mintPrice", "Mint Price")}
                    </p>
                    <p className="mt-1 text-3xl font-black text-gray-900">
                      ${displayNftData.nftPrice.toLocaleString("en-US")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase text-green-600">
                      <Sparkles size={10} />
                      {t("limited", "Limited")}
                    </p>
                    <p className="mt-1 text-xs font-mono font-bold text-gray-400">
                      {mintedDisplay} / {limitedDisplay}
                    </p>
                  </div>
                </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(37,99,235,0.35)]"
                  style={{ width: `${mintProgress}%` }}
                />
              </div>
            </div>
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
