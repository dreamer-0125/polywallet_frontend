import { isMobileBrowser } from "./device.js";
import {
  getBitgetProvider,
  isBitgetProviderAvailable,
} from "./bitgetWallet.js";

const BITGET_MATCH = /bitget|bitkeep/;

function normalize(value) {
  return String(value ?? "").toLowerCase();
}

function connectorRdnsString(connector) {
  const rdns = connector?.rdns;
  if (!rdns) return "";
  if (typeof rdns === "string") return normalize(rdns);
  if (Array.isArray(rdns)) return rdns.map(normalize).join(" ");
  return "";
}

export function isBitgetConnector(connector) {
  if (!connector || connector.type !== "injected") return false;
  const id = normalize(connector.id);
  const name = normalize(connector.name);
  const rdns = connectorRdnsString(connector);
  return [id, name, rdns].some((s) => BITGET_MATCH.test(s));
}

export function hasBitgetWallet() {
  return isBitgetProviderAvailable();
}

export { getBitgetProvider };

export function getWalletConnectConnector(connectors) {
  return (
    connectors.find((c) => c.type === "walletConnect") ??
    connectors.find((c) => normalize(c.id).includes("walletconnect")) ??
    null
  );
}

export function findMetaMaskConnector(connectors) {
  return (
    connectors.find((c) => normalize(c.id) === "metamask") ??
    connectors.find(
      (c) => c.type === "injected" && normalize(c.name).includes("metamask"),
    ) ??
    null
  );
}

/** Mobile browser tab (not Bitget/MetaMask in-app) — use WalletConnect to reach Bitget app. */
export function isMobileWebWithoutBitget() {
  return isMobileBrowser() && !hasBitgetWallet();
}

/** MetaMask, another injected wallet, or WalletConnect — never Bitget. */
export async function findFallbackConnector(connectors) {
  const list = connectors ?? [];

  if (isMobileWebWithoutBitget()) {
    return getWalletConnectConnector(list);
  }

  const metamask = findMetaMaskConnector(list);
  if (metamask && (await connectorHasProvider(metamask))) {
    return metamask;
  }

  for (const c of list) {
    if (
      c.type === "injected" &&
      !isBitgetConnector(c) &&
      normalize(c.id) !== "bitget" &&
      normalize(c.id) !== "injected" &&
      (await connectorHasProvider(c))
    ) {
      return c;
    }
  }

  const genericInjected = list.find(
    (c) => c.type === "injected" && normalize(c.id) === "injected",
  );
  if (genericInjected && (await connectorHasProvider(genericInjected))) {
    return genericInjected;
  }

  return getWalletConnectConnector(list);
}

async function connectorHasProvider(connector) {
  if (!connector?.getProvider) return false;
  try {
    const provider = await connector.getProvider();
    return !!provider?.request;
  } catch {
    return false;
  }
}

/**
 * Prefer Bitget when installed; otherwise return a fallback connector.
 * @returns {Promise<{ connector: import('wagmi').Connector | null, isBitget: boolean }>}
 */
export async function pickWalletConnector(connectors) {
  const list = connectors ?? [];
  const bitgetCandidates = list.filter(
    (c) => isBitgetConnector(c) || normalize(c.id) === "bitgetwallet",
  );

  for (const candidate of bitgetCandidates) {
    if (await connectorHasProvider(candidate)) {
      return { connector: candidate, isBitget: true };
    }
  }

  if (hasBitgetWallet()) {
    const configured =
      list.find((c) => normalize(c.id) === "bitget") ??
      list.find((c) => normalize(c.id) === "bitgetwallet");
    if (configured) {
      return { connector: configured, isBitget: true };
    }
  }

  return {
    connector: await findFallbackConnector(list),
    isBitget: false,
  };
}
