# Syllabus audit — pre-existing content vs the real Atelier A1 unit guides

Date: 2026-08-23. Sources: Dan's uploaded teacher guides (A1U0 8 pp · A1U1 12 pp ·
A1U2 12 pp · A1U3 20 pp · A1U4 11 pp — every page read) vs the repo's pre-existing
content (decks in `src/content/collections/`, lessons + memos, `conjugaison.ts`,
`textgen/unit3.ts`, `textgen/unit4.ts`, `ateliers.ts`, `sios/sios.json`).
The 23-Aug wave's own flags (`docs/CONTENT_FLAGS_2026-08-23.md`) are cited where a
finding was already half-known; everything else is new.

Page refs are **PDF page / (book page)** inside each unit's PDF.
Severity: **gap** = book has it, app doesn't · **extra** = app has it, book doesn't
(possibly deliberate) · **misplacement** = taught in a different unit than the book ·
**phrasing** = wording diverges from the book's model · **sequencing** = grammar used
before the book teaches it.

Caveat: the U4 PDF ends mid-Situation 3 (book p. 130), so U4's two restaurant
ateliers (SIO-049/050) could only be checked against the U4 summary page, which
lists them by name — they match it.

---

## Unité 0 — Bienvenue ! / Suivez le guide !

Book scope (PDF p. 1 / book p. 30): s'appeler (1) · saluer/se présenter · jours ·
couleurs (1) · consignes · chiffres 1–10 · alphabet (1) · tu/vous.

| # | Sev | Finding | Where | PDF | Fix |
|---|---|---|---|---|---|
| 0.1 | misplacement (low) | `numbers-0-20` teaches 0–20 at U0; the book's U0 is chiffres (1) **1–10** (pistes 13/14 stop at dix) — 11–19 are U1 material (nombres (2) 11 à 69) | `collections/numbers-0-20.json` | U0 p. 7 (36); U1 p. 1 (38) | Accept as deliberate consolidation, or split 11–20 into the U1 deck |
| 0.2 | extra (low) | `colors` = 12 colours at U0; book U0 is couleurs (1) (bleu/rouge focus), couleurs (2) lands in U1 | `collections/colors.json` | U0 p. 6 (35); U1 p. 1 (38) | Keep — merge looks deliberate; no action |
| 0.3 | phrasing (low) | `days` moments are matin / **l'après-midi** / soir; the book's three moments are matin / **midi** / soir (piste 10 « dimanche midi ») — « midi » as a moment is only reachable via quand-time's « à midi » (U2) | `collections/days.json`, SIO-004 | U0 p. 6 (35) | Add « midi » to the days deck (or note the swap for Dan) |
| 0.4 | extra (known) | `salutations` extras beyond the book's four (Coucou, À demain, À plus…) — already flagged 23-Aug | `collections/salutations.json` | U0 pp. 2–3 (31–32), pistes 2–5 | Dan's call (already in CONTENT_FLAGS) |
| 0.5 | extra (low) | `consignes` « Notez ! » is not a U0 book consigne (piste 12: Écoutez/Parlez/Lisez/Écrivez; Regardez/Comptez/Associez appear in activity headers) | `collections/consignes.json` | U0 p. 7 (36) | Keep — harmless classroom talk |
| 0.6 | misplacement (low) | `sappeler` carries the FULL paradigm (nous/vous/ils) at U0; the book's U0 is s'appeler (1) (je/tu/vous forms in piste 4) — s'appeler (2) is U1 conjugaison | `collections/sappeler.json` | U0 p. 3 (32); U1 p. 1 (38) | Accept — anticipation of one unit, low risk |

U0 verdict: fully covered, no gaps; all findings are app-ahead-of-book, likely deliberate.

---

## Unité 1 — objectifs: se présenter/présenter qqn · dire sa nationalité · demander/donner des infos

