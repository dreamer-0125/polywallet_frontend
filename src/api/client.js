import axios from "axios";
import { resolveApiRoot } from "../config/env.js";

const API_URL = `${resolveApiRoot()}/v1/`;

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const reqUrl = error.config?.url || "";
    const isAuthEndpoint =
      reqUrl.includes("/auth/session") ||
      reqUrl.includes("/auth/request-challenge") ||
      reqUrl.includes("/auth/verify-signature");
    const hadResponse = !!error.response;
    // Only 401 = missing/invalid session. 403 is often business logic (e.g. insufficient balance).
    if (hadResponse && status === 401 && !isAuthEndpoint) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(error);
  },
);
