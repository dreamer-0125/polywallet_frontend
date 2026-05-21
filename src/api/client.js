import axios from "axios";
import { resolveApiRoot } from "../config/env.js";
import { getAuthToken } from "../utils/authToken.js";

const API_URL = `${resolveApiRoot()}/v1/`;

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/** Ignore 401 → logout briefly after sign-in (mobile wallet WebViews). */
let unauthorizedSuppressedUntil = 0;

export function suppressAuthUnauthorized(ms = 20_000) {
  unauthorizedSuppressedUntil = Date.now() + ms;
}

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let unauthorizedToastLock = false;

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const reqUrl = error.config?.url || "";
    const isAuthEndpoint =
      reqUrl.includes("/auth/session") ||
      reqUrl.includes("/auth/request-challenge") ||
      reqUrl.includes("/auth/verify-signature") ||
      reqUrl.includes("/user/create") ||
      reqUrl.includes("/user/find");
    const isMeEndpoint = reqUrl.includes("/user/me");
    const hadResponse = !!error.response;
    // Only 401 = missing/invalid session. 403 is often business logic (e.g. insufficient balance).
    if (
      hadResponse &&
      status === 401 &&
      !isAuthEndpoint &&
      !isMeEndpoint &&
      Date.now() >= unauthorizedSuppressedUntil &&
      !unauthorizedToastLock
    ) {
      unauthorizedToastLock = true;
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      setTimeout(() => {
        unauthorizedToastLock = false;
      }, 4000);
    }
    return Promise.reject(error);
  },
);
