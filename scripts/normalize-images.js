const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const imgDir = path.join(__dirname, "../public/images/products/");

async function normalize() {
  const files = fs.readdirSync(imgDir).filter(f => f.endsWith(".webp"));
  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const f of files) {
    const filePath = path.join(imgDir, f);
    try {
      const meta = await sharp(filePath).metadata();
      if (meta.width === 500 && meta.height === 500) {
        skipped++;
        continue;
      }

      // Resize to 500x500 with white background, contain fit
      const tmpPath = filePath + ".tmp";
      await sharp(filePath)
        .resize(500, 500, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .webp({ quality: 85 })
        .toFile(tmpPath);

      // Replace original
      fs.unlinkSync(filePath);
      fs.renameSync(tmpPath, filePath);
      fixed++;
      if (fixed % 50 === 0) console.log("Fixed " + fixed + " images...");
    } catch (e) {
      console.log("ERROR " + f + ": " + e.message);
      errors++;
    }
  }

  console.log("Done! Fixed: " + fixed + ", Already OK: " + skipped + ", Errors: " + errors);
}

normalize();
