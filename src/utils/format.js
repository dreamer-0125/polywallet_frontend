/** Safe currency/number display — never throws on undefined/null. */
export function formatAmount(value, options = {}) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
}

export function formatInteger(value) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString("en-US");
}
