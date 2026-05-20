import React, { useCallback, useEffect, useState } from "react";
import LayoutA from "./LayoutA";
import HeaderActionsA from "./HeaderActionsA";
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
import Logo from "../../assets/LOGO-black.svg";
import { useLoadingContext } from "../../context/LoadingContext";
import { getNftData, nftMint } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
const DEFAULT_NFT_DATA = {
  nftPrice: 1000,
  mintedNfts: 3247,
  nftLimited: 10000,
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

const PRIVILEGES = [
  {
    icon: Sparkles,
    labelKey: "exclusiveAirdropRewards",
    labelDefault: "Exclusive Airdrop Rewards",
    color: "text-yellow-600 bg-yellow-50",
  },
  {
    icon: Zap,
    labelKey: "upToPointBoost",
    labelDefault: "Up to 60% Point Boost",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: TrendingUp,
    labelKey: "apyDailyInterestLabel",
    labelDefault: "10% APY Daily Interest",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: ShieldCheck,
    labelKey: "ambassadorProgramAccess",
    labelDefault: "Ambassador Program Access",
    color: "text-blue-600 bg-blue-50",
  },
];

export default function NFTA() {
  const { t } = useLocale();
  const { setLoading } = useLoadingContext();
  const { user, setUser } = useAuth();
  const [showMintModal, setShowMintModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [nftData, setNftData] = useState({});

  const displayNftData = { ...DEFAULT_NFT_DATA, ...nftData };
  const ownedCount = Number(user?.nftAmount ?? 0);
  const rankLabel = user?.rank || "—";
  const supplyLabel = formatSupply(displayNftData.nftLimited);
  const editionLabel = `#${String(displayNftData.nftEdition ?? 1).padStart(3, "0")} / ${supplyLabel}`;
  const mintProgress =
    displayNftData.nftLimited > 0
      ? Math.min(
          100,
          (displayNftData.mintedNfts / displayNftData.nftLimited) * 100,
        )
      : 0;

  const init = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getNftData(user.id);
      if (response.nftData) {
        setNftData(response.nftData);
      }
    } catch {
      /* ignore — session errors handled globally */
    } finally {
      setLoading(false);
    }
  }, [user.id, setLoading]);

  useEffect(() => {
    init();
  }, [init]);

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
        setUser(response.user);
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
    <LayoutA>
      <div className="px-5 pt-2 pb-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 z-40 bg-[#F9FAFB]/80 backdrop-blur-xl py-2 -mx-5 px-5 border-b border-gray-100/50">
          <img src={Logo} alt="PolyWallet" className="h-5 w-auto" />
          <HeaderActionsA />
        </div>

        {/* NFT hero card */}
        <div className="rounded-[28px] p-1.5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-[0_30px_70px_-24px_rgba(15,23,42,0.6)] ring-1 ring-white/5">
          <div className="relative aspect-[4/3] rounded-[28px] overflow-hidden bg-[#0b1220]">
            <div
              className="absolute inset-0 opacity-35"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(56,189,248,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.08) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.18),transparent_55%)]" />

            <div className="absolute inset-0 flex items-center justify-center">
              {/* <img
                src="/logo-simple.png"
                alt={displayNftData.nftName || "NFT"}
                className="w-[160px] h-auto select-none drop-shadow-[0_18px_45px_rgba(56,189,248,0.25)]"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.src = "/logo.svg";
                }}
              /> */}
              <svg animate-spin className="h-[180px] w-[180px] overflow-visible" role="img" aria-label="NFT" viewBox="-34, -30, 246, 202" preserveAspectRatio="xMidYMid meet">
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
            <div class="absolute bottom-10 left-1/2 -translate-x-1/2 w-72 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"></div>

            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/40 backdrop-blur-md border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
              {displayNftData.nftSeries || "Genesis"}
            </span>
            <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-slate-900/40 backdrop-blur-md border border-white/10 px-3 py-1.5 text-[10px] font-bold tabular-nums text-white/90">
              {editionLabel}
            </span>
          </div>
        </div>
        

        {/* Status badges + title */}
        <div>
          <div className="flex mb-2 items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-900 text-white text-[10px] font-bold tracking-[0.18em] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              {t("liveMint", "Live Mint")}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold tracking-[0.18em] uppercase border border-amber-100">
              {t("verified", "Verified")}
            </span>
          </div>

          <h2 className="text-3xl  font-extrabold text-gray-900 leading-[1.05] tracking-tight">Genesis Cube</h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">A limited edition collectible granting holders lifetime privileges across the PolyWallet ecosystem.</p>
        </div>

        {/* Owned / Rank / Supply */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="min-w-0 bg-white p-3 rounded-[18px] border border-gray-200/80 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t("owned", "Owned")}
            </p>
            <p className="text-xl font-black text-gray-900 tabular-nums leading-none">
              {ownedCount.toLocaleString("en-US")}
            </p>
          </div>
          <div className="min-w-0 bg-white p-3 rounded-[18px] border border-gray-200/80 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t("rank", "Rank")}
            </p>
            <p
              className="text-lg font-black text-blue-600 leading-none truncate px-0.5"
              title={rankLabel}
            >
              {rankLabel}
            </p>
          </div>
          <div className="min-w-0 bg-white p-3 rounded-[18px] border border-gray-200/80 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t("supply", "Supply")}
            </p>
            <p className="text-xl font-black text-gray-900 tabular-nums leading-none">
              {supplyLabel}
            </p>
          </div>
        </div>

        {/* Mint price card */}
        <div className="bg-white rounded-[28px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="flex justify-between items-start gap-3 mb-3">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {t("mintPrice", "Mint Price")}
              </p>
              <p className="text-3xl font-black text-gray-900 tracking-tight mt-1">
                ${displayNftData.nftPrice.toLocaleString("en-US")}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-green-600 text-[10px] font-bold flex items-center gap-1 justify-end uppercase tracking-wide">
                <Sparkles size={10} />
                {t("limited", "Limited")}
              </p>
              <p className="text-gray-400 text-xs font-mono font-bold mt-1">
                {displayNftData.mintedNfts.toLocaleString("en-US")} /{" "}
                {displayNftData.nftLimited.toLocaleString("en-US")}
              </p>
            </div>
          </div>

          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(37,99,235,0.35)]"
              style={{ width: `${mintProgress}%` }}
            />
          </div>
        </div>

        {/* Mint NFT */}
        <button
          type="button"
          onClick={() => setShowMintModal(true)}
          className="w-full h-14 bg-gray-900 text-white rounded-[20px] font-bold text-base shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:bg-black hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
        >
          <Gift size={20} strokeWidth={2} />
          {t("mintNft", "Mint NFT")}
        </button>

        {/* Holder privileges */}
        <div>
          <div className="flex items-baseline justify-between mb-3 px-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">
                {t("holder", "Holder")}
              </span>
              <h3 className="font-extrabold text-gray-900 text-xl leading-tight">
                {t("privileges", "Privileges")}
              </h3>
            </div>
            <span className="text-[10px] font-bold text-gray-400">
              04
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PRIVILEGES.map((item, i) => (
              <div
                key={item.labelKey}
                className="bg-white rounded-[20px] p-4 border border-gray-200/80 shadow-[0_2px_10px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
                  >
                    <item.icon size={18} strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="font-bold text-gray-900 text-[13px] leading-snug">
                  {t(item.labelKey, item.labelDefault)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mint Modal */}
        {showMintModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-0 sm:px-4 pb-0 sm:pb-0">
            <div
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
              onClick={() => setShowMintModal(false)}
            />

            <div className="bg-white w-full sm:w-[400px] rounded-t-[32px] sm:rounded-[40px] p-6 pb-12 sm:pb-6 shadow-2xl relative z-10 animate-slide-up sm:animate-pop-in">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">
                  {t("mintNft", "Mint NFT")}
                </h2>
                <button
                  type="button"
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
                      type="button"
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
                      type="button"
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
                      ${displayNftData.nftPrice.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      {t("quantity", "Quantity")}
                    </span>
                    <span className="font-bold text-gray-900">{quantity}</span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-700">
                      {t("totalCost", "Total Cost")}
                    </span>
                    <span className="text-2xl font-black text-gray-900">
                      $
                      {(
                        displayNftData.nftPrice * quantity
                      ).toLocaleString("en-US")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNftMint}
                  className="w-full py-4 bg-blue-600 text-white rounded-[20px] font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all"
                >
                  {t("confirmMint", "Confirm Mint")}
                </button>

                <button
                  type="button"
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
