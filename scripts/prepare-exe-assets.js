#!/usr/bin/env node
'use strict';

// Stage genuine inputs for the optional Windows launcher. Never pad, delete,
// overwrite, compile, sign, or publish an existing artifact from this script.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');

function parseArguments(argv) {
  const options = {
    output: path.join(root, 'build_assets', 'native'),
    bundle: path.join(root, 'dist', 'bundle.js'),
    help: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help' || argument === '-h') {
      options.help = true;
    } else if (argument === '--output' || argument === '--bundle') {
      const value = argv[++index];
      if (!value || value.startsWith('--')) {
        throw new Error(`${argument} requires a path.`);
      }
      options[argument.slice(2)] = path.resolve(value);
    } else {
      throw new Error(`Unknown argument: ${argument}. Use --help for usage.`);
    }
  }
  return options;
}

function requireFile(filename, description) {
  let stat;
  try {
    stat = fs.lstatSync(filename);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    throw new Error(`${description} is missing: ${filename}`);
  }
  if (!stat.isFile() || stat.size === 0) {
    throw new Error(`${description} must be a nonempty regular file: ${filename}`);
  }
}

async function describeAsset(directory, relativePath) {
  const filename = path.join(directory, relativePath);
  const hash = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(filename)) hash.update(chunk);
  return {
    path: relativePath.split(path.sep).join('/'),
    sizeBytes: fs.statSync(filename).size,
    sha256: hash.digest('hex'),
  };
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  if (options.help) {
    console.log('Usage: node scripts/prepare-exe-assets.js [--output <empty-directory>] [--bundle <file>]');
    console.log('Windows / Node >=22 only. Run npm run build:bundle first.');
    console.log('Default output: build_assets/native. Existing files are never overwritten or removed.');
    console.log('Copies the current Node runtime, bundle, project documentation, and an optional icon.');
    console.log('Writes manifest.json with actual sizes and SHA-256 checksums; does not build an executable.');
    return;
  }

  if (process.platform !== 'win32') {
    throw new Error('Native asset preparation requires Windows. A non-Windows Node executable cannot be staged as node.exe. Use the portable source/package build on this platform.');
  }
  if (Number(process.versions.node.split('.')[0]) < 22) {
    throw new Error(`Node.js 22 or newer is required; found ${process.version}.`);
  }

  // Check every source before creating a destination. A normal tsc build alone
  // does not create the standalone CLI bundle used by the C# launcher.
  requireFile(process.execPath, 'Windows Node runtime');
  requireFile(options.bundle, 'CLI bundle (run npm ci and npm run build:bundle first)');
  const packageInfo = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  if (typeof packageInfo.version !== 'string' || !packageInfo.version) {
    throw new Error('package.json must provide the runtime version for the manifest.');
  }

  const sources = [
    { source: process.execPath, target: 'node.exe' },
    { source: options.bundle, target: 'bundle.js' },
  ];
  for (const name of ['README.md', 'LICENSE', 'CONTRIBUTING.md', 'SECURITY.md', 'CHANGELOG.md', 'ROADMAP.md']) {
    sources.push({ source: path.join(root, name), target: name });
  }
  const docsDirectory = path.join(root, 'docs');
  for (const entry of fs.readdirSync(docsDirectory, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      sources.push({ source: path.join(docsDirectory, entry.name), target: path.join('docs', entry.name) });
    }
  }
  const icon = path.join(docsDirectory, 'assets', 'plain-icon.ico');
  if (fs.existsSync(icon)) sources.push({ source: icon, target: 'plain.ico' });
  for (const asset of sources) requireFile(asset.source, `Asset ${asset.target}`);

  if (fs.existsSync(options.output)) {
    const stat = fs.lstatSync(options.output);
    if (!stat.isDirectory() || stat.isSymbolicLink() || fs.readdirSync(options.output).length !== 0) {
      throw new Error(`Output must be a new or empty real directory: ${options.output}. Choose another --output path; legacy assets will not be deleted.`);
    }
  }

  fs.mkdirSync(options.output, { recursive: true });
  const assets = [];
  try {
    for (const asset of sources) {
      const destination = path.join(options.output, asset.target);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(asset.source, destination, fs.constants.COPYFILE_EXCL);
      assets.push(await describeAsset(options.output, asset.target));
    }
    assets.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
    const manifest = {
      schemaVersion: 1,
      product: 'PLAIN',
      runtimeVersion: packageInfo.version,
      nodeVersion: process.versions.node,
      platform: process.platform,
      architecture: process.arch,
      checksumAlgorithm: 'sha256',
      totalAssetBytes: assets.reduce((total, asset) => total + asset.sizeBytes, 0),
      assets,
    };
    fs.writeFileSync(path.join(options.output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
    console.log(`Staged ${assets.length} genuine assets (${manifest.totalAssetBytes} bytes, excluding manifest.json).`);
    console.log(`Output: ${options.output}`);
    console.log('Review manifest.json before compiling. No executable was built and no legacy assets were changed.');
  } catch (error) {
    throw new Error(`${error.message}\nPartial staging may remain at ${options.output}; inspect it before choosing a fresh output directory.`);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Native asset preparation failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { main, parseArguments };
