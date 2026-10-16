// temp: node _snap_tmp.mjs <id> t1 t2 ... -> scratchpad/snap/<id>-<t>.png (half size)
import { chromium } from 'playwright-core';
import fs from 'fs'; import path from 'path';
const V4 = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [id, ...ts] = process.argv.slice(2);
const OUT = '/tmp/claude-0/-home-user-fluoduo/675e2eea-8ec6-53b9-8533-d72e2857df3f/scratchpad/snap';
const T = JSON.parse(fs.readFileSync(`${V4}/timing/${id}.json`));
const head = fs.readFileSync(`${V4}/lib/head.html`, 'utf8');
const page = `${V4}/slides/_${id}.html`;
const body = fs.readFileSync(`${V4}/slides/${id}.html`, 'utf8');
fs.writeFileSync(page, head.replace('<script src="../lib/cue.js">', `<script>window.T=${JSON.stringify(T)}</script><script src="../lib/cue.js">`) + body + '</body></html>');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 0.5 });
const logs = []; p.on('pageerror', e => logs.push('ERR ' + e.message));
await p.goto('file://' + page, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
const errs = await p.evaluate(() => window.CUE_ERRORS || []);
if (errs.length || logs.length) console.log('CUE ERRORS', errs, logs);
for (const t of ts) {
  await p.evaluate(ms => document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; }), (+t) * 1000);
  await p.screenshot({ path: `${OUT}/${id}-${t}.png` });
}
await b.close(); console.log('done');
