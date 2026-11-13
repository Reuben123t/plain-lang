import { PlainObject } from "../runtime/values";
export declare const cryptoSecurityBuiltins: {
    sha256: (text: string) => string;
    sha512: (text: string) => string;
    sha1: (text: string) => string;
    md5: (text: string) => string;
    hmac_sha256: (text: string, secretKey: string) => string;
    hmac_sha512: (text: string, secretKey: string) => string;
    aes_encrypt: (plainText: string, secretKey: string) => string;
    aes_decrypt: (encryptedPayload: string, secretKey: string) => string;
    base64_encode: (text: string) => string;
    base64_decode: (encoded: string) => string;
    hex_encode: (text: string) => string;
    hex_decode: (hex: string) => string;
    generate_uuid: () => string;
    generate_random_token: (byteLength?: number) => string;
    generate_api_key: (prefix?: string) => string;
    generate_password: (length?: number, includeSymbols?: boolean) => string;
    caesar_cipher: (text: string, shift?: number) => string;
    rot13: (text: string) => string;
    create_jwt: (payload: any, secretKey: string, expiresInSeconds?: number) => string;
    verify_jwt: (token: string, secretKey: string) => PlainObject;
    secure_compare: (a: string, b: string) => boolean;
};
//# sourceMappingURL=crypto_security.d.ts.map