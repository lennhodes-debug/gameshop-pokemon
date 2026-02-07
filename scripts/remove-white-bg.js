const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const dir = "/home/user/gameshop/public/images/nintendo/";

async function removeWhiteBg(filePath) {
  const name = path.basename(filePath);
  if (!name.endsWith("-console.webp")) return;
  
  try {
    // Read image, convert to PNG with alpha, then replace white-ish pixels with transparent
    const { data, info } = await sharp(filePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Replace white/near-white pixels with transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      // If pixel is white-ish (all channels > 240)
      if (r > 240 && g > 240 && b > 240) {
        data[i+3] = 0; // Make transparent
      }
      // Fade near-white pixels (230-240)
      else if (r > 225 && g > 225 && b > 225) {
        const avg = (r + g + b) / 3;
        data[i+3] = Math.round(255 * (1 - (avg - 225) / 30));
      }
    }
    
    const tmpPath = filePath + ".tmp.webp";
    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .webp({ quality: 90, alphaQuality: 100 })
      .toFile(tmpPath);
    
    fs.unlinkSync(filePath);
    fs.renameSync(tmpPath, filePath);
    console.log("OK: " + name + " (" + info.width + "x" + info.height + ")");
  } catch(e) {
    console.log("ERROR: " + name + ": " + e.message);
  }
}

async function main() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith("-console.webp"));
  for (const f of files) {
    await removeWhiteBg(path.join(dir, f));
  }
  console.log("Done!");
}

main();
