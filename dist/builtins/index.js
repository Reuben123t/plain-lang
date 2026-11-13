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
const ai_training_1 = require("./ai_training");
const server_deploy_1 = require("./server_deploy");
const linear_algebra_1 = require("./linear_algebra");
const crypto_security_1 = require("./crypto_security");
const data_processing_1 = require("./data_processing");
const engineering_physics_1 = require("./engineering_physics");
const algorithms_1 = require("./algorithms");
const updater_1 = require("./updater");
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
    // Helper to register canonical, natural English space alias, and optional camelCase
    const registerModule = (moduleObj) => {
        for (const [name, fn] of Object.entries(moduleObj)) {
            register(name, fn);
            // Register space alias: "matrix_add" -> "matrix add"
            if (name.includes("_")) {
                const spaceAlias = name.replace(/_/g, " ");
                register(spaceAlias, fn);
                // Register camelCase: "matrix_add" -> "matrixAdd"
                const camelCase = name.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
                register(camelCase, fn);
            }
        }
    };
    // 1. Math Builtins
    registerModule(math_1.mathBuiltins);
    // 2. Geometry Builtins
    registerModule(geometry_1.geometryBuiltins);
    // 3. Statistics Builtins
    registerModule(stats_1.statsBuiltins);
    // 4. Science Builtins
    registerModule(science_1.scienceBuiltins);
    // 5. Student & Units Builtins
    registerModule(student_1.studentBuiltins);
    // 6. Text Builtins
    registerModule(text_1.textBuiltins);
    // 7. List Builtins
    registerModule(list_1.listBuiltins);
    // 8. Time Builtins
    registerModule(time_1.timeBuiltins);
    // 9. System & Game Builtins
    registerModule(system_1.systemBuiltins);
    // 10. Network Builtins
    registerModule(network_1.networkBuiltins);
    // 11. Web Development Builtins
    const webBuiltins = (0, web_1.createWebBuiltins)({ invokeFunction: options?.invokeFunction });
    registerModule(webBuiltins);
    // 12. Data Science Builtins
    registerModule(datascience_1.datascienceBuiltins);
    // 13. Artificial Intelligence & Machine Learning
    registerModule(ai_1.aiBuiltins);
    // 14. Task Automation Builtins
    registerModule(automation_1.automationBuiltins);
    // 15. AI Training & Deep Learning
    registerModule(ai_training_1.aiTrainingBuiltins);
    // 16. Server Deployment & Network Discovery
    const serverDeployer = (0, server_deploy_1.createServerDeployer)({ invokeFunction: options?.invokeFunction });
    registerModule(serverDeployer);
    // 17. Linear Algebra & Matrices
    registerModule(linear_algebra_1.linearAlgebraBuiltins);
    // 18. Crypto & Security
    registerModule(crypto_security_1.cryptoSecurityBuiltins);
    // 19. Data Processing & DataFrames
    registerModule(data_processing_1.dataProcessingBuiltins);
    // 20. Engineering, Physics & Relativity
    registerModule(engineering_physics_1.engineeringPhysicsBuiltins);
    // 21. Computer Science Algorithms
    registerModule(algorithms_1.algorithmsBuiltins);
    // 22. Updater & Software Maintenance
    registerModule(updater_1.updaterBuiltins);
    // 23. File System Operations
    const fileOperations = {
        read_file: (path) => fileSandbox.readFile(path),
        write_file: (path, content) => fileSandbox.writeFile(path, content),
        append_file: (path, content) => fileSandbox.appendFile(path, content),
        file_exists: (path) => fileSandbox.fileExists(path),
        delete_file: (path) => fileSandbox.deleteFile(path),
        list_files: (dir) => fileSandbox.listFiles(dir),
        file_size: (path) => fileSandbox.fileSize(path),
        create_folder: (dir) => fileSandbox.createFolder(dir),
        folder_exists: (dir) => fileSandbox.folderExists(dir)
    };
    registerModule(fileOperations);
    // 24. Python, NumPy, SciPy & PyTorch Shorthand Aliases
    register("print", (val) => (options?.onSay ? options.onSay((0, values_1.plainToString)(val)) : console.log((0, values_1.plainToString)(val))));
    register("wait", (sec) => time_1.timeBuiltins.sleep(sec));
    register("sleep", (sec) => time_1.timeBuiltins.sleep(sec));
    register("sqrt", math_1.mathBuiltins.square_root);
    register("cbrt", math_1.mathBuiltins.cube_root);
    register("pow", math_1.mathBuiltins.power);
    register("fact", math_1.mathBuiltins.factorial);
    register("abs", math_1.mathBuiltins.absolute);
    register("min", math_1.mathBuiltins.minimum);
    register("max", math_1.mathBuiltins.maximum);
    register("avg", list_1.listBuiltins.average);
    register("mean", list_1.listBuiltins.average);
    register("median", stats_1.statsBuiltins.median);
    register("mode", stats_1.statsBuiltins.mode);
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
    // NumPy & Matrix shortcuts
    register("np_zeros", linear_algebra_1.linearAlgebraBuiltins.matrix_zeros);
    register("zeros", linear_algebra_1.linearAlgebraBuiltins.matrix_zeros);
    register("np_ones", linear_algebra_1.linearAlgebraBuiltins.matrix_ones);
    register("ones", linear_algebra_1.linearAlgebraBuiltins.matrix_ones);
    register("np_eye", linear_algebra_1.linearAlgebraBuiltins.matrix_eye);
    register("eye", linear_algebra_1.linearAlgebraBuiltins.matrix_eye);
    register("np_dot", linear_algebra_1.linearAlgebraBuiltins.vector_dot);
    register("dot", linear_algebra_1.linearAlgebraBuiltins.vector_dot);
    register("matmul", linear_algebra_1.linearAlgebraBuiltins.matrix_mult);
    register("np_matmul", linear_algebra_1.linearAlgebraBuiltins.matrix_mult);
    register("transpose", linear_algebra_1.linearAlgebraBuiltins.matrix_transpose);
    register("det", linear_algebra_1.linearAlgebraBuiltins.matrix_determinant);
    register("inv", linear_algebra_1.linearAlgebraBuiltins.matrix_inverse_2x2);
    register("shape", linear_algebra_1.linearAlgebraBuiltins.matrix_shape);
    register("reshape", linear_algebra_1.linearAlgebraBuiltins.matrix_reshape);
    // Pandas shortcuts
    register("head", data_processing_1.dataProcessingBuiltins.table_head);
    register("tail", data_processing_1.dataProcessingBuiltins.table_tail);
    register("columns", data_processing_1.dataProcessingBuiltins.table_column_names);
    register("drop_nulls", data_processing_1.dataProcessingBuiltins.table_drop_nulls);
    register("fill_nulls", data_processing_1.dataProcessingBuiltins.table_fill_nulls);
    register("inner_join", data_processing_1.dataProcessingBuiltins.table_join_inner);
    // PyTorch & Neural Network shortcuts
    register("nn_create", ai_training_1.aiTrainingBuiltins.create_neural_network);
    register("nn_train", ai_training_1.aiTrainingBuiltins.train_neural_network);
    register("nn_predict", ai_training_1.aiTrainingBuiltins.predict_neural_network);
    register("load_dataset", ai_training_1.aiTrainingBuiltins.load_ai_dataset);
    register("mse", ai_training_1.aiTrainingBuiltins.mean_squared_error_loss);
    register("mae", ai_training_1.aiTrainingBuiltins.mean_absolute_error_loss);
    register("cross_entropy", ai_training_1.aiTrainingBuiltins.binary_cross_entropy_loss);
    register("log_reg", ai_training_1.aiTrainingBuiltins.train_logistic_regression);
    // Server & Deploy shortcuts
    register("deploy", serverDeployer.deploy_server);
    register("local_ip", serverDeployer.get_local_ip);
    register("public_ip", serverDeployer.get_public_ip);
    // Security shortcuts
    register("hash_sha256", crypto_security_1.cryptoSecurityBuiltins.sha256);
    register("hash_md5", crypto_security_1.cryptoSecurityBuiltins.md5);
    register("uuid", crypto_security_1.cryptoSecurityBuiltins.generate_uuid);
    register("jwt_sign", crypto_security_1.cryptoSecurityBuiltins.create_jwt);
    register("jwt_verify", crypto_security_1.cryptoSecurityBuiltins.verify_jwt);
    // CS Algorithms
    register("sort", algorithms_1.algorithmsBuiltins.quick_sort);
    register("binary_search", algorithms_1.algorithmsBuiltins.binary_search);
    register("bfs", algorithms_1.algorithmsBuiltins.graph_bfs);
    register("dfs", algorithms_1.algorithmsBuiltins.graph_dfs);
    register("dijkstra", algorithms_1.algorithmsBuiltins.graph_dijkstra);
    register("fib", algorithms_1.algorithmsBuiltins.fibonacci_nth);
    // Updater shortcuts
    register("update", updater_1.updaterBuiltins.update_software);
    register("upgrade", updater_1.updaterBuiltins.update_software);
    register("version", updater_1.updaterBuiltins.plain_version);
    return env;
}
//# sourceMappingURL=index.js.map