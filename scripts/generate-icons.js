// Generate PNG icons from SVG for PWA
// Run: npm run generate-icons

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const svgPath = join(publicDir, 'icon-192.svg');
const svg = readFileSync(svgPath);

const sizes = [180, 192, 512];

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = join(publicDir, `icon-${size}.png`);
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon-${size}.png`);
  }
  console.log('Done! Update your manifest and HTML to use PNG icons.');
}

generateIcons().catch(console.error);
