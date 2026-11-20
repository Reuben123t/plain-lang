"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODULE_ALIASES = exports.BUILTIN_MODULES = exports.builtinCatalog = exports.BUILTIN_CATALOG = void 0;
exports.getModuleBuiltins = getModuleBuiltins;
exports.getBuiltin = getBuiltin;
exports.getBuiltinNames = getBuiltinNames;
const catalog_data_1 = require("./catalog-data");
const manifest_1 = require("../builtins/manifest");
Object.defineProperty(exports, "BUILTIN_MODULES", { enumerable: true, get: function () { return manifest_1.BUILTIN_MODULES; } });
Object.defineProperty(exports, "MODULE_ALIASES", { enumerable: true, get: function () { return manifest_1.MODULE_ALIASES; } });
exports.BUILTIN_CATALOG = catalog_data_1.catalogData;
exports.builtinCatalog = exports.BUILTIN_CATALOG;
const byName = new Map();
const byQualifiedName = new Map();
for (const entry of exports.BUILTIN_CATALOG) {
    for (const name of [entry.name, ...entry.aliases]) {
        const key = name.toLowerCase();
        byQualifiedName.set(`${entry.module}.${key}`, entry);
        const previous = byName.get(key);
        const owner = manifest_1.GLOBAL_BUILTIN_OWNERS[entry.name];
        if (!previous || (name === entry.name && previous.name !== name) || owner === entry.module) {
            byName.set(key, entry);
        }
    }
}
function getModuleBuiltins(module) {
    const canonical = (0, manifest_1.canonicalModuleName)(module);
    if (!canonical)
        return [];
    const groups = {
        ai: ["ai", "ai_training"], data: ["data", "tables"], math: ["math", "geometry"], server: ["server", "web"]
    };
    const modules = groups[canonical] || [canonical];
    return exports.BUILTIN_CATALOG.filter((entry) => modules.includes(entry.module));
}
function getBuiltin(name) {
    const normalized = name.toLowerCase();
    const separator = normalized.indexOf(".");
    if (separator !== -1) {
        const module = (0, manifest_1.canonicalModuleName)(normalized.slice(0, separator));
        if (!module)
            return undefined;
        const functionName = normalized.slice(separator + 1);
        return byQualifiedName.get(`${module}.${functionName}`) ||
            getModuleBuiltins(module).find((entry) => [entry.name, ...entry.aliases].some((alias) => alias.toLowerCase() === functionName));
    }
    return byName.get(normalized);
}
function getBuiltinNames() {
    return [...byName.keys()].filter((name) => !name.includes(" ")).sort();
}
//# sourceMappingURL=catalog.js.map