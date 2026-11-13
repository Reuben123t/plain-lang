import { describe, it } from "node:test";
import * as assert from "node:assert";
import { runPlain } from "../src/index";
import { cyberSecurityBuiltins } from "../src/builtins/cyber_security";

describe("PLAIN Language - Set ABC = Main & Standard Symbols", () => {
  it("should support 'Set ABC = Main' assigning string 'Main' when Main is undefined", async () => {
    const outputs: string[] = [];
    const code = `
Set ABC = Main
say "Assigned ABC: " + ABC
Set role = Administrator
say "Role: " + role
`;
    await runPlain(code, { onSay: (msg) => outputs.push(msg) });

    assert.ok(outputs.includes("Assigned ABC: Main"));
    assert.ok(outputs.includes("Role: Administrator"));
  });

  it("should support direct 'ABC = Main' symbol assignment", async () => {
    const outputs: string[] = [];
    const code = `
ABC = Main
say "Direct: " + ABC
`;
    await runPlain(code, { onSay: (msg) => outputs.push(msg) });
    assert.ok(outputs.includes("Direct: Main"));
  });

  it("should evaluate existing variables if defined", async () => {
    const outputs: string[] = [];
    const code = `
Main = 999
Set ABC = Main
say "Evaluated: " + ABC
`;
    await runPlain(code, { onSay: (msg) => outputs.push(msg) });
    assert.ok(outputs.includes("Evaluated: 999"));
  });

  it("should use standard mathematical symbols +, -, *, /, **, //, % seamlessly", async () => {
    const outputs: string[] = [];
    const code = `
x = 10
y = 5
sum = x + y
diff = x - y
prod = x * y
quot = x / y
power = 2 ** 8
floor_div = 17 // 3
mod = 17 % 5
combined = (10 + 5) * 2 - 8 / 2

say "Sum: " + sum
say "Diff: " + diff
say "Prod: " + prod
say "Quot: " + quot
say "Power: " + power
say "Floor: " + floor_div
say "Mod: " + mod
say "Combined: " + combined
`;
    await runPlain(code, { onSay: (msg) => outputs.push(msg) });

    assert.ok(outputs.includes("Sum: 15"));
    assert.ok(outputs.includes("Diff: 5"));
    assert.ok(outputs.includes("Prod: 50"));
    assert.ok(outputs.includes("Quot: 2"));
    assert.ok(outputs.includes("Power: 256"));
    assert.ok(outputs.includes("Floor: 5"));
    assert.ok(outputs.includes("Mod: 2"));
    assert.ok(outputs.includes("Combined: 26"));
  });
});

