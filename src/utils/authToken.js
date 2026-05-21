const STORAGE_KEY = "polywallet_auth_token";

export function getAuthToken() {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setAuthToken(token) {
  if (typeof sessionStorage === "undefined" || !token) return;
  sessionStorage.setItem(STORAGE_KEY, token);
}

export function clearAuthToken() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
