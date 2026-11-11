"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeBuiltins = void 0;
const values_1 = require("../runtime/values");
const plain_error_1 = require("../errors/plain-error");
const math_1 = require("./math");
exports.timeBuiltins = {
    today: () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    },
    current_time: () => {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, "0");
        const m = String(now.getMinutes()).padStart(2, "0");
        const s = String(now.getSeconds()).padStart(2, "0");
        return `${h}:${m}:${s}`;
    },
    days_between: (d1Val, d2Val) => {
        const s1 = (0, values_1.plainToString)(d1Val);
        const s2 = (0, values_1.plainToString)(d2Val);
        const date1 = new Date(s1);
        const date2 = new Date(s2);
        if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
            throw new plain_error_1.PlainError(`Invalid date format. Expected dates like '2026-01-01'.`, { line: 1, column: 1 }, { kind: "TypeError" });
        }
        const diffMs = Math.abs(date2.getTime() - date1.getTime());
        return Math.round(diffMs / (1000 * 60 * 60 * 24));
    },
    sleep: async (secondsVal) => {
        const sec = math_1.mathBuiltins.to_number(secondsVal);
        const ms = Math.max(0, sec * 1000);
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
//# sourceMappingURL=time.js.map