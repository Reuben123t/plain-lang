import { PlainValue, plainToString } from "../runtime/values";
import { PlainError } from "../errors/plain-error";

export const mathBuiltins: Record<string, (...args: any[]) => any> = {
  to_number: (val: PlainValue): number => {
    if (typeof val === "number") return val;
    if (typeof val === "boolean") return val ? 1 : 0;
    const str = plainToString(val).trim();
    const num = Number(str);
    if (isNaN(num) || str === "") {
      throw new PlainError(
        `I cannot convert "${str}" into a number.`,
        { line: 1, column: 1 },
        {
          kind: "TypeError",
          suggestion: "Make sure the text contains only digits (for example, '42' or '3.14')."
        }
      );
    }
    return num;
  },

  to_text: (val: PlainValue): string => {
    return plainToString(val);
  },

  round: (num: PlainValue): number => {
    const n = mathBuiltins.to_number(num);
    return Math.round(n);
  },

  floor: (num: PlainValue): number => {
    const n = mathBuiltins.to_number(num);
    return Math.floor(n);
  },

  ceiling: (num: PlainValue): number => {
    const n = mathBuiltins.to_number(num);
    return Math.ceil(n);
  },

  absolute: (num: PlainValue): number => {
    const n = mathBuiltins.to_number(num);
    return Math.abs(n);
  },

  minimum: (...args: PlainValue[]): number => {
    if (args.length === 0) {
      throw new PlainError(
        "minimum(...) requires at least one number.",
        { line: 1, column: 1 },
        { kind: "TypeError" }
      );
    }
    const numbers = args.map((a) => mathBuiltins.to_number(a));
    return Math.min(...numbers);
  },

  maximum: (...args: PlainValue[]): number => {
    if (args.length === 0) {
      throw new PlainError(
        "maximum(...) requires at least one number.",
        { line: 1, column: 1 },
        { kind: "TypeError" }
      );
    }
    const numbers = args.map((a) => mathBuiltins.to_number(a));
    return Math.max(...numbers);
  },

  random_between: (minVal: PlainValue, maxVal: PlainValue): number => {
    const min = Math.ceil(mathBuiltins.to_number(minVal));
    const max = Math.floor(mathBuiltins.to_number(maxVal));
    if (min > max) {
      return Math.floor(Math.random() * (min - max + 1)) + max;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

