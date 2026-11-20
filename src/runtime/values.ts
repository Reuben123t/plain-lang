import { Environment } from "./environment";
import type { Statement } from "../ast/types";
import { PlainError, SourceLocation } from "../errors/plain-error";

export type PlainValue =
  | number
  | string
  | boolean
  | null
  | PlainValue[]
  | PlainObject
  | PlainFunction;

export interface PlainObject {
  [key: string]: PlainValue;
}

export function isPlainObject(val: unknown): val is PlainObject {
  return typeof val === "object" && val !== null && !Array.isArray(val) && !isPlainFunction(val);
}

export function hasOwnProperty(value: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

export function createPlainObject(): PlainObject {
  return Object.create(null) as PlainObject;
}

export function getOwnProperty(value: PlainObject, key: string): PlainValue {
  return hasOwnProperty(value, key) ? value[key] ?? null : null;
}

export function setOwnProperty(value: PlainObject, key: string, item: PlainValue): void {
  // Define a data property, never invoke inherited setters such as __proto__.
  Object.defineProperty(value, key, { value: item, enumerable: true, configurable: true, writable: true });
}

export interface PlainFunction {
  type: "function";
  name: string;
  parameters: string[];
  body?: Statement[];
  closure?: Environment;
  nativeFn?: (...args: any[]) => any;
}

export function isPlainFunction(val: unknown): val is PlainFunction {
  if (typeof val !== "object" || val === null || Array.isArray(val)) return false;
  const fn = val as Partial<PlainFunction>;
  if (!hasOwnProperty(val, "type") || fn.type !== "function" ||
      !hasOwnProperty(val, "name") || typeof fn.name !== "string" ||
      !hasOwnProperty(val, "parameters") || !Array.isArray(fn.parameters) ||
      !fn.parameters.every((parameter) => typeof parameter === "string")) return false;
  return (hasOwnProperty(val, "nativeFn") && typeof fn.nativeFn === "function") ||
    (hasOwnProperty(val, "body") && Array.isArray(fn.body) &&
      hasOwnProperty(val, "closure") && fn.closure instanceof Environment);
}

export function plainToNumber(value: PlainValue, location?: SourceLocation, sourceCode?: string): number {
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  const text = plainToString(value).trim();
  const number = Number(text);
  if (Number.isNaN(number) || text === "") {
    throw new PlainError(`I cannot convert "${text}" into a number.`, location || { line: 1, column: 1 }, {
      kind: "TypeError",
      sourceCode,
      suggestion: "Make sure the text contains only digits (for example, '42' or '3.14')."
    });
  }
  return number;
}

export function plainToString(value: PlainValue): string {
  if (value === null || value === undefined) {
    return "nothing";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "number") {
    // Clean display for numbers
    if (Number.isInteger(value)) return String(value);
    return String(Math.round(value * 1e10) / 1e10);
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    const items = value.map((v) => {
      if (typeof v === "string") return `"${v}"`;
      return plainToString(v);
    });
    return `[${items.join(", ")}]`;
  }
  if (isPlainObject(value)) {
    const entries = Object.entries(value).map(([k, v]) => {
      const vStr = typeof v === "string" ? `"${v}"` : plainToString(v);
      return `"${k}": ${vStr}`;
    });
    return `{${entries.join(", ")}}`;
  }
  if (isPlainFunction(value)) {
    return `<function ${value.name}>`;
  }
  return String(value);
}

export function plainToBoolean(value: PlainValue): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function getPlainTypeName(value: PlainValue): string {
  if (value === null || value === undefined) return "nothing";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "text";
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value)) return "list";
  if (isPlainObject(value)) return "dictionary";
  if (isPlainFunction(value)) return "function";
  return typeof value;
}

