# SpecuLearn first batch — concrete item list (colors · transport · objets-articles)

Follow-up to `SPECULEARN_CANDIDATES.md` (Dan approved seeing items before authoring).
Test applied per item, matching the 2026-07-14/15 rules in
`src/lib/collections/speculearnReady.ts`: the emoji must be UNAMBIGUOUS at a
glance among 4 options drawn from the same deck, must depict the word (not
mnemonic-ise it — weather rule), and one image must map to exactly ONE word in
its deck (boutique rule). Each PLAY emoji was tested against its most
confusable deckmate; the pair is noted where it matters.

---

## colors (12 items) — src/content/collections/colors.json

Rendering check, as requested: the coloured **circles** 🔴🟠🟡🟢🔵🟣🟤⚫⚪ cover
9 of 12 colours as clean flat swatches. Rose and gris have **no circle**, but the
Unicode 15 hearts fill both gaps: 🩷 pink heart, 🩶 grey heart (well supported by
now; the deck already targets modern browsers). Beige has **no swatch at all** —
no circle, no heart, and every tan-ish emoji (🟤📦🧸) reads as marron.
(Alternative all-hearts scheme ❤️🧡💛💚💙💜🤎🖤🤍🩷🩶 also covers 11/12, but 🤍
white-heart renders with grey shading on several platforms and would collide
with 🩶 — the circles+2-hearts mix below is safer; shape carries no answer
information.)

| item id | fr | en | proposed emoji | verdict |
|---|---|---|---|---|
| colors-01 | le rouge | red | 🔴 | PLAY |
| colors-02 | l'orange | orange | 🟠 | PLAY — vs 🟡 jaune: clearly separated on all platforms |
| colors-03 | le jaune | yellow | 🟡 | PLAY |
| colors-04 | le vert | green | 🟢 | PLAY |
| colors-05 | le bleu | blue | 🔵 | PLAY — vs 🟣 violet: distinct |
| colors-06 | le violet | purple | 🟣 | PLAY — vs 🔵 bleu and 🩷 rose: distinct |
| colors-07 | le marron | brown | 🟤 | PLAY — vs 🟠 orange: distinct (dark vs bright); beige banned below so 🟤 maps to one word |
| colors-08 | le blanc | white | ⚪ | PLAY — vs 🩶 gris: white circle keeps only a thin outline, clearly not grey |
| colors-09 | le noir | black | ⚫ | PLAY — vs 🩶 gris: distinct |
| colors-10 | le gris | grey | 🩶 | PLAY — no grey circle exists; grey heart is a clean flat swatch |
| colors-11 | le rose | pink | 🩷 | PLAY — no pink circle exists; pink heart is unmistakable vs 🔴 and 🟣 |
| colors-12 | le beige | beige | — | BAN — unpicturable: no beige swatch exists, and any tan stand-in is defensible as marron (twin of 🟤) |

**colors: 11 playable / 1 banned** (`colors-12`).

---

## transport (12 items) — src/content/collections/transport.json

The three `prendre le/la/l'…` items are image-twins of their `en …` deckmates —
the exact ban predicted in the candidates sheet. Note for the WHY button /
Letris: they stay in every other game; the ban is SpecuLearn-only, same as the
commerces items.

