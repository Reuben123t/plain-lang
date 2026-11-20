import type { ExecutionSnapshot } from "../browser/protocol";
export interface ExecutionOptions {
    code: string;
    filename: string;
    workspaceDir: string;
    timeoutMs: number;
    maxOutputBytes: number;
    maxInputBytes: number;
    inputs?: string[];
    interactive: boolean;
}
/** Thread isolation keeps a tight interpreter loop from blocking HTTP or Stop. It is not an OS sandbox. */
export declare class LocalExecution {
    private readonly options;
    readonly id: string;
    readonly finished: Promise<ExecutionSnapshot>;
    private resolveFinished;
    private readonly startedAt;
    private finishedAt?;
    private status;
    private output;
    private outputBytes;
    private input?;
    private error?;
    private worker;
    private timer;
    constructor(options: ExecutionOptions);
    get active(): boolean;
    snapshot(): ExecutionSnapshot;
    answer(id: number, value: string): void;
    stop(): Promise<ExecutionSnapshot>;
    private problem;
    private onMessage;
    private finish;
}
export declare class ExecutionPool {
    private jobs;
    private closing;
    start(options: ExecutionOptions): LocalExecution;
    get(id: string): LocalExecution;
    close(): Promise<void>;
}
//# sourceMappingURL=executor.d.ts.map