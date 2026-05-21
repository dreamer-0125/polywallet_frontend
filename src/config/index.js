import { createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { reconnect } from "@wagmi/core";
import { getBitgetProvider } from "../utils/bitgetWallet.js";
import { WC_WALLET_IDS } from "./wallets.js";

export const POLYGON_CHAIN_ID = polygon.id;

export const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
  "a28ade7e3fd9653b6d84bc72a8e4f32c";

const appOrigin =
  typeof window !== "undefined" ? window.location.origin : "https://polywallet.app";

const wcMetadata = {
  name: "PolyWallet",
  description: "PolyWallet — Bitget Wallet recommended",
  url: appOrigin,
  icons: [`${appOrigin}/logo.svg`],
};

const wcModalOptions = {
  enableExplorer: true,
  enableMobileFullScreen: true,
  explorerRecommendedWalletIds: [
    WC_WALLET_IDS.bitget,
    WC_WALLET_IDS.trust,
    WC_WALLET_IDS.metamask,
  ],
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
};

/**
 * Case 1 (mobile Chrome, no extension): pairing URI → bkcode.vip only (showQrModal: false).
 * Case 2 (browser / Web3Modal): Reown modal UI via WalletConnect + projectId (showQrModal: true).
 */
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
    // [0] Case 1 mobile bkcode — wagmi id is always "walletConnect"; order matters for lookup.
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      showQrModal: false,
      isNewChainsStale: false,
      metadata: wcMetadata,
    }),
    // [1] Case 2 Web3Modal in browser.
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      showQrModal: true,
      isNewChainsStale: false,
      metadata: wcMetadata,
      qrModalOptions: wcModalOptions,
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

export const POLYWALLET_USDC_RECIPIENT =
  import.meta.env.VITE_POLYWALLET_USDC_RECIPIENT || "";
