// 3D parity capture: every model on every 3D screen (building, chosen, stages 1-6, Home, Project).
// Usage: BASE=http://localhost:8124 node tools/fidelity/parity.mjs [models] -> design/fidelity/parity/<model>-<screen>.png
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path'; import url from 'url';
const here = path.dirname(url.fileURLToPath(import.meta.url));
const BASE = process.env.BASE ?? 'http://localhost:8081';
const MODELS = process.argv[2] ? process.argv[2].split(',') : ['villa', 'shop', 'tower', 'factory', 'reno'];
const out = path.join(here, '../../../design/fidelity/parity'); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 254, height: 554 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(`${BASE}/dev/gallery`); await page.waitForTimeout(4000); // seeds the demo state
const shot = async (model, id, href, wait = 5000) => {
  const file = path.join(out, `${model}-${id}.png`);
  if (process.env.SKIP_EXISTING && fs.existsSync(file)) return;
  for (let k = 0; k < 3; k++) { // swiftshader under load can stall a screenshot: retry
    try { await page.goto(`${BASE}${href}`); await page.waitForTimeout(wait); await page.screenshot({ path: file, timeout: 90000 }); console.log('captured', model, id); return; }
    catch (e) { console.log('retry', model, id, e.message.split('\n')[0]); }
  }
};
for (const m of MODELS) {
  await shot(m, 'building', `/onboarding/building?type=${m}`);
  await shot(m, 'chosen', `/onboarding/chosen?type=${m}&stay=1`);
  for (const st of [1, 2, 3, 4, 5, 6]) await shot(m, `stage${st}`, `/onboarding/stage?type=${m}&stage=${st}`);
  // Home / Project read the persisted store: set its project type, then reload
  await page.evaluate((m) => { const k = 'pulse-demo-v1'; const v = JSON.parse(localStorage.getItem(k)); v.state.projectType = m; localStorage.setItem(k, JSON.stringify(v)); }, m);
  await shot(m, 'home', '/home');
  await shot(m, 'project', '/project');
}
await browser.close();
