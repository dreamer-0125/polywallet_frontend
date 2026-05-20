import { createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const POLYGON_CHAIN_ID = polygon.id;

const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
  // Fallback for existing deployments. Prefer setting VITE_WALLETCONNECT_PROJECT_ID in `.env`.
  "a28ade7e3fd9653b6d84bc72a8e4f32c";

const appOrigin =
  typeof window !== "undefined" ? window.location.origin : "https://polywallet.app";

/** Polygon-only; injected preferred, WalletConnect for mobile wallets. */
export const config = createConfig({
  chains: [polygon],
  connectors: [
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
export const POLYGON_USDC = "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359";
