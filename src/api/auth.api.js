import { apiClient } from "./client.js";

export const requestAuthChallenge = async (walletAddress) => {
  try {
    const response = await apiClient.post("/auth/request-challenge", {
      walletAddress,
    });
    return response.data;
  } catch (error) {
    console.error("requestAuthChallenge error:", error);
    throw error;
  }
};

export const verifyAuthSignature = async (walletAddress, signature, originalMessage) => {
  try {
    const response = await apiClient.post("/auth/verify-signature", {
      walletAddress,
      signature,
      originalMessage,
    });
    return response.data;
  } catch (error) {
    console.error("verifyAuthSignature error:", error);
    throw error;
  }
};

/** Restore user from httpOnly JWT cookie (200 even when not logged in). */
export const fetchAuthSession = async () => {
  try {
    const response = await apiClient.get("/auth/session");
    return response.data;
  } catch (error) {
    console.error("fetchAuthSession error:", error);
    throw error;
  }
};

/** Clears httpOnly auth cookie on the server */
export const logoutApi = async () => {
  try {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  } catch (error) {
    console.error("logoutApi error:", error);
    throw error;
  }
};
