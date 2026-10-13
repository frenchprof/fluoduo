# Unit 4 (« On mange quoi cette semaine ? », SIO-041 to SIO-050): content checked against the book's limits

Read-only audit. The limits come from `scope/ceilings.md`, cited as "Ceil" + section or row + book page. Paths are relative to `/home/user/fluoduo/src/`.

**How each item was judged.** Bienvenue and Units 1–4 are allowed. An item is **OVER** when the ceilings file places it in Unit 5 or later, or lists it as "out of scope". It is **UNCLEAR** when the ceilings file does not settle it. Things the file lists as "guide test or model answer only" (Ceil D: *ces*, *nous allons*, *ils vont*, *nous voulons*, *régulièrement*, *un morceau*) are UNCLEAR, and the proposal is ASK DAN.

**About the "G4 hits" notes.** In the UNCLEAR rows, "G4 has it" or "0 hits" is a plain text search of the three teacher's guides (`scope/*.txt`). It is supporting evidence only. Book pp. 58 and 68–71 are not in the scan, so "0 hits" does not prove the book lacks the word. For example, *Vous désirez ?* gets 0 hits but is in Ceil U4 "commerces".

Short names used in the evidence column:
- **B-er**: Ceil B, regular -er row: "No -er paradigm box. Used in je/tu/il/vous forms." So *nous mangeons* is fine (manger has all 6 persons), but *nous cuisinons* and *ils jouent* are OVER.
- **A-dev**: Ceil A + U4 "devoir + conseil" row (Bk p.65, p.11): "devoir does not appear at all in Units 0–4". The book's advice box is *il faut / tu peux / vous pouvez* + infinitive.
- **B-pouv**: Ceil B pouvoir row: no box; the forms seen are *je peux, tu peux, on peut, vous pouvez*. *nous pouvons* and *ils peuvent* are listed as out (Ceil U3 pouvoir row).
- **FP**: Ceil U4 "futur proche" row + Ceil D: *nous allons* and *ils vont* appear only in the guide test (G4 test, « Demain soir, nous allons manger au restaurant »). So UNCLEAR → ASK DAN.
- **DEM**: Ceil U4 "démonstratifs" row (Bk p.64; G4 test ex.3): the book teaches ce/cet/cette only. *ces* appears in the guide test only, so UNCLEAR → ASK DAN. *-ci / -là* are OUT.
- **QTY**: Ceil U4 "quantités" row (Bk p.62): "*assez de, trop de, une douzaine, une boîte de, une tranche de, un pot de*: not found".
- **ALIM**: Ceil U4 "aliments + repas" row (Bk p.60; G4 pp.121–124): *le goûter* is OUT, and so are "long fruit/vegetable lists". A word that is not in the row's list is UNCLEAR.
- **APP**: Ceil U4 "donner son appréciation" row (G4 p.139): comparatives, superlatives, *trop* + adjective, and opinion verbs are OUT.

## 1. Summary

| File | Items checked | Over | Unclear |
|---|---|---|---|
| content/sios/sios.json (SIO-041..050: description, canDo, competence, fr) | 10 | 4 | 3 |
| content/collections/aliments.json | 42 | 1 | 13 |
| content/collections/partitifs.json | 22 | 10 | 3 |
| content/collections/frequence.json | 13 | 0 | 2 |
| content/collections/commerces.json | 23 | 1 | 4 |
| content/collections/demonstratifs.json | 26 | 0 | 8 |
| content/collections/modaux-avis.json | 9 (+title) | 4 (+title) | 0 |
| content/collections/modaux-plans.json | 11 | 1 (error) | 4 |
| content/collections/numbers-70-99.json | 30 | 0 | 0 |
| content/aliments-letris.json | 18 | 0 | 2 |
| content/commerces.json (word set) | 14 | 0 | 2 |
| content/demonstratifs.json (word set) | 16 | 0 | 4 |
| content/devine-aliments.json | 56 | 1 (whole list) | 9 |
| content/modaux-letris.json | 16 | 7 | 2 |
| content/numbers-70-99-letris.json | 23 | 0 | 0 |
| content/partitifs-letris.json | 18 | 0 | 4 |
| content/pretests/u4-sio041.json | 7 | 2 | 2 |
| content/pretests/u4-sio042.json | 10 | 1 | 4 |
| content/pretests/u4-sio045.json (SIO-043 frequency) | 7 | 1 | 2 |
| content/pretests/u4-sio045a-nombres.json (SIO-045) | 6 | 5 | 2 |
| content/pretests/u4-sio046.json | 7 | 0 | 5 |
| content/pretests/u4-sio047-plans.json | 12 | 0 | 4 |
| content/pretests/u4-sio047.json (SIO-044 commerces) | 16 | 3 | 1 |
| content/pretests/u4-sio048-advice.json | 11 | 7 | 1 |
| content/finale.ts (`unit: 4`, 96 items) | 96 | 13 | 19 |
| content/gcompris.ts | 0 (no Unit 4 scenes; `unit: 0\|1\|2` only) | 0 | 0 |
| content/transfer.ts | 0 (no Unit 4 item) | 0 | 0 |
| content/textgen/unit4.ts (lexicon + 3 scenarios) | ~150 | 3 | 5 |
| content/conjugaison.ts CONJ_BY_SIO (SIO-042/044/047/048; 7 verbs, 42 cells) | 42 | 13 | 3 |
| content/lessonVerbs.ts (SIO-041..050; 17 verbs) | 17 | 9 | 7 |
| content/ateliers.ts SIO-049 / SIO-050 dialogues | 14 | 0 | 3 |
| content/memos.tsx (commerces, au-marche, numbers-70-99, aliments cards) | 4 cards | 1 | 2 |
| lessons/native/aliments.tsx | ~40 | 1 | 2 |
| lessons/native/partitifs.tsx | ~45 | 0 | 1 |
| lessons/native/manger-boire.tsx + .gen.ts | ~30 | 0 | 1 |
| lessons/native/frequence.tsx + .gen.ts | ~40 | 1 | 3 |
| lessons/native/au-marche.tsx + .gen.ts | ~45 | 1 (+1 bug) | 3 |
| lessons/native/soixante-dix.tsx + .gen.ts | ~40 | 1 | 0 |
| lessons/native/demonstratifs.tsx | ~45 | 0 | 3 |
| lessons/native/futur-proche.tsx + .gen.ts | ~40 | 0 | 2 |
| lessons/native/conseils.tsx (SIO-048) | ~55 | 3 | 1 |
| lessons/native/modaux.tsx + .gen.ts (shared with SIO-029; served on SIO-047/048) | ~50 | 2 | 1 |
| lessons/native/atelier-avis-resto.tsx (concept) | ~15 | 0 | 1 |
| lessons/native/atelier-resto.tsx | ~15 | 0 | 0 |
| games/compose/banks.tsx (MEALS_BANK, CAFE_BANK, MARCHE_BANK) | ~90 | 4 | 2 |
| games/compose/ComposeDialogue.tsx (café waiter lines) | 6 | 0 | 1 |
| games/compose/banks-production.tsx (REVIEW_BANK, RESTAURANT_SCENE_BANK) | ~60 | 5 | 4 |

