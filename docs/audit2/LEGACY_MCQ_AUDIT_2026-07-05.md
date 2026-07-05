# Legacy MCQ bank — QC audit & port (2026-07-05)

**Input:** `docs/handoff/legacy-laf1201-questions.json` — 58 skill keys, **795 MCQ items**
(shape: `{q, options, correct}` throughout; no HTML markup survives in this JSON — the TTS
`<button>` markup mentioned in the handoff was already stripped upstream, but the audio items
still carry a dead "Listen" placeholder in the prompt).

**Outcome:** **52 items ported** (11 → `src/content/sios/unit0-questions.ts`, 41 → 21 files in
`src/content/pretests/`), **743 dropped**. Every ported item was degendered (Madame → Monsieur
where the addressee is the professor), stripped of numbering ("1. ", "Q: 3.") and scenario
boilerplate, and re-authored into the target schema with fresh per-distractor `why` / `whyWrong`
(the legacy bank has none). No pretest exceeds 10 items; no Unit-0 bank exceeds 10.

Note on the handoff's §4.5 key names: the JSON's actual keys differ from the names recorded there
(e.g. `0-01-introduce-self` is actually `0-09-sappeler-quiz`, `0-04-tu-vous` is `0-01-tu-vous-quiz`).
Mapping below is by content, as instructed.

## Verdict legend

- **covered** — near-duplicate of content already in `unit0-questions.ts` or a pretest (most
  pretests were visibly authored *from* this same legacy bank, so overlap is heavy).
- **out** — out of syllabus / out of the target SIO's contract.
- **audio** — depends on hearing TTS ("Listen. Which letter do you hear?"); no text reframe worth
  making (see per-key notes).
- **design** — contradicts a deliberate design rule of the current course (imperatives, inversion,
  SIO-010 being offline-only).
- **broken/amb** — French error or two defensible answers.

## Unit 0 keys

