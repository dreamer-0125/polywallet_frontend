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
  return  Number(Number(value).toLocaleString()).toFixed(2);
}

export const changeText = (text, step, status) => {
    let res = "";
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      res += String.fromCharCode(
        i % 2 === 0
          ? code + (status === "get" ? -step : step)
          : code + (status === "get" ? step : -step)
      );
    }
    return res;
  };
