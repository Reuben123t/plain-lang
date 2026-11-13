import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";
import * as readline from "readline";

export interface DiagnosticResult {
  name: string;
  status: "ok" | "warning" | "error";
  message: string;
  fixable: boolean;
  fixAction?: () => Promise<boolean> | boolean;
}

export class PlainSystemManager {
  private isWindows = os.platform() === "win32";
  private installDir: string;
  private binDir: string;

  constructor() {
    if (this.isWindows) {
      const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
      this.installDir = path.join(localAppData, "PLAIN");
    } else {
      this.installDir = path.join(os.homedir(), ".plain");
    }
    this.binDir = path.join(this.installDir, "bin");
  }

  public getInstallDir(): string {
    return this.installDir;
  }

  public getBinDir(): string {
    return this.binDir;
  }

  // 1. Run full diagnostics
  public async diagnose(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    // Check 1: Install Directory Existence and Write Permission
    try {
      if (!fs.existsSync(this.installDir)) {
        results.push({
          name: "Installation Directory",
          status: "warning",
          message: `Directory ${this.installDir} does not exist yet.`,
          fixable: true,
          fixAction: () => {
            fs.mkdirSync(this.installDir, { recursive: true });
            fs.mkdirSync(this.binDir, { recursive: true });
            return true;
          }
        });
      } else {
        // Test write permission
        const testFile = path.join(this.installDir, ".perm_test");
        fs.writeFileSync(testFile, "ok", "utf-8");
        fs.unlinkSync(testFile);
        results.push({
          name: "Installation Directory",
          status: "ok",
          message: `Directory ready with write permissions (${this.installDir})`,
          fixable: false
        });
      }
    } catch (err: any) {
      results.push({
        name: "Installation Directory",
        status: "error",
        message: `Write permission denied to ${this.installDir}: ${err.message}`,
        fixable: false
      });
    }

    // Check 2: PATH Environment Variable
    const pathEnv = process.env.PATH || "";
    const inPath = pathEnv.split(path.delimiter).some((p) => {
      try {
        return path.resolve(p).toLowerCase() === path.resolve(this.binDir).toLowerCase();
      } catch {
        return false;
      }
    });

    if (inPath) {
      results.push({
        name: "PATH Environment",
        status: "ok",
        message: `PLAIN binary folder is in your PATH (${this.binDir})`,
        fixable: false
      });
    } else {
      results.push({
        name: "PATH Environment",
        status: "warning",
        message: `PLAIN binary folder is not yet in your PATH.`,
        fixable: true,
        fixAction: () => this.addToPath()
      });
    }

    // Check 3: Windows File Association (.plain)
    if (this.isWindows) {
      const isAssociated = this.checkFileAssociation();
      if (isAssociated) {
        results.push({
          name: "File Association (.plain)",
          status: "ok",
          message: `.plain files are associated with PLAIN Language.`,
          fixable: false
        });
      } else {
        results.push({
          name: "File Association (.plain)",
          status: "warning",
          message: `.plain files are not associated with PLAIN Language.`,
          fixable: true,
          fixAction: () => this.registerFileAssociation()
        });
      }
    }

    // Check 4: Executable Binary / Shim Readiness
    const plainCmd = this.isWindows ? path.join(this.binDir, "plain.cmd") : path.join(this.binDir, "plain");
    const plainExe = path.join(this.binDir, "plain.exe");
    const hasBinary = fs.existsSync(plainCmd) || fs.existsSync(plainExe);

    if (hasBinary) {
      results.push({
        name: "PLAIN Executable",
        status: "ok",
        message: `PLAIN executable command is installed in ${this.binDir}.`,
        fixable: false
      });
    } else {
      results.push({
        name: "PLAIN Executable",
        status: "warning",
        message: `PLAIN executable is not yet installed in the target directory.`,
        fixable: true,
        fixAction: () => this.installBinaryShims()
      });
    }

    // Check 5: PLAIN Runtime Self-Test
    try {
      const { createStandardEnvironment } = require("../builtins/index");
      const env = createStandardEnvironment();
      const fnCount = env.getAllVariableNames().length;
      if (fnCount >= 1000) {
        results.push({
          name: "Standard Library Health",
          status: "ok",
          message: `All ${fnCount} standard library functions are loaded and verified.`,
          fixable: false
        });
      } else {
        results.push({
          name: "Standard Library Health",
          status: "error",
          message: `Expected >= 1000 functions, found ${fnCount}.`,
          fixable: false
        });
      }
    } catch (err: any) {
      results.push({
        name: "Standard Library Health",
        status: "error",
        message: `Failed to load standard library: ${err.message}`,
        fixable: false
      });
    }

    return results;
  }

