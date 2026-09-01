/**
 * Sweep every concept in a running dev server for a JAMMED DASH — an em dash
 * with no space on one side, e.g. "apple tart— and the first word".
 *
 *   NEXT_PUBLIC_OPEN_APP=1 npx next dev          # in one shell
 *   node scripts/sweep-concept-jams.mjs          # in another
 *
 * WHY THIS IS NOT A verify/ SCRIPT. The fault is invisible in source: JSX
 * swallows the space between `</i>` and `&mdash;` in some layouts and keeps it
 * in others, `tsc` is happy either way, and review reads right past it. It was
 * measured, not guessed: on 1 Sep the source pattern that produced five real
 * jams appears at 19 sites, and the 6 that best fit every hypothesis for *why*
 * render perfectly. A static rule here flags six correct lines to catch none —
 * the same arithmetic verify72's header records for its own uncovered case. The
 * browser is the only instrument that can tell these apart, so the browser is
 * the check.
 *
 * IT FAILS LOUDLY WHEN IT CANNOT SEE. An earlier run of this sweep printed
 * "no jammed dashes in any concept" while all 45 pages had failed to load, the
 * dev server having died underneath it — a check that passes when it cannot
 * find its site, which is the recurring fault of this suite. Any page that does
 * not load now makes the run INCONCLUSIVE and exits 2. Exit 1 is a real jam,
 * exit 0 means every concept was reached and every dash has its space.
 *
 * Found (and fixed) on 1 Sep: aimer, avoir-etats, conseils, on-fait-quoi —
 * four already on main — plus transport and aliments while they were written.
 */
import { chromium } from 'playwright';
import { readdirSync, readFileSync } from 'node:fs';
const DIR='/home/user/fluoduo/src/content/lessons/native';
const slugs = readdirSync(DIR).filter(f=>f.endsWith('.tsx')&&f!=='index.tsx')
  .filter(f=>/^\s*concept:/m.test(readFileSync(DIR+'/'+f,'utf8')))
  .map(f=>f.replace('.tsx',''));
console.log('concepts to sweep:', slugs.length);
// A jam: an em/en dash with NO space on one side, either side.
// TWO SHAPES OF THE SAME FAULT, and the second was found only after the first
// was already shipping. A closing tag can lose its following space anywhere,
// not just before an em dash: `</b> One line sorts` rendered as "vehicle.One".
// So match a dash touching a word on either side, AND punctuation running
// straight into a capital. The second pattern deliberately requires the
// punctuation — bare lowercase-then-capital would flag FluOLinGo on every page.
const RX = /(\S—|—\S|[.,;!?][A-ZÀ-ÝÉÈÊ])/g;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const bad = [], errs = [];
for (const slug of slugs) {
  const p = await b.newPage({ viewport: { width: 900, height: 900 } });
  try {
    await p.goto('http://localhost:3000/lessons/'+slug, { waitUntil:'domcontentloaded' });
    await p.waitForTimeout(1200);
    const idea = p.getByText('Idea', { exact: true }).first();
    if (!(await idea.count())) { await p.close(); continue; }
    await idea.click().catch(()=>{});
    await p.waitForTimeout(500);
    let all='';
    for (const n of ['The idea','Q & A','Traps','Steps','Check','Sum up']) {
      const pill=p.getByText(n,{exact:false}).first();
      if (await pill.count()) { await pill.click().catch(()=>{}); await p.waitForTimeout(280); }
      await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
      all += ' ' + await p.evaluate(()=>document.body.innerText);
    }
    // ignore the "—" used as a standalone bullet/separator with spaces both sides
    const hits=[...new Set(all.match(RX)||[])].filter(h=>!/^—$/.test(h));
    if (hits.length) { bad.push([slug,hits]); console.log(`  JAM ${slug}: ${JSON.stringify(hits)}`); }
  } catch(e) { errs.push(slug); console.log(`  err ${slug}: ${e.message.slice(0,40)}`); }
  await p.close();
}
// A sweep that could not reach its pages has found nothing, not proven nothing.
if (errs.length) {
  console.log(`\nINCONCLUSIVE — ${errs.length} of ${slugs.length} pages never loaded. This is not a pass.`);
  process.exitCode = 2;
} else if (bad.length) {
  console.log(`\n${bad.length} concept(s) with a jammed dash, out of ${slugs.length} all reached`);
  process.exitCode = 1;
} else {
  console.log(`\nclean — ${slugs.length} concepts reached, no jammed dashes`);
}
await b.close();
