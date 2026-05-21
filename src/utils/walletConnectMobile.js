import { config } from "../config/index.js";
import { isAndroid, isMobileBrowser } from "./device.js";
import { isBitgetProviderAvailable } from "./bitgetWallet.js";

/** Mobile browser tab without Bitget injected provider — Case 1 bkcode.vip. */
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
  anchor.target = "_self";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Case 1: open WC URI in Bitget via bkcode.vip (+ native / intent fallbacks).
 * @see https://web3.bitget.com/en/docs/configuration/deeplink
 */
export function openBkcodeWalletConnectUri(wcUri, handoff = null) {
  if (!wcUri || typeof window === "undefined") return;

  lastWalletConnectUri = wcUri;
  const encoded = encodeURIComponent(wcUri);

  const links = {
    bkcodeWc: `https://bkcode.vip/wc?uri=${encoded}`,
    bkcodeAlt: `https://bkcode.vip?wc=${encoded}`,
    native: `bitkeep://wc?uri=${encoded}`,
    bitget: `bitget://wc?uri=${encoded}`,
    androidIntent: `intent://wc?uri=${encoded}#Intent;scheme=bitkeep;package=com.bitkeep.wallet;end`,
  };

  if (handoff?.window && !handoff.window.closed) {
    try {
      handoff.window.location.href = isAndroid()
        ? links.androidIntent
        : links.bkcodeWc;
      return;
    } catch {
      /* fall through */
    }
  }

  const ordered = isAndroid()
    ? [links.androidIntent, links.bkcodeWc, links.bkcodeAlt, links.native, links.bitget]
    : [links.bkcodeWc, links.bkcodeAlt, links.bitget, links.native];

  for (const url of ordered) {
    openDeepLinkViaAnchor(url);
    return;
  }
}

export function openBitgetWalletConnectUri(wcUri, handoff = null) {
  openBkcodeWalletConnectUri(wcUri, handoff);
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

  const link = isAndroid()
    ? `https://bkcode.vip?${params.toString()}`
    : `bitkeep://bkconnect?${params.toString()}`;

  openDeepLinkViaAnchor(link);
}

async function clearStaleWalletConnectSession(connector) {
  if (!connector?.getProvider) return;
  try {
    const provider = await connector.getProvider();
    if (!provider?.session) return;
    const accounts = provider.session?.namespaces?.eip155?.accounts ?? [];
    if (accounts.length === 0) {
      await provider.disconnect();
    }
  } catch {
    /* ignore */
  }
}

/**
 * Case 1: relay WalletConnect pairing URI → Bitget (listen before connectAsync).
 */
export async function bindBkcodeWalletConnectUriRelay(connector, options = {}) {
  if (!isMobileWebWithoutBitget() || !connector?.getProvider) {
    return () => {};
  }

  const { handoff = null } = options;
  const handlers = [];
  let opened = false;

  const relayUri = (uri) => {
    if (opened || typeof uri !== "string" || !uri.startsWith("wc:")) return;
    opened = true;
    openBitgetWalletConnectUri(uri, handoff);
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

export const bindBitgetWalletConnectUriRelay = bindBkcodeWalletConnectUriRelay;
