const sharp = require('sharp');
const fs = require('fs');

async function process(input, output, label) {
  if (!fs.existsSync(input)) {
    console.log(`SKIP ${label}: ${input} niet gevonden`);
    return false;
  }
  const stat = fs.statSync(input);
  if (stat.size < 1000) {
    console.log(`SKIP ${label}: ${input} te klein (${stat.size} bytes)`);
    return false;
  }
  try {
    await sharp(input)
      .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .webp({ quality: 82, effort: 6, smartSubsample: true })
      .toFile(output);
    const outStat = fs.statSync(output);
    console.log(`OK ${label}: ${(outStat.size / 1024).toFixed(1)}KB`);
    return true;
  } catch (e) {
    console.log(`FOUT ${label}: ${e.message}`);
    return false;
  }
}

async function run() {
  const base = '/home/user/gameshop/public/images/products';

  await process('/tmp/dsi-charger.jpg', `${base}/acc-004-nintendo-dsi-dsi-xl-oplader.webp`, 'ACC-004 DSi Oplader');
  await process('/tmp/dslite-charger-1.jpg', `${base}/acc-005-nintendo-ds-lite-oplader.webp`, 'ACC-005 DS Lite Oplader');

  // Check for GBA SP charger from various possible locations
  const gbaFiles = ['/tmp/gbasp-charger.jpg', '/tmp/gbasp-charger-1.jpg', '/tmp/gba-sp-charger.jpg'];
  let gbaFound = false;
  for (const f of gbaFiles) {
    if (fs.existsSync(f) && fs.statSync(f).size > 1000) {
      gbaFound = await process(f, `${base}/acc-006-game-boy-advance-sp-oplader.webp`, 'ACC-006 GBA SP Oplader');
      if (gbaFound) break;
    }
  }
  if (!gbaFound) {
    console.log('ACC-006 GBA SP Oplader: wacht nog op download');
  }
}

run();
