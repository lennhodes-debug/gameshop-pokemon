const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const imgPath = path.join(__dirname, "../public/images/products/");
const files = fs.readdirSync(imgPath).filter(f => f.endsWith(".webp"));

async function check() {
  const nonStandard = [];
  let total = 0;

  for (const f of files) {
    try {
      const meta = await sharp(path.join(imgPath, f)).metadata();
      total++;
      if (meta.width !== 500 || meta.height !== 500) {
        const size = fs.statSync(path.join(imgPath, f)).size;
        nonStandard.push({ file: f, w: meta.width, h: meta.height, size });
      }
    } catch (e) {
      console.log("ERROR: " + f + ": " + e.message);
    }
  }

  console.log("Total images: " + total);
  console.log("Non-500x500: " + nonStandard.length);
  nonStandard.sort((a, b) => a.file.localeCompare(b.file));
  nonStandard.forEach(i => {
    console.log(i.file + ": " + i.w + "x" + i.h + " (" + Math.round(i.size / 1024) + "KB)");
  });
}

check();
