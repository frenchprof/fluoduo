// node render.mjs <id> [--preview]  : renders v4/slides/<id>.html with v4/timing/<id>.json
// -> out/<id>.mp4 (exact narration length, 25 fps), out/<id>-still.png (final frame), out/<id>-sheet.png (6 frames)
// --preview burns the narration in as subtitles (for Dan to check timing before the voice exists).
import { chromium } from 'playwright-core';
import fs from 'fs'; import { execSync } from 'child_process'; import path from 'path';
const V4 = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const id = process.argv[2], preview = process.argv.includes('--preview');
const OUT = process.env.OUT || '/tmp/claude-0/-home-user-fluoduo/675e2eea-8ec6-53b9-8533-d72e2857df3f/scratchpad/v4out';
fs.mkdirSync(OUT, { recursive: true });
const T = JSON.parse(fs.readFileSync(`${V4}/timing/${id}.json`));
const head = fs.readFileSync(`${V4}/lib/head.html`, 'utf8');
const page = `${V4}/slides/_${id}.html`;
let body = fs.readFileSync(`${V4}/slides/${id}.html`, 'utf8');
if (preview) body = body.replace('</section>', `<div id="sub" style="position:absolute;left:0;right:0;bottom:0;padding:14px 120px;background:rgba(31,36,48,.82);color:#fff;font:28px/1.3 Roboto;text-align:center;z-index:99"></div></section>`);
fs.writeFileSync(page, head.replace('<script src="../lib/cue.js">', `<script>window.T=${JSON.stringify(T)}</script><script src="../lib/cue.js">`) + body + '</body></html>');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const logs = []; p.on('console', m => logs.push(m.text())); p.on('pageerror', e => logs.push('ERR ' + e.message));
await p.goto('file://' + page, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
const errs = await p.evaluate(() => window.CUE_ERRORS || []);
if (errs.length || logs.some(l => l.startsWith('ERR'))) { console.log('CUE ERRORS', errs, logs); }
const lastEnd = await p.evaluate(() => Math.max(0, ...document.getAnimations().map(a => { const t = a.effect.getComputedTiming(); return t.endTime === Infinity ? 0 : t.endTime; })) / 1000);
const fps = 25, dur = T.dur;
const animEnd = Math.min(dur, lastEnd + 0.5);
const fd = `${OUT}/${id}-frames`; fs.rmSync(fd, { recursive: true, force: true }); fs.mkdirSync(fd);
const subAt = t => { const s = T.sent.filter(x => x.start <= t + 0.05).pop(); return s ? s.text : ''; };
const nFrames = preview ? Math.round(dur * fps) : Math.round(animEnd * fps);
let lastSub = null;
for (let i = 0; i < nFrames; i++) {
  const t = i / fps;
  await p.evaluate(ms => document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; }), t * 1000);
  if (preview) { const s = subAt(t); if (s !== lastSub) { await p.evaluate(s => document.getElementById('sub').textContent = s, s); lastSub = s; } }
  await p.screenshot({ path: `${fd}/${String(i).padStart(5, '0')}.png` });
}
await b.close();
const pad = Math.max(0, dur - nFrames / fps);
execSync(`ffmpeg -loglevel error -y -framerate ${fps} -i ${fd}/%05d.png -vf "tpad=stop_mode=clone:stop_duration=${pad.toFixed(2)},format=yuv420p" -c:v libx264 -preset veryfast -crf 20 -r ${fps} ${OUT}/${id}${preview ? '-preview' : ''}.mp4`);
const last = fs.readdirSync(fd).sort().pop();
fs.copyFileSync(`${fd}/${last}`, `${OUT}/${id}-still.png`);
fs.rmSync(fd, { recursive: true, force: true });
console.log('ok', id, 'dur', dur, 'animated until', animEnd.toFixed(1), preview ? 'preview' : '');
