const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
require("tsx/cjs");
const { BUILTIN_ALIASES, BROWSER_MODULES, builtinNameVariants } = require("../src/builtins/manifest.ts");

const root = path.resolve(__dirname, "..");
const sources = [
  ["math", "math.ts", "mathBuiltins"], ["geometry", "geometry.ts", "geometryBuiltins"],
  ["stats", "stats.ts", "statsBuiltins"], ["science", "science.ts", "scienceBuiltins"],
  ["student", "student.ts", "studentBuiltins"], ["text", "text.ts", "textBuiltins"],
  ["list", "list.ts", "listBuiltins"], ["time", "time.ts", "timeBuiltins"],
  ["system", "system.ts", "systemBuiltins"], ["network", "network.ts", "networkBuiltins"],
  ["web", "web.ts", "createWebBuiltins"], ["data", "datascience.ts", "datascienceBuiltins"],
  ["ai", "ai.ts", "aiBuiltins"], ["automation", "automation.ts", "automationBuiltins"],
  ["ai_training", "ai_training.ts", "aiTrainingBuiltins"], ["server", "server_deploy.ts", "createServerDeployer"],
  ["linear_algebra", "linear_algebra.ts", "linearAlgebraBuiltins"], ["crypto", "crypto_security.ts", "cryptoSecurityBuiltins"],
  ["cyber", "cyber_security.ts", "cyberSecurityBuiltins"], ["tables", "data_processing.ts", "dataProcessingBuiltins"],
  ["physics", "engineering_physics.ts", "engineeringPhysicsBuiltins"], ["algorithms", "algorithms.ts", "algorithmsBuiltins"],
  ["updater", "updater.ts", "updaterBuiltins"], ["testing", "testing.ts", "testingBuiltins"],
  ["io", "registry.ts", "createIoBuiltins"]
];
const descriptions = {
  to_number: "Convert a number or numeric text to a number; reject nonnumeric input.",
  str: "Convert a PLAIN value to readable text.", type: "Return a value's runtime type name.",
  length: "Count characters in text or elements in a list.", count: "Count the elements of a list.",
  item_of: "Read a list item using PLAIN's English-style one-based indexing.",
  square_root: "Return the nonnegative square root of a number.",
  sine: "Return the sine of an angle in degrees.", cosine: "Return the cosine of an angle in degrees.",
  tangent: "Return the tangent of an angle in degrees.",
  range_list: "Create an inclusive numeric range with an optional step.",
  sleep: "Pause execution for a number of seconds.",
  create_neural_network: "Create a small fully connected neural network from layer widths and an activation name.",
  train_neural_network: "Train using a dataset with inputs/targets or records with input/output; return loss history.",
  predict_neural_network: "Run a network on one input vector and return its prediction vector.",
  load_ai_dataset: "Load an independent copy of a small bundled learning dataset.",
  deploy_server: "Start a local HTTP server; pass an explicit bind address for LAN access.",
  start_server: "Start an HTTP server that invokes a PLAIN request handler.",
  args: "Return a copy of the script arguments supplied after --.",
  print: "Write a value using the host's output callback.",
  assert: "Fail the current program when the condition is false.",
  assert_equal: "Require two values to be deeply equal, including lists and dictionaries.",
  assert_not_equal: "Require two values to differ.",
  base64_encode: "Encode UTF-8 text as Base64.", base64_decode: "Decode Base64 into UTF-8 text.",
  read_file: "Read UTF-8 text from a file inside the project directory.",
  write_file: "Write UTF-8 text inside the project directory, creating parent directories as needed.",
  checksum_file: "Hash the bytes of a project file; defaults to SHA-256.",
  port_scan: "Check selected TCP ports on a host you own or have permission to test (local runtime only).",
  audit_security_headers: "Inspect response headers for a URL you are authorized to assess (local runtime only)."
};

function findObject(source, symbol) {
  let object;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === symbol && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
      object = node.initializer;
    }
    if (ts.isFunctionDeclaration(node) && node.name?.text === symbol && node.body) {
      const returned = node.body.statements.find((statement) => ts.isReturnStatement(statement) && statement.expression && ts.isObjectLiteralExpression(statement.expression));
      if (returned) object = returned.expression;
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (!object) throw new Error(`Cannot locate metadata source ${symbol}.`);
  return object;
}

