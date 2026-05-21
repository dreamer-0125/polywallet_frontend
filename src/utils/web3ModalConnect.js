import { polygon } from "wagmi/chains";

/**
 * Case 2: Web3Modal (Reown) via wagmi WalletConnect connector with showQrModal: true.
 * Uses @walletconnect/ethereum-provider + projectId (viem under wagmi).
 */
export async function connectViaWeb3Modal(connectAsync, connector) {
  const res = await connectAsync({
    connector,
    chainId: polygon.id,
  });
  return {
    address: res.accounts?.[0] ?? "",
    chainId: res.chainId ?? polygon.id,
    alreadyConnected: false,
  };
}
