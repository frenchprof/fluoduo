#!/usr/bin/env python3
"""Patch 25d screenshots — the Home map's 3D view ported from Dan's Figma Make
(first-person road camera, clock sky). Serve out/ (built with
REQUIRE_SIGN_IN=false) and shoot at 390×844 and 1024×768: opened on the
current stop, mid-course (unit 2–3), near the FINAL, and at night (?hour=23).

  python3 work/patch26/serve.py out 4173 &  python3 work/patch25d/shoot.py
"""
import asyncio, os, json
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://127.0.0.1:4173")
OUT = os.path.dirname(os.path.abspath(__file__))
SIZES = {"390": (390, 844), "1024": (1024, 768)}
PROGRESS = {"doneSios": [f"SIO-{i:03d}" for i in range(1, 14)], "gems": 12, "xp": 420, "streak": 3, "lastActiveDay": None,
            "itemSrs": {}, "badges": [], "cosmetics": {"owned": [], "equipped": {}}}
STEP = 130  # SCROLL_PER_STOP in HomeMap3D
CAM_MIN = -1.5


async def ctx_for(browser, w, h):
    ctx = await browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
    await ctx.add_init_script(f"""
      try {{
        localStorage.setItem('fluolingo:credits.seen','1');
        localStorage.setItem('fluolingo:progress', {json.dumps(json.dumps(PROGRESS))});
        localStorage.setItem('fluolingo:tours.never','1');
        localStorage.setItem('fluo.homeMapView','3d');
        sessionStorage.setItem('fluolingo:heroPlayed','1');
      }} catch (e) {{}}
    """)
    return ctx


async def travel(page, z):
    await page.evaluate(f"""() => {{
      const box = document.querySelector('.home-map3d-box');
      box.scrollTo({{top: Math.round(({z} - {CAM_MIN}) * {STEP}), behavior: 'auto'}});
    }}""")
    await page.wait_for_timeout(600)


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for tag, (w, h) in SIZES.items():
            for hour, suffix in ((None, ""), (23, "-night")):
                ctx = await ctx_for(browser, w, h)
                page = await ctx.new_page()
                page.on("pageerror", lambda e: print("  pageerror:", e))
                await page.goto(BASE + "/" + (f"?hour={hour}" if hour is not None else "?hour=10"))
                await page.wait_for_selector(".home-map3d-box", timeout=20000)
                await page.wait_for_timeout(1200)
                box = page.locator(".home-map3d-box")
                await page.evaluate("() => document.querySelector('.home-map3d-box').scrollIntoView({block: 'start'})")
                await page.wait_for_timeout(300)
                await box.screenshot(path=os.path.join(OUT, f"map3d-current{suffix}-{tag}.png"))
                print("  wrote", f"map3d-current{suffix}-{tag}")
                if hour is None:
                    await travel(page, 24)
                    await box.screenshot(path=os.path.join(OUT, f"map3d-unit2-3-{tag}.png"))
                    await travel(page, 46)
                    await box.screenshot(path=os.path.join(OUT, f"map3d-final-{tag}.png"))
                    await travel(page, 0)
                    await box.screenshot(path=os.path.join(OUT, f"map3d-start-{tag}.png"))
                    if tag == "390":
                        await travel(page, 13)
                        await page.screenshot(path=os.path.join(OUT, f"home-3d-{tag}.png"))
                await ctx.close()
        await browser.close()

asyncio.run(main())
