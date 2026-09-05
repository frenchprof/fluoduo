#!/usr/bin/env python3
"""
FluOLinGo wears its own mark — in the tab, on the home screen, and installed.

WHAT THIS IS FOR. The app shipped for months with `public/next.svg`,
`vercel.svg`, `file.svg`, `globe.svg` and `window.svg` — the Next.js starter's
art — still sitting in the public folder, and the tab icon was a lime notebook
with no letters in it. Dan drew the mark on 5 Sep (notebook, F and g, red
shell, blue F) and this check is what stops a future scaffold, a `create-next-
app` re-run, or a careless revert putting the framework's identity back.

WHAT IT ASSERTS, and why each one is about the DRAWING rather than a filename:

  1. Every icon path the manifest and the layout name actually exists. A
     manifest that points at a missing PNG installs a blank tile, and nothing
     else in the build complains.
  2. Each PNG really is the size its name claims. `icon-512.png` at 192px is
     a launcher blur nobody notices until it is on a phone.
  3. The art is POLYCHROME — at least three distinct saturated hues. The
     starter art is monochrome and the icon it replaced was a single lime; a
     one-hue icon here means the mark went away. This is deliberately not a
     palette lock: Dan can recolour the mark and this still passes.
  4. The maskable icon keeps its safe area — the outer ring of the canvas is
     all one colour, so a launcher cropping to a circle cannot clip the mark.
  5. `src/app/icon.svg` exists, parses, and carries a viewBox — AND the layout
     actually links it. Declaring any `icons` object in the metadata switches
     off Next's file convention, so `app/icon.svg` can sit in the export with
     nothing pointing at it and the tab quietly falls back to the .ico. That
     is what happened the first time this shipped; the check is on the LINK.
  6. `favicon.ico` is a real ICO declaring at least one image.
  7. No Next.js starter asset is back in `public/`.

Run from the repo root:  python3 verify/verify95-icons.py
"""
import colorsys
import os
import re
import struct
import sys
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONS = os.path.join(ROOT, "public", "icons")
STARTER = ["next.svg", "vercel.svg", "file.svg", "globe.svg", "window.svg"]

fails = []


