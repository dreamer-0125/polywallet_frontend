import {
  getAccount,
  getChainId,
  getConnectorClient,
  signMessage,
} from "@wagmi/core";
import { polygon } from "wagmi/chains";
import { stringToHex } from "viem";
import { config } from "../config/index.js";
import { isPolygonChain } from "./polygonChain.js";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeMessage(message) {
  if (typeof message === "string") return message;
  if (message && typeof message === "object" && "message" in message) {
    return String(message.message);
  }
  return String(message ?? "");
}

function isUserRejected(error) {
  const code = error?.code ?? error?.cause?.code;
  if (code === 4001 || code === "ACTION_REJECTED") return true;
  const msg = String(error?.message || error?.cause?.message || "").toLowerCase();
  return msg.includes("rejected") || msg.includes("denied") || msg.includes("cancel");
}

export function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

export function isWalletConnectActive() {
  const connection = config.state.connections.get(config.state.current);
  const connector = connection?.connector;
  if (!connector) return false;
  return (
    connector.type === "walletConnect" ||
    String(connector.id).toLowerCase().includes("walletconnect")
  );
}

async function getActiveProvider() {
  const connection = config.state.connections.get(config.state.current);
  const provider = await connection?.connector?.getProvider?.().catch(() => null);
  return provider ?? null;
}

/**
 * WalletConnect + mobile browsers need time after connect before sign requests work.
 */
async function waitForWalletReady(expectedAddress, { maxMs = 5000 } = {}) {
  const target = expectedAddress?.toLowerCase();
  const start = Date.now();

  while (Date.now() - start < maxMs) {
    const account = getAccount(config);
    const ready =
      account.isConnected &&
      account.address?.toLowerCase() === target &&
      isPolygonChain(getChainId(config));

    if (ready) return true;
    await sleep(200);
  }

  return false;
}

async function signViaProvider(walletAddress, text) {
  const provider = await getActiveProvider();
  if (!provider?.request) {
    throw new Error("No wallet provider available for signing");
  }

  const hexMessage = stringToHex(text);
  return provider.request({
    method: "personal_sign",
    params: [hexMessage, walletAddress],
  });
}

async function signViaConnectorClient(walletAddress, text) {
  const client = await getConnectorClient(config, {
    account: walletAddress,
    chainId: polygon.id,
  });
  return client.signMessage({
    account: walletAddress,
    message: text,
  });
}

/**
 * Sign via the active wagmi connector (not window.ethereum) so the connected wallet matches.
 */
export async function signChallengeWithWallet(walletAddress, message) {
  const text = normalizeMessage(message);

  const ready = await waitForWalletReady(walletAddress);
  if (!ready) {
    throw new Error(
      "Wallet is not ready on Polygon yet. Switch to Polygon in your wallet, then try again.",
    );
  }

  // Extra settle time for WalletConnect on mobile (chain/session sync lag).
  if (isMobileBrowser() && isWalletConnectActive()) {
    await sleep(1200);
  }

  try {
    return await signMessage(config, {
      account: walletAddress,
      message: text,
      chainId: polygon.id,
    });
  } catch (primaryErr) {
    try {
      return await signViaConnectorClient(walletAddress, text);
    } catch {
      try {
        return await signViaProvider(walletAddress, text);
      } catch {
        throw primaryErr;
      }
    }
  }
}

export function getSignErrorMessage(error) {
  if (isUserRejected(error)) {
    return "Sign the message in your wallet to log in.";
  }

  const msg = String(error?.message || error?.cause?.message || "").toLowerCase();

  if (
    msg.includes("polygon") ||
    msg.includes("chain") ||
    msg.includes("network") ||
    msg.includes("not ready")
  ) {
    return "Switch your wallet to the Polygon network, then tap Connect Wallet again.";
  }

  if (isMobileBrowser() && isWalletConnectActive()) {
    return "Could not sign in. Open your wallet app, approve the sign-in message on Polygon, then tap Connect Wallet again.";
  }

  if (isMobileBrowser()) {
    return "Could not sign in. Open your wallet app and approve the message, or use MetaMask on Polygon.";
  }

  return "Could not sign with your wallet. Use MetaMask on Polygon, unlock your wallet, and try again.";
}
