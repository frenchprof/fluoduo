# French learning-target review — FluOLinGo / LAF1201 (A1)

**Date:** 3 Sep 2026 (revised same day — product-lead priority)  
**Scope:** native-speaker + teaching review of learner-facing French  
**Audience:** NUS LAF1201 absolute beginners  
**Method:** source files, not a live scrape.

**Order of work (Dan, 3 Sep):** SpecuLearn + pretests first → Flip It / MémoiRecall collections → everything else.

This PR is **report-only**. No product copy was changed.

**Not flagged (intentional):**

- Spoken *Comment tu t’appelles ?* / *Comment vous vous appelez ?* — oral A1, keep.
- English UI chrome (titles, can-dos, WHY *language*, game help, map `topic` / `short`) — keep.
- Ungrammatical **distractors** a learner could have produced (Dan, 1 Sep).

**Held as notes only (do not elevate):** Bélarus / Biélorussie, Birmanie / Myanmar, Cap-Vert / Centrafrique naming — see §6.

---

## Executive summary

### (A) Teach-blocking for next ship

Two items. Both verified in source. Fix these before the next content ship.

| # | Fault | Surface | File + id | Why it blocks teaching | Fix |
|---|---|---|---|---|---|
| **A1** | *Enchanté* keyed as the only correct line after the learner has just said she is **Léa** | SpecuLearn / Unit 0 pretest (SIO-010, all three audience tabs) | `src/content/sios/unit0-questions.ts` · `SIO010_SITUATIONS` · `informal` / `formal` / `group` | The scripted speaker is feminine. The keyed form is masculine. The atelier two doors away already has Léa say *Enchantée*. A learner who copies the green key leaves with the wrong agreement for herself. There is **no** EN WHY on the masculine pick, because it is marked `ok: true`. | Gender-condition the key: when the name just given is Léa (or any feminine speaker), **`Enchantée !` / `Enchantée, madame.` is the correct option**. Keep `Enchanté` as a **wrong** option and give it an EN WHY, e.g. *“Léa is a woman — she says Enchantée (feminine). Enchanté is the form a man says.”* Do the same on the formal tab (`Enchanté, madame.` → `Enchantée, madame.`). |
| **A2** | Country name **Liberia** (no accent) | Expert country list (Letris), not the A1 SpecuLearn 25 | `src/content/countries-expert-letris.json` · tile `LIBERIA` / `displayName`: `Liberia` | French is **`Libéria`**. The tile and the spoken/display name both lack the accent. A learner who copies the tile writes English. | `displayName`: `Libéria`. Tile text: `LIBÉRIA` (or keep caps without the accent only if the Letris renderer cannot show É — then the **displayName** must still carry it). English `meaning` may stay `Liberia`. |

**Not in the A1 SpecuLearn country deck.** `collections/countries-letris.json` and pretest `u1-sio015.json` do not contain Liberia. The misspelling is on the expert list only — still ship-critical if that list is playable.

**Already correct (do not “fix”):** SIO-010 atelier (`ateliers.ts`) — Marc says *Enchanté !*, Léa says *Enchantée !*. Textgen U0/U1 agrees *Enchantée* with a feminine speaker. Compose banks already list both forms.

---

### (B) Flip It / MémoiRecall findings

No P0 in the 44 collection decks (nothing ungrammatical is keyed as the Flip It answer). Highest-impact P1s, first week of the course:

1. **`Nous nous appelons Léa et Marc.`** — `sappeler.json` · `sappeler-05`. *S’appeler* takes one name. Calque of “Our names are…”.
2. **`Vous vous appelez Madame Martin.`** — `sappeler.json` · `sappeler-06`. *Madame* is an address title, not a `s’appeler` slot.
3. **`Enchanté !` only** — `salutations.json` · `salutations-03`. Deck has no *Enchantée* card (pairs with A1).
4. **`Bonne nuit !` in the anytime-goodbye column** — `salutations.json` · `salutations-11`. Bedtime only; Unit 0 pretest already teaches that.
5. **`C’est où ? — C’est une classe.`** — `core-nouns.json` · `core-nouns-06`. *Classe* = the group; the room is *salle de classe*.

Details: §4.

---

### (C) Everything else

