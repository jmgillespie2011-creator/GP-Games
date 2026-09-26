// Renders the link preview card and the home-screen icon with Playwright:
//   tools/og-card.html -> og.png (1200x630), and src/icon.svg -> apple-touch-icon.png (180x180) and icon-192/512 PNGs.
// Run: node last-partner-standing/tools/og-card.mjs  (needs the playwright package and a Chromium).
// Re-run it when the card's design changes, then commit both PNGs.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const ICON_SVG = fs.readFileSync(path.join(root, 'src', 'icon.svg'), 'utf8');

const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const pg = await b.newPage({ viewport: { width: 1200, height: 630 } });
await pg.goto('file://' + path.join(here, 'og-card.html'));
await pg.evaluate(() => document.fonts.ready);
await pg.screenshot({ path: path.join(root, 'og.png') });
await pg.setViewportSize({ width: 180, height: 180 });
await pg.setContent(`<body style="margin:0">${ICON_SVG.replace('<svg ', '<svg width="180" height="180" ')}</body>`);
await pg.screenshot({ path: path.join(root, 'apple-touch-icon.png'), omitBackground: true });
// app icons for the installable web app: plain, and "maskable" with a safe margin for Android's shapes
for (const [size, name, pad] of [[192, 'icon-192.png', 0], [512, 'icon-512.png', 0], [512, 'icon-maskable-512.png', 0.14]]) {
  await pg.setViewportSize({ width: size, height: size });
  const inner = Math.round(size * (1 - 2 * pad));
  await pg.setContent(`<body style="margin:0;background:${pad ? '#1D6A4D' : 'transparent'};display:grid;place-items:center;width:${size}px;height:${size}px">${ICON_SVG.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</body>`);
  await pg.screenshot({ path: path.join(root, name), omitBackground: !pad });
}
await b.close();
console.log('wrote og.png, apple-touch-icon.png and the app icons');
