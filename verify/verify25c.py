#!/usr/bin/env python3
"""
Patch 25c — the Home map's 3D view is really 3D (2026-08-19).

Dan, on production (17 Aug build): "the 3D map is not yet 3D!" — the ported
La Carte view was a vertical saga map with a scroll-driven scale trick.
HomeMap3D is now a TRUE perspective scene in CSS 3D (no WebGL, no
dependency): a ground plane under `perspective`, tilted with `rotateX`,
`preserve-3d` down to the posts; the region bands are ground patches; the
road is an SVG path lying on the plane; every stop / landmark is an upright
billboard counter-rotated (`rotateX(-TILT)`) so it faces the camera; the
camera travels along the road from the box's native scroll through ONE
transform on the world (one rAF, transform-only, `will-change`).

What this asserts (static, over source):

  1  The scene's ingredients: perspective, rotateX(TILT) on the ground,
     rotateX(-TILT) on the posts, preserve-3d, a perspective-origin that
     places the horizon, will-change on the moving world only.
  2  Region bands still paint from the `--region-*-band` tokens; the arena
     sits at the far end; the road is an SVG path with the paved / dotted
     split at CLASS_FLAG_SIO and the travelled stretch in the accent.
  3  Semantics kept: KIND_COLOR[sioKind()], sioSecondary() dot, done ✓ /
     current ▶ / to-come dashed, 🚩, `short` labels, onOpenSio, onOpenUnit,
     the 🏁 FINAL link, region icons from HomeMap's REGIONS.
  4  Camera: opens on the current stop / deep-linked unit, clamped
     (scroll box, no free-flying), 📍 recentres, reduced motion respected
     (no glide, no bob), keyboard focus travels to the post.
  5  Tokens only — no hex; no per-element scale hack (the old data-pop-y).
  6  The 2D ⇄ 3D toggle in HomeDashboard is intact.
  7  ≤ 70 billboards: 50 stops + FINAL + 5 landmarks + ≤ 10 props + arena.

Run from the repo root:  python3 verify/verify25c.py
"""
import json, os, re, sys

FAIL = []
OK = []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"^\s*//.*$", "", src, flags=re.M)
    src = re.sub(r"\{/\*.*?\*/\}", "", src, flags=re.S)
    return src


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

raw = read("src/components/HomeMap3D.tsx")
m3 = strip_comments(raw)
home = strip_comments(read("src/app/HomeDashboard.tsx"))
css = read("src/app/globals.css")

check(bool(raw), "HomeMap3D.tsx exists", "src/components/HomeMap3D.tsx missing")

# 1 · the 3D scene
check("perspective:" in m3 or "perspective =" in m3 or "PERSPECTIVE" in m3, "a perspective is set on the stage", "no `perspective` in HomeMap3D")
check("perspectiveOrigin" in m3, "perspective-origin places the horizon (eye height)", "no perspectiveOrigin")
check(re.search(r"const TILT = \d+", m3) is not None, "TILT (deg) is one named constant", "no TILT constant")
check("rotateX(${TILT}deg)" in m3, "the ground plane is rotateX(TILT)", "ground plane is not tilted with rotateX(TILT)")
check("rotateX(${-TILT}deg)" in m3, "posts counter-rotate rotateX(-TILT) — upright billboards", "posts do not counter-rotate")
check(m3.count('transformStyle: "preserve-3d"') >= 3, "preserve-3d on ground, world and every post anchor", "preserve-3d missing on the 3D chain")
check("will-change-transform" in m3 or "willChange" in m3, "will-change on the moving world", "no will-change on the world")
check(m3.count("will-change-transform") + m3.count("willChange") == 1, "will-change on ONE element only", "will-change sprinkled on more than one element")
check("translate3d(0, ${" in m3 and "requestAnimationFrame" in m3, "one rAF writes one translate3d on the world", "camera is not a single rAF transform")
check("data-pop-y" not in m3 and "scale(" not in m3, "no per-element scale hack — perspective does the sizing", "the old data-pop-y / scale() trick is still there")

