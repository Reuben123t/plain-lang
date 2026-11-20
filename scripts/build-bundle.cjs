const path = require("node:path");
const { build } = require("esbuild");

build({
  absWorkingDir: path.resolve(__dirname, ".."),
  entryPoints: ["src/cli/cli.ts"],
  outfile: "dist/bundle.js",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
  sourcemap: false,
  logLevel: "info"
}).catch(() => { process.exitCode = 1; });