Book scope (PDF p. 1 / book p. 38): pronoms sujets + toniques · ne…pas · articles
devant pays · accord des nationalités · questions avec **quel** · avoir/être/s'appeler (2) ·
professions · alphabet (2) · couleurs (2) · nombres 11–69 · pays · nationalités ·
sensations (j'ai froid/faim). Ateliers: **s'exprimer poliment** · **remplir un formulaire**.

| # | Sev | Finding | Where | PDF | Fix |
|---|---|---|---|---|---|
| 1.1 | gap (med) | Atelier « **Remplir un formulaire** » (nom, prénom, nationalité, coordonnées) has no deck, lesson or SIO — grep for formulaire/coordonnées/adresse hits nothing; « S'exprimer poliment » is equally unrepresented. SIO-020 is the projet culturel (country write-up) instead | no file | U1 p. 1 (38) | Author a small formulaire deck/atelier or record the omission as a decision |
| 1.2 | gap (low) | Numbers **11–19** aren't drillable in U1: the book's nombres (2) run 11–69 (piste 26 starts at onze), but `numbers-20-69` starts at vingt (11–19 live in the U0 deck) | `collections/numbers-20-69.json` | U1 p. 12 (49) | Fine if 0.1 stays; otherwise move 11–19 here |
| 1.3 | extra (known) | `matieres` (SIO-013) — school subjects appear nowhere in the book's U0–U4; known ★ app deck | `collections/matieres.json` | — | Keep (already flagged, SIO-013-backed) |
| 1.4 | sequencing (med) | `questions-oui-non` (27× « est-ce que ») and `mots-interrogatifs` (8× est-ce que/qu'est-ce que) carry **unit: 1** in `lessons.ts` — the book introduces est-ce que / qu'est-ce que in **U3** (questions (2)); U1's book questions are quel + intonation. LESSONS_BY_SIO correctly hangs both on SIO-035 (u3), so only the gallery's unit label front-runs the book | `lessons.ts` lines 17–18; `lessons/native/questions-oui-non.tsx`, `mots-interrogatifs.tsx` | U1 p. 1 (38); U3 p. 1 (92) | **FIXED 23 Aug (in place)** — both `unit` labels moved to 3 in `lessons.ts`; SIO-035 mapping untouched |
| 1.5 | phrasing (known) | Nationality -ien exemplar is *tunisien*; the book's tableau uses *canadien* | `memos.tsx` nationalities | U1 p. 9 (47) | Already flagged 23-Aug; Dan's call |
| 1.6 | extra (low) | `countries-letris`/`nationalities` add 13 Asian/other countries beyond the book's francophone list (piste 22: Canada, Belgique, Luxembourg, Suisse, France, Algérie, Guinée, Mali, Sénégal, Comores, Seychelles, Vietnam) — and drop most of the book's francophone ones (no Sénégal, Mali, Vietnam…) | `collections/countries-letris.json` | U1 p. 7 (45) | Looks cohort-driven (Singapore class) and deliberate; consider adding 2–3 book francophone countries (Sénégal, Vietnam) since the Francophonie is the unit's culture thread |

U1 verdict: solid on grammar; the two book ateliers are the real hole.

---

## Unité 2 — On fait quoi ce week-end ? (goûts · sortir)

Book scope (PDF p. 1 / book p. 66): **ne…plus** · un/une/des · possessifs (1) ·
article contracté à/de · faire/vouloir/aller · objets · aimer/adorer/détester ·
**les formes** · sports · loisirs · l'heure · moments · sorties. Ateliers:
**souhaiter qc à qqn** · demander un programme par courriel.

| # | Sev | Finding | Where | PDF | Fix |
|---|---|---|---|---|---|
| 2.1 | **gap (high)** | « **ne… plus** » — a headline U2 grammar point (négation (2); act 1b: « Le stylo n'est **plus** sur la table ») is taught **nowhere**: no deck item, no lesson, no memo (repo-wide grep = 0 real hits) | no file (`negation-pas` deck covers only pas de/pas le) | U2 p. 1 (66), p. 2 (67) | **FIXED 23 Aug (in place)** — 6 ne…plus items (negpas-15–20, « Le stylo n'est plus sur la table » book-verbatim) + a « ne … plus » letris column in `negation-pas`; the negation lesson memo carries the plus row |
| 2.2 | **gap (med)** | Well-wish formulas — the U2 atelier « Souhaiter quelque chose à quelqu'un » and act 10's « **Bon anniversaire !** ». SIO-030's own description promises « Bon anniversaire!, Bonne chance!, Bon voyage!, Bonne année!, Bonne fête! » yet **no content teaches any of them** (grep = 0; the SIO-030 atelier dialogue has only « Bonne journée ») | `sios.json` SIO-030 vs `ateliers.ts` SIO-030 | U2 p. 1 (66), p. 5 (70) | **FIXED 23 Aug (in place)** — 3 well-wish lines added to the SIO-030 atelier email (anniversaire · chance · voyage), all 5 formulas as `vouloir-inviter` cards 15–19, and Bon voyage / Bonne année / Bonne fête added to EMAIL_BANK's Souhaits palette |
| 2.3 | gap (low) | « **Les formes** » (shapes) — U2 lexique; also feeds U3's « Je suis… » riddle (rond, carré → pyramide du Louvre). Nothing in the app | no file | U2 p. 1 (66); U3 p. 15 (108) | Tiny deck or drop with a note |
| 2.4 | gap (low) | Clock reading « Il est neuf heures **trente** / Il est **midi** / **minuit** » (piste 47): `quand-time` has only « à midi/à minuit » frames, and the quand lesson is 24-hour-only by Dan's 2026-07-04 decision — the book's midi/minuit + 12-h style never gets said as « Il est… » | `collections/quand-time.json`, `lessons/native/quand.tsx` | U2 p. 10 (75) | Note the divergence for Dan; optionally add « Il est midi./Il est minuit. » items |
| 2.5 | extra (med) | `possessives` imports the whole **family lexicon** (père, mère, oncle, tante, cousin, grands-parents…) — the book's U2 possessive nouns are objects (livre, trousse, valise); family is not a U0–U4 lexique at all | `collections/possessives.json` | U2 p. 6 (71) tableau | Possibly deliberate enrichment; flag for Dan (it front-runs a later unit) |
| 2.6 | misplacement (low) | SIO-022 spans mon→**leurs**; the book's U2 is possessifs (**1**) — the tableau stops at mon/ton/son/votre. Deck items are mon/ma/mes only (already noted for GramMarathon) | `sios.json` SIO-022 | U2 p. 6 (71) | Align SIO wording to possessifs (1) or accept the anticipation |
| 2.7 | extra (low) | `parce-que` (SIO-025) — pourquoi/parce que is in **no** U0–U4 book summary; app addition (useful glue for goûts talk) | `collections/parce-que.json` | — | Keep, but it's app-only; Dan to bless |
| 2.8 | sequencing (low) | `modaux` lesson (unit 2) conjugates **pouvoir**; book U2 conjugates faire/vouloir/aller only — pouvoir first surfaces in U3 activities (« Est-ce que je peux boire un verre dans ce lieu ? ») | `lessons/native/modaux.tsx` | U2 p. 1 (66); U3 p. 8 (99) | Acceptable (the refusal chunk « je ne peux pas » needs it); note only |
| 2.9 | phrasing (good) | `negation-pas` = the book's Point Langue *de/d' in the negative* verbatim; `aimer-activites`, `faire-activites`, `aller-destinations`, `objets-articles`, `vouloir-inviter` all track the book's situations and pistes 44–50 closely | — | U2 pp. 7–12 | No action |

U2 verdict: the weakest unit — one headline grammar point (ne…plus) and one whole
atelier (souhaits) are missing.

---

## Unité 3 — On va où cet été ? (météo · ville · chemin)

Book scope (PDF p. 1 / book p. 92): prépositions villes/pays · questions (2)
est-ce que/qu'est-ce que · accord adjectifs (1) · article contracté (3) · pronom y ·
venir/prendre · météo · ordinaux · lieux · prépositions de lieu · transports.
Ateliers: **exprimer un besoin, une envie** · **écrire une e-carte postale**.

| # | Sev | Finding | Where | PDF | Fix |
|---|---|---|---|---|---|
| 3.1 | **gap (med)** | Atelier « **Écrire une e-carte postale** » — no app counterpart anywhere (grep « carte postale » = 0). The app's U3 production atelier (SIO-040) is the itinerary, which the book covers as *Situation 3*, not an atelier; the postcard's element checklist (date, timbre, destinataire, code postal, pays, signature) is untaught | `ateliers.ts`, `sios.json` SIO-040 | U3 p. 1 (92), p. 20 (111) | Either add an e-carte atelier or record the swap as a decision |
| 3.2 | **gap (med)** | « **nuageux / ensoleillé / des nuages** » — the book teaches all three (corrigés « ensoleillé », « Dimanche, c'est nuageux », « En Chine, c'est nuageux ») but `weather-letris` has **zero** items for them — while the weather memo's pill row plays « Il y a des nuages » and SIO-031's description promises « il y a … des nuages ». Memo + SIO reference an undrillable item (extends the 23-Aug « fourth frame » flag) | `collections/weather-letris.json`; `memos.tsx` ~line 301; `sios.json` SIO-031 | U3 p. 3 (94), p. 14 (107) | **FIXED 23 Aug (in place)** — des nuages under il-y-a, nuageux + ensoleillé under a new C'EST letris column (weather-letris-45–47); the meteo lesson memo carries the fourth frame |
| 3.3 | gap (low) | **venir de/du/des** — the book's Au tableau pairs *venir de* with *habiter à* per country type; `en-au-aux-a`'s 17 examples are 100 % **aller** (checked all items), yet SIO-032's description claims « en/au/aux/à with être, aller, **venir** » | `collections/en-au-aux-a.json` | U3 p. 6 (97) | **FIXED 23 Aug (in place)** — venir sentence cards en-au-aux-a-18–21 (de/du/des/d', the Au tableau rows verbatim incl. SIO-032's own « Elle vient des États-Unis ») |
| 3.4 | gap (low) | Ordinals: book drills up to **6ᵉ** rue (encadré « Les nombres ordinaux », corrigé uses 3ᵉ/6ᵉ); app has première/deuxième only (deliberate per textgen comment — but the deck could carry troisième) | `collections/directions-matching.json`, `textgen/unit3.ts` ORDINALS | U3 p. 12 (104) | Add troisième (+ card) so the corrigé forms are coverable |
| 3.5 | sequencing (med) | `textgen/unit3` beats use « **il faut** prendre / il faut tourner / il faut aller » — falloir belongs to U4 in both the book (« donner un conseil ») and the app's own scope (SIO-048, conjugaison falloir); the book's U3 directions use vous-present/imperative, never il faut | `textgen/unit3.ts` lines 209, 217, 321, 362 | U3 pp. 11–12 (103–104); U4 p. 1 (120) | **FIXED 23 Aug (in place)** — the three il-faut variants replaced with piste-66/deck-attested forms (vous prenez la … rue · vous tournez … au carrefour · on peut prendre …) |
| 3.6 | extra (low) | `weather-letris` extras beyond the book: grêle, bruine, tonnerre, tempête, gèle, **vente**, doux, frais, brouillard — book U3 weather is beau/mauvais/chaud/froid, pleut, neige, orage(s), éclairs, soleil, vent, degrés. « il vente » in particular is marginal French for A1 | `collections/weather-letris.json` | U3 pp. 3–5 (94–96) | Letris padding, probably deliberate; consider dropping « vente » |
| 3.7 | phrasing (low) | `pouvoir` deck « Tu peux **te garer** là » — a reflexive infinitive; the book's A1 U0–U4 has no reflexives beyond s'appeler | `collections/pouvoir.json` item 3 | — | Replace with a non-reflexive can-do (« Tu peux entrer ici ») |
| 3.8 | phrasing (good) | `directions-matching` mirrors piste 66's vous-present frames nearly verbatim; `loin-lesson` = the prépositions-de-lieu encadré; `transport` = Situation 3 act 7's list; `envies-besoins` = the atelier's four frames word-for-word (je voudrais / j'aimerais / j'ai besoin de / j'ai envie de); SIO-036's no-imperative stance matches piste 66 (though the book's corrigé act 5 does use the imperative — the app's choice is Dan's documented guard-rail) | — | U3 pp. 11–12, 18 (103–104, 110) | No action |