# 2 · ground patches, arena, road
check("--region-${r.key}-band" in m3 or "-band)" in m3, "region bands paint from --region-*-band tokens", "bands not from --region-*-band tokens")
check("ARENA_PLACE" in m3 and "REGIONS" in m3, "arena + REGIONS come from HomeMap (one source)", "ARENA_PLACE / REGIONS not imported from HomeMap")
check("<svg" in m3 and "roadPath(" in m3 and "<path" in m3, "the road is an SVG path lying on the plane", "no SVG road path")
check("strokeDasharray" in m3 and "pavedTo" in m3 and "travelledTo" in m3, "road: travelled · paved · dotted beyond the class flag", "road segments not split")
check("CLASS_FLAG_SIO" in m3 and "🚩" in m3, "class flag 🚩 on its stop", "no class flag")
check("accent ??" in m3, "the travelled stretch wears the equipped accent", "accent not applied to the travelled road")

# 3 · semantics
check("sioKind(" in m3 and "sioSecondary(" in m3 and "KIND_COLOR[" in m3, "ring = KIND_COLOR[sioKind()], dot = sioSecondary()", "kind colours not from sioKind()/sioSecondary()")
check("isSioDone(" in m3 and '"✓"' in m3 and "▶" in m3 and '"dashed"' in m3, "done ✓ · current ▶ · to-come dashed", "stop states missing")
check("st.short" in m3, "stops labelled with `short`", "labels not `short`")
check("onOpenSio?.(" in m3 and "onOpenUnit?.(" in m3, "stops open their SIO, landmarks open their unit", "onOpenSio/onOpenUnit not wired")
check('href="/practice/grammarathon/finale"' in m3 and "🏁" in m3, "🏁 FINAL links to the GramMarathon final", "no FINAL link")
check("r.icon(" in m3, "landmarks use the regionIcons.tsx icons (via REGIONS)", "landmarks do not use the region icons")
check("🧑‍🎓" in m3, "the avatar chip rides with the current stop", "no avatar chip")

# 4 · camera
check("scrollFor(" in m3 and "landed" in m3 and "focusUnit" in m3, "opens on the current stop / deep-linked unit", "no landing logic")
check("maxScroll" in m3 and "overflow-y-auto" in m3, "travel is clamped by the scroll box (no free-flying)", "travel not clamped")
check("📍" in m3 and "recentre" in m3, "📍 recentres on the current stop", "no 📍 recentre")
check("prefers-reduced-motion" in m3, "reduced motion: recentre jumps instead of gliding", "reduced motion ignored")
check(".home-map-bob { animation: none; }" in css and "prefers-reduced-motion" in css, "reduced motion: no bob (globals.css)", "bob not disabled under reduced motion")
check("onFocusCapture" in m3 and "data-scroll" in m3, "keyboard focus travels the camera to the post", "focus does not travel")
check(".home-map3d-stage { overflow: clip; }" in css, "the stage is overflow: clip (focus cannot scroll it internally)", "stage not overflow: clip")

# 5 · tokens only
HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")
n = len(HEX.findall(m3))
check(n == 0, "HomeMap3D: no hand-coded hex (tokens only)", f"HomeMap3D: {n} hex literal(s)")

# 6 · toggle intact
check("<HomeMap3D " in home and "<HomeMap " in home and '"fluo.homeMapView"' in home and "aria-pressed" in home,
      "HomeDashboard's 2D ⇄ 3D toggle is intact", "the 2D/3D toggle in HomeDashboard broke")

# 7 · billboard budget
sios = json.load(open("src/content/sios/sios.json", encoding="utf-8"))
props = len(re.findall(r'\{ e: "', m3))
budget = len(sios) + 1 + 5 + props + 1
check(props <= 10 and budget <= 70, f"billboard budget: {budget} (≤ 70)", f"too many billboards: {budget}")

print("\npatch 25c check (Home map 3D view: a real perspective scene)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
