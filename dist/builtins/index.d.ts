import { Environment } from "../runtime/environment";
import { PlainFunction, PlainValue } from "../runtime/values";
export declare function createStandardEnvironment(options?: {
    baseDir?: string;
    onSay?: (text: string) => void;
    onShow?: (text: string) => void;
    onAsk?: (prompt: string) => Promise<string>;
    onClear?: () => void;
    invokeFunction?: (fn: PlainFunction, args: PlainValue[]) => Promise<PlainValue>;
}): Environment;
//# sourceMappingURL=index.d.ts.map