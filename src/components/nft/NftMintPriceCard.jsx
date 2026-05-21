import React from "react";
import { Sparkles } from "lucide-react";
import { useLocale } from "../../i18n";

export default function NftMintPriceCard({
  displayNftData,
  mintProgress,
  variant = "mobile",
}) {
  const { t } = useLocale();
  const isDesktop = variant === "desktop";
  const mintedDisplay = displayNftData.mintedNfts.toLocaleString("en-US");
  const limitedDisplay = displayNftData.nftLimited.toLocaleString("en-US");

  const shellClass = isDesktop
    ? "bg-white p-5 rounded-[22px] border border-gray-200/80 shadow-[0_2px_18px_rgba(15,23,42,0.04)]"
    : "bg-white rounded-[28px] p-5 border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)]";

  const headerGap = isDesktop ? "mb-3" : "mb-3";
  const priceClass = isDesktop
    ? "mt-1 text-3xl font-black tracking-tight text-gray-900"
    : "text-3xl font-black text-gray-900 tracking-tight mt-1";

  const limitedMetaClass = isDesktop
    ? "mt-1 text-xs font-mono font-bold tabular-nums text-gray-400"
    : "text-gray-400 text-xs font-mono font-bold mt-1 tabular-nums";

  const progressTrackClass = isDesktop
    ? "h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
    : "h-2.5 w-full bg-gray-100 rounded-full overflow-hidden";

  const progressFillClass =
    "h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(37,99,235,0.35)]";

  return (
    <div className={shellClass}>
      <div className={`flex items-start justify-between gap-3 ${headerGap}`}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {t("mintPrice", "Mint Price")}
          </p>
          <p className={priceClass}>
            ${displayNftData.nftPrice.toLocaleString("en-US")}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-wide text-green-600">
            <Sparkles size={10} />
            {t("limited", "Limited")}
          </p>
          <p className={limitedMetaClass}>
            {mintedDisplay} / {limitedDisplay}
          </p>
        </div>
      </div>
      <div className={progressTrackClass}>
        <div
          className={progressFillClass}
          style={{ width: `${mintProgress}%` }}
        />
      </div>
    </div>
  );
}