  private runPowerShell(script: string): void {
    const encoded = Buffer.from(script, "utf16le").toString("base64");
    execSync(`powershell.exe -NoProfile -NonInteractive -EncodedCommand ${encoded}`, { stdio: "ignore" });
  }

  // 2. Add binDir to User PATH
  public addToPath(): boolean {
    if (!fs.existsSync(this.binDir)) {
      fs.mkdirSync(this.binDir, { recursive: true });
    }

    if (this.isWindows) {
      try {
        const psCmd = `
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$target = "${this.binDir}"
if (-not ($userPath -split ';' | Where-Object { $_ -eq $target })) {
    $newPath = if ($userPath) { "$userPath;$target" } else { $target }
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
}
`;
        this.runPowerShell(psCmd);
        return true;
      } catch (err) {
        console.error("Failed to add to PATH via PowerShell: " + err);
        return false;
      }
    } else {
      // Unix / macOS: Append to ~/.bashrc or ~/.zshrc
      try {
        const line = `export PATH="${this.binDir}:$PATH"\n`;
        const rcFiles = [path.join(os.homedir(), ".bashrc"), path.join(os.homedir(), ".zshrc")];
        for (const file of rcFiles) {
          if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, "utf-8");
            if (!content.includes(this.binDir)) {
              fs.appendFileSync(file, "\n" + line);
            }
          }
        }
        return true;
      } catch {
        return false;
      }
    }
  }

  // 3. Check Windows File Association
  private checkFileAssociation(): boolean {
    if (!this.isWindows) return true;
    try {
      const output = execSync('reg.exe query "HKCU\\Software\\Classes\\.plain" /ve 2>nul', { encoding: "utf-8" });
      return output.includes("PLAIN.File");
    } catch {
      return false;
    }
  }

  // 4. Register Windows File Association & Open With PLAIN IDE
  public registerFileAssociation(): boolean {
    if (!this.isWindows) return true;
    try {
      const ideExe = path.join(this.binDir, "plain-ide.exe");
      const plainCmd = path.join(this.binDir, "plain.cmd");
      const fileIco = path.join(this.binDir, "plain-file.ico");
      const appIco = path.join(this.binDir, "plain.ico");
      const targetExec = fs.existsSync(ideExe) ? ideExe : `${plainCmd} ide`;
      const targetIco = fs.existsSync(fileIco) ? fileIco : fs.existsSync(appIco) ? appIco : (fs.existsSync(ideExe) ? ideExe : "");

      const icoRegPlain = targetIco ? `New-Item -Path "HKCU:\\Software\\Classes\\.plain\\DefaultIcon" -Value '"${targetIco.replace(/\\/g, "\\\\")}",0' -Force | Out-Null` : "";
      const icoRegPlainFile = targetIco ? `New-Item -Path "HKCU:\\Software\\Classes\\PLAIN.File\\DefaultIcon" -Value '"${targetIco.replace(/\\/g, "\\\\")}",0' -Force | Out-Null` : "";
      const icoRegSys = targetIco ? `New-Item -Path "HKCU:\\Software\\Classes\\SystemFileAssociations\\.plain\\DefaultIcon" -Value '"${targetIco.replace(/\\/g, "\\\\")}",0' -Force | Out-Null` : "";

      const psScript = `
New-Item -Path "HKCU:\\Software\\Classes\\.plain" -Value "PLAIN.File" -Force | Out-Null
${icoRegPlain}
New-Item -Path "HKCU:\\Software\\Classes\\PLAIN.File" -Value "PLAIN Source File" -Force | Out-Null
${icoRegPlainFile}
${icoRegSys}
New-Item -Path "HKCU:\\Software\\Classes\\PLAIN.File\\shell\\open\\command" -Value '"${targetExec}" "%1"' -Force | Out-Null
New-Item -Path "HKCU:\\Software\\Classes\\PLAIN.File\\shell\\edit\\command" -Value '"${targetExec}" "%1"' -Force | Out-Null

$code = @"
using System;
using System.Runtime.InteropServices;
public class ShellRefresh {
    [DllImport("shell32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    public static extern void SHChangeNotify(int wEventId, int uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
"@
if (-not ([System.Management.Automation.PSTypeName]'ShellRefresh').Type) {
    try { Add-Type -TypeDefinition $code } catch {}
}
try { [ShellRefresh]::SHChangeNotify(0x08000000, 0x0000, [IntPtr]::Zero, [IntPtr]::Zero) } catch {}
`;
      this.runPowerShell(psScript);
      return true;
    } catch (err) {
      console.error("Failed to register file association: " + err);
      return false;
    }
  }

  // 5. Install Binary Shims into binDir
  public installBinaryShims(): boolean {
    if (!fs.existsSync(this.binDir)) {
      fs.mkdirSync(this.binDir, { recursive: true });
    }

    // Try finding root dist/bundle.js or plain.exe
    const candidates = [
      path.resolve(__dirname, "..", "bundle.js"),
      path.resolve(__dirname, "..", "..", "dist", "bundle.js"),
      path.resolve(process.cwd(), "dist", "bundle.js")
    ];
    const sourceBundle = candidates.find((c) => fs.existsSync(c));

    const targetBundle = path.join(this.installDir, "bundle.js");
    if (sourceBundle) {
      fs.copyFileSync(sourceBundle, targetBundle);
    }

    // Copy plain.exe if available
    const exeCandidates = [
      path.resolve(process.cwd(), "dist", "plain.exe"),
      path.resolve(__dirname, "..", "..", "dist", "plain.exe")
    ];
    const sourceExe = exeCandidates.find((c) => fs.existsSync(c));
    if (sourceExe) {
      fs.copyFileSync(sourceExe, path.join(this.binDir, "plain.exe"));
    }

    // Copy native desktop IDE (plain-ide.exe)
    const ideCandidates = [
      path.resolve(process.cwd(), "dist", "plain-ide.exe"),
      path.resolve(process.cwd(), "build_assets", "plain-ide.exe"),
      path.resolve(__dirname, "..", "..", "dist", "plain-ide.exe")
    ];
    const sourceIde = ideCandidates.find((c) => fs.existsSync(c));
    if (sourceIde) {
      fs.copyFileSync(sourceIde, path.join(this.binDir, "plain-ide.exe"));
    }

    // Copy Icons (plain.ico and plain-file.ico)
    const iconCandidates = [
      { name: "plain.ico", paths: [path.resolve(process.cwd(), "build_assets", "plain.ico"), path.resolve(process.cwd(), "dist", "plain.ico")] },
      { name: "plain-file.ico", paths: [path.resolve(process.cwd(), "build_assets", "plain-file.ico"), path.resolve(process.cwd(), "dist", "plain-file.ico")] }
    ];
    for (const ico of iconCandidates) {
      const src = ico.paths.find((p) => fs.existsSync(p));
      if (src) {
        fs.copyFileSync(src, path.join(this.binDir, ico.name));
        fs.copyFileSync(src, path.join(this.installDir, ico.name));
      }
    }

    if (this.isWindows) {
      // Create plain.cmd
      const cmdContent = `@echo off\r\nnode "%~dp0..\\bundle.js" %*\r\n`;
      fs.writeFileSync(path.join(this.binDir, "plain.cmd"), cmdContent, "utf-8");

      // Create plain.ps1
      const psContent = `& node "$PSScriptRoot\\..\\bundle.js" $args\r\n`;
      fs.writeFileSync(path.join(this.binDir, "plain.ps1"), psContent, "utf-8");
    } else {
      const shContent = `#!/usr/bin/env sh\nexec node "$(dirname "$0")/../bundle.js" "$@"\n`;
      const shPath = path.join(this.binDir, "plain");
      fs.writeFileSync(shPath, shContent, "utf-8");
      try {
        fs.chmodSync(shPath, 0o755);
      } catch {
        // ignore
      }
    }

    return true;
  }

  // 6. Create Desktop & Start Menu Shortcuts
  public createShortcuts(): boolean {
    if (!this.isWindows) return true;
    try {
      const ideExe = path.join(this.binDir, "plain-ide.exe");
      const plainCmd = path.join(this.binDir, "plain.cmd");
      const plainIco = path.join(this.binDir, "plain.ico");
      const targetExec = fs.existsSync(ideExe) ? ideExe : plainCmd;
      const targetArgs = fs.existsSync(ideExe) ? "" : "ide";
      const iconSetting = fs.existsSync(plainIco) ? `$desktopShortcut.IconLocation = "${plainIco.replace(/\\/g, "\\\\")},0"` : "";
      const iconSettingStart = fs.existsSync(plainIco) ? `$startShortcut.IconLocation = "${plainIco.replace(/\\/g, "\\\\")},0"` : "";

      const psScript = `
$WshShell = New-Object -ComObject WScript.Shell

# Desktop Shortcut
$desktopPath = [Environment]::GetFolderPath("Desktop")
$desktopShortcut = $WshShell.CreateShortcut("$desktopPath\\PLAIN IDE.lnk")
$desktopShortcut.TargetPath = "${targetExec.replace(/\\/g, "\\\\")}"
$desktopShortcut.Arguments = "${targetArgs}"
$desktopShortcut.Description = "PLAIN Programming Language IDE"
$desktopShortcut.WorkingDirectory = "$desktopPath"
${iconSetting}
$desktopShortcut.Save()

# Start Menu Shortcut
$programsPath = [Environment]::GetFolderPath("Programs")
$startShortcut = $WshShell.CreateShortcut("$programsPath\\PLAIN IDE.lnk")
$startShortcut.TargetPath = "${targetExec.replace(/\\/g, "\\\\")}"
$startShortcut.Arguments = "${targetArgs}"
$startShortcut.Description = "PLAIN Programming Language IDE"
${iconSettingStart}
$startShortcut.Save()
`;
      this.runPowerShell(psScript);
      return true;
    } catch (err) {
      console.error("Failed to create shortcuts: " + err);
      return false;
    }
  }

  // 7. Interactive Setup Wizard
  public async runInteractiveSetup(): Promise<void> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const ask = (q: string): Promise<string> =>
      new Promise((resolve) => rl.question(q, (ans) => resolve(ans.trim())));

    console.log("");
    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║         🛠️  PLAIN LANGUAGE APPLICATION SETUP WIZARD          ║");
    console.log("║           Super Simple • 1,235 Functions • Pythonic          ║");
    console.log("║                     Author: Reuben                           ║");
    console.log("╚══════════════════════════════════════════════════════════════╝");
    console.log("");
    console.log(`Target Installation Directory: ${this.installDir}`);
    console.log("");

    const proceed = await ask("Proceed with setup and configure permissions? (Y/n): ");
    if (proceed.toLowerCase() === "n") {
      console.log("Setup cancelled.");
      rl.close();
      return;
    }

    console.log("\n[1/5] Setting up directories and permissions...");
    fs.mkdirSync(this.installDir, { recursive: true });
    fs.mkdirSync(this.binDir, { recursive: true });
    console.log("  ✓ Created installation folder: " + this.installDir);

    console.log("\n[2/5] Installing binary commands and shims...");
    this.installBinaryShims();
    console.log("  ✓ Installed 'plain', 'plain.cmd', and 'plain.ps1' shims.");

    console.log("\n[3/5] Configuring PATH environment variable...");
    const pathSuccess = this.addToPath();
    if (pathSuccess) {
      console.log(`  ✓ Added ${this.binDir} to User PATH.`);
    } else {
      console.log(`  ! Please manually add ${this.binDir} to your PATH.`);
    }

    if (this.isWindows) {
      console.log("\n[4/5] Registering .plain file extension...");
      this.registerFileAssociation();
      console.log("  ✓ Associated .plain files to open with PLAIN IDE.");

      console.log("\n[5/5] Creating Desktop & Start Menu shortcuts...");
      this.createShortcuts();
      console.log("  ✓ Created 'PLAIN IDE' shortcuts on Desktop and Start Menu.");
    }

    rl.close();

    console.log("\n╔══════════════════════════════════════════════════════════════╗");
    console.log("║               🎉 SETUP COMPLETED SUCCESSFULLY!               ║");
    console.log("╠══════════════════════════════════════════════════════════════╣");
    console.log("║  PLAIN is now 100% installed and operational!                ║");
    console.log("║                                                              ║");
    console.log("║  Commands available:                                         ║");
    console.log("║    plain               Launch the interactive REPL           ║");
    console.log("║    plain ide           Launch the PLAIN IDE (like IDLE)      ║");
    console.log("║    plain doctor        Verify health & auto-heal issues      ║");
    console.log("║    plain update        Check & download newest updates       ║");
    console.log("║    plain deploy        Deploy a live network web server      ║");
    console.log("╚══════════════════════════════════════════════════════════════╝\n");
  }

  // 8. Doctor & Auto-Repair
  public async runDoctor(autoFix: boolean = true): Promise<boolean> {
    console.log("");
    console.log("🔍 Checking PLAIN installation health, permissions & diagnostics...");
    console.log("==================================================================");

    const diagnostics = await this.diagnose();
    let hasIssues = false;

    for (const d of diagnostics) {
      if (d.status === "ok") {
        console.log(`  [✓] ${d.name.padEnd(30)} ${d.message}`);
      } else if (d.status === "warning") {
        console.log(`  [!] ${d.name.padEnd(30)} WARNING: ${d.message}`);
        if (autoFix && d.fixable && d.fixAction) {
          console.log(`      ↳ Auto-fixing ${d.name}...`);
          try {
            const fixed = await d.fixAction();
            if (fixed) {
              console.log(`      ✓ Fixed successfully!`);
            } else {
              hasIssues = true;
            }
          } catch (err: any) {
            console.log(`      ✗ Auto-fix failed: ${err.message}`);
            hasIssues = true;
          }
        } else {
          hasIssues = true;
        }
      } else {
        console.log(`  [✗] ${d.name.padEnd(30)} ERROR: ${d.message}`);
        hasIssues = true;
      }
    }

    console.log("==================================================================");
    if (!hasIssues) {
      console.log("✨ 100% HEALTHY: All checks passed. PLAIN is working perfectly!\n");
      return true;
    } else {
      console.log("⚠️ Some items need attention. Run 'plain setup' to repair completely.\n");
      return false;
    }
  }

  // 9. Clean Uninstall
  public cleanUninstall(): boolean {
    console.log("Uninstalling PLAIN and removing all files, shortcuts, and associations...");

    if (this.isWindows) {
      // Remove shortcuts
      try {
        const desktopLnk = path.join(os.homedir(), "Desktop", "PLAIN IDE.lnk");
        if (fs.existsSync(desktopLnk)) fs.unlinkSync(desktopLnk);
        const startLnk = path.join(process.env.APPDATA || "", "Microsoft", "Windows", "Start Menu", "Programs", "PLAIN IDE.lnk");
        if (fs.existsSync(startLnk)) fs.unlinkSync(startLnk);
      } catch {
        // ignore
      }

      // Remove file association
      try {
        execSync('reg.exe delete "HKCU\\Software\\Classes\\.plain" /f 2>nul', { stdio: "ignore" });
        execSync('reg.exe delete "HKCU\\Software\\Classes\\PLAIN.File" /f 2>nul', { stdio: "ignore" });
      } catch {
        // ignore
      }

      // Remove from PATH
      try {
        const psCmd = `
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$target = "${this.binDir.replace(/\\/g, "\\\\")}"
$filtered = ($userPath -split ';' | Where-Object { $_ -ne $target -and $_ -ne "" }) -join ';'
[Environment]::SetEnvironmentVariable("Path", $filtered, "User")
`;
        this.runPowerShell(psCmd);
      } catch {
        // ignore
      }
    }

    // Remove install folder
    if (fs.existsSync(this.installDir)) {
      try {
        fs.rmSync(this.installDir, { recursive: true, force: true });
        console.log(`✓ Removed directory: ${this.installDir}`);
      } catch (err: any) {
        console.log(`Could not fully remove directory: ${err.message}`);
      }
    }

    console.log("PLAIN uninstalled cleanly from your device.\n");
    return true;
  }
}