- **SIO map chips:** *C’est comment ?* (colours) should be *De quelle couleur ?*; *Les instructions de classe* should be *Les consignes de classe*.
- **Lessons:** professions bonus accepts *C’est une médecin* (textgen already refuses it). Salutations / Ça s’écrit bonuses key only *Enchanté*.
- **Atelier SIO-040** uses *tu* for an itinerary; SIO-036 drills *vous* for directions — say so, or align.
- **Weather pretest** *Il y a de l’orage prévu* is awkward; `l'` cards show a space after the apostrophe.
- **Conjugaison, textgen, chapters, market memos:** sound.
- **Naming holds** (Bélarus / Birmanie / Cap-Vert / Centrafrique): §6.

---

## 1. Inventory

| Priority | Area | Where | Covered? | Notes |
|---|---|---|---|---|
| **1st** | **SpecuLearn** | Same `fr` as the 9 ready collections (`speculearnReady.ts`) + prompt frame | Yes | Ready: `aliments`, `consignes`, `countries-letris`, `languages`, `lieux-letris`, `commerces`, `colors`, `transport`, `objets-articles`. Prompt: `Tu y vas comment ?` (transport). No separate French bank. |
| **1st** | **Pretests U1–U4** | `src/content/pretests/*.json` (35) | Yes | Gap-fill MCQ. ~1,700 strings. |
| **1st** | **Unit 0 pretests** | `src/content/sios/unit0-questions.ts` | Yes | **No** `pretests/unit0/` folder. This **is** SpecuLearn’s other engine (Dan, 10 Aug: Pre-Test folds into SpecuLearn). |
| **2nd** | **Flip It / MémoiRecall** | `src/content/collections/*.json` (44) + `atelierDecks.ts` | Yes | ~1,500 `fr` / gap / label strings. |
| **3rd** | Ateliers | `src/content/ateliers.ts` | Yes | Six production dialogues. |
| **3rd** | SIO chips | `src/content/sios/sios.json` | Yes | Learner French = `fr` chip. `topic` / `canDo` are English chrome. |
| **3rd** | Lessons | `src/content/lessons/native/*` | Yes | Mémo chips, bonus EN→FR. English concept prose skipped. |
| **3rd** | ConjugaZone | `src/content/conjugaison.ts` | Yes | 66 présent paradigms — standard. |
| **3rd** | Textgen | `src/content/textgen/unit0.ts`–`unit4.ts` | Yes | Gender / Enchanté(e) well constrained. |
| **3rd** | Mémos / chapters | `memos.tsx`, `chapters.ts` | Yes | Chapter titles sound. Market dialogue natural. |
| **3rd** | Legacy Letris | `src/content/*-letris.json` | Yes | **Still live** via `src/games/letris/sets.ts` (root files, not `collections/`). Expert country list lives here. |
| **3rd** | Finale / Devine | `finale.ts`, `devine-aliments.json` | Yes | Sound. |
| — | `src/content/games/` | — | **Not found** | Game French = collections + root Letris JSON. |
| — | Skills / ChaTutor / Compose | `hints.ts`, `functions/api/*` | No learner French bank | Hints are English chrome. |

**Open PRs checked:** #152, #153 — neither rewrites these French banks.

**What is generally strong.** Articles, partitives, *avoir* vs *être* states, country gender on the A1 25, nationality four-forms, transport *en* / *à*, negation *pas de* vs *pas le*, market lines, SpecuLearn’s nine playable decks, and the SIO-010 atelier’s *Enchanté* / *Enchantée* pair.

---

## 2. Priority key

- **Ship-critical (A).** Teach-blocking. Next content ship.
- **P1.** Awkward / misleading, or two surfaces teach opposite things.
- **P2.** Nit / coverage. Fix when touching the file.

---

## 3. SpecuLearn + pretests (first)

SpecuLearn has **no authored French of its own**. It serves the `fr` field of the nine ready decks (emoji / photo → pick the word). Those nine were read as SpecuLearn content, not only as Flip It.

**SpecuLearn playable French: clean.** No keyed error on `aliments`, `consignes`, `countries-letris` (A1 25 — no Liberia), `languages`, `lieux-letris`, `commerces`, `colors`, `transport`, `objets-articles`. Transport frame *Tu y vas comment ?* is the right oral question.

The teach-blocking French on this surface is the **Unit 0 pretest** (same SpecuLearn cell).

### A1 — *Enchanté* / *Enchantée* (ship-critical)

The SIO-010 pretest is three tabs. On every tab the learner has just given **Léa**’s name, then the keyed “nice to meet you” is masculine only.

