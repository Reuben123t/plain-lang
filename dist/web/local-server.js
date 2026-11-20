"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLocalServer = startLocalServer;
const http = __importStar(require("node:http"));
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const os = __importStar(require("node:os"));
const node_child_process_1 = require("node:child_process");
const file_1 = require("../builtins/file");
const catalog_1 = require("../tooling/catalog");
const executor_1 = require("./executor");
const http_1 = require("./http");
const WELCOME = '# PLAIN by Reuben — English + Python-like syntax\nsay "Hello, world!"\n\nset name to "friend"\nsay "Welcome to PLAIN, " plus name\n';
const ASSET_TYPES = {
    "app.js": "text/javascript; charset=utf-8",
    "worker.js": "text/javascript; charset=utf-8",
    "style.css": "text/css; charset=utf-8",
    "favicon-32x32.png": "image/png",
    "plain-logo.svg": "image/svg+xml",
    "plain-logo.png": "image/png"
};
function limit(value, fallback, ceiling) {
    if (value === undefined)
        return fallback;
    if (!Number.isSafeInteger(value) || value < 1 || value > ceiling) {
        throw new Error(`Server limits must be positive integers no larger than ${ceiling}.`);
    }
    return value;
}
function safeProgramPath(sandbox, value) {
    if (!value || value.length > 1024 || /[\0\r\n]/.test(value) || /:/.test(value.replace(/^[a-z]:[\\/]/i, ""))) {
        throw new http_1.HttpError(400, "Use a valid .plain file path inside the workspace.");
    }
    let resolved;
    try {
        resolved = sandbox.resolvePath(value);
    }
    catch {
        throw new http_1.HttpError(403, "The file must stay inside the workspace, including symbolic links.");
    }
    if (path.extname(resolved).toLowerCase() !== ".plain")
        throw new http_1.HttpError(400, "Only .plain source files can be opened or saved here.");
    return resolved;
}
function readProgram(filename, maxBytes) {
    let stat;
    try {
        stat = fs.statSync(filename);
    }
    catch {
        throw new http_1.HttpError(404, "Source file not found.");
    }
    if (!stat.isFile())
        throw new http_1.HttpError(400, "The path must identify a regular source file.");
    if (stat.size > maxBytes)
        throw new http_1.HttpError(413, `Source file exceeds ${maxBytes} bytes.`);
    const descriptor = fs.openSync(filename, "r");
    try {
        // A bounded read also protects against a file growing between stat and read.
        const buffer = Buffer.alloc(maxBytes + 1);
        const size = fs.readSync(descriptor, buffer, 0, buffer.length, 0);
        if (size > maxBytes)
            throw new http_1.HttpError(413, `Source file exceeds ${maxBytes} bytes.`);
        return buffer.subarray(0, size).toString("utf8");
    }
    finally {
        fs.closeSync(descriptor);
    }
}
function launchBrowser(url) {
    // URL is generated from a validated numeric port, never from request data.
    if (os.platform() === "win32")
        (0, node_child_process_1.execFile)("cmd.exe", ["/d", "/s", "/c", "start", "", url], () => { });
    else
        (0, node_child_process_1.execFile)(os.platform() === "darwin" ? "open" : "xdg-open", [url], () => { });
}
async function startLocalServer(options) {
    if (options.host !== undefined && options.host !== "127.0.0.1")
        throw new Error("Local PLAIN tools bind only to 127.0.0.1; they are not public servers.");
    const port = options.port ?? (options.mode === "ide" ? 4200 : 3000);
    if (!Number.isInteger(port) || port < 0 || port > 65535)
        throw new Error("Port must be an integer from 0 to 65535.");
    const workspaceDir = fs.realpathSync(path.resolve(options.workspaceDir ?? process.cwd()));
    if (!fs.statSync(workspaceDir).isDirectory())
        throw new Error("The workspace must be a directory.");
    const sandbox = new file_1.FileSystemSandbox(workspaceDir);
    const limits = {
        maxBodyBytes: limit(options.maxBodyBytes, http_1.DEFAULT_LIMITS.maxBodyBytes, 2 * 1024 * 1024),
        maxSourceBytes: limit(options.maxSourceBytes, http_1.DEFAULT_LIMITS.maxSourceBytes, 512 * 1024),
        maxOutputBytes: limit(options.maxOutputBytes, http_1.DEFAULT_LIMITS.maxOutputBytes, 1024 * 1024),
        executionTimeoutMs: limit(options.executionTimeoutMs, http_1.DEFAULT_LIMITS.executionTimeoutMs, 120_000),
        maxInputBytes: http_1.DEFAULT_LIMITS.maxInputBytes
    };
    const packageRoot = path.resolve(__dirname, "..", "..");
    const websiteDir = path.join(packageRoot, "website");
    const assetsSandbox = new file_1.FileSystemSandbox(path.join(websiteDir, "assets"));
    const examplesDir = path.join(packageRoot, "examples");
    const examplesSandbox = new file_1.FileSystemSandbox(examplesDir);
    const token = (0, http_1.createRequestToken)();
    const pool = new executor_1.ExecutionPool();
    let initialCode = WELCOME;
    let initialPath = "untitled.plain";
    if (options.initialFilePath) {
        const filename = safeProgramPath(sandbox, options.initialFilePath);
        initialCode = readProgram(filename, limits.maxSourceBytes);
        initialPath = path.relative(workspaceDir, filename).replace(/\\/g, "/");
    }
    const bootstrap = {
        mode: options.mode, token, workspaceDir, initialCode, initialPath, limits
    };
    const template = fs.readFileSync(path.join(websiteDir, "index.html"), "utf8");
    const bootstrapTag = /<script\s+type="application\/json"\s+id="plain-bootstrap">[\s\S]*?<\/script>/;
    const encodedBootstrap = `<script type="application/json" id="plain-bootstrap">${(0, http_1.scriptJson)(bootstrap)}</script>`;
    const page = bootstrapTag.test(template)
        ? template.replace(bootstrapTag, () => encodedBootstrap)
        : template.replace("</head>", () => `${encodedBootstrap}\n</head>`);
    const examples = () => {
        if (!fs.existsSync(examplesDir))
            return [];
        return fs.readdirSync(examplesDir).filter((name) => /^[\w.-]+\.plain$/i.test(name) && !name.startsWith(".")).filter((name) => {
            try {
                return fs.statSync(examplesSandbox.resolvePath(name)).isFile();
            }
            catch {
                return false;
            }
        }).sort();
    };
    const server = http.createServer((req, res) => {
        (0, http_1.setSecurityHeaders)(res);
        void handle(req, res).catch((error) => {
            if (error instanceof http_1.HttpError)
                (0, http_1.sendJson)(res, error.status, { error: error.message });
            else
                (0, http_1.sendJson)(res, 500, { error: "The local server could not complete this request." });
        });
    });
    server.requestTimeout = 15_000;
    server.headersTimeout = 10_000;
    server.keepAliveTimeout = 1_000;
    server.maxHeadersCount = 64;
    async function handle(req, res) {
        const address = server.address();
        if (!address || typeof address === "string")
            throw new http_1.HttpError(503, "Server is not ready.");
        const url = (0, http_1.validateRequestOrigin)(req, address.port);
        const route = url.pathname;
        if (route === "/" || route === "/index.html") {
            (0, http_1.requireMethod)(req, res, ["GET"]);
            (0, http_1.sendText)(res, 200, page, "text/html; charset=utf-8");
            return;
        }
        if (route.startsWith("/assets/")) {
            (0, http_1.requireMethod)(req, res, ["GET"]);
            const asset = route.slice("/assets/".length);
            if (!Object.prototype.hasOwnProperty.call(ASSET_TYPES, asset))
                throw new http_1.HttpError(404, "Asset not found.");
            let filename;
            try {
                filename = assetsSandbox.resolvePath(asset);
            }
            catch {
                throw new http_1.HttpError(404, "Asset not found.");
            }
            if (!fs.existsSync(filename))
                throw new http_1.HttpError(404, "Browser assets are missing. Run npm run build first.");
            res.writeHead(200, { "Content-Type": ASSET_TYPES[asset] });
            res.end(fs.readFileSync(filename));
            return;
        }
        if (route === "/favicon.ico") {
            (0, http_1.requireMethod)(req, res, ["GET"]);
            res.writeHead(204);
            res.end();
            return;
        }
        if (!route.startsWith("/api/") && route !== "/run")
            throw new http_1.HttpError(404, "Not found.");
        (0, http_1.requireToken)(req, token);
        if (route === "/api/functions") {
            (0, http_1.requireMethod)(req, res, ["GET"]);
            (0, http_1.sendJson)(res, 200, { functions: [...new Set(catalog_1.builtinCatalog.map((entry) => entry.name))].sort(), entries: catalog_1.builtinCatalog });
            return;
        }
        if (route === "/api/examples") {
            (0, http_1.requireMethod)(req, res, ["GET"]);
            (0, http_1.sendJson)(res, 200, examples().map((filename) => ({ name: filename.replace(/\.plain$/, "").replace(/_/g, " "), filename })));
            return;
        }
        if (route === "/api/example") {
            (0, http_1.requireMethod)(req, res, ["GET"]);
            const name = url.searchParams.get("name") || "";
            if (!/^[\w.-]+\.plain$/i.test(name) || name.startsWith(".") || !examples().includes(name))
                throw new http_1.HttpError(404, "Example not found.");
            (0, http_1.sendText)(res, 200, readProgram(examplesSandbox.resolvePath(name), limits.maxSourceBytes));
            return;
        }
        if (route === "/api/file") {
            (0, http_1.requireMethod)(req, res, ["GET", "POST"]);
            if (req.method === "GET") {
                const filename = safeProgramPath(sandbox, url.searchParams.get("path") || "");
                (0, http_1.sendText)(res, 200, readProgram(filename, limits.maxSourceBytes));
            }
            else {
                const data = await (0, http_1.readJson)(req, limits.maxBodyBytes);
                const filePath = (0, http_1.stringField)(data, "path", 1024);
                const code = (0, http_1.stringField)(data, "code", limits.maxSourceBytes);
                const filename = safeProgramPath(sandbox, filePath);
                if (fs.existsSync(filename) && !fs.statSync(filename).isFile())
                    throw new http_1.HttpError(400, "The path must identify a regular source file.");
                fs.mkdirSync(path.dirname(filename), { recursive: true });
                safeProgramPath(sandbox, filePath); // Recheck real parent after creating folders.
                fs.writeFileSync(filename, code, { encoding: "utf8" });
                (0, http_1.sendJson)(res, 200, { success: true, path: path.relative(workspaceDir, filename).replace(/\\/g, "/") });
            }
            return;
        }
        if (route === "/api/run" || route === "/run" || route === "/api/executions") {
            (0, http_1.requireMethod)(req, res, ["POST"]);
            const data = await (0, http_1.readJson)(req, limits.maxBodyBytes);
            const code = (0, http_1.stringField)(data, "code", limits.maxSourceBytes);
            const filename = (0, http_1.stringField)(data, "filename", 1024, "playground.plain");
            safeProgramPath(sandbox, filename);
            let inputs;
            if (data.inputs !== undefined) {
                if (!Array.isArray(data.inputs) || data.inputs.length > 100 || data.inputs.some((input) => typeof input !== "string" || Buffer.byteLength(input, "utf8") > limits.maxInputBytes)) {
                    throw new http_1.HttpError(400, "inputs must contain at most 100 short text answers.");
                }
                inputs = data.inputs;
            }
            const job = pool.start({
                code, filename, workspaceDir, timeoutMs: limits.executionTimeoutMs,
                maxOutputBytes: limits.maxOutputBytes, maxInputBytes: limits.maxInputBytes,
                inputs, interactive: route === "/api/executions"
            });
            if (route === "/api/executions") {
                (0, http_1.sendJson)(res, 202, job.snapshot());
                return;
            }
            const disconnected = () => { if (!res.writableEnded)
                void job.stop(); };
            res.on("close", disconnected);
            const result = await job.finished;
            res.off("close", disconnected);
            (0, http_1.sendJson)(res, 200, {
                ...result, success: result.status === "completed",
                output: route === "/run" ? result.output.replace(/\n$/, "").split("\n").filter((line, index, all) => line !== "" || all.length > 1) : result.output,
                ...(result.error ? { error: result.error.formatted, errorInfo: result.error } : {})
            });
            return;
        }
        const match = /^\/api\/executions\/([a-f0-9]{32})(\/input)?$/.exec(route);
        if (match) {
            (0, http_1.requireMethod)(req, res, match[2] ? ["POST"] : ["GET", "DELETE"]);
            const job = pool.get(match[1]);
            if (match[2]) {
                const data = await (0, http_1.readJson)(req, limits.maxBodyBytes);
                if (!Number.isSafeInteger(data.id))
                    throw new http_1.HttpError(400, "Input id must be an integer.");
                job.answer(data.id, (0, http_1.stringField)(data, "value", limits.maxInputBytes));
            }
            else if (req.method === "DELETE")
                await job.stop();
            (0, http_1.sendJson)(res, 200, job.snapshot());
            return;
        }
        throw new http_1.HttpError(404, "Not found.");
    }
    const originalClose = server.close.bind(server);
    server.close = ((callback) => {
        void pool.close();
        originalClose(callback);
        server.closeIdleConnections?.();
        return server;
    });
    server.on("close", () => { void pool.close(); });
    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, "127.0.0.1", () => { server.off("error", reject); resolve(); });
    });
    const address = server.address();
    const url = `http://127.0.0.1:${address.port}`;
    if (!options.quiet) {
        console.log(`PLAIN ${options.mode === "ide" ? "IDE" : "playground"} by Reuben — ${url}`);
        console.log(`Workspace: ${workspaceDir}`);
        console.log("Trusted local code only. This executor has Node capabilities; do not expose or tunnel this server.");
    }
    if (options.openBrowser ?? options.mode === "ide")
        launchBrowser(url);
    return server;
}
//# sourceMappingURL=local-server.js.map