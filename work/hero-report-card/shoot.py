#!/usr/bin/env python3
"""Home hero — the report-card restyle (Dan, 2026-08-19: "the dashboard that
wouldn't have a status bar, that is minimalist and that is a bit like a report
card but horizontally"). Shoots the strip in both states, because the whole
argument for a fixed row of marks is how it reads when the marks are empty:

  new      a learner on day one — every mark at zero, no gems column
  going    13 done, streak 3, 420 XP, 12 gems — the gems column appears

  python3 work/patch26/serve.py out 4173 &  python3 work/hero-report-card/shoot.py
"""
import asyncio, os, json
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://127.0.0.1:4173")
OUT = os.path.dirname(os.path.abspath(__file__))
SIZES = {"390": (390, 844), "1024": (1024, 768)}
BLANK = {"doneSios": [], "gems": 0, "xp": 0, "streak": 0, "lastActiveDay": None,
         "itemSrs": {}, "badges": [], "cosmetics": {"owned": [], "equipped": {}}}
GOING = {**BLANK, "doneSios": [f"SIO-{i:03d}" for i in range(1, 14)],
         "gems": 12, "xp": 420, "streak": 3}


async def shoot(browser, name, progress, w, h):
    ctx = await browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=2)
    await ctx.add_init_script(f"""
      try {{
        localStorage.setItem('fluolingo:credits.seen','1');
        localStorage.setItem('fluolingo:progress', {json.dumps(json.dumps(progress))});
        localStorage.setItem('fluolingo:tours.never','1');
        sessionStorage.setItem('fluolingo:heroPlayed','1');
      }} catch (e) {{}}
    """)
    page = await ctx.new_page()
    await page.goto(BASE + "/", wait_until="networkidle")
    await page.wait_for_timeout(500)
    hero = page.locator('section[aria-label="Your progress"]')
    await hero.screenshot(path=os.path.join(OUT, f"hero-{name}-{w}.png"))
    await page.screenshot(path=os.path.join(OUT, f"home-{name}-{w}.png"))
    await ctx.close()
    print(f"  shot hero-{name}-{w}.png")


async def main():
    async with async_playwright() as p:
        # This container ships Chromium at a pinned path (PLAYWRIGHT_BROWSERS_PATH);
        # never run `playwright install` here — point at what is already there.
        exe = os.environ.get("CHROME", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
        b = await p.chromium.launch(executable_path=exe if os.path.exists(exe) else None)
        for label, prog in (("new", BLANK), ("going", GOING)):
            for _, (w, h) in SIZES.items():
                await shoot(b, label, prog, w, h)
        await b.close()

asyncio.run(main())
