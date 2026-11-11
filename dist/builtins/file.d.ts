import { PlainValue } from "../runtime/values";
export declare class FileSystemSandbox {
    private baseDir;
    constructor(baseDir?: string);
    private resolveSafePath;
    readFile(filePathVal: PlainValue): string;
    writeFile(filePathVal: PlainValue, contentVal: PlainValue): void;
    fileExists(filePathVal: PlainValue): boolean;
}
//# sourceMappingURL=file.d.ts.map