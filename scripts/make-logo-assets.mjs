import sharp from "sharp";
import fs from "fs";

/**
 * Rebuild all brand icon assets from the user's correct logo photo
 * (the actual Akihabara TCG Warehouse storefront).
 *
 * The old /logo.webp was a leftover circular "brush-stroke A" emblem that
 * never matched the favicon (store photo). This script regenerates every
 * icon from one master image so logo == favicon everywhere.
 */
const SRC = "/home/z/my-project/upload/file_000000003ea471f4a311e1fe579c1730.png";
const PUB = "/home/z/my-project/public";

// sanity: master must be a clean square photo
const meta = await sharp(SRC).metadata();
console.log("master:", meta.width + "x" + meta.height, meta.format);

// 1) Visible site logo — 256x256 webp (displayed at 32-56px, crisp on 3x DPR)
await sharp(SRC).resize(256, 256, { fit: "cover" })
  .webp({ quality: 82, effort: 6 })
  .toFile(`${PUB}/store-logo.webp`);

// 2) favicon-32.png
await sharp(SRC).resize(32, 32, { fit: "cover" }).png().toFile(`${PUB}/favicon-32.png`);

// 3) apple-touch-icon.png — 180x180 full bleed (iOS rounds corners itself)
await sharp(SRC).resize(180, 180, { fit: "cover" }).png().toFile(`${PUB}/apple-touch-icon.png`);

// 4) android-chrome-192.png
await sharp(SRC).resize(192, 192, { fit: "cover" }).png().toFile(`${PUB}/android-chrome-192.png`);

// 5) android-chrome-512.png (palette PNG to keep the PWA icon lean)
await sharp(SRC).resize(512, 512, { fit: "cover" })
  .png({ palette: true, quality: 90, compressionLevel: 9 })
  .toFile(`${PUB}/android-chrome-512.png`);

// 6) favicon.ico — modern PNG-in-ICO container with 16/32/48 entries
const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((s) => sharp(SRC).resize(s, s, { fit: "cover" }).png().toBuffer())
);

// ICONDIR (6 bytes): reserved=0, type=1 (icon), count
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);

// ICONDIRENTRY (16 bytes each): w, h, colorCount, reserved, planes, bitCount, bytesInRes, offset
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0);        // width
  e.writeUInt8(s, 1);        // height
  e.writeUInt8(0, 2);        // color count (0 = truecolor)
  e.writeUInt8(0, 3);        // reserved
  e.writeUInt16LE(1, 4);     // color planes
  e.writeUInt16LE(32, 6);    // bits per pixel
  e.writeUInt32LE(pngs[i].length, 8); // bytes in resource
  e.writeUInt32LE(offset, 12);        // offset to image data
  offset += pngs[i].length;
  return e;
});

fs.writeFileSync(`${PUB}/favicon.ico`, Buffer.concat([header, ...entries, ...pngs]));

// report
const report = {};
for (const f of ["store-logo.webp", "favicon.ico", "favicon-32.png", "apple-touch-icon.png", "android-chrome-192.png", "android-chrome-512.png"]) {
  const st = fs.statSync(`${PUB}/${f}`);
  const m = await sharp(`${PUB}/${f}`).metadata().catch(() => ({}));
  report[f] = `${m.width || "?"}x${m.height || "?"} ${(st.size / 1024).toFixed(1)}KB`;
}
console.table(report);

// extraction check: PIL-style structural validation (libvips can't parse
// multi-entry PNG-in-ICO files, but browsers handle them fine)
const icoBuf = fs.readFileSync(`${PUB}/favicon.ico`);
const count = icoBuf.readUInt16LE(4);
let icoOk = count === sizes.length;
for (let i = 0; i < count && icoOk; i++) {
  const o = 6 + 16 * i;
  const off = icoBuf.readUInt32LE(o + 12);
  icoOk = icoBuf.slice(off, off + 4).toString("hex") === "89504e47"; // PNG magic
}
console.log(`favicon.ico: ${count} entries, PNG magic ${icoOk ? "OK" : "BROKEN"}`);
