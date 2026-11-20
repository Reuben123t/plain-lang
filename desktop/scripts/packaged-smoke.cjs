const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");

(async () => {
  const root = path.resolve(__dirname, "..");
  const release = path.join(root, "release");
  let executable;
  if (process.platform === "win32") executable = path.join(release, "win-unpacked/Plain Studio.exe");
  else if (process.platform === "linux") executable = path.join(release, "linux-unpacked/plain-studio");
  else {
    const directory = (await fs.readdir(release, { withFileTypes: true })).find((entry) => entry.isDirectory() && /^mac(?:-arm64)?$/.test(entry.name));
    if (!directory) throw new Error("No native macOS application directory was packaged.");
    executable = path.join(release, directory.name, "Plain Studio.app/Contents/MacOS/Plain Studio");
  }
  await fs.access(executable);
  // The dedicated smoke runner checks renderer readiness and removes its isolated profile after exit.
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, "smoke.cjs"), executable], { cwd: root, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Packaged startup failed (${code}).`)));
  });
})().catch((error) => { console.error(error); process.exitCode = 1; });
