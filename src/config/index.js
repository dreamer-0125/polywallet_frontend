import { createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { reconnect } from "@wagmi/core";
import { getBitgetProvider } from "../utils/bitgetWallet.js";
import { WC_WALLET_IDS } from "./wallets.js";

export const POLYGON_CHAIN_ID = polygon.id;

const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
  "a28ade7e3fd9653b6d84bc72a8e4f32c";

const appOrigin =
  typeof window !== "undefined" ? window.location.origin : "https://polywallet.app";

/** Bitget first (extension + in-app browser), then any injected wallet, then WalletConnect (mobile). */
export const config = createConfig({
  chains: [polygon],
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected({
      target() {
        const provider = getBitgetProvider();
        if (!provider) return undefined;
        return {
          id: "bitget",
          name: "Bitget Wallet",
          provider,
        };
      },
    }),
    injected(),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      showQrModal: true,
      metadata: {
        name: "PolyWallet",
        description: "PolyWallet — Bitget Wallet recommended",
        url: appOrigin,
        icons: [`${appOrigin}/logo.svg`],
      },
      qrModalOptions: {
        explorerRecommendedWalletIds: [
          WC_WALLET_IDS.bitget,
          WC_WALLET_IDS.trust,
          WC_WALLET_IDS.metamask,
        ],
        explorerExcludedWalletIds: "ALL",
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