| Tab | Prompt (chrome — not flagged) | Keyed correct | Speaker | Fault |
|---|---|---|---|---|
| `informal` | “You have just exchanged names with the other student. You say:” | `Enchanté !` | Léa (`Moi, je m'appelle Léa.`) | Masculine key. No EN WHY if they pick it (it is “right”). *Enchantée* is not offered. |
| `formal` | “The client has just given you their name. You say:” | `Enchanté, madame.` | Léa (`Je m'appelle Léa Martin.`) | Same. Formal *madame* does not cancel the participle agreement. |
| `group` | “You have just exchanged names with the group. You say:” | `Enchanté !` | Léa (`Moi, je m'appelle Léa.`) | Same. |

**WHY text today** (only on *wrong* picks, and it never mentions gender):

- Informal leave-taking distractor: *“That's for the moment you are introduced.”*
- Formal name distractor: *“Enchanté is 'nice to meet you' — it doesn't give your name.”*
- Formal leave-taking: *“That's for the moment you are introduced.”*

**Required shape (Dan, 3 Sep):**

1. **Gender-conditioned keys.** If the speaker in the stem is feminine → `Enchantée !` / `Enchantée, madame.` is `ok: true`. If masculine (a Marc variant) → `Enchanté !`.
2. **EN WHY on the masculine pick when the speaker is feminine.** Example: *“Léa is a woman — she says Enchantée. Enchanté is what a man says.”*
3. Do **not** mark both as correct on a Léa item. That would hide the teaching point. Offer both forms; key one.

**Same fault, later surfaces (not ship-critical by themselves, but the rewrite should sweep them):**

| File | Current | Note |
|---|---|---|
| `collections/salutations.json` · `salutations-03` | `Enchanté !` only | Flip It card. Add a paired `Enchantée !`. |
| `lessons/native/salutations.tsx` dice + bonus | `correct: "Enchanté !"` / `{ en: "Nice to meet you!", fr: "Enchanté !" }` | Accept `Enchantée !` as `alt` on the bonus; dice needs a feminine prompt or both keys. |
| `lessons/native/ca-secrit.tsx` bonus | same | same |
| `atelier-rencontre.tsx` | *Enchanté* → *Enchanté, madame* | Still skips *Enchantée*. |
| `ateliers.ts` SIO-010 | Marc *Enchanté*, Léa *Enchantée* | **Already right.** |
| `textgen/unit0.ts` | `enchante(g)` | **Already right.** |

### A2 — *Libéria* (ship-critical)

| | |
|---|---|
| **Current** | `"text": "LIBERIA"`, `"displayName": "Liberia"`, `"meaning": "Liberia"` |
| **File** | `src/content/countries-expert-letris.json` (Africa block, 🇱🇷) |
| **Not in** | `collections/countries-letris.json`, `pretests/u1-sio015.json`, SpecuLearn ready set |
| **Why** | French spelling is **Libéria**. The expert list is playable Letris. English *meaning* may stay. |
| **Fix** | `displayName`: `Libéria`. Tile: `LIBÉRIA` if the renderer shows accents (other tiles already do: `CÔTE D'IVOIRE`, `NÉPAL`, `BIÉLORUSSIE`). |

### Other pretest findings (not ship-critical)

#### P1 — `Il y a de l'orage prévu ce soir.`

`src/content/pretests/u3-l1-weather.json` · `08-de-l-orage`  
*Orage* is countable. Prefer *Un orage est prévu ce soir* / *Il y a un orage prévu ce soir.* The collection already has `des orages`.

#### P1 — space after `l'` / `d'` on the visible card

`u2-sio026.json` · `-05`; `u3-sio033.json` · `03`, `04`; `u4-sio042.json` (eau / huile).  
`fullSentence` is `à l'hôpital`. The frame is `… [à l'] hôpital.` — a space after the apostrophe. `sentenceAfter` should start at `hôpital.` when the answer already ends in `'`.

#### P2

| String | File / id | Why | Fix |
|---|---|---|---|
| `il faut manger équilibré` | `u4-sio048-advice.json` · `-04` | PNNS / advertising register. | `manger des légumes` (already in the same pretest) or `de façon équilibrée`. |
| `J'étudie le génie.` | `u1-sio013.json` · `-12` | Incomplete without the branch. | Specify, or drop (*l’ingénierie* is `-13`). |
| Price hints in the French line | `u4-sio045a-nombres.json` | `(71 €)` is meta in `sentenceAfter`. | `contextLabel`. |
| Stage directions in the gap | `u4-sio047.json` | `Le client : « … »` in the stem. | Role in `contextLabel`. |

