#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Icon sizes needed
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];

// SVG template for icons
const generateSVG = (size) => {
  const fontSize = size < 96 ? Math.floor(size * 0.6) : Math.floor(size * 0.3);
  const text = size < 96 ? 'K' : 'Kitchen';
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#10b981" rx="${size * 0.1}"/>
  <text x="${size/2}" y="${size/2 + fontSize/3}" text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${fontSize}" font-weight="bold" fill="white">${text}</text>
</svg>`;
};

// Create icons directory
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons (as placeholders)
iconSizes.forEach(size => {
  const svg = generateSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`Generated ${filename}`);
});

// Generate a simple favicon.ico placeholder (16x16 SVG)
const faviconSVG = generateSVG(16);
fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconSVG);

// Generate shortcut icons
const shortcuts = ['add', 'shopping', 'alert'];
shortcuts.forEach(shortcut => {
  const symbol = shortcut === 'add' ? '+' : shortcut === 'shopping' ? '🛒' : '⚠️';
  const shortcutSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="#10b981" rx="9.6"/>
  <text x="48" y="58" text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="40" font-weight="bold" fill="white">${symbol}</text>
</svg>`;
  
  fs.writeFileSync(path.join(iconsDir, `shortcut-${shortcut}.svg`), shortcutSVG);
  console.log(`Generated shortcut-${shortcut}.svg`);
});

// Generate badge icon
const badgeSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
  <circle cx="36" cy="36" r="36" fill="#10b981"/>
  <text x="36" y="44" text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="24" font-weight="bold" fill="white">K</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'badge-72x72.svg'), badgeSVG);
console.log('Generated badge-72x72.svg');

// Generate startup image placeholder
const startupSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="750" height="1334" viewBox="0 0 750 1334" xmlns="http://www.w3.org/2000/svg">
  <rect width="750" height="1334" fill="#10b981"/>
  <text x="375" y="667" text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="48" font-weight="bold" fill="white">Kitchentory</text>
  <text x="375" y="720" text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="24" fill="rgba(255,255,255,0.8)">Kitchen Inventory Manager</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'apple-touch-startup-image-750x1334.svg'), startupSVG);
console.log('Generated apple-touch-startup-image-750x1334.svg');

console.log('\n✅ Generated all placeholder icons!');
console.log('\nNote: These are SVG placeholders. For production:');
console.log('1. Convert SVGs to PNG using an online tool or ImageMagick');
console.log('2. Replace with professionally designed icons');
console.log('3. Test icons on various devices and backgrounds');