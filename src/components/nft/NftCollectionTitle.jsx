import React from "react";
import { useLocale } from "../../i18n";

/** Shared title + description for mobile and desktop NFT pages. */
export default function NftCollectionTitle({ displayNftData }) {
  const { t } = useLocale();
  const name =
    displayNftData.nftName || t("genesisCube", "Genesis Cube");
  const description =
    displayNftData.nftDescription ||
    t(
      "genesisCubeDescription",
      "A limited edition collectible granting holders lifetime privileges across the PolyWallet ecosystem.",
    );

  return (
    <>
      <h2 className="font-desktop text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-gray-900 leading-[1.05] tracking-tight">
        {name}
      </h2>
      <p className="text-gray-500 text-sm mt-2 max-w-[34rem] leading-relaxed">
        {description}
      </p>
    </>
  );
}
