import { Environment } from "../runtime/environment";
import { PlainFunction, PlainObject, PlainValue } from "../runtime/values";
import { BuiltinModuleName } from "./manifest";
export interface BuiltinEnvironmentOptions {
    baseDir?: string;
    args?: string[];
    onSay?: (text: string) => void;
    onShow?: (text: string) => void;
    onAsk?: (prompt: string) => Promise<string>;
    onClear?: () => void;
    invokeFunction?: (fn: PlainFunction, args: PlainValue[]) => Promise<PlainValue>;
}
export type BuiltinImplementations = Record<string, (...args: any[]) => any>;
export type BuiltinModuleImplementations = Partial<Record<BuiltinModuleName, BuiltinImplementations>>;
export declare function createIoBuiltins(options: BuiltinEnvironmentOptions): BuiltinImplementations;
export declare function registerBuiltinModules(modules: BuiltinModuleImplementations): Environment;
export declare function getRegisteredModule(name: string, environment: Environment): PlainObject | undefined;
//# sourceMappingURL=registry.d.ts.map