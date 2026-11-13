import * as crypto from "crypto";
import { PlainObject } from "../runtime/values";

export const cryptoSecurityBuiltins = {
  // 1. Cryptographic Hashes
  sha256: (text: string): string => {
    return crypto.createHash("sha256").update(String(text)).digest("hex");
  },

  sha512: (text: string): string => {
    return crypto.createHash("sha512").update(String(text)).digest("hex");
  },

  sha1: (text: string): string => {
    return crypto.createHash("sha1").update(String(text)).digest("hex");
  },

  md5: (text: string): string => {
    return crypto.createHash("md5").update(String(text)).digest("hex");
  },

  hmac_sha256: (text: string, secretKey: string): string => {
    return crypto.createHmac("sha256", String(secretKey)).update(String(text)).digest("hex");
  },

  hmac_sha512: (text: string, secretKey: string): string => {
    return crypto.createHmac("sha512", String(secretKey)).update(String(text)).digest("hex");
  },

  // 2. Symmetric Encryption & Decryption (AES-256)
  aes_encrypt: (plainText: string, secretKey: string): string => {
    const key = crypto.createHash("sha256").update(String(secretKey)).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(String(plainText), "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  },

  aes_decrypt: (encryptedPayload: string, secretKey: string): string => {
    const parts = String(encryptedPayload).split(":");
    if (parts.length !== 2) throw new Error("Invalid encrypted payload format. Expected 'iv:cipher'.");
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];
    const key = crypto.createHash("sha256").update(String(secretKey)).digest();
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  },

  // 3. Encoding & Decoding
  base64_encode: (text: string): string => {
    return Buffer.from(String(text), "utf8").toString("base64");
  },

  base64_decode: (encoded: string): string => {
    return Buffer.from(String(encoded), "base64").toString("utf8");
  },

  hex_encode: (text: string): string => {
    return Buffer.from(String(text), "utf8").toString("hex");
  },

  hex_decode: (hex: string): string => {
    return Buffer.from(String(hex), "hex").toString("utf8");
  },

  // 4. Random Tokens & UUIDs
  generate_uuid: (): string => {
    return crypto.randomUUID ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: any) =>
      (c ^ (crypto.randomBytes(1)[0] & (15 >> (c / 4)))).toString(16)
    );
  },

  generate_random_token: (byteLength: number = 32): string => {
    const len = Math.max(8, Math.floor(Number(byteLength)));
    return crypto.randomBytes(len).toString("hex");
  },

  generate_api_key: (prefix: string = "pln"): string => {
    const random = crypto.randomBytes(24).toString("base64url");
    return `${prefix}_${random}`;
  },

  generate_password: (length: number = 16, includeSymbols: boolean = true): string => {
    const len = Math.max(6, Math.floor(Number(length)));
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|";
    const chars = includeSymbols ? letters + symbols : letters;
    let pwd = "";
    for (let i = 0; i < len; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    return pwd;
  },

  // 5. Educational / Classical Ciphers
  caesar_cipher: (text: string, shift: number = 3): string => {
    const s = ((Number(shift) % 26) + 26) % 26;
    return String(text)
      .split("")
      .map((c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + s) % 26) + 65);
        }
        if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + s) % 26) + 97);
        }
        return c;
      })
      .join("");
  },

  rot13: (text: string): string => {
    return cryptoSecurityBuiltins.caesar_cipher(text, 13);
  },

  // 6. JSON Web Tokens (JWT)
  create_jwt: (payload: any, secretKey: string, expiresInSeconds: number = 3600): string => {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      ...(typeof payload === "object" ? payload : { data: payload }),
      iat: now,
      exp: now + expiresInSeconds
    };
    const b64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
    const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
    const signature = crypto
      .createHmac("sha256", String(secretKey))
      .update(`${b64Header}.${b64Payload}`)
      .digest("base64url");
    return `${b64Header}.${b64Payload}.${signature}`;
  },

  verify_jwt: (token: string, secretKey: string): PlainObject => {
    const parts = String(token).split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid token format." };
    }
    const [b64Header, b64Payload, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", String(secretKey))
      .update(`${b64Header}.${b64Payload}`)
      .digest("base64url");

    if (signature !== expectedSig) {
      return { valid: false, error: "Invalid signature." };
    }

    try {
      const payload = JSON.parse(Buffer.from(b64Payload, "base64url").toString("utf8"));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return { valid: false, error: "Token has expired." };
      }
      return { valid: true, payload };
    } catch {
      return { valid: false, error: "Corrupted token payload." };
    }
  },

  // 7. Safe Comparison
  secure_compare: (a: string, b: string): boolean => {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }
};
