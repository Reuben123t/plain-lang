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
exports.main = main;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
const child_process_1 = require("child_process");
const index_1 = require("../index");
const lexer_1 = require("../lexer/lexer");
const parser_1 = require("../parser/parser");
const repl_1 = require("./repl");
const help_1 = require("./help");
const server_1 = require("../playground/server");
const updater_1 = require("../builtins/updater");
const server_deploy_1 = require("../builtins/server_deploy");
const server_2 = require("../ide/server");
const installer_1 = require("../setup/installer");
const cyber_security_1 = require("../builtins/cyber_security");
const analyzer_1 = require("../tooling/analyzer");
const formatter_1 = require("../tooling/formatter");
function validPort(value, fallback) {
    if (value === undefined)
        return fallback;
    if (!/^\d+$/.test(value))
        return undefined;
    const port = Number(value);
    return port >= 1 && port <= 65535 ? port : undefined;
}
function plainTestFiles(directory) {
    if (!fs.existsSync(directory))
        return [];
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(directory, entry.name);
        if (entry.isDirectory())
            return plainTestFiles(full);
        return entry.isFile() && /^(?:test_.+|.+\.test)\.plain$/i.test(entry.name) ? [full] : [];
    }).sort((a, b) => a.localeCompare(b));
}
function collectPlainFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(directory, entry.name);
        return entry.isDirectory() ? collectPlainFiles(full) : entry.isFile() && entry.name.toLowerCase().endsWith(".plain") ? [full] : [];
    });
}
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        (0, repl_1.startRepl)();
        return;
    }
    const command = args[0];
    if (command === "init") {
        if (args.length !== 2 || args[1].startsWith("-")) {
            console.error("Usage: plain init <directory>");
            process.exitCode = 1;
            return;
        }
        const directory = path.resolve(process.cwd(), args[1]);
        fs.mkdirSync(path.join(directory, "tests"), { recursive: true });
        const starter = path.join(directory, "main.plain");
        const starterTest = path.join(directory, "tests", "test_main.plain");
        if (!fs.existsSync(starter))
            fs.writeFileSync(starter, 'say "Hello from PLAIN!"\n');
        if (!fs.existsSync(starterTest))
            fs.writeFileSync(starterTest, "assert_equal(2 + 2, 4)\n");
        console.log(`Created PLAIN project at ${directory}`);
        return;
    }
    if (command === "eval") {
        const code = args.slice(1).join(" ");
        if (!code) {
            console.error("Usage: plain eval <source>");
            process.exitCode = 1;
            return;
        }
        try {
            const interpreter = await (0, index_1.runPlain)(code, { filename: "<eval>", baseDir: process.cwd() });
            const program = new parser_1.Parser(new lexer_1.Lexer(code, "<eval>").tokenize(), code, "<eval>").parse();
            const last = program.body[program.body.length - 1];
            if (last?.type === "ExpressionStatement")
                console.log(String(await interpreter.evaluate(last.expression)));
        }
        catch (error) {
            console.error((0, index_1.formatError)(error, code));
            process.exitCode = 1;
        }
        return;
    }
    if (command === "check") {
        const flags = args.slice(1).filter((arg) => arg.startsWith("-"));
        const positional = args.slice(1).filter((arg) => !arg.startsWith("-"));
        const json = flags.includes("--json");
        const filename = positional[0];
        const error = flags.some((flag) => flag !== "--json") || positional.length !== 1 || !filename
            ? "Usage: plain check [--json] <file.plain>"
            : undefined;
        const filePath = filename ? path.resolve(process.cwd(), filename) : "";
        const diagnostics = error ? [] : fs.existsSync(filePath)
            ? (0, analyzer_1.analyzeSource)(fs.readFileSync(filePath, "utf8"), filename).diagnostics
            : [{ message: `File not found: ${filename}`, severity: "error", code: "FileNotFound", range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } } }];
        if (json)
            console.log(JSON.stringify({ ok: !error && diagnostics.length === 0, file: filename, diagnostics: error ? [{ message: error, severity: "error", code: "UsageError" }] : diagnostics }));
        else if (error)
            console.error(error);
        else if (diagnostics.length)
            diagnostics.forEach((diagnostic) => console.error(`${filename}: ${diagnostic.message}`));
        else
            console.log(`Syntax OK: ${filename}`);
        if (error || diagnostics.length)
            process.exitCode = 1;
        return;
    }
    if (command === "fmt") {
        const flags = args.slice(1).filter((arg) => arg.startsWith("-"));
        const paths = args.slice(1).filter((arg) => !arg.startsWith("-"));
        const checkOnly = flags.includes("--check");
        if (flags.some((flag) => flag !== "--check") || (checkOnly && flags.length !== 1)) {
            console.error("Usage: plain fmt [--check] [file-or-directory ...]");
            process.exitCode = 1;
            return;
        }
        const targets = paths.length ? paths.map((target) => path.resolve(process.cwd(), target)) : [process.cwd()];
        const files = targets.flatMap((target) => fs.existsSync(target) ? (fs.statSync(target).isDirectory() ? collectPlainFiles(target) : [target]) : [target]);
        let changed = false;
        let hadError = false;
        for (const file of [...new Set(files)].sort()) {
            if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
                console.error(`File not found: ${file}`);
                changed = true;
                hadError = true;
                continue;
            }
            const source = fs.readFileSync(file, "utf8");
            const formatted = (0, formatter_1.formatSource)(source);
            if (formatted !== source) {
                changed = true;
                if (!checkOnly)
                    fs.writeFileSync(file, formatted);
            }
        }
        if (checkOnly && changed)
            console.error("Some files need formatting.");
        if (!checkOnly && changed)
            console.log("Formatted PLAIN source files.");
        if ((checkOnly && changed) || hadError)
            process.exitCode = 1;
        return;
    }
    if (command === "test") {
        const flags = args.slice(1).filter((arg) => arg.startsWith("-"));
        const extra = args.slice(1).filter((arg) => !arg.startsWith("-"));
        if (flags.length || extra.length > 1) {
            console.error("Usage: plain test [file-or-directory]");
            process.exitCode = 1;
            return;
        }
        const target = extra[0] ? path.resolve(process.cwd(), extra[0]) : process.cwd();
        if (!fs.existsSync(target)) {
            console.error(`File not found: ${extra[0]}`);
            process.exitCode = 1;
            return;
        }
        const files = fs.statSync(target).isDirectory() ? plainTestFiles(target) : [target];
        if (!files.length) {
            console.error("No PLAIN test files found.");
            process.exitCode = 1;
            return;
        }
        let passed = 0;
        let failed = 0;
        for (const file of files) {
            const source = fs.readFileSync(file, "utf8");
            try {
                await (0, index_1.runPlain)(source, { filename: file, baseDir: path.dirname(file) });
                passed++;
                console.log(`PASS ${path.relative(process.cwd(), file)}`);
            }
            catch (error) {
                failed++;
                console.error(`FAIL ${path.relative(process.cwd(), file)}\n${(0, index_1.formatError)(error, source)}`);
            }
        }
        console.log(`${passed} passed, ${failed} failed`);
        if (failed)
            process.exitCode = 1;
        return;
    }
    if (command === "--version" || command === "-v" || command === "version") {
        if (args.length !== 1) {
            console.error("Usage: plain version");
            process.exitCode = 1;
            return;
        }
        console.log(`PLAIN Language version ${updater_1.CURRENT_PLAIN_VERSION}`);
        console.log("Author: Reuben");
        console.log("Copyright (C) 2026 Reuben. All rights reserved.");
        return;
    }
    if (command === "ide" || command === "idle") {
        if (args.length > 2 || (args[1] === "--port" && !validPort(args[2], 4200))) {
            console.error("Usage: plain ide [file.plain] or plain ide --port <1-65535>");
            process.exitCode = 1;
            return;
        }
        const fileArg = args[1] ? path.resolve(process.cwd(), args[1]) : undefined;
        // Search for native Windows PLAIN IDE (Python IDLE desktop equivalent)
        const ideCandidates = [
            path.join(process.env.LOCALAPPDATA || "", "PLAIN", "bin", "plain-ide.exe"),
            path.resolve(process.cwd(), "dist", "plain-ide.exe"),
            path.resolve(__dirname, "..", "..", "dist", "plain-ide.exe"),
            path.resolve(__dirname, "..", "ide", "plain-ide.exe"),
            path.resolve(process.cwd(), "build_assets", "plain-ide.exe")
        ];
        const ideExe = ideCandidates.find((c) => fs.existsSync(c));
        if (ideExe) {
            console.log("Launching PLAIN IDE...");
            if (fileArg) {
                console.log(`Loaded "${path.basename(fileArg)}" into code editor area (not executed).`);
            }
            const child = (0, child_process_1.spawn)(ideExe, fileArg ? [fileArg] : [], {
                detached: true,
                stdio: "ignore"
            });
            child.unref();
            return;
        }
        // Fallback if binary not found
        const portArg = args[1] && !args[1].endsWith(".plain") ? parseInt(args[1], 10) : 4200;
        await (0, server_2.startPlainIde)(portArg, fileArg);
        return;
    }
    if (command === "setup" || command === "install") {
        const manager = new installer_1.PlainSystemManager();
        await manager.runInteractiveSetup();
        return;
    }
    if (command === "doctor" || command === "diagnose" || command === "health") {
        const manager = new installer_1.PlainSystemManager();
        const healthy = await manager.runDoctor(true);
        if (!healthy)
            process.exit(1);
        return;
    }
    if (command === "uninstall" || command === "remove") {
        const manager = new installer_1.PlainSystemManager();
        manager.cleanUninstall();
        return;
    }
    if (command === "update" || command === "upgrade") {
        await (0, updater_1.performUpdate)();
        return;
    }
    if (command === "website" || command === "web" || command === "docs") {
        const localIndex = path.resolve(__dirname, "..", "..", "index.html");
        const ghPagesUrl = "https://reuben123t.github.io/plain-lang/";
        const target = fs.existsSync(localIndex) ? localIndex : ghPagesUrl;
        console.log("Opening PLAIN Website...");
        console.log(`URL: ${ghPagesUrl}`);
        const openCmd = process.platform === "win32" ? `start "" "${target}"` : process.platform === "darwin" ? `open "${target}"` : `xdg-open "${target}"`;
        const { exec } = require("child_process");
        exec(openCmd, () => { });
        return;
    }
    if (command === "deploy") {
        if (args.length > 2) {
            console.error("Usage: plain deploy [port]");
            process.exitCode = 1;
            return;
        }
        const portArg = validPort(args[1], 8080);
        if (portArg === undefined) {
            console.error("Port must be an integer from 1 to 65535.");
            process.exitCode = 1;
            return;
        }
        const deployer = (0, server_deploy_1.createServerDeployer)();
        await deployer.deploy_server(portArg, undefined, "0.0.0.0");
        return;
    }
    if (command === "scan" || command === "portscan") {
        if (args.length > 3) {
            console.error("Usage: plain scan <host> [comma-separated-ports]");
            process.exitCode = 1;
            return;
        }
        const target = args[1] || "127.0.0.1";
        const rawPortArgs = args.slice(2).join(",");
        const portList = rawPortArgs ? rawPortArgs.split(",").map((p) => /^\d+$/.test(p) ? Number(p) : NaN) : undefined;
        if (portList?.some((port) => !Number.isInteger(port) || port < 1 || port > 65535)) {
            console.error("Ports must be integers from 1 to 65535.");
            process.exitCode = 1;
            return;
        }
        console.log(`\n🔍 PLAIN Cybersecurity Reconnaissance: Scanning ${target}...`);
        const res = await cyber_security_1.cyberSecurityBuiltins.port_scan(target, portList);
        console.log(`==================================================================`);
        console.log(`Target: ${res.target} | Scanned Ports: ${res.scanned_ports_count} | Scan Time: ${res.scan_duration_ms} ms`);
        console.log(`Open Ports: ${res.open_ports_count}`);
        if (Array.isArray(res.open_ports) && res.open_ports.length > 0) {
            for (const p of res.open_ports) {
                const risk = p.risk ? ` [${p.risk}]` : "";
                console.log(`  ✓ Port ${p.port}\t${p.service}\t${p.desc}${risk}`);
            }
        }
        else {
            console.log(`  (No open ports found on scanned targets)`);
        }
        console.log(`==================================================================\n`);
        return;
    }
    if (command === "audit" || command === "secure" || command === "security") {
        const targetUrl = args[1];
        if (!targetUrl) {
            console.error("Usage: plain audit <url> (e.g. plain audit https://example.com)");
            process.exit(1);
        }
        console.log(`\n🛡️  Auditing HTTP Security Headers for ${targetUrl}...`);
        const report = await cyber_security_1.cyberSecurityBuiltins.audit_security_headers(targetUrl);
        console.log(`==================================================================`);
        console.log(`URL: ${report.url} | Status: ${report.status_code || report.status}`);
        console.log(`Security Score: ${report.security_score}/100 | Grade: [ ${report.grade} ]`);
        console.log(`------------------------------------------------------------------`);
        if (Array.isArray(report.passed_checks) && report.passed_checks.length > 0) {
            console.log(`PASSED CHECKS:`);
            report.passed_checks.forEach((c) => console.log(`  [✓] ${c}`));
        }
        if (Array.isArray(report.vulnerabilities_found) && report.vulnerabilities_found.length > 0) {
            console.log(`\nVULNERABILITIES & WARNINGS:`);
            report.vulnerabilities_found.forEach((v) => console.log(`  [!] ${v}`));
        }
        if (Array.isArray(report.recommended_remediation) && report.recommended_remediation.length > 0) {
            console.log(`\nRECOMMENDED REMEDIATION:`);
            report.recommended_remediation.forEach((r) => console.log(`  ↳ ${r}`));
        }
        console.log(`==================================================================\n`);
        return;
    }
    if (command === "hash" || command === "checksum") {
        const filename = args[1];
        if (!filename || !fs.existsSync(filename)) {
            console.error("Usage: plain hash <file>");
            process.exit(1);
        }
        if (args.length !== 2) {
            console.error("Usage: plain hash <file>");
            process.exitCode = 1;
            return;
        }
        const buf = fs.readFileSync(filename);
        console.log(`\nFile: ${filename} (${buf.length} bytes)`);
        console.log(`MD5:    ${(0, crypto_1.createHash)("md5").update(buf).digest("hex")}`);
        console.log(`SHA1:   ${(0, crypto_1.createHash)("sha1").update(buf).digest("hex")}`);
        console.log(`SHA256: ${(0, crypto_1.createHash)("sha256").update(buf).digest("hex")}\n`);
        return;
    }
    if (command === "cve") {
        const id = args[1];
        if (!id) {
            console.error("Usage: plain cve <CVE-ID> (e.g. plain cve CVE-2021-44228)");
            process.exit(1);
        }
        const info = cyber_security_1.cyberSecurityBuiltins.cve_lookup(id);
        console.log(`\n=== CVE Threat Intelligence ===`);
        console.log(JSON.stringify(info, null, 2));
        console.log("");
        return;
    }
    if (command === "help" || command === "--help" || command === "-h") {
        console.log((0, help_1.getHelp)(args[1]));
        return;
    }
    if (command === "repl") {
        (0, repl_1.startRepl)();
        return;
    }
    if (command === "examples" || command === "example") {
        const candidates = [
            path.resolve(__dirname, "..", "examples"),
            path.resolve(__dirname, "..", "..", "examples"),
            path.resolve(process.cwd(), "examples")
        ];
        const examplesDir = candidates.find((d) => fs.existsSync(d)) || candidates[0];
        const target = args[1] === "run" ? args[2] : args[1];
        if (!target) {
            console.log("\n=== PLAIN Example Programs ===");
            console.log("Run any example with: plain examples <number_or_name>\n");
            if (fs.existsSync(examplesDir)) {
                const files = fs.readdirSync(examplesDir).filter((f) => f.endsWith(".plain"));
                for (const file of files) {
                    console.log(`  - ${file.replace(".plain", "")}  (plain examples ${file.split("_")[0]})`);
                }
            }
            console.log("\nExample: plain examples 01_hello\n");
            return;
        }
        if (fs.existsSync(examplesDir)) {
            const files = fs.readdirSync(examplesDir).filter((f) => f.endsWith(".plain"));
            const match = files.find((f) => f.toLowerCase() === target.toLowerCase() ||
                f.toLowerCase().startsWith(target.toLowerCase()) ||
                f.toLowerCase().includes(target.toLowerCase()));
            if (match) {
                const fullPath = path.join(examplesDir, match);
                const source = fs.readFileSync(fullPath, "utf-8");
                console.log(`--- Running: ${match} ---\n`);
                try {
                    await (0, index_1.runPlain)(source, { filename: match, baseDir: examplesDir });
                }
                catch (err) {
                    console.error((0, index_1.formatError)(err, source));
                }
                return;
            }
        }
        console.error(`Error: Could not find example matching "${target}". Run 'plain examples' to see the list.`);
        return;
    }
    if (command === "playground") {
        if (args.length > 2) {
            console.error("Usage: plain playground [port]");
            process.exitCode = 1;
            return;
        }
        const port = validPort(args[1], 3000);
        if (port === undefined) {
            console.error("Port must be an integer from 1 to 65535.");
            process.exitCode = 1;
            return;
        }
        (0, server_1.startPlayground)(port);
        return;
    }
    if (command === "check") {
        const filename = args[1];
        if (!filename) {
            console.error("Error: Please provide a .plain file to check.");
            process.exit(1);
        }
        const filePath = path.resolve(process.cwd(), filename);
        if (!fs.existsSync(filePath)) {
            console.error(`Error: File not found: "${filename}"`);
            process.exit(1);
        }
        const source = fs.readFileSync(filePath, "utf-8");
        try {
            const lexer = new lexer_1.Lexer(source, filename);
            const tokens = lexer.tokenize();
            const parser = new parser_1.Parser(tokens, source, filename);
            parser.parse();
            console.log(`✓ Syntax OK: "${filename}" is valid PLAIN code.`);
        }
        catch (err) {
            console.error((0, index_1.formatError)(err, source));
            process.exit(1);
        }
        return;
    }
    // File execution: `plain run <file.plain>` or `plain <file.plain>`
    const divider = args.indexOf("--");
    const commandArgs = divider >= 0 ? args.slice(0, divider) : args;
    const scriptArgs = divider >= 0 ? args.slice(divider + 1) : [];
    const filename = command === "run" ? commandArgs[1] : command;
    if (!filename || (command === "run" && commandArgs.length !== 2) || (command !== "run" && commandArgs.length !== 1) || (divider >= 0 && command !== "run") || filename.startsWith("-")) {
        console.error("Usage: plain run <file.plain> [-- script-args...]");
        process.exitCode = 1;
        return;
    }
    const filePath = path.resolve(process.cwd(), filename);
    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: "${filename}"`);
        process.exit(1);
    }
    if (!filename.endsWith(".plain")) {
        console.warn(`[Note] PLAIN programs usually end with '.plain', but running "${filename}" anyway.\n`);
    }
    const source = fs.readFileSync(filePath, "utf-8");
    try {
        await (0, index_1.runPlain)(source, {
            filename,
            baseDir: path.dirname(filePath),
            args: scriptArgs
        });
    }
    catch (err) {
        console.error((0, index_1.formatError)(err, source));
        process.exit(1);
    }
}
if (require.main === module) {
    main().catch((err) => {
        console.error((0, index_1.formatError)(err));
        process.exit(1);
    });
}
//# sourceMappingURL=cli.js.map