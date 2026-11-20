"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIoBuiltins = createIoBuiltins;
exports.registerBuiltinModules = registerBuiltinModules;
exports.getRegisteredModule = getRegisteredModule;
const environment_1 = require("../runtime/environment");
const values_1 = require("../runtime/values");
const manifest_1 = require("./manifest");
const catalog_1 = require("../tooling/catalog");
const environments = new WeakMap();
function createIoBuiltins(options) {
    return {
        print: (value) => {
            (options.onSay || ((text) => console.log(text)))((0, values_1.plainToString)(value));
        },
        args: () => [...(options.args || [])]
    };
}
function registerBuiltinModules(modules) {
    const environment = new environment_1.Environment();
    const moduleObjects = new Map();
    const globals = new Map();
    for (const [moduleName, implementations] of Object.entries(modules)) {
        const module = moduleName;
        const members = Object.create(null);
        moduleObjects.set(module, members);
        for (const [name, implementation] of Object.entries(implementations)) {
            const metadata = (0, catalog_1.getBuiltin)(`${module}.${name}`);
            const value = {
                type: "function",
                name,
                parameters: metadata?.parameters || [],
                nativeFn: implementation
            };
            for (const variant of (0, manifest_1.builtinNameVariants)(name)) {
                const key = variant.toLowerCase();
                members[key] = value;
                const previous = globals.get(key);
                const owner = manifest_1.GLOBAL_BUILTIN_OWNERS[name];
                if (previous && previous.module !== module && !owner) {
                    throw new Error(`Built-in '${name}' is defined in both '${previous.module}' and '${module}' without an explicit global owner.`);
                }
                if (!previous || owner === module)
                    globals.set(key, { module, canonical: name, value });
            }
        }
    }
    for (const alias of manifest_1.BUILTIN_ALIASES) {
        const members = moduleObjects.get(alias.module);
        const value = members?.[alias.target.toLowerCase()];
        if (!value)
            continue;
        members[alias.name.toLowerCase()] = value;
        const key = alias.name.toLowerCase();
        const previous = globals.get(key);
        // Compatibility aliases never erase an unrelated canonical function.
        if (!previous || previous.canonical === alias.target) {
            globals.set(key, { module: alias.module, canonical: alias.target, value: value });
        }
    }
    for (const [name, entry] of globals)
        environment.define(name, entry.value);
    environments.set(environment, moduleObjects);
    return environment;
}
function getRegisteredModule(name, environment) {
    const canonical = (0, manifest_1.canonicalModuleName)(name);
    if (!canonical)
        return undefined;
    const modules = environments.get(environment);
    if (!modules)
        return undefined;
    const requested = modules.get(canonical);
    if (!requested)
        return undefined;
    const result = Object.assign(Object.create(null), requested);
    // These documented umbrellas group related functions without exposing other host capabilities.
    const extras = {
        ai: ["ai_training"], data: ["tables"], math: ["geometry"], server: ["web"]
    };
    for (const extra of extras[canonical] || [])
        Object.assign(result, modules.get(extra));
    return result;
}
//# sourceMappingURL=registry.js.map