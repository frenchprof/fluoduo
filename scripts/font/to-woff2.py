#!/usr/bin/env python3
"""Compresses the FontForge-built .otf to .woff2 for the web. Plain
fontTools — no FontForge dependency, so it runs under the regular
python3 (`pip install fonttools brotli`), separately from build_font.py
which needs FontForge's own Python.
"""
import os

from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "..", "..", "public", "fonts")
OTF = os.path.join(OUT_DIR, "FluOlinGoHand-Regular.otf")
WOFF2 = os.path.join(OUT_DIR, "FluOlinGoHand-Regular.woff2")

font = TTFont(OTF)
font.flavor = "woff2"
font.save(WOFF2)
print(f"{OTF} -> {WOFF2}")
