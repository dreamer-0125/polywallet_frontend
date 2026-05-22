const NUMERIC_DEFAULTS = {
  polyBalance: 0,
  usdcBalance: 0,
  bonus: 0,
  dailyBonus: 0,
  interest: 0,
  dailyInterest: 0,
  point: 0,
  dailyPoint: 0,
  nftAmount: 0,
  teamMembers: 0,
};

/**
 * Ensures wallet UI always receives numeric fields + transactions array.
 * Merges API user (minimal or full) with safe defaults.
 */
export function normalizeWalletUser(user) {
  if (!user) return null;

  const normalized = {
    transactions: [],
    referralCode: "",
    rank: "",
    ...NUMERIC_DEFAULTS,
    ...user,
  };

  for (const key of Object.keys(NUMERIC_DEFAULTS)) {
    const n = Number(normalized[key]);
    normalized[key] = Number.isFinite(n) ? n : 0;
  }

  if (!Array.isArray(normalized.transactions)) {
    normalized.transactions = [];
  }

  return normalized;
}
