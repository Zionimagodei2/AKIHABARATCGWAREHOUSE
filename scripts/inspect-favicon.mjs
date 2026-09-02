import sharp from "sharp";
import fs from "fs";

// Convert favicon.ico -> PNG for inspection
const ico = "/home/z/my-project/public/favicon.ico";
const buf = fs.readFileSync(ico);
console.log("favicon.ico size:", buf.length, "bytes");
console.log("ICO header: entries =", buf.readUInt16LE(4));

// Extract first image from ICO (works for PNG-embedded ICOs)
const img = sharp(ico, { failOn: "none" });
const meta = await img.metadata();
console.log("favicon.ico metadata:", JSON.stringify(meta));
await sharp(ico).resize(128, 128, { fit: "contain" }).png().toFile("/home/z/my-project/scripts/favicon-ico-preview.png");
console.log("saved favicon-ico-preview.png");

// Also make quick previews of apple-touch-icon and android icons at comparable size
for (const f of ["apple-touch-icon.png", "android-chrome-192.png", "android-chrome-512.png"]) {
  await sharp(`/home/z/my-project/public/${f}`).resize(200, 200, { fit: "contain" }).png().toFile(`/home/z/my-project/scripts/preview-${f}`);
  console.log("saved preview-", f);
}
