import * as http from "http";
import * as url from "url";
import * as fs from "fs";
import * as path from "path";
import { PlainValue, plainToString, isPlainFunction, PlainFunction } from "../runtime/values";
import { PlainError } from "../errors/plain-error";

let activeServer: http.Server | null = null;

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon"
};

export interface WebContext {
  invokeFunction?: (fn: PlainFunction, args: PlainValue[]) => Promise<PlainValue>;
}

export function createWebBuiltins(context?: WebContext) {
  return {
    start_server: async (
      portVal: PlainValue,
      handlerVal: PlainValue
    ): Promise<string> => {
      const port = typeof portVal === "number" ? portVal : parseInt(plainToString(portVal), 10) || 3000;

      if (activeServer) {
        try {
          activeServer.close();
        } catch {
          // ignore
        }
        activeServer = null;
      }

      return new Promise((resolve, reject) => {
        const server = http.createServer(async (req, res) => {
          const parsedUrl = url.parse(req.url || "/", true);
          const reqPath = parsedUrl.pathname || "/";
          const method = req.method || "GET";
          const query = JSON.stringify(parsedUrl.query || {});

          // Read body if POST / PUT
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });

          req.on("end", async () => {
            try {
              let responseBody = "OK";
              let statusCode = 200;
              let contentType = "text/html; charset=utf-8";

              if (isPlainFunction(handlerVal) && context?.invokeFunction) {
                const handlerResult = await context.invokeFunction(handlerVal, [
                  method,
                  reqPath,
                  query,
                  body
                ]);

                if (typeof handlerResult === "string") {
                  responseBody = handlerResult;
                  if (responseBody.trim().startsWith("<")) {
                    contentType = "text/html; charset=utf-8";
                  } else if (responseBody.trim().startsWith("{") || responseBody.trim().startsWith("[")) {
                    contentType = "application/json; charset=utf-8";
                  } else {
                    contentType = "text/plain; charset=utf-8";
                  }
                } else if (handlerResult !== null && handlerResult !== undefined) {
                  responseBody = JSON.stringify(handlerResult, null, 2);
                  contentType = "application/json; charset=utf-8";
                }
              } else if (typeof handlerVal === "string") {
                responseBody = handlerVal;
              }

              res.writeHead(statusCode, { "Content-Type": contentType });
              res.end(responseBody);
            } catch (err: any) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Internal Server Error: " + err.message);
            }
          });
        });

        server.on("error", (err) => {
          reject(new PlainError(`Failed to start server on port ${port}: ${err.message}`, { line: 1, column: 1 }, { kind: "RuntimeError" }));
        });

        server.listen(port, () => {
          activeServer = server;
          resolve(`Server running at http://localhost:${port}/`);
        });
      });
    },

    stop_server: (): string => {
      if (activeServer) {
        activeServer.close();
        activeServer = null;
        return "Server stopped.";
      }
      return "No active server to stop.";
    },

    serve_static_files: async (portVal: PlainValue, folderVal: PlainValue): Promise<string> => {
      const port = typeof portVal === "number" ? portVal : parseInt(plainToString(portVal), 10) || 3000;
      const baseDir = path.resolve(plainToString(folderVal));

      if (activeServer) {
        activeServer.close();
        activeServer = null;
      }

      return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
          const parsed = url.parse(req.url || "/", true);
          let safePath = path.normalize(parsed.pathname || "/").replace(/^(\.\.[\/\\])+/, "");
          if (safePath === "/" || safePath === "") safePath = "/index.html";

          const filePath = path.join(baseDir, safePath);
          if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Not Found: " + safePath);
            return;
          }

          const ext = path.extname(filePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || "application/octet-stream";
          res.writeHead(200, { "Content-Type": contentType });
          fs.createReadStream(filePath).pipe(res);
        });

        server.on("error", (err) => reject(new PlainError(err.message, { line: 1, column: 1 }, { kind: "RuntimeError" })));
        server.listen(port, () => {
          activeServer = server;
          resolve(`Static server hosting "${baseDir}" at http://localhost:${port}/`);
        });
      });
    },

    http_get: async (urlVal: PlainValue, headersVal?: PlainValue): Promise<string> => {
      const targetUrl = plainToString(urlVal);
      const headers: Record<string, string> = {};
      if (Array.isArray(headersVal)) {
        for (const item of headersVal) {
          const s = plainToString(item);
          const idx = s.indexOf(":");
          if (idx !== -1) {
            headers[s.slice(0, idx).trim()] = s.slice(idx + 1).trim();
          }
        }
      }

      const res = await fetch(targetUrl, { method: "GET", headers });
      if (!res.ok) {
        throw new PlainError(`HTTP GET ${targetUrl} failed with status ${res.status}: ${res.statusText}`, { line: 1, column: 1 }, { kind: "RuntimeError" });
      }
      return await res.text();
    },

    http_post: async (urlVal: PlainValue, bodyVal: PlainValue, headersVal?: PlainValue): Promise<string> => {
      const targetUrl = plainToString(urlVal);
      const body = typeof bodyVal === "string" ? bodyVal : JSON.stringify(bodyVal);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (Array.isArray(headersVal)) {
        for (const item of headersVal) {
          const s = plainToString(item);
          const idx = s.indexOf(":");
          if (idx !== -1) {
            headers[s.slice(0, idx).trim()] = s.slice(idx + 1).trim();
          }
        }
      }

      const res = await fetch(targetUrl, { method: "POST", headers, body });
      if (!res.ok) {
        throw new PlainError(`HTTP POST ${targetUrl} failed with status ${res.status}: ${res.statusText}`, { line: 1, column: 1 }, { kind: "RuntimeError" });
      }
      return await res.text();
    },

    html_page: (titleVal: PlainValue, bodyVal: PlainValue): string => {
      const title = plainToString(titleVal);
      const bodyContent = plainToString(bodyVal);
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 2rem; background: #f8fafc; color: #1e293b; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    h1 { color: #0f172a; margin-top: 0; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    th, td { border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    tr:nth-child(even) { background: #f8fafc; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    ${bodyContent}
  </div>
</body>
</html>`;
    },

    html_tag: (tagVal: PlainValue, contentVal?: PlainValue, attrsVal?: PlainValue): string => {
      const tag = plainToString(tagVal).trim();
      const content = contentVal !== undefined ? plainToString(contentVal) : "";
      const attrs = attrsVal !== undefined ? " " + plainToString(attrsVal).trim() : "";
      return `<${tag}${attrs}>${content}</${tag}>`;
    },

    html_table: (headersVal: PlainValue, rowsVal: PlainValue): string => {
      if (!Array.isArray(headersVal) || !Array.isArray(rowsVal)) {
        throw new PlainError("html_table expects a list of headers and a list of row lists.", { line: 1, column: 1 }, { kind: "TypeError" });
      }
      const ths = headersVal.map((h) => `<th>${plainToString(h)}</th>`).join("");
      const trs = rowsVal
        .map((row) => {
          if (!Array.isArray(row)) return `<tr><td>${plainToString(row)}</td></tr>`;
          const tds = row.map((cell) => `<td>${plainToString(cell)}</td>`).join("");
          return `<tr>${tds}</tr>`;
        })
        .join("\n");
      return `<table>\n<thead><tr>${ths}</tr></thead>\n<tbody>\n${trs}\n</tbody>\n</table>`;
    },

    render_template: (templateVal: PlainValue, dataVal: PlainValue): string => {
      let tpl = plainToString(templateVal);
      if (Array.isArray(dataVal)) {
        for (const item of dataVal) {
          const s = plainToString(item);
          const idx = s.indexOf(":");
          if (idx !== -1) {
            const key = s.slice(0, idx).trim();
            const val = s.slice(idx + 1).trim();
            tpl = tpl.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), val);
          }
        }
      }
      return tpl;
    },

    parse_query_string: (queryVal: PlainValue): string[] => {
      const q = plainToString(queryVal).replace(/^\?/, "");
      const pairs = q.split("&");
      const result: string[] = [];
      for (const p of pairs) {
        if (!p) continue;
        const [k, v] = p.split("=");
        result.push(`${decodeURIComponent(k || "")}: ${decodeURIComponent(v || "")}`);
      }
      return result;
    },

    send_webhook: async (urlVal: PlainValue, payloadVal: PlainValue): Promise<string> => {
      const targetUrl = plainToString(urlVal);
      const body = typeof payloadVal === "string" ? payloadVal : JSON.stringify(payloadVal);
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });
      return `Webhook sent. Status: ${res.status}`;
    }
  };
}
