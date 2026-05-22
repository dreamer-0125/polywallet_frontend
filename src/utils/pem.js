/**
 * Normalize PEM strings from Vite env (often have extra spaces, quotes, or broken newlines).
 */
export function normalizePem(pem) {
  if (pem == null || pem === "") return "";

  let value = String(pem).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  value = value.replace(/\\n/g, "\n");

  const beginMatch = value.match(/-----BEGIN [^-]+-----/);
  const endMatch = value.match(/-----END [^-]+-----/);
  if (!beginMatch || !endMatch) return value.trim();

  const begin = beginMatch[0];
  const end = endMatch[0];
  const start = value.indexOf(begin);
  const endIdx = value.indexOf(end);
  const body = value
    .slice(start + begin.length, endIdx)
    .replace(/\s+/g, "")
    .match(/.{1,64}/g)
    ?.join("\n");

  return `${begin}\n${body ?? ""}\n${end}`;
}
