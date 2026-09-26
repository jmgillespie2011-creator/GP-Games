// Renders the link preview card and the home-screen icon with Playwright:
//   tools/og-card.html -> og.png (1200x630), and the icon SVG -> apple-touch-icon.png (180x180).
// Run: node last-partner-standing/tools/og-card.mjs  (needs the playwright package and a Chromium).
// Re-run it when the card's design changes, then commit both PNGs.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
export const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1D6A4D"/><text x="32" y="44" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="30" fill="#F4FAF6">LP</text><rect x="14" y="50" width="36" height="5" rx="2" fill="#F2D449"/></svg>`;

const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const pg = await b.newPage({ viewport: { width: 1200, height: 630 } });
await pg.goto('file://' + path.join(here, 'og-card.html'));
await pg.evaluate(() => document.fonts.ready);
await pg.screenshot({ path: path.join(root, 'og.png') });
await pg.setViewportSize({ width: 180, height: 180 });
await pg.setContent(`<body style="margin:0">${ICON_SVG.replace('<svg ', '<svg width="180" height="180" ')}</body>`);
await pg.screenshot({ path: path.join(root, 'apple-touch-icon.png'), omitBackground: true });
await b.close();
console.log('wrote og.png and apple-touch-icon.png');
