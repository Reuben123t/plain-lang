export interface DiagnosticResult {
    name: string;
    status: "ok" | "warning" | "error";
    message: string;
    fixable: boolean;
    fixAction?: () => Promise<boolean> | boolean;
}
export declare class PlainSystemManager {
    private isWindows;
    private installDir;
    private binDir;
    constructor();
    getInstallDir(): string;
    getBinDir(): string;
    diagnose(): Promise<DiagnosticResult[]>;
    private runPowerShell;
    addToPath(): boolean;
    private checkFileAssociation;
    registerFileAssociation(): boolean;
    installBinaryShims(): boolean;
    createShortcuts(): boolean;
    runInteractiveSetup(): Promise<void>;
    runDoctor(autoFix?: boolean): Promise<boolean>;
    cleanUninstall(): boolean;
}
//# sourceMappingURL=installer.d.ts.map