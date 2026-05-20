import { useCallback, useEffect, useState } from "react";
import LayoutADesktop from "./LayoutADesktop";
import HeaderActionsA from "../variant-a/HeaderActionsA";
import {
  Crown,
  Users,
  TrendingUp,
  Copy,
  QrCode,
  Star,
  Shield,
  ChevronLeft,
} from "lucide-react";
import { useLocale } from "../../i18n";
import { useLoadingContext } from "../../context/LoadingContext";
import { useAuth } from "../../context/AuthContext";
import TeamTreeUI from "../shared/teamStructure";
import { getReferralData } from "../../api";
import { RankData } from "../../config/data.config";

export default function RankADesktop() {
  const { t } = useLocale();
  const { setLoading } = useLoadingContext();
  const { user } = useAuth();
  const [showQr, setShowQr] = useState(false);
  const [teamStructure, setTeamStructure] = useState({});

  const referralLink = `${window.origin}?ref=${user.referralCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(referralLink)}`;

  const init = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getReferralData();
      if (response?.teamStructure) {
        setTeamStructure(response.teamStructure);
      }
    } catch {
      /* session expired — auth:unauthorized event will handle redirect */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);


  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(referralLink);
    }
  };

  return (
    <LayoutADesktop>
      <div className="space-y-6">
        {/* Header with Page Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {t("rankTeam", "Rank & Team")}
          </h1>
          <HeaderActionsA />
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          {/* Left Column (Current Rank) - 7 cols */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-200 relative overflow-hidden text-center group h-full flex flex-col justify-center">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-56 h-56 bg-blue-100/50 rounded-full blur-3xl group-hover:bg-blue-200/50 transition-colors duration-500"></div>

              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[32px] mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/30 transform group-hover:scale-110 transition-transform duration-500 rotate-3">
                  <Crown size={48} className="text-white fill-white/20" />
                </div>

                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                  {t("currentRank", "Current Rank")}
                </p>
                <h2 className="text-5xl font-black text-gray-900 tracking-tight mb-8">
                  {user.rank}
                </h2>

                <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
                  <div className="bg-gray-50 rounded-[24px] p-5 border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-2">
                      {t("commission", "Commission")}
                    </p>
                    <p className="text-3xl font-black text-green-600">{RankData[user.rank].bonusRate * 100}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-[24px] p-5 border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-2">
                      {t("pointBoost", "Point Boost")}
                    </p>
                    <p className="text-3xl font-black text-blue-600">{RankData[user.rank].pointApy * 100}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Stats & Referral) - 5 cols */}
          <div className="lg:col-span-5 flex flex-col gap-4 lg:gap-5">
            {/* Stats - Horizontal alignment */}
            <div className="group relative bg-white p-4 sm:p-6 rounded-[32px] border border-gray-200/80 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.25)] flex items-center justify-between gap-3 overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(59,130,246,0.45)] transition-all duration-300">
              <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/25 transition-colors duration-500">
              </div>
              <div className="flex items-center gap-3 sm:gap-4 relative min-w-0">
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_8px_20px_-6px_rgba(59,130,246,0.6)] group-hover:scale-110 transition-transform duration-300">
                  <Users size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400">{t("direct", "Direct")}</p>
                  <p className="text-xs font-bold text-gray-500 mt-0.5 truncate">{t("personal_invites", "Personal Invites")}</p>
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tight relative shrink-0">{teamStructure.children?.length || 0}</p>
            </div>
            <div className="group relative bg-white p-4 sm:p-6 rounded-[32px] border border-gray-200/80 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.25)] flex items-center justify-between gap-3 overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(16,185,129,0.45)] transition-all duration-300">
              <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/25 transition-colors duration-500"></div>
              <div className="flex items-center gap-3 sm:gap-4 relative min-w-0">
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.6)] group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t("team", "Team")}</p>
                  <p className="text-xs font-bold text-gray-500 mt-0.5 truncate">{t("total_team_members", "Total Network")}</p>
                  
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-emerald-600 to-teal-700 bg-clip-text text-transparent tracking-tight relative shrink-0">{teamStructure.team}</p>
            </div>

            {/* Referral Link - Moved here */}
            <div className="flex-1 min-w-0 relative overflow-hidden text-white p-5 sm:p-6 rounded-[32px] shadow-[0_30px_60px_-20px_rgba(15,23,42,0.6)] flex flex-col justify-center bg-gradient-to-br from-[#0B1020] via-[#1a1f3d] to-[#0B1020] ring-1 ring-white/10">
              <div className="flex justify-between items-center mb-4 relative z-10 gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Invite & earn</p>
                  <h3 className="font-black text-base sm:text-lg lg:text-xl mt-1 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                    {t("yourReferralLink", "Your Referral Link")}
                  </h3>
                </div>
                <button
                  onClick={() => setShowQr((prev) => !prev)}
                  className="shrink-0 bg-white/10 p-2.5 rounded-xl backdrop-blur-md ring-1 ring-white/20 hover:bg-white/20 hover:scale-105 transition-all"
                >
                  <QrCode size={20} className="text-white" />
                </button>
              </div>

              {showQr ? (
                <div className="bg-white p-3 rounded-xl flex items-center justify-center border border-white/10 relative z-10 w-fit mx-auto">
                  <img
                    src={qrCodeUrl}
                    alt="Referral QR code"
                    className="w-32 h-32 rounded-lg bg-white"
                  />
                </div>
              ) : (
                <div className="flex w-full items-center gap-2 rounded-xl bg-black/50 p-1.5 pl-3 ring-1 ring-white/10">
                  <span className="min-w-0 flex-1 truncate font-mono text-sm text-gray-300">
                    {referralLink}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_16px_rgba(59,130,246,0.45)] transition-all hover:from-blue-400 hover:to-indigo-500 active:scale-95"
                  >
                    <Copy size={18} strokeWidth={2.25} />
                  </button>
                </div>
              )}
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>
          </div>
        </div>

        <TeamTreeUI teamStructure={teamStructure} />
      </div>
    </LayoutADesktop>
  );
}
