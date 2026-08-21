import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
// Worst realistic case: /reviser's score readout, plus the kind of chip the
// approved daily-goal / streak work would add. Injected so the guard is tested
// against what is COMING, not only what exists.
const EXTRAS = [
  { name: 'as shipped now',                add: [] },
  { name: '+ reviser score "12/20 · ✓ 9"', add: ['12/20 · ✓ 9'] },
  { name: '+ score + daily-goal chip',     add: ['12/20 · ✓ 9', '◍ 3/5'] },
  { name: '+ score + goal + streak 🔥12',  add: ['12/20 · ✓ 9', '◍ 3/5', '🔥12'] },
];
for (const w of [320, 360, 390]) {
  console.log(`\n=== ${w}px ===`);
  for (const e of EXTRAS) {
    const p = await b.newPage({ viewport: { width: w, height: 800 } });
    await p.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
    const r = await p.evaluate((labels) => {
      const bar = document.querySelector('.cahier-topbar');
      for (const t of labels) {
        const s = document.createElement('span');
        s.className = 'fluo-mono text-sm font-bold'; s.textContent = t;
        bar.insertBefore(s, bar.lastElementChild);
      }
      const vw = document.documentElement.clientWidth;
      const kids = [...bar.children].filter(x => x.getBoundingClientRect().width > 0);
      const off = kids.filter(x => { const q = x.getBoundingClientRect();
                                     return q.left < -0.5 || q.right > vw + 0.5; });
      return { vw, total: kids.length, off: off.length,
               labels: off.map(x => (x.textContent || '?').trim().slice(0, 10)),
               scrollW: document.documentElement.scrollWidth };
    }, e.add);
    const bad = r.off > 0 || r.scrollW > r.vw + 0.5;
    console.log(`  ${e.name.padEnd(38)} ${r.total - r.off}/${r.total} reachable` +
                `${bad ? `   OFF-SCREEN: ${r.labels.join(', ')}` : '   ok'}` +
                `${r.scrollW > r.vw + 0.5 ? `  (page scrolls sideways ${r.scrollW}>${r.vw})` : ''}`);
    await p.close();
  }
}
await b.close();
