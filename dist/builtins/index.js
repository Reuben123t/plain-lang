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
const web_1 = require("./web");
const datascience_1 = require("./datascience");
const ai_1 = require("./ai");
const automation_1 = require("./automation");
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
    // 11. Web Development Builtins (11 functions)
    const webBuiltins = (0, web_1.createWebBuiltins)({ invokeFunction: options?.invokeFunction });
    for (const [name, fn] of Object.entries(webBuiltins)) {
        register(name, fn);
    }
    // 12. Data Science Builtins (18 functions)
    for (const [name, fn] of Object.entries(datascience_1.datascienceBuiltins)) {
        register(name, fn);
    }
    // 13. Artificial Intelligence & Machine Learning Builtins (17 functions)
    for (const [name, fn] of Object.entries(ai_1.aiBuiltins)) {
        register(name, fn);
    }
    // 14. Task Automation Builtins (14 functions)
    for (const [name, fn] of Object.entries(automation_1.automationBuiltins)) {
        register(name, fn);
    }
    // 15. File System Sandboxed Operations (9 functions)
    register("read_file", (path) => fileSandbox.readFile(path));
    register("write_file", (path, content) => fileSandbox.writeFile(path, content));
    register("append_file", (path, content) => fileSandbox.appendFile(path, content));
    register("file_exists", (path) => fileSandbox.fileExists(path));
    register("delete_file", (path) => fileSandbox.deleteFile(path));
    register("list_files", (dir) => fileSandbox.listFiles(dir));
    register("file_size", (path) => fileSandbox.fileSize(path));
    register("create_folder", (dir) => fileSandbox.createFolder(dir));
    register("folder_exists", (dir) => fileSandbox.folderExists(dir));
    // 16. Student & Developer Aliases
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
    register("bar_chart", datascience_1.datascienceBuiltins.ascii_bar_chart);
    register("histogram", datascience_1.datascienceBuiltins.ascii_histogram);
    register("exec_shell", automation_1.automationBuiltins.run_command);
    register("shell", automation_1.automationBuiltins.run_command);
    register("knn", ai_1.aiBuiltins.knn_classify);
    register("kmeans", ai_1.aiBuiltins.kmeans_cluster);
    // 17. Space Aliases for natural English syntax
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
    register("create folder", (dir) => fileSandbox.createFolder(dir));
    register("roll dice", (sides, count) => system_1.systemBuiltins.roll_dice(sides, count));
    register("flip coin", () => system_1.systemBuiltins.flip_coin());
    register("pick card", () => system_1.systemBuiltins.pick_card());
    register("letter grade", (pct) => student_1.studentBuiltins.letter_grade(pct));
    register("atomic mass", (elem) => science_1.scienceBuiltins.atomic_mass(elem));
    register("element name", (elem) => science_1.scienceBuiltins.element_name(elem));
    register("read csv", (p) => datascience_1.datascienceBuiltins.read_csv(p));
    register("write csv", (p, t) => datascience_1.datascienceBuiltins.write_csv(p, t));
    register("filter table", (t, c, op, v) => datascience_1.datascienceBuiltins.filter_table(t, c, op, v));
    register("sort table", (t, c, a) => datascience_1.datascienceBuiltins.sort_table(t, c, a));
    register("start server", (p, h) => webBuiltins.start_server(p, h));
    register("stop server", () => webBuiltins.stop_server());
    register("serve static", (p, f) => webBuiltins.serve_static_files(p, f));
    register("run command", (cmd) => automation_1.automationBuiltins.run_command(cmd));
    register("find files", (d, p) => automation_1.automationBuiltins.find_files(d, p));
    register("copy file", (s, d) => automation_1.automationBuiltins.copy_file(s, d));
    register("move file", (s, d) => automation_1.automationBuiltins.move_file(s, d));
    register("batch rename", (d, f, r) => automation_1.automationBuiltins.batch_rename(d, f, r));
    register("log info", (m) => automation_1.automationBuiltins.log_info(m));
    register("log error", (m) => automation_1.automationBuiltins.log_error(m));
    register("log warn", (m) => automation_1.automationBuiltins.log_warn(m));
    return env;
}
//# sourceMappingURL=index.js.map