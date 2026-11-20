import { BUILTIN_MODULES, MODULE_ALIASES } from "../builtins/manifest";
export interface BuiltinDefinition {
    name: string;
    aliases: string[];
    module: string;
    parameters: string[];
    signature: string;
    description: string;
    browserSafe: boolean;
}
export declare const BUILTIN_CATALOG: readonly BuiltinDefinition[];
export declare const builtinCatalog: readonly BuiltinDefinition[];
export { BUILTIN_MODULES, MODULE_ALIASES };
export declare function getModuleBuiltins(module: string): BuiltinDefinition[];
export declare function getBuiltin(name: string): BuiltinDefinition | undefined;
export declare function getBuiltinNames(): string[];
//# sourceMappingURL=catalog.d.ts.map