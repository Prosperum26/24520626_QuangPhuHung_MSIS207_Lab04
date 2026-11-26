// Sinh 12 ảnh SVG minh họa vào public/photos/ từ src/data/photos.js. Chạy: npm run photos
import { mkdirSync, writeFileSync } from 'node:fs';
import { PHOTOS } from '../src/data/photos.js';

const OUT = new URL('../public/photos/', import.meta.url);
mkdirSync(OUT, { recursive: true });

// Màu theo danh mục: nền tối, hình sáng, nên chữ trắng luôn đọc được.
const THEME = {
  scene: { from: '#0b3b8c', to: '#1d6fd1', accent: '#bfdbfe' },
  document: { from: '#14532d', to: '#2f8a4f', accent: '#bbf7d0' },
  chart: { from: '#7c2d12', to: '#c2570c', accent: '#fed7aa' },
};

/** Hình trang trí khác nhau cho từng ảnh trong danh mục (theo chỉ số 0-3). */
function shapes(category, n, color) {
  const f = `fill="${color}" fill-opacity="0.85"`;
  if (category === 'scene') {
    return [
      [0, 1, 2, 3, 4].map((i) => `<rect x="${60 + i * 100}" y="170" width="70" height="90" rx="6" ${f}/>`).join(''),
      [0, 1, 2, 3, 4, 5, 6].map((i) => `<circle cx="${70 + i * 76}" cy="${200 + (i % 2) * 30}" r="22" ${f}/>`).join(''),
      `<rect x="40" y="190" width="520" height="24" rx="6" ${f}/><rect x="120" y="230" width="90" height="90" ${f}/><rect x="390" y="230" width="90" height="90" ${f}/>`,
      `<polygon points="300,90 480,300 120,300" ${f}/>`,
    ][n];
  }
  if (category === 'document') {
    const lines = [0, 1, 2, 3, 4].map((i) => `<rect x="130" y="${110 + i * 40}" width="${340 - (i % 3) * 50}" height="12" rx="4" ${f}/>`).join('');
    return [
      lines,
      `<rect x="110" y="100" width="380" height="170" rx="8" ${f}/>`,
      `<rect x="150" y="100" width="300" height="200" rx="8" transform="rotate(-8 300 200)" ${f}/>`,
      [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${140 + c * 80}" y="${100 + r * 50}" width="70" height="40" rx="4" ${f}/>`).join('')).join(''),
    ][n];
  }
  return [
    [0, 1, 2, 3, 4].map((i) => `<rect x="${110 + i * 80}" y="${300 - 40 - i * 30}" width="52" height="${40 + i * 30}" rx="4" ${f}/>`).join(''),
    `<circle cx="300" cy="200" r="100" ${f}/><path d="M300 200 L300 100 A100 100 0 0 1 390 245 Z" fill="#ffffff" fill-opacity="0.9"/>`,
    `<polyline points="90,300 190,250 290,270 390,170 500,110" fill="none" stroke="${color}" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>`,
    `<rect x="200" y="120" width="80" height="170" rx="4" ${f}/><rect x="320" y="200" width="80" height="90" rx="4" ${f}/>`,
  ][n];
}

for (const [i, photo] of PHOTOS.entries()) {
  const t = THEME[photo.category];
  const n = i % 4;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.from}"/><stop offset="1" stop-color="${t.to}"/></linearGradient></defs>
<rect width="600" height="400" fill="url(#g)"/>
${shapes(photo.category, n, t.accent)}
<text x="30" y="52" font-family="sans-serif" font-size="30" font-weight="700" fill="#ffffff">Ảnh minh họa ${photo.id}</text>
</svg>
`;
  writeFileSync(new URL(`${photo.id}.svg`, OUT), svg);
}
console.log(`Đã sinh ${PHOTOS.length} ảnh vào public/photos/`);
