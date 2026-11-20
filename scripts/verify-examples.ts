import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import assert from "node:assert/strict";
import { Lexer } from "../src/lexer/lexer";
import { Parser } from "../src/parser/parser";
import { runPlain, formatError } from "../src/index";

const root = path.resolve(__dirname, "..");
const examples = path.join(root, "examples");
const runnable = new Set(["01", "02", "04", "05", "07", "09", "11", "12", "16", "17", "18", "19", "20"]);
const expected: Record<string, string[]> = {
  "16": ["Total: 8"],
  "17": ["First: 12", "Last: 25", "Ada: 12", "Arithmetic: 2"],
  "18": ["Arguments: 2", "Hello, Ada"],
  "19": ["Assertions passed"],
  "20": ["Epochs: 2", "Prediction width: 1"]
};

async function main(): Promise<void> {
  let parsed = 0;
  let executed = 0;
  for (const name of fs.readdirSync(examples).filter((filename) => filename.endsWith(".plain")).sort()) {
    const source = fs.readFileSync(path.join(examples, name), "utf8");
    try {
      new Parser(new Lexer(source, name).tokenize(), source, name).parse();
      parsed++;
      if (!runnable.has(name.slice(0, 2))) {
        console.log(`CHECK ${name} (interactive, I/O, network or nondeterministic demo; not auto-executed)`);
        continue;
      }
      const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "plain-example-"));
      const output: string[] = [];
      try {
        await runPlain(source, {
          filename: name, baseDir: temporary, args: ["Ada", "42"],
          onSay: (text) => output.push(text), onShow: (text) => output.push(text),
          onAsk: async () => { throw new Error("Deterministic examples must not request interactive input."); },
          maxSteps: 500000, timeoutMs: 10000, maxOutputSize: 100000
        });
        assert.ok(output.length > 0 || name.endsWith(".test.plain"), `${name} should demonstrate output or assertions`);
        executed++;
        console.log(`PASS  ${name}`);
      } finally {
        fs.rmSync(temporary, { recursive: true, force: true });
      }
    } catch (error: any) {
      console.error(`${name}: ${formatError(error, source)}`);
      process.exitCode = 1;
    }
  }
  console.log(`Examples: ${parsed} parsed, ${executed} deterministic programs executed.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
