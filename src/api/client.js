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
    // 401 = expired/missing token, 403 = wrong role (e.g. admin cookie on user endpoint)
    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(error);
  },
);
