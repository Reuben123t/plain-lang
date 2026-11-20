const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

(async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "plain-studio-smoke-"));
  const executable = process.argv[2] || require("electron");
  const args = process.argv[2] ? ["--smoke-test"] : [path.resolve(__dirname, ".."), "--smoke-test"];
  const env = { ...process.env, PLAIN_DESKTOP_SMOKE_DIR: directory };
  delete env.ELECTRON_RUN_AS_NODE;
  try {
    await new Promise((resolve, reject) => {
      const child = spawn(executable, args, { env, stdio: ["ignore", "pipe", "pipe"] });
      let output = "";
      child.stdout.on("data", (data) => { output += data; process.stdout.write(data); });
      child.stderr.on("data", (data) => process.stderr.write(data));
      const timer = setTimeout(() => { child.kill(); reject(new Error("Native smoke did not exit within 40 seconds.")); }, 40_000);
      child.once("error", (error) => { clearTimeout(timer); reject(error); });
      child.once("close", (code) => { clearTimeout(timer); code === 0 && output.includes("PLAIN_DESKTOP_SMOKE_OK") ? resolve() : reject(new Error(`Native smoke failed (${code}).`)); });
    });
  } finally { await fs.rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
