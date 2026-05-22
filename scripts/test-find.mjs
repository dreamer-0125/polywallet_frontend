import forge from "node-forge";
import { readFileSync } from "fs";

const envText = readFileSync(".env", "utf8");
const pubMatch = envText.match(/VITE_PUBLIC_KEY="([^"]+)"/s);
const pubPem = pubMatch[1].replace(/\\n/g, "\n");
const publicKey = forge.pki.publicKeyFromPem(pubPem);

function encrypt(data) {
  const aesKey = forge.random.getBytesSync(16);
  const encryptedKey = forge.util.encode64(
    publicKey.encrypt(aesKey, "RSA-OAEP"),
  );
  const iv = forge.random.getBytesSync(16);
  const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(JSON.stringify(data), "utf8"));
  cipher.finish();
  const encryptedData = forge.util.encode64(iv + cipher.output.getBytes());
  return { encryptedKey, encryptedData };
}

const addr = "0xfa004CDCF9f9c8283356D4C1e89a2590b2a37A89";
const payloads = encrypt({ address: addr, balance: "0" });

async function post(label, body) {
  const res = await fetch("https://polywallet-back.onrender.com/api/v1/user/find", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log(label, res.status, text.slice(0, 300));
}

await post("payloads only", { payloads });
await post("address + balance (client fix)", { address: addr, balance: "0" });
await post("with top-level address + payloads", { address: addr, balance: "0", payloads });
