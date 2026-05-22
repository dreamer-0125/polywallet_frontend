import axios from "axios";
import { encryptPayload, parseDecryptedJson } from "../utils/crypto.js";

const API_URL = `${
  import.meta?.env?.VITE_BACKEND_URL ?? "https://polywallet-back.onrender.com/api"
}/v1/`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const checkParent_api = async (referralCode) => {
  try {
    const response = await axiosInstance.post(`/user/checkParent`, {
      referralCode,
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const findUser = async (address, balance) => {
  const walletAddress = String(address || "").trim();
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  const encryptedPayload = encryptPayload({
    address: walletAddress,
    balance: balance ?? "0",
  });
  if (!encryptedPayload) {
    throw new Error(
      "Could not encrypt request. Check VITE_PUBLIC_KEY in your .env file.",
    );
  }

  try {
    const response = await axiosInstance.post(`/user/find`, {
      payloads: encryptedPayload,
    });

    const { encryptedKey, encryptedData } = response.data ?? {};
    const decryptedPayload = parseDecryptedJson(encryptedKey, encryptedData);
    if (!decryptedPayload) {
      throw new Error("Could not decrypt server response.");
    }
    return decryptedPayload;
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Could not look up user";
    console.error("findUser error:", error);
    throw new Error(msg);
  }
};

export const deposit = async (userId, amount, usdcBalance) => {
  try {
    const encryptedPayload = Encrypt({ userId, amount, usdcBalance });
    const response = await axiosInstance.post(`/user/deposit`, {
      payloads: encryptedPayload,
    });

    const { encryptedKey, encryptedData } = response.data;
    const { result, decipher } = Decrypt(encryptedKey, encryptedData);

    if (!result) {
      console.log("Decryption failed!");
      return;
    }
    const decryptedPayload = JSON.parse(decipher.output.toString());
    return decryptedPayload;
  } catch (error) {
    console.log(error);
  }
};

export const createUser = async (
  address,
  referralCode,
  polyWalletID,
  usdcBalance,
) => {
  try {
    const encryptedPayload = Encrypt({
      address,
      referralCode,
      polyWalletID,
      usdcBalance,
    });

    const response = await axiosInstance.post("/user/create", {
      payloads: encryptedPayload,
    });

    const { encryptedKey, encryptedData } = response.data;
    const { result, decipher } = Decrypt(encryptedKey, encryptedData);

    if (!result) {
      console.log("Decryption failed!");
      return;
    }
    const decryptedPayload = JSON.parse(decipher.output.toString());
    return decryptedPayload;
  } catch (error) {
    console.log(error);
  }
};

export const withdraw = async (userId, amount, fee) => {
  try {
    const encryptedPayload = Encrypt({ userId, amount, fee });
    const response = await axiosInstance.post(`/user/withdraw`, {
      payloads: encryptedPayload,
    });

    const { encryptedKey, encryptedData } = response.data;
    const { result, decipher } = Decrypt(encryptedKey, encryptedData);

    if (!result) {
      console.log("Decryption failed!");
      return;
    }
    const decryptedPayload = JSON.parse(decipher.output.toString());
    return decryptedPayload;
  } catch (error) {
    console.log(error);
  }
};

export const getReferralData = async (userId) => {
  try {
    const encryptedPayload = Encrypt({ userId });
    const response = await axiosInstance.post(`/user/getReferralData`, {
      payloads: encryptedPayload,
    });

    const { encryptedKey, encryptedData } = response.data;
    const { result, decipher } = Decrypt(encryptedKey, encryptedData);

    if (!result) {
      console.log("Decryption failed!");
      return;
    }
    const decryptedPayload = JSON.parse(decipher.output.toString());
    return decryptedPayload;
  } catch (error) {
    console.log(error);
  }
};

export const getNftData = async (userId) => {
  try {
    const encryptedPayload = Encrypt({ userId });
    const response = await axiosInstance.post(`/user/getNftData`, {
      payloads: encryptedPayload,
    });

    const { encryptedKey, encryptedData } = response.data;
    const { result, decipher } = Decrypt(encryptedKey, encryptedData);

    if (!result) {
      console.log("Decryption failed!");
      return;
    }
    const decryptedPayload = JSON.parse(decipher.output.toString());
    return decryptedPayload;
  } catch (error) {
    console.log(error);
  }
};

export const nftMint = async (userId, quantity) => {
  try {
    const encryptedPayload = Encrypt({ userId, quantity });
    const response = await axiosInstance.post(`/user/nftMint`, {
      payloads: encryptedPayload,
    });

    const { encryptedKey, encryptedData } = response.data;
    const { result, decipher } = Decrypt(encryptedKey, encryptedData);

    if (!result) {
      console.log("Decryption failed!");
      return;
    }
    const decryptedPayload = JSON.parse(decipher.output.toString());
    return decryptedPayload;
  } catch (error) {
    console.log(error);
  }
};

export const getAllIDs = async (userId) => {
  try {
    const encryptedPayload = Encrypt({ userId });
    const response = await axiosInstance.post(`/user/getAllIDs`, {
      payloads: encryptedPayload,
    });

    const { encryptedKey, encryptedData } = response.data;
    const { result, decipher } = Decrypt(encryptedKey, encryptedData);

    if (!result) {
      console.log("Decryption failed!");
      return;
    }
    const decryptedPayload = JSON.parse(decipher.output.toString());
    return decryptedPayload;
  } catch (error) {
    console.log(error);
  }
};

export const sendBalance = async (userId, recipientId, amount) => {
  try {
    const encryptedPayload = Encrypt({ userId, recipientId, amount: Number(amount) });
    const response = await axiosInstance.post(`/user/sendBalance`, {
      payloads: encryptedPayload,
    });

    const { encryptedKey, encryptedData } = response.data;
    const { result, decipher } = Decrypt(encryptedKey, encryptedData);

    if (!result) {
      console.log("Decryption failed!");
      return;
    }
    const decryptedPayload = JSON.parse(decipher.output.toString());
    return decryptedPayload;
  } catch (error) {
    console.log(error);
  }
};

export const getAirdrop = async () => {
  try {
    const response = await axiosInstance.get(`/user/getAirdrop`);

    const { encryptedKey, encryptedData } = response.data;
    const { result, decipher } = Decrypt(encryptedKey, encryptedData);

    if (!result) {
      console.log("Decryption failed!");
      return;
    }
    const decryptedPayload = JSON.parse(decipher.output.toString());
    return decryptedPayload;
  } catch (error) {
    console.log(error);
  }
};

/** @deprecated use encryptPayload from ../utils/crypto.js */
const Encrypt = (data) => encryptPayload(data);

/** @deprecated use parseDecryptedJson from ../utils/crypto.js */
const Decrypt = (encryptedKey, encryptedData) => {
  const parsed = parseDecryptedJson(encryptedKey, encryptedData);
  if (!parsed) return { result: false, decipher: { output: { toString: () => "" } } };
  return {
    result: true,
    decipher: { output: { toString: () => JSON.stringify(parsed) } },
  };
};
