const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const npmCli = process.env.npm_execpath;
if (!npmCli || !fs.existsSync(npmCli)) throw new Error("Run this check with npm run test:package.");
function npm(args, cwd) {
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd, encoding: "utf8", timeout: 120000,
    env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" }
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
function cli(entry, args, cwd) {
  const result = spawnSync(process.execPath, [entry, ...args], { cwd, encoding: "utf8", timeout: 20000 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "plain-package-"));
try {
  const archives = path.join(temporary, "archives");
  const prefix = path.join(temporary, "install");
  const workspace = path.join(temporary, "workspace");
  for (const directory of [archives, prefix, workspace]) fs.mkdirSync(directory);
  const [packed] = JSON.parse(npm(["pack", "--ignore-scripts", "--json", "--pack-destination", archives], root));
  assert.ok(packed.unpackedSize < 12 * 1024 * 1024, `Package too large: ${packed.unpackedSize} bytes`);
  const names = packed.files.map((file) => file.path);
  for (const required of ["bin/plain.js", "dist/index.js", "dist/cli/cli.js", "dist/web/execution-worker.js", "website/index.html", "website/assets/app.js", "website/assets/worker.js", "LICENSE"]) {
    assert.ok(names.includes(required), `Missing package entry ${required}`);
  }
  const unwanted = names.filter((name) => /(?:^|\/)(?:node_modules|\.git|\.zcode|\.vercel|build_assets)(?:\/|$)/.test(name) || /\.(?:exe|zip|vsix|map|dat|blob)$/.test(name));
  assert.deepEqual(unwanted, [], "Package contains development state or legacy binary artifacts.");
  fs.writeFileSync(path.join(prefix, "package.json"), JSON.stringify({ private: true, name: "plain-install-smoke", version: "1.0.0" }));
  npm(["install", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false", "--offline", path.join(archives, packed.filename)], prefix);
  const entry = path.join(prefix, "node_modules", "plain-lang", "bin", "plain.js");
  assert.match(cli(entry, ["--version"], workspace), /PLAIN/);
  assert.match(cli(entry, ["eval", 'say "package-ready"'], workspace), /package-ready/);
  fs.writeFileSync(path.join(workspace, "hello.plain"), 'say "hello from tarball"\n');
  assert.match(cli(entry, ["run", "hello.plain"], workspace), /hello from tarball/);
  cli(entry, ["check", "hello.plain", "--json"], workspace);
  cli(entry, ["init", "starter"], workspace);
  cli(entry, ["test"], path.join(workspace, "starter"));
  console.log(`Package smoke test passed: ${names.length} files, ${(packed.unpackedSize / 1024 / 1024).toFixed(2)} MiB unpacked; offline clean install and CLI verified.`);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
