import sharp from "sharp";
import fs from "fs";
import path from "path";

const DIR = "/home/z/my-project/public/images/fujicards";
const MAX_WIDTH = 400;
const QUALITY = 70;

interface FileResult {
  name: string;
  beforeBytes: number;
  afterBytes: number;
}

async function getFileSize(filePath: string): Promise<number> {
  const stat = await fs.promises.stat(filePath);
  return stat.size;
}

async function getDirectorySize(dir: string): Promise<number> {
  const files = await fs.promises.readdir(dir);
  let total = 0;
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);
    if (stat.isFile()) total += stat.size;
  }
  return total;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  const beforeTotal = await getDirectorySize(DIR);

  const allFiles = await fs.promises.readdir(DIR);

  // Separate by extension
  const jpgFiles = allFiles.filter((f) => /\.(jpg|jpeg)$/i.test(f));
  const webpFiles = allFiles.filter((f) => /\.webp$/i.test(f));

  // Build a set of webp basenames (without extension)
  const webpBasenames = new Set(
    webpFiles.map((f) => path.basename(f, ".webp"))
  );

  const results: FileResult[] = [];

  console.log(`\n=== Image Optimization ===`);
  console.log(`Directory: ${DIR}`);
  console.log(`Max width: ${MAX_WIDTH}px | WebP quality: ${QUALITY}`);
  console.log(`Found: ${jpgFiles.length} JPG/JPEG, ${webpFiles.length} WebP`);
  console.log(`Total before: ${formatBytes(beforeTotal)}\n`);

  // Phase 1: Convert JPG/JPEG → WebP (overwrite existing), then delete JPG
  console.log("--- Phase 1: Converting JPG/JPEG to WebP ---");
  for (const jpgFile of jpgFiles) {
    const jpgPath = path.join(DIR, jpgFile);
    const baseName = path.basename(jpgFile, path.extname(jpgFile));
    const webpPath = path.join(DIR, `${baseName}.webp`);

    try {
      const beforeBytes = await getFileSize(jpgPath);

      await sharp(jpgPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(webpPath + ".tmp");

      // Replace original webp with optimized version
      await fs.promises.rename(webpPath + ".tmp", webpPath);

      const afterBytes = await getFileSize(webpPath);

      // Delete the original JPG/JPEG
      await fs.promises.unlink(jpgPath);

      results.push({ name: jpgFile, beforeBytes, afterBytes });
      console.log(
        `  ${jpgFile} → ${baseName}.webp: ${formatBytes(beforeBytes)} → ${formatBytes(afterBytes)} (${Math.round((1 - afterBytes / beforeBytes) * 100)}% reduction)`
      );
    } catch (err) {
      console.error(`  ERROR processing ${jpgFile}:`, err);
    }
  }

  // Phase 2: Re-encode standalone WebP files (those without a corresponding JPG)
  console.log("\n--- Phase 2: Re-encoding standalone WebP files ---");
  let webpProcessed = 0;
  for (const webpFile of webpFiles) {
    const baseName = path.basename(webpFile, ".webp");
    // Skip if this webp already had a JPG that we converted in phase 1
    if (jpgFiles.some((j) => path.basename(j, path.extname(j)) === baseName)) {
      continue;
    }

    const webpPath = path.join(DIR, webpFile);

    try {
      const beforeBytes = await getFileSize(webpPath);

      await sharp(webpPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(webpPath + ".tmp");

      const afterBytes = await getFileSize(webpPath + ".tmp");

      // Only overwrite if the new version is smaller
      if (afterBytes < beforeBytes) {
        await fs.promises.rename(webpPath + ".tmp", webpPath);
        results.push({ name: webpFile, beforeBytes, afterBytes });
        console.log(
          `  ${webpFile}: ${formatBytes(beforeBytes)} → ${formatBytes(afterBytes)} (${Math.round((1 - afterBytes / beforeBytes) * 100)}% reduction)`
        );
      } else {
        // New version is larger — keep original
        await fs.promises.unlink(webpPath + ".tmp");
        console.log(
          `  ${webpFile}: ${formatBytes(beforeBytes)} → ${formatBytes(afterBytes)} (kept original, new was larger)`
        );
      }
      webpProcessed++;
    } catch (err) {
      console.error(`  ERROR processing ${webpFile}:`, err);
    }
  }

  const afterTotal = await getDirectorySize(DIR);

  console.log(`\n=== Summary ===`);
  console.log(`Files processed: ${results.length}`);
  console.log(
    `Total before:  ${formatBytes(beforeTotal)}`
  );
  console.log(
    `Total after:   ${formatBytes(afterTotal)}`
  );
  console.log(
    `Total saved:   ${formatBytes(beforeTotal - afterTotal)} (${Math.round((1 - afterTotal / beforeTotal) * 100)}% reduction)`
  );

  // Verify: count remaining files
  const remainingFiles = await fs.promises.readdir(DIR);
  const remainingJpg = remainingFiles.filter((f) => /\.(jpg|jpeg)$/i.test(f));
  const remainingWebp = remainingFiles.filter((f) => /\.webp$/i.test(f));
  console.log(`\nRemaining: ${remainingWebp.length} WebP, ${remainingJpg.length} JPG/JPEG`);
  if (remainingJpg.length > 0) {
    console.log(`WARNING: Some JPG files remain: ${remainingJpg.join(", ")}`);
  }
}

main().catch(console.error);
