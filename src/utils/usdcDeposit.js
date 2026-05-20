import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { erc20Abi, parseUnits } from "viem";
import { polygon } from "wagmi/chains";
import { config, POLYGON_USDC, POLYWALLET_USDC_RECIPIENT } from "../config/index.js";

function isUserRejected(error) {
  const code = error?.code ?? error?.cause?.code;
  if (code === 4001 || code === "ACTION_REJECTED") return true;
  const msg = String(error?.message || error?.cause?.message || "").toLowerCase();
  return msg.includes("rejected") || msg.includes("denied") || msg.includes("cancel");
}

export function assertDepositRecipientConfigured() {
  if (!POLYWALLET_USDC_RECIPIENT) {
    throw new Error(
      "Deposit recipient is not configured. Set VITE_POLYWALLET_USDC_RECIPIENT in your environment.",
    );
  }
}

/**
 * Send USDC on Polygon to the PolyWallet deposit address; returns the tx hash.
 */
export async function sendUsdcDeposit({ amount, account }) {
  assertDepositRecipientConfigured();

  if (!account) {
    throw new Error("Connect your wallet before depositing.");
  }

  const value = parseUnits(String(amount), 6);

  const hash = await writeContract(config, {
    address: POLYGON_USDC,
    abi: erc20Abi,
    functionName: "transfer",
    args: [POLYWALLET_USDC_RECIPIENT, value],
    account,
    chainId: polygon.id,
  });

  await waitForTransactionReceipt(config, { hash, chainId: polygon.id });

  return hash;
}

export function getDepositTransferErrorMessage(error) {
  if (isUserRejected(error)) {
    return "USDC transfer was cancelled in your wallet.";
  }
  const msg = String(error?.message || error?.cause?.message || "");
  if (msg.includes("Deposit recipient is not configured")) {
    return msg;
  }
  if (msg.includes("Connect your wallet")) {
    return msg;
  }
  return "USDC transfer failed. Check your Polygon USDC balance and try again.";
}
