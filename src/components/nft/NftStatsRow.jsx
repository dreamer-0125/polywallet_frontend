import React from "react";
import { useLocale } from "../../i18n";
import { formatNftSupply } from "../../hooks/useNftCollection";

/**
 * Shared Owned / Rank / Max supply row for mobile + desktop NFT pages.
 */
export default function NftStatsRow({
  ownedCount,
  rankLabel,
  supplyLabel,
  maxSupply,
  variant = "mobile",
}) {
  const { t } = useLocale();
  const isDesktop = variant === "desktop";

  const gridClass = isDesktop
    ? "grid min-w-0 grid-cols-3 gap-3"
    : "grid grid-cols-3 gap-2.5 min-w-0";

  const cardClass = isDesktop
    ? "min-w-0 rounded-[18px] border border-gray-200/80 bg-white p-4 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)]"
    : "min-w-0 rounded-[18px] border border-gray-200/80 bg-white p-3 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)]";

  const labelClass = isDesktop
    ? "mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400"
    : "text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1";

  const valueClass = isDesktop
    ? "text-2xl font-black tabular-nums leading-none text-gray-900"
    : "text-xl font-black text-gray-900 tabular-nums leading-none";

  const rankValueClass = isDesktop
    ? "text-sm font-black leading-tight text-blue-600 truncate max-w-full sm:text-xl"
    : "text-sm font-black text-blue-600 leading-tight truncate max-w-full sm:text-lg";

  const supplyDisplay =
    maxSupply != null && Number.isFinite(Number(maxSupply))
      ? formatNftSupply(maxSupply)
      : supplyLabel;

  return (
    <div className={gridClass}>
      <div className={cardClass}>
        <p className={labelClass}>{t("owned", "Owned")}</p>
        <p className={valueClass}>
          {Number(ownedCount || 0).toLocaleString("en-US")}
        </p>
      </div>
      <div className={cardClass}>
        <p className={labelClass}>{t("rank", "Rank")}</p>
        <div
          className={`flex min-h-[28px] items-center justify-center ${isDesktop ? "mt-1" : ""}`}
          title={rankLabel}
        >
          <p className={rankValueClass}>{rankLabel || "—"}</p>
        </div>
      </div>
      <div className={cardClass}>
        <p className={labelClass}>{t("maxSupply", "Supply")}</p>
        <p className={valueClass}>{supplyDisplay}</p>
      </div>
    </div>
  );
}
