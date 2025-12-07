/**
 * PWA Icon Generator
 * Generates app icons in various sizes for the PWA manifest
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, '../public/icons');

// Create a simple app icon SVG with Nova Creations branding
const createIconSVG = (size) => {
  const fontSize = Math.floor(size * 0.45);
  const padding = Math.floor(size * 0.15);
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6495ED;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4169E1;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7BA3F0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#5B7FD6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Background -->
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <!-- Inner shape -->
      <rect x="${padding}" y="${padding}" width="${size - padding * 2}" height="${size - padding * 2}" rx="${size * 0.12}" fill="url(#innerGrad)" opacity="0.3"/>
      <!-- Letter N -->
      <text x="50%" y="55%" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">N</text>
    </svg>
  `;
};

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate icons
async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');
  
  for (const size of sizes) {
    const svg = createIconSVG(size);
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`  ✓ Generated icon-${size}x${size}.png`);
  }
  
  // Generate favicon
  const faviconSvg = createIconSVG(32);
  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../public/favicon.ico'));
  console.log(`  ✓ Generated favicon.ico`);
  
  // Generate apple-touch-icon
  const appleTouchSvg = createIconSVG(180);
  await sharp(Buffer.from(appleTouchSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log(`  ✓ Generated apple-touch-icon.png`);
  
  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);

