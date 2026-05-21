import { isMobileBrowser } from "./device.js";
import { isBitgetProviderAvailable } from "./bitgetWallet.js";

/** Mobile browser tab without Bitget extension — use WalletConnect + Bitget deep link. */
export function isMobileWebWithoutBitget() {
  return isMobileBrowser() && !isBitgetProviderAvailable();
}

/**
 * Open WalletConnect URI in Bitget Wallet (BKConnect / WC deep link).
 * @see https://web3.bitget.com/en/docs/configuration/deeplink
 */
export function openBitgetWalletConnectUri(wcUri) {
  if (!wcUri || typeof window === "undefined") return;

  const encoded = encodeURIComponent(wcUri);
  const links = [
    `bitkeep://wc?uri=${encoded}`,
    `https://bkcode.vip/wc?uri=${encoded}`,
    `https://bkcode.vip?wc=${encoded}`,
  ];

  const isAndroid = /android/i.test(navigator.userAgent);
  const ordered = isAndroid
    ? [links[1], links[2], links[0]]
    : [links[0], links[1], links[2]];

  window.location.href = ordered[0];
}

/**
 * Open the current dApp inside Bitget in-app browser (injected wallet — no WalletConnect).
 */
export function openCurrentSiteInBitgetDappBrowser() {
  if (typeof window === "undefined") return;
  const pageUrl = encodeURIComponent(window.location.href);
  const dappName = encodeURIComponent("PolyWallet");
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

  const isAndroid = /android/i.test(navigator.userAgent);
  const link = isAndroid
    ? `https://bkcode.vip?${params.toString()}`
    : `bitkeep://bkconnect?${params.toString()}`;

  window.location.href = link;
}

/**
 * Relay WalletConnect pairing URI to Bitget on mobile web (AppKit deep link is unreliable).
 * @returns {Promise<() => void>} cleanup
 */
export async function bindBitgetWalletConnectUriRelay(connector) {
  if (!isMobileWebWithoutBitget() || !connector?.getProvider) {
    return () => {};
  }

  try {
    const provider = await connector.getProvider();
    if (!provider?.on) return () => {};

    const onDisplayUri = (uri) => {
      openBitgetWalletConnectUri(uri);
    };

    provider.on("display_uri", onDisplayUri);
    return () => {
      provider.removeListener?.("display_uri", onDisplayUri);
    };
  } catch {
    return () => {};
  }
}
