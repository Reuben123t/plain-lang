export declare const BROWSER_LIMITS: Readonly<{
    maxSourceBytes: number;
    maxOutputBytes: number;
    maxInputBytes: number;
    timeoutMs: 15000;
    maxSteps: 1000000;
}>;
export interface RuntimeErrorInfo {
    message: string;
    formatted: string;
    kind: string;
    location?: {
        line: number;
        column: number;
        sourceFile?: string;
    };
}
export type WorkerRequest = {
    type: "run";
    code: string;
    filename?: string;
} | {
    type: "input";
    id: number;
    value: string;
};
export type RuntimeEvent = {
    type: "ready";
} | {
    type: "output";
    text: string;
} | {
    type: "clear";
} | {
    type: "input";
    id: number;
    prompt: string;
} | {
    type: "done";
    error?: RuntimeErrorInfo;
};
export type ExecutionStatus = "running" | "waiting" | "completed" | "failed" | "stopped" | "timeout";
export interface ExecutionSnapshot {
    id: string;
    status: ExecutionStatus;
    output: string;
    durationMs: number;
    input?: {
        id: number;
        prompt: string;
    };
    error?: RuntimeErrorInfo;
}
export interface PageBootstrap {
    mode: "browser" | "ide" | "playground";
    token?: string;
    initialCode?: string;
    initialPath?: string;
    workspaceDir?: string;
    limits?: {
        executionTimeoutMs: number;
        maxSourceBytes: number;
        maxOutputBytes: number;
    };
}
//# sourceMappingURL=protocol.d.ts.map