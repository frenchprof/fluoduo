#!/usr/bin/env python3
"""Patch 26 screenshots — /moi and the teacher page. Serve out/ (built with
REQUIRE_SIGN_IN=false and NEXT_PUBLIC_TEACHER_FIXTURE=1 — the teacher page
reads live Firestore behind an admin sign-in, so the fixture in
src/app/teacher/fixture.ts stands in for the class) and shoot at 390×844 and
1280×800: /moi (device view: progress + ledger, since Firestore is not
reachable here), /teacher Class now (board + matrix), /teacher Students with
one learner open (heat-strip), and the Index with its compact strip.

  python3 work/patch26/serve.py out 4173 &  python3 work/patch26/shoot.py
"""
import asyncio, os, json
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://127.0.0.1:4173")
OUT = os.path.dirname(os.path.abspath(__file__))
SIZES = {"390": (390, 844), "1280": (1280, 800)}

# A learner with some history: three outcomes done, a warm ledger.
LEDGER = {
    "speculearn": {"SIO-001": {"right": 9, "wrong": 1, "last": 1}, "SIO-002": {"right": 4, "wrong": 4, "last": 1}, "SIO-004": {"right": 2, "wrong": 6, "last": 1}},
    "flip": {"SIO-001": {"right": 12, "wrong": 0, "last": 1}, "SIO-007": {"right": 6, "wrong": 2, "last": 1}},
    "vocabularain": {"SIO-011": {"right": 7, "wrong": 3, "last": 1}, "SIO-013": {"right": 3, "wrong": 5, "last": 1}},
    "grammarathon": {"SIO-021": {"right": 5, "wrong": 5, "last": 1}, "SIO-022": {"right": 8, "wrong": 1, "last": 1}},
}
PROGRESS = {"doneSios": ["SIO-001", "SIO-002", "SIO-003"], "gems": 12, "xp": 420, "streak": 3, "lastActiveDay": None,
            "itemSrs": {"sappeler-01": {"due": 0, "intervalDays": 1}, "sappeler-02": {"due": 0, "intervalDays": 1}}, "badges": [], "cosmetics": {"owned": [], "equipped": {}}}


async def ctx_for(browser, w, h):
    ctx = await browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
    await ctx.add_init_script(f"""
      try {{
        localStorage.setItem('fluolingo:credits.seen','1');
        localStorage.setItem('fluolingo:activityLedger', {json.dumps(json.dumps(LEDGER))});
        localStorage.setItem('fluolingo:progress', {json.dumps(json.dumps(PROGRESS))});
        localStorage.setItem('fluolingo:tours.never','1');
        sessionStorage.setItem('fluolingo:heroPlayed','1');
      }} catch (e) {{}}
    """)
    return ctx


async def shot(page, name, full=False):
    await page.screenshot(path=os.path.join(OUT, name + ".png"), full_page=full)
    print("  wrote", name)


async def moi(page, tag):
    await page.goto(BASE + "/moi")
    await page.wait_for_selector(".moi-hero", timeout=20000)
    await page.wait_for_timeout(1500)
    hero = await page.evaluate("document.querySelector('.moi-hero').getBoundingClientRect().height")
    strip = await page.evaluate("document.querySelector('.heat-strip').getBoundingClientRect().height")
    print(f"  /moi hero {hero:.0f}px, heat-strip {strip:.0f}px at {tag}")
    await shot(page, f"moi-fix-{tag}")
    for seg in ("Exercises", "History", "Journey"):
        await page.click(f".moi-segments button:has-text('{seg}')")
        await page.wait_for_timeout(200)
        await shot(page, f"moi-{seg.lower()}-{tag}")


async def teacher_now(page, tag):
    await page.goto(BASE + "/teacher")
    await page.wait_for_selector(".class-board", timeout=30000)
    # let the pool land all sixteen
    for _ in range(40):
        n = await page.evaluate("document.querySelectorAll('.class-tile').length")
        txt = await page.evaluate("document.querySelector('.class-now p')?.textContent || ''")
        if "16/16 loaded" in txt:
            break
        await page.wait_for_timeout(250)
    await page.wait_for_timeout(300)
    stuck = await page.evaluate("document.querySelectorAll('.class-tile[data-stuck]').length")
    print(f"  Class now: {n} tiles, {stuck} stuck at {tag}")
    await shot(page, f"teacher-classnow-{tag}")
    await shot(page, f"teacher-classnow-full-{tag}", full=True)


async def teacher_student(page, tag):
    await page.goto(BASE + "/teacher")
    await page.wait_for_selector(".class-board", timeout=30000)
    await page.wait_for_timeout(1500)
    await page.click(".class-tile >> nth=0")
    await page.wait_for_selector("[role=dialog] .heat-strip", timeout=15000)
    await page.wait_for_timeout(300)
    await shot(page, f"teacher-student-{tag}")


async def teacher_evidence(page, tag):
    await page.goto(BASE + "/teacher")
    await page.wait_for_selector(".class-board", timeout=30000)
    await page.wait_for_timeout(1500)
    await page.click("button:has-text('Students')")
    await page.wait_for_timeout(300)
    await page.click("text=Learning evidence")
    await page.wait_for_timeout(500)
    await shot(page, f"teacher-evidence-{tag}")


async def index_strip(page, tag):
    await page.goto(BASE + "/activities?unit=0")
    await page.wait_for_selector(".index-rows", timeout=15000)
    await page.wait_for_timeout(400)
    await shot(page, f"index-heatstrip-{tag}")


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get("CHROME") or None)
        for tag, (w, h) in SIZES.items():
            ctx = await ctx_for(browser, w, h)
            page = await ctx.new_page()
            page.on("pageerror", lambda e: print("  pageerror:", e))
            for fn in (moi, teacher_now, teacher_student, teacher_evidence, index_strip):
                try:
                    await fn(page, tag)
                except Exception as e:
                    print("  !!", fn.__name__, tag, repr(e)[:300])
            await ctx.close()
        await browser.close()

asyncio.run(main())
