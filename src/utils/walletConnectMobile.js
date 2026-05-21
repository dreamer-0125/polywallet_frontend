import { config } from "../config/index.js";
import { isMobileBrowser } from "./device.js";
import { isBitgetProviderAvailable } from "./bitgetWallet.js";

/** Mobile browser without Bitget injected provider — connect via WalletConnect + deep link. */
export function isMobileWebWithoutBitget() {
  return isMobileBrowser() && !isBitgetProviderAvailable();
}

/**
 * Build Bitget WalletConnect deep links.
 * @see https://web3.bitget.com/en/docs/connect/adaptor/wallet-connect
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

export function getLastBitgetWalletConnectUri() {
  return lastWalletConnectUri;
}

function openDeepLinkViaAnchor(url) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/** Open WalletConnect pairing URI in Bitget Wallet (mobile Chrome / Safari). */
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
      /* fall through */
    }
  }

  const ordered = isAndroid
    ? [links.androidIntent, ...links.universal, ...links.native]
    : [...links.native, ...links.universal];

  openDeepLinkViaAnchor(ordered[0]);
}

/** Reserve a window during user click; navigate when WC URI is ready. */
export function createBitgetWalletConnectHandoff() {
  if (typeof window === "undefined") return null;
  try {
    const popup = window.open("about:blank", "_blank");
    return popup ? { window: popup } : null;
  } catch {
    return null;
  }
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
 * Relay WalletConnect URI to Bitget on mobile web.
 * @returns {Promise<() => void>}
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
