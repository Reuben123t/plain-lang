import { PlainValue, plainToString } from "../runtime/values";
import { PlainError } from "../errors/plain-error";

export const networkBuiltins = {
  fetch_text: async (urlVal: PlainValue): Promise<string> => {
    const url = plainToString(urlVal);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (err: any) {
      throw new PlainError(
        `Failed to fetch URL "${url}": ${err.message}`,
        { line: 1, column: 1 },
        { kind: "RuntimeError", suggestion: "Make sure the URL is valid and you have an active internet connection." }
      );
    }
  },

  fetch_json: async (urlVal: PlainValue): Promise<PlainValue> => {
    const url = plainToString(urlVal);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const convert = (item: any): PlainValue => {
        if (item === null || item === undefined) return null;
        if (typeof item === "number" || typeof item === "string" || typeof item === "boolean") return item;
        if (Array.isArray(item)) return item.map(convert);
        if (typeof item === "object") {
          return Object.entries(item).map(([k, v]) => `${k}: ${plainToString(convert(v))}`);
        }
        return String(item);
      };
      return convert(data);
    } catch (err: any) {
      throw new PlainError(
        `Failed to fetch JSON from "${url}": ${err.message}`,
        { line: 1, column: 1 },
        { kind: "RuntimeError" }
      );
    }
  },

  url_encode: (textVal: PlainValue): string => {
    const text = plainToString(textVal);
    return encodeURIComponent(text);
  },

  url_decode: (textVal: PlainValue): string => {
    const text = plainToString(textVal);
    return decodeURIComponent(text);
  },

  is_valid_url: (urlVal: PlainValue): boolean => {
    const text = plainToString(urlVal);
    try {
      const u = new URL(text);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }
};
