#!/usr/bin/env python3
"""Frame-by-frame proof that the Kallang wave still plays inside the report-card
hero: NO heroPlayed flag, so the full ~3.5s show runs. Captures the letter wave
(0-0.9s), the highlighter sweep (0.95-1.95s) and the byline strokes (2.0s+),
and asserts from the DOM that each animation actually ran.

  python3 work/patch26/serve.py out 4173 &  python3 work/hero-report-card/anim.py
"""
import asyncio, os, json
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://127.0.0.1:4173")
OUT = os.path.dirname(os.path.abspath(__file__))
GOING = {"doneSios": [f"SIO-{i:03d}" for i in range(1, 14)], "gems": 12, "xp": 420,
         "streak": 3, "lastActiveDay": None, "itemSrs": {}, "badges": [],
         "cosmetics": {"owned": [], "equipped": {}}}
FRAMES = [200, 500, 900, 1300, 1900, 2400, 3600]


async def main():
    async with async_playwright() as p:
        exe = os.environ.get("CHROME", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
        b = await p.chromium.launch(executable_path=exe if os.path.exists(exe) else None)
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        await ctx.add_init_script(f"""
          try {{
            localStorage.setItem('fluolingo:credits.seen','1');
            localStorage.setItem('fluolingo:progress', {json.dumps(json.dumps(GOING))});
            localStorage.setItem('fluolingo:tours.never','1');
            sessionStorage.removeItem('fluolingo:heroPlayed');   // let the show run
          }} catch (e) {{}}
        """)
        page = await ctx.new_page()
        await page.goto(BASE + "/", wait_until="domcontentloaded")
        hero = page.locator('section[aria-label="Your progress"]')

        # is-play must be on the brand the moment it mounts
        await page.wait_for_selector(".fluo-brand.is-play", timeout=5000)
        print("  ok    .fluo-brand.is-play is armed on mount")

        prev = 0
        for t in FRAMES:
            await page.wait_for_timeout(t - prev); prev = t
            await hero.screenshot(path=os.path.join(OUT, f"anim-{t:04d}ms.png"))
            print(f"  shot  anim-{t:04d}ms.png")

        # DOM proof, not just pixels
        info = await page.evaluate("""() => {
          const brand = document.querySelector('.fluo-brand');
          const letters = [...document.querySelectorAll('.fluo-brand-letter')];
          const paths = [...document.querySelectorAll('.fluo-byline path')];
          const anim = el => getComputedStyle(el).animationName;
          return {
            letters: letters.length,
            letterAnim: letters.length ? anim(letters[0]) : null,
            lastLetterDelay: letters.length ? getComputedStyle(letters.at(-1)).animationDelay : null,
            hlAnim: getComputedStyle(brand, '::before').animationName,
            inked: brand.className.includes('is-inked'),
            byline: paths.length,
            bylineAnim: paths.length ? anim(paths[0]) : null,
            bylineOffset: paths.length ? getComputedStyle(paths.at(-1)).strokeDashoffset : null,
          };
        }""")
        print("\n  DOM after the show:")
        for k, v in info.items():
            print(f"    {k:16} {v}")

        # The highlighter is proved by `inked`, not by a live animationName:
        # is-inked is set ONLY by the fluo-brand-hl animationEnd handler, and it
        # swaps ::before to the static pinned-ink rule (animation: none). So
        # "hlAnim none + inked true" is the finished state, and "hlAnim
        # fluo-brand-hl" is mid-sweep — either is a pass, neither-nor is a fail.
        ok = (info["letters"] == 9 and info["letterAnim"] == "fluo-brand-wave"
              and (info["inked"] or info["hlAnim"] == "fluo-brand-hl")
              and info["byline"] == 17 and info["bylineAnim"] == "fluo-byline-write"
              and info["bylineOffset"] == "0px")
        print("\n  " + ("PASS — wave, ink blob and byline all ran" if ok else "FAIL — an animation did not run"))
        await b.close()
        raise SystemExit(0 if ok else 1)

asyncio.run(main())
