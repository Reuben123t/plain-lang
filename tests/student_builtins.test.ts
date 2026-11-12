import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createStandardEnvironment } from "../src/builtins/index";
import { runPlain } from "../src/index";

async function executePlain(code: string): Promise<string[]> {
  const outputs: string[] = [];
  await runPlain(code, {
    onSay: (msg) => outputs.push(msg),
    onShow: (msg) => outputs.push(msg)
  });
  return outputs;
}

describe("Student Built-in Functions Suite (150+ functions)", () => {
  it("registers at least 150 built-in functions and aliases", () => {
    const env = createStandardEnvironment();
    const names = env.getAllVariableNames();
    assert.ok(names.length >= 150, `Expected at least 150 functions, got ${names.length}`);
  });

  it("evaluates student math builtins", async () => {
    const env = createStandardEnvironment();
    const gcd = env.lookup("gcd") as any;
    const isPrime = env.lookup("is_prime") as any;
    const factorial = env.lookup("factorial") as any;
    const quad = env.lookup("quadratic_roots") as any;

    assert.equal(gcd.nativeFn(24, 36), 12);
    assert.equal(isPrime.nativeFn(29), true);
    assert.equal(isPrime.nativeFn(30), false);
    assert.equal(factorial.nativeFn(5), 120);
    assert.deepEqual(quad.nativeFn(1, -5, 6), [3, 2]);
  });

  it("evaluates geometry builtins", async () => {
    const env = createStandardEnvironment();
    const hypot = env.lookup("hypotenuse") as any;
    const areaCirc = env.lookup("area_circle") as any;

    assert.equal(hypot.nativeFn(3, 4), 5);
    const area = areaCirc.nativeFn(10);
    assert.ok(Math.abs(area - 314.159) < 0.01);
  });

  it("evaluates statistics builtins", async () => {
    const env = createStandardEnvironment();
    const median = env.lookup("median") as any;
    const mean = env.lookup("mean") as any;
    const mode = env.lookup("mode") as any;

    assert.equal(median.nativeFn([10, 20, 30, 40, 50]), 30);
    assert.equal(mean.nativeFn([10, 20, 30]), 20);
    assert.equal(mode.nativeFn([1, 2, 2, 3, 4]), 2);
  });

  it("evaluates science and physics builtins", async () => {
    const env = createStandardEnvironment();
    const atomicMass = env.lookup("atomic_mass") as any;
    const elemName = env.lookup("element_name") as any;
    const force = env.lookup("force") as any;
    const ke = env.lookup("kinetic_energy") as any;

    assert.equal(atomicMass.nativeFn("Au"), 196.97);
    assert.equal(elemName.nativeFn("Fe"), "Iron");
    assert.equal(force.nativeFn(10, 9.8), 98);
    assert.equal(ke.nativeFn(2, 3), 9); // 0.5 * 2 * 9 = 9
  });

  it("evaluates student grade & unit conversion builtins", async () => {
    const env = createStandardEnvironment();
    const letterGrade = env.lookup("letter_grade") as any;
    const gpa = env.lookup("gpa_from_percentage") as any;
    const cToF = env.lookup("celsius_to_fahrenheit") as any;
    const kmToMi = env.lookup("km_to_miles") as any;

    assert.equal(letterGrade.nativeFn(95), "A");
    assert.equal(letterGrade.nativeFn(75), "C");
    assert.equal(gpa.nativeFn(95), 4.0);
    assert.equal(cToF.nativeFn(100), 212);
    assert.equal(kmToMi.nativeFn(10), 6.21371);
  });

  it("evaluates text builtins", async () => {
    const env = createStandardEnvironment();
    const isPal = env.lookup("is_palindrome") as any;
    const slug = env.lookup("slugify") as any;
    const cipher = env.lookup("caesar_cipher") as any;

    assert.equal(isPal.nativeFn("A man a plan a canal Panama"), true);
    assert.equal(slug.nativeFn("Hello World Student!"), "hello-world-student");
    assert.equal(cipher.nativeFn("abc", 1), "bcd");
  });

  it("evaluates list builtins", async () => {
    const env = createStandardEnvironment();
    const unique = env.lookup("unique") as any;
    const chunk = env.lookup("chunk") as any;
    const isSorted = env.lookup("is_sorted") as any;

    assert.deepEqual(unique.nativeFn([1, 2, 2, 3, 1]), [1, 2, 3]);
    assert.deepEqual(chunk.nativeFn([1, 2, 3, 4], 2), [[1, 2], [3, 4]]);
    assert.equal(isSorted.nativeFn([1, 2, 3, 4]), true);
    assert.equal(isSorted.nativeFn([4, 2, 3]), false);
  });

  it("evaluates time and system builtins", async () => {
    const env = createStandardEnvironment();
    const leap = env.lookup("is_leap_year") as any;
    const defWord = env.lookup("define_word") as any;
    const hash = env.lookup("hash_text") as any;

    assert.equal(leap.nativeFn(2024), true);
    assert.equal(leap.nativeFn(2025), false);
    assert.ok(typeof defWord.nativeFn("gravity") === "string");
    assert.ok(defWord.nativeFn("gravity").includes("force"));
    assert.equal(typeof hash.nativeFn("student test"), "string");
  });

  it("runs an integrated student program in PLAIN", async () => {
    const program = `
set scores to [95, 88, 72, 91, 84]
set avg_score to average(scores)
set grade to letter_grade(avg_score)
say "Average: " + to_text(avg_score)
say "Final Grade: " + grade
`;
    const outputs = await executePlain(program);
    assert.equal(outputs.length, 2);
    assert.equal(outputs[0], "Average: 86");
    assert.equal(outputs[1], "Final Grade: B");
  });
});
