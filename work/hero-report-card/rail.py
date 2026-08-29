#!/usr/bin/env python3
"""The grouped side rail: six families, children under the one you are in."""
import asyncio, os, json
from playwright.async_api import async_playwright
BASE = os.environ.get("BASE", "http://127.0.0.1:4173")
OUT = os.path.dirname(os.path.abspath(__file__))
GOING = {"doneSios": [f"SIO-{i:03d}" for i in range(1, 14)], "gems": 12, "xp": 420,
         "streak": 3, "lastActiveDay": None, "itemSrs": {}, "badges": [],
         "cosmetics": {"owned": [], "equipped": {}}}

async def main():
    async with async_playwright() as p:
        exe = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
        b = await p.chromium.launch(executable_path=exe if os.path.exists(exe) else None)
        ctx = await b.new_context(viewport={"width": 1500, "height": 1000}, device_scale_factor=2)
        await ctx.add_init_script(f"""
          try {{
            localStorage.setItem('fluolingo:credits.seen','1');
            localStorage.setItem('fluolingo:progress', {json.dumps(json.dumps(GOING))});
            localStorage.setItem('fluolingo:tours.never','1');
            sessionStorage.setItem('fluolingo:heroPlayed','1');
          }} catch (e) {{}}
        """)
        page = await ctx.new_page()
        await page.goto(BASE + os.environ.get("PAGE","/"), wait_until="networkidle")
        await page.wait_for_timeout(800)
        print("  navs:", await page.locator("nav").count(),
              "| cahier-tabs:", await page.locator(".cahier-tabs").count(),
              "| visible:", await page.locator(".cahier-tabs").first.is_visible() if await page.locator(".cahier-tabs").count() else "n/a")
        await page.wait_for_timeout(500)
        rail = page.locator("nav.cahier-tabs")
        n_groups = await rail.locator('button[aria-expanded]').count()
        print(f"  family flaps: {n_groups}")
        await rail.screenshot(path=os.path.join(OUT, "rail-collapsed.png"))
        for name in ("Practice", "Review", "Skills", "User"):
            await rail.locator(f'button[aria-expanded]:has-text("{name}")').click()
            await page.wait_for_timeout(150)
        await page.wait_for_timeout(300)
        await rail.screenshot(path=os.path.join(OUT, "rail-expanded.png"))
        print("  shot rail-collapsed.png / rail-expanded.png")
        await b.close()
asyncio.run(main())