function parametersOf(fn, source) {
  return fn.parameters.map((parameter) => {
    const raw = parameter.name.getText(source);
    const cleaned = raw.replace(/Val$/, "").replace(/Obj$/, "");
    const prefix = parameter.dotDotDotToken ? "..." : "";
    const suffix = parameter.questionToken || parameter.initializer ? "?" : "";
    return prefix + cleaned + suffix;
  });
}

const entries = [];
for (const [module, filename, symbol] of sources) {
  const source = ts.createSourceFile(filename, fs.readFileSync(path.join(root, "src", "builtins", filename), "utf8"), ts.ScriptTarget.Latest, true);
  const object = findObject(source, symbol);
  for (const property of object.properties) {
    const name = property.name?.getText(source).replace(/^["']|["']$/g, "");
    const fn = ts.isMethodDeclaration(property) ? property : property.initializer;
    if (!name || !fn || (!ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn) && !ts.isMethodDeclaration(fn))) continue;
    const parameters = parametersOf(fn, source);
    const aliases = builtinNameVariants(name).slice(1);
    aliases.push(...BUILTIN_ALIASES.filter((alias) => alias.module === module && alias.target === name).map((alias) => alias.name));
    entries.push({
      name, aliases: [...new Set(aliases)], module, parameters,
      signature: `${name}(${parameters.join(", ")})`,
      description: descriptions[name] || `${name.replace(/_/g, " ")} — ${module.replace(/_/g, " ")} standard library.`,
      browserSafe: BROWSER_MODULES.includes(module)
    });
  }
}
const files = {
  read_file: ["path"], write_file: ["path", "content"], append_file: ["path", "content"],
  file_exists: ["path"], delete_file: ["path"], list_files: ["directory?"], file_size: ["path"],
  create_folder: ["directory"], folder_exists: ["directory"]
};
for (const [name, parameters] of Object.entries(files)) {
  entries.push({ name, aliases: builtinNameVariants(name).slice(1), module: "file", parameters,
    signature: `${name}(${parameters.join(", ")})`, description: descriptions[name] || `${name.replace(/_/g, " ")} inside the project directory.`, browserSafe: false });
}
entries.sort((a, b) => a.module.localeCompare(b.module, "en") || a.name.localeCompare(b.name, "en"));
const output = `// Generated by scripts/generate-catalog.cjs from the standard library. Do not edit by hand.\nexport const catalogData = ${JSON.stringify(entries, null, 2)};\n`;
const markdown = [
  "# PLAIN standard library", "", "Generated from the checked-in function signatures. Run `npm run generate:catalog` after changing the library.", "",
  `${entries.length} module-qualified function definitions; aliases are listed separately and are not counted as additional implementations.`, "",
  "Function names are case-insensitive. Use canonical snake_case names or listed identifier aliases. Space-separated aliases remain compatibility names; not every space spelling is supported by the parser.", "",
  "**Browser** entries run in the browser profile. **Node** entries require trusted local execution; filesystem helpers stay within the project, but shell/network APIs are not an OS security sandbox.", ""
];
for (const module of [...new Set(entries.map((entry) => entry.module))]) {
  markdown.push(`## ${module}`, "", "| Function | Host | Description | Aliases |", "| --- | --- | --- | --- |");
  for (const entry of entries.filter((candidate) => candidate.module === module)) {
    const aliases = entry.aliases.filter((alias) => !alias.includes(" ")).map((alias) => `\`${alias}\``).join(", ") || "—";
    markdown.push(`| \`${entry.signature}\` | ${entry.browserSafe ? "Browser / Node" : "Node"} | ${entry.description.replace(/\|/g, "\\|")} | ${aliases} |`);
  }
  markdown.push("");
}
const outputs = [[path.join(root, "src", "tooling", "catalog-data.ts"), output], [path.join(root, "docs", "standard-library.md"), markdown.join("\n")]];
let stale = false;
for (const [filename, content] of outputs) {
  if (process.argv.includes("--check")) {
    if (!fs.existsSync(filename) || fs.readFileSync(filename, "utf8") !== content) {
      console.error(`Generated metadata is stale: ${path.relative(root, filename)}`);
      stale = true;
    }
  } else {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, content);
  }
}
if (stale) process.exitCode = 1;
else console.log(`Validated ${entries.length} module-qualified built-ins (${entries.filter((entry) => entry.browserSafe).length} browser-safe definitions).`);
