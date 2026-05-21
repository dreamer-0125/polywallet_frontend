import React, { useCallback, useEffect, useState } from "react";
import LayoutADesktop from "./LayoutADesktop";
import HeaderActionsA from "../variant-a/HeaderActionsA";
import {
  Sparkles,
  TrendingUp,
  Target,
  BarChart3,
  Gamepad2,
  MessageCircle,
  Zap,
} from "lucide-react";
import { useLocale } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { getAirdrop } from "../../api";
import { useWalletConfig, formatRatePercent } from "../../context/WalletConfigContext";
import { useLoadingContext } from "../../context/LoadingContext";

export default function PointADesktop() {
  const { t } = useLocale();
  const formatNumber = (value) => {
    const n = Number(value);
    const safe = Number.isFinite(n) ? n : 0;
    return safe.toLocaleString("en-US");
  };
  const { user } = useAuth();
  const { getRankStats } = useWalletConfig();
  const { setLoading } = useLoadingContext();
  const pointApyLabel = formatRatePercent(
    user?.rates?.pointApy ?? getRankStats(user?.rank).pointApy
  );
  const [airdropData, setAirdropData] = useState([]);

  const init = useCallback(async () => {
    setLoading(true);
    const response = await getAirdrop();
    setAirdropData(response.airdropData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    init();
  }, []);

  const projects = [
    {
      icon: Target,
      color: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      icon: BarChart3,
      color: "bg-green-50 text-green-600",
      iconBg: "bg-green-100",
    },
    {
      icon: Gamepad2,
      color: "bg-purple-50 text-purple-600",
      iconBg: "bg-purple-100",
    },
    {
      icon: MessageCircle,
      color: "bg-amber-50 text-amber-400",
      iconBg: "bg-amber-100",
      disabled: true,
    },
  ];

  return (
    <LayoutADesktop>
      <div className="space-y-6">
        {/* Header with Page Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {t("pointsAirdrops", "Points & Airdrops")}
          </h1>
          <HeaderActionsA />
        </div>

        {/* Hero Card - SAME AS MOBILE */}
        <div className="bg-gray-900 text-white p-8 rounded-[32px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/5">
                <Sparkles
                  size={14}
                  className="text-yellow-400"
                  fill="currentColor"
                />
                <span className="text-xs font-bold tracking-wide">
                  {t("totalPointsLabel", "TOTAL POINTS")}
                </span>
              </div>
            </div>

            <h2 className="text-5xl font-black tracking-tight mb-6">
              {formatNumber(user.point)}
            </h2>

            <div className="flex gap-3">
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-2 text-green-400 mb-1">
                  <TrendingUp size={16} />
                  <span className="text-sm font-bold">
                    +{formatNumber(user.dailyPoint)}{" "}
                    {t("pointsTitle", "Points")}
                  </span>
                </div>
                <p className="text-xs text-white/60 font-medium">
                  {t("sinceLastCycle", "since last cycle")}
                </p>
              </div>

              <div className="flex-1 bg-gradient-to-br from-blue-600/80 to-blue-500/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg shadow-blue-900/20">
                <div className="flex items-center gap-2 text-white mb-1">
                  <Zap size={16} fill="currentColor" />
                  <span className="text-sm font-bold uppercase">
                    {pointApyLabel} APY
                  </span>
                </div>
                <p className="text-xs text-white/80 font-medium">
                  {t("onHeldPoints", "on held points")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">
              {t("supportedProjects", "Supported Projects")}
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              {airdropData.filter((p) => p.isActive).length} active
            </span>
          </div>

          <div className="grid gap-3">
            {airdropData.map((p, i) => {
              const meta = projects[i % projects.length];

              return (
                <div
                  key={i}
                  className={`group relative p-4 rounded-[26px] flex items-center gap-4 transition-all duration-300 ${!p.isActive ? "bg-gray-50 border border-dashed border-gray-200" : "bg-white shadow-sm border border-gray-200 hover:shadow-md hover:scale-[1.01]"}`}
                >
                  <div
                    className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 ${p.points == 0 ? "bg-gray-200 text-gray-400" : `bg-gradient-to-br ${meta.iconBg} to-white shadow-inner`}`}
                  >
                    <meta.icon
                      size={26}
                      className={p.points == 0 ? "" : meta.color.split(" ")[1]}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-bold text-base mb-0.5 ${!p.isActive ? "text-gray-400" : "text-gray-900"}`}
                    >
                      {p.name}
                    </h4>
                    {p.hookKey && (
                      <p className="text-[10px] text-gray-400 font-mono truncate">
                        hook: {p.hookKey}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    {!p.isActive ? (
                      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 bg-gray-200 text-gray-500 rounded-lg">
                        {t("comingSoon", "Coming Soon")}
                      </span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <div className="text-lg font-black text-gray-900 tracking-tight">
                          {formatNumber(p.points)}
                        </div>
                        <div className="flex flex-col items-end gap-0.5 mt-1">
                          <span className="text-xs font-bold text-green-500">
                            +{formatNumber(p.dailyPoint)} pt daily
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </LayoutADesktop>
  );
}
