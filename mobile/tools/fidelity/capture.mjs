import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path'; import url from 'url';
const here = path.dirname(url.fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, '../../src/nav/gallery.ts'), 'utf8');
const ALL = eval(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1)); // gallery.ts holds a plain array literal
const only = process.argv[2] ? process.argv[2].split(',') : null; // optional filter: comma-separated ids
const GALLERY = only ? ALL.filter((g) => only.includes(g.id)) : ALL;
const BASE = process.env.BASE ?? 'http://localhost:8081';
const out = path.join(here, '../../../design/fidelity/shots'); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 254, height: 554 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(`${BASE}/dev/gallery`); await page.waitForTimeout(3000); // seeds the demo state
for (const g of GALLERY) {
  const sep = g.href.includes('?') ? '&' : '?';
  await page.goto(`${BASE}${g.href}${g.href.includes('stay=') ? '' : sep + 'stay=1'}`);
  await page.waitForTimeout(g.id.startsWith('04') || g.id.startsWith('05') || g.id === '08-home' || g.id.startsWith('17') ? 4500 : 2500);
  await page.screenshot({ path: path.join(out, `${g.id}.png`) });
  console.log('captured', g.id);
}
await browser.close();
