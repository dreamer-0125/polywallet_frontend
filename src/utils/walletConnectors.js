import {
  getBitgetProvider,
  isBitgetProviderAvailable,
} from "./bitgetWallet.js";
import {
  isBkcodeDeeplinkMode,
  isWeb3ModalMode,
  resolveWalletConnectMode,
} from "./walletConnectStrategy.js";
import { CONNECTOR_KEYS } from "../config/wallets.js";

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

/** All WalletConnect connectors (wagmi always uses id "walletConnect"). */
export function listWalletConnectConnectors(connectors) {
  return (connectors ?? []).filter((c) => c.type === "walletConnect");
}

/**
 * Case 1 — first WC entry in config (showQrModal: false, bkcode relay).
 * wagmi ignores custom `id`; match by registration order in config/index.js.
 */
export function getBkcodeWalletConnectConnector(connectors) {
  const wc = listWalletConnectConnectors(connectors);
  return wc[0] ?? null;
}

/**
 * Case 2 — second WC entry (showQrModal: true, Web3Modal UI).
 */
export function getWeb3ModalWalletConnectConnector(connectors) {
  const wc = listWalletConnectConnectors(connectors);
  if (wc.length >= 2) return wc[1];
  return wc[0] ?? null;
}

export function getWalletConnectConnector(connectors, connectorKey) {
  const mode = resolveWalletConnectMode(connectorKey);
  if (isBkcodeDeeplinkMode(mode)) {
    return getBkcodeWalletConnectConnector(connectors);
  }
  if (isWeb3ModalMode(mode)) {
    return getWeb3ModalWalletConnectConnector(connectors);
  }
  return getWeb3ModalWalletConnectConnector(connectors) ?? getBkcodeWalletConnectConnector(connectors);
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

export async function pickWalletConnector(connectors, connectorKey = CONNECTOR_KEYS.bitget) {
  const list = connectors ?? [];
  const bitgetCandidates = list.filter(
    (c) => isBitgetConnector(c) || normalize(c.id) === "bitget",
  );

  for (const candidate of bitgetCandidates) {
    if (await connectorHasProvider(candidate)) {
      return { connector: candidate, isBitget: true };
    }
  }

  if (hasBitgetWallet()) {
    const configured = list.find((c) => normalize(c.id) === "bitget");
    if (configured) {
      return { connector: configured, isBitget: true };
    }
  }

  const wc = getWalletConnectConnector(list, connectorKey);
  return { connector: wc, isBitget: false };
}

export { isMobileWebWithoutBitget } from "./walletConnectMobile.js";
