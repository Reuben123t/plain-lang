const { readdirSync } = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
function collect(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? collect(filename) : filename.endsWith(".test.ts") ? [filename] : [];
  });
}
const files = collect(path.join(root, "tests")).sort();
const result = spawnSync(process.execPath, ["--test", "--import", "tsx", ...process.argv.slice(2), ...files], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, PLAIN_NO_UPDATE_CHECK: "1" }
});
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
