"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textBuiltins = void 0;
const values_1 = require("../runtime/values");
const plain_error_1 = require("../errors/plain-error");
const math_1 = require("./math");
function encodeBase64Utf8(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 0x8000)
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    return btoa(binary);
}
function decodeBase64Utf8(encoded) {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
exports.textBuiltins = {
    str: (val) => {
        return (0, values_1.plainToString)(val);
    },
    string: (val) => {
        return (0, values_1.plainToString)(val);
    },
    to_string: (val) => {
        return (0, values_1.plainToString)(val);
    },
    int: (val) => {
        return Math.trunc(math_1.mathBuiltins.to_number(val));
    },
    to_int: (val) => {
        return Math.trunc(math_1.mathBuiltins.to_number(val));
    },
    float: (val) => {
        return math_1.mathBuiltins.to_number(val);
    },
    to_float: (val) => {
        return math_1.mathBuiltins.to_number(val);
    },
    bool: (val) => {
        return (0, values_1.plainToBoolean)(val);
    },
    to_bool: (val) => {
        return (0, values_1.plainToBoolean)(val);
    },
    type: (val) => {
        if (val === null || val === undefined)
            return "none";
        if (typeof val === "boolean")
            return "bool";
        if (typeof val === "number")
            return Number.isInteger(val) ? "int" : "float";
        if (typeof val === "string")
            return "str";
        if (Array.isArray(val))
            return "list";
        if (typeof val === "object")
            return "dict";
        return typeof val;
    },
    join: (...args) => {
        return args.map((a) => (0, values_1.plainToString)(a)).join("");
    },
    uppercase: (val) => {
        return (0, values_1.plainToString)(val).toUpperCase();
    },
    lowercase: (val) => {
        return (0, values_1.plainToString)(val).toLowerCase();
    },
    length: (val) => {
        if (typeof val === "string")
            return val.length;
        if (Array.isArray(val))
            return val.length;
        if (typeof val === "number")
            return String(val).length;
        return (0, values_1.plainToString)(val).length;
    },
    contains: (target, part) => {
        if (Array.isArray(target)) {
            return target.some((item) => item === part || (0, values_1.plainToString)(item) === (0, values_1.plainToString)(part));
        }
        const str = (0, values_1.plainToString)(target);
        const search = (0, values_1.plainToString)(part);
        return str.includes(search);
    },
    replace: (target, oldPart, newPart) => {
        const str = (0, values_1.plainToString)(target);
        const sOld = (0, values_1.plainToString)(oldPart);
        const sNew = (0, values_1.plainToString)(newPart);
        return str.split(sOld).join(sNew);
    },
    trim: (target) => {
        return (0, values_1.plainToString)(target).trim();
    },
    starts_with: (target, part) => {
        return (0, values_1.plainToString)(target).startsWith((0, values_1.plainToString)(part));
    },
    ends_with: (target, part) => {
        return (0, values_1.plainToString)(target).endsWith((0, values_1.plainToString)(part));
    },
    reverse_text: (target) => {
        return (0, values_1.plainToString)(target).split("").reverse().join("");
    },
    title_case: (target) => {
        return (0, values_1.plainToString)(target).replace(/\b\w/g, (c) => c.toUpperCase());
    },
    camel_case: (target) => {
        const str = (0, values_1.plainToString)(target);
        return str
            .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
            .replace(/^(.)/, (c) => c.toLowerCase());
    },
    snake_case: (target) => {
        return (0, values_1.plainToString)(target)
            .replace(/\W+/g, " ")
            .split(/ |\B(?=[A-Z])/)
            .map((w) => w.toLowerCase())
            .join("_");
    },
    kebab_case: (target) => {
        return (0, values_1.plainToString)(target)
            .replace(/\W+/g, " ")
            .split(/ |\B(?=[A-Z])/)
            .map((w) => w.toLowerCase())
            .join("-");
    },
    word_count: (target) => {
        const str = (0, values_1.plainToString)(target).trim();
        if (str === "")
            return 0;
        return str.split(/\s+/).length;
    },
    line_count: (target) => {
        const str = (0, values_1.plainToString)(target);
        if (str === "")
            return 0;
        return str.split(/\r?\n/).length;
    },
    char_count: (target, charVal) => {
        const str = (0, values_1.plainToString)(target);
        const ch = (0, values_1.plainToString)(charVal);
        let count = 0;
        for (let i = 0; i < str.length; i++) {
            if (str[i] === ch)
                count++;
        }
        return count;
    },
    pad_start: (target, lenVal, padVal) => {
        const str = (0, values_1.plainToString)(target);
        const targetLen = math_1.mathBuiltins.to_number(lenVal);
        const pad = padVal ? (0, values_1.plainToString)(padVal) : " ";
        return str.padStart(targetLen, pad);
    },
    pad_end: (target, lenVal, padVal) => {
        const str = (0, values_1.plainToString)(target);
        const targetLen = math_1.mathBuiltins.to_number(lenVal);
        const pad = padVal ? (0, values_1.plainToString)(padVal) : " ";
        return str.padEnd(targetLen, pad);
    },
    repeat_text: (target, timesVal) => {
        const count = Math.max(0, Math.round(math_1.mathBuiltins.to_number(timesVal)));
        return (0, values_1.plainToString)(target).repeat(count);
    },
    is_digit: (target) => {
        const str = (0, values_1.plainToString)(target).trim();
        return str.length > 0 && /^\d+$/.test(str);
    },
    is_alpha: (target) => {
        const str = (0, values_1.plainToString)(target);
        return str.length > 0 && /^[a-zA-Z]+$/.test(str);
    },
    is_alphanumeric: (target) => {
        const str = (0, values_1.plainToString)(target);
        return str.length > 0 && /^[a-zA-Z0-9]+$/.test(str);
    },
    is_uppercase: (target) => {
        const str = (0, values_1.plainToString)(target);
        return str === str.toUpperCase() && str !== str.toLowerCase();
    },
    is_lowercase: (target) => {
        const str = (0, values_1.plainToString)(target);
        return str === str.toLowerCase() && str !== str.toUpperCase();
    },
    is_palindrome: (target) => {
        const clean = (0, values_1.plainToString)(target).toLowerCase().replace(/[^a-z0-9]/g, "");
        const rev = clean.split("").reverse().join("");
        return clean.length > 0 && clean === rev;
    },
    count_vowels: (target) => {
        const str = (0, values_1.plainToString)(target).toLowerCase();
        let count = 0;
        const vowels = new Set(["a", "e", "i", "o", "u"]);
        for (const c of str) {
            if (vowels.has(c))
                count++;
        }
        return count;
    },
    count_consonants: (target) => {
        const str = (0, values_1.plainToString)(target).toLowerCase();
        let count = 0;
        for (const c of str) {
            if (c >= "a" && c <= "z" && !"aeiou".includes(c))
                count++;
        }
        return count;
    },
    words: (target) => {
        const str = (0, values_1.plainToString)(target).trim();
        if (str === "")
            return [];
        return str.split(/\s+/);
    },
    lines: (target) => {
        const str = (0, values_1.plainToString)(target);
        return str.split(/\r?\n/);
    },
    split_text: (target, delimiterVal) => {
        return (0, values_1.plainToString)(target).split((0, values_1.plainToString)(delimiterVal));
    },
    slice_text: (target, startVal, endVal) => {
        const str = (0, values_1.plainToString)(target);
        // 1-based indexing for beginner friendliness
        const start = Math.max(0, math_1.mathBuiltins.to_number(startVal) - 1);
        if (endVal !== undefined) {
            const end = math_1.mathBuiltins.to_number(endVal);
            return str.slice(start, end);
        }
        return str.slice(start);
    },
    caesar_cipher: (target, shiftVal) => {
        const str = (0, values_1.plainToString)(target);
        let shift = Math.round(math_1.mathBuiltins.to_number(shiftVal)) % 26;
        if (shift < 0)
            shift += 26;
        let res = "";
        for (const c of str) {
            if (c >= "a" && c <= "z") {
                res += String.fromCharCode(((c.charCodeAt(0) - 97 + shift) % 26) + 97);
            }
            else if (c >= "A" && c <= "Z") {
                res += String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
            }
            else {
                res += c;
            }
        }
        return res;
    },
    base64_encode: (target) => {
        return encodeBase64Utf8((0, values_1.plainToString)(target));
    },
    base64_decode: (target) => {
        return decodeBase64Utf8((0, values_1.plainToString)(target));
    },
    slugify: (target) => {
        return (0, values_1.plainToString)(target)
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    },
    normalize_whitespace: (target) => (0, values_1.plainToString)(target).trim().replace(/\s+/g, " "),
    truncate_text: (target, lengthVal, suffixVal = "…") => {
        const text = Array.from((0, values_1.plainToString)(target));
        const limit = Math.trunc(math_1.mathBuiltins.to_number(lengthVal));
        if (limit < 0 || !Number.isFinite(limit))
            throw new plain_error_1.PlainError("Text length must be a finite nonnegative number.", { line: 1, column: 1 }, { kind: "TypeError" });
        if (text.length <= limit)
            return text.join("");
        const suffix = Array.from((0, values_1.plainToString)(suffixVal));
        if (limit <= suffix.length)
            return suffix.slice(0, limit).join("");
        return text.slice(0, limit - suffix.length).join("") + suffix.join("");
    },
    count_substring: (target, needleVal) => {
        const text = (0, values_1.plainToString)(target);
        const needle = (0, values_1.plainToString)(needleVal);
        if (!needle)
            return 0;
        let count = 0;
        let offset = 0;
        while ((offset = text.indexOf(needle, offset)) !== -1) {
            count++;
            offset += needle.length;
        }
        return count;
    },
    strip_prefix: (target, prefixVal) => {
        const text = (0, values_1.plainToString)(target);
        const prefix = (0, values_1.plainToString)(prefixVal);
        return prefix && text.startsWith(prefix) ? text.slice(prefix.length) : text;
    },
    strip_suffix: (target, suffixVal) => {
        const text = (0, values_1.plainToString)(target);
        const suffix = (0, values_1.plainToString)(suffixVal);
        return suffix && text.endsWith(suffix) ? text.slice(0, -suffix.length) : text;
    },
    remove_punctuation: (target) => (0, values_1.plainToString)(target).replace(/[\p{P}\p{S}]/gu, ""),
    escape_html: (target) => (0, values_1.plainToString)(target).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[char]),
    unescape_html: (target) => (0, values_1.plainToString)(target).replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => ({
        "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&#39;": "'"
    })[entity])
};
//# sourceMappingURL=text.js.map