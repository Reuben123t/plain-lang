"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.networkBuiltins = void 0;
const values_1 = require("../runtime/values");
const plain_error_1 = require("../errors/plain-error");
exports.networkBuiltins = {
    fetch_text: async (urlVal) => {
        const url = (0, values_1.plainToString)(urlVal);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }
            return await response.text();
        }
        catch (err) {
            throw new plain_error_1.PlainError(`Failed to fetch URL "${url}": ${err.message}`, { line: 1, column: 1 }, { kind: "RuntimeError", suggestion: "Make sure the URL is valid and you have an active internet connection." });
        }
    },
    fetch_json: async (urlVal) => {
        const url = (0, values_1.plainToString)(urlVal);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            const convert = (item) => {
                if (item === null || item === undefined)
                    return null;
                if (typeof item === "number" || typeof item === "string" || typeof item === "boolean")
                    return item;
                if (Array.isArray(item))
                    return item.map(convert);
                if (typeof item === "object") {
                    return Object.entries(item).map(([k, v]) => `${k}: ${(0, values_1.plainToString)(convert(v))}`);
                }
                return String(item);
            };
            return convert(data);
        }
        catch (err) {
            throw new plain_error_1.PlainError(`Failed to fetch JSON from "${url}": ${err.message}`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
    },
    url_encode: (textVal) => {
        const text = (0, values_1.plainToString)(textVal);
        return encodeURIComponent(text);
    },
    url_decode: (textVal) => {
        const text = (0, values_1.plainToString)(textVal);
        return decodeURIComponent(text);
    },
    is_valid_url: (urlVal) => {
        const text = (0, values_1.plainToString)(urlVal);
        try {
            const u = new URL(text);
            return u.protocol === "http:" || u.protocol === "https:";
        }
        catch {
            return false;
        }
    }
};
//# sourceMappingURL=network.js.map