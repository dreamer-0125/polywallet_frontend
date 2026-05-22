import { createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { walletConnect, injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [polygon],
  connectors: [
    walletConnect({
      projectId: "a28ade7e3fd9653b6d84bc72a8e4f32c", // REQUIRED
      showQrModal: true,
    }),
    injected(), // optional fallback for desktop
  ],
  transports: {
    [polygon.id]: http("https://polygon.api.onfinality.io/public"), 
  },
});
export const POLYGON_USDC = "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359";
