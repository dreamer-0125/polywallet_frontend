export function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

/** True when running inside Bitget / BitKeep in-app browser */
export function isBitgetInAppBrowser() {
  if (typeof window === "undefined") return false;
  const eth = window.ethereum;
  return !!(
    window.bitkeep?.ethereum?.request ||
    window.bitget?.ethereum?.request ||
    eth?.isBitKeep
  );
}
