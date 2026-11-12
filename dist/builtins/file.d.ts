import { PlainValue } from "../runtime/values";
export declare class FileSystemSandbox {
    private baseDir;
    constructor(baseDir?: string);
    private resolveSafePath;
    readFile(filePathVal: PlainValue): string;
    writeFile(filePathVal: PlainValue, contentVal: PlainValue): void;
    fileExists(filePathVal: PlainValue): boolean;
    appendFile(filePathVal: PlainValue, contentVal: PlainValue): void;
    deleteFile(filePathVal: PlainValue): boolean;
    listFiles(dirPathVal?: PlainValue): string[];
    fileSize(filePathVal: PlainValue): number;
    createFolder(dirPathVal: PlainValue): void;
    folderExists(dirPathVal: PlainValue): boolean;
}
//# sourceMappingURL=file.d.ts.map