export type BuiltinModuleName = "math" | "geometry" | "stats" | "science" | "student" | "text" | "list" | "time" | "system" | "network" | "web" | "data" | "ai" | "automation" | "ai_training" | "server" | "linear_algebra" | "crypto" | "cyber" | "tables" | "physics" | "algorithms" | "updater" | "file" | "testing" | "io";
export declare const BUILTIN_MODULES: readonly BuiltinModuleName[];
export declare const MODULE_ALIASES: Readonly<Record<string, BuiltinModuleName>>;
export declare const GLOBAL_BUILTIN_OWNERS: Readonly<Record<string, BuiltinModuleName>>;
export interface BuiltinAlias {
    name: string;
    module: BuiltinModuleName;
    target: string;
}
export declare const BUILTIN_ALIASES: readonly BuiltinAlias[];
export declare const BROWSER_MODULES: readonly BuiltinModuleName[];
export declare function canonicalModuleName(name: string): BuiltinModuleName | undefined;
export declare function builtinNameVariants(name: string): string[];
//# sourceMappingURL=manifest.d.ts.map