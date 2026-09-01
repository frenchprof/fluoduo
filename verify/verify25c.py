#!/usr/bin/env python3
"""
Patch 25c/25d — the Home map's 3D view is Dan's Figma Make (2026-08-19).

Dan, on production (17 Aug build): "the 3D map is not yet 3D!" — and on the
CSS-perspective attempt of 19 Aug: still not. His Figma Make "3D Scroll Map
Interface" is THE reference and is now ported: a FIRST-PERSON CAMERA on a
snaking road (pure maths in src/lib/map3d/projection.ts — pathXAt,
cameraForward, project()), 50 stops as depth-scaled billboards, five worlds
(= the repo's regions), Peers' roadside catalogue (scene.ts), procedurally
placed trees, a sky driven by the learner's real local clock (sky.ts), the
🏁 GramMarathon arch as the FINAL. The camera travels from the box's native
scroll through one rAF.

What this asserts (static, over source):

  1  The engine: projection.ts exports the Make's constants and functions
     (HORIZON_Y, CAMERA_Y, FOCAL, MAX_AHEAD, WX, pathXAt, cameraForward,
     project) and is pure (no React); HomeMap3D projects every stop with it.
  2  The scene: 50 stops from SIOS (not a mock list), world gate signs from
     HomeMap's REGIONS with the regionIcons icons and --region-* tokens,
     the ground from --region-*-band, ROADSIDE_ITEMS + NATURE_ITEMS from
     scene.ts (the Make's catalogue, labels intact), the arch + finishing
     line (ARENA_PLACE).
  3  Semantics: KIND_COLOR[sioKind()], sioSecondary() dot, done ✓ / current
     🧑‍🎓 / to-come dashed, 🚩 on CLASS_FLAG_SIO, `short` labels, onOpenSio,
     onOpenUnit, 🏁 FINAL link, the avatar over the current stop; the road
     paved → dotted at the class flag, travelled stretch in the accent.
  4  Sky: getSkyColors over SKY_KF keyframes, sun/moon, clouds, stars, the
     real clock once a minute, `?hour=` for the shoot; keyframes are numeric
     RGB, not hex (see sky.ts header).
  5  Camera: native scroll box, one rAF → camZ, opens on the current stop /
     deep-linked unit, 📍 recentres, reduced motion respected (no glide;
     bob / pulse / ring off in globals.css), keyboard focus travels.
  6  Tokens only — no hex in HomeMap3D.tsx or src/lib/map3d/*; no Nunito /
     Google Fonts import; KIND_COLOR defined once (HomeMap.tsx).
  7  The 2D ⇄ 3D toggle in HomeDashboard is intact.
  8  No classmate names / emails in the 3D view.

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
# The map block moved to its own page /map (Dan, 2026-08-21).
carte = strip_comments(read("src/app/map/MapBody.tsx"))
css = read("src/app/globals.css")
proj_raw = read("src/lib/map3d/projection.ts")
proj = strip_comments(proj_raw)
sky_raw = read("src/lib/map3d/sky.ts")
sky = strip_comments(sky_raw)
scene_raw = read("src/lib/map3d/scene.ts")
scene = strip_comments(scene_raw)

check(bool(raw), "HomeMap3D.tsx exists", "src/components/HomeMap3D.tsx missing")
check(bool(proj_raw) and bool(sky_raw) and bool(scene_raw), "src/lib/map3d/{projection,sky,scene}.ts exist", "src/lib/map3d/* missing")

# 1 · the engine
for name in ("HORIZON_Y", "CAMERA_Y", "FOCAL", "MAX_AHEAD", "MAX_BEHIND", "WX"):
    check(re.search(rf"export const {name}\b", proj) is not None, f"projection.ts exports {name}", f"projection.ts lacks {name}")
for fn in ("pathXAt", "cameraForward", "project"):
    check(f"export function {fn}(" in proj, f"projection.ts exports {fn}()", f"projection.ts lacks {fn}()")
check("react" not in proj.lower() and "react" not in sky.lower() and "react" not in scene.lower(), "src/lib/map3d/* is pure (no React)", "src/lib/map3d/* imports React")
check("const csx = relX * rx + relZ * rz" in proj and "const csz = relX * fx + relZ * fz" in proj, "project(): world → camera space with a rotating camera", "project() does not rotate the camera with the road")
# Mini-planet camera (Dan, 2026-08-20, Candy Crush reference): row position
# and disc size are DECOUPLED — rows ride a sine over the near depth, sizes
# fall off on their own gentle curve with a floor — and a thing beyond
# FULL_AHEAD RISES tip-first over the horizon (`reveal`), never pops.
check("Math.sin(" in proj and "csz / FULL_AHEAD" in proj, "project(): rows ride the curved world — sine over the near depth", "project() rows are not the curved-world sine profile")
check("reveal" in proj and "MAX_AHEAD - FULL_AHEAD" in proj, "project(): things rise tip-first over the horizon (reveal)", "project() has no mini-planet rise (reveal)")
check("clipRise" in m3 and "reveal" in m3, "HomeMap3D clips the below-horizon part of a rising billboard", "HomeMap3D does not render the mini-planet rise")
check("SIZE_FALLOFF" in proj and "MIN_SCALE" in proj,
      "project(): disc size has its own gentle falloff with a floor",
      "project() size is not decoupled from row position (SIZE_FALLOFF/MIN_SCALE)")
check('from "@/lib/map3d/projection"' in m3 and "project(" in m3 and "getWorldX(" in m3 and "pathXAt(" in m3, "HomeMap3D projects through the engine", "HomeMap3D does not use src/lib/map3d/projection")
check("SIOS.map((s, i) => {" in m3 and "project(getWorldX(i + 1), i - camZ, camZ, vw, vh)" in m3, "every SIO stop is projected (stop N at z = N − 1)", "stops are not projected per SIO")

# 2 · the scene
check('from "@/content/sios"' in m3 and "SIOS" in m3 and "code: 'SIO-" not in m3 and "CURRENT_LEVEL" not in m3, "stops come from SIOS — the Make's mock STOPS / CURRENT_LEVEL are gone", "the Make's mock stop list is still in HomeMap3D")
check("REGIONS" in m3 and "r.icon(" in m3 and "r.place" in m3, "world gate signs = HomeMap's REGIONS (place + regionIcons icon)", "gates do not use REGIONS / region icons")
check("Café de Paris" not in m3 and "Le Campus" not in m3 and "WORLDS" not in m3, "the Make's world titles are replaced by the repo's regions", "the Make's WORLDS titles survive")
check("`var(--region-${region.key})`" in m3 and "`var(--region-${region.key}-band)`" in m3, "world accent = --region-*, ground = --region-*-band", "world accent / ground not from the region tokens")
check("ROADSIDE_ITEMS" in m3 and "NATURE_ITEMS" in m3 and 'from "@/lib/map3d/scene"' in m3, "roadside props + nature come from scene.ts", "ROADSIDE_ITEMS / NATURE_ITEMS not wired")
for lbl in ("un crayon", "Je m'appelle…", "une baguette", "tout droit", "le marché"):
    check(lbl in scene_raw, f"roadside catalogue keeps « {lbl} »", f"roadside catalogue lost « {lbl} »")
check("export function placeNature(" in scene and "sRand(" in scene, "trees are placed procedurally (seeded)", "no procedural nature placement")
check("ARENA_PLACE" in m3 and "FINISH_Z" in m3 and "ARCH_Z" in m3, "the arch + finishing line (ARENA_PLACE) close the road", "no arch / finishing line")
check("BuildingSprite" in m3 and "PropSprite" in m3 and "NatureSprite" in m3, "building / prop / nature sprites", "sprites missing")

# 3 · semantics
check("sioKind(" in m3 and "sioSecondary(" in m3 and "KIND_COLOR[" in m3, "ring = KIND_COLOR[sioKind()], dot = sioSecondary()", "kind colours not from sioKind()/sioSecondary()")
# Round 9 (Dan): solid coloured buttons, the capture's register — the state
# signal moved from a dashed ring to a lightened face on the to-come stops.
# 2026-08-21: the current stop's inner ▶ is gone — the 🧑‍🎓 bobbing over it
# already says "you are here", and the triangle now means sound everywhere.
check("isSioDone(" in m3 and '"✓"' in m3 and "🧑‍🎓" in m3 and "home-map-bob" in m3 and f"55%, {'${PAPER}'}" in m3,
      "done ✓ · current = the bobbing 🧑‍🎓 · to-come the same colour lightened", "stop states missing")
check('{active ? "▶"' not in m3,
      "the current stop no longer doubles its mark with a ▶ inside",
      "the stop carries a ▶ as well as the 🧑‍🎓 — one thing, two marks")
check("st.short" in m3, "stops labelled with `short`", "labels not `short`")
check("onOpenSio?.(" in m3 and "onOpenUnit?.(" in m3, "stops open their SIO, gate signs open their unit", "onOpenSio/onOpenUnit not wired")
check('href="/practice/grammarathon/finale"' in m3 and "🏁" in m3, "🏁 FINAL links to the GramMarathon final", "no FINAL link")
check("CLASS_FLAG_SIO" in m3 and "🚩" in m3, "class flag 🚩 on its stop", "no class flag")
check("🧑‍🎓" in m3 and "home-map-bob" in m3, "the avatar bobs over the current stop", "no avatar")
check("pavedTo" in m3 and "travelledTo" in m3 and "strokeDasharray" in m3 and "accent ??" in m3, "road: paved → dotted at the class flag, travelled stretch in the accent", "road semantics missing")
check("zIndex: active ? 950" in m3, "the current stop always paints on top", "the current stop can be hidden behind nearer props")

# 4 · sky
check("export const SKY_KF" in sky and "export function getSkyColors(" in sky and "export function sunPosition(" in sky, "sky.ts: keyframes, getSkyColors(), sunPosition()", "sky.ts incomplete")
check("CLOUDS" in sky and "STARS" in sky, "clouds + stars", "no clouds / stars")
check("clockHour(" in m3 and "60_000" in m3 and 'get("hour")' in sky, "the real clock drives the sky once a minute; ?hour= pins it", "sky not on the clock / no ?hour=")
check("getSkyColors(hour)" in m3 and "m3dSky" in m3, "the sky gradient is painted from getSkyColors()", "sky gradient not from getSkyColors()")

# 5 · camera
check("overflow-y-auto" in m3 and "MAX_SCROLL" in m3 and "SCROLL_PER_STOP" in m3, "the box is a native scroll box, clamped to the road", "camera is not the box's scroll")
check("requestAnimationFrame" in m3 and "setCamZ(" in m3 and m3.count("requestAnimationFrame(tick)") == 1, "one rAF turns scrollTop into camZ", "camera rAF missing / duplicated")
check("landed" in m3 and "focusUnit" in m3 and "scrollForCam(" in m3, "opens on the current stop / deep-linked unit", "no landing logic")
check("📍" in m3 and "recentre" in m3, "📍 recentres on the current stop", "no 📍 recentre")
check("prefers-reduced-motion" in m3 and '"smooth" : "auto"' in m3, "reduced motion: recentre jumps instead of gliding", "reduced motion ignored")
check(".home-map-bob, .home-map3d-pulse, .home-map3d-ring { animation: none; }" in css, "reduced motion: no bob / pulse / ring (globals.css)", "bob/pulse/ring not disabled under reduced motion")
check("onFocusCapture" in m3 and "data-cam" in m3, "keyboard focus travels the camera to the stop", "focus does not travel")
check(".home-map3d-stage { overflow: clip; }" in css, "the stage is overflow: clip", "stage not overflow: clip")
check('aria-label="Course map, 3D' in m3 and "aria-current" in m3, "aria: the box is labelled, the current stop is aria-current", "aria labels missing")

# 6 · tokens only
HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")
for name, src in (("HomeMap3D.tsx", m3), ("projection.ts", proj), ("sky.ts", sky), ("scene.ts", scene)):
    n = len(HEX.findall(src))
    check(n == 0, f"{name}: no hand-coded hex (tokens / numeric RGB only)", f"{name}: {n} hex literal(s)")
check("Nunito" not in m3 and "fonts.googleapis" not in m3 and "--font-body-stack" in m3, "type = the Cahier body stack (no Nunito / Google Fonts)", "Nunito / Google Fonts crept in")
check("export const KIND_COLOR" not in m3, "KIND_COLOR defined once (HomeMap.tsx)", "KIND_COLOR redefined in HomeMap3D")
check("var(--cahier-gold)" in m3, "the current stop's ring is --cahier-gold", "gold ring not from the token")

# 7 · toggle intact
# The key moved to lib/mapView.ts on 1 Sep (see verify25b's note and verify80):
# Home's switch reads the same value now, and one setting spelt in three files
# is one setting until it isn't. The claim here — the map still renders both
# views, drives them from a pressed control, and remembers the choice — is
# unchanged; only where "remembers" is implemented moved, so the check asks
# MapBody for the CALL rather than for the string.
check("<HomeMap3D " in carte and "<HomeMap " in carte and "saveMapView(" in carte and "aria-pressed" in carte,
      "The Map's 2D ⇄ 3D toggle is intact", "the 2D/3D toggle in MapBody broke")

# 8 · no classmates / emails
check("ALL_CLASSMATES" not in raw and "@" not in re.sub(r'from "@/|import\("@/|"@/', "", raw), "no classmate names / emails in the 3D view", "classmate names or an email address in HomeMap3D")

# 50 stops
sios = json.load(open("src/content/sios/sios.json", encoding="utf-8"))
check(len(sios) == 50 and "N_STOPS = 50" in proj, "50 stops, and the engine knows it", "stop count drifted")

print("\npatch 25c/25d check (Home map 3D view: Dan's Figma Make, ported)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
