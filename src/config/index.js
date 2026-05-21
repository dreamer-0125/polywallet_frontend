import { createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { reconnect } from "@wagmi/core";
import { getBitgetProvider } from "../utils/bitgetWallet.js";
import { isMobileWebWithoutBitget } from "../utils/walletConnectMobile.js";
import { WC_WALLET_IDS } from "./wallets.js";

export const POLYGON_CHAIN_ID = polygon.id;

const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
  "a28ade7e3fd9653b6d84bc72a8e4f32c";

const appOrigin =
  typeof window !== "undefined" ? window.location.origin : "https://polywallet.app";

/** Polygon-only; Bitget injected first, WalletConnect when Bitget app/extension is absent. */
export const config = createConfig({
  chains: [polygon],
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected({
      target: {
        id: "bitget",
        name: "Bitget Wallet",
        provider: () => getBitgetProvider(),
      },
    }),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      showQrModal:
        typeof window !== "undefined" ? !isMobileWebWithoutBitget() : true,
      isNewChainsStale: false,
      metadata: {
        name: "PolyWallet",
        description: "PolyWallet — Bitget Wallet",
        url: appOrigin,
        icons: [`${appOrigin}/logo.svg`],
      },
      qrModalOptions: {
        enableExplorer: true,
        enableMobileFullScreen: true,
        explorerRecommendedWalletIds: [WC_WALLET_IDS.bitget],
        mobileWallets: [
          {
            id: WC_WALLET_IDS.bitget,
            name: "Bitget Wallet",
            links: {
              native: "bitkeep://wc",
              universal: "https://bkcode.vip/wc",
            },
          },
        ],
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
