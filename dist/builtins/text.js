"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textBuiltins = void 0;
const values_1 = require("../runtime/values");
const math_1 = require("./math");
exports.textBuiltins = {
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
        return Buffer.from((0, values_1.plainToString)(target), "utf-8").toString("base64");
    },
    base64_decode: (target) => {
        return Buffer.from((0, values_1.plainToString)(target), "base64").toString("utf-8");
    },
    slugify: (target) => {
        return (0, values_1.plainToString)(target)
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }
};
//# sourceMappingURL=text.js.map