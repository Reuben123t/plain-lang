"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cryptoSecurityBuiltins = void 0;
const crypto = __importStar(require("crypto"));
exports.cryptoSecurityBuiltins = {
    // 1. Cryptographic Hashes
    sha256: (text) => {
        return crypto.createHash("sha256").update(String(text)).digest("hex");
    },
    sha512: (text) => {
        return crypto.createHash("sha512").update(String(text)).digest("hex");
    },
    sha1: (text) => {
        return crypto.createHash("sha1").update(String(text)).digest("hex");
    },
    md5: (text) => {
        return crypto.createHash("md5").update(String(text)).digest("hex");
    },
    hmac_sha256: (text, secretKey) => {
        return crypto.createHmac("sha256", String(secretKey)).update(String(text)).digest("hex");
    },
    hmac_sha512: (text, secretKey) => {
        return crypto.createHmac("sha512", String(secretKey)).update(String(text)).digest("hex");
    },
    // 2. Symmetric Encryption & Decryption (AES-256)
    aes_encrypt: (plainText, secretKey) => {
        const key = crypto.createHash("sha256").update(String(secretKey)).digest();
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
        let encrypted = cipher.update(String(plainText), "utf8", "hex");
        encrypted += cipher.final("hex");
        return iv.toString("hex") + ":" + encrypted;
    },
    aes_decrypt: (encryptedPayload, secretKey) => {
        const parts = String(encryptedPayload).split(":");
        if (parts.length !== 2)
            throw new Error("Invalid encrypted payload format. Expected 'iv:cipher'.");
        const iv = Buffer.from(parts[0], "hex");
        const encryptedText = parts[1];
        const key = crypto.createHash("sha256").update(String(secretKey)).digest();
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        let decrypted = decipher.update(encryptedText, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    },
    // 3. Encoding & Decoding
    base64_encode: (text) => {
        return Buffer.from(String(text), "utf8").toString("base64");
    },
    base64_decode: (encoded) => {
        return Buffer.from(String(encoded), "base64").toString("utf8");
    },
    hex_encode: (text) => {
        return Buffer.from(String(text), "utf8").toString("hex");
    },
    hex_decode: (hex) => {
        return Buffer.from(String(hex), "hex").toString("utf8");
    },
    // 4. Random Tokens & UUIDs
    generate_uuid: () => {
        return crypto.randomUUID ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (c ^ (crypto.randomBytes(1)[0] & (15 >> (c / 4)))).toString(16));
    },
    generate_random_token: (byteLength = 32) => {
        const len = Math.max(8, Math.floor(Number(byteLength)));
        return crypto.randomBytes(len).toString("hex");
    },
    generate_api_key: (prefix = "pln") => {
        const random = crypto.randomBytes(24).toString("base64url");
        return `${prefix}_${random}`;
    },
    generate_password: (length = 16, includeSymbols = true) => {
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
    caesar_cipher: (text, shift = 3) => {
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
    rot13: (text) => {
        return exports.cryptoSecurityBuiltins.caesar_cipher(text, 13);
    },
    // 6. JSON Web Tokens (JWT)
    create_jwt: (payload, secretKey, expiresInSeconds = 3600) => {
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
    verify_jwt: (token, secretKey) => {
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
        }
        catch {
            return { valid: false, error: "Corrupted token payload." };
        }
    },
    // 7. Safe Comparison
    secure_compare: (a, b) => {
        const bufA = Buffer.from(String(a));
        const bufB = Buffer.from(String(b));
        if (bufA.length !== bufB.length)
            return false;
        return crypto.timingSafeEqual(bufA, bufB);
    }
};
//# sourceMappingURL=crypto_security.js.map