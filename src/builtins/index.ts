import { Environment } from "../runtime/environment";
import { PlainObject, PlainValue, plainToString } from "../runtime/values";
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
import { aiTrainingBuiltins } from "./ai_training";
import { createServerDeployer } from "./server_deploy";
import { linearAlgebraBuiltins } from "./linear_algebra";
import { cryptoSecurityBuiltins } from "./crypto_security";
import { cyberSecurityBuiltins } from "./cyber_security";
import { dataProcessingBuiltins } from "./data_processing";
import { engineeringPhysicsBuiltins } from "./engineering_physics";
import { algorithmsBuiltins } from "./algorithms";
import { updaterBuiltins } from "./updater";
import { testingBuiltins } from "./testing";
import { BuiltinEnvironmentOptions, BuiltinImplementations, createIoBuiltins, getRegisteredModule, registerBuiltinModules } from "./registry";

export function createStandardEnvironment(options: BuiltinEnvironmentOptions = {}): Environment {
  const files = new FileSystemSandbox(options.baseDir);
  const resolve = (value: PlainValue = "."): string => files.resolvePath(plainToString(value));
  const automation: BuiltinImplementations = {
    ...automationBuiltins,
    walk_directory: (directory?: PlainValue) => automationBuiltins.walk_directory(resolve(directory)),
    find_files: (directory: PlainValue, pattern: PlainValue) => automationBuiltins.find_files(resolve(directory), pattern),
    copy_file: (source: PlainValue, destination: PlainValue) => automationBuiltins.copy_file(resolve(source), resolve(destination)),
    move_file: (source: PlainValue, destination: PlainValue) => automationBuiltins.move_file(resolve(source), resolve(destination)),
    batch_rename: (directory: PlainValue, find: PlainValue, replacement: PlainValue) => {
      const value = plainToString(replacement);
      if (value.includes("/") || value.includes("\\")) throw new Error("A replacement filename cannot contain directory separators.");
      return automationBuiltins.batch_rename(resolve(directory), find, replacement);
    },
    batch_delete: (directory: PlainValue, pattern: PlainValue) => automationBuiltins.batch_delete(resolve(directory), pattern),
    parse_env_file: (filename: PlainValue) => automationBuiltins.parse_env_file(resolve(filename)),
    checksum_file: (filename: PlainValue, algorithm?: PlainValue) => automationBuiltins.checksum_file(resolve(filename), algorithm),
    log_info: (message: PlainValue) => (options.onSay || console.log)(`[INFO] ${plainToString(message)}`),
    log_warn: (message: PlainValue) => (options.onSay || console.warn)(`[WARN] ${plainToString(message)}`),
    log_error: (message: PlainValue) => (options.onSay || console.error)(`[ERROR] ${plainToString(message)}`)
  };
  const data: BuiltinImplementations = {
    ...datascienceBuiltins,
    read_csv: (filename: PlainValue) => datascienceBuiltins.read_csv(resolve(filename)),
    write_csv: (filename: PlainValue, table: PlainValue) => datascienceBuiltins.write_csv(resolve(filename), table),
    export_html_chart: (title: PlainValue, type: PlainValue, labels: PlainValue, values: PlainValue, filename: PlainValue) =>
      datascienceBuiltins.export_html_chart(title, type, labels, values, resolve(filename))
  };
  const file: BuiltinImplementations = {
    read_file: (filename: PlainValue) => files.readFile(filename),
    write_file: (filename: PlainValue, content: PlainValue) => files.writeFile(filename, content),
    append_file: (filename: PlainValue, content: PlainValue) => files.appendFile(filename, content),
    file_exists: (filename: PlainValue) => files.fileExists(filename),
    delete_file: (filename: PlainValue) => files.deleteFile(filename),
    list_files: (directory?: PlainValue) => files.listFiles(directory),
    file_size: (filename: PlainValue) => files.fileSize(filename),
    create_folder: (directory: PlainValue) => files.createFolder(directory),
    folder_exists: (directory: PlainValue) => files.folderExists(directory)
  };

  return registerBuiltinModules({
    math: mathBuiltins, geometry: geometryBuiltins, stats: statsBuiltins, science: scienceBuiltins,
    student: studentBuiltins, text: textBuiltins, list: listBuiltins, time: timeBuiltins,
    system: systemBuiltins, network: networkBuiltins, web: createWebBuiltins({ invokeFunction: options.invokeFunction }),
    data, ai: aiBuiltins, automation, ai_training: aiTrainingBuiltins,
    server: createServerDeployer({ invokeFunction: options.invokeFunction }), linear_algebra: linearAlgebraBuiltins,
    crypto: cryptoSecurityBuiltins, cyber: cyberSecurityBuiltins, tables: dataProcessingBuiltins,
    physics: engineeringPhysicsBuiltins, algorithms: algorithmsBuiltins, updater: updaterBuiltins,
    file, testing: testingBuiltins, io: createIoBuiltins(options)
  });
}

export function getBuiltinModule(name: string, environment: Environment): PlainObject | undefined {
  return getRegisteredModule(name, environment);
}
