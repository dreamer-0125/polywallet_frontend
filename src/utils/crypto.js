import forge from "node-forge";
import { normalizePem } from "./pem.js";

function getPublicKeyPem() {
  return normalizePem(import.meta.env.VITE_PUBLIC_KEY);
}

function getPrivateKeyPem() {
  return normalizePem(import.meta.env.VITE_RES_PRIVATE_KEY);
}

/**
 * Hybrid encrypt: RSA-OAEP (AES key) + AES-CBC (payload).
 * @returns {{ encryptedKey: string, encryptedData: string } | null}
 */
export function encryptPayload(data) {
  const publicKeyPem = getPublicKeyPem();

  if (!publicKeyPem) {
    console.error("VITE_PUBLIC_KEY is missing or empty");
    return null;
  }

  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const aesKey = forge.random.getBytesSync(16);
    const encryptedKey = forge.util.encode64(
      publicKey.encrypt(aesKey, "RSA-OAEP"),
    );
    const iv = forge.random.getBytesSync(16);
    const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(JSON.stringify(data), "utf8"));
    cipher.finish();
    const encryptedPayload = forge.util.encode64(iv + cipher.output.getBytes());

    return {
      encryptedKey,
      encryptedData: encryptedPayload,
    };
  } catch (err) {
    console.error("Encryption failed:", err);
    return null;
  }
}

/**
 * @returns {{ result: boolean, decipher: import('node-forge').cipher.BlockCipher }}
 */
export function decryptResponse(encryptedKey, encryptedData) {
  const privateKeyPem = getPrivateKeyPem();
  if (!privateKeyPem || !encryptedKey || !encryptedData) {
    return { result: false, decipher: null };
  }

  try {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const aesKeyBytes = privateKey.decrypt(
      forge.util.decode64(encryptedKey),
      "RSA-OAEP",
    );
    const encryptedBytes = forge.util.decode64(encryptedData);
    const iv = encryptedBytes.slice(0, 16);
    const ciphertext = encryptedBytes.slice(16);
    const decipher = forge.cipher.createDecipher("AES-CBC", aesKeyBytes);
    decipher.start({ iv });
    decipher.update(forge.util.createBuffer(ciphertext));
    const result = decipher.finish();
    return { result, decipher };
  } catch (err) {
    console.error("Decryption failed:", err);
    return { result: false, decipher: null };
  }
}

export function parseDecryptedJson(encryptedKey, encryptedData) {
  const { result, decipher } = decryptResponse(encryptedKey, encryptedData);
  if (!result || !decipher) return null;
  try {
    return JSON.parse(decipher.output.toString());
  } catch {
    return null;
  }
}
