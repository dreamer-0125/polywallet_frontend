import { fetchAuthSession } from "../api/auth.api.js";
import { suppressAuthUnauthorized } from "../api/client.js";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Wait until httpOnly session cookie is active (common delay in mobile wallet WebViews).
 */
export async function waitForAuthSession(maxAttempts = 12, delayMs = 500) {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const res = await fetchAuthSession();
      if (res?.success && res.user) {
        return res;
      }
    } catch {
      /* retry */
    }
    await sleep(delayMs);
  }
  return null;
}

/** After verify/register, ignore transient 401s while the cookie propagates. */
export async function confirmAuthSessionAndSuppressUnauthorized() {
  const session = await waitForAuthSession();
  if (session?.user) {
    suppressAuthUnauthorized(30_000);
    return session;
  }
  suppressAuthUnauthorized(15_000);
  return null;
}
