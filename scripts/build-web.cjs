const fs = require("node:fs");
const path = require("node:path");
const { build } = require("esbuild");

const root = path.resolve(__dirname, "..");
async function main() {
  const result = await build({
    absWorkingDir: root,
    entryPoints: { app: "src/browser/main.ts", worker: "src/browser/worker.ts" },
    outdir: "website/assets",
    bundle: true,
    platform: "browser",
    format: "esm",
    target: "es2022",
    plugins: [{
      name: "plain-browser-runtime",
      setup(build) {
        build.onResolve({ filter: /^\.\.\/builtins$/ }, (args) =>
          args.importer.endsWith(`${path.sep}runtime${path.sep}interpreter.ts`)
            ? { path: path.join(root, "src", "builtins", "browser.ts") }
            : undefined);
      }
    }],
    alias: {
      fs: path.join(root, "src", "browser", "shims", "fs.ts"),
      path: path.join(root, "src", "browser", "shims", "path.ts"),
      readline: path.join(root, "src", "browser", "shims", "readline.ts"),
      async_hooks: path.join(root, "src", "browser", "shims", "async_hooks.ts")
    },
    minify: true,
    sourcemap: false,
    metafile: true,
    logLevel: "info"
  });
  const forbidden = Object.keys(result.metafile.inputs).filter((name) => /(?:^|\/)(?:setup|cli|web)\//.test(name) || /builtins\/(?:automation|network|cyber_security|updater|file)\.ts$/.test(name));
  if (forbidden.length) throw new Error(`Host-only code entered the browser build: ${forbidden.join(", ")}`);
  const source = fs.readFileSync(path.join(root, "website", "index.html"), "utf8");
  const rewrites = [["index.html", "website/assets/"], ["docs/index.html", "../website/assets/"]];
  for (const [filename, assetPrefix] of rewrites) {
    const html = "<!-- Generated from website/index.html by npm run build:web. -->\n" +
      source.replaceAll("./assets/", assetPrefix).replace("</body>", `  <script type="module" src="${assetPrefix}app.js"></script>\n</body>`);
    fs.writeFileSync(path.join(root, filename), html);
  }
  const bytes = Object.values(result.metafile.outputs).reduce((sum, entry) => sum + entry.bytes, 0);
  if (bytes > 2 * 1024 * 1024) throw new Error(`Browser bundle size exceeded 2 MiB (${bytes} bytes).`);
  console.log(`Browser assets: ${(bytes / 1024).toFixed(1)} KiB; deployment entry points synchronized.`);
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
