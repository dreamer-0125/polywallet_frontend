import { config } from "../config/index.js";
import { isMobileBrowser } from "./device.js";
import { isBitgetProviderAvailable } from "./bitgetWallet.js";

/** Mobile browser tab without Bitget extension — use WalletConnect + Bitget deep link. */
export function isMobileWebWithoutBitget() {
  return isMobileBrowser() && !isBitgetProviderAvailable();
}

/**
 * Build Bitget WalletConnect deep links (native + universal + Android intent).
 * @see https://web3.bitget.com/en/docs/connect/adaptor/wallet-connect
 * @see https://web3.bitget.com/en/docs/configuration/deeplink
 */
export function buildBitgetWalletConnectDeepLinks(wcUri) {
  const encoded = encodeURIComponent(wcUri);
  return {
    native: [
      `bitget://wc?uri=${encoded}`,
      `bitkeep://wc?uri=${encoded}`,
    ],
    universal: [
      `https://bkcode.vip/wc?uri=${encoded}`,
      `https://bkcode.vip?wc=${encoded}`,
    ],
    androidIntent: `intent://wc?uri=${encoded}#Intent;scheme=bitkeep;package=com.bitkeep.wallet;end`,
  };
}

let lastWalletConnectUri = null;

/** Last WalletConnect pairing URI (for manual reopen on mobile). */
export function getLastBitgetWalletConnectUri() {
  return lastWalletConnectUri;
}

function openDeepLinkViaAnchor(url) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Open WalletConnect URI in Bitget Wallet.
 * Uses anchor navigation (works better than location.href from async WC callbacks on mobile Chrome).
 */
export function openBitgetWalletConnectUri(wcUri, handoff = null) {
  if (!wcUri || typeof window === "undefined") return;

  lastWalletConnectUri = wcUri;
  const links = buildBitgetWalletConnectDeepLinks(wcUri);
  const isAndroid = /android/i.test(navigator.userAgent);

  if (handoff?.window && !handoff.window.closed) {
    try {
      handoff.window.location.href = isAndroid
        ? links.androidIntent
        : links.native[0];
      return;
    } catch {
      /* fall through to anchor opens */
    }
  }

  const ordered = isAndroid
    ? [links.androidIntent, ...links.universal, ...links.native]
    : [...links.native, ...links.universal];

  for (const url of ordered) {
    openDeepLinkViaAnchor(url);
    return;
  }
}

/**
 * Reserve a window during the user click (WalletConnect URI arrives later).
 * Call synchronously from connect button handlers before any await.
 */
export function createBitgetWalletConnectHandoff() {
  if (typeof window === "undefined") return null;
  try {
    const popup = window.open("about:blank", "_blank");
    return popup ? { window: popup } : null;
  } catch {
    return null;
  }
}

/**
 * Open the current dApp inside Bitget in-app browser (injected wallet — no WalletConnect).
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

  const isAndroid = /android/i.test(navigator.userAgent);
  const link = isAndroid
    ? `https://bkcode.vip?${params.toString()}`
    : `bitkeep://bkconnect?${params.toString()}`;

  openDeepLinkViaAnchor(link);
}

async function clearStaleWalletConnectSession(connector) {
  if (!connector?.getProvider) return;
  try {
    const provider = await connector.getProvider();
    if (provider?.session) {
      await provider.disconnect();
    }
  } catch {
    /* ignore */
  }
}

/**
 * Relay WalletConnect pairing URI to Bitget on mobile web.
 * @param {import('wagmi').Connector} connector
 * @param {{ handoff?: { window: Window } | null }} [options]
 * @returns {Promise<() => void>} cleanup
 */
export async function bindBitgetWalletConnectUriRelay(connector, options = {}) {
  if (!isMobileWebWithoutBitget() || !connector?.getProvider) {
    return () => {};
  }

  const { handoff = null } = options;
  const handlers = [];

  const relayUri = (uri) => {
    if (typeof uri === "string" && uri.startsWith("wc:")) {
      openBitgetWalletConnectUri(uri, handoff);
    }
  };

  try {
    await clearStaleWalletConnectSession(connector);
    const provider = await connector.getProvider();
    if (provider?.on) {
      provider.on("display_uri", relayUri);
      handlers.push(() => provider.removeListener?.("display_uri", relayUri));
    }

    const onEmitterMessage = (message) => {
      if (message?.type === "display_uri" && message?.data) {
        relayUri(message.data);
      }
    };
    config.emitter?.on?.("message", onEmitterMessage);
    handlers.push(() => config.emitter?.off?.("message", onEmitterMessage));
  } catch {
    /* ignore */
  }

  return () => {
    for (const unbind of handlers) {
      try {
        unbind();
      } catch {
        /* ignore */
      }
    }
  };
}
