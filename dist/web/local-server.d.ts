import * as http from "node:http";
export interface LocalServerOptions {
    port?: number;
    host?: "127.0.0.1";
    openBrowser?: boolean;
    workspaceDir?: string;
    executionTimeoutMs?: number;
    maxBodyBytes?: number;
    maxSourceBytes?: number;
    maxOutputBytes?: number;
    quiet?: boolean;
}
interface StartOptions extends LocalServerOptions {
    mode: "ide" | "playground";
    initialFilePath?: string;
}
export declare function startLocalServer(options: StartOptions): Promise<http.Server>;
export {};
//# sourceMappingURL=local-server.d.ts.map