| item id | fr | en | proposed emoji | verdict |
|---|---|---|---|---|
| transport-01-en-train | en train | by train | 🚄 | PLAY — 🚄 chosen over 🚆 to maximise distance from 🚇 métro (nose-cone, above ground vs tunnel) |
| transport-02-en-bus | en bus | by bus | 🚌 | PLAY |
| transport-03-en-metro | en métro | by metro | 🚇 | PLAY — vs 🚄 train: tunnel entrance makes it read "metro", the deck's one pair to watch |
| transport-04-en-voiture | en voiture | by car | 🚗 | PLAY |
| transport-05-en-avion | en avion | by plane | ✈️ | PLAY |
| transport-06-en-bateau | en bateau | by boat | ⛵ | PLAY — sailboat, no confusable deckmate |
| transport-07-a-velo | à vélo | by bike | 🚲 | PLAY — vs 🏍️ moto: pedals vs engine, distinct at a glance |
| transport-08-a-pied | à pied | on foot | 🚶 | PLAY — walking figure, unique in deck |
| transport-09-a-moto | à moto | by motorbike | 🏍️ | PLAY — vs 🚲 vélo: distinct |
| transport-10-prendre-metro | prendre le métro | to take the metro | — | BAN — twin: only possible image is 🚇, already `en métro` |
| transport-11-prendre-voiture | prendre la voiture | to take the car | — | BAN — twin: only possible image is 🚗, already `en voiture` |
| transport-12-prendre-avion | prendre l'avion | to take the plane | — | BAN — twin: only possible image is ✈️, already `en avion` |

**transport: 9 playable / 3 banned** (`transport-10-prendre-metro`,
`transport-11-prendre-voiture`, `transport-12-prendre-avion`).

---

## objets-articles (20 items) — src/content/collections/objets-articles.json

This deck is **weaker than the candidates sheet assumed** (~18 → 14). The sheet
priced in agrafeuse and the passeport/carte-d'identité pair, but five everyday
objects simply have **no emoji**: gomme (no eraser exists in Unicode),
agrafeuse (📎 is a paperclip — wrong object, weather rule), portefeuille (👛 is
a coin purse — that's a porte-monnaie), trousse (👝 is a clutch bag — defensible
as sac, boutique rule), mouchoirs (🧻 is a toilet roll; 🤧 pictures a sneeze,
not the object). Passeport falls to its 🪪 twin. All six stay in
Letris/Flip It/MCQ as usual.

| item id | fr | en | proposed emoji | verdict |
|---|---|---|---|---|
| objets-articles-01 | sac | bag | 🎒 | PLAY — school context; with trousse banned, 🎒 is the deck's only bag-like image |
| objets-articles-02 | livre | book | 📖 | PLAY — vs 📓 cahier: open reading book vs bound composition notebook, the deck's closest surviving pair |
| objets-articles-03 | cahier | exercise book | 📓 | PLAY — vs 📖 livre: see above; 📓's cover/elastic look reads "notebook" |
| objets-articles-04 | téléphone | phone | 📱 | PLAY — vs 💻 ordinateur: distinct |
| objets-articles-05 | stylo | pen | 🖊️ | PLAY — vs ✏️ crayon: dark ink pen vs yellow pencil, distinct at a glance |
| objets-articles-06 | crayon | pencil | ✏️ | PLAY — vs 🖊️ stylo: see above |
| objets-articles-07 | passeport | passport | — | BAN — twin/ambiguous: no passport emoji exists; 🛂 is passport *control* and, shown next to carte d'identité, either answer is defensible |
| objets-articles-08 | carte d'identité | ID card | 🪪 | PLAY — 🪪 is literally the identification-card emoji; unambiguous once passeport is banned |
| objets-articles-09 | trousse | pencil case | — | BAN — ambiguous: no pencil-case emoji; the usual stand-in 👝 is a small bag, defensible as sac |
| objets-articles-10 | ciseaux | scissors | ✂️ | PLAY |
| objets-articles-11 | gomme | eraser | — | BAN — unpicturable: Unicode has no eraser emoji; every stand-in is a different object |
| objets-articles-12 | portefeuille | wallet | — | BAN — mismatch: no wallet emoji; 👛 depicts a coin purse (porte-monnaie), weather rule |
| objets-articles-13 | lunettes | glasses | 👓 | PLAY — only eyewear in deck |
| objets-articles-14 | clé | key | 🔑 | PLAY |
| objets-articles-15 | règle | ruler | 📏 | PLAY — straight ruler; no confusable deckmate |
| objets-articles-16 | écouteurs | headphones | 🎧 | PLAY — matches the deck's EN gloss "headphones" |
| objets-articles-17 | mouchoirs | tissues | — | BAN — unpicturable: no tissue/tissue-box emoji; 🧻 reads toilet roll, 🤧 pictures the sneeze not the object |
| objets-articles-18 | ordinateur | computer | 💻 | PLAY — vs 🖱️ souris and 📱 téléphone: distinct |
| objets-articles-19 | agrafeuse | stapler | — | BAN — mismatch: no stapler emoji; 📎 is a paperclip (a different object — and the word trombone, if it ever joins the deck) |
| objets-articles-20 | souris | mouse | 🖱️ | PLAY — computer-mouse emoji fits the deck's IT context; vs 💻: distinct (do NOT use 🐭) |