## 2. Findings

### content/sios/sios.json
| Where | Text | Beyond the book | Ceil evidence | Proposal |
|---|---|---|---|---|
| SIO-041 l.689 desc + competence ("Name the 4 meals") | « petit-déjeuner, déjeuner, **goûter**, dîner » | goûter is not a book meal; the book has three meals | ALIM: "*le goûter* (offered only as a teacher add-on)" OUT; Bk p.60 | SIMPLIFY → "Name the 3 meals (le petit déjeuner, le déjeuner, le dîner)" |
| SIO-042 l.706 desc + competence ("Choose definite vs partitive ... ≥8 prompts") | « Distinguish liking (J'aime le pain — défini) from consuming (Je mange du pain — partitif) » | definite vs partitive taught as an explicit contrast with aimer | Ceil U4 "partitifs" row, Out: "partitive vs definite article as an explicit contrast with *aimer*"; Bk p.60 | SIMPLIFY → "use du / de la / de l' / des with manger, boire, prendre; switch to de/d' after a negative" (ASK DAN whether to keep the aimer contrast, since U2 taught aimer + le) |
| SIO-042 l.706 | « Il ne boit pas d'**alcool** » | vocabulary | not in ALIM list | UNCLEAR → SIMPLIFY → « Il ne boit pas de café » |
| SIO-044 l.740 desc + competence | « ask **Combien ça coûte ?** » | the book's price questions are *Ça fait combien ? / C'est combien ?* | Ceil U4 "commerces" row (Bk p.63) lists only those; *Combien ça coûte* gets 0 hits in all guides | UNCLEAR → SIMPLIFY → « C'est combien ? » |
| SIO-046 l.774 desc, canDo ("this/**these**"), competence | « ce/cet/cette/**ces** … ces légumes » | ces | DEM | ASK DAN (if no: SIMPLIFY → ce/cet/cette only) |
| SIO-047 l.791 desc | « aller + infinitive **across all persons** (… **Nous allons** visiter le marché.) » | nous/ils forms of aller | FP | ASK DAN (if no: SIMPLIFY → je, tu, il/elle/on, vous) |
| SIO-048 l.808 desc, competence, `fr` l.816 | « Give simple advice with **tu dois** + inf … Tu dois dormir plus » ; fr « **Tu dois**… Il faut… » | devoir | A-dev; book box Bk p.65 "Il faut dormir plus. Tu peux faire du sport. Vous pouvez faire des pauses." | SIMPLIFY → "Give advice with il faut + inf, tu peux / vous pouvez + inf (Il faut dormir plus. Tu peux faire du sport.)"; fr → « Il faut… Tu peux… » |
| SIO-049 l.825 desc + competence | « C'est **trop cher** mais c'est bon » | trop + adjective | APP: "*trop* + adjective" OUT | SIMPLIFY → « C'est un peu cher mais c'est bon » (*un peu élevés* is in the G4 key) |
| SIO-049 l.825 desc + competence | « Le service est **lent** » ; « **Je recommande** / Je ne recommande pas » (required) | not in the guide's list of appreciation words (long, rapide…); *recommander* gets 0 hits | APP (book p.69 not scanned) | ASK DAN (a safe swap is « Le service est long » ; « C'est excellent ! ») |

### content/collections/*.json
| Where | Text | Beyond the book | Ceil evidence | Proposal |
|---|---|---|---|---|
| aliments.json `aliments-03` | « le goûter » | meal not in the book | ALIM OUT | CUT |
| aliments.json 06–42 (13 items) | riz, pâtes, huile, soupe, frites, jus d'orange, abricot, orange, gâteau, tarte, confiture, glace, jambon | not in the ALIM list. G4 has riz, pâtes, huile, gâteau, tarte, orange, abricot; 0 hits for frites, jus d'orange, confiture, glace, jambon | ALIM | UNCLEAR → ASK DAN; prefer the book list (ail, asperges, carottes, oignons, poulet, tomates, miel, céréales, pommes de terre…) |
| partitifs.json `partitifs-01..08` `example` | « J'aime le pain. » → « Je mange du pain. » (title « Défini ou partitif ? », subtitle « le pain → du pain ») | explicit definite / partitive contrast | Ceil U4 partitifs row, Out (see SIO-042) | SIMPLIFY → use the affirmative partitive as the example: « Je mange du pain » → « Je ne mange pas de pain » |
| partitifs.json `partitifs-q03` | « J'ai **assez de** sel. » | assez de | QTY | CUT, or SIMPLIFY → « J'ai un peu de sel. » |
| partitifs.json `partitifs-q04` | « Tu manges **trop de** sucre. » | trop de | QTY | SIMPLIFY → « Tu manges beaucoup de sucre. » |
| partitifs.json 03, 12, 14 | « eau gazeuse », « sushis » | vocabulary; 0 hits | ALIM | UNCLEAR → SIMPLIFY → « de l'eau », « des tomates » |
| frequence.json 03, 12 | « des sushis » | vocabulary; 0 hits | ALIM | UNCLEAR → SIMPLIFY → « des pâtes » |
| commerces.json `commerces-26` | « Je vous **en** mets combien ? » | the pronoun en | Ceil U4 partitifs row: "*en* (appears only in the test text)" OUT | CUT |
| commerces.json 04, 10, 20, 25 | « centre commercial », « librairie », « un melon », « Voici votre monnaie » | not in the commerces row; 0 hits each | Ceil U4 commerces row (Bk p.63) | UNCLEAR → SIMPLIFY 10 → « fromagerie », 04 → « marchand de fruits et légumes » |
| demonstratifs.json 07, 08, 15, 16, 19 ex, 20, 23, 25 | « ces légumes / fraises / carottes / olives » | ces | DEM | ASK DAN |
| modaux-avis.json title | « Devoir · pouvoir · falloir » | devoir | A-dev | SIMPLIFY → « Il faut · tu peux · vous pouvez » |
| modaux-avis.json 07, 08, 09 | « Tu **dois** manger des légumes. » « Je **dois** boire de l'eau. » « Vous **devez** réserver une table. » | devoir | A-dev | SIMPLIFY → « Il faut manger des légumes. » « Tu peux boire de l'eau. » « Vous pouvez réserver une table. » |
| modaux-avis.json 04 | « **Elle peut** cuisiner. » | il/elle peut is not among the forms seen | B-pouv | SIMPLIFY → « Tu peux cuisiner. » |
| modaux-plans.json 03, 06, 11 | « **Nous allons** visiter… », « **Ils vont** réserver… », « **Nous n'allons** pas… » | nous/ils of aller | FP | ASK DAN |
| modaux-plans.json 05 | « le menu du jour » | the book uses *la formule / plat du jour* (G4 l.1483) | — | UNCLEAR → SIMPLIFY → « la formule » |
| modaux-plans.json 09 (French error, not a ceiling issue) | « Je ne vais pas faire **du** sport. » | breaks the book's own *pas de* rule | Ceil U2 "pas de" row (Bk p.35) | SIMPLIFY → « Je ne vais pas faire **de** sport. » |

### Word sets (content/*.json)
| Where | Text | Beyond the book | Ceil evidence | Proposal |
|---|---|---|---|---|
| devine-aliments.json (the whole set) | 56 foods: citron, kiwi, pamplemousse, pastèque, pêche, poires, brocoli, chou-fleur, concombres, haricots verts, petits pois, poivrons, macarons, pizza, vanille, yaourt, baguette, crêpes, poivre, vinaigre, saucisson… | a long fruit/vegetable list | ALIM: "long fruit/vegetable lists" OUT | SIMPLIFY → trim to the ALIM list |
| devine-aliments.json (9 words) | brocoli, chou-fleur, vanille, poivre, vinaigre, saucisson, sushis, jambon, confiture | 0 hits in all guides | ALIM | UNCLEAR → CUT first |
| aliments-letris.json | « du jambon », « du jus d'orange » | 0 hits | ALIM | UNCLEAR |
| commerces.json (letris) | CENTRE COMMERCIAL, LIBRAIRIE | 0 hits | Ceil U4 commerces | UNCLEAR → SIMPLIFY → FROMAGERIE, CRÉMERIE |
| demonstratifs.json (letris) | the « Ces ___ » column (LÉGUMES, FRAISES, CAROTTES, OLIVES) | ces | DEM | ASK DAN |
| modaux-letris.json | DOIS, DOIT, DEVONS, DEVEZ, DOIVENT (the whole DEVOIR column) | devoir | A-dev | CUT the column |
| modaux-letris.json | POUVONS, PEUVENT | pouvoir paradigm | B-pouv; Ceil A (Unit 6) | CUT |
| modaux-letris.json | ALLONS, VONT | | FP | ASK DAN |
| partitifs-letris.json | CONFITURE, SOUPE, GLACE, FRITES | 0 hits (soupe appears only in *cuillère à soupe*) | ALIM | UNCLEAR → SIMPLIFY → MIEL, SALADE, FARINE, CAROTTES |

### Pretests
| Where | Text | Beyond the book | Ceil evidence | Proposal |
|---|---|---|---|---|
| u4-sio041-01 | « Je prends le petit-déjeuner à sept heures **du matin**. » | *du matin* after a time | Ceil C: "Not covered: *du matin / de l'après-midi / du soir* after a time" | SIMPLIFY → « … à sept heures. » |
| u4-sio041-02 | « Pour **le goûter**, elle mange une pomme. » | goûter | ALIM OUT | SIMPLIFY → « Au déjeuner, elle mange une pomme. » |
| u4-sio041-04, -05 | « eau minérale », « après le plat principal » | 0 hits | ALIM | UNCLEAR |
| u4-sio042-05 | « J'adore **la** pizza. » (answer la; distractor du) | the defined-vs-partitive contrast with aimer | Ceil U4 partitifs row Out | SIMPLIFY → turn it into a partitive item (« Je mange ___ pizza ») or ASK DAN |
| u4-sio042-10 | « Non, **ce n'est pas du** café — c'est du thé. » | the *c'est* exception to the *pas de* rule | not in Ceil; the book rule is "Negation drops to *de*" | UNCLEAR → ASK DAN (likely CUT) |
| u4-sio042-06, -07, -09 | « On **ajoute** de l'huile d'olive », « la **bière** … du **vin** », « **seulement** du **jus** » | not in the ALIM list | ALIM | UNCLEAR |
| u4-sio045-06 (SIO-043) | « On mange au restaurant **de temps en temps**. » (answer) | de temps en temps | Ceil U4 adverbes row Out; Ceil D "confirmed absent" | CUT, or SIMPLIFY → « … quelquefois. » |
| u4-sio045-03, -04 | « au fast-food » ; distractor « toujours pas » | | not in Ceil | UNCLEAR |
| u4-sio045a-01, -02, -04, -05, -06 | distractors « septante et un », « huitante », « nonante et un », « septante-six », « nonante-neuf » (and whyWrong « Nonante is Belgian/Swiss ») | a distractor uses vocabulary the book does not teach | Ceil U4 nombres row: "septante / huitante / nonante" OUT; Ceil D | SIMPLIFY → use an in-scope trap such as « soixante-dix-un », « quatre-vingt » or « soixante et un » |
| u4-sio045a-02, -03, -04 | « grand-mère », « Le livre **coûte** », « oncle » | not in Ceil | — | UNCLEAR |
| u4-sio046-04 | « **Ces** légumes ont l'air très frais. » (answer) | ces; *avoir l'air* | DEM | ASK DAN; SIMPLIFY → « Cette salade est très bonne. » |
| u4-sio046-02, -05, -06 | « faire les courses », « cet **endroit** », « Ce fromage **sent** très fort » | 0 hits for endroit and sentir | — | UNCLEAR → SIMPLIFY 05 → « Tu connais cet hôtel ? » |
| u4-sio047-plans-02, -06, -08, -10 | « **Nous allons** cuisiner », « **Ils vont** faire les courses », « **Nous n'allons** pas… », « **Elles vont** acheter… » | | FP | ASK DAN |
| u4-sio047-09 (SIO-044) | « **Il me faut une tranche de** jambon » (answer: *une tranche de*) | *il me faut*; *une tranche de* | Ceil U3 "vouloir / avoir besoin de": "*il me faut*" OUT; QTY | SIMPLIFY → « Je voudrais **une bouteille de** lait » |
| u4-sio047-07 | distractor « une tranche de » | uses an uncovered quantity word | QTY | SIMPLIFY → distractor « une tablette de » |
| u4-sio047-11 | distractors « celui », « ceux » | demonstrative pronouns | Ceil U4 démonstratifs row: "demonstrative pronouns (Unit 8)" OUT | SIMPLIFY → distractors « ce », « cette » |
| u4-sio047-14 | « Voici votre **monnaie**. » | 0 hits in G4 | Ceil U4 commerces | UNCLEAR |
| u4-sio048-advice-01, -02, -06, -08, -11 | « Tu **dois** », « Nous **devons** », « Vous **devez** », « Elles **doivent** », « vous ne **devez** pas » | devoir | A-dev | SIMPLIFY → *il faut* / *tu peux* / *vous pouvez* items |
| u4-sio048-advice-03 | « **Elle peut** cuisiner ce soir. » (plus distractors « pouvons », « peut ») | | B-pouv | SIMPLIFY → « Tu peux cuisiner ce soir. » |
| u4-sio048-advice-09 | « Il ne faut pas manger **trop de** sucre. » | trop de | QTY | SIMPLIFY → « Il faut manger un peu de sucre. » or CUT |
| u4-sio048-advice-04 | « il faut manger **équilibré** » | | not in Ceil | UNCLEAR |

### content/finale.ts (Unit 4 items)
| Where | Text | Beyond the book | Ceil evidence | Proposal |
|---|---|---|---|---|
| l.87 SIO-042:4 | « Avec elle, on peut **tartiner** des **tranches** de pain. » | tartiner; une tranche | QTY; 0 hits for tartiner | CUT |
| l.90 SIO-021:1 (tagged unit 4) | « … ___ morceau de viande entre deux **tranches** de pain. » | tranche; *morceau* is test-only (Ceil D) | QTY | CUT (it is also a mis-tag: SIO-021 is Unit 2) |
| l.127 SIO-042:17 | « Il y a **trop d'**oignons dans la soupe ! » | trop de | QTY | SIMPLIFY → « Il y a beaucoup d'oignons… » |
| l.130 SIO-042:20 | « Tu mets **trop de** sel ! » | trop de | QTY | SIMPLIFY → « Tu mets beaucoup de sel ! » |
| l.255 SIO-044:10 | « Pour les médicaments, **allez** à la **pharmacie**. » | pharmacie; the imperative | Ceil U3 lieux row: "a full city list (mairie, **pharmacie**…)" OUT; Ceil A imperative = Unit 8 | CUT, or SIMPLIFY → « Pour le fromage, on va à la ___. » (fromagerie) |
| l.261 SIO-046:2 | « J'achète ce **fromage-là**, le petit. » | -là | DEM: "*-ci / -là*" OUT | SIMPLIFY → « J'achète ___ fromage. » |
| l.362 SIO-046:4 | « J'adore **ces chaussures-là** ! » (+ vitrine) | -là; ces | DEM | CUT |
| l.464 SIO-046:6 | « Tu vois ___ **arbre-là** ? » | -là | DEM | SIMPLIFY → « Tu aimes ___ ananas ? » (cet) |
| l.264 SIO-048:1 | « Tu es fatigué : tu ___ dormir ! » primary answer **dois** | devoir is the primary answer | A-dev | SIMPLIFY → « Tu es fatigué : il ___ dormir ! » (faut) |
| l.365 SIO-048:3 | « … les enfants ___ dormir ! » primary **doivent** (alternates vont, peuvent) | devoir; ils peuvent | A-dev; B-pouv | SIMPLIFY → « Il est minuit : il ___ dormir ! » (faut) |
| l.467 SIO-048:5 | « Examen demain : nous ___ étudier ce soir ! » primary **devons** | devoir | A-dev | SIMPLIFY → « … il ___ étudier ce soir ! » (faut) |
| l.368 SIO-049:4 | « C'est **trop** ___ ! » (cher) | trop + adjective | APP | SIMPLIFY → « 200 € pour une salade ! C'est ___ ! » (cher) |
| l.469 SIO-049:5 | « **quelle** mauvaise surprise ! » | *Quel… !* as an exclamation | Ceil U1 quel row: "*Quel… !* as an exclamation" OUT | SIMPLIFY → « La soupe est froide : c'est ___ ! » (nul) |
| l.46–48 SIO-042:1–3 | « Un **verre** d'eau / de lait / de jus d'orange » | *un verre de* is not in the quantities box | QTY (box: bouteille, tablette, kg, g, l, ml, un peu, beaucoup) | UNCLEAR → SIMPLIFY → « Une bouteille ___ eau » |
| l.73 SIO-044:5 | « On y achète des livres : c'est la **librairie** » | 0 hits | Ceil U4 commerces | UNCLEAR → SIMPLIFY → fromagerie item |
| l.89, 107, 117 | « aliment **contenant** », « de ___ **soupe** », « ___ **frites** au menu » | | ALIM | UNCLEAR |
| l.260 SIO-046:1 | « Regarde ___ pommes ! » (ces / les) | ces | DEM | ASK DAN |
| l.361 SIO-046:3 | « ___ homme, **là-bas**, c'est mon professeur. » | là-bas: 0 hits | DEM | UNCLEAR |
| l.262, 465 SIO-047:1, :5 | « nous ___ manger » (allons) | | FP | ASK DAN |
| l.364 SIO-047:4 | « Ce week-end, **ils vont** ___ au football. » (jouer) | ils vont; *jouer au* | FP; Ceil U2 faire row: "*jouer au / à la* as a rule (it is never boxed)" | UNCLEAR → SIMPLIFY → « Ce week-end, je vais ___ du sport. » (faire) |
| l.263, 466 SIO-047:2, :6 | « faire mes **devoirs** », « ___ pour la France » (partir) | | not in Ceil | UNCLEAR |
| l.366, 468 SIO-048:4, :6 | « il faut **un passeport** », « il faut **un billet** » | *il faut* + noun (the box gives *il faut* + infinitive only) | U4 devoir + conseil row (Bk p.65) | UNCLEAR → SIMPLIFY → « il faut acheter un billet » |
| l.267 SIO-049:2 | « Le service est **lent** … un ___ restaurant » (**mauvais**) | not in the G4 appreciation list | APP | UNCLEAR |
| l.470 SIO-049:6 | « je ___ ce restaurant à tous mes amis » (**recommande**) | 0 hits | APP | ASK DAN |
| l.370 SIO-050:3 | « Et **comme boisson** ? » | 0 hits | Ceil U4 commander row | UNCLEAR |
| l.463 SIO-046:5 | accepted alternate « **notre** » | notre (Unit 7). It is only accepted, never shown | Ceil A | SIMPLIFY → drop the alternate |

### content/textgen/unit4.ts
| Where | Text | Beyond the book | Ceil evidence | Proposal |
|---|---|---|---|---|
| l.82 REPAS | « Au goûter, je mange… » | goûter | ALIM OUT | CUT the goûter meal |
| l.191 SERVICES; l.442, l.446 | « **On doit** réserver une table. » « **Vous devez** y aller ! » « **Vous devez** goûter le … ! » | devoir | A-dev | SIMPLIFY → « Il faut réserver une table. » « Vous pouvez y aller ! » « Vous pouvez goûter le … ! » |
| l.403, 407, 411 | « **On y mange** souvent… », « **J'y mange**… », « Je vais **y manger**… » | y with a verb other than aller | Ceil U3 transports row: Out "y with other verbs or in compound tenses" | SIMPLIFY → « Au restaurant, on mange souvent… » |
| l.441–444 | « Il faut y aller ! » « On peut y aller ce soir. » | y before an infinitive of aller | Ceil U3 transports row only shows « J'y vais » | UNCLEAR |
| dem() on plural achats (LES_COURSES l.~350) | « **Ces** fraises sont fraîches. » | ces | DEM | ASK DAN |
| l.438 | « Je recommande ce restaurant ! » | | APP | ASK DAN |
| lexicon | soupe, frites, confiture, jus d'orange, sushis; « fraîche(s) », « chère(s) » | | ALIM / APP | UNCLEAR |

### content/conjugaison.ts CONJ_BY_SIO (full 6-person ConjugaZone tables)
| Where | Text | Beyond the book | Ceil evidence | Proposal |
|---|---|---|---|---|
| l.121 SIO-048 devoir | dois … doivent (6 cells) | devoir | A-dev | CUT devoir from SIO-048 |
| l.121 SIO-048 pouvoir | pouvons, peuvent | | B-pouv | SIMPLIFY → hide the nous/ils rows, or CUT (Ceil A: the pouvoir paradigm is Unit 6) |
| l.119 SIO-044 acheter, payer | achetons/achètent, payons/paient | | B-er | SIMPLIFY → je/tu/il/vous only |
| l.119 SIO-044 vouloir | veulent (OVER), voulons (UNCLEAR) | | Ceil U2 vouloir row; Ceil D | ASK DAN |
| l.120 SIO-047 aller | allons, vont | | FP | ASK DAN |

### content/lessonVerbs.ts (sets which verbs ConjugaZone drills, in all 6 persons, on each stop)
| Where | Text | Beyond the book | Ceil evidence | Proposal |
|---|---|---|---|---|
| l.161 SIO-048 | devoir (essential) | | A-dev | CUT |
| SIO-041/042/043/044/047/049 | déjeuner, dîner, consommer, voyager, nager, payer, rencontrer, trouver: nous/ils cells | | B-er | SIMPLIFY → je/tu/il/vous |
| l.164 SIO-049 | trouver (essential) for a review, i.e. *je trouve que* | opinion verb | APP: "opinion verbs (*je trouve que*: Unit 8)" | ASK DAN (likely CUT for SIO-049) |
| SIO-043/044/045/046/047/048/050 | dormir, vendre, rendre, mettre, voir, vivre, choisir | no box for these verbs in Units 0–4 | Ceil B lists no box for them | UNCLEAR → ASK DAN |

### content/ateliers.ts and memos.tsx
| Where | Text | Beyond the book | Ceil evidence | Proposal |
|---|---|---|---|---|
| ateliers.ts l.94, 98, 99 (SIO-049 model; also the atelier-avis-resto bonus and concept) | « du poisson avec des **frites** », « le service est un peu **lent** », « Mais je **recommande** ce restaurant ! » | | ALIM; APP | UNCLEAR → ASK DAN (« un peu long » is safe) |
| memos.tsx l.297–300 commerces card | « la **pharmacie** » ; « la banque, la poste » ; « la librairie » | pharmacie is OUT; banque and poste are test-only; librairie gets 0 hits | Ceil U3 lieux row | SIMPLIFY → la fromagerie, la poissonnerie, le marchand de fruits et légumes |
| memos.tsx l.313 au-marche card | « Voici votre monnaie ! » | | Ceil U4 commerces | UNCLEAR |

### lessons/native (MneMemo)
| Where | Text | Beyond the book | Ceil evidence | Proposal |
|---|---|---|---|---|
| aliments.tsx l.15, 226, 265 | MEALS « goûter »; Mémo « 4 repas … le goûter »; bonus « Au goûter, je mange une pomme. » | goûter | ALIM OUT | CUT; Mémo → « 3 repas » |
| aliments.tsx l.76–218 concept | the à vs de rule for noun compounds (« gâteau au chocolat / jus d'orange / tarte aux pommes ») | not a taught point; G4 has these only as incidental dish names | not in Ceil | UNCLEAR → ASK DAN |
| aliments.tsx, partitifs.tsx, manger-boire.gen.ts | soupe, frites, confiture, jus | | ALIM | UNCLEAR |
| frequence.gen.ts l.17, l.19; frequence.tsx l.98, 99, 103 | Nous/Ils/Elles + -er verbs: « Nous cuisinons parfois », « Ils jouent régulièrement au foot », « Nous ne travaillons jamais » | | B-er | SIMPLIFY → limit SUBJECTS to je/tu/il/elle/on/vous for -er verbs |
| frequence.gen.ts l.30 (axis + Mémo chips), frequence.tsx l.99 | « **régulièrement** » taught as a 6th adverb | | Ceil U4 adverbes row Out; Ceil D (guide model only) | ASK DAN (if no: SIMPLIFY → « quelquefois », which IS in the book box) |
| frequence.tsx l.21, 74 | « Je **cours** souvent », « jouer au foot » | | not in Ceil | UNCLEAR |
| au-marche.tsx l.38, 44, 106, 119; .gen.ts l.35 | « une **douzaine** d'œufs » (concept, pitfall, Mémo, bonus, generator) | une douzaine | QTY | SIMPLIFY → « un kilo de tomates », « une bouteille de lait » |
| au-marche.tsx l.59, 123; .gen.ts l.54 | « un demi-kilo », « Et avec **ça** ? », « le **vendeur** » | the book says « Et avec ceci ? » and *le marchand* (G4) | Ceil U4 commerces | UNCLEAR → SIMPLIFY → « Et avec ceci ? », « le marchand » |
| au-marche.gen.ts l.36 + l.76–79 (bug, not a ceiling issue) | GOODS `{ fr: "baguettes", unit: "deux" }` → `quantityOf` gives the CORRECT answer « Je voudrais **deux de baguettes**. » | wrong French served as the right answer | — | SIMPLIFY → special-case a number with no « de » (« deux baguettes ») |
| soixante-dix.gen.ts l.88–90, 124, 129 | distractors « septante-… », « nonante-… », « octante » | a distractor uses uncovered vocabulary | Ceil U4 nombres row OUT | SIMPLIFY → use only strayS plus nearby numbers |
| demonstratifs.tsx l.47, 72, 104, 125–126 | « ces » in the concept, flow and Mémo (« ces week-ends ») | | DEM | ASK DAN |
| demonstratifs.tsx l.12, 19, 20, 158 | « ce mois », « cette nuit », « cette journée » | *la nuit* is listed out in Ceil U2 "moments" but marked Unit 2 in Bienvenue; mois / journée not in Ceil | Ceil U2 moments row | UNCLEAR → SIMPLIFY → the book's own markers (ce soir, cet après-midi, cette année, ce matin, ce week-end, cette semaine) |
| futur-proche.gen.ts l.17–18, 30; futur-proche.tsx l.33, 86, 88, 91, 94 | Mémo rows *nous allons / ils vont*; « Nous allons sortir », « Ils vont étudier », « Elles ne vont pas courir » | | FP | ASK DAN |
| futur-proche.gen.ts l.22–26 | « manger équilibré », « courir », « arrêter le café », « étudier » | | not in Ceil | UNCLEAR |
| conseils.tsx l.26–28, 51–54, 73, 79–86, 177–189, 194–196; whole concept | the devoir paradigm table, « Tu dois manger des légumes », the dice "devoir" mode with all persons, and the bonus « Je dois… / Vous devez… » | devoir | A-dev | SIMPLIFY → the book's three: *il faut* / *tu peux* / *vous pouvez* (strong-general vs gentle-personal) |
| conseils.tsx l.201 | « **Elle peut** cuisiner. » | | B-pouv | SIMPLIFY → « Vous pouvez cuisiner. » |
| conseils.tsx l.180 (POUVOIR table, l.29–31) | the pouvoir-mode distractors are drawn from peut / **pouvons** / pouvez / **peuvent** | | B-pouv | SIMPLIFY → distractors from peux / pouvez / peut only |
| modaux.tsx l.15–33, 41, 66–74, 84–86, 102, 106, 109–110; modaux.gen.ts l.30–33 (shown on SIO-047 and SIO-048 via lessons.ts l.176–177) | the « devoir (must) » column; *nous pouvons, ils peuvent, ils veulent*; « Nous devons partir », « Ils ne peuvent pas venir » | | A-dev; B-pouv; Ceil U2 vouloir row | CUT devoir; SIMPLIFY the persons (also noted in the Unit 2 audit) |

### games/compose
| Where | Text | Beyond the book | Ceil evidence | Proposal |
|---|---|---|---|---|
| banks.tsx l.~270 REPAS chips (from aliments-03), l.346, l.356 | chip « Au goûter »; prompt « Tu prends quelque chose vers quatre heures ? »; model « Au goûter, je mange un gâteau. » | goûter | ALIM OUT | SIMPLIFY → three meals, three prompts |
| banks.tsx l.332 | chip « je ne mange **rien** » | ne… rien | Ceil U1 négation row: "*rien, personne*" OUT | SIMPLIFY → « je ne mange pas » |
| banks.tsx l.561 MARCHE_BANK | chip « **Il me faut** » | | Ceil U3 "vouloir / avoir besoin de": "*il me faut*" OUT | SIMPLIFY → « J'ai besoin de » |
| banks.tsx l.572 | chip « une **tranche** de jambon » | | QTY | SIMPLIFY → « une bouteille de lait » |
| banks.tsx l.~395 CAFE_BANK | « une soupe à l'oignon », « un steak-frites », « une crêpe au chocolat », « une eau minérale », « un coca », « Pour moi, » | | ALIM | UNCLEAR |
| ComposeDialogue.tsx l.329–330, 359 | waiter: « Parfait, très poli ! », « Autre chose ? », « Merci à vous » | | not in Ceil | UNCLEAR |
| banks-production.tsx l.402 REVIEW_BANK | « C'est **trop cher** », « **trop salé** », « **trop long** » | trop + adjective | APP | SIMPLIFY → « C'est un peu cher », « pas assez cuit » (G4 key), « long » |
| banks-production.tsx l.412 openingFr | « **c'était** comment ? **Dis-moi** ce qui était bien et ce qui était **moins bien**. » | c'était (Unit 5); the tu imperative (Unit 8); a comparative | Ceil A; APP | SIMPLIFY → « Alors, ce restaurant, c'est comment ? » |
| banks-production.tsx l.405 | « **J'y retourne** » | y with a verb other than aller | Ceil U3 transports row | CUT |
| banks-production.tsx l.403–405 | « Je recommande », « par contre », « vraiment », « l'ambiance », « En général », « assez » | | APP | UNCLEAR → ASK DAN |
| banks-production.tsx l.431, 439 RESTAURANT_SCENE_BANK | « Vous **avez réservé** ? », « J'**ai réservé** » | passé composé | Ceil A: Unit 5 | SIMPLIFY → « Bonsoir ! Une table pour combien de personnes ? »; chip → « une table pour deux » |
| banks-production.tsx l.443 | « **Merci beaucoup** » | | Ceil U1 politesse row: "*Merci beaucoup*: not found"; Ceil D | SIMPLIFY → « Merci » |
| banks-production.tsx l.440–442 | « **Comme** entrée / plat / dessert », « Qu'est-ce que vous recommandez ? », « sans », « encore un peu », « Tout va bien », « près de la fenêtre », « au nom de » | the book has « **En** entrée / plat / dessert » | Ceil U4 commander row (G4 Piste 95) | UNCLEAR → SIMPLIFY → « En entrée / En plat / En dessert » |

## 3. Whole-goal issues

1. **SIO-048 « Giving advice — devoir / falloir / pouvoir » is built on a verb the book does not teach.** devoir does not appear in Units 0–4; its conjugation is Unit 6. The book's advice box (Bk p.65) is *Il faut + inf / Tu peux + inf / Vous pouvez + inf*. This one point runs through the goal text, the `modaux-avis` deck, the pretest (5 of 11 items), 3 Finale items, the `conseils` and `modaux` lessons, modaux-letris, ConjugaZone (CONJ_BY_SIO and lessonVerbs) and textgen. Proposal: rename it « Donner un conseil — il faut / tu peux / vous pouvez » and remove devoir throughout.
2. **SIO-041 teaches four meals; the book has three.** *le goûter* is a teacher add-on only. It shows up in the goal, the aliments deck, a pretest, the lesson, ComposeIt « Les quatre repas » (a whole prompt plus the model) and textgen. Proposal: three meals.
3. **SIO-042's headline skill is the definite-vs-partitive contrast with aimer**, which the ceilings file lists as out of scope. The book teaches the partitive itself, *pas de*, and manger/boire in all six persons. Proposal: ASK DAN; the default is to drill the partitive and the negative, not *J'aime le / Je mange du*.
4. **SIO-046 is « ce / cet / cette / ces », but the book and its table of contents teach ce, cet and cette only.** *ces* is in the guide test only. Proposal: ASK DAN; the default is three forms, and *-là* is cut everywhere (3 Finale items).
5. **SIO-047 promises « aller + infinitive across all persons ».** The book's examples use je, tu, il, on and vous. *nous allons* and *ils vont* are in the guide test only. Proposal: ASK DAN.
6. **SIO-049's required verdict « Je recommande / Je ne recommande pas » and « trop cher » / « lent » are not supported by the evidence.** Book p.69 is not scanned. The guide's key gives chaleureux, sympathique, agréable, long, rapide, délicieux, élevés and *Excellent !*; *trop* + adjective is out. Proposal: ASK DAN; rebuild the goal on the G4 adjective list.
7. **SIO-044's goal text asks for « Combien ça coûte ? »**, but the book's phrases are *Ça fait combien ? / C'est combien ?*. The quantities drilled across the stop (*une douzaine*, *une tranche*, *il me faut*) are not in the book's quantities box. Proposal: SIMPLIFY to the book box (kg, g, l, ml, un peu de, beaucoup de, une tablette de, une bouteille de).

Not ceiling issues, but found on the way and worth fixing: `au-marche.gen.ts` serves « Je voudrais **deux de baguettes**. » as the correct answer; `modaux-plans-09` gives « Je ne vais pas faire **du** sport » as a model sentence; `finale.ts` l.90 tags SIO-021 as `unit: 4`; and the pretest file names are shifted (`u4-sio045.json` is SIO-043, `u4-sio047.json` is SIO-044, as documented in pretests/index.ts). SIO-049 and SIO-050 have no pretest.
