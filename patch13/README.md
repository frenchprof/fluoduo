# Patch 13 — the persistent shell for games, and the Cahier tokens

## The problem

Five games rendered their own top bar — a browser-style `← Back`, the game's
name, a help dot — in five different colour schemes:

```
games/numbus              games/numbourse
games/compose/[bankId]    games/lexicalater/[deckId]
games/vocabularain/[setId]
```

None offered a way back to FluOlinGo. None carried the icons every other page
has. A learner arriving from a link was stranded.

Match It, every practice drill and every pretest were already fine — they go
through `CahierShell`. It was only these five.

## The fix

One `GameBar`, on all five:

```
← FluOlinGo        ☁️ Quel temps fait-il ?        🗂️ 📊 🏆 👤 ?
```

FluOlinGo home on the left, the activity in the middle, and Index / Mon progrès /
Classement / Profil on the right. **Sticky**, so it travels with the learner and
never covers the game.

Four destinations, not fifteen. PRD §9 rejects the feature-inventory navigation,
and a bar inside a game is the last place to reintroduce it.

**Why not the full CahierShell in a game:** a game needs its screen. Duolingo's
lesson player strips its chrome deliberately, to protect focus — but it always
keeps an exit and a sense of place. This is that, and nothing more. The flap
rail stays off.

Games that have a gallery (`vocabularain`, `lexicalater`, `compose`) also get a
second, weaker `↩︎` back to it. Each game keeps its own background — the bar is
consistent, the game is still itself.

## Also: the Cahier design tokens

The tokens from your handoff are now in `globals.css` — the OKLCH palette, the
`--tier-good/medium/weak` set, and the type, spacing and radius scales.

**Additive only.** `--cahier-paper`, `--cahier-ink` and `--cahier-ink-soft`
already existed and are **not** redefined; overriding them would shift every
page that already uses them, which is not what importing a token set should do.
26 new names, 0 overridden. Nothing that renders today changes.

That means the next patch can build the Metric Card, the tabs pattern and the
path screen straight from the tokens, with no further groundwork.

## Run it

```bash
cd ~/fluoduo && unzip -o ~/Downloads/patch13.zip && python3 patch13/apply13.py
```

then stop the dev server and

```bash
rm -rf .next && npx tsc --noEmit && npm run build 2>&1 | tail -3 && npm run dev
```

Check any of: `/games/numbus`, `/games/numbourse`, `/games/vocabularain/weather`,
`/games/lexicalater/aliments`, `/games/compose/cafe`.

Verified here first: tsc 0 errors, next build 738 pages, idempotent on re-run.

## What this does not do yet

The left rail from your mockup (Apprendre / Lettres / Défis / Cartes / Profil),
the vertical path, and the 4×4 activity grid. Those are the next piece — this
one is only about never being stranded.
