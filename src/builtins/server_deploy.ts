import * as http from "http";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import { PlainObject, PlainValue, plainToString } from "../runtime/values";

let activeDeployedServer: http.Server | null = null;
let activeDeployedPort: number | null = null;

export function getLocalIpAddress(): string {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    const interfaces = nets[name];
    if (!interfaces) continue;
    for (const net of interfaces) {
      // Skip internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1";
}

export function getAllIpAddresses(): string[] {
  const ips: string[] = ["127.0.0.1"];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    const interfaces = nets[name];
    if (!interfaces) continue;
    for (const net of interfaces) {
      if (net.family === "IPv4") {
        ips.push(net.address);
      }
    }
  }
  return Array.from(new Set(ips));
}

export async function fetchPublicIp(): Promise<string> {
  return new Promise((resolve) => {
    const req = https.get("https://api.ipify.org?format=json", { timeout: 3000 }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.ip || "unavailable");
        } catch {
          resolve("unavailable");
        }
      });
    });
    req.on("error", () => resolve("unavailable"));
    req.on("timeout", () => {
      req.destroy();
      resolve("unavailable");
    });
  });
}

export interface DeployServerOptions {
  port?: number;
  host?: string;
  onDeploy?: (info: { port: number; localUrl: string; networkUrl: string; publicUrl: string }) => void;
  handler?: (req: http.IncomingMessage, res: http.ServerResponse) => void | Promise<void>;
}