describe("PLAIN Cybersecurity Engine", () => {
  it("should detect SQL injection patterns", () => {
    const malicious = "SELECT * FROM users WHERE username = 'admin' OR '1'='1'--";
    const res = cyberSecurityBuiltins.detect_sql_injection(malicious);
    assert.strictEqual(res.is_malicious, true);
    assert.strictEqual(res.risk_level, "HIGH");

    const safe = "Alice Wonderland";
    const resSafe = cyberSecurityBuiltins.detect_sql_injection(safe);
    assert.strictEqual(resSafe.is_malicious, false);
  });

  it("should detect Cross-Site Scripting (XSS) patterns", () => {
    const attack = "<script>alert(document.cookie)</script>";
    const res = cyberSecurityBuiltins.detect_xss(attack);
    assert.strictEqual(res.is_malicious, true);
    assert.strictEqual(res.risk_level, "HIGH");

    const safe = "Hello world!";
    const resSafe = cyberSecurityBuiltins.detect_xss(safe);
    assert.strictEqual(resSafe.is_malicious, false);
  });

  it("should sanitize HTML strings", () => {
    const dirty = '<div class="alert" onclick="evil()">Hello & Goodbye</div>';
    const clean = cyberSecurityBuiltins.sanitize_html(dirty);
    assert.ok(!clean.includes("<"));
    assert.ok(!clean.includes(">"));
    assert.ok(clean.includes("&lt;div"));
  });

  it("should calculate Shannon entropy for forensics", () => {
    // Low entropy
    const low = cyberSecurityBuiltins.calculate_entropy("AAAAAAAAAAAAAAAAAAAA");
    assert.strictEqual(low.shannon_entropy, 0);

    // High entropy (random bytes)
    const randomBytes = Buffer.alloc(256);
    for (let i = 0; i < 256; i++) randomBytes[i] = i;
    const high = cyberSecurityBuiltins.calculate_entropy(randomBytes);
    assert.strictEqual(high.shannon_entropy, 8);
  });

  it("should identify magic bytes and file signatures", () => {
    const exe = cyberSecurityBuiltins.detect_file_signature("4D5A900003000000");
    assert.strictEqual(exe.detected, true);
    assert.ok(exe.file_type.includes("Windows PE"));

    const elf = cyberSecurityBuiltins.detect_file_signature("7F454C4602010100");
    assert.strictEqual(elf.detected, true);
    assert.ok(elf.file_type.includes("Linux ELF"));

    const png = cyberSecurityBuiltins.detect_file_signature("89504E470D0A1A0A");
    assert.strictEqual(png.detected, true);
    assert.ok(png.file_type.includes("PNG"));
  });

  it("should calculate IPv4 subnets accurately", () => {
    const calc = cyberSecurityBuiltins.subnet_calculator("192.168.1.100/24");
    assert.strictEqual(calc.network, "192.168.1.0");
    assert.strictEqual(calc.broadcast, "192.168.1.255");
    assert.strictEqual(calc.netmask, "255.255.255.0");
    assert.strictEqual(calc.first_usable_host, "192.168.1.1");
    assert.strictEqual(calc.last_usable_host, "192.168.1.254");
    assert.strictEqual(calc.usable_hosts, 254);
  });

  it("should check password strength and breach dictionary", () => {
    const weak = cyberSecurityBuiltins.check_password_strength("password");
    assert.strictEqual(weak.breached_common, true);
    assert.strictEqual(weak.strength_rating, "VERY_WEAK");

    const strong = cyberSecurityBuiltins.check_password_strength("Cyb3r$h1eld_2026!P!L!A!I!N!");
    assert.strictEqual(strong.breached_common, false);
    assert.strictEqual(strong.strength_rating, "VERY_STRONG");
  });

  it("should lookup known CVEs from offline database", () => {
    const log4j = cyberSecurityBuiltins.cve_lookup("CVE-2021-44228");
    assert.strictEqual(log4j.cvss, 10.0);
    assert.strictEqual(log4j.severity, "CRITICAL");
    assert.ok(log4j.title.includes("Log4Shell"));
  });

  it("should lookup common and suspicious ports", () => {
    const ssh = cyberSecurityBuiltins.port_lookup(22);
    assert.strictEqual(ssh.service, "SSH");

    const metasploit = cyberSecurityBuiltins.port_lookup(4444);
    assert.strictEqual(metasploit.service, "Metasploit");
    assert.ok(metasploit.risk.includes("CRITICAL"));
  });

  it("should execute rate limiter sliding window checks", () => {
    const ip = "192.168.1.42";
    const res1 = cyberSecurityBuiltins.rate_limit_check(ip, 3, 10);
    assert.strictEqual(res1.allowed, true);
    assert.strictEqual(res1.current_requests, 1);

    cyberSecurityBuiltins.rate_limit_check(ip, 3, 10);
    const res3 = cyberSecurityBuiltins.rate_limit_check(ip, 3, 10);
    assert.strictEqual(res3.allowed, true);

    const res4 = cyberSecurityBuiltins.rate_limit_check(ip, 3, 10);
    assert.strictEqual(res4.allowed, false);
    assert.strictEqual(res4.action, "BLOCK_RATE_LIMIT_EXCEEDED");
  });
});

