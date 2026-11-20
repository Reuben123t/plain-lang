"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStandardEnvironment = createStandardEnvironment;
exports.getBuiltinModule = getBuiltinModule;
const values_1 = require("../runtime/values");
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
const ai_training_1 = require("./ai_training");
const server_deploy_1 = require("./server_deploy");
const linear_algebra_1 = require("./linear_algebra");
const crypto_security_1 = require("./crypto_security");
const cyber_security_1 = require("./cyber_security");
const data_processing_1 = require("./data_processing");
const engineering_physics_1 = require("./engineering_physics");
const algorithms_1 = require("./algorithms");
const updater_1 = require("./updater");
const testing_1 = require("./testing");
const registry_1 = require("./registry");
function createStandardEnvironment(options = {}) {
    const files = new file_1.FileSystemSandbox(options.baseDir);
    const resolve = (value = ".") => files.resolvePath((0, values_1.plainToString)(value));
    const automation = {
        ...automation_1.automationBuiltins,
        walk_directory: (directory) => automation_1.automationBuiltins.walk_directory(resolve(directory)),
        find_files: (directory, pattern) => automation_1.automationBuiltins.find_files(resolve(directory), pattern),
        copy_file: (source, destination) => automation_1.automationBuiltins.copy_file(resolve(source), resolve(destination)),
        move_file: (source, destination) => automation_1.automationBuiltins.move_file(resolve(source), resolve(destination)),
        batch_rename: (directory, find, replacement) => {
            const value = (0, values_1.plainToString)(replacement);
            if (value.includes("/") || value.includes("\\"))
                throw new Error("A replacement filename cannot contain directory separators.");
            return automation_1.automationBuiltins.batch_rename(resolve(directory), find, replacement);
        },
        batch_delete: (directory, pattern) => automation_1.automationBuiltins.batch_delete(resolve(directory), pattern),
        parse_env_file: (filename) => automation_1.automationBuiltins.parse_env_file(resolve(filename)),
        checksum_file: (filename, algorithm) => automation_1.automationBuiltins.checksum_file(resolve(filename), algorithm),
        log_info: (message) => (options.onSay || console.log)(`[INFO] ${(0, values_1.plainToString)(message)}`),
        log_warn: (message) => (options.onSay || console.warn)(`[WARN] ${(0, values_1.plainToString)(message)}`),
        log_error: (message) => (options.onSay || console.error)(`[ERROR] ${(0, values_1.plainToString)(message)}`)
    };
    const data = {
        ...datascience_1.datascienceBuiltins,
        read_csv: (filename) => datascience_1.datascienceBuiltins.read_csv(resolve(filename)),
        write_csv: (filename, table) => datascience_1.datascienceBuiltins.write_csv(resolve(filename), table),
        export_html_chart: (title, type, labels, values, filename) => datascience_1.datascienceBuiltins.export_html_chart(title, type, labels, values, resolve(filename))
    };
    const file = {
        read_file: (filename) => files.readFile(filename),
        write_file: (filename, content) => files.writeFile(filename, content),
        append_file: (filename, content) => files.appendFile(filename, content),
        file_exists: (filename) => files.fileExists(filename),
        delete_file: (filename) => files.deleteFile(filename),
        list_files: (directory) => files.listFiles(directory),
        file_size: (filename) => files.fileSize(filename),
        create_folder: (directory) => files.createFolder(directory),
        folder_exists: (directory) => files.folderExists(directory)
    };
    return (0, registry_1.registerBuiltinModules)({
        math: math_1.mathBuiltins, geometry: geometry_1.geometryBuiltins, stats: stats_1.statsBuiltins, science: science_1.scienceBuiltins,
        student: student_1.studentBuiltins, text: text_1.textBuiltins, list: list_1.listBuiltins, time: time_1.timeBuiltins,
        system: system_1.systemBuiltins, network: network_1.networkBuiltins, web: (0, web_1.createWebBuiltins)({ invokeFunction: options.invokeFunction }),
        data, ai: ai_1.aiBuiltins, automation, ai_training: ai_training_1.aiTrainingBuiltins,
        server: (0, server_deploy_1.createServerDeployer)({ invokeFunction: options.invokeFunction }), linear_algebra: linear_algebra_1.linearAlgebraBuiltins,
        crypto: crypto_security_1.cryptoSecurityBuiltins, cyber: cyber_security_1.cyberSecurityBuiltins, tables: data_processing_1.dataProcessingBuiltins,
        physics: engineering_physics_1.engineeringPhysicsBuiltins, algorithms: algorithms_1.algorithmsBuiltins, updater: updater_1.updaterBuiltins,
        file, testing: testing_1.testingBuiltins, io: (0, registry_1.createIoBuiltins)(options)
    });
}
function getBuiltinModule(name, environment) {
    return (0, registry_1.getRegisteredModule)(name, environment);
}
//# sourceMappingURL=index.js.map