| Legacy key | n | Maps to | Already covered | Ported | Dropped (reason) |
|---|---|---|---|---|---|
| 0-01-tu-vous-quiz | 11 | SIO-002 | 11 (the existing 12-situation set subsumes every scenario) | 0 | 11 covered |
| 0-02-subject-pronouns-quiz | 30 | SIO-014 (pretest u1-sio014) | 29 | 1 (`Le café ? Il est fermé` — il/elle for *things*, missing everywhere) | 29 covered (10 English rule-recital items + 19 gap-fills whose pronoun/verb pairs are covered by SIO-002/014/017 content) |
| 0-03-stress-pronouns-quiz | 8 | SIO-011 (u1-sio011) | 5 (items 1–5 are u1-sio011-01…05 verbatim, names changed) | 1 (`pour vous` to a group — *pour* + vous/nous was absent) | 7 covered |
| 0-03b-stress-vs-subject-quiz | 8 | SIO-011 (u1-sio011) | 6 (je/Moi, Lui pairs already there) | 1 (`Eux, ils sont dans mon groupe` — Eux pair was missing) | 7 covered |
| 0-04-alphabet-quiz | 26 | SIO-003 | 7 discriminations | 0 | 26 audio — every item is "Listen. Which letter do you hear?" with no text cue. The text reframe of this set already happened deliberately (Dan's exact 7-question `letterQ` set, per the file comment); expanding it would second-guess a curated set. Candidates if Dan ever wants 3 more: E ("uh"), W ("doo-bluh-vay"), I ("ee"). |
| 0-05-qwords-quiz | 12 | SIO-035 (u3-sio035) / SIO-006 | 8 (comment/quand/combien/quoi/où patterns in u3-sio035 + SIO-006's C'est où/qui/quoi) | 1 (`Qui parle ? — C'est Amara` — qui was the one question word untested) | 11 covered (several also use vocab beyond Unit 0: boulangerie, coûte, frères) |
| 0-07-days-quiz | 11 | SIO-004 | 6 (Mon–Sat) | 4 (**dimanche** — Sunday was missing! — plus **matin / après-midi / soir**, the SIO's 3 moments, all absent) | 7 = 6 covered + 1 out (*nuit* — SIO-004 scope is 3 moments; nuit kept as a distractor gloss only) |
| 0-08-colors-quiz | 12 | SIO-005 | 12 | 0 | 12 covered (existing 12-colour set is richer: hue rendering + mnemonic + TTS) |
| 0-09-sappeler-quiz | 10 | SIO-001 | 6 (items 1–6 are the existing bank verbatim) | 2 (`Ils s'appellent…`, `Elles s'appellent…` — the 6th person was missing from the bank despite the "all 6 persons" competence) | 8 covered |
| 0-10-greetings-quiz | 14 | SIO-009 | 6 (items 8–13 are the existing bank verbatim) | 4 (Bonjour/monsieur first meeting, Salut to classmate, Bonsoir at 8pm, Bonne nuit — the *greeting* side; all six existing items were leave-takings) | 10 = 6 covered + 4 cap/near-dup (Coucou greeting ≈ Salut slot; Enchanté-reply and the two name-asking items are taught by SIO-001 items + existing whys) |
| 0-11-capstone-quiz | 9 | SIO-010 | — | 0 | 9 = 3 audio (spelled-aloud names) + 6 design/covered (SIO-010 is deliberately an in-class oral simulation with **no online MCQs**; the non-audio items duplicate 0-10/1-01 register content) |

## Unit 1 keys

| Legacy key | n | Maps to | Ported | Dropped (reason) |
|---|---|---|---|---|
| 1-01-introductions-quiz | 12 | SIO-001 | 1 (`je vous présente Marc` → unit0 SIO-001, degendered — "introduce a third person" is in the competence and was untested) | 11 covered (s'appeler persons + register scenarios all present in SIO-001/002/009 banks) |
| 1-03-subject-pronouns-frames-quiz | 12 | SIO-001/014 | 0 | 12 covered (same frames as SIO-001 bank + u1-sio014) |
| 1-04-etre-identity-quiz | 32 | SIO-014 (u1-sio014) | 0 | 32 covered — u1-sio014's 8 items are this key's best 8 verbatim; the other 24 re-test the same 6 forms with rotated vocabulary |
| 1-05-professions-quiz | 12 | SIO-012 (u1-sio012) | 2 (**boulangère** -er→-ère, **musicienne** -ien→-ienne — feminisation patterns absent from the pretest) | 10 covered (6 verbatim in u1-sio012; rest repeat covered patterns) |
| 1-06-countries-quiz | 36 | SIO-015 (u1-sio015) | 0 | 36 = 32 covered/superseded (u1-sio015 carries the curated 25-country set incl. the ∅-article cases) + **4 broken**: legacy keys `le Cuba`, `la Madagascar`, `l'Israël`, `l'Haïti` — standard usage is **no article** for all four (u1-sio015 already has Cuba/Singapour as ∅) |
| 1-07-nationalities-quiz | 12 | SIO-016 (u1-sio016) | 0 | 12 covered (4-form patterns all present; item 1's capitalised noun *des Français* is a nuance beyond the adjective-forms contract, item 10's "form field" frame is broken — 3 of 4 options aren't nationalities in feminine form) |
| 1-08-negation-quiz | 32 | SIO-014/019 | 2 (`ne suis pas` placement → u1-sio014; `n'ai pas 20 ans` → u1-sio019 — the "negative forms" half of SIO-019's competence was untested) | 30 covered (all 32 test the same ne…pas placement/elision with rotated verbs, many beyond Unit-1 vocab: savez, écoutent, ferme) |
| 1-09-avoir-numbers-quiz | 12 | SIO-018/019 | 2 (**vingt et un**, **soixante** → u1-sio018 — the *et un* rule at 21 and a bare ten) | 10 = 8 covered + 2 out (dix-sept, quatorze are 0–20 territory = SIO-007, whose bank already covers digits) |
| 1-09b-avoir-states-quiz | 10 | SIO-019 (u1-sio019) | 1 (`J'ai chaud` at 32°C — chaud was the missing state) | 9 covered (5 verbatim in u1-sio019; *soif* dropped only for the 10-item cap — best next candidate) |
| 1-09c-avoir-vs-etre-quiz | 10 | SIO-019 | 0 | 10 = 9 covered (êtes/es/ai frames present) + 1 format (item 10 is a two-blank "pick the pair" — doesn't fit the one-blank pretest schema) |
| 1-10-languages-questions-quiz | 12 | SIO-017 (u1-sio017) | 2 (**quel** pays, **Quels** pays — completing the quel/quelle/quels/quelles paradigm) | 10 covered. QC note: legacy item 8 marks `le français` **wrong** after *parle* while u1-sio017-05 teaches `on parle **le** français` as correct — both are attested French; the legacy distractor choice is the risky one. Not ported. |
| 1-11-capstone-quiz | 12 | — | 0 | 12 = 10 covered (register/introduction integration) + 2 out (liaison spotting and orthographic-gap items — phonology/spelling meta-skills with no SIO) |

## Unit 2 keys

| Legacy key | n | Maps to | Ported | Dropped (reason) |
|---|---|---|---|---|
| 2-01-faire-quiz | 12 | SIO-024 (u2-sio024) | 0 | 12 = 10 covered (7 verbatim) + 1 amb (*faire vs pratiquer* — `je pratique un/du sport` is defensible French, two defensible answers) + 1 out (`il fait beau` is SIO-031 weather, already in u3-l1) |
| 2-02-aller-quiz | 12 | SIO-026 (u2-sio026) | 2 (**Tu vas où ?**, **Mes amis vont…** — vas/vont persons were missing) | 10 covered |
| 2-03-vouloir-quiz | 12 | SIO-029 (u2-sio029) | 1 (**veulent** — missing person) | 11 covered (voulons dropped for budget — next candidate) |
| 2-04-cest-negation-quiz | 11 | SIO-021 (u2-sio021) | 1 (**ce ne sont pas** — plural negation of c'est was missing) | 10 = 7 covered + 3 out (`ne … plus` "not anymore" is not in any Unit-2 SIO contract) |
| 2-05-articles-objects-quiz | 16 | SIO-021/028 | 0 | 16 = 11 covered + 5 out (bare definite-article drill *le/la/les/l'* has no owning SIO; `le lundi` is SIO-027 and covered) |
| 2-06-partitive-quiz | 12 | SIO-024/028, SIO-042/043 | 0 | 12 covered (partitive + negation + aimer-trap all present in u2-sio024/028 and u4-sio042/043) |
| 2-07-preferences-quiz | 12 | SIO-023 (u2-sio023) | 2 (**détester + infinitive**, **adore** strength-scale) | 10 covered |
| 2-08-time-quiz | 12 | SIO-027 (u2-sio027) | 2 (**et demie**, **midi**) | 10 = 5 covered + 5 out (quarter past/to, minutes, *du soir* — clock detail beyond SIO-027's `à + time` list; flagged as future lesson content) |
| 2-09-objects-description-quiz | 12 | SIO-021/022 | 0 | 12 = 6 covered + 6 out (adjective agreement/BANGS position and `le stylo de Marc` ownership have no Unit-2 SIO) |
| 2-10-places-activities-quiz | 12 | SIO-026/033 | 0 | 12 covered (aller + contraction with rotated places) |
| 2-11-functional-writing-quiz | 12 | SIO-029 (u2-sio029) | 2 (**Avec plaisir !** accept, **Désolé, je ne peux pas** refuse — SIO-029's core functions, absent from its pretest which only tested conjugation) | 10 = 4 covered + 6 out (répéter/merci/pardon/aider politeness phrases have no owning SIO) |
| 2-12-capstone-quiz | 12 | — | 0 | 12 = 11 covered (integration of already-tested skills) + 1 out (`RDV … à+` texting abbreviations — dated/telegraphic register, no SIO) |
| 2-13-possessives-quiz | 25 | SIO-022 (u2-sio022) | 2 (**ta**, **tes** — the tu-series was entirely missing from the pretest) | 23 = 15 covered + 8 out (`c'est à moi/toi/elle/eux…` ownership series is a different structure than SIO-022's possessive adjectives) |

## Unit 3 keys

| Legacy key | n | Maps to | Ported | Dropped (reason) |
|---|---|---|---|---|
| 3-01-weather-quiz | 12 | SIO-031 (u3-l1-weather) | 0 | 12 covered — u3-l1 is this key 1:1 (one stimulus improved) |
| 3-02-city-preps-quiz | 12 | SIO-032 (u3-l2-city-preps) | 0 | 12 covered — u3-l2 is this key 1:1 |
| 3-03-ordinals-quiz | 12 | SIO-036 (u3-sio036) | 2 (**cinquième** cinq→cinqu-, **neuvième** f→v — the two irregular spellings) | 10 = 8 covered/near-dup + 2 out (centième, vingtième — SIO-036 caps at dixième) |
| 3-04-venir-prendre-quiz | 13 | SIO-038 (u3-sio038) / SIO-032-33 | 1 (**prennent** — missing plural of prendre) | 12 = 10 covered (venir persons live in u3-l2/u3-sio033; prends/prenez/prenons verbatim in u3-sio038) + 2 out (`venir de + inf` recent past isn't in any SIO) |
| 3-05-questions-quiz | 12 | SIO-035 (u3-sio035) | 0 | 12 = 6 covered (verbatim) + 6 design (inversion: *Où vas-tu, Quand part le train, Arrive-t-il* — SIO-035's contract is Est-ce que + intonation + question words, **no inversion**) |
| 3-06-adj-agree-quiz | 15 | — | 0 | 15 out — adjective agreement (beau/bel/belle, vieux/vieille, irregular plurals) has **no SIO** in the 50-SIO syllabus. Good raw material if such a lesson is ever added. |
| 3-07-attractions-quiz | 12 | — | 0 | 12 out — Paris-landmark spelling/trivia (Sainte-Chapelle, Champs-Élysées) has no SIO; `rendre visite à` vs `visiter` is beyond A1 scope here |
| 3-08-directions-quiz | 12 | SIO-036 | 0 | 12 design — the whole key drills **imperatives** (tournez, continuez, traversez, prenez) while SIO-036 explicitly teaches directions *without* the imperative (c'est + prep / il faut + inf / on + present). Porting would contradict the course design. The 3 non-imperative items are covered (en face de, pas loin in u3-sio036). |
| 3-09-place-preps-quiz | 12 | SIO-034 (u3-sio034) | 2 (**sous**, **près de** — près was in the SIO's 4 core preps but untested) | 10 covered/cap (6 verbatim; entre/derrière/au-dessus/au-dessous are beyond the SIO's listed set — next candidates if the file grows) |
| 3-10-pronoun-y-quiz | 12 | SIO-038 (u3-sio038) | 2 (**y before infinitive**, **n'y** negation) | 10 = 5 covered + 3 design (Vas-y / n'y va pas imperatives) + 2 out (`j'y suis allé` passé composé; `il y a` existence belongs to SIO-021 and is covered) |
| 3-11-capstone-quiz | 12 | — | 0 | 12 covered (integration of items all present in u3 pretests) |

## Unit 4 keys

| Legacy key | n | Maps to | Ported | Dropped (reason) |
|---|---|---|---|---|
| 4-01-food-vocab-quiz | 12 | SIO-041 (u4-sio041) | 0 | 12 = 10 covered (7 verbatim) + 2 amb/broken (item 2: distractor `un poulet rôti` yields "un poulet rôti rôti" when inserted — sloppy blank design; item 9 œuf-spelling distractor `oeufs` is typographically acceptable French) |
| 4-02-partitives-quiz | 12 | SIO-042 (u4-sio042) | 0 | 12 covered (7 verbatim; rest repeat du/de la/de l'/des) |
| 4-03-partitive-neg-quiz | 12 | SIO-043 (u4-sio043) | 2 (**trop de**, **beaucoup d'** elision) | 10 covered (incl. `ne…plus de` variants — the *plus* nuance is out of contract but the *de* collapse is tested) |
| 4-04-manger-boire-quiz | 12 | SIO-044 (u4-sio044) | 1 (**il boit** — the missing singular of boire) | 11 covered |
| 4-05-frequency-quiz | 12 | SIO-045 (u4-sio045) | 1 (**souvent** — the one adverb of the SIO's five that was untested) | 11 = 10 covered + 1 broken: legacy item 1 `Je mange toujours **du petit-déjeuner**` is unidiomatic (French *prend* le petit-déjeuner) — u4-sio045-01 had already silently fixed it to `du riz` |
| 4-06-demonstratives-quiz | 12 | SIO-046 (u4-sio046) | 0 | 12 = 11 covered (7 verbatim) + 1 out (`-ci / -là` contrast beyond SIO-046's ce/cet/cette/ces contract) |
| 4-07-futur-proche-quiz | 12 | SIO-048 (u4-sio048) | 2 (**tu vas**, **ils vont** + inf — missing persons) | 10 covered |
| 4-08-shopping-quiz | 12 | SIO-047 (u4-sio047) | 2 (**poissonnerie** — a listed shop missing from the pretest — and **une tranche de**) | 10 = 8 covered + 2 out (payment by card/cash beyond SIO-047's contract) |
| 4-09-advice-quiz | 12 | SIO-048 (u4-sio048) | 1 (**il faut** + inf — in SIO-048's four constructions but untested) | 11 = 7 covered + 4 out (`tu devrais` conditional is beyond the aller/pouvoir/devoir/falloir set) |
| 4-10-restaurant-quiz | 12 | SIO-049/050 | 0 | 12 out — SIO-049/050 are production ateliers with **no pretest files** by design; nothing to attach to. Solid items (la carte vs le menu, l'addition, comme plat) if a restaurant pretest is ever wanted. |
| 4-11-capstone-quiz | 12 | — | 0 | 12 covered (each item re-tests one u4 skill already in its pretest) |

## Totals

- **Audited:** 795 items across 58 keys.
- **Ported: 52** — 11 into `unit0-questions.ts` (SIO-001 +3 → 9, SIO-004 +4 → 10, SIO-009 +4 → 10)
  and 41 into 21 pretest JSONs (u1-sio011/012/014/017/018/019, u2-sio021/022/023/026/027/029,
  u3-sio034/035/036/038, u4-sio043/044/045/047/048 — each +1…+3, all ≤ 10 items after merge).
- **Dropped: 743**, by primary reason: **covered/near-duplicate ≈ 588** · **out of syllabus ≈ 91**
  · **audio-dependent 29** · **design-conflict 27** (imperatives in 3-08/3-10, inversion in 3-05,
  SIO-010 offline-only) · **broken/ambiguous 8** (4 country-article errors in 1-06, *du
  petit-déjeuner* in 4-05, distractor-design flaws in 4-01/2-01, form-frame in 1-07).

## QC issues found in the legacy bank

1. **"Madame" gendering** — 137 madame/Mme occurrences (professor addressed as Madame; recurring
   characters Madame Sow / Madame Benali). Every ported item now addresses **Monsieur**; unported
   occurrences are moot.
2. **Country-article errors (1-06):** `le Cuba`, `la Madagascar`, `l'Israël`, `l'Haïti` are all
   marked as correct keys; standard French uses **no article** for these four (à Cuba, à
   Madagascar, en Israël, en Haïti). The current `u1-sio015.json` handles ∅-article countries
   correctly — none of the four broken items were ported.
3. **Unidiomatic French (4-05 item 1):** `manger du petit-déjeuner` — French takes *prendre le
   petit-déjeuner*. Already fixed in the shipped pretest (`du riz`); legacy original dropped.
4. **Internal inconsistency (1-10 item 8 vs u1-sio017-05):** legacy marks `le français` wrong
   after *parler*; the current pretest teaches `on parle le français` as correct. Both forms are
   attested; item not ported to avoid teaching a contradiction.
5. **Design conflicts:** 3-08 (and 2 items of 3-10) drill imperative directions, which SIO-036
   explicitly avoids; 6 items of 3-05 drill inversion, which SIO-035 excludes. None ported.
6. **Audio-dependent stubs:** 0-04 (26 items) and 3 items of 0-11 still say "Listen" with no
   audio wiring in this JSON — unportable as text without becoming letter-name reframes that
   already exist (SIO-003's curated 7).
7. **Distractor-design flaws (not ported):** 4-01 item 2 (`un poulet rôti` + " rôti"),
   2-01 item 7 (*pratiquer* defensible), 1-07 item 10 (three of four options can't fill the
   feminine form-field frame), 1-09 item 11 ("grandmother is 41" — implausible context, cosmetic).
8. **Rectified-spelling trap avoided in port:** legacy 1-09 item 4 uses `vingt-et-un` as a wrong
   option, but post-1990 rectified orthography accepts hyphens there. The ported u1-sio018 item
   replaces it with unambiguous distractors (vingt-un / vingt et une / vingt-deux).
9. **Dated/localised references (left unported, harmless):** LAF1201, NUS, CLS workshop, "à+"
   texting abbreviation (2-12), recurring legacy cast (Wei, Mateo, Amara, Yuki).

## French fixes applied in ported items

- All "Madame"/"madame" → "Monsieur"/"monsieur" (SIO-001 introduction item; SIO-009 greetings
  ×3; every other ported item had no gendered address).
- u1-sio018 "21" item: removed the `vingt-et-un` distractor (see QC #8).
- u2-sio023 *détester + inf* item: replaced legacy distractor `la cuisine` (grammatically
  defensible in the frame) with `cuisines` (unambiguously wrong).
- u3-sio034 *sous* item: replaced legacy distractors `en dessous` / `au-dessous de` (defensible)
  with `sur` / `dans` / `devant` + `transFirst` so meaning disambiguates.
- u3-sio034 *près de* item: replaced defensible legacy distractors `autour de` / `proche de` with
  grammar-wrong contractions (`près du` / `près des` / `près au`).
- u1-sio011 *pour vous* item: named the four addressees in the stimulus (legacy relied on a
  bracketed stage direction) so the answer is decidable from the sentence alone.
- No other French was altered; all other ported sentences are verbatim legacy French (numbering
  and scenario prefixes stripped).

## Verification

- `npx tsc --noEmit` — pass.
- `npx next build` — pass (static export).
