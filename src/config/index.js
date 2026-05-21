import { createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { reconnect } from "@wagmi/core";

export const POLYGON_CHAIN_ID = polygon.id;

const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
  // Fallback for existing deployments. Prefer setting VITE_WALLETCONNECT_PROJECT_ID in `.env`.
  "a28ade7e3fd9653b6d84bc72a8e4f32c";

const appOrigin =
  typeof window !== "undefined" ? window.location.origin : "https://polywallet.app";

const bitgetWalletTarget = {
  id: "bitgetWallet",
  name: "Bitget Wallet",
  provider(window) {
    if (!window) return undefined;
    const bitkeep = window.bitkeep?.ethereum ?? window.bitkeep;
    if (bitkeep?.request) return bitkeep;
    const eth = window.ethereum;
    if (!eth) return undefined;
    if (eth.isBitKeep) return eth;
    if (Array.isArray(eth.providers)) {
      return eth.providers.find((p) => p?.isBitKeep);
    }
    return undefined;
  },
};

/** Polygon-only; Bitget preferred, then injected / WalletConnect. */
export const config = createConfig({
  chains: [polygon],
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected({ target: bitgetWalletTarget }),
    injected({ target: "metaMask" }),
    injected(),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      showQrModal: true,
      metadata: {
        name: "PolyWallet",
        description: "PolyWallet",
        url: appOrigin,
        icons: [`${appOrigin}/logo.svg`],
      },
    }),
  ],
  transports: {
    [polygon.id]: http("https://polygon-bor-rpc.publicnode.com"),
  },
});

if (typeof window !== "undefined") {
  reconnect(config).catch(() => {});
}
export const POLYGON_USDC = "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359";

/** On-chain USDC deposit destination (Polygon). Set via VITE_POLYWALLET_USDC_RECIPIENT. */
export const POLYWALLET_USDC_RECIPIENT =
  import.meta.env.VITE_POLYWALLET_USDC_RECIPIENT || "";
