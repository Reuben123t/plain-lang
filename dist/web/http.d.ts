import type { IncomingMessage, ServerResponse } from "node:http";
export declare class HttpError extends Error {
    readonly status: number;
    constructor(status: number, message: string);
}
export declare const DEFAULT_LIMITS: Readonly<{
    maxBodyBytes: number;
    maxSourceBytes: number;
    maxOutputBytes: number;
    executionTimeoutMs: 15000;
    maxInputBytes: number;
}>;
export declare function createRequestToken(): string;
export declare function setSecurityHeaders(res: ServerResponse): void;
/** Reject DNS rebinding, cross-origin fetches, and ambiguous Host headers. */
export declare function validateRequestOrigin(req: IncomingMessage, port: number): URL;
export declare function requireToken(req: IncomingMessage, token: string): void;
export declare function requireMethod(req: IncomingMessage, res: ServerResponse, methods: string[]): void;
export declare function sendJson(res: ServerResponse, status: number, data: unknown): void;
export declare function sendText(res: ServerResponse, status: number, text: string, type?: string): void;
/** Read and parse once. Never retain more than limit bytes, including chunked requests. */
export declare function readJson(req: IncomingMessage, limit: number): Promise<Record<string, unknown>>;
export declare function stringField(data: Record<string, unknown>, name: string, maxBytes: number, fallback?: string): string;
/** JSON inside a data script still needs protection from HTML's script terminator. */
export declare function scriptJson(value: unknown): string;
export declare function escapeHtml(value: string): string;
//# sourceMappingURL=http.d.ts.map