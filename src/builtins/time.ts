import { PlainValue, plainToString } from "../runtime/values";
import { PlainError } from "../errors/plain-error";
import { mathBuiltins } from "./math";

export const timeBuiltins = {
  today: (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  },

  current_time: (): string => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
  },

  days_between: (d1Val: PlainValue, d2Val: PlainValue): number => {
    const s1 = plainToString(d1Val);
    const s2 = plainToString(d2Val);
    const date1 = new Date(s1);
    const date2 = new Date(s2);
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      throw new PlainError(
        `Invalid date format. Expected dates like '2026-01-01'.`,
        { line: 1, column: 1 },
        { kind: "TypeError" }
      );
    }
    const diffMs = Math.abs(date2.getTime() - date1.getTime());
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  },

  sleep: async (secondsVal: PlainValue): Promise<void> => {
    const sec = mathBuiltins.to_number(secondsVal);
    const ms = Math.max(0, sec * 1000);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