export function createServerDeployer(options?: {
  invokeFunction?: (fn: any, args: PlainValue[]) => Promise<PlainValue>;
}) {
  return {
    get_local_ip: () => getLocalIpAddress(),
    get_all_ips: () => getAllIpAddresses(),
    get_public_ip: async () => await fetchPublicIp(),
    get_hostname: () => os.hostname(),

    deploy_server: async (portVal: any, handlerOrRouter?: any, hostVal?: any) => {
      const port = typeof portVal === "number" ? portVal : parseInt(String(portVal), 10) || 8080;
      const host = typeof hostVal === "string" ? hostVal : "0.0.0.0";

      if (activeDeployedServer) {
        try {
          activeDeployedServer.close();
        } catch {
          // ignore
        }
      }

      const server = http.createServer(async (req, res) => {
        // Default CORS
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if (req.method === "OPTIONS") {
          res.writeHead(204);
          res.end();
          return;
        }

        // Read body if POST/PUT
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
          let parsedJson: PlainValue = null;
          try {
            parsedJson = JSON.parse(body);
          } catch {
            parsedJson = body;
          }

          const reqData: PlainObject = {
            method: req.method || "GET",
            url: req.url || "/",
            path: (req.url || "/").split("?")[0],
            query: (req.url || "").includes("?") ? (req.url || "").split("?")[1] : "",
            body: parsedJson,
            raw_body: body,
            headers: (req.headers as unknown) as PlainObject,
            client_ip: req.socket.remoteAddress || "unknown"
          };

          if (handlerOrRouter && typeof handlerOrRouter === "object" && handlerOrRouter.type === "function") {
            try {
              if (options?.invokeFunction) {
                const result = await options.invokeFunction(handlerOrRouter, [reqData]);
                if (result && typeof result === "object" && (result as any).status) {
                  const resObj = result as any;
                  res.writeHead(resObj.status || 200, resObj.headers || { "Content-Type": "application/json" });
                  res.end(typeof resObj.body === "string" ? resObj.body : JSON.stringify(resObj.body));
                  return;
                } else if (typeof result === "string") {
                  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                  res.end(result);
                  return;
                } else {
                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(JSON.stringify(result));
                  return;
                }
              }
            } catch (err: any) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: err.message || "Internal server error" }));
              return;
            }
          }

          // Default fallback page
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`<!DOCTYPE html>
<html>
<head>
  <title>PLAIN Web Server</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center; }
    .card { background: #1e293b; border-radius: 12px; padding: 32px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h1 { color: #38bdf8; margin-top: 0; }
    .badge { display: inline-block; background: #22c55e; color: #022c22; font-weight: bold; padding: 4px 12px; border-radius: 999px; }
    p { color: #94a3b8; font-size: 16px; line-height: 1.6; }
    code { background: #334155; padding: 2px 6px; border-radius: 4px; color: #f1f5f9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">LIVE & ONLINE</div>
    <h1>PLAIN Network Server</h1>
    <p>Powered by <strong>PLAIN Language</strong> &bull; Author: <strong>Reuben</strong></p>
    <p>Connected to <code>${req.url}</code> via <code>${req.method}</code></p>
    <p>Access this server from any device on your Wi-Fi / Local Area Network!</p>
  </div>
</body>
</html>`);
        });
      });

      return new Promise<PlainObject>((resolve) => {
        server.listen(port, host, async () => {
          activeDeployedServer = server;
          activeDeployedPort = port;

          const localIp = getLocalIpAddress();
          const publicIp = await fetchPublicIp();

          const localUrl = `http://localhost:${port}`;
          const networkUrl = `http://${localIp}:${port}`;
          const publicUrl = publicIp !== "unavailable" ? `http://${publicIp}:${port}` : "N/A (check firewall/router)";

          console.log("");
          console.log("╔══════════════════════════════════════════════════════════════╗");
          console.log("║           🚀 PLAIN WEB SERVER DEPLOYED & LIVE!               ║");
          console.log("╠══════════════════════════════════════════════════════════════╣");
          console.log(`║  Local Access:    ${localUrl.padEnd(43)}║`);
          console.log(`║  Network (LAN):   ${networkUrl.padEnd(43)}║`);
          console.log(`║  Public IP:       ${publicUrl.padEnd(43)}║`);
          console.log(`║  Bound Host:      ${(host + ":" + port).padEnd(43)}║`);
          console.log("║  Author:          Reuben                                     ║");
          console.log("╚══════════════════════════════════════════════════════════════╝");
          console.log("Ready to accept incoming connections across your local network and internet.");
          console.log("");

          resolve({
            port,
            host,
            local_url: localUrl,
            network_url: networkUrl,
            public_url: publicUrl,
            local_ip: localIp,
            public_ip: publicIp,
            status: "running"
          });
        });
      });
    },

    stop_deployed_server: () => {
      if (activeDeployedServer) {
        activeDeployedServer.close();
        activeDeployedServer = null;
        activeDeployedPort = null;
        return true;
      }
      return false;
    },

    // HTTP Responses
    json_response: (data: PlainValue, statusVal: any = 200): PlainObject => ({
      status: typeof statusVal === "number" ? statusVal : 200,
      headers: { "Content-Type": "application/json" },
      body: typeof data === "string" ? data : JSON.stringify(data)
    }),

    html_response: (html: string, statusVal: any = 200): PlainObject => ({
      status: typeof statusVal === "number" ? statusVal : 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: String(html)
    }),

    text_response: (text: string, statusVal: any = 200): PlainObject => ({
      status: typeof statusVal === "number" ? statusVal : 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: String(text)
    }),

    redirect_response: (url: string, statusVal: any = 302): PlainObject => ({
      status: typeof statusVal === "number" ? statusVal : 302,
      headers: { Location: String(url) },
      body: ""
    }),

    cors_headers: (originVal: string = "*"): PlainObject => ({
      "Access-Control-Allow-Origin": originVal,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
    }),

    parse_query_string: (query: string): PlainObject => {
      const res: PlainObject = {};
      const search = query.startsWith("?") ? query.slice(1) : query;
      for (const pair of search.split("&")) {
        if (!pair) continue;
        const [k, v] = pair.split("=");
        res[decodeURIComponent(k)] = v ? decodeURIComponent(v) : "";
      }
      return res;
    },

    parse_cookies: (cookieHeader: any): PlainObject => {
      const res: PlainObject = {};
      const headerStr = typeof cookieHeader === "string" ? cookieHeader : "";
      for (const item of headerStr.split(";")) {
        const parts = item.trim().split("=");
        if (parts.length >= 2) {
          res[parts[0].trim()] = decodeURIComponent(parts.slice(1).join("=").trim());
        }
      }
      return res;
    },

    status_code_text: (code: number): string => {
      return http.STATUS_CODES[code] || "Unknown";
    },

    server_uptime: () => process.uptime(),
    server_memory_usage: (): PlainObject => {
      const mem = process.memoryUsage();
      return {
        rss_mb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
        heap_used_mb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
        heap_total_mb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100
      };
    }
  };
}