**objets-articles: 14 playable / 6 banned** (`objets-articles-07`, `-09`, `-11`,
`-12`, `-17`, `-19`).

---

## Totals and revisions to the first sheet

| Deck | Playable | Banned | vs candidates sheet |
|---|---|---|---|
| colors | 11 | 1 | as predicted ("all 12" was optimistic — beige ban confirmed, so 11) |
| transport | 9 | 3 | exactly as predicted |
| objets-articles | 14 | 6 | **weaker than assumed** (~18 → 14): gomme, agrafeuse, portefeuille, trousse, mouchoirs have no honest emoji |
| **Total** | **34** | **10** | |

- **Downgrade note:** objets-articles remains worth shipping at 14 items, but it
  is no longer clearly ahead of the next-wave decks; if Dan wants a fatter first
  batch, aimer-activites (~15) is now comparable in yield.
- All 10 bans are SpecuLearn-only → add the item ids to
  `SPECULEARN_EXCLUDED_ITEMS` in `src/lib/collections/speculearnReady.ts` with
  one-line reasons, same style as the commerces/consignes entries. The three
  decks then join `SPECULEARN_READY`.
- Only non-baseline emoji proposed: 🩷🩶 (Unicode 15.0) and 🪪 (14.0) — all
  render on 2023+ platforms; everything else is ancient and safe.

---

# Appendix — what was actually built (added 24 Aug, not part of Dan's original sheet)

Everything above this rule is Dan's sheet as authored, copied verbatim. This
appendix was added when the sheet entered version control, and records how
commit `4158e2f` on `origin/claude/peers-vd2h6h` compares to it.

## colors — sheet honoured exactly

11 items play. The 11 PLAY emoji in the table were written into
`src/content/collections/colors.json` unchanged (🔴🟠🟡🟢🔵🟣🟤⚪⚫🩶🩷).
`colors-12` (« le beige ») received no emoji and was added to
`SPECULEARN_EXCLUDED_ITEMS`.

## transport — sheet honoured exactly

9 items play. The 9 PLAY emoji were written into
`src/content/collections/transport.json` unchanged (🚄🚌🚇🚗✈️⛵🚲🚶🏍️).
`transport-10-prendre-metro`, `transport-11-prendre-voiture` and
`transport-12-prendre-avion` received no emoji and were added to
`SPECULEARN_EXCLUDED_ITEMS`.

One addition not in the sheet: a new per-deck `SPECULEARN_PROMPT_FRAME` map
renders « Tu y vas comment ? » above the options on the transport deck only.

## objets-articles — the six bans were reversed, then vetoed back (see below)

The sheet bans six items as unpicturable or ambiguous. Commit `4158e2f` **did
not add any of the six to `SPECULEARN_EXCLUDED_ITEMS`.** Instead it
commissioned a purpose-drawn flat SVG for each, so the deck briefly played
**20 of 20** rather than the sheet's 14 — reversed by the veto below; as
shipped, it plays 14.

The 14 PLAY emoji from the table were written into the deck JSON unchanged. The
six banned items got images instead:

