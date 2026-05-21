import {
  getBitgetProvider,
  isBitgetProviderAvailable,
} from "./bitgetWallet.js";
import { isMobileWebWithoutBitget } from "./walletConnectMobile.js";

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

export function getWalletConnectConnector(connectors) {
  return (
    connectors.find((c) => c.type === "walletConnect") ??
    connectors.find((c) => normalize(c.id).includes("walletconnect")) ??
    null
  );
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
 * Resolve connector for Bitget-first connect.
 * @returns {Promise<{ connector: import('wagmi').Connector | null, isBitget: boolean, needsInstall: boolean }>}
 */
export async function resolveBitgetConnector(connectors) {
  const list = connectors ?? [];

  if (isBitgetProviderAvailable()) {
    const bitgetCandidates = list.filter(
      (c) => isBitgetConnector(c) || normalize(c.id) === "bitget",
    );

    for (const candidate of bitgetCandidates) {
      if (await connectorHasProvider(candidate)) {
        return { connector: candidate, isBitget: true, needsInstall: false };
      }
    }

    const configured = list.find((c) => normalize(c.id) === "bitget");
    if (configured) {
      return { connector: configured, isBitget: true, needsInstall: false };
    }
  }

  const walletConnect = getWalletConnectConnector(list);
  if (walletConnect) {
    return {
      connector: walletConnect,
      isBitget: false,
      needsInstall: true,
    };
  }

  return { connector: null, isBitget: false, needsInstall: true };
}

export { isMobileWebWithoutBitget };
