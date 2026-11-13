import { describe, it } from "node:test";
import * as assert from "node:assert";
import { runPlain } from "../src/index";
import * as fs from "fs";
import * as path from "path";

describe("Python-Style Syntax & Package Import", () => {
  it("supports Python assignment operators (=, +=, -=, *=, /=)", async () => {
    let output = "";
    const code = `
x = 10
x += 5
x -= 2
x *= 3
x /= 2
say x
`;
    await runPlain(code, {
      onSay: (s) => (output += s + "\n")
    });
    assert.equal(output.trim(), "19.5");
  });

  it("supports power (**) and floor division (//)", async () => {
    let output = "";
    const code = `
a = 2 ** 5
b = 17 // 3
say a
say b
`;
    await runPlain(code, {
      onSay: (s) => (output += s + "\n")
    });
    assert.deepEqual(output.trim().split("\n"), ["32", "5"]);
  });

  it("supports Python-style def with return and colons", async () => {
    let output = "";
    const code = `
def multiply(x, y):
    return x * y
end

result = multiply(6, 7)
say result
`;
    await runPlain(code, {
      onSay: (s) => (output += s + "\n")
    });
    assert.equal(output.trim(), "42");
  });

  it("supports while loop with colon", async () => {
    let output = "";
    const code = `
count = 0
while count < 3:
    count += 1
end
say count
`;
    await runPlain(code, {
      onSay: (s) => (output += s + "\n")
    });
    assert.equal(output.trim(), "3");
  });

  it("supports dictionaries with key-value access", async () => {
    let output = "";
    const code = `
user = { "name": "Reuben", "role": "creator", "level": 10 }
say user.name
say user["role"]
`;
    await runPlain(code, {
      onSay: (s) => (output += s + "\n")
    });
    assert.deepEqual(output.trim().split("\n"), ["Reuben", "creator"]);
  });

  it("supports importing external .plain files as packages", async () => {
    const tempDir = path.resolve(__dirname, "temp_pkg_test");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const helperPath = path.join(tempDir, "math_helpers.plain");
    fs.writeFileSync(
      helperPath,
      `
def square(n):
    return n * n
end
math_pi = 3.14159
`,
      "utf-8"
    );

    let output = "";
    const mainCode = `
import "math_helpers.plain" as helpers
val = helpers.square(5)
say val
say helpers.math_pi
`;

    try {
      await runPlain(mainCode, {
        baseDir: tempDir,
        onSay: (s) => (output += s + "\n")
      });
      assert.deepEqual(output.trim().split("\n"), ["25", "3.14159"]);
    } finally {
      if (fs.existsSync(helperPath)) fs.unlinkSync(helperPath);
      if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
    }
  });
});

