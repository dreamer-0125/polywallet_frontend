import { getAccount, switchChain } from "@wagmi/core";
import { polygon } from "wagmi/chains";
import { config } from "../config/index.js";
import { isBitgetConnector } from "./bitgetWallet.js";
import { isMobileBrowser } from "./device.js";
import {
  BITGET_MOBILE_INSTALL_URL,
  openInstallUrl,
} from "../config/walletUrls.js";
import { WALLET_IDS } from "./walletAvailability.js";

const BITGET_WC_DEEP_LINKS = [
  (uri) => `bitkeep://wc?uri=${encodeURIComponent(uri)}`,
  (uri) => `https://bkcode.vip/wc?uri=${encodeURIComponent(uri)}`,
];

function openBitgetWalletConnectUri(uri) {
  if (!uri || typeof window === "undefined") return;
  for (const build of BITGET_WC_DEEP_LINKS) {
    try {
      window.location.href = build(uri);
      return;
    } catch {
      /* try next */
    }
  }
}

/**
 * On mobile web, relay WalletConnect URI into the Bitget app before connect.
 */
export async function bindBitgetWalletConnectUri(connector) {
  if (!connector?.getProvider || connector.type !== "walletConnect") {
    return () => {};
  }

  try {
    const provider = await connector.getProvider();
    if (!provider?.on) return () => {};

    const handler = (uri) => {
      if (isMobileBrowser()) openBitgetWalletConnectUri(uri);
    };

    provider.on("display_uri", handler);
    return () => {
      provider.removeListener?.("display_uri", handler);
    };
  } catch {
    return () => {};
  }
}

export async function ensurePolygonChain() {
  const account = getAccount(config);
  if (!account.isConnected || account.chainId === polygon.id) return;

  try {
    await switchChain(config, { chainId: polygon.id });
  } catch (err) {
    console.warn("Could not switch to Polygon:", err);
    throw new Error("Please connect on Polygon network");
  }
}

export async function connectWithConnector(connectAsync, connector) {
  const unbind =
    connector.type === "walletConnect" && isMobileBrowser()
      ? await bindBitgetWalletConnectUri(connector)
      : () => {};

  try {
    const result = await connectAsync({
      connector,
      chainId: polygon.id,
    });

    await ensurePolygonChain();

    const address = result.accounts?.[0] ?? "";
    if (!address) throw new Error("Failed to connect wallet");
    return address;
  } finally {
    unbind();
  }
}

export function findConnectorByWalletId(connectors, walletId) {
  switch (walletId) {
    case WALLET_IDS.bitget:
      return (
        connectors.find(isBitgetConnector) ??
        connectors.find((c) => c.id === "bitget")
      );
    case WALLET_IDS.metaMask:
      return connectors.find((c) => c.id === "metaMask");
    case WALLET_IDS.trust:
      return connectors.find((c) => c.id === "trust" || c.id === "trustWallet");
    case WALLET_IDS.walletConnect:
      return connectors.find((c) => c.type === "walletConnect");
    default:
      return undefined;
  }
}

export function findBitgetConnector(connectors) {
  return findConnectorByWalletId(connectors, WALLET_IDS.bitget);
}

export function findWalletConnectConnector(connectors) {
  return findConnectorByWalletId(connectors, WALLET_IDS.walletConnect);
}

export function redirectBitgetMobileInstall() {
  openInstallUrl(BITGET_MOBILE_INSTALL_URL);
}
