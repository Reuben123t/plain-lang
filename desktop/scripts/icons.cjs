const fs = require("node:fs/promises");
const path = require("node:path");
const { Resvg } = require("@resvg/resvg-js");

module.exports = async function createIcons(root) {
  const source = await fs.readFile(path.join(root, "../assets/plain-logo.svg"), "utf8");
  const destination = path.join(root, "dist/icons");
  await fs.mkdir(destination, { recursive: true });
  const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
  const images = new Map();
  for (const size of sizes) {
    const image = Buffer.from(new Resvg(source, { fitTo: { mode: "width", value: size } }).render().asPng());
    images.set(size, image);
    await fs.writeFile(path.join(destination, `${size}x${size}.png`), image);
  }
  // Modern macOS icon-family entries carry PNGs with explicit big-endian chunk lengths.
  const chunks = [[16, "icp4"], [32, "icp5"], [64, "icp6"], [128, "ic07"], [256, "ic08"], [512, "ic09"], [1024, "ic10"]].map(([size, type]) => {
    const data = images.get(size);
    const header = Buffer.alloc(8);
    header.write(type, 0, 4, "ascii"); header.writeUInt32BE(data.length + 8, 4);
    return Buffer.concat([header, data]);
  });
  const header = Buffer.alloc(8);
  header.write("icns", 0); header.writeUInt32BE(8 + chunks.reduce((total, chunk) => total + chunk.length, 0), 4);
  await fs.writeFile(path.join(destination, "plain.icns"), Buffer.concat([header, ...chunks]));
  await fs.copyFile(path.join(destination, "512x512.png"), path.join(root, "dist/plain-logo.png"));
};
