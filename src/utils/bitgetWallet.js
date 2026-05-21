import { isAndroid, isIOS, isMobileBrowser } from "./device.js";
import { BITGET_INSTALL } from "../config/wallets.js";

/** Bitget Wallet injected provider (extension + in-app browser). */
export function getBitgetProvider() {
  if (typeof window === "undefined") return undefined;

  const bitkeep = window.bitkeep?.ethereum ?? window.bitget?.ethereum;
  if (bitkeep?.request) return bitkeep;

  const eth = window.ethereum;
  if (!eth) return undefined;
  if (eth.isBitKeep) return eth;
  if (Array.isArray(eth.providers)) {
    return eth.providers.find((p) => p?.isBitKeep);
  }
  return undefined;
}

export function isBitgetProviderAvailable() {
  return !!getBitgetProvider();
}

export function isBitgetInAppBrowser() {
  return isBitgetProviderAvailable();
}

function openExternalUrl(url) {
  if (typeof window === "undefined" || !url) return;
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Open Bitget Wallet install page (app store, or browser extension).
 */
export function openBitgetInstallPage() {
  if (typeof window === "undefined") return;

  if (isMobileBrowser()) {
    if (isAndroid()) {
      openExternalUrl(BITGET_INSTALL.android);
      return;
    }
    if (isIOS()) {
      openExternalUrl(BITGET_INSTALL.ios);
      return;
    }
  }

  openExternalUrl(BITGET_INSTALL.extension);
}

/**
 * Open PolyWallet inside Bitget in-app browser (injected provider, no WalletConnect).
 * @see https://web3.bitget.com/en/docs/configuration/deeplink
 */
export function openCurrentSiteInBitgetDappBrowser() {
  if (typeof window === "undefined") return;

  const actionId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now());

  const params = new URLSearchParams({
    action: "DApp",
    url: window.location.href,
    dappName: "PolyWallet",
    actionID: actionId,
    version: "1",
  });

  const link = isAndroid()
    ? `https://bkcode.vip?${params.toString()}`
    : `bitkeep://bkconnect?${params.toString()}`;

  const anchor = document.createElement("a");
  anchor.href = link;
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
