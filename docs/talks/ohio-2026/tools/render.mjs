// node render.mjs <dir> <seconds>  : renders <dir>/anim.html (1920x1080) frame by frame -> <dir>/clip.mp4 + <dir>/still.png (last frame)
// Animations must be CSS animations / Web Animations that start at page load (class "go" is added to <body> at t=0).
import { chromium } from '/home/user/fluoduo/node_modules/playwright-core/index.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const [dir, secs] = [process.argv[2], +process.argv[3]];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + fs.realpathSync(dir) + '/anim.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);
await p.evaluate(() => { const b=document.body; b.classList.remove('go'); void b.offsetWidth; b.classList.add('go'); });
await p.waitForTimeout(50);
const fd = dir + '/frames'; fs.rmSync(fd, { recursive: true, force: true }); fs.mkdirSync(fd);
const fps = 30, total = Math.round(secs * fps);
for (let i = 0; i < total; i++) {
  await p.evaluate(t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; }), i * 1000 / fps);
  await p.screenshot({ path: `${fd}/${String(i).padStart(4,'0')}.png` });
}
await b.close();
execSync(`ffmpeg -loglevel error -y -framerate 30 -i ${fd}/%04d.png -vf tpad=stop_mode=clone:stop_duration=180 -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart ${dir}/clip.mp4`);
fs.copyFileSync(`${fd}/${String(total-1).padStart(4,'0')}.png`, `${dir}/still.png`);
execSync(`ffmpeg -loglevel error -y -i ${fd}/${String(Math.round(total*0.35)).padStart(4,'0')}.png -vf scale=960:540 ${dir}/mid.png`);
fs.rmSync(fd, { recursive: true, force: true });
console.log('ok', dir);
