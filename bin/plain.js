#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

const distPath = path.join(__dirname, "..", "dist", "cli", "cli.js");

if (fs.existsSync(distPath)) {
  const cli = require(distPath);
  if (typeof cli.main === "function") {
    cli.main().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
} else {
  console.error("PLAIN is not compiled yet. Please run 'npm run build' first.");
  process.exit(1);
}
