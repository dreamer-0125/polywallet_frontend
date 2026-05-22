import { isBitgetInjectedAvailable } from "./bitgetWallet.js";
import {
  BITGET_CHROME_EXTENSION_URL,
  BITGET_MOBILE_INSTALL_URL,
  METAMASK_CHROME_URL,
  TRUST_WALLET_INSTALL_URL,
} from "../config/walletUrls.js";
import { isMobileBrowser } from "./device.js";

export const WALLET_IDS = {
  bitget: "bitget",
  metaMask: "metaMask",
  trust: "trust",
  walletConnect: "walletConnect",
};

function hasMetaMask() {
  if (typeof window === "undefined") return false;
  const eth = window.ethereum;
  if (!eth) return false;
  const check = (p) =>
    p?.isMetaMask &&
    !p?.isBitKeep &&
    !p?.isBraveWallet &&
    !p?.isRabby;
  if (Array.isArray(eth.providers)) return eth.providers.some(check);
  return check(eth);
}

function hasTrustWallet() {
  if (typeof window === "undefined") return false;
  const eth = window.ethereum;
  if (!eth) return false;
  const check = (p) => p?.isTrust || p?.isTrustWallet;
  if (Array.isArray(eth.providers)) return eth.providers.some(check);
  return check(eth);
}

export function isWalletInstalled(walletId) {
  switch (walletId) {
    case WALLET_IDS.bitget:
      return isBitgetInjectedAvailable();
    case WALLET_IDS.metaMask:
      return hasMetaMask();
    case WALLET_IDS.trust:
      return hasTrustWallet();
    case WALLET_IDS.walletConnect:
      return true;
    default:
      return false;
  }
}

export function getWalletInstallUrl(walletId) {
  const mobile = isMobileBrowser();
  switch (walletId) {
    case WALLET_IDS.bitget:
      return mobile ? BITGET_MOBILE_INSTALL_URL : BITGET_CHROME_EXTENSION_URL;
    case WALLET_IDS.metaMask:
      return METAMASK_CHROME_URL;
    case WALLET_IDS.trust:
      return TRUST_WALLET_INSTALL_URL;
    default:
      return mobile ? BITGET_MOBILE_INSTALL_URL : BITGET_CHROME_EXTENSION_URL;
  }
}

export function getWalletInstallMessage(walletId) {
  if (walletId === WALLET_IDS.bitget) {
    return "Please install bitget wallet";
  }
  return "Please install wallet";
}
