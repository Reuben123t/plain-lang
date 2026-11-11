import * as fs from "fs";
import * as path from "path";
import { runPlain, formatError } from "../index";
import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { startRepl } from "./repl";
import { getHelp } from "./help";
import { startPlayground } from "../playground/server";

export async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    startRepl();
    return;
  }

  const command = args[0];

  if (command === "--version" || command === "-v" || command === "version") {
    console.log("PLAIN Language version 1.0.0");
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
