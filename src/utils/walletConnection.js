import { disconnect, getAccount, reconnect } from "@wagmi/core";
import { polygon } from "wagmi/chains";
import { config } from "../config/index.js";
import { isMobileBrowser } from "./device.js";
import {
  bindBitgetWalletConnectUriRelay,
  isMobileWebWithoutBitget,
} from "./walletConnectMobile.js";

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

function isUserRejectedConnectError(error) {
  const code = error?.code ?? error?.cause?.code;
  if (code === 4001) return true;
  const msg = String(error?.message || "").toLowerCase();
  return msg.includes("rejected") || msg.includes("denied") || msg.includes("cancel");
}

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
 * @param {import('wagmi').Connector} connector
 * @param {{ handoff?: { window: Window } | null }} [options]
 */
export async function safeConnect(connectAsync, connector, options = {}) {
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
  const isMobileWeb = isMobileWebWithoutBitget();

  let unbindUriRelay = () => {};
  if (isWalletConnect && isMobileWeb) {
    unbindUriRelay = await bindBitgetWalletConnectUriRelay(connector, {
      handoff: options.handoff ?? null,
    });
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
  } finally {
    if (isWalletConnect && isMobileWeb) {
      setTimeout(unbindUriRelay, 120_000);
    } else {
      unbindUriRelay();
    }
  }
}

export function isBitgetConnectorActive() {
  const connection = config.state.connections.get(config.state.current);
  const id = String(connection?.connector?.id || "").toLowerCase();
  return id.includes("bitget") || id.includes("bitkeep");
}
