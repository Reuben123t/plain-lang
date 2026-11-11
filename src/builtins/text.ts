import { PlainValue, plainToString } from "../runtime/values";
import { PlainError, SourceLocation } from "../errors/plain-error";

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
  }
};

