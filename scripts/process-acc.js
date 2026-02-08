const sharp = require('sharp');
async function run() {
  await sharp('/tmp/dsi-charger.jpg')
    .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile('/home/user/gameshop/public/images/products/acc-004-nintendo-dsi-dsi-xl-oplader.webp');
  console.log('Done: acc-004');
}
run();
