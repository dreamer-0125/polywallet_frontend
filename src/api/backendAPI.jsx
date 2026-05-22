import axios from "axios";
import forge from "node-forge";

const API_URL = `${
  import.meta?.env?.VITE_BACKEND_URL ?? "http://localhost:8080/api"
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
  try {
    const encryptedPayload = Encrypt({ address, balance });
    const response = await axiosInstance.post(`/user/find`, {
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

const Encrypt = (data) => {
  const publicKeyPem = import.meta.env.VITE_PUBLIC_KEY; // ✅ Correct Vite usage

  if (!publicKeyPem) {
    alert("Public key not loaded");
    return null;
  }

  try {
    // Parse the RSA public key
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

    // Generate a random AES key (16 bytes for AES-128 or 32 for AES-256)
    const aesKey = forge.random.getBytesSync(16);

    // Encrypt AES key with RSA public key
    const encryptedKey = forge.util.encode64(
      publicKey.encrypt(aesKey, "RSA-OAEP"),
    );

    // Generate IV (initialization vector)
    const iv = forge.random.getBytesSync(16);

    // Encrypt the payload with AES-CBC
    const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(JSON.stringify(data), "utf8"));
    cipher.finish();

    // Combine IV + ciphertext, encode in base64
    const encryptedPayload = forge.util.encode64(iv + cipher.output.getBytes());

    // Return as JSON string (or object if you prefer)
    return {
      encryptedKey,
      encryptedData: encryptedPayload,
    };
  } catch (err) {
    console.error("Encryption failed:", err);
    return null;
  }
};

const Decrypt = (encryptedKey, encryptedData) => {
  const privateKeyPem = import.meta.env.VITE_RES_PRIVATE_KEY;
  // Decrypt AES key using RSA private key
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const aesKeyBytes = privateKey.decrypt(
    forge.util.decode64(encryptedKey),
    "RSA-OAEP",
  );

  // Decode and split IV + ciphertext
  const encryptedBytes = forge.util.decode64(encryptedData);
  const iv = encryptedBytes.slice(0, 16);
  const ciphertext = encryptedBytes.slice(16);

  // Decrypt with AES-CBC
  const decipher = forge.cipher.createDecipher("AES-CBC", aesKeyBytes);
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(ciphertext));
  const result = decipher.finish();
  return { result, decipher };
};
