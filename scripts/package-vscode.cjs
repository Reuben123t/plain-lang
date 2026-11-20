const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const extension = path.join(root, "editors", "vscode");
const manifest = JSON.parse(fs.readFileSync(path.join(extension, "package.json"), "utf8"));
const artifacts = path.join(root, ".artifacts");
fs.mkdirSync(artifacts, { recursive: true });
const output = path.join(artifacts, `${manifest.name}-${manifest.version}.vsix`);
const entry = require.resolve("@vscode/vsce/vsce");
const result = spawnSync(process.execPath, [entry, "package", "--no-dependencies", "--out", output], {
  cwd: extension, stdio: "inherit"
});
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
