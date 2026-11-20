import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { build } from "esbuild";
import { DesktopHost } from "../src/main/host";

test("saved files resolve sibling imports from their own directory and preserve argument arrays", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "plain-imports-"));
  t.after(() => fs.rm(root, { recursive: true, force: true, maxRetries: 3 }));
  const project = path.join(root, "workspace");
  const nested = path.join(project, "nested café");
  await fs.mkdir(nested, { recursive: true });
  await fs.writeFile(path.join(nested, "helpers.plain"), 'def greeting():\nreturn "sibling module"\nend\n');
  const filename = path.join(nested, "main.plain");
  const code = 'import "./helpers.plain" as helpers\nsay helpers.greeting()\nsay args()[0]\n';
  await fs.writeFile(filename, code);
  const childFile = path.join(root, "child.cjs");
  await build({ entryPoints: [path.resolve(__dirname, "../src/main/execution-child.ts")], outfile: childFile, platform: "node", target: "node22", bundle: true, logLevel: "silent" });
  const host = new DesktopHost({ userData: path.join(root, "profile"), version: "test", platform: process.platform, childFile, examples: [], initialFiles: [filename], dialogs: { openFiles: async () => undefined, openFolder: async () => project, saveFile: async () => undefined, confirmClose: async () => "cancel", trust: async () => true } });
  await host.initialize(); t.after(() => host.close());
  const workspace = await host.openFolder();
  const started = await host.startRun({ filename, workspace, code, args: ["spaces ; are values"] });
  const completed = await host.execution.get(started!.id).finished;
  assert.equal(completed.status, "completed", completed.error?.formatted);
  assert.equal(completed.output, "sibling module\nspaces ; are values\n");
});
