#!/usr/bin/env python3
"""Patch 25c screenshots — the Home map's 3D view (a real perspective scene).
Serve out/ (built with REQUIRE_SIGN_IN=false) and shoot at 390×844 and
1024×768: opened on the current stop, then travelled to Unit 3.

  python3 work/patch26/serve.py out 4173 &  python3 work/patch25c/shoot.py
"""
import asyncio, os, json, sys
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://127.0.0.1:4173")
OUT = os.path.dirname(os.path.abspath(__file__))
SIZES = {"390": (390, 844), "1024": (1024, 768)}
PROGRESS = {"doneSios": ["SIO-001", "SIO-002", "SIO-003", "SIO-004", "SIO-005"], "gems": 12, "xp": 420, "streak": 3, "lastActiveDay": None,
            "itemSrs": {}, "badges": [], "cosmetics": {"owned": [], "equipped": {}}}


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


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for tag, (w, h) in SIZES.items():
            ctx = await ctx_for(browser, w, h)
            page = await ctx.new_page()
            page.on("pageerror", lambda e: print("  pageerror:", e))
            await page.goto(BASE + "/")
            await page.wait_for_selector(".home-map3d-box", timeout=20000)
            await page.wait_for_timeout(1200)
            box = page.locator(".home-map3d-box")
            await box.scroll_into_view_if_needed()
            await page.wait_for_timeout(300)
            await box.screenshot(path=os.path.join(OUT, f"map3d-current-{tag}.png"))
            print("  wrote", f"map3d-current-{tag}")
            # travel to unit 3 (its first stop on the focus mark)
            await page.evaluate("""() => {
              const box = document.querySelector('.home-map3d-box');
              const b = [...document.querySelectorAll('[data-scroll]')].find(el => (el.getAttribute('aria-label')||'').startsWith('SIO-026'));
              box.scrollTo({top: Number(b.dataset.scroll), behavior: 'auto'});
            }""")
            await page.wait_for_timeout(500)
            await box.screenshot(path=os.path.join(OUT, f"map3d-unit3-{tag}.png"))
            print("  wrote", f"map3d-unit3-{tag}")
            if tag == "390":
                await page.screenshot(path=os.path.join(OUT, f"home-3d-{tag}.png"))
            await ctx.close()
        await browser.close()

asyncio.run(main())
