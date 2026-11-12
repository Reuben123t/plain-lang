import { PlainValue, plainToString } from "../runtime/values";
import { PlainError } from "../errors/plain-error";
import { mathBuiltins } from "./math";

export const textBuiltins: Record<string, (...args: any[]) => any> = {
  join: (...args: PlainValue[]): string => {
    return args.map((a) => plainToString(a)).join("");
  },

  uppercase: (val: PlainValue): string => {
    return plainToString(val).toUpperCase();
  },

  lowercase: (val: PlainValue): string => {
    return plainToString(val).toLowerCase();
  },

  length: (val: PlainValue): number => {
    if (typeof val === "string") return val.length;
    if (Array.isArray(val)) return val.length;
    if (typeof val === "number") return String(val).length;
    return plainToString(val).length;
  },

  contains: (target: PlainValue, part: PlainValue): boolean => {
    if (Array.isArray(target)) {
      return target.some((item) => item === part || plainToString(item) === plainToString(part));
    }
    const str = plainToString(target);
    const search = plainToString(part);
    return str.includes(search);
  },

  replace: (target: PlainValue, oldPart: PlainValue, newPart: PlainValue): string => {
    const str = plainToString(target);
    const sOld = plainToString(oldPart);
    const sNew = plainToString(newPart);
    return str.split(sOld).join(sNew);
  },

  trim: (target: PlainValue): string => {
    return plainToString(target).trim();
  },

  starts_with: (target: PlainValue, part: PlainValue): boolean => {
    return plainToString(target).startsWith(plainToString(part));
  },

  ends_with: (target: PlainValue, part: PlainValue): boolean => {
    return plainToString(target).endsWith(plainToString(part));
  },

  reverse_text: (target: PlainValue): string => {
    return plainToString(target).split("").reverse().join("");
  },

  title_case: (target: PlainValue): string => {
    return plainToString(target).replace(/\b\w/g, (c) => c.toUpperCase());
  },

  camel_case: (target: PlainValue): string => {
    const str = plainToString(target);
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
      .replace(/^(.)/, (c) => c.toLowerCase());
  },

  snake_case: (target: PlainValue): string => {
    return plainToString(target)
      .replace(/\W+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map((w) => w.toLowerCase())
      .join("_");
  },

  kebab_case: (target: PlainValue): string => {
    return plainToString(target)
      .replace(/\W+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map((w) => w.toLowerCase())
      .join("-");
  },

  word_count: (target: PlainValue): number => {
    const str = plainToString(target).trim();
    if (str === "") return 0;
    return str.split(/\s+/).length;
  },

  line_count: (target: PlainValue): number => {
    const str = plainToString(target);
    if (str === "") return 0;
    return str.split(/\r?\n/).length;
  },

  char_count: (target: PlainValue, charVal: PlainValue): number => {
    const str = plainToString(target);
    const ch = plainToString(charVal);
    let count = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === ch) count++;
    }
    return count;
  },

  pad_start: (target: PlainValue, lenVal: PlainValue, padVal?: PlainValue): string => {
    const str = plainToString(target);
    const targetLen = mathBuiltins.to_number(lenVal);
    const pad = padVal ? plainToString(padVal) : " ";
    return str.padStart(targetLen, pad);
  },

  pad_end: (target: PlainValue, lenVal: PlainValue, padVal?: PlainValue): string => {
    const str = plainToString(target);
    const targetLen = mathBuiltins.to_number(lenVal);
    const pad = padVal ? plainToString(padVal) : " ";
    return str.padEnd(targetLen, pad);
  },

  repeat_text: (target: PlainValue, timesVal: PlainValue): string => {
    const count = Math.max(0, Math.round(mathBuiltins.to_number(timesVal)));
    return plainToString(target).repeat(count);
  },

  is_digit: (target: PlainValue): boolean => {
    const str = plainToString(target).trim();
    return str.length > 0 && /^\d+$/.test(str);
  },

  is_alpha: (target: PlainValue): boolean => {
    const str = plainToString(target);
    return str.length > 0 && /^[a-zA-Z]+$/.test(str);
  },

  is_alphanumeric: (target: PlainValue): boolean => {
    const str = plainToString(target);
    return str.length > 0 && /^[a-zA-Z0-9]+$/.test(str);
  },

  is_uppercase: (target: PlainValue): boolean => {
    const str = plainToString(target);
    return str === str.toUpperCase() && str !== str.toLowerCase();
  },

  is_lowercase: (target: PlainValue): boolean => {
    const str = plainToString(target);
    return str === str.toLowerCase() && str !== str.toUpperCase();
  },

  is_palindrome: (target: PlainValue): boolean => {
    const clean = plainToString(target).toLowerCase().replace(/[^a-z0-9]/g, "");
    const rev = clean.split("").reverse().join("");
    return clean.length > 0 && clean === rev;
  },

  count_vowels: (target: PlainValue): number => {
    const str = plainToString(target).toLowerCase();
    let count = 0;
    const vowels = new Set(["a", "e", "i", "o", "u"]);
    for (const c of str) {
      if (vowels.has(c)) count++;
    }
    return count;
  },

  count_consonants: (target: PlainValue): number => {
    const str = plainToString(target).toLowerCase();
    let count = 0;
    for (const c of str) {
      if (c >= "a" && c <= "z" && !"aeiou".includes(c)) count++;
    }
    return count;
  },

  words: (target: PlainValue): string[] => {
    const str = plainToString(target).trim();
    if (str === "") return [];
    return str.split(/\s+/);
  },

  lines: (target: PlainValue): string[] => {
    const str = plainToString(target);
    return str.split(/\r?\n/);
  },

  split_text: (target: PlainValue, delimiterVal: PlainValue): string[] => {
    return plainToString(target).split(plainToString(delimiterVal));
  },

  slice_text: (target: PlainValue, startVal: PlainValue, endVal?: PlainValue): string => {
    const str = plainToString(target);
    // 1-based indexing for beginner friendliness
    const start = Math.max(0, mathBuiltins.to_number(startVal) - 1);
    if (endVal !== undefined) {
      const end = mathBuiltins.to_number(endVal);
      return str.slice(start, end);
    }
    return str.slice(start);
  },

  caesar_cipher: (target: PlainValue, shiftVal: PlainValue): string => {
    const str = plainToString(target);
    let shift = Math.round(mathBuiltins.to_number(shiftVal)) % 26;
    if (shift < 0) shift += 26;
    let res = "";
    for (const c of str) {
      if (c >= "a" && c <= "z") {
        res += String.fromCharCode(((c.charCodeAt(0) - 97 + shift) % 26) + 97);
      } else if (c >= "A" && c <= "Z") {
        res += String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
      } else {
        res += c;
      }
    }
    return res;
  },

  base64_encode: (target: PlainValue): string => {
    return Buffer.from(plainToString(target), "utf-8").toString("base64");
  },

  base64_decode: (target: PlainValue): string => {
    return Buffer.from(plainToString(target), "base64").toString("utf-8");
  },

  slugify: (target: PlainValue): string => {
    return plainToString(target)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
};
