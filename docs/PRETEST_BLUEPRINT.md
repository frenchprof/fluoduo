# LAF1201 Pretest Blueprint

Single source for the pre-lesson **Pretest** (MCQ only) and post-lesson **Practice**
(the 10 ICAP activities). The per-topic targeted cases below feed both.
Locked with Dan, 27 Jun 2026.

## Pedagogical foundation — the pretesting effect

Grounded in Pan & Chua (NUS, *Cognitive Research: Principles and Implications*,
6 Mar 2026): a multiple-choice **guess BEFORE instruction**, followed by
**immediate corrective feedback**, beats study-only — even when the guess is
wrong. So every pretest:

- is attempted **cold**, before the face-to-face lesson; **errors are productive**;
- gives **immediate feedback** (the correct answer/pairing; for distractors, why);
- never front-loads examples or the rule (that's study-then-test, the weaker way);
- in grammar mode, reveals the **rule only AFTER** the attempt;
- **encourages guessing** ("you haven't learned this yet — guess anyway");
- ends with a **gap report**: what you missed → bring to class (lowers in-class load).

## Pretest vs Practice

- **Pretest (pre-lesson) = MCQ ONLY.** Every topic's targeted cases (below) render as
  multiple-choice cold guesses + feedback (the pretesting effect). No flipcards /
  matching / etc. in the pretest.
- **Practice (post-lesson) = the 10 canonical activities**, ICAP-tiered. The SAME
  per-topic cases feed them.

### Practice activities (post-lesson — adopt ONLY these)

ICAP-tiered (Chi & Wylie: Interactive > Constructive > Active > Passive):

| Tier | Activities |
|---|---|
| **Passive** | **Flip It** · **Say It** |
| **Active** | **Complete It** (gapfill/cloze) · **Translate It** · **Classify It** (sort by category/gender) · **Arrange It** (word/sentence order) · **Match It** |
| **Constructive** | **Rewrite It** · **Correct It** |
| **Interactive** | **Roleplay It** |

**Per-topic codes below = Practice-activity affinity** (the Pretest still renders every
topic as MCQ): Flip → **Flip It** (+ **Say It**) · G → **Flip It** + **Classify It** (article/gender) ·
R → **Complete It** · M → **Match It** · P → **Match It**. The flipcard + 5-column table + notes
mechanics (below) belong to the **Flip It** practice activity, **not** the pretest.

**Coverage method ("360°"):** one item per **spanning case** across a topic's
decision dimensions — every condition that changes the answer, including edge
cases. Each topic's case list below IS the item spec.

**UI mechanics (apply to every builder):**
- **Flipcards must genuinely flip** — a flip interaction/animation, not two static states.
- **Table/list view — column-based reveal.** Five columns, in reading order:
  **flag · eng. · art. (fr) · fr. · notes**. The flag is split from English, and the
  French article is split from the name (so each is revealable independently).
  **Any column is hideable** (flag · eng. · art. · fr. · notes — the learner picks which),
  **constraint: at least one column must stay visible at all times** (the anchor/prompt).
  Hidden columns reveal **one cell per row** for self-check. Default: **flag + eng.**
  exposed, **art. + fr.** hidden; **notes** is free-text for the learner's own entry.
  Keep headings concise.

**Text & style conventions (all generated pages):**
- **Minimal sufficient text everywhere** — instructions short and sweet; explanations
  terse, never verbose. Use the shortest version that still does the job.
- **No fluo-yellow text except against a dark background** (contrast).

**Notes column — storage & limits:**
- **Per-deck Firestore doc:** `users/{uid}/notes/{deckId}` → map `{ itemId: { text, updatedAt } }`.
  Already covered by the owner-only rule (`users/{uid}/{document=**}`); no rules change.
- **Local-first dual storage:** every edit writes to `localStorage` instantly; Firestore is the synced backup.
- **Sync = once-daily, change-gated:** on app open, if the deck is **dirty** AND **≥24 h** since
  last sync → pull, merge by `updatedAt` (last-write-wins), push, reset dirty + lastSync.
  In-day edits stay local-only. Provide a manual **"Sync now"** button as the safety valve.
- **Cap: 50 graphemes per cell** — count via `Intl.Segmenter(locale,{granularity:'grapheme'})`
  (fallback `[...str].length`), **never `string.length`** (over-counts emoji/astral; CJK in the
  basic plane is fine but use graphemes for consistency). Show a live `n / 50` counter.
  Revisit only if learner feedback says 50 is too short.

**Scope cuts:** no adjective *description* (descriptive adj. + agreement) anywhere.
Deleted topics: `0-09 s'appeler`, `1-03 subject-pronoun frames`, `1-08 negation`.
Capstones (`x-11/12`) are cumulative mixed-MCQ review (Reviser tier), not per-lesson pretests.

---

## Unit 0 — Survival French · « Bonjour, bienvenue, enchanté ! »

**0-01 tu / vous** · R — *intimacy × setting × number; non-human excluded*
1 stranger, respectful distance → **vous** · 2 family/close → **tu** · 3 stranger who's a child → **tu** · 4 stranger, professional/service role → **vous** · 5 know well, casual peer → **tu** · 6 a group (even friends/children) → **vous** · 7 known but distance kept (boss, in-law, elder) → **vous** · 8 after "on peut se tutoyer ?" → **tu** · 9 classmate, similar age, first contact → **tu**

**0-02 subject pronouns** · R — *by role in the dialogue*
- Speaker: self → **je** · we (spoken) → **on** · we (formal) → **nous**
- Addressee: one familiar → **tu** · formal/plural → **vous**
- Third party: male → **il** · female → **elle** · group m/mixed → **ils** · group f → **elles**

**0-03 stress pronouns** · R — *prepositional excluded; via emphasis / c'est / ce sont*
1 "___, je…" → **Moi** · 2 "Et ___ ?" → **Toi** · 3 "C'est ___" (him) → **lui** · 4 (her) → **elle** · 5 "___, on…" → **Nous** · 6 "Ce sont ___" (m) → **eux** · 7 (f) → **elles**

**0-04 alphabet** · R — *pick the letter whose name rhymes (6 pairs)*
A→**K** · B→**C** · D→**G** · P→**T** · I→**J** · Q→**U**

**0-05 question words** · R — *6 only*
thing → **quoi** · person → **qui** · place → **où** · time → **quand** · manner → **comment** · quantity → **combien**

**0-06 numbers** · Flip — *exactly these 20*
un · deux · trois · quatre · cinq · sept · huit · neuf · dix · onze · douze · treize · quatorze · quinze · seize · vingt · trente · quarante · cinquante · soixante

**0-07 days** · R
1 day after/before (sequence) · 2 weekend (samedi/dimanche) · 3 lowercase orthography · 4 **le lundi** (habitual) vs **lundi** (this Monday)

**0-08 colours** · Flip — *show a swatch OR a coloured object → pick the colour word*
rouge · bleu · jaune · vert · noir · blanc · orange · rose · violet · gris · marron

**0-10 greetings** · R — *arrival vs departure*
**Bonjour** (hello, day) · **Bonne journée** (bye, day) · **Bonsoir** (hello, evening) · **Bonne soirée** (bye, evening) · **Bonne nuit** (night) · **Ciao** (casual bye) · **Salut** (casual hi/bye) · **Au revoir** (neutral bye)

---

## Unit 1 — Identity · « C'est qui, le monsieur ? »

**1-01 introductions** · R
1 respond to an intro → **Enchanté(e)** · 2 introduce a third person → **Je te/vous présente** · 3 give your name → **Moi, c'est…** · 4 return the question → **Et toi ? / Et vous ?**

**1-04 être** · M — je·**suis** / tu·**es** / il·elle·on·**est** / nous·**sommes** / vous·**êtes** / ils·elles·**sont**

**1-05 professions** · G·Flip — flipcard `un cuisinier` ↔ `cook 👨‍🍳`; gender **un/une**

**1-06 countries** · G·Flip — flipcard `le Japon` ↔ `Japan 🇯🇵`; article class **le / la / l' / les / ∅**

**1-07 nationalities** · R — *number + gender agreement* — m.sg **français** · f.sg **française** · m.pl **français** · f.pl **françaises**

**1-09 avoir / age** · M + idiom — j'·**ai** / tu·**as** / il·**a** / nous·**avons** / vous·**avez** / ils·**ont** · + **j'ai X ans**
**1-09b avoir + states** · Flip — feeling image ↔ **avoir faim / soif / sommeil / froid / chaud / peur / mal**
**1-09c avoir vs être** · R — age & states → **avoir** · identity/nationality/profession → **être**

**1-10 languages** · Flip + M — language names (flip) **+** **parler** conjugation (match)

---

## Unit 2 — Daily life · « On fait quoi ce week-end ? »

**2-01 faire** · M — fais/fais/fait/faisons/faites/font
**2-02 aller** · M + R — aller (vais/vas/va/allons/allez/vont) **+** contraction **au** (m) / **à la** (f) / **à l'** (vowel) / **aux** (pl)
**2-03 vouloir** · M — veux/veux/veut/voulons/voulez/veulent
**2-04 c'est / ce sont** · R — singular → **c'est** · plural → **ce sont** · negative → **ce n'est pas**
**2-05 articles & objects** · G·Flip — flipcard `un sac` ↔ `bag 🎒`; **un / une / des**
**2-06 partitive** (de+le=du) · R — **du** (m) · **de la** (f) · **de l'** (vowel) · **des** (pl)
**2-07 preferences** · R — **adore** (♥♥) · **aime** (♥) · **n'aime pas** (✗) · **déteste** (✗✗)
**2-08 time** · R — **heures** · **et quart** · **et demie** · **moins le quart** · **midi/minuit**
**2-09 objects** · G·Flip — object flipcard + **un/une** (no adjectives)
**2-10 places & activities** · G·Flip + activity — place `le café` ↔ `café ☕` + article **le/la/l'/les**; activity "Au cinéma, on **regarde** un film"
**2-11 functional writing** · R — context phrases: opener · closing (**Cordialement / Bises**)…
**2-13 possessives** · R — **mon/ma/mes** · **ton/ta/tes** · **son/sa/ses** (by gender/number)

---

## Unit 3 — Paris, weather, directions · « On va où cet été ? »

**3-01 weather** · Flip + R — (a) flipcard ☀️🌧️❄️ ↔ expression; (b) frame: **il fait** + adj · **il y a** + du/des · **il** + verb (**pleut/neige**)
**3-02 city / country prepositions** · R — **à** + city · **en** + f./vowel country · **au** + m. country · **aux** + plural country
**3-03 ordinals** · R — **premier/première** (gender) · deuxième · troisième · **cinquième** · **neuvième**
**3-04 venir / prendre** · M — venir (viens/viens/vient/venons/venez/viennent) + prendre (prends/prends/prend/prenons/prenez/prennent)
**3-05 questions** · R — intonation (Tu viens ?) · **est-ce que** · inversion (Viens-tu ?)
**3-07 attractions (lieux)** · G·Flip — place flipcard `le café` ↔ `café ☕` + article **le/la/l'/les**
**3-08 directions** · R + arrow pictures — **à gauche** · **à droite** · **tout droit** · **prenez la première rue** · **traversez**
**3-09 place prepositions (spatial)** · P — position picture 📦 → **sur / sous / devant / derrière / dans / entre / à côté de / en face de**
**3-10 pronoun y** · R — *y* replaces à+place: "Tu vas à Paris ? — J'**y** vais."

---

## Unit 4 — Food & restaurant · « Qu'est-ce qu'on mange ce soir ? »

**4-01 food vocab** · G·Flip — food flipcard 🥐🧀🍞 ↔ FR + **un/une/des**
**4-02 partitives** · R — **du** (m) · **de la** (f) · **de l'** (vowel) · **des** (pl) *(food-context reinforcement of 2-06)*
**4-03 partitive negative** · R — **pas de** · **pas d'** (vowel)
**4-04 manger / boire** · M — manger (mange/manges/mange/mangeons/mangez/mangent) + boire (bois/bois/boit/buvons/buvez/boivent)
**4-05 frequency** · R — **toujours · souvent · parfois · rarement · ne…jamais**
**4-06 demonstratives** · R — **ce** (m.sg cons.) · **cet** (m.sg vowel) · **cette** (f.sg) · **ces** (pl)
**4-07 futur proche** · R — **aller** (conjugated) + infinitive: "je **vais manger**"
**4-08 shopping** · G·Flip + prep — (a) shop flipcard `la boulangerie` ↔ `bakery 🥖` + article · (b) going: **à la / au / aux** + shop
**4-09 advice** · R — **il faut** + infinitive *(no imperative)*
**4-10 restaurant** · R — order (**je voudrais**) · ask the bill (**l'addition, s'il vous plaît**) · waiter (**vous désirez ?**)
