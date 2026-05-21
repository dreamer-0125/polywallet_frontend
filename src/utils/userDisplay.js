const NUMERIC_FIELDS = [
  "polyBalance",
  "usdcBalance",
  "bonus",
  "dailyBonus",
  "interest",
  "dailyInterest",
  "point",
  "dailyPoint",
];

/** Ensure wallet UI never reads undefined as 0 silently from missing session fields. */
export function hydrateUser(user) {
  if (!user) return user;
  const next = { ...user };
  for (const key of NUMERIC_FIELDS) {
    if (next[key] == null || next[key] === "") {
      next[key] = 0;
    } else {
      const n = Number(next[key]);
      next[key] = Number.isFinite(n) ? n : 0;
    }
  }
  return next;
}
