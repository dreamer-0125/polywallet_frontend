export function resolveApiRoot() {
  const raw = import.meta.env?.VITE_BACKEND_URL?.trim?.();
  if (raw) {
    return raw.replace(/\/+$/, "");
  }
  if (import.meta.env.DEV) {
    return "/api";
  }
  return "http://localhost:8080/api";
}
