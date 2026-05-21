import { deposit } from "../api/user.api.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PENDING_DEPOSIT_KEY = "polywallet_pending_deposit";

export function savePendingDeposit({ amount, txHash }) {
  try {
    sessionStorage.setItem(
      PENDING_DEPOSIT_KEY,
      JSON.stringify({ amount, txHash, savedAt: Date.now() }),
    );
  } catch {
    /* ignore */
  }
}

export function loadPendingDeposit() {
  try {
    const raw = sessionStorage.getItem(PENDING_DEPOSIT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPendingDeposit() {
  try {
    sessionStorage.removeItem(PENDING_DEPOSIT_KEY);
  } catch {
    /* ignore */
  }
}

function isDepositSuccess(response) {
  if (!response) return false;
  if (response.success === true) return true;
  if (response.depositRequest?.status === "approved") return true;
  return false;
}

/**
 * Submit deposit to API with retries (chain indexer + Render cold start).
 */
export async function submitDepositWithRetry(amount, txHash, { maxAttempts = 6 } = {}) {
  savePendingDeposit({ amount, txHash });

  let lastError;
  let lastResponse;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (attempt > 0) {
      await sleep(2500 + attempt * 1500);
    } else {
      await sleep(1500);
    }

    try {
      const response = await deposit(amount, txHash);
      lastResponse = response;

      if (isDepositSuccess(response)) {
        clearPendingDeposit();
        return { ok: true, response, pending: false };
      }

      if (response?.pending) {
        lastError = new Error(response.message || "Deposit pending confirmation");
        continue;
      }

      return { ok: false, response, pending: false, error: null };
    } catch (err) {
      lastError = err;
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (data) lastResponse = data;
      if (status === 202 || data?.pending) {
        continue;
      }
      if (status === 400 && data?.verificationFailed) {
        continue;
      }
      if (!err?.response && attempt < maxAttempts - 1) {
        continue;
      }
      throw err;
    }
  }

  if (isDepositSuccess(lastResponse)) {
    clearPendingDeposit();
    return { ok: true, response: lastResponse, pending: false };
  }

  return {
    ok: false,
    response: lastResponse,
    pending: true,
    error: lastError,
  };
}

export async function syncPendingDepositIfAny() {
  const pending = loadPendingDeposit();
  if (!pending?.txHash || pending.amount == null) return null;
  return submitDepositWithRetry(pending.amount, pending.txHash, { maxAttempts: 4 });
}
