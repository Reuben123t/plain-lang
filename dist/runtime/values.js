"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlainFunction = isPlainFunction;
exports.plainToString = plainToString;
exports.plainToBoolean = plainToBoolean;
exports.getPlainTypeName = getPlainTypeName;
function isPlainFunction(val) {
    return typeof val === "object" && val !== null && val.type === "function";
}
function plainToString(value) {
    if (value === null || value === undefined) {
        return "nothing";
    }
    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }
    if (typeof value === "number") {
        // Clean display for numbers
        if (Number.isInteger(value))
            return String(value);
        return String(Math.round(value * 1e10) / 1e10);
    }
    if (typeof value === "string") {
        return value;
    }
    if (Array.isArray(value)) {
        const items = value.map((v) => {
            if (typeof v === "string")
                return `"${v}"`;
            return plainToString(v);
        });
        return `[${items.join(", ")}]`;
    }
    if (isPlainFunction(value)) {
        return `<function ${value.name}>`;
    }
    return String(value);
}
function plainToBoolean(value) {
    if (value === null || value === undefined)
        return false;
    if (typeof value === "boolean")
        return value;
    if (typeof value === "number")
        return value !== 0;
    if (typeof value === "string")
        return value.length > 0;
    if (Array.isArray(value))
        return value.length > 0;
    return true;
}
function getPlainTypeName(value) {
    if (value === null || value === undefined)
        return "nothing";
    if (typeof value === "number")
        return "number";
    if (typeof value === "string")
        return "text";
    if (typeof value === "boolean")
        return "boolean";
    if (Array.isArray(value))
        return "list";
    if (isPlainFunction(value))
        return "function";
    return typeof value;
}
//# sourceMappingURL=values.js.map