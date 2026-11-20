import { catalogData } from "./catalog-data";
import { BUILTIN_MODULES, GLOBAL_BUILTIN_OWNERS, MODULE_ALIASES, canonicalModuleName } from "../builtins/manifest";

export interface BuiltinDefinition {
  name: string;
  aliases: string[];
  module: string;
  parameters: string[];
  signature: string;
  description: string;
  browserSafe: boolean;
}

export const BUILTIN_CATALOG: readonly BuiltinDefinition[] = catalogData;
export const builtinCatalog = BUILTIN_CATALOG;
export { BUILTIN_MODULES, MODULE_ALIASES };

const byName = new Map<string, BuiltinDefinition>();
const byQualifiedName = new Map<string, BuiltinDefinition>();
for (const entry of BUILTIN_CATALOG) {
  for (const name of [entry.name, ...entry.aliases]) {
    const key = name.toLowerCase();
    byQualifiedName.set(`${entry.module}.${key}`, entry);
    const previous = byName.get(key);
    const owner = GLOBAL_BUILTIN_OWNERS[entry.name];
    if (!previous || (name === entry.name && previous.name !== name) || owner === entry.module) {
      byName.set(key, entry);
    }
  }
}

export function getModuleBuiltins(module: string): BuiltinDefinition[] {
  const canonical = canonicalModuleName(module);
  if (!canonical) return [];
  const groups: Record<string, string[]> = {
    ai: ["ai", "ai_training"], data: ["data", "tables"], math: ["math", "geometry"], server: ["server", "web"]
  };
  const modules = groups[canonical] || [canonical];
  return BUILTIN_CATALOG.filter((entry) => modules.includes(entry.module));
}

export function getBuiltin(name: string): BuiltinDefinition | undefined {
  const normalized = name.toLowerCase();
  const separator = normalized.indexOf(".");
  if (separator !== -1) {
    const module = canonicalModuleName(normalized.slice(0, separator));
    if (!module) return undefined;
    const functionName = normalized.slice(separator + 1);
    return byQualifiedName.get(`${module}.${functionName}`) ||
      getModuleBuiltins(module).find((entry) => [entry.name, ...entry.aliases].some((alias) => alias.toLowerCase() === functionName));
  }
  return byName.get(normalized);
}

export function getBuiltinNames(): string[] {
  return [...byName.keys()].filter((name) => !name.includes(" ")).sort();
}
