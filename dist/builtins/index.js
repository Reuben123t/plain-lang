"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStandardEnvironment = createStandardEnvironment;
const environment_1 = require("../runtime/environment");
const text_1 = require("./text");
const math_1 = require("./math");
const geometry_1 = require("./geometry");
const stats_1 = require("./stats");
const science_1 = require("./science");
const student_1 = require("./student");
const list_1 = require("./list");
const time_1 = require("./time");
const system_1 = require("./system");
const network_1 = require("./network");
const file_1 = require("./file");
const values_1 = require("../runtime/values");
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
    // 1. Math Builtins (46 functions)
    for (const [name, fn] of Object.entries(math_1.mathBuiltins)) {
        register(name, fn);
    }
    // 2. Geometry Builtins (15 functions)
    for (const [name, fn] of Object.entries(geometry_1.geometryBuiltins)) {
        register(name, fn);
    }
    // 3. Statistics Builtins (16 functions)
    for (const [name, fn] of Object.entries(stats_1.statsBuiltins)) {
        register(name, fn);
    }
    // 4. Science & Physics Builtins (18 functions)
    for (const [name, fn] of Object.entries(science_1.scienceBuiltins)) {
        register(name, fn);
    }
    // 5. Student & Units Builtins (22 functions)
    for (const [name, fn] of Object.entries(student_1.studentBuiltins)) {
        register(name, fn);
    }
    // 6. Text Builtins (36 functions)
    for (const [name, fn] of Object.entries(text_1.textBuiltins)) {
        register(name, fn);
    }
    // 7. List Builtins (28 functions)
    for (const [name, fn] of Object.entries(list_1.listBuiltins)) {
        register(name, fn);
    }
    // 8. Time Builtins (17 functions)
    for (const [name, fn] of Object.entries(time_1.timeBuiltins)) {
        register(name, fn);
    }
    // 9. System & Utilities Builtins (18 functions)
    for (const [name, fn] of Object.entries(system_1.systemBuiltins)) {
        register(name, fn);
    }
    // 10. Network Builtins (5 functions)
    for (const [name, fn] of Object.entries(network_1.networkBuiltins)) {
        register(name, fn);
    }
    // 11. File System Sandboxed Operations (8 functions)
    register("read_file", (path) => fileSandbox.readFile(path));
    register("write_file", (path, content) => fileSandbox.writeFile(path, content));
    register("append_file", (path, content) => fileSandbox.appendFile(path, content));
    register("file_exists", (path) => fileSandbox.fileExists(path));
    register("delete_file", (path) => fileSandbox.deleteFile(path));
    register("list_files", (dir) => fileSandbox.listFiles(dir));
    register("file_size", (path) => fileSandbox.fileSize(path));
    register("create_folder", (dir) => fileSandbox.createFolder(dir));
    register("folder_exists", (dir) => fileSandbox.folderExists(dir));
    // 12. Student & Standard Aliases
    register("print", (val) => (options?.onSay ? options.onSay((0, values_1.plainToString)(val)) : console.log((0, values_1.plainToString)(val))));
    register("wait", (sec) => time_1.timeBuiltins.sleep(sec));
    register("sqrt", math_1.mathBuiltins.square_root);
    register("cbrt", math_1.mathBuiltins.cube_root);
    register("pow", math_1.mathBuiltins.power);
    register("fact", math_1.mathBuiltins.factorial);
    register("abs", math_1.mathBuiltins.absolute);
    register("min", math_1.mathBuiltins.minimum);
    register("max", math_1.mathBuiltins.maximum);
    register("avg", list_1.listBuiltins.average);
    register("len", text_1.textBuiltins.length);
    register("size", list_1.listBuiltins.count);
    register("upper", text_1.textBuiltins.uppercase);
    register("lower", text_1.textBuiltins.lowercase);
    register("capitalize", text_1.textBuiltins.title_case);
    register("stdev", stats_1.statsBuiltins.standard_deviation);
    register("now", time_1.timeBuiltins.current_time);
    // 13. Space Aliases for natural English expressions
    register("square root", math_1.mathBuiltins.square_root);
    register("cube root", math_1.mathBuiltins.cube_root);
    register("starts with", text_1.textBuiltins.starts_with);
    register("ends with", text_1.textBuiltins.ends_with);
    register("random between", math_1.mathBuiltins.random_between);
    register("days between", (d1, d2) => time_1.timeBuiltins.days_between(d1, d2));
    register("current time", () => time_1.timeBuiltins.current_time());
    register("read file", (path) => fileSandbox.readFile(path));
    register("write file", (path, content) => fileSandbox.writeFile(path, content));
    register("append file", (path, content) => fileSandbox.appendFile(path, content));
    register("file exists", (path) => fileSandbox.fileExists(path));
    register("delete file", (path) => fileSandbox.deleteFile(path));
    register("list files", (dir) => fileSandbox.listFiles(dir));
    register("file size", (path) => fileSandbox.fileSize(path));
    register("roll dice", (sides, count) => system_1.systemBuiltins.roll_dice(sides, count));
    register("flip coin", () => system_1.systemBuiltins.flip_coin());
    register("pick card", () => system_1.systemBuiltins.pick_card());
    register("letter grade", (pct) => student_1.studentBuiltins.letter_grade(pct));
    register("atomic mass", (elem) => science_1.scienceBuiltins.atomic_mass(elem));
    register("element name", (elem) => science_1.scienceBuiltins.element_name(elem));
    return env;
}
//# sourceMappingURL=index.js.map