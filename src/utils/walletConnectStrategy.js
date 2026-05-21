import { CONNECTOR_KEYS } from "../config/wallets.js";
import { isBitgetProviderAvailable } from "./bitgetWallet.js";
import { isMobileWebWithoutBitget } from "./walletConnectMobile.js";

/**
 * Case 1 — Mobile Chrome/Safari, no extension: bkcode.vip WC deep link only (no AppKit UI).
 * Case 2 — Desktop or “stay in browser”: Web3Modal (Reown AppKit) + wagmi + WalletConnect projectId.
 */
export const WALLET_CONNECT_MODE = {
  BKCODE_DEEPLINK: "bkcode",
  WEB3MODAL: "web3modal",
};

/**
 * @param {string} [connectorKey]
 * @returns {typeof WALLET_CONNECT_MODE[keyof typeof WALLET_CONNECT_MODE] | null}
 */
export function resolveWalletConnectMode(connectorKey = CONNECTOR_KEYS.bitget) {
  if (isBitgetProviderAvailable()) {
    return null;
  }

  if (connectorKey === CONNECTOR_KEYS.walletConnect) {
    return WALLET_CONNECT_MODE.WEB3MODAL;
  }

  if (isMobileWebWithoutBitget()) {
    return WALLET_CONNECT_MODE.BKCODE_DEEPLINK;
  }

  return WALLET_CONNECT_MODE.WEB3MODAL;
}

export function isBkcodeDeeplinkMode(mode) {
  return mode === WALLET_CONNECT_MODE.BKCODE_DEEPLINK;
}

export function isWeb3ModalMode(mode) {
  return mode === WALLET_CONNECT_MODE.WEB3MODAL;
}
