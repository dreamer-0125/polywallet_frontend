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
import { getReferralData } from "../../api/backendAPI";
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
    const response = await getReferralData(user.id);
    console.log(response);
    if (response.teamStructure) {
      setTeamStructure(response.teamStructure);
    }

    setLoading(false);
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
        <div className="grid grid-cols-12 gap-5">
          {/* Left Column (Current Rank) - 7 cols */}
          <div className="col-span-7">
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
          <div className="col-span-5 flex flex-col gap-5">
            {/* Stats - Horizontal alignment */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-200 flex items-center justify-between hover:translate-y-[-2px] transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <Users size={24} />
                </div>
                <p className="text-sm font-bold text-gray-500">
                  {t("direct", "Direct")}
                </p>
              </div>
              <p className="text-4xl font-black text-gray-900">{teamStructure.children?.length}</p>
            </div>
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-200 flex items-center justify-between hover:translate-y-[-2px] transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <TrendingUp size={24} />
                </div>
                <p className="text-sm font-bold text-gray-500">
                  {t("team", "Team")}
                </p>
              </div>
              <p className="text-4xl font-black text-gray-900">{teamStructure.team}</p>
            </div>

            {/* Referral Link - Moved here */}
            <div className="flex-1 bg-gray-900 text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden flex flex-col justify-center">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="font-bold text-lg">
                  {t("yourReferralLink", "Your Referral Link")}
                </h3>
                <button
                  onClick={() => setShowQr((prev) => !prev)}
                  className="bg-white/10 p-2 rounded-xl backdrop-blur-md hover:bg-white/20 transition-colors"
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
                <button
                  onClick={handleCopy}
                  className="bg-black/50 p-4 rounded-[20px] flex items-center justify-between border border-white/10 relative z-10 group cursor-pointer hover:bg-black/70 transition-colors w-full text-left"
                >
                  <span className="text-sm text-gray-300 truncate font-mono mr-2">
                    {referralLink}
                  </span>
                  <Copy
                    size={18}
                    className="text-gray-400 group-hover:text-white transition-colors"
                  />
                </button>
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