**Unit 0 banks other than SIO-010:** s’appeler forms, tu/vous situations, letters, days, colours, nouns, numbers, consignes, greetings — keyed French is sound. *Bonne nuit* is correctly bedtime-only here (the Flip It deck is the one that files it as a general goodbye).

**U1–U4 pretests with no keyed-French problem:** `011`–`012`, `014`–`016`, `018`–`019`; U2 `021`–`025`, `027`–`029`; U3 `034`–`039` (aside from elision spacing); U4 `041`, `045`, `046`, `047-plans`, most of `047`.

---

## 4. Flip It / MémoiRecall (second)

#### P1 — `Nous nous appelons Léa et Marc.`

`collections/sappeler.json` · `sappeler-05`  
Also Unit 0 stem `[Nous,] Nous ___ Marc et Léa.` → `nous appelons`.  
*S’appeler* gives one name to one subject. Fix: `Nous nous appelons les Martin.` **or** split the two names across two cards.

#### P1 — `Vous vous appelez Madame Martin.`

`collections/sappeler.json` · `sappeler-06`  
*Madame* is how you **address** someone. The deck already has `Bonjour, Madame Martin.` (`sappeler-11`–`13`). Fix: `Comment vous vous appelez ?` or `Vous vous appelez Martin ?`

#### P1 — `Enchanté !` with no feminine card

`collections/salutations.json` · `salutations-03`  
Pairs with ship-critical A1. Add `Enchantée !`. Do not delete the masculine card.

#### P1 — `Bonne nuit !` tagged `col:partir_std` (“BYE · anytime”)

`collections/salutations.json` · `salutations-11`  
Bedtime only. The Unit 0 pretest already teaches this. Align the deck tag (or a “bedtime” column) with that.

#### P1 — `C’est où ? — C’est une classe.`

`collections/core-nouns.json` · `core-nouns-06`  
*Une classe* = the group / the course. The room is *une salle de classe*. Unit 0 pretest already has `salle de classe` as its own item. Retag as *quoi* **or** change the French to `salle de classe`.

#### P1 — `du tonnerre` under *Il y a*

`collections/weather-letris.json` · `weather-letris-15-du-tonnerre`  
Prefer *Il tonne* (already in the deck) or *On entend le tonnerre*.

#### P2

| String | File / id | Why | Fix |
|---|---|---|---|
| `piano` → *faire du piano* | `faire-activites.json` · `-10` | Exists for lessons; unmarked play-verb is *jouer du piano*. | Teacher note or a *jouer du* row. |
| `le hindi` + en “Hindi / Urdu” | `languages.json` · `-03-hindi` | French is fine. Gloss merges two languages. | Drop “/ Urdu” or add *l’ourdou*. |
| `Corée` + 🇰🇷 | `nationalities.json` · `nat-05`; `countries-letris.json` · `-05` | Flag is South Korea. | `Corée du Sud` if the syllabus is ROK. |
| `x degrés` | `weather-letris.json` · `-07`, `-08` | Placeholder on a learner card. | `28 degrés`. |
| `midi` missing | `days.json` | Unit 0 pretest added *midi*. Deck has only matin / après-midi / soir. | Add `midi`. |
| Alphabet Letris skips E, O, Q, U columns | `alphabet.json` | Items exist; columns don’t cover all 7 sound groups. | Extend columns or say Flip-It-only. |

**Collections clean** (no P0/P1 in taught `fr`):  
`consignes`, `tu-vous` (*tes parents* as **plural** *vous* is right), `etre-etudiant`, `avoir-etats`, `professions` (deck — the lesson alt is §5), `possessives`, `partitifs`, `aliments`, `transport`, `en-au-aux-a`, `lieux-letris`, `loin-lesson`, `directions-matching`, `negation-pas`, `quand-time`, `aller-destinations`, `aimer-activites`, `parce-que`, `pouvoir`, `envies-besoins`, `vouloir-inviter`, `objets-articles`, `stress-pronouns`, `matieres`, `numbers-*`, `demonstratifs`, `commerces`, `frequence`, `modaux-plans`, `modaux-avis`, `colors`, `countries-letris` (A1 25).

