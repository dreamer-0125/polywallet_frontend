import { apiClient } from "./client.js";

export const checkParent_api = async (referralCode) => {
  try {
    const response = await apiClient.post(`/user/checkParent`, {
      referralCode,
    });
    return response.data;
  } catch (error) {
    console.error("checkParent error:", error);
    throw error;
  }
};

export const findUser = async (address) => {
  try {
    const response = await apiClient.post(`/user/find`, {
      address,
    });
    return response.data;
  } catch (error) {
    console.error("findUser error:", error);
    throw error;
  }
};

export const createUser = async (address, referralCode, polyWalletID) => {
  try {
    const response = await apiClient.post("/user/create", {
      address,
      referralCode,
      polyWalletID,
    });
    return response.data;
  } catch (error) {
    console.error("createUser error:", error);
    throw error;
  }
};

/** Backend may send JSON column as array or legacy stringified JSON. */
function normalizeAirdropProjects(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export const getAirdrop = async () => {
  try {
    const response = await apiClient.get("/user/getAirdrop");
    const data = response.data ?? {};
    return {
      ...data,
      airdropData: normalizeAirdropProjects(data.airdropData),
    };
  } catch (error) {
    console.error("getAirdrop error:", error);
    throw error;
  }
};

export const deposit = async (amount, txHash) => {
  const response = await apiClient.post("/user/deposit", {
    amount,
    txHash,
  });
  return response.data;
};

export const withdraw = async (amount) => {
  try {
    const response = await apiClient.post("/user/withdraw", {
      amount,
    });
    return response.data;
  } catch (error) {
    console.error("withdraw error:", error);
    throw error;
  }
};

export const nftMint = async (quantity) => {
  try {
    const response = await apiClient.post("/user/nftMint", {
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("nftMint error:", error);
    throw error;
  }
};

export const sendBalance = async (recipientId, amount) => {
  try {
    const response = await apiClient.post("/user/sendBalance", {
      recipientId,
      amount,
    });
    return response.data;
  } catch (error) {
    console.error("sendBalance error:", error);
    throw error;
  }
};

export const getNftData = async () => {
  try {
    const response = await apiClient.post("/user/getNftData", {});
    return response.data;
  } catch (error) {
    console.error("getNftData error:", error);
    throw error;
  }
};

export const getReferralData = async () => {
  try {
    const response = await apiClient.post("/user/getReferralData", {});
    return response.data;
  } catch (error) {
    console.error("getReferralData error:", error);
    throw error;
  }
};

export const lookupRecipientByPolyWalletId = async (polyWalletId) => {
  try {
    const response = await apiClient.post("/user/lookup-recipient", {
      polyWalletId,
    });
    return response.data;
  } catch (error) {
    console.error("lookupRecipient error:", error);
    throw error;
  }
};

export const fetchMe = async () => {
  const response = await apiClient.get("/user/me");
  return response.data;
};

export const fetchWalletConfig = async () => {
  try {
    const response = await apiClient.get("/user/wallet-config");
    return response.data;
  } catch (error) {
    console.error("fetchWalletConfig error:", error);
    throw error;
  }
};
