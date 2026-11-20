const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "website");
const portIndex = process.argv.indexOf("--port");
const port = portIndex === -1 ? 4173 : Number(process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Use --port with an integer between 0 and 65535.");
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end();
    return;
  }
  try {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
    if (relative.includes("\\") || relative.split("/").some((part) => part === ".." || part.startsWith("."))) throw new Error("Invalid path");
    const filename = path.resolve(root, relative);
    const real = fs.realpathSync(filename);
    const within = path.relative(root, real);
    if (within.startsWith("..") || path.isAbsolute(within) || !fs.statSync(real).isFile()) throw new Error("Not found");
    res.writeHead(200, { "Content-Type": mime[path.extname(real)] || "application/octet-stream", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    if (req.method === "HEAD") res.end();
    else fs.createReadStream(real).on("error", () => res.destroy()).pipe(res);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});
server.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
server.listen(port, "127.0.0.1", () => {
  console.log(`PLAIN preview: http://127.0.0.1:${server.address().port}/`);
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close());
