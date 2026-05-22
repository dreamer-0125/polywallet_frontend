import { polygon } from "wagmi/chains";
import { config, POLYGON_USDC } from "../config";
import { getPublicClient } from "@wagmi/core";
import { erc20Abi, formatUnits } from "viem";

export const shortAddr = (addr) => {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export const getUSDCBalance = async (address) => {
  const client = getPublicClient(config, { chainId: polygon.id });
  
  const raw = await client.readContract({
    address: POLYGON_USDC,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  });
  return formatUnits(raw, 6);
};


export const unifyNumber = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return Number(safe.toLocaleString()).toFixed(2);
};

export { formatAmount, formatInteger } from "./format.js";
export { normalizeWalletUser } from "./userModel.js";