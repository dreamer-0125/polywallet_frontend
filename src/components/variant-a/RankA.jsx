import React, { useCallback, useEffect, useState } from "react";
import LayoutA from "./LayoutA";
import HeaderActionsA from "./HeaderActionsA";
import { Users, TrendingUp, Copy, QrCode } from "lucide-react";
import { useLocale } from "../../i18n";
import Logo from "../../assets/LOGO-black.svg";
import { useAuth } from "../../context/AuthContext";
import { useLoadingContext } from "../../context/LoadingContext";
import { rankMeta } from "../../config/data.config";
import { useWalletConfig, formatRatePercent } from "../../context/WalletConfigContext";
import { getReferralData } from "../../api";
import TeamTreeUI from "../shared/teamStructure";
import { toast } from "react-toastify";
export default function RankA() {
  const { t } = useLocale();
  const [showQr, setShowQr] = useState(false);
  const { user } = useAuth();
  const { getRankStats } = useWalletConfig();
  const { setLoading } = useLoadingContext();
  const [teamStructure, setTeamStructure] = useState({});

  const referralLink = `${window.origin}/register?ref=${user.referralCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(referralLink)}`;

  const rankKey = user?.rank ?? "";
  const rankStats = getRankStats(rankKey);
  const commissionLabel = formatRatePercent(
    user?.rates?.bonusRate ?? rankStats.bonusRate
  );
  const pointBoostLabel = formatRatePercent(
    user?.rates?.pointApy ?? rankStats.pointApy
  );
  const rankInfo = rankMeta[rankKey] ?? rankMeta["-"];
  const RankIcon = rankInfo.icon;

  const directCount = teamStructure.children?.length ?? 0;
  const teamCount = teamStructure.team ?? 0;

  const init = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getReferralData();
      if (response?.teamStructure) {
        setTeamStructure(response.teamStructure);
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        /* auth:unauthorized → redirect home */
      } else if (!err?.response) {
        toast.warn("Could not load team data. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  useEffect(() => {
    init();
  }, [init]);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(referralLink);
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

        {/* Current rank */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-200/80 relative overflow-hidden text-center">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-44 h-44 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-[72px] h-[72px] mx-auto mb-4 flex items-center justify-center rounded-[22px] ring-1 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 text-white ring-blue-400/40 shadow-[0_10px_30px_rgba(59,130,246,0.35)] rotate-3">
              {rankKey === "-" || !rankKey ? (
                <RankIcon />
              ) : (
                <RankIcon size={32} strokeWidth={1.75} />
              )}
            </div>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              {t("currentRank", "Current Rank")}
            </p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-5">
              {rankKey || "—"}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-[18px] p-3 border border-gray-100">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.15em]">
                  {t("commission", "Commission")}
                </p>
                <p className="text-2xl font-black text-green-600 tabular-nums">
                  {commissionLabel}
                </p>
              </div>
              <div className="bg-gray-50 rounded-[18px] p-3 border border-gray-100">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.15em]">
                  {t("pointBoost", "Point Boost")}
                </p>
                <p className="text-2xl font-black text-blue-600 tabular-nums">
                  {pointBoostLabel}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Direct & Team */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative bg-white p-4 rounded-[24px] border border-gray-200/80 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 bg-gradient-to-br from-sky-400 to-blue-600 shadow-[0_8px_20px_rgba(59,130,246,0.35)]">
              <Users size={18} strokeWidth={2.25} />
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.18em]">
              {t("direct", "Direct")}
            </p>
            <p className="text-3xl font-black bg-gradient-to-br  from-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
              {directCount.toLocaleString("en-US")}
            </p>
          </div>

          <div className="relative bg-white p-4 rounded-[24px] border border-gray-200/80 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 bg-gradient-to-br from-emerald-400 to-green-600 shadow-[0_8px_20px_rgba(34,197,94,0.35)]">
              <TrendingUp size={18} strokeWidth={2.25} />
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.18em]">
              {t("team", "Team")}
            </p>
            <p className="text-3xl font-black bg-gradient-to-br  from-emerald-400 to-green-600 bg-clip-text text-transparent tracking-tight">
              {Number(teamCount).toLocaleString("en-US")}
            </p>
          </div>
        </div>

        {/* Referral link */}
        <div className="relative z-10 overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-[0_20px_50px_-12px_rgba(30,27,75,0.45)] ring-1 ring-white/10">
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
              {t("inviteAndEarn", "Invite & Earn")}
            </p>
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-lg">
                {t("yourReferralLink", "Your Referral Link")}
              </span>
              <button
                type="button"
                onClick={() => setShowQr((prev) => !prev)}
                aria-pressed={showQr}
                aria-label="Toggle QR code"
                className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/15 transition-colors"
              >
                <QrCode size={18} className="text-white" />
              </button>
            </div>

            {showQr ? (
              <div className="bg-white p-3 rounded-xl flex items-center justify-center border border-white/10">
                <img
                  src={qrCodeUrl}
                  alt="Referral QR code"
                  className="w-40 h-40 rounded-lg bg-white"
                />
              </div>
            ) : (
              <div className="flex w-full items-center gap-2 rounded-xl bg-black/50 p-1.5 pl-3 ring-1 ring-white/10">
                <span className="min-w-0 flex-1 truncate font-mono text-sm text-gray-300">
                  {referralLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy referral link"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_16px_rgba(59,130,246,0.45)] transition-all hover:from-blue-400 hover:to-indigo-500 active:scale-95"
                >
                  <Copy size={18} strokeWidth={2.25} />
                </button>
              </div>
            )}
          </div>

          <div className="absolute right-0 bottom-0 w-36 h-36 bg-indigo-500/25 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
          <div className="absolute left-0 top-0 w-28 h-28 bg-blue-500/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <TeamTreeUI teamStructure={teamStructure} />
      </div>
    </LayoutA>
  );
}
