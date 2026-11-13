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
import { aiTrainingBuiltins } from "./ai_training";
import { createServerDeployer } from "./server_deploy";
import { linearAlgebraBuiltins } from "./linear_algebra";
import { cryptoSecurityBuiltins } from "./crypto_security";
import { dataProcessingBuiltins } from "./data_processing";
import { engineeringPhysicsBuiltins } from "./engineering_physics";
import { algorithmsBuiltins } from "./algorithms";
import { updaterBuiltins } from "./updater";
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

  // Helper to register canonical, natural English space alias, and optional camelCase
  const registerModule = (moduleObj: Record<string, (...args: any[]) => any>) => {
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
  registerModule(mathBuiltins);

  // 2. Geometry Builtins
  registerModule(geometryBuiltins);

  // 3. Statistics Builtins
  registerModule(statsBuiltins);

  // 4. Science Builtins
  registerModule(scienceBuiltins);

  // 5. Student & Units Builtins
  registerModule(studentBuiltins);

  // 6. Text Builtins
  registerModule(textBuiltins);

  // 7. List Builtins
  registerModule(listBuiltins);

  // 8. Time Builtins
  registerModule(timeBuiltins);

  // 9. System & Game Builtins
  registerModule(systemBuiltins);

  // 10. Network Builtins
  registerModule(networkBuiltins);

  // 11. Web Development Builtins
  const webBuiltins = createWebBuiltins({ invokeFunction: options?.invokeFunction });
  registerModule(webBuiltins);

  // 12. Data Science Builtins
  registerModule(datascienceBuiltins);

  // 13. Artificial Intelligence & Machine Learning
  registerModule(aiBuiltins);

  // 14. Task Automation Builtins
  registerModule(automationBuiltins);

  // 15. AI Training & Deep Learning
  registerModule(aiTrainingBuiltins);

  // 16. Server Deployment & Network Discovery
  const serverDeployer = createServerDeployer({ invokeFunction: options?.invokeFunction });
  registerModule(serverDeployer);

  // 17. Linear Algebra & Matrices
  registerModule(linearAlgebraBuiltins);

  // 18. Crypto & Security
  registerModule(cryptoSecurityBuiltins);

  // 19. Data Processing & DataFrames
  registerModule(dataProcessingBuiltins);

  // 20. Engineering, Physics & Relativity
  registerModule(engineeringPhysicsBuiltins);

  // 21. Computer Science Algorithms
  registerModule(algorithmsBuiltins);

  // 22. Updater & Software Maintenance
  registerModule(updaterBuiltins);

  // 23. File System Operations
  const fileOperations: Record<string, (...args: any[]) => any> = {
    read_file: (path: string) => fileSandbox.readFile(path),
    write_file: (path: string, content: string) => fileSandbox.writeFile(path, content),
    append_file: (path: string, content: string) => fileSandbox.appendFile(path, content),
    file_exists: (path: string) => fileSandbox.fileExists(path),
    delete_file: (path: string) => fileSandbox.deleteFile(path),
    list_files: (dir: string) => fileSandbox.listFiles(dir),
    file_size: (path: string) => fileSandbox.fileSize(path),
    create_folder: (dir: string) => fileSandbox.createFolder(dir),
    folder_exists: (dir: string) => fileSandbox.folderExists(dir)
  };
  registerModule(fileOperations);

  // 24. Python, NumPy, SciPy & PyTorch Shorthand Aliases
  register("print", (val: any) => (options?.onSay ? options.onSay(plainToString(val)) : console.log(plainToString(val))));
  register("wait", (sec: any) => timeBuiltins.sleep(sec));
  register("sleep", (sec: any) => timeBuiltins.sleep(sec));
  register("sqrt", mathBuiltins.square_root);
  register("cbrt", mathBuiltins.cube_root);
  register("pow", mathBuiltins.power);
  register("fact", mathBuiltins.factorial);
  register("abs", mathBuiltins.absolute);
  register("min", mathBuiltins.minimum);
  register("max", mathBuiltins.maximum);
  register("avg", listBuiltins.average);
  register("mean", listBuiltins.average);
  register("median", statsBuiltins.median);
  register("mode", statsBuiltins.mode);
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

  // NumPy & Matrix shortcuts
  register("np_zeros", linearAlgebraBuiltins.matrix_zeros);
  register("zeros", linearAlgebraBuiltins.matrix_zeros);
  register("np_ones", linearAlgebraBuiltins.matrix_ones);
  register("ones", linearAlgebraBuiltins.matrix_ones);
  register("np_eye", linearAlgebraBuiltins.matrix_eye);
  register("eye", linearAlgebraBuiltins.matrix_eye);
  register("np_dot", linearAlgebraBuiltins.vector_dot);
  register("dot", linearAlgebraBuiltins.vector_dot);
  register("matmul", linearAlgebraBuiltins.matrix_mult);
  register("np_matmul", linearAlgebraBuiltins.matrix_mult);
  register("transpose", linearAlgebraBuiltins.matrix_transpose);
  register("det", linearAlgebraBuiltins.matrix_determinant);
  register("inv", linearAlgebraBuiltins.matrix_inverse_2x2);
  register("shape", linearAlgebraBuiltins.matrix_shape);
  register("reshape", linearAlgebraBuiltins.matrix_reshape);

  // Pandas shortcuts
  register("head", dataProcessingBuiltins.table_head);
  register("tail", dataProcessingBuiltins.table_tail);
  register("columns", dataProcessingBuiltins.table_column_names);
  register("drop_nulls", dataProcessingBuiltins.table_drop_nulls);
  register("fill_nulls", dataProcessingBuiltins.table_fill_nulls);
  register("inner_join", dataProcessingBuiltins.table_join_inner);

  // PyTorch & Neural Network shortcuts
  register("nn_create", aiTrainingBuiltins.create_neural_network);
  register("nn_train", aiTrainingBuiltins.train_neural_network);
  register("nn_predict", aiTrainingBuiltins.predict_neural_network);
  register("load_dataset", aiTrainingBuiltins.load_ai_dataset);
  register("mse", aiTrainingBuiltins.mean_squared_error_loss);
  register("mae", aiTrainingBuiltins.mean_absolute_error_loss);
  register("cross_entropy", aiTrainingBuiltins.binary_cross_entropy_loss);
  register("log_reg", aiTrainingBuiltins.train_logistic_regression);

  // Server & Deploy shortcuts
  register("deploy", serverDeployer.deploy_server);
  register("local_ip", serverDeployer.get_local_ip);
  register("public_ip", serverDeployer.get_public_ip);

  // Security shortcuts
  register("hash_sha256", cryptoSecurityBuiltins.sha256);
  register("hash_md5", cryptoSecurityBuiltins.md5);
  register("uuid", cryptoSecurityBuiltins.generate_uuid);
  register("jwt_sign", cryptoSecurityBuiltins.create_jwt);
  register("jwt_verify", cryptoSecurityBuiltins.verify_jwt);

  // CS Algorithms
  register("sort", algorithmsBuiltins.quick_sort);
  register("binary_search", algorithmsBuiltins.binary_search);
  register("bfs", algorithmsBuiltins.graph_bfs);
  register("dfs", algorithmsBuiltins.graph_dfs);
  register("dijkstra", algorithmsBuiltins.graph_dijkstra);
  register("fib", algorithmsBuiltins.fibonacci_nth);

  // Updater shortcuts
  register("update", updaterBuiltins.update_software);
  register("upgrade", updaterBuiltins.update_software);
  register("version", updaterBuiltins.plain_version);

  return env;
}
