#!/usr/bin/env python3
"""
Patch 25, the rest — the Home path (2026-08-17).

Dan's decision 1 (STATUS.md, 17 Aug): the Home map has TWO views, 2D and
3D, the learner toggles. 2D = Design's "FluOlinGo Home standalone" (region
bands, kind-coloured 56px stops, ▶ current, zoom %); 3D = the The Map
treatment folded into Home. Plus the plan rows: `short` labels + build
check, class flag + paved/unpaved road (fog deleted), /unit/N a deep link
into Home, print stylesheet with a QR per unit.

What this asserts (static, over source):

  1  Both map components exist; HomeDashboard renders them behind a 2D/3D
     toggle remembered under `fluo.homeMapView`; RoadMap is gone.
  2  Region band tokens (`--region-*-band`) paint the bands in BOTH views.
  3  Stop colours come from `sioKind()` (both views) and `sioSecondary()`
     (3D) through ONE palette — no hand-coded hex in either map file.
  4  Every SIO carries a `short` label ≤ 14 chars; the check script exists
     and is wired as `npm run check:short` and runs before `next build`.
  5  The fog is dead; the road is paved to the class flag (CLASS_FLAG_SIO)
     and dotted beyond.
  6  /unit/N is a thin deep link into Home (`/?unit=N`), not a page.
  7  A print stylesheet exists (@media print, A4) and the sheet draws a QR
     per unit from the in-repo encoder.

Run from the repo root:  python3 verify/verify25b.py
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

home = strip_comments(read("src/app/HomeDashboard.tsx"))
# The map moved to its own page (Dan, 2026-08-21: finger-scroll on Home kept
# catching the map) — the block the pins below inspect lives in MapBody.
carte = strip_comments(read("src/app/map/MapBody.tsx"))
map2d = read("src/components/HomeMap.tsx")
map3d = read("src/components/HomeMap3D.tsx")
m2 = strip_comments(map2d)
m3 = strip_comments(map3d)
css = read("src/app/globals.css")

# 1 · two views, toggle, RoadMap gone
check(bool(map2d), "HomeMap.tsx (2D) exists", "src/components/HomeMap.tsx missing")
check(bool(map3d), "HomeMap3D.tsx (3D) exists", "src/components/HomeMap3D.tsx missing")
check("<HomeMap " in carte and "<HomeMap3D " in carte,
      "The Map renders both views", "MapBody does not render both HomeMap and HomeMap3D")
check('"fluo.homeMapView"' in carte, "the 2D/3D choice is remembered under fluo.homeMapView",
      "the toggle key fluo.homeMapView is missing from MapBody")
check('"2d"' in carte and '"3d"' in carte and "aria-pressed" in carte,
      "a 2D · 3D segmented control (aria-pressed) drives the view",
      "no 2D/3D segmented control found")
check('href="/map"' in home, "Home links to The Map with one card", "Home has no card linking to /map")
check(not os.path.isfile("src/components/RoadMap.tsx") and "RoadMap" not in home,
      "RoadMap.tsx is gone and nothing in HomeDashboard renders it",
      "RoadMap is still around / rendered")

# 2 · region band tokens in both views
for name, src in (("2D", m2), ("3D", m3)):
    check("-band)" in src and "--region-" in src,
          f"{name} view paints bands with --region-*-band tokens",
          f"{name} view does not use the --region-*-band tokens")
for tok in ("village", "heights", "valley", "downtown", "market"):
    check(f"--region-{tok}-band" in css, f"--region-{tok}-band token defined", f"--region-{tok}-band missing from globals.css")

# 3 · sioKind/sioSecondary drive colour; no hand-coded hex
check("sioKind(" in m2 and "KIND_COLOR" in m2, "2D stop colour = KIND_COLOR[sioKind()]", "2D view does not colour by sioKind()")
check("sioKind(" in m3 and "sioSecondary(" in m3 and "KIND_COLOR" in m3,
      "3D ring colour = KIND_COLOR[sioKind()], secondary dot from sioSecondary()",
      "3D view does not take its ring colours from sioKind()/sioSecondary()")
HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")
for name, src in (("HomeMap.tsx", m2), ("HomeMap3D.tsx", m3), ("HomePrintSheet.tsx", strip_comments(read("src/components/HomePrintSheet.tsx")))):
    n = len(HEX.findall(src))
    check(n == 0, f"{name}: no hand-coded hex colours (tokens only)", f"{name}: {n} hex literal(s) — use tokens")
check("KIND_COLOR" in m2 and m2.count("export const KIND_COLOR") == 1 and "KIND_COLOR" in m3 and "export const KIND_COLOR" not in m3,
      "one palette (KIND_COLOR in HomeMap.tsx) feeds both views",
      "the kind palette is defined in more than one place")

# 4 · short labels + build check
sios = json.load(open("src/content/sios/sios.json", encoding="utf-8"))
bad = [s["id"] for s in sios if not isinstance(s.get("short"), str) or not s["short"].strip() or len(s["short"]) > 14]
check(len(sios) == 50, "50 SIOs in sios.json", f"expected 50 SIOs, found {len(sios)}")
check(not bad, "every SIO has a `short` label ≤ 14 chars", f"short label missing/too long: {bad}")
check("short: string" in read("src/content/sios/index.ts"), "the Sio type carries `short`", "Sio type lacks `short`")
check(os.path.isfile("scripts/check-short-labels.mjs"), "scripts/check-short-labels.mjs exists", "check-short-labels.mjs missing")
pkg = json.load(open("package.json", encoding="utf-8"))
check(pkg.get("scripts", {}).get("check:short", "").endswith("check-short-labels.mjs"),
      "npm run check:short is wired", "check:short is not wired in package.json")
check("check:short" in pkg.get("scripts", {}).get("build", ""),
      "the build runs check:short first (fails on overflow)", "`npm run build` does not run check:short")
check("n.short" in m2 and "st.short" in m3, "both views label stops with `short`", "a view still labels stops with the long topic")

# 5 · fog dead, class flag, paved/unpaved
check("fluo-fog" not in m2 and "fluo-fog" not in m3, "the fog is gone from both views", "fluo-fog is still applied on the map")
check("CLASS_FLAG_SIO" in read("src/content/chapters.ts"), "CLASS_FLAG_SIO exists (chapters.ts)", "CLASS_FLAG_SIO missing")
check("CLASS_FLAG_SIO" in m2 and "🚩" in m2 and "CLASS_FLAG_SIO" in m3,
      "the class flag 🚩 marks the class's stop in both views", "class flag not drawn")
check("strokeDasharray" in m2 and "paved" in m2 and "travelled" in m2,
      "2D road: travelled · paved · dotted-unpaved segments", "2D road is not split paved/unpaved")

# 6 · /unit/N deep link
unit_page = strip_comments(read("src/app/unit/[unit]/page.tsx"))
redirect = read("src/app/unit/[unit]/UnitRedirect.tsx")
check("UnitSection" not in unit_page and "UnitRedirect" in unit_page,
      "/unit/N no longer renders UnitSection — it is a deep link", "/unit/N still renders the unit page")
check("/map?unit=" in redirect and "location.replace" in redirect,
      "UnitRedirect sends /unit/N(#SIO) to /map?unit=N(#SIO)", "UnitRedirect does not redirect to /map?unit=N")
check('get("unit")' in carte and "hashchange" in carte and "<UnitSection" in carte,
      "The Map reads ?unit= and #SIO, and hosts UnitSection inline", "MapBody does not read the deep link / host UnitSection")
check('get("unit")' in home and "/map" in home,
      "Home forwards old /?unit= deep links to /map (printed QR codes survive)", "Home no longer forwards /?unit= to /map")
check("onOpenSio" in m2 and "onOpenSio" in m3, "stops open their SIO in place (onOpenSio) in both views", "stops still navigate away")

# 7 · print
check("@media print" in css and "size: A4" in css and ".home-print" in css,
      "print stylesheet: @media print, A4, .home-print sheet", "print stylesheet missing (@media print / A4 / .home-print)")
sheet = read("src/components/HomePrintSheet.tsx")
check("qrEncode" in sheet and "/?unit=" in sheet, "the print sheet draws a QR per unit", "print sheet lacks per-unit QRs")
check(os.path.isfile("src/lib/qr.ts") and "export function qrEncode" in read("src/lib/qr.ts"),
      "in-repo QR encoder (src/lib/qr.ts), no dependency", "src/lib/qr.ts missing")
check("HomePrintSheet" in carte, "The Map mounts the print sheet", "MapBody does not mount HomePrintSheet")

print("\npatch 25b check (Home path: two views, deep link, short labels, print)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
