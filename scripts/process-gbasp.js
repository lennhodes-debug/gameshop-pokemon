const sharp = require('sharp');
const fs = require('fs');

async function tryFile(input, output) {
  if (!fs.existsSync(input)) return false;
  const stat = fs.statSync(input);
  if (stat.size < 5000) return false;

  try {
    // Check if it's a real image
    const meta = await sharp(input).metadata();
    if (meta.width < 100 || meta.height < 100) return false;

    await sharp(input)
      .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .webp({ quality: 82, effort: 6, smartSubsample: true })
      .toFile(output);

    const outStat = fs.statSync(output);
    console.log(`OK: ${input} → ${(outStat.size / 1024).toFixed(1)}KB (${meta.width}x${meta.height} bron)`);
    return true;
  } catch (e) {
    console.log(`FOUT: ${input} → ${e.message}`);
    return false;
  }
}

async function run() {
  const output = '/home/user/gameshop/public/images/products/acc-006-game-boy-advance-sp-oplader.webp';
  const files = ['/tmp/gbasp-charger-1.jpg', '/tmp/gbasp-charger-2.png', '/tmp/gbasp-charger-3.jpg'];

  for (const f of files) {
    if (await tryFile(f, output)) {
      console.log('ACC-006 GBA SP Oplader opgeslagen');
      return;
    }
  }
  console.log('Geen geschikte afbeelding gevonden');
}

run();
