import { createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { isMobileBrowser } from "../utils/device.js";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

const bitgetInjected = injected({
  target: {
    id: "bitget",
    name: "Bitget Wallet",
    provider(window) {
      if (!window) return undefined;
      const direct = window.bitkeep?.ethereum ?? window.bitget?.ethereum;
      if (direct?.request) return direct;
      const eth = window.ethereum;
      if (!eth) return undefined;
      if (Array.isArray(eth.providers)) {
        return eth.providers.find((p) => p?.isBitKeep);
      }
      return eth.isBitKeep ? eth : undefined;
    },
  },
  shimDisconnect: true,
});

const metaMaskInjected = injected({
  target: "metaMask",
  shimDisconnect: true,
});

const trustInjected = injected({
  target: "trust",
  shimDisconnect: true,
});

const connectors = [bitgetInjected, metaMaskInjected, trustInjected];

if (walletConnectProjectId) {
  connectors.push(
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: !isMobileBrowser(),
      metadata: {
        name: "PolyWallet",
        description: "PolyWallet — Polygon USDC wallet",
        url:
          typeof window !== "undefined"
            ? window.location.origin
            : "https://polywallet.app",
        icons: ["https://web3.bitget.com/favicon.ico"],
      },
      optionalChains: [polygon.id],
    }),
  );
} else if (isMobileBrowser()) {
  console.warn(
    "VITE_WALLETCONNECT_PROJECT_ID is required for mobile Bitget connection.",
  );
}

export const config = createConfig({
  chains: [polygon],
  connectors,
  transports: {
    [polygon.id]: http("https://polygon.api.onfinality.io/public"),
  },
});

export const POLYGON_USDC = "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359";
