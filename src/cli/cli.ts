import * as fs from "fs";
import * as path from "path";
import { runPlain, formatError } from "../index";
import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { startRepl } from "./repl";
import { getHelp } from "./help";
import { startPlayground } from "../playground/server";
import { promptUpdateIfAvailable, performUpdate, CURRENT_PLAIN_VERSION } from "../builtins/updater";
import { createServerDeployer } from "../builtins/server_deploy";

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

  if (command === "update" || command === "upgrade") {
    await performUpdate();
    return;
  }

  if (command === "deploy") {
    const portArg = args[1] && !args[1].endsWith(".plain") ? parseInt(args[1], 10) : 8080;
    const deployer = createServerDeployer();
    await deployer.deploy_server(portArg, undefined, "0.0.0.0");
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

