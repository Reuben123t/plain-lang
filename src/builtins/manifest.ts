export type BuiltinModuleName =
  | "math" | "geometry" | "stats" | "science" | "student" | "text" | "list" | "time"
  | "system" | "network" | "web" | "data" | "ai" | "automation" | "ai_training"
  | "server" | "linear_algebra" | "crypto" | "cyber" | "tables" | "physics"
  | "algorithms" | "updater" | "file" | "testing" | "io";

export const BUILTIN_MODULES: readonly BuiltinModuleName[] = [
  "math", "geometry", "stats", "science", "student", "text", "list", "time", "system",
  "network", "web", "data", "ai", "automation", "ai_training", "server", "linear_algebra",
  "crypto", "cyber", "tables", "physics", "algorithms", "updater", "file", "testing", "io"
];

export const MODULE_ALIASES: Readonly<Record<string, BuiltinModuleName>> = {
  statistics: "stats", strings: "text", lists: "list", datetime: "time", os: "system",
  datascience: "data", data_science: "data", ml: "ai", neural: "ai_training",
  neural_network: "ai_training", linalg: "linear_algebra", numpy: "linear_algebra",
  security: "crypto", cybersecurity: "cyber", data_processing: "tables",
  engineering: "physics", files: "file", test: "testing"
};

// Existing global collisions are intentional and explicit; module imports retain each implementation.
export const GLOBAL_BUILTIN_OWNERS: Readonly<Record<string, BuiltinModuleName>> = {
  vector_dot: "linear_algebra", vector_magnitude: "linear_algebra", vector_distance: "linear_algebra",
  sigmoid: "ai_training", relu: "ai_training", softmax: "ai_training", train_test_split: "ai_training",
  base64_encode: "text", base64_decode: "text", caesar_cipher: "text", generate_password: "crypto",
  kinetic_energy: "physics", momentum: "physics", work_done: "physics", power_watts: "physics",
  parse_query_string: "server"
};

export interface BuiltinAlias {
  name: string;
  module: BuiltinModuleName;
  target: string;
}

