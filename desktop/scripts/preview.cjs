const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const root = path.resolve(__dirname, "../dist/renderer");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".ttf": "font/ttf" };
const server = http.createServer(async (req, res) => {
  try {
    const relative = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/+/, "") || "index.html";
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404).end("Not found"); }
});
server.listen(Number(process.env.PORT || 4317), "127.0.0.1", () => console.log(`Preview: http://127.0.0.1:${server.address().port}`));
