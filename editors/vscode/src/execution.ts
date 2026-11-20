import * as path from 'node:path';
import { isIP } from 'node:net';

/** Pure argument preparation. Nothing in this module launches a process. */
export interface RunnerSettings {
  executablePath: string;
  executableArguments: readonly string[];
  workingDirectory: string;
}

export interface ExecutionPaths {
  workspaceFolder?: string;
  filePath?: string;
  defaultDirectory: string;
  platform: NodeJS.Platform;
}

export interface ProcessPlan {
  executable: string;
  args: string[];
  cwd: string;
}

function checkText(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || /[\0\r\n]/.test(value)) {
    throw new Error(`${label} must be a string without NUL or newline characters.`);
  }
}

export function createProcessPlan(
  settings: RunnerSettings,
  paths: ExecutionPaths,
  args: readonly string[]
): ProcessPlan {
  checkText(settings.executablePath, 'plain.executablePath');
  checkText(settings.workingDirectory, 'plain.workingDirectory');
  if (!Array.isArray(settings.executableArguments)) {
    throw new Error('plain.executableArguments must be an array of strings.');
  }
  settings.executableArguments.forEach(value => checkText(value, 'plain.executableArguments'));
  if (args.some(value => typeof value !== 'string' || value.includes('\0'))) {
    throw new Error('Process arguments must be strings without NUL characters.');
  }

  const pathApi = paths.platform === 'win32' ? path.win32 : path.posix;
  const fileDir = paths.filePath ? pathApi.dirname(paths.filePath) : undefined;
  const baseDir = paths.workspaceFolder || fileDir || paths.defaultDirectory;
  const directory = settings.workingDirectory.replace(/\$\{([^}]+)\}/g, (_, variable: string) => {
    const value = variable === 'workspaceFolder' ? paths.workspaceFolder :
      variable === 'fileDirname' ? fileDir : undefined;
    if (!value) {
      throw new Error(`Cannot resolve \${${variable}} in plain.workingDirectory for this document.`);
    }
    return value;
  });
  if (directory.includes('${')) {
    throw new Error('plain.workingDirectory contains an incomplete variable substitution.');
  }
  const cwd = pathApi.resolve(baseDir, directory || '.');
  let executable = settings.executablePath.trim();
  if (!executable || /^['"]|['"]$/.test(executable)) {
    throw new Error('Set plain.executablePath to one executable path without wrapping quotes.');
  }
  if (paths.platform === 'win32' && /\.(?:cmd|bat)$/i.test(executable)) {
    throw new Error('Shell wrappers are not supported. Set plain.executablePath to node and put the absolute path to bin/plain.js in plain.executableArguments.');
  }
  if (!pathApi.isAbsolute(executable) && /[\\/]/.test(executable)) {
    executable = pathApi.resolve(cwd, executable);
  }
  return { executable, args: [...settings.executableArguments, ...args], cwd };
}

export function validateScanTarget(value: string): string | undefined {
  const host = value.trim();
  if (!host || host.length > 253 || /[\s\0]/.test(host)) {
    return 'Enter one hostname or IP address, without spaces.';
  }
  if (isIP(host)) return undefined;
  if (/^\d+(?:\.\d+){3}$/.test(host)) return 'Enter a valid IPv4 address.';
  const labels = host.replace(/\.$/, '').split('.');
  if (!labels.every(label => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label))) {
    return 'Use a hostname or IP address only, not a URL, port, path, or command.';
  }
  return undefined;
}

export function parseScanPorts(value: string): number[] {
  const pieces = value.split(',').map(port => port.trim());
  if (pieces.length > 100 || pieces.some(port => !/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535)) {
    throw new Error('Enter 1–100 comma-separated TCP ports, each between 1 and 65535.');
  }
  return [...new Set(pieces.map(Number))];
}

export function scanArguments(target: string, ports: string): string[] {
  const problem = validateScanTarget(target);
  if (problem) throw new Error(problem);
  return ['scan', target.trim(), parseScanPorts(ports).join(',')];
}