| item id | fr | sheet verdict | as built |
|---|---|---|---|
| objets-articles-07 | passeport | BAN (twin of 🪪) | `/objets-articles/passeport.svg` — dark booklet with gold emblem |
| objets-articles-09 | trousse | BAN (👝 is a clutch bag) | `/objets-articles/trousse.svg` — zip pouch |
| objets-articles-11 | gomme | BAN (no eraser emoji) | `/objets-articles/gomme.svg` — two-tone eraser block |
| objets-articles-12 | portefeuille | BAN (👛 is a coin purse) | `/objets-articles/portefeuille.svg` — bifold wallet |
| objets-articles-17 | mouchoirs | BAN (🧻 is a toilet roll) | `/objets-articles/mouchoirs.svg` — tissue box |
| objets-articles-19 | agrafeuse | BAN (📎 is a paperclip) | `/objets-articles/agrafeuse.svg` — red stapler |

**VETOED 24 Aug.** Dan reviewed the six actual renders — findings kept for
the record:

| item id | fr | render verdict |
|---|---|---|
| objets-articles-19 | agrafeuse | good depiction, holds up on its own merit |
| objets-articles-11 | gomme | good depiction, holds up on its own merit |
| objets-articles-07 | passeport | acceptable but weak |
| objets-articles-12 | portefeuille | acceptable but weak |
| objets-articles-09 | trousse | outright failure — also collides with mouchoirs |
| objets-articles-17 | mouchoirs | outright failure — also collides with trousse |

Ruling: *"Veto all six, restore your original bans, ship at 14."* His
reasoning applies independent of any individual drawing's quality: in a
four-option SpecuLearn round, three Apple-style emoji beside one flat
hand-drawn SVG makes the drawn item the visually odd one on screen — the
style mismatch itself becomes a cue to the answer, a structural leak that
the most distinctive drawings (like agrafeuse and gomme, the two that read
best on their own terms) leak *hardest*. That is why the two good renders
were vetoed along with the two failures, rather than kept selectively — the
leak is in the mismatch, not in the drawing quality.

On the mechanism itself (keep the TypeScript lookup, or move image paths
into deck JSON?): *"Leave it in TypeScript — it's a short list, don't
over-engineer."* `SPECULEARN_ITEM_IMAGES` in `speculearnReady.ts` stays as
an empty lookup for future short-list exceptions; the six SVGs are removed
from `public/objets-articles/` (recoverable from git history, `4158e2f`,
if ever revisited) and the six ids are back in `SPECULEARN_EXCLUDED_ITEMS`.
objets-articles ships at 14/20, matching the sheet exactly. Total across
the three decks: **34 playable / 10 banned**, as the sheet always said.

## Why the SVG-lookup mechanism lives in code (mechanism kept, unused)

`src/lib/collections/schema.ts` gives `Item` an `emoji` field and **no image
field**. Any future per-item SVG override therefore can't go into the deck
JSON, and lives in a TypeScript lookup, `SPECULEARN_ITEM_IMAGES` (item id →
path) in `src/lib/collections/speculearnReady.ts`, consulted by
`buildItems()` in `SpecuLearnContent.tsx`; an `img` wins over an `emoji`
when present. This is a code-side pattern, not a content-side one — the deck
JSON never records that an item has a picture. As of the veto, the lookup is
empty; nothing currently uses it.

Per STATUS's 24 Aug ruling 4, emoji authoring is approved for four more decks —
**core-nouns, days, matieres, professions** — which are queued to follow this
same pattern.

## Counts as built

| Deck | Emoji items | SVG items | Playable | Excluded |
|---|---|---|---|---|
| colors | 11 | 0 | 11 of 12 | `colors-12` |
| transport | 9 | 0 | 9 of 12 | the three `prendre-*` |
| objets-articles | 14 | 6 | 20 of 20 | none |
| **Total** | **34** | **6** | **40 of 44** | **4** |

The sheet's total was 34 playable / 10 banned. As built it is 40 playable / 4
excluded, the difference being the six objets-articles reversals.
