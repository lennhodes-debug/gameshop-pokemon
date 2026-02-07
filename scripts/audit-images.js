const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const imgDir = path.join(__dirname, "../public/images/products/");
const MIN_SIZE = 5 * 1024; // 5KB minimum
const EXPECTED_WIDTH = 500;
const EXPECTED_HEIGHT = 500;

async function audit() {
  const allFiles = fs.readdirSync(imgDir);
  const webpFiles = allFiles.filter(f => f.endsWith(".webp"));
  const nonWebpFiles = allFiles.filter(f => !f.endsWith(".webp") && !f.startsWith("."));

  const issues = {
    tooSmall: [],       // < 5KB
    wrongDimensions: [], // niet 500x500
    corrupted: [],       // kan niet gelezen worden door sharp
    wrongMimeType: [],   // geen image mime type
    nonWebpFiles: [],    // bestanden die geen .webp zijn
  };

  let okCount = 0;
  let processedCount = 0;

  // Rapporteer non-webp bestanden
  if (nonWebpFiles.length > 0) {
    issues.nonWebpFiles = nonWebpFiles;
  }

  console.log("Audit gestart: " + webpFiles.length + " .webp bestanden gevonden\n");

  for (const f of webpFiles) {
    const filePath = path.join(imgDir, f);
    processedCount++;

    if (processedCount % 200 === 0) {
      console.log("  Verwerkt: " + processedCount + "/" + webpFiles.length + "...");
    }

    // 1. Bestandsgrootte controleren
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch (e) {
      issues.corrupted.push({ file: f, error: "Kan bestand niet lezen: " + e.message });
      continue;
    }

    const sizeKB = Math.round(stat.size / 1024 * 10) / 10;

    if (stat.size < MIN_SIZE) {
      issues.tooSmall.push({ file: f, sizeKB });
    }

    // 2. MIME type controleren via file command
    try {
      const mimeType = execSync("file -b --mime-type " + JSON.stringify(filePath), { encoding: "utf-8" }).trim();
      if (!mimeType.startsWith("image/")) {
        issues.wrongMimeType.push({ file: f, mimeType, sizeKB });
        continue; // Geen zin om dimensies te checken
      }
    } catch (e) {
      issues.corrupted.push({ file: f, error: "MIME check mislukt: " + e.message });
      continue;
    }

    // 3. Dimensies en integriteit controleren via sharp
    try {
      const meta = await sharp(filePath).metadata();

      if (meta.width !== EXPECTED_WIDTH || meta.height !== EXPECTED_HEIGHT) {
        issues.wrongDimensions.push({
          file: f,
          width: meta.width,
          height: meta.height,
          sizeKB,
          format: meta.format
        });
      } else {
        okCount++;
      }
    } catch (e) {
      issues.corrupted.push({ file: f, error: e.message, sizeKB });
    }
  }

  // === RAPPORT ===
  console.log("\n" + "=".repeat(70));
  console.log("  AUDIT RAPPORT — Productafbeeldingen Gameshop Enter");
  console.log("=".repeat(70));
  console.log("\nTotaal .webp bestanden:  " + webpFiles.length);
  console.log("OK (500x500, >5KB):      " + okCount);
  console.log("Problemen gevonden:      " + (webpFiles.length - okCount));

  // Te kleine bestanden
  console.log("\n--- TE KLEIN (<5KB) — waarschijnlijk kapot/placeholder ---");
  if (issues.tooSmall.length === 0) {
    console.log("  Geen problemen gevonden.");
  } else {
    console.log("  Aantal: " + issues.tooSmall.length);
    issues.tooSmall
      .sort((a, b) => a.sizeKB - b.sizeKB)
      .forEach(i => {
        console.log("  " + i.file + " (" + i.sizeKB + " KB)");
      });
  }

  // Verkeerd MIME type
  console.log("\n--- VERKEERD MIME TYPE — geen afbeelding ---");
  if (issues.wrongMimeType.length === 0) {
    console.log("  Geen problemen gevonden.");
  } else {
    console.log("  Aantal: " + issues.wrongMimeType.length);
    issues.wrongMimeType.forEach(i => {
      console.log("  " + i.file + " — type: " + i.mimeType + " (" + i.sizeKB + " KB)");
    });
  }

  // Corrupte bestanden
  console.log("\n--- CORRUPT — kan niet gelezen worden ---");
  if (issues.corrupted.length === 0) {
    console.log("  Geen problemen gevonden.");
  } else {
    console.log("  Aantal: " + issues.corrupted.length);
    issues.corrupted.forEach(i => {
      console.log("  " + i.file + " — " + i.error);
    });
  }

  // Verkeerde dimensies
  console.log("\n--- VERKEERDE DIMENSIES — niet 500x500 ---");
  if (issues.wrongDimensions.length === 0) {
    console.log("  Geen problemen gevonden.");
  } else {
    console.log("  Aantal: " + issues.wrongDimensions.length);
    issues.wrongDimensions
      .sort((a, b) => a.file.localeCompare(b.file))
      .forEach(i => {
        console.log("  " + i.file + " — " + i.width + "x" + i.height + " (" + i.sizeKB + " KB, " + i.format + ")");
      });
  }

  // Non-webp bestanden
  if (issues.nonWebpFiles.length > 0) {
    console.log("\n--- ONVERWACHTE BESTANDEN — geen .webp extensie ---");
    console.log("  Aantal: " + issues.nonWebpFiles.length);
    issues.nonWebpFiles.forEach(f => {
      const stat = fs.statSync(path.join(imgDir, f));
      console.log("  " + f + " (" + Math.round(stat.size / 1024) + " KB)");
    });
  }

  // Samenvatting
  const totalIssues = issues.tooSmall.length + issues.wrongMimeType.length +
    issues.corrupted.length + issues.wrongDimensions.length + issues.nonWebpFiles.length;

  console.log("\n" + "=".repeat(70));
  console.log("  SAMENVATTING");
  console.log("=".repeat(70));
  console.log("  Totaal bestanden:       " + (webpFiles.length + issues.nonWebpFiles.length));
  console.log("  WebP bestanden:         " + webpFiles.length);
  console.log("  OK:                     " + okCount);
  console.log("  Te klein (<5KB):        " + issues.tooSmall.length);
  console.log("  Verkeerd MIME type:     " + issues.wrongMimeType.length);
  console.log("  Corrupt:                " + issues.corrupted.length);
  console.log("  Verkeerde dimensies:    " + issues.wrongDimensions.length);
  console.log("  Non-webp bestanden:     " + issues.nonWebpFiles.length);
  console.log("  Totaal problemen:       " + totalIssues);
  console.log("=".repeat(70));

  // Exit code 1 als er problemen zijn
  if (totalIssues > 0) {
    process.exit(1);
  }
}

audit().catch(err => {
  console.error("Fatale fout: " + err.message);
  process.exit(2);
});
