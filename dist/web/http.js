"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LIMITS = exports.HttpError = void 0;
exports.createRequestToken = createRequestToken;
exports.setSecurityHeaders = setSecurityHeaders;
exports.validateRequestOrigin = validateRequestOrigin;
exports.requireToken = requireToken;
exports.requireMethod = requireMethod;
exports.sendJson = sendJson;
exports.sendText = sendText;
exports.readJson = readJson;
exports.stringField = stringField;
exports.scriptJson = scriptJson;
exports.escapeHtml = escapeHtml;
const node_crypto_1 = require("node:crypto");
class HttpError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "HttpError";
    }
}
exports.HttpError = HttpError;
exports.DEFAULT_LIMITS = Object.freeze({
    maxBodyBytes: 256 * 1024,
    maxSourceBytes: 64 * 1024,
    maxOutputBytes: 64 * 1024,
    executionTimeoutMs: 15_000,
    maxInputBytes: 8 * 1024
});
function createRequestToken() {
    return (0, node_crypto_1.randomBytes)(32).toString("hex");
}
function setSecurityHeaders(res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.setHeader("Content-Security-Policy", [
        "default-src 'none'", "script-src 'self'", "style-src 'self'",
        "img-src 'self'", "font-src 'self'", "worker-src 'self'",
        "connect-src 'self'", "base-uri 'none'", "form-action 'none'",
        "frame-ancestors 'none'", "object-src 'none'"
    ].join("; "));
}
/** Reject DNS rebinding, cross-origin fetches, and ambiguous Host headers. */
function validateRequestOrigin(req, port) {
    const host = req.headers.host;
    const hostCount = req.rawHeaders.filter((_, index) => index % 2 === 0 && req.rawHeaders[index].toLowerCase() === "host").length;
    if (hostCount !== 1 || !host || !new Set([`127.0.0.1:${port}`, `localhost:${port}`]).has(host)) {
        throw new HttpError(403, "This server accepts only its own loopback Host header.");
    }
    const origin = req.headers.origin;
    if (origin !== undefined && origin !== `http://${host}`) {
        throw new HttpError(403, "Cross-origin requests are not allowed.");
    }
    const site = req.headers["sec-fetch-site"];
    if (site !== undefined && site !== "same-origin" && site !== "none") {
        throw new HttpError(403, "Cross-site requests are not allowed.");
    }
    if (!req.url || !req.url.startsWith("/") || req.url.startsWith("//") || /[\\\r\n\0]/.test(req.url)) {
        throw new HttpError(400, "Invalid request target.");
    }
    try {
        return new URL(req.url, `http://${host}`);
    }
    catch {
        throw new HttpError(400, "Invalid request URL.");
    }
}
function requireToken(req, token) {
    const supplied = req.headers["x-plain-token"];
    if (typeof supplied !== "string" || Buffer.byteLength(supplied) !== Buffer.byteLength(token) ||
        !(0, node_crypto_1.timingSafeEqual)(Buffer.from(supplied), Buffer.from(token))) {
        throw new HttpError(403, "A valid session request token is required. Reload this local page.");
    }
}
function requireMethod(req, res, methods) {
    if (!methods.includes(req.method || "")) {
        res.setHeader("Allow", methods.join(", "));
        throw new HttpError(405, "Method not allowed.");
    }
}
function sendJson(res, status, data) {
    if (res.destroyed || res.writableEnded)
        return;
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
}
function sendText(res, status, text, type = "text/plain; charset=utf-8") {
    if (res.destroyed || res.writableEnded)
        return;
    res.writeHead(status, { "Content-Type": type });
    res.end(text);
}
/** Read and parse once. Never retain more than limit bytes, including chunked requests. */
async function readJson(req, limit) {
    if (!/^application\/json(?:\s*;.*)?$/i.test(req.headers["content-type"] || "")) {
        req.resume();
        throw new HttpError(415, "Use Content-Type: application/json.");
    }
    if (req.headers["content-encoding"] && req.headers["content-encoding"] !== "identity") {
        req.resume();
        throw new HttpError(415, "Compressed request bodies are not supported.");
    }
    const declaredLength = req.headers["content-length"];
    if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > limit)) {
        req.resume();
        throw new HttpError(413, `Request body exceeds ${limit} bytes.`);
    }
    const body = await new Promise((resolve, reject) => {
        const chunks = [];
        let bytes = 0;
        let settled = false;
        const timer = setTimeout(() => finish(new HttpError(408, "Request body timed out.")), 10_000);
        timer.unref();
        const finish = (error) => {
            if (settled)
                return;
            settled = true;
            clearTimeout(timer);
            if (error) {
                chunks.length = 0;
                reject(error);
            }
            else {
                resolve(Buffer.concat(chunks).toString("utf8"));
            }
        };
        req.on("data", (chunk) => {
            if (settled)
                return;
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            bytes += buffer.length;
            if (bytes > limit)
                finish(new HttpError(413, `Request body exceeds ${limit} bytes.`));
            else
                chunks.push(buffer);
        });
        req.on("end", () => finish());
        req.on("aborted", () => finish(new HttpError(400, "Request body was interrupted.")));
        req.on("error", () => finish(new HttpError(400, "Could not read request body.")));
    });
    let data;
    try {
        data = JSON.parse(body);
    }
    catch {
        throw new HttpError(400, "Malformed JSON request body.");
    }
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
        throw new HttpError(400, "The JSON body must be an object.");
    }
    return data;
}
function stringField(data, name, maxBytes, fallback) {
    const value = data[name] === undefined ? fallback : data[name];
    if (typeof value !== "string")
        throw new HttpError(400, `${name} must be a string.`);
    if (Buffer.byteLength(value, "utf8") > maxBytes)
        throw new HttpError(413, `${name} exceeds ${maxBytes} bytes.`);
    return value;
}
/** JSON inside a data script still needs protection from HTML's script terminator. */
function scriptJson(value) {
    return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (char) => ({
        "<": "\\u003c", ">": "\\u003e", "&": "\\u0026", "\u2028": "\\u2028", "\u2029": "\\u2029"
    }[char]));
}
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
//# sourceMappingURL=http.js.map