"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStandardEnvironment = createStandardEnvironment;
const environment_1 = require("../runtime/environment");
const text_1 = require("./text");
const math_1 = require("./math");
const list_1 = require("./list");
const time_1 = require("./time");
const file_1 = require("./file");
function createStandardEnvironment(options) {
    const env = new environment_1.Environment();
    const fileSandbox = new file_1.FileSystemSandbox(options?.baseDir);
    const register = (name, fn) => {
        const plainFn = {
            type: "function",
            name,
            parameters: [],
            nativeFn: fn
        };
        env.define(name, plainFn);
    };
    // Text
    for (const [name, fn] of Object.entries(text_1.textBuiltins)) {
        register(name, fn);
    }
    // Math
    for (const [name, fn] of Object.entries(math_1.mathBuiltins)) {
        register(name, fn);
    }
    // Lists
    for (const [name, fn] of Object.entries(list_1.listBuiltins)) {
        register(name, fn);
    }
    // Time & Date
    register("today", () => time_1.timeBuiltins.today());
    register("current_time", () => time_1.timeBuiltins.current_time());
    register("days_between", (d1, d2) => time_1.timeBuiltins.days_between(d1, d2));
    register("wait", (sec) => time_1.timeBuiltins.sleep(sec));
    // File
    register("read_file", (path) => fileSandbox.readFile(path));
    register("write_file", (path, content) => fileSandbox.writeFile(path, content));
    register("file_exists", (path) => fileSandbox.fileExists(path));
    // Register aliases for maximum beginner friendliness
    register("to_number", math_1.mathBuiltins.to_number);
    register("number", math_1.mathBuiltins.to_number);
    register("to_text", math_1.mathBuiltins.to_text);
    register("text", math_1.mathBuiltins.to_text);
    register("len", text_1.textBuiltins.length);
    register("size", text_1.textBuiltins.length);
    register("print", (val) => (options?.onSay ? options.onSay(String(val)) : console.log(val)));
    // Space aliases for direct identifier lookups
    register("starts with", text_1.textBuiltins.starts_with);
    register("ends with", text_1.textBuiltins.ends_with);
    register("random between", math_1.mathBuiltins.random_between);
    register("days between", (d1, d2) => time_1.timeBuiltins.days_between(d1, d2));
    register("current time", () => time_1.timeBuiltins.current_time());
    register("read file", (path) => fileSandbox.readFile(path));
    register("write file", (path, content) => fileSandbox.writeFile(path, content));
    register("file exists", (path) => fileSandbox.fileExists(path));
    return env;
}
//# sourceMappingURL=index.js.map