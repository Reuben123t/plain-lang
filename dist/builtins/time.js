"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeBuiltins = void 0;
const values_1 = require("../runtime/values");
const plain_error_1 = require("../errors/plain-error");
const math_1 = require("./math");
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const DAY_NAMES = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];
function parseDateOrThrow(val) {
    const str = (0, values_1.plainToString)(val);
    const d = new Date(str);
    if (isNaN(d.getTime())) {
        throw new plain_error_1.PlainError(`Invalid date format '${str}'. Use 'YYYY-MM-DD' (e.g. '2026-05-15').`, { line: 1, column: 1 }, { kind: "TypeError", suggestion: "Provide a date like '2026-11-12' or '2026-01-01'." });
    }
    return d;
}
function formatDateString(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
exports.timeBuiltins = {
    today: () => {
        return formatDateString(new Date());
    },
    current_time: () => {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, "0");
        const m = String(now.getMinutes()).padStart(2, "0");
        const s = String(now.getSeconds()).padStart(2, "0");
        return `${h}:${m}:${s}`;
    },
    current_year: () => {
        return new Date().getFullYear();
    },
    current_month: () => {
        return new Date().getMonth() + 1;
    },
    current_month_name: () => {
        return MONTH_NAMES[new Date().getMonth()];
    },
    current_day: () => {
        return new Date().getDate();
    },
    current_hour: () => {
        return new Date().getHours();
    },
    current_minute: () => {
        return new Date().getMinutes();
    },
    current_second: () => {
        return new Date().getSeconds();
    },
    timestamp: () => {
        return Date.now();
    },
    day_of_week: (dateVal) => {
        const d = dateVal !== undefined ? parseDateOrThrow(dateVal) : new Date();
        return DAY_NAMES[d.getDay()];
    },
    is_leap_year: (yearVal) => {
        const y = yearVal !== undefined ? math_1.mathBuiltins.to_number(yearVal) : new Date().getFullYear();
        return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    },
    days_in_month: (yearVal, monthVal) => {
        const y = math_1.mathBuiltins.to_number(yearVal);
        const m = math_1.mathBuiltins.to_number(monthVal);
        if (m < 1 || m > 12) {
            throw new plain_error_1.PlainError(`Month must be between 1 and 12, got ${m}.`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
        return new Date(y, m, 0).getDate();
    },
    days_between: (d1Val, d2Val) => {
        const date1 = parseDateOrThrow(d1Val);
        const date2 = parseDateOrThrow(d2Val);
        const diffMs = Math.abs(date2.getTime() - date1.getTime());
        return Math.round(diffMs / (1000 * 60 * 60 * 24));
    },
    add_days: (dateVal, daysVal) => {
        const d = parseDateOrThrow(dateVal);
        const days = math_1.mathBuiltins.to_number(daysVal);
        d.setDate(d.getDate() + days);
        return formatDateString(d);
    },
    format_date: (dateVal, formatVal) => {
        const d = parseDateOrThrow(dateVal);
        const fmt = (0, values_1.plainToString)(formatVal);
        const y = String(d.getFullYear());
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const h = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        const s = String(d.getSeconds()).padStart(2, "0");
        return fmt
            .replace(/YYYY/g, y)
            .replace(/MM/g, m)
            .replace(/DD/g, day)
            .replace(/hh/g, h)
            .replace(/mm/g, min)
            .replace(/ss/g, s);
    },
    sleep: async (secondsVal) => {
        const sec = math_1.mathBuiltins.to_number(secondsVal);
        const ms = Math.max(0, sec * 1000);
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
//# sourceMappingURL=time.js.map