U3 verdict: grammar sequencing is faithful; the postcard atelier and the nuages
family are the substantive holes.

---

## Unité 4 — On mange quoi cette semaine ? (habitudes · courses · projets)

Book scope (PDF p. 1 / book p. 120): partitifs · adverbes de fréquence + place ·
quantité · futur proche · ce/cet/cette · boire/manger · commerces · nombres 70–**100** ·
donner un conseil · payer · appréciation. Ateliers: commander au restaurant ·
donner son appréciation sur un restaurant.

| # | Sev | Finding | Where | PDF | Fix |
|---|---|---|---|---|---|
| 4.1 | **gap (high, known)** | **Boissons** — `textgen/unit4` uses *thé* and *jus d'orange* (JUS/THE constants) that no deck teaches; the book itself teaches thé (« je bois souvent du café et quelquefois du thé ») and the breakfast drinks. This is the known missing ★ boissons deck (check-textgen's standing red); confirmed still open | `textgen/unit4.ts` lines 46–47; no deck | U4 p. 5 (124) piste 78; p. 3 (122) piste 75 | Author the boissons deck (Dan's placement call) |
| 4.2 | gap (med) | **fromagerie** + **marchand de fruits et légumes** — the book's commerces corrigé maps foods to six shops incl. these two; `commerces` deck has neither (the marché stands in for fruits & légumes, defensibly — fromagerie has no stand-in) | `collections/commerces.json` | U4 p. 8 (128) | Add fromagerie (du camembert, du brie are its book examples) |
| 4.3 | gap (low) | **cent** — book U4 numbers run 70 à **100**; `numbers-70-99` stops at 99 | `collections/numbers-70-99.json`, SIO-045A | U4 p. 1 (120) | Add cent (rename optional) |
| 4.4 | gap (low) | Recipe quantities — book drills 125 g / 400 ml / une cuillère à soupe / une tablette (piste 80, la recette); app quantities are un peu/beaucoup/assez/trop/un kilo only | `collections/partitifs.json` | U4 pp. 6–7 (126) | Probably out of scope for decks; note for Dan |
| 4.5 | extra (low) | `commerces` adds librairie, centre commercial, magasin, boutique — none are U4 commerces (boutiques are U3-Lille; librairie is in no unit). The memo *needs* librairie for its faux-ami warning, so likely deliberate | `collections/commerces.json` | U4 p. 8 (128) | Keep; note as app addition |
| 4.6 | extra (low) | Demonstratives: book U4 lists ce, cet, cette — the deck and SIO-046 add **ces**. Harmless anticipation (ces items are book-plausible: « ces fraises ») | `collections/demonstratifs.json` | U4 p. 1 (120) | Keep |
| 4.7 | phrasing (low) | `textgen/unit4` PRIX_GRAND puts 70–99 € totals on market/supermarket baskets; the book's shop totals are 5,89 € / 3,10 €. Deliberate service to SIO-045A — but a 99 € market basket is book-implausible | `textgen/unit4.ts` lines 152–159 | U4 p. 8 (128) piste 84 | Note only; or cap PRIX_GRAND at ~30–40 € style values if Dan prefers realism |
| 4.8 | phrasing (good) | `partitifs`' headline sentence is the book's own Point-Langue sentence (« Le midi, je mange de la viande et je bois de l'eau »); `commerces`' dialogue cards are near-verbatim piste 84 (« Je voudrais deux kilos de pommes… Et avec ceci ? … Ça fait 5,89 euros »); `frequence` = piste 78's adverbs with book placement; `modaux-plans` = the futur-proche of Situation 3; `modaux-avis` = the conseil trio (tu dois / il faut / tu peux) | — | U4 pp. 4–11 | No action |
| 4.9 | note | `commerces` « Je vais prendre un melon » — melon is in no deck's vocabulary; single-word leak, harmless | `collections/commerces.json` item | — | Optional swap to a taught fruit |

U4 verdict: phrasing fidelity is the best of the five units; the boissons deck
remains the one structural hole.

---

## Ateliers (`ateliers.ts`) — spot-check summary

- **SIO-010 (U0)** ✓ book-faithful (piste 4's vous-form question appears in the tu/vous
  order the 23-Aug wave already verified; Enchanté/épeler are U0-page material).
- **SIO-020 (U1)** mostly fine; « C'est un pays **asiatique** » uses an adjective no deck
  teaches, and « **Beaucoup de** Japonais » front-runs U4's quantity-de (phrasing, low).
- **SIO-030 (U2)** ✓ grammar-clean (qu'est-ce que appears — but the book's own U2 SMS
  piste 50 uses it, so no flag); see 2.2 for the missing well-wishes.
- **SIO-040 (U3)** ✓ present-tense directions + connectors + pouvoir, all U≤3.
- **SIO-049/050 (U4)** ✓ match the U4 summary page's two ateliers; « je recommande »
  is not deck-taught (the review atelier is its only home — acceptable as model input).

## SIOs vs the book's can-dos — mismatches only

- **SIO-013** (matières) — no book counterpart in U0–U4 (known app ★).
- **SIO-020** covers the U1 *projet culturel*; the two U1 *ateliers d'expression*
  (s'exprimer poliment, remplir un formulaire) have no SIO (see 1.1).
- **SIO-025** (parce-que) — no book counterpart (see 2.7).
- **SIO-030** description promises five well-wish formulas nothing teaches (see 2.2).
- **SIO-031** description promises « des nuages » the deck lacks (see 3.2).
- **SIO-032** description promises *venir* the deck never exemplifies (see 3.3).
- **SIO-040** = itinerary where the book's U3 atelier is the e-carte postale (see 3.1);
  it also overlaps SIO-036's ground.
- **SIO-045A** says 70–99 where the book goes to 100 (see 4.3).
- The other 42 SIOs align with the unit objectives/situations of the PDFs.

---

## Top-10 priorities

1. **Boissons deck (U4)** — the standing check-textgen red; book teaches thé + the
   breakfast drinks; textgen already depends on it. (4.1, known)
2. **ne… plus (U2)** — headline unit grammar with zero app coverage; 4–6 items in
   `negation-pas` fix it. (2.1) — **FIXED 23 Aug (in place)**
3. **Well-wish formulas (U2)** — a whole book atelier AND SIO-030's own description,
   zero coverage. (2.2) — **FIXED 23 Aug (in place)**
4. **des nuages / nuageux / ensoleillé (U3)** — the memo and SIO already reference
   them; the deck can't evidence them. (3.2) — **FIXED 23 Aug (in place)**
5. **E-carte postale atelier (U3)** — book atelier with no app counterpart; decide
   build-or-drop. (3.1)
6. **venir de/du/des examples (U3)** — SIO-032 promises venir; deck is aller-only. (3.3)
   — **FIXED 23 Aug (in place)**
7. **Remplir un formulaire (U1)** — book atelier with no coverage at all. (1.1)
8. **est-ce que lessons labelled unit 1** — two lessons front-run the book's U3
   questions (2); relabel to unit 3. (1.4) — **FIXED 23 Aug (in place)**
9. **textgen/unit3 « il faut »** — falloir before its unit; swap the three variants. (3.5)
   — **FIXED 23 Aug (in place)**
10. **fromagerie + cent (U4)** — two small book items the shop/number decks miss. (4.2, 4.3)
