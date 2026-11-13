import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";
import { runPlain, formatError } from "../index";
import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { startRepl } from "./repl";
import { getHelp } from "./help";
import { startPlayground } from "../playground/server";
import { promptUpdateIfAvailable, performUpdate, CURRENT_PLAIN_VERSION } from "../builtins/updater";
import { createServerDeployer } from "../builtins/server_deploy";
import { startPlainIde } from "../ide/server";
import { PlainSystemManager } from "../setup/installer";
import { cyberSecurityBuiltins } from "../builtins/cyber_security";
import { cryptoSecurityBuiltins } from "../builtins/crypto_security";

export async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    await promptUpdateIfAvailable();
    startRepl();
    return;
  }

  const command = args[0];

  if (command === "--version" || command === "-v" || command === "version") {
    console.log(`PLAIN Language version ${CURRENT_PLAIN_VERSION}`);
    console.log("Author: Reuben");
    console.log("Copyright (C) 2026 Reuben. All rights reserved.");
    return;
  }

  if (command === "ide" || command === "idle") {
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
      console.log("Launching PLAIN IDE (Python IDLE Desktop Edition • Author: Reuben)...");
      if (fileArg) {
        console.log(`Loaded "${path.basename(fileArg)}" into code editor area (not executed).`);
      }
      const child = spawn(ideExe, fileArg ? [fileArg] : [], {
        detached: true,
        stdio: "ignore"
      });
      child.unref();
      return;
    }

    // Fallback if binary not found
    const portArg = args[1] && !args[1].endsWith(".plain") ? parseInt(args[1], 10) : 4200;
    await startPlainIde(portArg, fileArg);
    return;
  }

  if (command === "setup" || command === "install") {
    const manager = new PlainSystemManager();
    await manager.runInteractiveSetup();
    return;
  }

  if (command === "doctor" || command === "diagnose" || command === "health") {
    const manager = new PlainSystemManager();
    const healthy = await manager.runDoctor(true);
    if (!healthy) process.exit(1);
    return;
  }

  if (command === "uninstall" || command === "remove") {
    const manager = new PlainSystemManager();
    manager.cleanUninstall();
    return;
  }

  if (command === "update" || command === "upgrade") {
    await performUpdate();
    return;
  }

  if (command === "website" || command === "web" || command === "docs") {
    const localIndex = path.resolve(__dirname, "..", "..", "index.html");
    const ghPagesUrl = "https://reuben123t.github.io/plain-lang/";
    const target = fs.existsSync(localIndex) ? localIndex : ghPagesUrl;
    console.log("Opening PLAIN Website (Dev Mode 3D Showcase • Author: Reuben)...");
    console.log(`URL: ${ghPagesUrl}`);
    const openCmd = process.platform === "win32" ? `start "" "${target}"` : process.platform === "darwin" ? `open "${target}"` : `xdg-open "${target}"`;
    const { exec } = require("child_process");
    exec(openCmd, () => {});
    return;
  }

  if (command === "deploy") {
    const portArg = args[1] && !args[1].endsWith(".plain") ? parseInt(args[1], 10) : 8080;
    const deployer = createServerDeployer();
    await deployer.deploy_server(portArg, undefined, "0.0.0.0");
    return;
  }

  if (command === "scan" || command === "portscan") {
    const target = args[1] || "127.0.0.1";
    const rawPortArgs = args.slice(2).join(",");
    const portList = rawPortArgs ? rawPortArgs.split(",").map(Number).filter((p) => !isNaN(p) && p > 0) : undefined;
    console.log(`\n🔍 PLAIN Cybersecurity Reconnaissance: Scanning ${target}...`);
    const res: any = await cyberSecurityBuiltins.port_scan(target, portList);
    console.log(`==================================================================`);
    console.log(`Target: ${res.target} | Scanned Ports: ${res.scanned_ports_count} | Scan Time: ${res.scan_duration_ms} ms`);
    console.log(`Open Ports: ${res.open_ports_count}`);
    if (Array.isArray(res.open_ports) && res.open_ports.length > 0) {
      for (const p of res.open_ports) {
        const risk = p.risk ? ` [${p.risk}]` : "";
        console.log(`  ✓ Port ${p.port}\t${p.service}\t${p.desc}${risk}`);
      }
    } else {
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
    const report: any = await cyberSecurityBuiltins.audit_security_headers(targetUrl);
    console.log(`==================================================================`);
    console.log(`URL: ${report.url} | Status: ${report.status_code || report.status}`);
    console.log(`Security Score: ${report.security_score}/100 | Grade: [ ${report.grade} ]`);
    console.log(`------------------------------------------------------------------`);
    if (Array.isArray(report.passed_checks) && report.passed_checks.length > 0) {
      console.log(`PASSED CHECKS:`);
      report.passed_checks.forEach((c: string) => console.log(`  [✓] ${c}`));
    }
    if (Array.isArray(report.vulnerabilities_found) && report.vulnerabilities_found.length > 0) {
      console.log(`\nVULNERABILITIES & WARNINGS:`);
      report.vulnerabilities_found.forEach((v: string) => console.log(`  [!] ${v}`));
    }
    if (Array.isArray(report.recommended_remediation) && report.recommended_remediation.length > 0) {
      console.log(`\nRECOMMENDED REMEDIATION:`);
      report.recommended_remediation.forEach((r: string) => console.log(`  ↳ ${r}`));
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
    console.log(`MD5:    ${cryptoSecurityBuiltins.md5(buf.toString("latin1"))}`);
    console.log(`SHA1:   ${cryptoSecurityBuiltins.sha1(buf.toString("latin1"))}`);
    console.log(`SHA256: ${cryptoSecurityBuiltins.sha256(buf.toString("latin1"))}\n`);
    return;
  }

  if (command === "cve") {
    const id = args[1];
    if (!id) {
      console.error("Usage: plain cve <CVE-ID> (e.g. plain cve CVE-2021-44228)");
      process.exit(1);
    }
    const info = cyberSecurityBuiltins.cve_lookup(id);
    console.log(`\n=== CVE Threat Intelligence ===`);
    console.log(JSON.stringify(info, null, 2));
    console.log("");
    return;
  }

  if (command === "help" || command === "--help" || command === "-h") {
    console.log(getHelp(args[1]));
    return;
  }

  if (command === "repl") {
    startRepl();
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
      const match = files.find(
        (f) =>
          f.toLowerCase() === target.toLowerCase() ||
          f.toLowerCase().startsWith(target.toLowerCase()) ||
          f.toLowerCase().includes(target.toLowerCase())
      );
      if (match) {
        const fullPath = path.join(examplesDir, match);
        const source = fs.readFileSync(fullPath, "utf-8");
        console.log(`--- Running: ${match} ---\n`);
        try {
          await runPlain(source, { filename: match, baseDir: examplesDir });
        } catch (err: any) {
          console.error(formatError(err, source));
        }
        return;
      }
    }
    console.error(`Error: Could not find example matching "${target}". Run 'plain examples' to see the list.`);
    return;
  }

  if (command === "playground") {
    const port = args[1] ? parseInt(args[1], 10) : 3000;
    startPlayground(port);
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
      const lexer = new Lexer(source, filename);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens, source, filename);
      parser.parse();
      console.log(`✓ Syntax OK: "${filename}" is valid PLAIN code.`);
    } catch (err: any) {
      console.error(formatError(err, source));
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
    await runPlain(source, {
      filename,
      baseDir: path.dirname(filePath)
    });
  } catch (err: any) {
    console.error(formatError(err, source));
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(formatError(err));
    process.exit(1);
  });
}

