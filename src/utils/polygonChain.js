import { getChainId, switchChain } from "@wagmi/core";
import { polygon } from "wagmi/chains";
import { config } from "../config/index.js";

export const POLYGON_CHAIN_ID = polygon.id;

export function isPolygonChain(chainId) {
  if (chainId === undefined || chainId === null) return false;
  return Number(chainId) === POLYGON_CHAIN_ID;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getInjectedConnector(connectors) {
  return (
    connectors.find((c) => c.type === "injected") ??
    connectors.find((c) => String(c.id).toLowerCase() === "injected") ??
    null
  );
}

export const NO_INJECTED_WALLET_MESSAGE =
  "No browser wallet found. Install MetaMask (or another Web3 extension) and refresh this page.";

export const NO_POLYGON_CHAIN_MESSAGE =
  "Polygon is not in your wallet. Add the Polygon network in your wallet settings, or approve the add-network prompt when it appears.";

export const WRONG_NETWORK_MESSAGE =
  "PolyWallet only supports Polygon. Switch your wallet to the Polygon network.";

function isChainNotAddedError(error) {
  const code = error?.code ?? error?.cause?.code;
  if (code === 4902) return true;
  const msg = String(error?.message || error?.cause?.message || "").toLowerCase();
  return (
    msg.includes("unrecognized chain") ||
    msg.includes("chain has not been added") ||
    msg.includes("must add the chain")
  );
}

function getPolygonAddChainParams() {
  const rpcUrl = polygon.rpcUrls.default.http[0];
  const explorerUrl = polygon.blockExplorers?.default?.url;
  return {
    chainId: `0x${POLYGON_CHAIN_ID.toString(16)}`,
    chainName: polygon.name,
    nativeCurrency: polygon.nativeCurrency,
    rpcUrls: [rpcUrl],
    blockExplorerUrls: explorerUrl ? [explorerUrl] : undefined,
  };
}

async function addPolygonToWallet() {
  const provider = typeof window !== "undefined" ? window.ethereum : null;
  if (!provider?.request) return false;

  try {
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [getPolygonAddChainParams()],
    });
    return true;
  } catch {
    return false;
  }
}

async function addPolygonToProvider(provider) {
  if (!provider?.request) return false;
  if (!provider?.request) return false;

  try {
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [getPolygonAddChainParams()],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Switch (or add) Polygon on the connected wallet.
 * @returns {{ ok: true } | { ok: false, missingChain: boolean }}
 */
export async function ensurePolygonChain({ chainId: hintChainId } = {}) {
  if (isPolygonChain(hintChainId) || isPolygonChain(getChainId(config))) {
    return { ok: true };
  }

  let missingChain = false;

  try {
    await switchChain(config, { chainId: POLYGON_CHAIN_ID });
  } catch (err) {
    if (isChainNotAddedError(err)) {
      // Use the currently-connected provider when possible (WalletConnect case),
      // otherwise fall back to window.ethereum (injected case).
      const connectedProvider =
        (await config.state.connections.get(config.state.current)?.connector?.getProvider?.().catch(() => null)) ??
        null;
      const added = connectedProvider
        ? await addPolygonToProvider(connectedProvider)
        : await addPolygonToWallet();
      if (!added) {
        return { ok: false, missingChain: true };
      }
      missingChain = false;
      try {
        await switchChain(config, { chainId: POLYGON_CHAIN_ID });
      } catch {
        return { ok: false, missingChain: true };
      }
    } else {
      return { ok: false, missingChain: false };
    }
  }

  for (let i = 0; i < 10; i += 1) {
    if (isPolygonChain(getChainId(config))) {
      return { ok: true };
    }
    await sleep(150);
  }

  return { ok: false, missingChain };
}
