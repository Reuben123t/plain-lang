const path = require("node:path");
const { build } = require("esbuild");

const root = path.resolve(__dirname, "..");
build({
  absWorkingDir: root,
  entryPoints: ["editors/vscode/src/extension.ts"],
  outfile: "editors/vscode/dist/extension.js",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  external: ["vscode"],
  sourcemap: false,
  logLevel: "info"
}).catch(() => { process.exitCode = 1; });
