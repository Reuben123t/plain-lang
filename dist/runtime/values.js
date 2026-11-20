"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlainObject = isPlainObject;
exports.hasOwnProperty = hasOwnProperty;
exports.createPlainObject = createPlainObject;
exports.getOwnProperty = getOwnProperty;
exports.setOwnProperty = setOwnProperty;
exports.isPlainFunction = isPlainFunction;
exports.plainToNumber = plainToNumber;
exports.plainToString = plainToString;
exports.plainToBoolean = plainToBoolean;
exports.getPlainTypeName = getPlainTypeName;
const environment_1 = require("./environment");
const plain_error_1 = require("../errors/plain-error");
function isPlainObject(val) {
    return typeof val === "object" && val !== null && !Array.isArray(val) && !isPlainFunction(val);
}
function hasOwnProperty(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function createPlainObject() {
    return Object.create(null);
}
function getOwnProperty(value, key) {
    return hasOwnProperty(value, key) ? value[key] ?? null : null;
}
function setOwnProperty(value, key, item) {
    // Define a data property, never invoke inherited setters such as __proto__.
    Object.defineProperty(value, key, { value: item, enumerable: true, configurable: true, writable: true });
}
function isPlainFunction(val) {
    if (typeof val !== "object" || val === null || Array.isArray(val))
        return false;
    const fn = val;
    if (!hasOwnProperty(val, "type") || fn.type !== "function" ||
        !hasOwnProperty(val, "name") || typeof fn.name !== "string" ||
        !hasOwnProperty(val, "parameters") || !Array.isArray(fn.parameters) ||
        !fn.parameters.every((parameter) => typeof parameter === "string"))
        return false;
    return (hasOwnProperty(val, "nativeFn") && typeof fn.nativeFn === "function") ||
        (hasOwnProperty(val, "body") && Array.isArray(fn.body) &&
            hasOwnProperty(val, "closure") && fn.closure instanceof environment_1.Environment);
}
function plainToNumber(value, location, sourceCode) {
    if (typeof value === "number")
        return value;
    if (typeof value === "boolean")
        return value ? 1 : 0;
    const text = plainToString(value).trim();
    const number = Number(text);
    if (Number.isNaN(number) || text === "") {
        throw new plain_error_1.PlainError(`I cannot convert "${text}" into a number.`, location || { line: 1, column: 1 }, {
            kind: "TypeError",
            sourceCode,
            suggestion: "Make sure the text contains only digits (for example, '42' or '3.14')."
        });
    }
    return number;
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
    if (isPlainObject(value))
        return "dictionary";
    if (isPlainFunction(value))
        return "function";
    return typeof value;
}
//# sourceMappingURL=values.js.map