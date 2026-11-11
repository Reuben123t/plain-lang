import { Environment } from "../runtime/environment";
export declare function createStandardEnvironment(options?: {
    baseDir?: string;
    onSay?: (text: string) => void;
    onShow?: (text: string) => void;
    onAsk?: (prompt: string) => Promise<string>;
    onClear?: () => void;
}): Environment;
//# sourceMappingURL=index.d.ts.map