def png_size(path):
    """Width and height from the IHDR chunk — no decoder needed."""
    with open(path, "rb") as fh:
        head = fh.read(24)
    if head[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", head[16:24])


def hues(path, sample=64):
    """The distinct saturated hues in an image, as 30-degree buckets."""
    from PIL import Image

    im = Image.open(path).convert("RGB").resize((sample, sample))
    seen = {}
    for r, g, b in list(im.im):  # getdata() is deprecated in Pillow 14
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        if s < 0.35 or l < 0.12 or l > 0.94:
            continue  # paper, ink and near-greys carry no hue
        seen[int(h * 12) % 12] = seen.get(int(h * 12) % 12, 0) + 1
    # a hue has to cover real area, not a handful of anti-aliased pixels
    return {k for k, n in seen.items() if n >= sample * sample * 0.005}


# --- 1 + 2. the files the app promises ---------------------------------------
EXPECTED = {"icon-192.png": 192, "icon-512.png": 512, "maskable-512.png": 512,
            "apple-touch-icon.png": 180}
for name, want in EXPECTED.items():
    path = os.path.join(ICONS, name)
    if not os.path.exists(path):
        fails.append(f"public/icons/{name} is missing — the manifest or the layout names it.")
        continue
    size = png_size(path)
    if size is None:
        fails.append(f"public/icons/{name} is not a PNG.")
    elif size != (want, want):
        fails.append(f"public/icons/{name} is {size[0]}x{size[1]}, but its name promises {want}x{want}.")

# every src the manifest names must be on disk
manifest = open(os.path.join(ROOT, "src", "app", "manifest.ts"), encoding="utf-8").read()
for src in re.findall(r'src:\s*"(/icons/[^"]+)"', manifest):
    if not os.path.exists(os.path.join(ROOT, "public", src.lstrip("/"))):
        fails.append(f"manifest.ts names {src}, which does not exist — installs get a blank tile.")

layout = open(os.path.join(ROOT, "src", "app", "layout.tsx"), encoding="utf-8").read()
for src in re.findall(r'"(/icons/[^"]+)"', layout):
    if not os.path.exists(os.path.join(ROOT, "public", src.lstrip("/"))):
        fails.append(f"layout.tsx names {src}, which does not exist.")

# --- 3. the mark is polychrome ------------------------------------------------
for name in ("icon-512.png", "apple-touch-icon.png"):
    path = os.path.join(ICONS, name)
    if not os.path.exists(path):
        continue
    found = hues(path)
    if len(found) < 3:
        fails.append(
            f"public/icons/{name} carries {len(found)} hue(s). FluOLinGo's mark is "
            f"polychrome — one hue means the starter art or the old single-colour "
            f"notebook is back."
        )

# --- 4. the maskable icon keeps its safe area ---------------------------------
mask = os.path.join(ICONS, "maskable-512.png")
if os.path.exists(mask):
    from PIL import Image

    im = Image.open(mask).convert("RGB")
    w, h = im.size
    band = max(2, int(w * 0.06))
    edge = set()
    for x in range(0, w, 4):
        edge.add(im.getpixel((x, band // 2)))
        edge.add(im.getpixel((x, h - 1 - band // 2)))
    for y in range(0, h, 4):
        edge.add(im.getpixel((band // 2, y)))
        edge.add(im.getpixel((w - 1 - band // 2, y)))
    if len(edge) > 1:
        fails.append(
            "maskable-512.png has art in its outer band. A launcher that crops to "
            "a circle will clip the mark — the maskable variant must sit inside "
            "the safe area with the ground bleeding to every edge."
        )

# --- 5. the tab drawing -------------------------------------------------------
svg_path = os.path.join(ROOT, "src", "app", "icon.svg")
if not os.path.exists(svg_path):
    fails.append("src/app/icon.svg is missing — the browser tab falls back to whatever is left.")
else:
    try:
        root = ET.parse(svg_path).getroot()
        if not root.get("viewBox"):
            fails.append("src/app/icon.svg has no viewBox, so it will not scale to a tab.")
    except ET.ParseError as exc:
        fails.append(f"src/app/icon.svg does not parse: {exc}")

    # Present is not the same as linked. `icons:` in the metadata turns off the
    # file convention that would otherwise find app/icon.svg by itself.
    # COMMENTS STRIPPED FIRST: the prose above `icons:` in layout.tsx explains
    # this very trap and names /icon.svg, which would satisfy a raw grep and
    # make this assertion pass against broken code. It did, on the first try.
    code = re.sub(r"/\*.*?\*/", "", layout, flags=re.S)
    code = re.sub(r"^\s*//.*$", "", code, flags=re.M)
    if "icons:" in code and "/icon.svg" not in code:
        fails.append(
            "layout.tsx declares an `icons` object but never names /icon.svg. "
            "That switches off Next's file convention, so the SVG ships in the "
            "export with nothing linking it and the tab falls back to the .ico."
        )

# --- 6. the .ico --------------------------------------------------------------
ico_path = os.path.join(ROOT, "src", "app", "favicon.ico")
if not os.path.exists(ico_path):
    fails.append("src/app/favicon.ico is missing — /favicon.ico is still the most requested path on the site.")
else:
    with open(ico_path, "rb") as fh:
        head = fh.read(6)
    if len(head) < 6 or head[:4] != b"\x00\x00\x01\x00" or struct.unpack("<H", head[4:6])[0] < 1:
        fails.append("src/app/favicon.ico is not an ICO declaring at least one image.")

# --- 7. the starter art stays gone --------------------------------------------
back = [f for f in STARTER if os.path.exists(os.path.join(ROOT, "public", f))]
if back:
    fails.append(
        "the Next.js starter art is back in public/: " + ", ".join(back) +
        ". These ship to every visitor and are not FluOLinGo's."
    )

if fails:
    print("verify95-icons: FAIL")
    for f in fails:
        print("  - " + f)
    sys.exit(1)

print("verify95-icons: the mark is in the tab, on the home screen and installable; no starter art.")
