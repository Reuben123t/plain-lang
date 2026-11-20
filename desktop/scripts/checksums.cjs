const fs = require("node:fs/promises");
const path = require("node:path");
const { createHash } = require("node:crypto");
const root = path.resolve(__dirname, process.argv[2] || "../release");
(async () => {
  const files = (await fs.readdir(root, { withFileTypes: true })).filter((file) => file.isFile() && /\.(exe|zip|dmg|AppImage|deb)$/.test(file.name));
  const lines = [];
  for (const file of files.sort((a, b) => a.name.localeCompare(b.name))) {
    const hash = createHash("sha256").update(await fs.readFile(path.join(root, file.name))).digest("hex");
    lines.push(`${hash}  ${file.name}`);
  }
  if (!lines.length) throw new Error("No distributable artifacts found. Build a native candidate first.");
  await fs.writeFile(path.join(root, "SHA256SUMS"), lines.join("\n") + "\n");
  console.log(`Checksummed ${lines.length} artifacts.`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
