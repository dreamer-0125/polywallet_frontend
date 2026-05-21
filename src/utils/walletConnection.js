import { disconnect, getAccount, reconnect } from "@wagmi/core";
import { polygon } from "wagmi/chains";
import { config } from "../config/index.js";
import { isMobileBrowser } from "./device.js";
import { isBitgetProviderAvailable } from "./bitgetWallet.js";
import {
  isMobileWebWithoutBitget,
  pickWalletConnector,
} from "./walletConnectors.js";
import { CONNECTOR_KEYS } from "../config/wallets.js";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isWalletConnectConnector(connector) {
  return (
    connector?.type === "walletConnect" ||
    String(connector?.id || "").toLowerCase().includes("walletconnect")
  );
}

/**
 * Mobile Safari/Chrome: user approves WC in the wallet app after returning to the tab.
 */
async function waitForMobileWalletConnectAccount(timeoutMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await reconnect(config);
    } catch {
      /* ignore */
    }

    const acc = getAccount(config);
    if (acc.isConnected && acc.address) {
      return {
        address: acc.address,
        chainId: acc.chainId ?? polygon.id,
        alreadyConnected: true,
      };
    }

    await sleep(500);
  }
  return null;
}

export const NO_BITGET_WALLET_MSG = "No bitget wallet";

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

  const isWalletConnect = isWalletConnectConnector(connector);
  const isMobileWeb = isMobileBrowser() && isMobileWebWithoutBitget();

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

    // User switched to wallet app before approving — wait for session when they return.
    if (isWalletConnect && isMobileWeb) {
      const recovered = await waitForMobileWalletConnectAccount();
      if (recovered?.address) {
        return recovered;
      }
      if (!isUserRejectedConnectError(err)) {
        const late = await waitForMobileWalletConnectAccount(30_000);
        if (late?.address) {
          return late;
        }
      }
    }

    throw err;
  }
}

function isUserRejectedConnectError(error) {
  const code = error?.code ?? error?.cause?.code;
  if (code === 4001) return true;
  const msg = String(error?.message || "").toLowerCase();
  return msg.includes("rejected") || msg.includes("denied") || msg.includes("cancel");
}

/**
 * Landing / default connect: Bitget when installed, else MetaMask → injected → WalletConnect.
 * @returns {Promise<{ connector: import('wagmi').Connector | null, isBitget: boolean }>}
 */
export async function resolvePreferredConnector(connectors) {
  const picked = await pickWalletConnector(connectors ?? []);
  return picked;
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
