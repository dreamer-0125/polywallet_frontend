import { disconnect, getAccount } from "@wagmi/core";
import { polygon } from "wagmi/chains";
import { config } from "../config/index.js";
import { isBitgetProviderAvailable } from "./bitgetWallet.js";
import { CONNECTOR_KEYS } from "../config/wallets.js";

export function isConnectorAlreadyConnectedError(error) {
  const name = error?.name || "";
  const msg = String(error?.message || "").toLowerCase();
  return (
    name === "ConnectorAlreadyConnectedError" ||
    msg.includes("connector already connected") ||
    msg.includes("already connected")
  );
}

/**
 * Connect with the chosen connector. Reconnects if another wallet was active.
 */
export async function safeConnect(connectAsync, connector) {
  const existing = getAccount(config);
  const current = config.state.connections.get(config.state.current);
  const currentId = current?.connector?.id;
  const targetId = connector?.id;

  if (
    existing.isConnected &&
    existing.address &&
    currentId &&
    targetId &&
    currentId === targetId
  ) {
    return {
      address: existing.address,
      chainId: existing.chainId ?? polygon.id,
      alreadyConnected: true,
    };
  }

  if (existing.isConnected && targetId && currentId !== targetId) {
    try {
      await disconnect(config);
    } catch {
      /* ignore */
    }
  }

  try {
    const res = await connectAsync({
      connector,
      chainId: polygon.id,
    });
    return {
      address: res.accounts?.[0] ?? "",
      chainId: res.chainId ?? polygon.id,
      alreadyConnected: false,
    };
  } catch (err) {
    if (isConnectorAlreadyConnectedError(err)) {
      const acc = getAccount(config);
      if (acc.address) {
        return {
          address: acc.address,
          chainId: acc.chainId ?? polygon.id,
          alreadyConnected: true,
        };
      }
    }
    throw err;
  }
}

export function resolveConnector(connectors, key) {
  if (!connectors?.length) return null;

  if (key === CONNECTOR_KEYS.bitget) {
    return (
      connectors.find((c) => String(c.id).toLowerCase().includes("bitget")) ??
      null
    );
  }

  if (key === CONNECTOR_KEYS.walletConnect) {
    return (
      connectors.find((c) => c.type === "walletConnect") ??
      connectors.find((c) =>
        String(c.id).toLowerCase().includes("walletconnect"),
      ) ??
      null
    );
  }

  if (key === CONNECTOR_KEYS.injected) {
    return (
      connectors.find(
        (c) =>
          c.type === "injected" &&
          !String(c.id).toLowerCase().includes("bitget"),
      ) ??
      connectors.find((c) => c.type === "injected") ??
      null
    );
  }

  return null;
}

export function isBitgetConnectorActive() {
  const connection = config.state.connections.get(config.state.current);
  const id = String(connection?.connector?.id || "").toLowerCase();
  if (id.includes("bitget")) return true;
  return isBitgetProviderAvailable() && !!getAccount(config).address;
}

export function shouldWarnNonBitget(connectorKey) {
  return connectorKey !== CONNECTOR_KEYS.bitget;
}

/** Two options only: Bitget (when available) + WalletConnect. */
export function listWalletOptions() {
  const hasBitget = isBitgetProviderAvailable();
  const options = [];

  if (hasBitget) {
    options.push({
      key: CONNECTOR_KEYS.bitget,
      title: "Bitget Wallet",
      subtitle: "Recommended",
      recommended: true,
    });
  }

  options.push({
    key: CONNECTOR_KEYS.walletConnect,
    title: "WalletConnect",
    subtitle: "Bitget, Trust Wallet, or MetaMask",
    recommended: !hasBitget,
  });

  return options;
}
