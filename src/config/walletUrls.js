/** Official Bitget Wallet Chrome extension */
export const BITGET_CHROME_EXTENSION_URL =
  "https://chromewebstore.google.com/detail/bitget-wallet-formerly-bi/jiidiaalihmmhddjgbnbgdfflelocpak";

/** Bitget Wallet mobile / general download */
export const BITGET_MOBILE_INSTALL_URL =
  "https://web3.bitget.com/en/wallet-download";

export const METAMASK_CHROME_URL =
  "https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn";

export const TRUST_WALLET_INSTALL_URL = "https://trustwallet.com/download";

export function openInstallUrl(url) {
  if (typeof window === "undefined" || !url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}
