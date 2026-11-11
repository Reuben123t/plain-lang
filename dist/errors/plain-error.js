"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlainError = void 0;
class PlainError extends Error {
    kind;
    location;
    sourceCode;
    suggestion;
    constructor(message, location, options) {
        super(message);
        this.name = options?.kind || "PlainError";
        this.kind = options?.kind || "RuntimeError";
        this.location = location;
        this.sourceCode = options?.sourceCode;
        this.suggestion = options?.suggestion;
        Object.setPrototypeOf(this, PlainError.prototype);
    }
}
exports.PlainError = PlainError;
//# sourceMappingURL=plain-error.js.map