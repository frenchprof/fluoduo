#!/usr/bin/env python3
"""The Menu (was the HELP popup): twenty tiles, 4x5 on a phone, 5x4 from sm."""
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
        for w, h, tag in ((390, 844, "390"), (1024, 768, "1024")):
            ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=2)
            await ctx.add_init_script(f"""
              try {{
                localStorage.setItem('fluolingo:credits.seen','1');
                localStorage.setItem('fluolingo:progress', {json.dumps(json.dumps(GOING))});
                localStorage.setItem('fluolingo:tours.never','1');
                sessionStorage.setItem('fluolingo:heroPlayed','1');
              }} catch (e) {{}}
            """)
            page = await ctx.new_page()
            await page.goto(BASE + "/", wait_until="networkidle")
            await page.click('button[aria-label="Menu"]')
            await page.wait_for_selector('div[role="dialog"][aria-label="Menu"]')
            await page.wait_for_timeout(400)
            n = await page.locator('div[role="dialog"][aria-label="Menu"] li').count()
            print(f"  {tag}: {n} tiles")
            await page.locator('div[role="dialog"][aria-label="Menu"] > div').screenshot(
                path=os.path.join(OUT, f"menu-{tag}.png"))
            await ctx.close()
        await b.close()
asyncio.run(main())
