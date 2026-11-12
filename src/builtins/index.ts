import { Environment } from "../runtime/environment";
import { textBuiltins } from "./text";
import { mathBuiltins } from "./math";
import { geometryBuiltins } from "./geometry";
import { statsBuiltins } from "./stats";
import { scienceBuiltins } from "./science";
import { studentBuiltins } from "./student";
import { listBuiltins } from "./list";
import { timeBuiltins } from "./time";
import { systemBuiltins } from "./system";
import { networkBuiltins } from "./network";
import { createWebBuiltins } from "./web";
import { datascienceBuiltins } from "./datascience";
import { aiBuiltins } from "./ai";
import { automationBuiltins } from "./automation";
import { FileSystemSandbox } from "./file";
import { PlainFunction, PlainValue, plainToString } from "../runtime/values";

export function createStandardEnvironment(options?: {
  baseDir?: string;
  onSay?: (text: string) => void;
  onShow?: (text: string) => void;
  onAsk?: (prompt: string) => Promise<string>;
  onClear?: () => void;
  invokeFunction?: (fn: PlainFunction, args: PlainValue[]) => Promise<PlainValue>;
}): Environment {
  const env = new Environment();
  const fileSandbox = new FileSystemSandbox(options?.baseDir);

  const register = (name: string, fn: (...args: any[]) => any) => {
    const plainFn: PlainFunction = {
      type: "function",
      name,
      parameters: [],
      nativeFn: fn
    };
    env.define(name, plainFn);
  };

  // 1. Math Builtins (46 functions)
  for (const [name, fn] of Object.entries(mathBuiltins)) {
    register(name, fn);
  }

  // 2. Geometry Builtins (15 functions)
  for (const [name, fn] of Object.entries(geometryBuiltins)) {
    register(name, fn);
  }

  // 3. Statistics Builtins (16 functions)
  for (const [name, fn] of Object.entries(statsBuiltins)) {
    register(name, fn);
  }

  // 4. Science & Physics Builtins (18 functions)
  for (const [name, fn] of Object.entries(scienceBuiltins)) {
    register(name, fn);
  }

  // 5. Student & Units Builtins (22 functions)
  for (const [name, fn] of Object.entries(studentBuiltins)) {
    register(name, fn);
  }

  // 6. Text Builtins (36 functions)
  for (const [name, fn] of Object.entries(textBuiltins)) {
    register(name, fn);
  }

  // 7. List Builtins (28 functions)
  for (const [name, fn] of Object.entries(listBuiltins)) {
    register(name, fn);
  }

  // 8. Time Builtins (17 functions)
  for (const [name, fn] of Object.entries(timeBuiltins)) {
    register(name, fn);
  }

  // 9. System & Utilities Builtins (18 functions)
  for (const [name, fn] of Object.entries(systemBuiltins)) {
    register(name, fn);
  }

  // 10. Network Builtins (5 functions)
  for (const [name, fn] of Object.entries(networkBuiltins)) {
    register(name, fn);
  }

  // 11. Web Development Builtins (11 functions)
  const webBuiltins = createWebBuiltins({ invokeFunction: options?.invokeFunction });
  for (const [name, fn] of Object.entries(webBuiltins)) {
    register(name, fn);
  }

  // 12. Data Science Builtins (18 functions)
  for (const [name, fn] of Object.entries(datascienceBuiltins)) {
    register(name, fn);
  }

  // 13. Artificial Intelligence & Machine Learning Builtins (17 functions)
  for (const [name, fn] of Object.entries(aiBuiltins)) {
    register(name, fn);
  }

  // 14. Task Automation Builtins (14 functions)
  for (const [name, fn] of Object.entries(automationBuiltins)) {
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
  register("print", (val) => (options?.onSay ? options.onSay(plainToString(val)) : console.log(plainToString(val))));
  register("wait", (sec) => timeBuiltins.sleep(sec));
  register("sqrt", mathBuiltins.square_root);
  register("cbrt", mathBuiltins.cube_root);
  register("pow", mathBuiltins.power);
  register("fact", mathBuiltins.factorial);
  register("abs", mathBuiltins.absolute);
  register("min", mathBuiltins.minimum);
  register("max", mathBuiltins.maximum);
  register("avg", listBuiltins.average);
  register("len", textBuiltins.length);
  register("size", listBuiltins.count);
  register("upper", textBuiltins.uppercase);
  register("lower", textBuiltins.lowercase);
  register("capitalize", textBuiltins.title_case);
  register("stdev", statsBuiltins.standard_deviation);
  register("now", timeBuiltins.current_time);
  register("bar_chart", datascienceBuiltins.ascii_bar_chart);
  register("histogram", datascienceBuiltins.ascii_histogram);
  register("exec_shell", automationBuiltins.run_command);
  register("shell", automationBuiltins.run_command);
  register("knn", aiBuiltins.knn_classify);
  register("kmeans", aiBuiltins.kmeans_cluster);

  // 17. Space Aliases for natural English syntax
  register("square root", mathBuiltins.square_root);
  register("cube root", mathBuiltins.cube_root);
  register("starts with", textBuiltins.starts_with);
  register("ends with", textBuiltins.ends_with);
  register("random between", mathBuiltins.random_between);
  register("days between", (d1, d2) => timeBuiltins.days_between(d1, d2));
  register("current time", () => timeBuiltins.current_time());
  register("read file", (path) => fileSandbox.readFile(path));
  register("write file", (path, content) => fileSandbox.writeFile(path, content));
  register("append file", (path, content) => fileSandbox.appendFile(path, content));
  register("file exists", (path) => fileSandbox.fileExists(path));
  register("delete file", (path) => fileSandbox.deleteFile(path));
  register("list files", (dir) => fileSandbox.listFiles(dir));
  register("file size", (path) => fileSandbox.fileSize(path));
  register("create folder", (dir) => fileSandbox.createFolder(dir));
  register("roll dice", (sides, count) => systemBuiltins.roll_dice(sides, count));
  register("flip coin", () => systemBuiltins.flip_coin());
  register("pick card", () => systemBuiltins.pick_card());
  register("letter grade", (pct) => studentBuiltins.letter_grade(pct));
  register("atomic mass", (elem) => scienceBuiltins.atomic_mass(elem));
  register("element name", (elem) => scienceBuiltins.element_name(elem));
  register("read csv", (p) => datascienceBuiltins.read_csv(p));
  register("write csv", (p, t) => datascienceBuiltins.write_csv(p, t));
  register("filter table", (t, c, op, v) => datascienceBuiltins.filter_table(t, c, op, v));
  register("sort table", (t, c, a) => datascienceBuiltins.sort_table(t, c, a));
  register("start server", (p, h) => webBuiltins.start_server(p, h));
  register("stop server", () => webBuiltins.stop_server());
  register("serve static", (p, f) => webBuiltins.serve_static_files(p, f));
  register("run command", (cmd) => automationBuiltins.run_command(cmd));
  register("find files", (d, p) => automationBuiltins.find_files(d, p));
  register("copy file", (s, d) => automationBuiltins.copy_file(s, d));
  register("move file", (s, d) => automationBuiltins.move_file(s, d));
  register("batch rename", (d, f, r) => automationBuiltins.batch_rename(d, f, r));
  register("log info", (m) => automationBuiltins.log_info(m));
  register("log error", (m) => automationBuiltins.log_error(m));
  register("log warn", (m) => automationBuiltins.log_warn(m));

  return env;
}
