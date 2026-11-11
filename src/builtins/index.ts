import { Environment } from "../runtime/environment";
import { textBuiltins } from "./text";
import { mathBuiltins } from "./math";
import { listBuiltins } from "./list";
import { timeBuiltins } from "./time";
import { FileSystemSandbox } from "./file";
import { PlainFunction, PlainValue } from "../runtime/values";

export function createStandardEnvironment(options?: {
  baseDir?: string;
  onSay?: (text: string) => void;
  onShow?: (text: string) => void;
  onAsk?: (prompt: string) => Promise<string>;
  onClear?: () => void;
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

  // Text
  for (const [name, fn] of Object.entries(textBuiltins)) {
    register(name, fn);
  }

  // Math
  for (const [name, fn] of Object.entries(mathBuiltins)) {
    register(name, fn);
  }

  // Lists
  for (const [name, fn] of Object.entries(listBuiltins)) {
    register(name, fn);
  }

  // Time & Date
  register("today", () => timeBuiltins.today());
  register("current_time", () => timeBuiltins.current_time());
  register("days_between", (d1, d2) => timeBuiltins.days_between(d1, d2));
  register("wait", (sec) => timeBuiltins.sleep(sec));

  // File
  register("read_file", (path) => fileSandbox.readFile(path));
  register("write_file", (path, content) => fileSandbox.writeFile(path, content));
  register("file_exists", (path) => fileSandbox.fileExists(path));

  return env;
}
