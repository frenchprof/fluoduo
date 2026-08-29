#!/usr/bin/env python3
"""Patch 24 screenshots — the Index. Serve out/ (built with
REQUIRE_SIGN_IN=false; the wall is Google-only) and shoot at 390×844 and
1024×768: the default Index, another activity + unit, ?gaps=1, and a
redirected hub URL landing.

  python3 work/patch24/serve.py out 4173 &  python3 work/patch24/shoot.py
"""
import asyncio, os, json
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://127.0.0.1:4173")
OUT = os.path.dirname(os.path.abspath(__file__))
SIZES = {"390": (390, 844), "1024": (1024, 768)}

# A learner with some history, so the cells have something to say: two
# outcomes marked done, a warm ledger for a few activity × SIO pairs.
LEDGER = {
    "speculearn": {"SIO-001": {"right": 9, "wrong": 1, "last": 1}, "SIO-002": {"right": 4, "wrong": 4, "last": 1}, "SIO-004": {"right": 2, "wrong": 6, "last": 1}},
    "flip": {"SIO-001": {"right": 12, "wrong": 0, "last": 1}},
    "vocabularain": {"SIO-011": {"right": 7, "wrong": 3, "last": 1}, "SIO-013": {"right": 3, "wrong": 5, "last": 1}},
    "grammarathon": {"SIO-021": {"right": 5, "wrong": 5, "last": 1}},
}
PROGRESS = {"doneSios": ["SIO-001", "SIO-002", "SIO-003"], "gems": 0, "xp": 120, "streak": 2, "lastActiveDay": None, "itemSrs": {}, "badges": [], "cosmetics": {"owned": [], "equipped": {}}}

async def ctx_for(browser, w, h):
    ctx = await browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
    await ctx.add_init_script(f"""
      try {{
        localStorage.setItem('fluolingo:credits.seen','1');
        localStorage.setItem('fluolingo:activityLedger', {json.dumps(json.dumps(LEDGER))});
        localStorage.setItem('fluolingo:progress', {json.dumps(json.dumps(PROGRESS))});
        localStorage.setItem('fluolingo:tours.never','1');
      }} catch (e) {{}}
    """)
    return ctx

async def shot(page, name):
    await page.screenshot(path=os.path.join(OUT, name + ".png"))
    print("  wrote", name)

async def index_default(page, tag):
    await page.goto(BASE + "/activities")
    await page.wait_for_selector(".index-rows", timeout=15000)
    await page.wait_for_timeout(500)
    await shot(page, f"index-default-{tag}")

async def index_other(page, tag):
    await page.goto(BASE + "/activities?activity=vocabularain&unit=1")
    await page.wait_for_selector(".index-rows", timeout=15000)
    await page.wait_for_timeout(500)
    await shot(page, f"index-vocabularain-u1-{tag}")

async def index_gaps(page, tag):
    await page.goto(BASE + "/activities?gaps=1")
    await page.wait_for_selector(".index-gaps", timeout=15000)
    await page.wait_for_timeout(400)
    await shot(page, f"index-gaps-{tag}")

async def hub_redirect(page, tag):
    await page.goto(BASE + "/practice/flip-it")
    await page.wait_for_url("**/activities?activity=flip**", timeout=15000)
    await page.wait_for_selector(".index-rows", timeout=15000)
    await page.wait_for_timeout(500)
    print("  landed on", page.url)
    await shot(page, f"hub-redirect-flip-{tag}")

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get("CHROME") or None)
        for tag, (w, h) in SIZES.items():
            ctx = await ctx_for(browser, w, h)
            page = await ctx.new_page()
            page.on("pageerror", lambda e: print("  pageerror:", e))
            for fn in (index_default, index_other, index_gaps, hub_redirect):
                try:
                    await fn(page, tag)
                except Exception as e:
                    print("  !!", fn.__name__, tag, repr(e)[:300])
            await ctx.close()
        await browser.close()

asyncio.run(main())
