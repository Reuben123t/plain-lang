import { Environment } from "../runtime/environment";
import { PlainFunction, PlainObject, PlainValue, plainToString } from "../runtime/values";
import { BUILTIN_ALIASES, GLOBAL_BUILTIN_OWNERS, BuiltinModuleName, builtinNameVariants, canonicalModuleName } from "./manifest";
import { getBuiltin } from "../tooling/catalog";

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

const environments = new WeakMap<Environment, Map<string, PlainObject>>();

export function createIoBuiltins(options: BuiltinEnvironmentOptions): BuiltinImplementations {
  return {
    print: (value: PlainValue): void => {
      (options.onSay || ((text: string) => console.log(text)))(plainToString(value));
    },
    args: (): string[] => [...(options.args || [])]
  };
}

export function registerBuiltinModules(modules: BuiltinModuleImplementations): Environment {
  const environment = new Environment();
  const moduleObjects = new Map<string, PlainObject>();
  const globals = new Map<string, { module: BuiltinModuleName; canonical: string; value: PlainFunction }>();

  for (const [moduleName, implementations] of Object.entries(modules)) {
    const module = moduleName as BuiltinModuleName;
    const members: PlainObject = Object.create(null);
    moduleObjects.set(module, members);
    for (const [name, implementation] of Object.entries(implementations)) {
      const metadata = getBuiltin(`${module}.${name}`);
      const value: PlainFunction = {
        type: "function",
        name,
        parameters: metadata?.parameters || [],
        nativeFn: implementation
      };
      for (const variant of builtinNameVariants(name)) {
        const key = variant.toLowerCase();
        members[key] = value;
        const previous = globals.get(key);
        const owner = GLOBAL_BUILTIN_OWNERS[name];
        if (previous && previous.module !== module && !owner) {
          throw new Error(`Built-in '${name}' is defined in both '${previous.module}' and '${module}' without an explicit global owner.`);
        }
        if (!previous || owner === module) globals.set(key, { module, canonical: name, value });
      }
    }
  }

  for (const alias of BUILTIN_ALIASES) {
    const members = moduleObjects.get(alias.module);
    const value = members?.[alias.target.toLowerCase()];
    if (!value) continue;
    members![alias.name.toLowerCase()] = value;
    const key = alias.name.toLowerCase();
    const previous = globals.get(key);
    // Compatibility aliases never erase an unrelated canonical function.
    if (!previous || previous.canonical === alias.target) {
      globals.set(key, { module: alias.module, canonical: alias.target, value: value as PlainFunction });
    }
  }

  for (const [name, entry] of globals) environment.define(name, entry.value);
  environments.set(environment, moduleObjects);
  return environment;
}

export function getRegisteredModule(name: string, environment: Environment): PlainObject | undefined {
  const canonical = canonicalModuleName(name);
  if (!canonical) return undefined;
  const modules = environments.get(environment);
  if (!modules) return undefined;
  const requested = modules.get(canonical);
  if (!requested) return undefined;
  const result: PlainObject = Object.assign(Object.create(null), requested);
  // These documented umbrellas group related functions without exposing other host capabilities.
  const extras: Partial<Record<BuiltinModuleName, BuiltinModuleName[]>> = {
    ai: ["ai_training"], data: ["tables"], math: ["geometry"], server: ["web"]
  };
  for (const extra of extras[canonical] || []) Object.assign(result, modules.get(extra));
  return result;
}
