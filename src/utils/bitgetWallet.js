/** Bitget Wallet injected provider (extension + in-app browser). */
export function getBitgetProvider() {
  if (typeof window === "undefined") return undefined;

  const bitkeep = window.bitkeep?.ethereum ?? window.bitget?.ethereum;
  if (bitkeep?.request) return bitkeep;

  const eth = window.ethereum;
  if (!eth) return undefined;
  if (eth.isBitKeep) return eth;
  if (Array.isArray(eth.providers)) {
    return eth.providers.find((p) => p?.isBitKeep);
  }
  return undefined;
}

export function isBitgetProviderAvailable() {
  return !!getBitgetProvider();
}
