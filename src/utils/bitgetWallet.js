/** Bitget Wallet injected provider (extension + in-app browser). */
export function getBitgetProvider() {
  if (typeof window === "undefined") return undefined;
  return window.bitkeep?.ethereum ?? window.bitget?.ethereum ?? undefined;
}

export function isBitgetProviderAvailable() {
  return !!getBitgetProvider();
}
