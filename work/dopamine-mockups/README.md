# FluOlinGo Dopamine Mockups

One artboard per proposal in docs/DOPAMINE_REVIEW.md.

The **source of truth** is the `.dc.html` artboards, `canvas.json`, and the
generator that emits them. The seeded `fluolingo-*-mockups.html` is a ~10,000-line
build artefact and is **git-ignored** — regenerate it, never commit it.

## Regenerate

```sh
python3 gen.py                      # rewrite the .dc.html artboards
SK=<claude design skill base dir>
node "$SK/seed-canvas.mjs" --template "$SK/payload.template.html" \
  --out fluolingo-dopamine-mockups.html --title "FluOlinGo Dopamine Mockups" \
  $(for f in *.dc.html; do printf -- "--artboard %s " "$f"; done) \
  --canvas canvas.json
node "$SK/seed-canvas.mjs" --check fluolingo-dopamine-mockups.html
```

Then publish the seeded file as an Artifact. Edit the generator, not the
`.dc.html` files directly — regenerating overwrites them.