---

## 5. Everything else (third)

### SIO chips (`sios.json`)

| Priority | String | SIO | Why | Fix |
|---|---|---|---|---|
| P1 | `C'est comment ?` | SIO-005 | Means “what’s it like?” Collection title is already *De quelle couleur ?* | `De quelle couleur ?` |
| P1 | `Les instructions de classe` | SIO-008 | Anglicism. Collection is *Les consignes de classe*. | `Les consignes de classe` or `On fait quoi ?` |
| P2 | `Tu (toi) ou vous ?` | SIO-002 | Mixes subject and stressed form. | `Tu ou vous ?` |
| P2 | `Ça s'écrit comment ?` | SIO-003 | Natural spoken. Taught line is *Comment ça s’écrit ?* | Align on one order. |
| P2 | `Un dialogue simple` | SIO-010 | True and empty. | `Première rencontre` |
| P2 | `Un ou des ?` | SIO-021 | Stop is *c’est un / ce sont des*. | `C'est un… ? Ce sont des… ?` |
| P2 | “3 moments” in the description | SIO-004 | Pretest now includes *midi*. | Update the count. |

Map **topics** in English are chrome. No accidental English on the `fr` chip except the two P1s.

### Lessons + ateliers

| Priority | String | File | Why | Fix |
|---|---|---|---|---|
| P1 | alt `C'est une médecin.` | `lessons/native/professions.tsx` bonus | *Médecin* is epicene. Article form is *C’est un médecin*. `textgen/unit1.ts` already keeps this string out. | Delete the alt. |
| P1 | Itinerary in *tu* | `ateliers.ts` · SIO-040 | SIO-036 drills *vous* + present for directions. The unit trains two registers for the same speech act without saying so. | Switch to *vous*, **or** one lesson line: friend → *tu*; passer-by → *vous*. |
| P2 | `Désolé, je suis occupé.` | `rendezvous.tsx` | Masculine fixed. | Accept *Désolée… occupée* (invitations deck already writes `Désolé(e)`). |
| P2 | `Je bois du jus.` | `manger-boire.tsx` | Fine; food deck is *jus d’orange*. | Prefer *du jus d'orange* on the first drink card. |

**Ateliers otherwise:** SIO-010 informal meeting is natural (including gendered *Enchanté(e)*). SIO-030 email is what a student would send. SIO-049 *du poisson* is the right partitive. SIO-050 restaurant *vous* is consistent.

**Conjugaison:** 66 paradigms checked. No wrong forms.  
**Textgen:** *Enchantée* with Léa; blocks *C’est une médecin*.  
**Chapters:** *Bienvenue en classe*, *Qui suis-je ?*, *À table !* — fine.

---

## 6. Held as notes only (do not elevate)

All three live on the **expert** country list (`countries-expert-letris.json`), not on the A1 SpecuLearn 25. Dan: hold.

| Current `displayName` | Also in file | Note |
|---|---|---|
| `Biélorussie` | tile `BIÉLORUSSIE` | Traditional French. Newer form *Bélarus* exists. Either is teachable; do not “correct” without a syllabus call. |
| `Birmanie` | tile `BIRMANIE`, en meaning `Myanmar` | Traditional French vs English exonym. Keep *Birmanie* unless the course switches. |
| `Cap-Vert` | tile `CAP-VERT` | Current French still widely *le Cap-Vert* (official *Cabo Verde* is newer). |
| `Centrafrique` | tile `CENTRAFRIQUE` | Common short form of *République centrafricaine*. Fine for a tile; not a spelling error. |

---

## 7. Suggested fix order (next ship)

1. **A1** — SIO-010 pretest: gender-conditioned *Enchantée* keys + EN WHY on *Enchanté* when the speaker is Léa (three tabs).  
2. **A2** — `Liberia` → `Libéria` / `LIBÉRIA` on the expert country tile.  
3. Sweep *Enchantée* onto the salutations Flip It card and the salutations / Ça s’écrit lesson bonuses (same ship if cheap).  
4. After ship: sappeler-05/06, *Bonne nuit* tag, *classe* vs *salle de classe*, SIO chips, *C’est une médecin* alt, SIO-040 register note.

When a fix lands, the **pretest / Unit 0 bank**, the **collection**, and the **lesson bonus** tend to move together. Changing one leaves the other two teaching last week’s French.
