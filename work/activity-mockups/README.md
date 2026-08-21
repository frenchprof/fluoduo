# FluOlinGo Activity Screens

The Menu plus one screen per activity, in the Menu's own order.

The **source of truth** is the `.dc.html` artboards, `canvas.json`, and the
generator that emits them. The seeded `fluolingo-*-mockups.html` is a ~10,000-line
build artefact and is **git-ignored** — regenerate it, never commit it.

## Regenerate

```sh
python3 gen_a.py && python3 gen_b.py && python3 gen_c.py && python3 gen_d.py                      # rewrite the .dc.html artboards
SK=<claude design skill base dir>
node "$SK/seed-canvas.mjs" --template "$SK/payload.template.html" \
  --out fluolingo-activity-mockups.html --title "FluOlinGo Activity Screens" \
  $(for f in *.dc.html; do printf -- "--artboard %s " "$f"; done) \
  --canvas canvas.json
node "$SK/seed-canvas.mjs" --check fluolingo-activity-mockups.html
```

Then publish the seeded file as an Artifact. Edit the generator, not the
`.dc.html` files directly — regenerating overwrites them.
