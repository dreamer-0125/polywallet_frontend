import React, { useCallback, useEffect, useState } from "react";
import LayoutA from "./LayoutA";
import HeaderActionsA from "./HeaderActionsA";
import { Crown, Users, TrendingUp, Copy, QrCode } from "lucide-react";
import { useLocale } from "../../i18n";
import Logo from "../../assets/LOGO-black.svg";
import { useAuth } from "../../context/AuthContext";
import { useLoadingContext } from "../../context/LoadingContext";
import { RankData, rankMeta } from "../../config/data.config";
import { getReferralData } from "../../api/backendAPI";
import TeamTreeUI from "../shared/teamStructure";

export default function RankA() {
  const { t } = useLocale();
  const [showQr, setShowQr] = useState(false);
  const { user } = useAuth();
  const { setLoading } = useLoadingContext();
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
    <LayoutA>
      <div className="px-6 pt-2 pb-4 space-y-4">
        {/* Header with Logo */}
        <div className="flex items-center justify-between sticky top-0 z-40 bg-[#F9FAFB]/80 backdrop-blur-xl py-2 -mx-6 px-6 border-b border-gray-100/50">
          <img src={Logo} alt="PolyWallet" className="h-5 w-auto" />
          <HeaderActionsA />
        </div>

        {/* Current Rank Card - Premium */}
        <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden text-center group">
          {/* Decor */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-100/50 rounded-full blur-3xl group-hover:bg-blue-200/50 transition-colors duration-500"></div>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[24px] mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/30 transform group-hover:scale-110 transition-transform duration-500 rotate-3">
              <Crown size={40} className="text-white fill-white/20" />
            </div>

            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              {t("currentRank", "Current Rank")}
            </p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-6">
              {user.rank}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                  {t("commission", "Commission")}
                </p>
                <p className="text-xl font-black text-green-600">
                  {RankData[user.rank].bonusRate * 100}%
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                  {t("pointBoost", "Point Boost")}
                </p>
                <p className="text-xl font-black text-blue-600">
                  {RankData[user.rank].pointApy * 100}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Stats - Clean Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[26px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between h-32 hover:translate-y-[-2px] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 mb-2">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">
                {t("direct", "Direct")}
              </p>
              <p className="text-3xl font-black text-gray-900">
                {teamStructure.children?.length}
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-[26px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between h-32 hover:translate-y-[-2px] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 mb-2">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">
                {t("team", "Team")}
              </p>
              <p className="text-3xl font-black text-gray-900">
                {teamStructure.team}
              </p>
            </div>
          </div>
        </div>

        {/* Referral Link - Dark Contrast */}
        <div className="bg-gray-900 text-white p-6 rounded-[28px] shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4 relative z-10">
            <span className="font-bold text-lg">
              {t("yourReferralLink", "Your Referral Link")}
            </span>
            <button
              type="button"
              onClick={() => setShowQr((prev) => !prev)}
              aria-pressed={showQr}
              aria-label="Toggle QR code"
              className="bg-white/10 p-2 rounded-xl backdrop-blur-md"
            >
              <QrCode size={20} className="text-white" />
            </button>
          </div>

          {showQr ? (
            <div className="bg-white p-3 rounded-xl flex items-center justify-center border border-white/10 relative z-10">
              <img
                src={qrCodeUrl}
                alt="Referral QR code"
                className="w-40 h-40 rounded-lg bg-white"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCopy}
              className="bg-black/50 p-4 rounded-xl flex items-center justify-between border border-white/10 relative z-10 group cursor-pointer hover:bg-black/70 transition-colors w-full text-left"
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

          {/* Bg Decor */}
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Your Team (Map) */}
        <TeamTreeUI teamStructure={teamStructure} />
      </div>
    </LayoutA>
  );
}
