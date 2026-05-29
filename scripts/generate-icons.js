// Generate PNG icons from SVG for PWA
// Run: npm run generate-icons

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const sources = [
  { svg: 'icon-192.svg', prefix: 'icon', sizes: [180, 192, 512] },
  { svg: 'icon-maskable.svg', prefix: 'icon-maskable', sizes: [192, 512] },
];

async function generateIcons() {
  for (const { svg, prefix, sizes } of sources) {
    const svgBuf = readFileSync(join(publicDir, svg));
    for (const size of sizes) {
      const outputPath = join(publicDir, `${prefix}-${size}.png`);
      await sharp(svgBuf)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`Generated: ${prefix}-${size}.png`);
    }
  }
  console.log('Done! Update your manifest and HTML to use PNG icons.');
}

generateIcons().catch(console.error);
