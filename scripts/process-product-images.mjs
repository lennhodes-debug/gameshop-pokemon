import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const imagesDir = path.join(rootDir, 'images');
const productsDir = path.join(rootDir, 'public', 'images', 'products');
const productsJsonPath = path.join(rootDir, 'src', 'data', 'products.json');

// Image sizes: [width, height, folder]
const SIZES = [
  [1200, 900, 'display'],    // Main product display
  [400, 300, 'thumbnail'],   // Thumbnail/grid view
  [2000, 1500, 'detail'],    // Product detail page
];

async function processImages() {
  console.log('🖼️  PHOTO PROCESSING PIPELINE STARTED\n');

  try {
    // Read all JPG files
    const jpgFiles = fs.readdirSync(imagesDir)
      .filter(f => f.toLowerCase().endsWith('.jpg'))
      .sort();

    console.log(`📸 Found ${jpgFiles.length} JPG files\n`);

    // Load products.json
    const productsJson = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));
    const products = productsJson.products;

    console.log(`📦 Processing for ${products.length} products\n`);

    // Create products image directory
    await fs.ensureDir(productsDir);

    let processed = 0;
    let skipped = 0;

    // Process each JPG and map to products sequentially
    for (let i = 0; i < jpgFiles.length; i++) {
      const jpgFile = jpgFiles[i];
      const productIndex = i % products.length; // Cycle through products
      const product = products[productIndex];

      // Create product folder
      const productImageDir = path.join(productsDir, product.sku);
      await fs.ensureDir(productImageDir);

      const jpgPath = path.join(imagesDir, jpgFile);
      const baseName = `${product.sku}-${i}.webp`;

      try {
        // Process image for each size
        let image = sharp(jpgPath);
        const metadata = await image.metadata();

        for (const [width, height, folder] of SIZES) {
          const folderPath = path.join(productImageDir, folder);
          await fs.ensureDir(folderPath);

          const outputPath = path.join(folderPath, baseName);

          await sharp(jpgPath)
            .resize(width, height, {
              fit: 'cover',
              position: 'center',
            })
            .webp({ quality: 85 })
            .toFile(outputPath);
        }

        processed++;
        if ((i + 1) % 50 === 0) {
          console.log(`✓ Processed ${i + 1}/${jpgFiles.length} images`);
        }
      } catch (err) {
        console.error(`✗ Error processing ${jpgFile}: ${err.message}`);
        skipped++;
      }
    }

    console.log(`\n✅ Processing complete!`);
    console.log(`   - Processed: ${processed} images`);
    console.log(`   - Skipped: ${skipped} images`);
    console.log(`   - Products updated: ${products.length}`);
    console.log(`\n📂 Images saved to: /public/images/products/\n`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

processImages();
