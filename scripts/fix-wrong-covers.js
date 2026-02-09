const { execSync } = require('child_process');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const DIR = 'public/images/products';

// Confirmed wrong covers with specific search terms for PAL versions
const fixes = [
  { file: 'n64-001-tony-hawk-s-pro-skater-2.webp', search: "Tony Hawk's Pro Skater 2 Nintendo 64", wiki: "Tony_Hawk%27s_Pro_Skater_2" },
  { file: 'n64-010-conker-s-bad-fur-day.webp', search: "Conker's Bad Fur Day Nintendo 64 PAL", wiki: "Conker%27s_Bad_Fur_Day" },
  { file: 'n64-020-goldeneye-007.webp', search: 'GoldenEye 007 Nintendo 64 PAL', wiki: 'GoldenEye_007_(1997_video_game)' },
  { file: 'snes-001-chrono-trigger.webp', search: 'Chrono Trigger SNES box art', wiki: 'Chrono_Trigger' },
  { file: 'gb-001-bionic-commando-elite-forces.webp', search: 'Bionic Commando Elite Forces Game Boy Color', wiki: 'Bionic_Commando:_Elite_Forces' },
  { file: 'gb-009-dragon-warrior-monsters.webp', search: 'Dragon Warrior Monsters Game Boy Color', wiki: 'Dragon_Quest_Monsters' },
  { file: 'nes-002-dragon-warrior-iii.webp', search: 'Dragon Warrior III NES box art', wiki: 'Dragon_Quest_III' },
  { file: 'nes-010-blaster-master.webp', search: 'Blaster Master NES PAL box art', wiki: 'Blaster_Master' },
  { file: 'nes-015-contra.webp', search: 'Contra NES PAL Probotector box art', wiki: 'Contra_(video_game)' },
  { file: 'nes-025-final-fantasy.webp', search: 'Final Fantasy NES box art', wiki: 'Final_Fantasy_(video_game)' },
];

async function downloadFromWikipedia(wikiTitle) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`;
    const json = execSync(`curl -sL "${url}" -H "User-Agent: GameshopBot/1.0"`, { timeout: 15000 }).toString();
    const data = JSON.parse(json);
    if (data.thumbnail && data.thumbnail.source) {
      // Get higher res version
      let imgUrl = data.thumbnail.source.replace(/\/\d+px-/, '/500px-');
      return imgUrl;
    }
    if (data.originalimage && data.originalimage.source) {
      return data.originalimage.source;
    }
  } catch (e) {
    console.log('  Wikipedia API fout:', e.message);
  }
  return null;
}

async function downloadAndConvert(url, outPath) {
  try {
    const tmpFile = '/tmp/cover-fix-' + Date.now() + '.tmp';
    execSync(`curl -sL -o "${tmpFile}" --connect-timeout 10 --max-time 20 "${url}" -H "User-Agent: GameshopBot/1.0"`, { timeout: 25000 });

    const stats = fs.statSync(tmpFile);
    if (stats.size < 3000) {
      fs.unlinkSync(tmpFile);
      return false;
    }

    const meta = await sharp(tmpFile).metadata();
    if (meta.width < 150 || meta.height < 150) {
      fs.unlinkSync(tmpFile);
      return false;
    }

    await sharp(tmpFile)
      .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .webp({ quality: 85 })
      .toFile(outPath);

    const newSize = fs.statSync(outPath).size / 1024;
    fs.unlinkSync(tmpFile);
    console.log(`  ✅ ${newSize.toFixed(1)}KB (${meta.width}x${meta.height} bron)`);
    return true;
  } catch (e) {
    console.log(`  ❌ Download fout: ${e.message}`);
    return false;
  }
}

async function main() {
  let fixed = 0;

  for (const fix of fixes) {
    const outPath = path.join(DIR, fix.file);
    console.log(`\n${fix.file}:`);

    // Try Wikipedia first
    console.log('  Probeer Wikipedia...');
    const wikiUrl = await downloadFromWikipedia(fix.wiki);
    if (wikiUrl) {
      console.log(`  Bron: ${wikiUrl.substring(0, 80)}...`);
      if (await downloadAndConvert(wikiUrl, outPath)) {
        fixed++;
        continue;
      }
    }

    console.log('  Wikipedia onvoldoende, skipping voor nu');
  }

  console.log(`\n=== Klaar: ${fixed}/${fixes.length} covers vervangen ===`);
}

main();
