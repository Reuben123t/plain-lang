import { test, expect, _electron as electron, type ElectronApplication, type Page } from "@playwright/test";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import AxeBuilder from "@axe-core/playwright";

let app: ElectronApplication;
let page: Page;
let profile: string;
const desktop = path.resolve(__dirname, "..");

async function launch(args: string[] = []) {
  const env: Record<string, string> = { ...Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined)), PLAIN_DESKTOP_TEST_DIR: profile };
  delete env.ELECTRON_RUN_AS_NODE;
  app = await electron.launch({ args: [desktop, "--test-mode", ...args], env, cwd: desktop });
  page = await app.firstWindow();
  await expect(page.getByRole("button", { name: "Plain Studio home" })).toBeVisible();
}
async function trustDialogs(response = 1) {
  await app.evaluate(({ dialog }, response) => {
    dialog.showMessageBox = async () => ({ response, checkboxChecked: false });
  }, response);
}
async function replaceSource(source: string) {
  const input = page.getByRole("textbox", { name: "Plain code editor" });
  await input.focus();
  await input.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.insertText(source);
}

test.beforeEach(async () => { profile = await mkdtemp(path.join(os.tmpdir(), "plain-studio-e2e-")); });
async function exitApp() {
  if (!app) return;
  await app.evaluate(({ app }) => app.exit(0)).catch(() => undefined);
  await app.close().catch(() => undefined);
}
test.afterEach(async () => { await exitApp(); await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); });

test("welcome, examples, keyboard palette, preferences, and renderer boundary", async () => {
  await launch();
  await expect(page.getByRole("heading", { name: "Think it. Write it in Plain." })).toBeVisible();
  await page.screenshot({ path: path.join(desktop, "test-results/welcome.png") });
  const welcomeAccessibility = await new AxeBuilder({ page }).setLegacyMode().withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(welcomeAccessibility.violations).toEqual([]);
  const boundary = await page.evaluate(() => ({ require: typeof (window as any).require, process: typeof (window as any).process, bridge: Object.keys(window.plain || {}) }));
  expect(boundary.require).toBe("undefined");
  expect(boundary.process).toBe("undefined");
  expect(boundary.bridge).not.toContain("send");
  await page.getByRole("button", { name: "All examples" }).click();
  await expect(page.getByRole("heading", { name: "Learn by making." })).toBeVisible();
  await page.getByRole("button", { name: /01 Start here Hello, world/ }).click();
  await expect(page.getByRole("button", { name: /^hello.plain/ })).toBeVisible();
  await page.getByRole("button", { name: "Open command palette", exact: true }).click();
  await page.getByRole("textbox", { name: "Search commands" }).fill("settings");
  await page.getByRole("textbox", { name: "Search commands" }).press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Appearance").selectOption("light");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.setViewportSize({ width: 980, height: 720 });
  await expect(page.getByRole("button", { name: "Run current file (F5)" })).toBeVisible();
});

test("open Unicode file, run with input, save, stop, and reject stale input", async () => {
  const file = path.join(profile, "hello café.plain");
  await writeFile(file, 'ask "Your name?" and save as visitor\nsay "Hello, " plus visitor\n');
  await launch([file]);
  await expect(page.getByRole("button", { name: /^hello café.plain/ })).toBeVisible();
  await trustDialogs();
  await page.getByRole("button", { name: "Run current file (F5)" }).click();
  await expect(page.getByLabel("Your name?", { exact: true })).toBeVisible();
  await page.getByLabel("Your name?", { exact: true }).fill("Studio");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.locator(".program-output")).toContainText("Hello, Studio");
  await expect(page.locator("#run-status")).toContainText("Completed");
  await page.screenshot({ path: path.join(desktop, "test-results/editor.png") });
  await replaceSource('say "Saved from Studio"\n');
  await app.evaluate(({ Menu }) => {
    const fileMenu = Menu.getApplicationMenu()!.items.find((item) => item.label === "File")!;
    const save = fileMenu.submenu!.items.find((item) => item.label === "Save")!;
    save.click();
  });
  await expect.poll(() => readFile(file, "utf8")).toContain("Saved from Studio");
  await replaceSource("repeat while true\nend\n");
  await page.getByRole("button", { name: "Run current file (F5)" }).click();
  await expect(page.getByRole("button", { name: "Stop running program", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Stop running program", exact: true }).click();
  await expect(page.locator("#run-status")).toContainText("Stopped");
});

test("cancelled save preserves dirty tab and recovery restores without execution", async () => {
  await launch();
  await page.getByRole("button", { name: "Create a new file" }).click();
  await replaceSource('say "Recovered, not executed"\n');
  await app.evaluate(({ dialog }) => {
    dialog.showMessageBox = async () => ({ response: 0, checkboxChecked: false });
    dialog.showSaveDialog = async () => ({ canceled: true, filePath: "" });
  });
  await page.getByRole("button", { name: "Close untitled.plain", exact: true }).click();
  await expect(page.getByRole("button", { name: /^untitled.plain/ })).toBeVisible();
  await expect(page.getByLabel("Unsaved changes")).toBeVisible();
  await expect.poll(async () => {
    const files = await app.evaluate(({ app }) => app.getPath("userData"));
    return (await import("node:fs/promises")).readdir(files);
  }).not.toEqual([]);
  // Exit without the close handshake to exercise recovery after an interrupted session.
  await exitApp();
  await launch();
  await expect(page.getByRole("button", { name: /^untitled.plain/ })).toBeVisible();
  await expect(page.getByLabel("Unsaved changes")).toBeVisible();
  await expect(page.locator("#run-status")).toHaveText("Ready");
  await expect(page.locator(".view-lines")).toContainText("Recovered, not executed");
});
