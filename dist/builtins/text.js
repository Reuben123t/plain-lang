"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textBuiltins = void 0;
const values_1 = require("../runtime/values");
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
    }
};
//# sourceMappingURL=text.js.map