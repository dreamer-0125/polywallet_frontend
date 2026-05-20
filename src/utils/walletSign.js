import { signMessage } from "@wagmi/core";
import { config } from "../config/index.js";

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

/**
 * Sign via the active wagmi connector (not window.ethereum) so Phantom/MetaMask match the connected wallet.
 */
export async function signChallengeWithWallet(walletAddress, message) {
  const text = normalizeMessage(message);
  return signMessage(config, {
    account: walletAddress,
    message: text,
  });
}

export function getSignErrorMessage(error) {
  if (isUserRejected(error)) {
    return "Sign the message in your wallet to log in.";
  }
  return "Could not sign with your wallet. Try MetaMask on Polygon, or unlock Phantom and retry.";
}
