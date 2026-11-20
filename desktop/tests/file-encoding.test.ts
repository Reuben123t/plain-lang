import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { FileAccess } from "../src/main/files";

test("native file reads preserve UTF-8 BOM and reject binary or invalid UTF-8 without writing", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "plain-encoding-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const access = new FileAccess();
  const file = path.join(root, "café.plain");
  const source = '\uFEFFsay "héllo 🌿"\r\n';
  await fs.writeFile(file, source);
  const granted = await access.grantFile(file);
  assert.equal((await access.read(granted)).content, source);
  const invalid = Buffer.from([0xff, 0xfe, 0x41, 0]);
  await fs.writeFile(file, invalid);
  await assert.rejects(access.read(granted), /not valid UTF-8/);
  assert.deepEqual(await fs.readFile(file), invalid);
  await fs.writeFile(file, Buffer.from([0x61, 0, 0x62]));
  await assert.rejects(access.read(granted), /binary file/);
});
