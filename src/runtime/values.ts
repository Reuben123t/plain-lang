import { Environment } from "./environment";
import { Statement } from "../ast/types";

export type PlainValue =
  | number
  | string
  | boolean
  | null
  | PlainValue[]
  | PlainFunction;

export interface PlainFunction {
  type: "function";
  name: string;
  parameters: string[];
  body?: Statement[];
  closure?: Environment;
  nativeFn?: (...args: any[]) => any;
}

export function isPlainFunction(val: any): val is PlainFunction {
  return typeof val === "object" && val !== null && val.type === "function";
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
  if (isPlainFunction(value)) return "function";
  return typeof value;
}
