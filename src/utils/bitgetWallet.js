const BITGET_MATCH = /bitget|bitkeep/i;

function normalize(value) {
  return String(value ?? "").toLowerCase();
}

/** Bitget Wallet injected provider (extension or in-app browser). */
export function getBitgetProvider() {
  if (typeof window === "undefined") return undefined;

  const direct = window.bitkeep?.ethereum ?? window.bitget?.ethereum;
  if (direct?.request) return direct;

  const eth = window.ethereum;
  if (!eth) return undefined;

  if (Array.isArray(eth.providers)) {
    const match = eth.providers.find(
      (p) => p?.isBitKeep || BITGET_MATCH.test(p?.name || ""),
    );
    if (match?.request) return match;
  }

  if (eth.isBitKeep && eth.request) return eth;

  return undefined;
}

export function isBitgetInjectedAvailable() {
  return !!getBitgetProvider();
}

export function isBitgetConnector(connector) {
  if (!connector) return false;
  if (connector.id === "bitget") return true;
  if (connector.type !== "injected") return false;
  const id = normalize(connector.id);
  const name = normalize(connector.name);
  return BITGET_MATCH.test(id) || BITGET_MATCH.test(name);
}
