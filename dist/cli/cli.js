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
const crypto_security_1 = require("../builtins/crypto_security");
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        await (0, updater_1.promptUpdateIfAvailable)();
        (0, repl_1.startRepl)();
        return;
    }
    const command = args[0];
    if (command === "--version" || command === "-v" || command === "version") {
        console.log(`PLAIN Language version ${updater_1.CURRENT_PLAIN_VERSION}`);
        console.log("Author: Reuben");
        console.log("Copyright (C) 2026 Reuben. All rights reserved.");
        return;
    }
    if (command === "ide" || command === "idle") {
        const fileArg = args[1] && args[1].endsWith(".plain") ? path.resolve(process.cwd(), args[1]) : undefined;
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
    if (command === "deploy") {
        const portArg = args[1] && !args[1].endsWith(".plain") ? parseInt(args[1], 10) : 8080;
        const deployer = (0, server_deploy_1.createServerDeployer)();
        await deployer.deploy_server(portArg, undefined, "0.0.0.0");
        return;
    }
    if (command === "scan" || command === "portscan") {
        const target = args[1] || "127.0.0.1";
        const rawPortArgs = args.slice(2).join(",");
        const portList = rawPortArgs ? rawPortArgs.split(",").map(Number).filter((p) => !isNaN(p) && p > 0) : undefined;
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
        const buf = fs.readFileSync(filename);
        console.log(`\nFile: ${filename} (${buf.length} bytes)`);
        console.log(`MD5:    ${crypto_security_1.cryptoSecurityBuiltins.md5(buf.toString("latin1"))}`);
        console.log(`SHA1:   ${crypto_security_1.cryptoSecurityBuiltins.sha1(buf.toString("latin1"))}`);
        console.log(`SHA256: ${crypto_security_1.cryptoSecurityBuiltins.sha256(buf.toString("latin1"))}\n`);
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
        const port = args[1] ? parseInt(args[1], 10) : 3000;
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
    let filename = command;
    if (command === "run") {
        if (!args[1]) {
            console.error("Error: Please provide a .plain file to run.");
            process.exit(1);
        }
        filename = args[1];
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
            baseDir: path.dirname(filePath)
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