import { config } from "../config/index.js";
import { isMobileBrowser } from "./device.js";
import { isBitgetProviderAvailable } from "./bitgetWallet.js";

/** Mobile browser tab without Bitget extension — Case 1 bkcode.vip deep link. */
export function isMobileWebWithoutBitget() {
  return isMobileBrowser() && !isBitgetProviderAvailable();
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

/**
 * Case 1: bkcode.vip only (no AppKit / Web3Modal UI).
 * @see https://web3.bitget.com/en/docs/configuration/deeplink
 */
export function openBkcodeWalletConnectUri(wcUri) {
  if (!wcUri || typeof window === "undefined") return;

  lastWalletConnectUri = wcUri;
  const encoded = encodeURIComponent(wcUri);
  openDeepLinkViaAnchor(`https://bkcode.vip/wc?uri=${encoded}`);
}

/** @deprecated Use openBkcodeWalletConnectUri — alias for existing call sites. */
export function openBitgetWalletConnectUri(wcUri, handoff = null) {
  if (handoff?.window && !handoff.window.closed) {
    try {
      const encoded = encodeURIComponent(wcUri);
      handoff.window.location.href = `https://bkcode.vip/wc?uri=${encoded}`;
      lastWalletConnectUri = wcUri;
      return;
    } catch {
      /* fall through */
    }
  }
  openBkcodeWalletConnectUri(wcUri);
}

export function createBitgetWalletConnectHandoff() {
  if (typeof window === "undefined") return null;
  try {
    const popup = window.open("about:blank", "_blank");
    return popup ? { window: popup } : null;
  } catch {
    return null;
  }
}

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
 * Case 1: relay WalletConnect pairing URI → bkcode.vip (zero AppKit dependency).
 */
export async function bindBkcodeWalletConnectUriRelay(connector, options = {}) {
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

/** @deprecated Alias */
export const bindBitgetWalletConnectUriRelay = bindBkcodeWalletConnectUriRelay;