export const BUILTIN_ALIASES: readonly BuiltinAlias[] = [
  { name: "wait", module: "time", target: "sleep" },
  { name: "sqrt", module: "math", target: "square_root" },
  { name: "cbrt", module: "math", target: "cube_root" },
  { name: "pow", module: "math", target: "power" },
  { name: "fact", module: "math", target: "factorial" },
  { name: "abs", module: "math", target: "absolute" },
  { name: "min", module: "math", target: "minimum" },
  { name: "max", module: "math", target: "maximum" },
  { name: "avg", module: "list", target: "average" },
  { name: "mean", module: "list", target: "average" },
  { name: "len", module: "text", target: "length" },
  { name: "size", module: "list", target: "count" },
  { name: "upper", module: "text", target: "uppercase" },
  { name: "lower", module: "text", target: "lowercase" },
  { name: "capitalize", module: "text", target: "title_case" },
  { name: "stdev", module: "stats", target: "standard_deviation" },
  { name: "now", module: "time", target: "current_time" },
  { name: "bar_chart", module: "data", target: "ascii_bar_chart" },
  { name: "histogram", module: "data", target: "ascii_histogram" },
  { name: "exec_shell", module: "automation", target: "run_command" },
  { name: "shell", module: "automation", target: "run_command" },
  { name: "knn", module: "ai", target: "knn_classify" },
  { name: "kmeans", module: "ai", target: "kmeans_cluster" },
  { name: "np_zeros", module: "linear_algebra", target: "matrix_zeros" },
  { name: "zeros", module: "linear_algebra", target: "matrix_zeros" },
  { name: "np_ones", module: "linear_algebra", target: "matrix_ones" },
  { name: "ones", module: "linear_algebra", target: "matrix_ones" },
  { name: "np_eye", module: "linear_algebra", target: "matrix_eye" },
  { name: "eye", module: "linear_algebra", target: "matrix_eye" },
  { name: "np_dot", module: "linear_algebra", target: "vector_dot" },
  { name: "dot", module: "linear_algebra", target: "vector_dot" },
  { name: "matmul", module: "linear_algebra", target: "matrix_mult" },
  { name: "np_matmul", module: "linear_algebra", target: "matrix_mult" },
  { name: "transpose", module: "linear_algebra", target: "matrix_transpose" },
  { name: "det", module: "linear_algebra", target: "matrix_determinant" },
  { name: "inv", module: "linear_algebra", target: "matrix_inverse_2x2" },
  { name: "shape", module: "linear_algebra", target: "matrix_shape" },
  { name: "reshape", module: "linear_algebra", target: "matrix_reshape" },
  { name: "head", module: "tables", target: "table_head" },
  { name: "tail", module: "tables", target: "table_tail" },
  { name: "columns", module: "tables", target: "table_column_names" },
  { name: "drop_nulls", module: "tables", target: "table_drop_nulls" },
  { name: "fill_nulls", module: "tables", target: "table_fill_nulls" },
  { name: "inner_join", module: "tables", target: "table_join_inner" },
  { name: "nn_create", module: "ai_training", target: "create_neural_network" },
  { name: "nn_train", module: "ai_training", target: "train_neural_network" },
  { name: "nn_predict", module: "ai_training", target: "predict_neural_network" },
  { name: "load_dataset", module: "ai_training", target: "load_ai_dataset" },
  { name: "mse", module: "ai_training", target: "mean_squared_error_loss" },
  { name: "mae", module: "ai_training", target: "mean_absolute_error_loss" },
  { name: "cross_entropy", module: "ai_training", target: "binary_cross_entropy_loss" },
  { name: "log_reg", module: "ai_training", target: "train_logistic_regression" },
  { name: "deploy", module: "server", target: "deploy_server" },
  { name: "local_ip", module: "server", target: "get_local_ip" },
  { name: "public_ip", module: "server", target: "get_public_ip" },
  { name: "hash_sha256", module: "crypto", target: "sha256" },
  { name: "hash_md5", module: "crypto", target: "md5" },
  { name: "uuid", module: "crypto", target: "generate_uuid" },
  { name: "jwt_sign", module: "crypto", target: "create_jwt" },
  { name: "jwt_verify", module: "crypto", target: "verify_jwt" },
  { name: "scan", module: "cyber", target: "port_scan" },
  { name: "audit", module: "cyber", target: "audit_security_headers" },
  { name: "sqli_check", module: "cyber", target: "detect_sql_injection" },
  { name: "xss_check", module: "cyber", target: "detect_xss" },
  { name: "entropy", module: "cyber", target: "calculate_entropy" },
  { name: "magic_bytes", module: "cyber", target: "detect_file_signature" },
  { name: "cve", module: "cyber", target: "cve_lookup" },
  { name: "pwd_strength", module: "cyber", target: "check_password_strength" },
  { name: "subnet", module: "cyber", target: "subnet_calculator" },
  { name: "ping", module: "cyber", target: "ping_host" },
  { name: "banner_grab_host", module: "cyber", target: "banner_grab" },
  { name: "fib", module: "algorithms", target: "fibonacci_nth" },
  { name: "update", module: "updater", target: "update_software" },
  { name: "upgrade", module: "updater", target: "update_software" },
  { name: "version", module: "updater", target: "plain_version" }
];

export const BROWSER_MODULES: readonly BuiltinModuleName[] = [
  "math", "geometry", "stats", "science", "student", "text", "list", "time", "ai_training",
  "linear_algebra", "tables", "physics", "algorithms", "testing", "io"
];

export function canonicalModuleName(name: string): BuiltinModuleName | undefined {
  const normalized = name.toLowerCase();
  if ((BUILTIN_MODULES as readonly string[]).includes(normalized)) return normalized as BuiltinModuleName;
  return Object.prototype.hasOwnProperty.call(MODULE_ALIASES, normalized) ? MODULE_ALIASES[normalized] : undefined;
}

export function builtinNameVariants(name: string): string[] {
  const variants = [name];
  if (name.includes("_")) {
    variants.push(name.replace(/_/g, " "));
    variants.push(name.replace(/_([a-z0-9])/g, (_, character: string) => character.toUpperCase()));
  }
  return [...new Set(variants)];
}
