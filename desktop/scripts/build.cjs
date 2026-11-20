const fs = require("node:fs/promises");
const path = require("node:path");
const { build } = require("esbuild");
const createIcons = require("./icons.cjs");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "dist");

async function main() {
  await fs.mkdir(path.join(out, "renderer"), { recursive: true });
  const common = { bundle: true, sourcemap: true, minify: true, logLevel: "info", absWorkingDir: root };
  await Promise.all([
    build({ ...common, entryPoints: ["src/main/index.ts"], outfile: "dist/main.cjs", platform: "node", target: "node22", external: ["electron"] }),
    build({ ...common, entryPoints: ["src/preload/index.ts"], outfile: "dist/preload.cjs", platform: "node", target: "node22", external: ["electron"] }),
    build({ ...common, entryPoints: ["src/main/execution-child.ts"], outfile: "dist/execution-child.cjs", platform: "node", target: "node22", external: ["electron"] }),
    build({ ...common, entryPoints: ["src/renderer/index.ts"], outfile: "dist/renderer/app.js", platform: "browser", target: "chrome140", format: "iife", loader: { ".ttf": "file" }, assetNames: "assets/[name]-[hash]" }),
    build({ ...common, entryPoints: ["src/renderer/analysis-worker.ts"], outfile: "dist/renderer/analysis-worker.js", platform: "browser", target: "chrome140", format: "iife" }),
    build({ ...common, entryPoints: ["node_modules/monaco-editor/esm/vs/editor/editor.worker.js"], outfile: "dist/renderer/editor.worker.js", platform: "browser", target: "chrome140", format: "iife" })
  ]);
  await Promise.all([
    fs.copyFile(path.join(root, "src/renderer/index.html"), path.join(out, "renderer/index.html")),
    fs.copyFile(path.join(root, "../assets/plain-logo.svg"), path.join(out, "renderer/plain-logo.svg")),
    fs.copyFile(path.join(root, "../LICENSE"), path.join(out, "LICENSE")),
    fs.copyFile(path.join(root, "node_modules/monaco-editor/LICENSE"), path.join(out, "MONACO-LICENSE")),
    fs.copyFile(path.join(root, "node_modules/dompurify/LICENSE"), path.join(out, "DOMPURIFY-LICENSE")),
    createIcons(root)
  ]);
  console.log("Plain Desktop built. Run npm run dev or npm run package:dir in desktop/.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
