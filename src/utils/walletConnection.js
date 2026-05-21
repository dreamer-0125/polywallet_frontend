import { disconnect, getAccount, reconnect } from "@wagmi/core";
import { polygon } from "wagmi/chains";
import { config } from "../config/index.js";
import { isMobileBrowser } from "./device.js";
import { isBitgetProviderAvailable } from "./bitgetWallet.js";
import {
  getBkcodeWalletConnectConnector,
  getWeb3ModalWalletConnectConnector,
  pickWalletConnector,
} from "./walletConnectors.js";
import {
  bindBkcodeWalletConnectUriRelay,
  isMobileWebWithoutBitget,
} from "./walletConnectMobile.js";
import {
  isBkcodeDeeplinkMode,
  isWeb3ModalMode,
  resolveWalletConnectMode,
  WALLET_CONNECT_MODE,
} from "./walletConnectStrategy.js";
import { connectViaWeb3Modal } from "./web3ModalConnect.js";
import { CONNECTOR_KEYS } from "../config/wallets.js";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isWalletConnectConnector(connector) {
  const id = String(connector?.id || "").toLowerCase();
  return connector?.type === "walletConnect" || id.includes("walletconnect");
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
 * @param {import('wagmi').Connector} connector
 * @param {{
 *   handoff?: { window: Window } | null;
 *   connectorKey?: string;
 *   wcMode?: string | null;
 * }} [options]
 */
export async function safeConnect(connectAsync, connector, options = {}) {
  const connectorKey = options.connectorKey ?? CONNECTOR_KEYS.bitget;
  const wcMode =
    options.wcMode ?? resolveWalletConnectMode(connectorKey);

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

  if (isWalletConnect && isWeb3ModalMode(wcMode)) {
    try {
      return await connectViaWeb3Modal(connectAsync, connector);
    } catch (err) {
      if (isUserRejectedConnectError(err)) throw err;
      throw err;
    }
  }

  const isBkcodeCase =
    isWalletConnect && isBkcodeDeeplinkMode(wcMode) && isMobileWebWithoutBitget();

  let unbindUriRelay = () => {};
  if (isBkcodeCase) {
    unbindUriRelay = await bindBkcodeWalletConnectUriRelay(connector, {
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

    if (isBkcodeCase) {
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
    if (isBkcodeCase) {
      setTimeout(unbindUriRelay, 120_000);
    } else {
      unbindUriRelay();
    }
  }
}

export async function resolvePreferredConnector(connectors, connectorKey) {
  return pickWalletConnector(connectors ?? [], connectorKey);
}

export function resolveConnector(connectors, key) {
  if (!connectors?.length) return null;

  if (key === CONNECTOR_KEYS.bitget) {
    const bitgetInjected = connectors.find(
      (c) =>
        c.type === "injected" &&
        String(c.id).toLowerCase().includes("bitget"),
    );
    if (bitgetInjected) return bitgetInjected;
    return getBkcodeWalletConnectConnector(connectors);
  }

  if (key === CONNECTOR_KEYS.walletConnect) {
    return getWeb3ModalWalletConnectConnector(connectors);
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
  if (id.includes("bitget") || id.includes("bitkeep")) return true;
  return isBitgetProviderAvailable() && !!getAccount(config).address;
}

export { resolveWalletConnectMode, WALLET_CONNECT_MODE };

/** Wallet picker entries for Landing / modals. */
export function listWalletOptions() {
  const hasBitget = isBitgetProviderAvailable();
  const options = [];

  if (hasBitget) {
    options.push({
      key: CONNECTOR_KEYS.bitget,
      title: "Bitget Wallet",
      subtitle: "Extension or in-app browser",
      recommended: true,
      mode: null,
    });
    return options;
  }

  if (isMobileWebWithoutBitget()) {
    options.push({
      key: CONNECTOR_KEYS.bitget,
      title: "Bitget Wallet",
      subtitle: "Open app via bkcode.vip (recommended)",
      recommended: true,
      mode: WALLET_CONNECT_MODE.BKCODE_DEEPLINK,
    });
    options.push({
      key: CONNECTOR_KEYS.walletConnect,
      title: "Connect in browser",
      subtitle: "Web3Modal — QR or wallet list",
      recommended: false,
      mode: WALLET_CONNECT_MODE.WEB3MODAL,
    });
    return options;
  }

  options.push({
    key: CONNECTOR_KEYS.bitget,
    title: "Bitget Wallet",
    subtitle: "Install extension, then connect",
    recommended: true,
    mode: WALLET_CONNECT_MODE.WEB3MODAL,
  });
  options.push({
    key: CONNECTOR_KEYS.walletConnect,
    title: "WalletConnect",
    subtitle: "Web3Modal — other wallets",
    recommended: false,
    mode: WALLET_CONNECT_MODE.WEB3MODAL,
  });

  return options;
}
