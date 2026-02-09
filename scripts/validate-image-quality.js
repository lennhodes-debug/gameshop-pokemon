#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, '..', 'public/images/products');
const productsPath = path.join(__dirname, '..', 'src/data/products.json');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Quality criteria
const CRITERIA = {
  minSize: 2000,      // 2KB minimum
  maxSize: 80000,     // 80KB maximum for games
  consoleMaxSize: 20000, // 20KB max for accessories
  minDimension: 400,
  maxDimension: 600,
  format: 'webp'
};

(async () => {
  console.log('🔍 VALIDATING ALL DEPLOYED IMAGES\n');
  console.log('Quality Criteria:');
  console.log(`  Format: ${CRITERIA.format}`);
  console.log(`  Size: 2KB - 80KB (accessories: max 20KB)`);
  console.log(`  Dimensions: 400x600px (flexible)`);
  console.log('');

  const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.webp'));
  
  let passed = 0;
  let failed = 0;
  let warnings = [];
  let errors = [];

  for (const file of files) {
    const filepath = path.join(imagesDir, file);
    const stats = fs.statSync(filepath);
    const sizeKB = stats.size / 1024;
    
    try {
      const metadata = await sharp(filepath).metadata();
      
      // Find product
      const product = products.find(p => {
        if (p.image) {
          return p.image.includes(file);
        }
        return false;
      });
      
      const isAccessory = product?.category?.includes('Accessoires') || file.includes('con-') || file.includes('acc-');
      const maxSize = isAccessory ? CRITERIA.consoleMaxSize : CRITERIA.maxSize;
      
      let status = '✅';
      let issues = [];
      
      // Check file size
      if (stats.size < CRITERIA.minSize) {
        status = '❌';
        issues.push(`Too small (${sizeKB.toFixed(1)}KB < 2KB)`);
        failed++;
      } else if (stats.size > maxSize) {
        status = '⚠️';
        issues.push(`Size warning (${sizeKB.toFixed(1)}KB > ${(maxSize/1024).toFixed(0)}KB)`);
        warnings.push(file);
      } else {
        passed++;
      }
      
      // Check dimensions
      if (metadata.width < CRITERIA.minDimension || metadata.height < CRITERIA.minDimension) {
        status = '❌';
        issues.push(`Dimension too small (${metadata.width}x${metadata.height})`);
        failed++;
      } else if (metadata.width > CRITERIA.maxDimension || metadata.height > CRITERIA.maxDimension) {
        status = '⚠️';
        issues.push(`Dimension large (${metadata.width}x${metadata.height})`);
      }
      
      // Check format
      if (metadata.format !== CRITERIA.format) {
        status = '❌';
        issues.push(`Wrong format (${metadata.format})`);
        failed++;
      }
      
      const productName = product ? product.name : file;
      const output = `${status} ${file.substring(0,35).padEnd(35)} ${sizeKB.toFixed(1).padStart(5)}KB ${metadata.width}x${metadata.height}`;
      console.log(output);
      
      if (issues.length > 0) {
        issues.forEach(issue => console.log(`   └─ ${issue}`));
      }
      
    } catch (err) {
      console.log(`❌ ${file.substring(0,35).padEnd(35)} ERROR: ${err.message}`);
      errors.push(file);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 VALIDATION RESULTS:`);
  console.log(`✅ Passed:  ${passed}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`📁 Total:   ${files.length}\n`);
  
  if (failed === 0 && warnings.length === 0) {
    console.log('🎉 ALL IMAGES ACCEPTABLE!\n');
  }
})();
