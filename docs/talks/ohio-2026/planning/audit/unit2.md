# Unit 2 (« On fait quoi ce week-end ? », SIO-021 to SIO-030): content checked against the book's limits

Read-only audit. Limits come from `scope/ceilings.md`, cited as "Ceil" + section/row + book page. Paths are relative to `/home/user/fluoduo/src/`.
Rule applied: Bienvenue + Units 1–2 are allowed; anything the ceilings file places in Unit 3 or later, or lists as "out of scope", is **OVER**. Anything the ceilings file does not settle is **UNCLEAR**.

Files with no Unit 2 content: `content/transfer.ts` (only the `nationalities` deck, Unit 1); there is no `sios/unit2-questions.ts`. `content/modaux-letris.json` (aller/pouvoir/devoir rain set) is not keyed to a Unit 2 deck and is left to the Unit 3/4 audits.

Recurring abbreviations in the evidence column:
- **B-er** = Ceil B, regular -er row: "No -er paradigm box. Used in je/tu/il/vous forms." So *nous aimons, ils aiment* etc. are over.
- **B-faire/aller/vouloir** = Ceil B + Unit 2 rows (Bk p.35, p.37): box has je/tu/il/vous only. *nous faisons* and *ils veulent* are listed as out → OVER. *ils font, nous allons, ils vont, nous voulons* are in the guide test only (Ceil D) → UNCLEAR / ASK DAN.
- **A-U6** = Ceil A: pourquoi/comment/où questions, pouvoir/devoir conjugation, pronominal verbs = Unit 6. **A-U7** = notre/nos/leur/leurs, stressed pronoun after a preposition (*avec nous, chez moi*) = Unit 7.

## 1. Summary

| File | Items checked | Over | Unclear |
|---|---|---|---|
| content/sios/sios.json (SIO-021..030: description, canDo, competence) | 10 | 8 | 2 |
| content/collections/objets-articles.json | 24 | 1 | 6 |
| content/objets-articles.json (word set) | 17 | 1 | 5 |
| content/collections/possessives.json | 37 | 1 | 23 |
| content/possessives.json (word set) | 9 | 1 | 3 |
| content/collections/aimer-activites.json | 25 | 1 | 9 |
| content/aimer-activites-letris.json | 15 | 0 | 7 |
| content/collections/faire-activites.json | 38 | 4 | 18 |
| content/faire-activites.json (word set) | 16 | 1 | 9 |
| content/collections/parce-que.json | 6 | 6 | 0 |
| content/collections/aller-destinations.json | 25 | 16 | 3 |
| content/aller-destinations.json (word set) | 15 | 8 | 3 |
| content/collections/quand-time.json | 26 | 8 | 0 |
| content/quand-time.json (word set) | 12 | 4 | 0 |
| content/collections/negation-pas.json | 24 | 8 | 0 |
| content/collections/vouloir-inviter.json | 19 | 5 | 5 |
| content/pretests/u2-sio021..029.json (9 files) | 71 | 28 | 16 |
| content/finale.ts (`unit: 2`) | 111 | 51 | 20 |
| content/gcompris.ts (6 Unit 2 scenes: 6 texts + 25 questions) | 31 | 6 | 1 |
| content/textgen/unit2.ts (lexicon + 3 scenarios) | ~145 | 13 | 6 |
| content/conjugaison.ts (CONJ_BY_SIO for SIO-023/024/026/029, 36 cells) | 36 | 14 | 4 |
| content/lessonVerbs.ts (SIO-021..030, 23 verbs) | 23 | 4 (+ persons) | 12 |
| content/ateliers.ts SIO-030 model e-mail | 9 | 4 | 2 |
| content/memos.tsx (objets-articles, parce-que, negation-pas cards) | 3 cards | 2 | 0 |
| games/compose/banks.tsx (RENDEZVOUS_BANK, SHOP_BANK) | ~35 | 6 | 4 |
| games/compose/banks-production.tsx (EMAIL_BANK, PRESENT_PERSON_BANK) | ~140 | 11 | 8 |
| lessons/native/qu-est-ce-que-c-est.tsx + .gen.ts | ~45 | 1 | 5 |
| lessons/native/possessifs.tsx | ~45 | 5 | 2 |
| lessons/native/aimer.tsx + .gen.ts | ~50 | 5 | 3 |
| lessons/native/aimer-infinitif.tsx + .gen.ts | ~40 | 4 | 2 |
| lessons/native/conjugaison-er.tsx + .gen.ts | ~40 | 9 | 1 |
| lessons/native/faire.tsx + .gen.ts | ~60 | 5 | 3 |
| lessons/native/parce-que.tsx | ~30 | 30 (whole lesson) | 0 |
| lessons/native/aller.tsx + .gen.ts | ~60 | 8 | 3 |
| lessons/native/quand.tsx | ~40 | 4 | 3 |
| lessons/native/negation.tsx | ~45 | 1 | 2 |
| lessons/native/rendezvous.tsx | ~45 | 4 | 4 |
| lessons/native/modaux.tsx + .gen.ts | ~45 | 6 | 1 |
| lessons/native/atelier-email.tsx | ~20 | 2 | 1 |

## 2. Findings

### content/sios/sios.json
| Where | Text | Beyond the book | Ceil evidence | Proposal |
|---|---|---|---|---|
| SIO-022 (l.360) desc + competence | « notre/votre/leur/leurs », « + notre/votre/leur » | notre, leur, leurs | A-U7; Unit 2 possessifs row, Bk p.33 ("mon…vos only") | SIMPLIFY → "mon/ma/mes, ton/ta/tes, son/sa/ses, votre/vos" |
| SIO-023 (l.377) desc + competence | « conjugate across all persons » / « Conjugate aimer in all persons » | nous/ils of -er | B-er | SIMPLIFY → "je, tu, il/elle, vous" |
| SIO-025 (l.411) whole goal | « Pourquoi ? → parce que… » | pourquoi as a taught point; parce que productive | A-U6; Unit 2 "pourquoi / parce que" row, Bk p.33, p.11 | MOVE → unit 6 (or ASK DAN: keep parce que receptive only) |
| SIO-026 (l.428) desc | « à la plage, à l'école, aux magasins » | école (U3 test only), magasins (U3 Mémo) | Unit 3 lieux row, Bk p.50, G23 test | SIMPLIFY → "au cinéma, à la piscine, à l'opéra, aux toilettes" |
| SIO-027 (l.445) desc + competence | « tous les jours/soirs/matins », « tous les… » | frequency | Unit 2 "les moments" row: *tous les jours* out (frequency is Unit 4), Bk p.36 | SIMPLIFY → "le lundi, le week-end, le matin/le soir, à + heure" |
| SIO-028 (l.462) desc + competence | « pas de/d' after faire, il y a and quantities » | quantities (U4); *il y a* as grammar | Unit 4 quantités row Bk p.62; Unit 2 c'est un row ("il y a as grammar" out) | SIMPLIFY → "pas de after faire; le/la/les after aimer; ne… plus" |
| SIO-029 (l.479) desc + competence | « refuse (Je ne peux pas), reschedule (On peut se voir samedi ?) », « vouloir/pouvoir » | pouvoir; pronominal *se voir* | A-U6; B pouvoir row | SIMPLIFY → refuse « Désolé, je ne suis pas libre », reschedule « Tu es libre dimanche ? » |
| SIO-030 (l.496) desc | « Bon anniversaire! » | not in the box | Unit 2 souhaits row ("Bon anniversaire only in the teacher's patter"), Bk p.40 | SIMPLIFY → "Joyeux anniversaire !" |
| SIO-030 desc + competence | « d'abord, ensuite, aussi, enfin »; « holiday email » | connectors not in ceilings (only *mais*); holiday e-postcard is U3 | Unit 2 aimer row (mais), "Also in Unit 2: courriel form" | UNCLEAR → ASK DAN |
| SIO-021 (l.343) desc + competence | « C'est quoi ? »; « un crayon, un passeport, une carte d'identité » | not in the objets lists; book has *pièce d'identité*, *Qu'est-ce que c'est ?* | Unit 2 objets + c'est un rows, Bk p.32, p.42 | UNCLEAR → ASK DAN (or SIMPLIFY → "une pièce d'identité", "Qu'est-ce que c'est ?") |
| SIO-024 (l.394) desc | « faire de l'équitation » | équitation not in the sports lists | Unit 2 loisirs row, Bk pp.34, 39, 42 | UNCLEAR (SIMPLIFY → "de l'athlétisme") |

### content/collections/objets-articles.json (same nouns in content/objets-articles.json word set)
| Item | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| objets-articles-15 (+ tile RÈGLE) | une règle | listed out | Unit 2 objets row "Long classroom-object lists (règle, taille-crayon, feutre…)", Bk p.42 | CUT (SIMPLIFY → "une valise") |
| -06 crayon, -07 passeport, -08 carte d'identité, -16 écouteurs, -17 mouchoirs, -19 agrafeuse (+ tiles) | | not in the book's object lists | Unit 2 objets row | UNCLEAR → ASK DAN; for -08 SIMPLIFY → "une pièce d'identité" |

### content/collections/possessives.json (+ word set content/possessives.json)
| Item | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| possessives-04 (+ tile POMME) | pomme | food = Unit 4 | Unit 4 aliments row, G4 | SIMPLIFY → "valise" (ma valise) |
| -05,-06,-08,-10…-20 and sentences -22,-23,-25,-27,-30,-31,-33,-35,-36 | père, mère, frère, sœur, grand-père, grand-mère, grands-parents, oncle, tante, cousin(e), famille, parents, maison | family vocabulary is in no ceilings row | — | UNCLEAR → ASK DAN (book's own items: sac, valise, clés, livre, stylo) |

### content/collections/aimer-activites.json (+ aimer-activites-letris.json)
| Item | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| -24 | Nous aimons voyager. | nous form | B-er | SIMPLIFY → "Vous aimez voyager ?" |
| -05, -07, -09, -10, -13, -14, -15, -16, -17 (+ tiles) | jeux vidéo, voyager, dessiner, chanter, courir, nager, écouter de la musique, regarder la télé, sortir | not in the Mémo lists (book: *jeux de société, danser, lire, jardiner, cuisiner*) | Unit 2 loisirs row | UNCLEAR → ASK DAN |

### content/collections/faire-activites.json (+ faire-activites.json)
| Item | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| -10 (+ tile PIANO), -37 | piano / Elle fait du piano. | instruments = Unit 5 | Unit 2 loisirs row ("jouer de + instrument (instruments are Unit 5)") | CUT (SIMPLIFY → "Elle fait de la danse.") |
| -36, -20 | Nous faisons des randonnées. / Nous ne faisons pas de courses. | nous faisons | B-faire, Bk p.35 | SIMPLIFY → "Vous faites…" |
| -23, -24 | Ils/Elles ne font pas… | ils font | Ceil D (guide test only) | ASK DAN |
| -02,-04,-05,-07,-09,-13,-14,-15,-16,-28,-30,-32 (+ -18,-21,-22,-35) | vélo, photographie, équitation, courses, judo, escalade, aviron, promenades, achats, karaté, boxe, escrime | not in the sports/leisure lists | Unit 2 loisirs row, Bk pp.34, 39, 42 | UNCLEAR (in-scope swaps: VTT, musculation, fitness, footing, tennis, gymnastique, couture, bricolage, dessin, sculpture) |

### content/collections/parce-que.json
| Item | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| all 6 | « Pourquoi tu aimes… ? — Parce que… » | pourquoi taught; parce que productive | A-U6; Unit 2 pourquoi row (receptive only) | MOVE → unit 6 / ASK DAN |
| -05 | Parce que c'est calme. | *calme* = U3 adjective | "Also in Unit 3: adjectives… calme" | with the deck |

### content/collections/aller-destinations.json (+ aller-destinations.json)
| Item | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| -02 marché, -08 magasins, -10 parc (+ tiles) | | Unit 3 places | Unit 3 lieux row, Bk p.50, p.56 | SIMPLIFY → théâtre, musée, stade, bar |
| -05 école, -06 hôpital, -11 gare, -12 banque, -14 université (+ tiles) | | U3 guide-test only | Unit 3 lieux row ("test only"), Ceil D | SIMPLIFY → à l'opéra (à l' column), à la patinoire / à la bibliothèque |
| sentences -17 (ex. parc), -18 école, -19 magasins, -20 (ex. université), -22 hôpital, -23 gare, -24 parc (ex. banque), -25 (ex. école) | | same places | same | SIMPLIFY with the in-scope places |
| -19, -22 | Nous allons… / Ils vont… | nous allons, ils vont | Ceil D | ASK DAN |
| -04 plage, -13 aéroport, -15 urgences | | in no row | — | UNCLEAR |

### content/collections/quand-time.json (+ quand-time.json)
| Item | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| -03, -04, -09, -10 (+ 4 tiles), sentences -14, -18, -21; whole FRÉQUENCE column | tous les jours / matins / soirs / week-ends | frequency | Unit 2 moments row: *tous les jours* out (Unit 4); Unit 4 fréquence row | MOVE → unit 4; SIMPLIFY column → "le matin / le soir / l'après-midi" |
| -16 | Nous regardons la télé le week-end. | nous -er | B-er | SIMPLIFY → "Je regarde…" |

### content/collections/negation-pas.json
| Item | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| -03, -18 (examples) | il y a du café → il n'y a pas / plus de café | partitive *du café* (U4); *il y a* as grammar | Unit 4 partitifs row Bk p.60; Unit 2 c'est un row | SIMPLIFY → "Il ne fait pas de sport." / "Il ne fait plus de sport." |
| -09 | Je ne mange pas de chocolat. | manger, chocolat, partitive = U4 | Unit 4 rows Bk pp.60–61 | MOVE → unit 4 |
| -11, -12 | Il n'y a pas d'eau. / l'eau gazeuse | eau = U4 | Unit 4 aliments row | SIMPLIFY → "Il ne fait pas d'athlétisme." / "Je n'aime pas l'opéra." |
| -07 | Nous ne faisons pas de vélo. | nous faisons | B-faire | SIMPLIFY → "Vous ne faites pas de VTT." |
| -10, -14 | Ils n'aiment pas… / Elles adorent… | ils -er | B-er | SIMPLIFY → "Il n'aime pas…" |

### content/collections/vouloir-inviter.json
| Item | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| -02 | Vous voulez manger avec nous ? | *avec nous* (A-U7); manger (U4) | A-U7; Unit 4 manger row | SIMPLIFY → "Vous voulez venir au cinéma ?" |
| -05 | Désolé(e), je ne peux pas. | pouvoir (no box; first incidental *je peux* is U3) | A-U6; B pouvoir; Unit 3 pouvoir row Bk p.48 | SIMPLIFY → "Désolé(e), je ne suis pas libre." |
| -07 | On peut se voir samedi ? | pouvoir + pronominal | A-U6 | SIMPLIFY → "Tu es libre samedi ?" |
| -09 | On se retrouve samedi ? | pronominal | A-U6 | SIMPLIFY → "RDV samedi au cinéma ?" (book: *RDV à 19h au cinéma*, Bk p.37) |
| -15 | Bon anniversaire ! | not in the box | Unit 2 souhaits row, Bk p.40 | SIMPLIFY → "Joyeux anniversaire !" |
| -04, -10, -11, -12, -14 | Oui, bonne idée ! · Plutôt dimanche ? · Ça me convient. · Avec plaisir ! · je suis occupé ce soir | in no row (book replies: *D'accord, OK, Je veux bien, À tout à l'heure, À samedi*) | Unit 2 vouloir row Bk p.37 | UNCLEAR → ASK DAN |

### content/pretests/u2-*.json
| Item | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| u2-sio021-04 | Sur la table, il y a une pomme. (answer « il y a ») | tests *il y a* as grammar; pomme (U4) | Unit 2 c'est un row; Unit 4 aliments | SIMPLIFY → "Dans mon sac, il y a ___ gomme." (answer une) |
| u2-sio021-06 / -08 | il n'y a pas de livre / des crayons | negated *il y a*; crayon | — | UNCLEAR |
| u2-sio022-01 | J'oublie toujours mon livre chez moi. | *toujours* (U4), *chez moi* (A-U7) | Unit 4 fréquence row; A-U7 | SIMPLIFY → "C'est ___ livre." |
| u2-sio022-05 | Je te présente mon amie Camille. | *mon* + feminine vowel | Unit 2 possessifs row ("mon amie … not as a rule") | CUT |
| u2-sio022-06 | Bienvenue dans notre appartement ! | notre | A-U7 | CUT |
| u2-sio022-07 | Madame, montrez votre passeport… (distractor notre) | imperative *montrez*; notre | A (imperative U8); A-U7 | SIMPLIFY → "Madame, c'est ___ valise ?" (answer votre; distractors vos/ton/ta) |
| u2-sio022-08 | Les étudiants écoutent leur professeur. | leur (+ leurs); ils -er | A-U7; B-er | CUT |
| u2-sio022-10 | Tu prends tes affaires ? | prendre = U3 | Unit 3 venir/prendre row Bk p.50 | SIMPLIFY → "Ce sont ___ clés ?" (tes) |
| u2-sio022-02 / -09 | Je voudrais vous présenter ma famille. / Comment va ta copine ? | object pronoun *vous*; *Comment va…*, copine | — | UNCLEAR |
| u2-sio023-06 | Je préfère le cinéma au théâtre. | *préférer X à Y* (préférer receptive only) | Unit 2 aimer row | UNCLEAR → SIMPLIFY → "Je vais ___ théâtre." |
| u2-sio023-02, -03 | musique classique; les chats | not in lists | — | UNCLEAR |
| u2-sio024-03 (answer), -04 (distractor « faisons ») | Nous faisons des promenades… | nous faisons | B-faire | SIMPLIFY → "Vous faites ___" |
| u2-sio024-05 (answer), -02 (distractor « font ») | Mes amis font du foot… | ils font | Ceil D | ASK DAN |
| u2-sio025-01..04 | Pourquoi / Parce que / amusant / calme | whole goal; calme U3 | A-U6; Unit 2 pourquoi row | MOVE → unit 6 |
| u2-sio026-05 | Le patient va à l'hôpital. | hôpital (U3 test only) | Unit 3 lieux row | SIMPLIFY → "Je vais ___ opéra." (à l') |
| u2-sio026-06 | Je vais aux toilettes, je reviens. | revenir | Unit 3 venir row ("revenir … as taught verbs" out) | SIMPLIFY → "Je vais aux toilettes." |
| u2-sio026-07 | L'année prochaine, je vais à Paris. (distractors au/à la/en) | *l'année prochaine* (U4), à + ville / en (U3) | Unit 4 futur proche row; Unit 3 villes et pays row Bk p.47 | MOVE → unit 3 |
| u2-sio026-08 | Tu vas où ? | où as a question | A-U6 | SIMPLIFY → "Tu ___ au cinéma ?" |
| u2-sio026-02, -09, -01 (distractor allons) | Nous allons… / Mes amis vont au concert | nous allons, ils vont | Ceil D | ASK DAN |
| u2-sio027-01 | Le lundi, j'ai français. | school subject | Unit 1 matières row ("no basis") | SIMPLIFY → "Le lundi, je fais du sport." |
| u2-sio027-02 | Je fais du sport tous les soirs. | frequency | Unit 2 moments row | SIMPLIFY → "…le soir." (answer le) |
| u2-sio027-07 | Il est deux heures et demie. | *et demie* | Ceil C ("et demie … OUT") | SIMPLIFY → "Il est neuf heures ___." (answer trente; distractors quinze/quarante-cinq/treize) |
| u2-sio027-08 | Il est midi, on mange ! (distractor « douze heures ») | manger incidental; distractor may be acceptable French | Ceil C | UNCLEAR → SIMPLIFY → "Il est midi." |
| u2-sio028-05 | Nous ne mangeons pas de chocolat. | manger, chocolat, nous -er | Unit 4 rows; B-er | MOVE → unit 4 |
| u2-sio028-06 | Ils n'aiment pas les bonbons. | ils -er | B-er | SIMPLIFY → "Il n'aime pas ___ sport." |
| u2-sio028-07 | Il n'y a pas d'eau. (distractor de l') | eau / partitive = U4 | Unit 4 rows | SIMPLIFY → "Il ne fait pas ___ athlétisme." |
| u2-sio028-03 | Il n'y a pas de café. | negated *il y a* | — | UNCLEAR |
| u2-sio029-02 | Tu veux venir avec nous au cinéma ? (distractor veulent) | *avec nous*; ils veulent | A-U7; Unit 2 vouloir row | SIMPLIFY → "Tu ___ venir au cinéma ?" |
| u2-sio029-03 (distractor), -07 (answer) | veulent / Mes amis veulent partir tôt. | ils veulent | Unit 2 vouloir row (out) | CUT -07; replace distractor |
| u2-sio029-08 (distractor), -09 (answer) | Désolé, je ne peux pas | pouvoir | A-U6; B pouvoir | SIMPLIFY → "Désolé, je ne suis pas libre." |
| u2-sio029-01, -06 | sortir ce soir (distractor voulons) | sortir (U4 example only), nous voulons | Ceil D | UNCLEAR |

### content/finale.ts (`unit: 2`)
| Line / id | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| 32 SIO-023:1 | …J'y vais tous les week-ends. | *y* (U3), frequency | Unit 3 transports+y row; Unit 2 moments row | SIMPLIFY → "J'adore ___ cinéma !" |
| 33 SIO-023:2; 213 SIO-023:9; 426 SIO-028:16 | Nous aimons / nous ___ danser / Nous n'aimons pas | nous -er | B-er | SIMPLIFY → "J'aime…" / "Vous ___ danser ?" |
| 313 SIO-023:10; 424 SIO-027:11 | Elles ___ le chocolat. / Ils travaillent tous les jours. | ils -er; chocolat (U4); frequency | B-er; Unit 4 | SIMPLIFY → "Elle ___ la danse." |
| 37 SIO-028:1 | Je n'aime pas ___ poisson. | food (U4) | Unit 4 aliments | SIMPLIFY → "…___ football." |
| 99 SIO-024:6; 220 SIO-027:6; 321 SIO-027:8 | tous les jours / ___ les jours / tous les samedis et dimanches | frequency | Unit 2 moments row | MOVE → unit 4 (SIMPLIFY 99 → "…le samedi.") |
| 100 SIO-024:7 | Elle fait ___ piano le soir. | instrument (U5) | Unit 2 loisirs row | SIMPLIFY → "…___ danse…" |
| 101 SIO-024:8 | …— Oui, souvent ! | *souvent* (U4) | Unit 4 fréquence row | SIMPLIFY → "— Oui, le samedi !" |
| 113, 115, 316 SIO-024:13/15/19 | Nous faisons… | nous faisons | B-faire | SIMPLIFY → "Vous faites…" |
| 114 SIO-024:14 | …je fais ___ courses au supermarché. | supermarché (U3 test / U4) | Unit 3 lieux row; Unit 4 commerces row | SIMPLIFY → "…je fais ___ exercices." (des, Bk p.35) |
| 119, 120, 122, 123, 124, 425 SIO-028:4/5/7/8/9/15 | ne mange pas de viande / pas de pain / ne buvons pas de café / manges pas de fromage / bois pas d'eau gazeuse / pas de lait dans le frigo | manger, boire, food, partitive negation = U4 | Unit 4 partitifs + aliments rows Bk pp.60–61 | MOVE → unit 4 |
| 137 SIO-027:4 | Nous mangeons ___ midi. | manger, nous -er | Unit 4; B-er | SIMPLIFY → "Rendez-vous ___ midi au café." |
| 142, 421 SIO-026:3/19 | ___ marché | marché (U3) | Unit 3 lieux row | SIMPLIFY → "___ musée" / "___ restaurant" |
| 144 SIO-026:5 | On achète le pain ___ supermarché ? — …à la boulangerie | acheter, pain, supermarché, boulangerie = U4 | Unit 4 commerces row | MOVE → unit 4 |
| 149, 152, 153, 154, 155 SIO-026:8/9/10/11/12 | gare à pied / université / école / hôpital / aéroport en métro | U3 places and transport; nous allons | Unit 3 lieux + transports rows; Ceil D | SIMPLIFY → stade, bibliothèque, patinoire, opéra |
| 159 SIO-026:14 | ___ magasins avec ma sœur | magasins (U3) | Unit 3 lieux row | SIMPLIFY → "___ toilettes" |
| 210 SIO-022:3 | …c'est ___ amie. (mon) | *mon* + feminine vowel | Unit 2 possessifs row | CUT |
| 211, 311 SIO-022:4/5 | c'est ___ chien (leur) / ___ voiture (notre) | leur, notre | A-U7 | CUT |
| 216, 419, 420 SIO-025:1/5/6 | ___ que c'est intéressant / …que j'aime apprendre / Pourquoi tu restes ? | parce que productive; apprendre | A-U6; Unit 3 venir row (apprendre out) | MOVE → unit 6 |
| 217, 317, 318 SIO-025:2/3/4 | ___ tu aimes ce café ? / Pourquoi tu manges ? / …belle terrasse | pourquoi; *ce* (U4); manger (U4) | A-U6; Unit 4 démonstratifs row | MOVE → unit 6 |
| 224 SIO-029:1 | Tu ___ manger avec nous ce soir ? | *avec nous*; manger | A-U7; Unit 4 | SIMPLIFY → "Tu ___ venir au cinéma ce soir ?" |
| 225, 325, 428 SIO-029:2/3/6 | je ne ___ pas venir / je ne ___ pas ce soir / nous ne ___ pas venir (peux, pouvons) | pouvoir; *nous pouvons* listed out | A-U6; Unit 3 pouvoir row | CUT (or SIMPLIFY → "je ne ___ pas libre" → suis) |
| 427 SIO-029:5 | Vous ___ danser avec nous ? | *avec nous* | A-U7 | SIMPLIFY → "Vous ___ danser ce soir ?" |
| 227 SIO-030:2 | D'abord le petit-déjeuner, ___ le travail… | petit-déjeuner (U4) | Unit 4 repas row | SIMPLIFY (and see connectors, UNCLEAR) |
| 309 SIO-021:4 | …il y en a trois ! | pronoun *en* | Unit 3 transports row ("the pronoun en" out); Unit 4 partitifs row | SIMPLIFY → "— Non, ce ___ des stylos." |
| 322 SIO-027:9 | À quelle heure mangez-vous ? | inversion; manger | Unit 3 est-ce que row ("Inversion as grammar" out); Unit 4 | SIMPLIFY → "— C'est à quelle heure ? — ___ midi." |
| 324 SIO-028:14 | Elle n'aime pas ___ maths. | matières | Unit 1 matières row | SIMPLIFY → "___ jeux de société" |
| 412 SIO-021:7 | À qui est ce téléphone ? | *ce* + noun (U4) | Unit 4 démonstratifs row | SIMPLIFY → "— C'est à qui ? — C'est ___ téléphone de Paul." |
| 429 SIO-030:5 | Tu pars en France demain | *en* + country (U3) | Unit 3 villes et pays row | SIMPLIFY → "Tu pars demain : « Bon ___ ! »" |
| 54 SIO-022:2; 208 SIO-021:2 | le livre ___ professeur / C'est ___ sac de Marie | *de* of possession; definite after c'est | — (du only boxed with faire) | UNCLEAR |
| 83 SIO-024:5 | …avec un kimono : c'est le ___ (judo/karaté) | answers not in the sports lists | Unit 2 loisirs row | UNCLEAR → SIMPLIFY → a basket/ski clue |
| 111, 112, 125, 417 | équitation, escalade; 417 Ils font | not in lists; ils font | loisirs row; Ceil D | UNCLEAR / ASK DAN |
| 141, 320 | nous allons / Ils vont | Ceil D | | ASK DAN |
| 221 SIO-027:7 | à 9 h précises | *précises* (like *pile*, not covered) | Ceil C "Not covered: pile" | UNCLEAR |
| 227, 328 SIO-030:2/4 | ensuite / puis / enfin / d'abord | connectors | not in ceilings | UNCLEAR → ASK DAN |
| 148, 422 (plage), 212 (aime beaucoup), 222 (frigo), 226 (passes un examen), 413 (chats), 416 (voyager), 430 (On mange !) | | in no row | — | UNCLEAR |

### content/gcompris.ts (receptive; flagged where an answer, a WHY, or a clear text feature is past the book)
| Line | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| 231, q1 at 242 | « Je suis au Portugal » → answer le Portugal; WHY teaches au/en + country | prepositions with countries = U3 | Unit 1 pays row ("Prepositions with countries: Unit 3"); Unit 3 villes row Bk p.47 | MOVE → unit 3 |
| 447, q2 at 463 | « J'ai trois cours : anglais, histoire et informatique » → answer informatique | matières | Unit 1 matières row | SIMPLIFY → "…je fais du sport, de la danse et de la natation. Je n'aime pas la natation…" |
| 324, q4 at 351 | « Alors à 2 heures » (meaning 14h) → answer 2 heures | 12-hour clock for the afternoon | Ceil C (24-hour clock only) | SIMPLIFY → "à 14 heures" |
| 277 | « On mange à la maison à 7 heures » (evening) | 12-hour clock | Ceil C | SIMPLIFY → "à 19 heures" |
| 89 | « Nous partons à 8 heures » (evening) | 12-hour clock | Ceil C | SIMPLIFY → "à 20 heures" |
| 414 | « Notre numéro : 04 78 62 09 31 » | notre (U7); 78 (U4 numbers) | A-U7; Unit 4 nombres row | SIMPLIFY → "Le numéro : 04 38 62 09 31" |
| 295 (q2) | answer « chez Julien », WHY teaches chez | chez receptive only, never a drill target | Unit 2 aller row | UNCLEAR → ASK DAN |

### content/textgen/unit2.ts (listening texts, ÉcouTexte)
| Line | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| 51 | PIANO | instrument (U5) | Unit 2 loisirs row | CUT |
| 112 | « tous les jours » | frequency | Unit 2 moments row | CUT (→ "le matin") |
| 159, 164, 169, 186 | parc, marché, magasins | U3 places | Unit 3 lieux row | SIMPLIFY → stade, musée, théâtre |
| 301 | « Et toi, qu'est-ce que tu fais … ? » | qu'est-ce que + verb = U3 box | Unit 3 est-ce que row Bk p.48 | CUT (keep the « tu fais quoi » variant) |
| 382, 388, 444 | « … avec nous ? » | stressed pronoun after preposition | A-U7 | SIMPLIFY → drop "avec nous" |
| 397, 401, 405, 451, 455, 501 | « On se retrouve … » | pronominal | A-U6 | SIMPLIFY → "RDV à 19 heures au cinéma." |
| 470, 472 | « Désolé, je ne peux pas » | pouvoir | A-U6; B pouvoir | SIMPLIFY → "Désolé, je ne suis pas libre." |
| 485 | « On peut se voir … ? » | pouvoir + pronominal | A-U6 | CUT (keep "Tu es libre … ?") |
| 495 | « À bientôt ! » | first appears U3 | Bienvenue salutations row (À bientôt = U3) | SIMPLIFY → "À samedi !" / "À tout à l'heure !" |
| 261 | « Pourquoi ? Parce que … » | pourquoi heard (receptive) | A-U6; Unit 2 pourquoi row | UNCLEAR |
| 89–90, 154/185, 183, 242/349/482, 497/500 | dormir, sortir; plage; manger; J'aime beaucoup; Ça me convient | in no row | — | UNCLEAR |

### content/conjugaison.ts (ConjugaZone tables show all 6 persons; CONJ_BY_SIO l.110–113)
| Line | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| 110 → 42 (+ parler, habiter) | aimons/aiment, parlons/parlent, habitons/habitent | nous/ils -er | B-er | SIMPLIFY → hide nous/ils rows for Unit 2 |
| 111 → 38 | faisons | out | B-faire | hide; *font* ASK DAN |
| 112 → 37 | allons, vont | Ceil D | | ASK DAN |
| 113 → 78 | veulent (out); voulons (Ceil D) | | Unit 2 vouloir row | hide veulent; ASK DAN voulons |
| 113 → 79 | pouvoir, all 6 | no box before Unit 6 | A-U6; B pouvoir | CUT from SIO-029 |

### content/lessonVerbs.ts (ConjugaZone deck per lesson, l.66–107)
| Line | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| 84–86 SIO-025 | comprendre, apprendre | listed out even in U3 | Unit 3 venir/prendre row | CUT |
| 100–102 SIO-029 | pouvoir | A-U6 | B pouvoir | CUT |
| 80–82 SIO-024 | lire (conjugated: *je lis* first in U3 box) | later unit | Unit 3 est-ce que row | MOVE → unit 3 |
| all -er verbs (aimer, adorer, détester…) | nous/ils cells | B-er | | hide nous/ils |
| 66–107 | utiliser, porter, perdre, oublier, regarder, jouer, écouter, courir, commencer, finir, dire, écrire | no box; *jouer au* never boxed | Unit 2 faire row; B | UNCLEAR → ASK DAN |

### content/ateliers.ts SIO-030 model e-mail (feeds atelier-email lesson + atelier-sio-030 deck)
| Line | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| 52 | Et toi, qu'est-ce que tu fais ? | U3 box | Unit 3 est-ce que row | SIMPLIFY → "Et toi, tu fais quoi ?" |
| 53 | …bon anniversaire ! | not in box | Unit 2 souhaits row | SIMPLIFY → "joyeux anniversaire !" |
| 55 | Tu vas à Paris avec ta famille ? | à + ville (U3) | Unit 3 villes row | SIMPLIFY → "Tu pars en vacances ? Bon voyage !" (*Bonnes vacances* is in the box) |
| 56 | Bonne journée et à bientôt ! | À bientôt = U3 | Bienvenue salutations row | SIMPLIFY → "Bonne journée et à samedi !" |
| 50, 54 | Merci pour ton message / Bonne chance pour ton examen | *pour*, examen | — | UNCLEAR |

### content/memos.tsx
| Line | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| 379–386 parce-que card | Pourquoi… — Parce qu'il fait beau; « parce qu'il » | pourquoi; weather (U3); que → qu' as a rule | A-U6; Unit 3 météo; Unit 2 élision row | MOVE → unit 6 |
| 396, 399 negation-pas card | Il y a du café → … pas de café; pas d'eau | partitive + food (U4) | Unit 4 partitifs row | SIMPLIFY → "Je fais de l'athlétisme → Je ne fais pas d'athlétisme." |

### games/compose/banks.tsx
| Line | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| 465 | « Désolé, je ne peux pas » | pouvoir | A-U6 | SIMPLIFY → "Désolé, je ne suis pas libre" |
| 466 | « On peut se voir samedi », « On se retrouve où ? » | pouvoir, pronominal, où | A-U6 | SIMPLIFY → "Tu es libre samedi ?", "C'est à quelle heure ?" |
| 467 | « s'il te plaît » | first in U4 | Unit 1 politesse row | CUT |
| 467 | « à bientôt » | U3 | Bienvenue salutations row | SIMPLIFY → "à samedi" |
| 507 OBJET_NOMS | includes règle (+ crayon, passeport, écouteurs, mouchoirs, agrafeuse) | see objets deck | Unit 2 objets row | follows the deck fix |
| 465, 517, 529 | « Une autre fois », « Regardez ce que j'ai ici », « Je ne sais pas », « C'est quoi ? » | in no row | — | UNCLEAR |

### games/compose/banks-production.tsx
| Line | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| 238 | « Bon anniversaire », « Félicitations » | not in box / listed out | Unit 2 souhaits row | SIMPLIFY → "Joyeux anniversaire", "Bonne santé" |
| 239 | « Je suis à » + Paris, Nice, Singapour | à + ville (U3) | Unit 3 villes row | MOVE → unit 3 (POSTCARD_BANK already covers it) |
| 241 | « On peut » | pouvoir | A-U6 | CUT |
| 242 | « À bientôt », « Écris-moi » | U3; imperative (U8) | Bienvenue salutations; A | SIMPLIFY → "À samedi" |
| 561 | « à l'université » | U3 test only | Unit 3 lieux row | CUT |
| 564 | « avec moi » | A-U7 | | SIMPLIFY → "avec ses amis" |
| 578 | « parce que » chip | productive parce que | Unit 2 pourquoi row | CUT |
| 606 | « …et il va où ? » | où question | A-U6 | SIMPLIFY → "Il va au stade ou au théâtre ?" |
| 607 | « Et qu'est-ce qu'il ne fait plus ? » | qu'est-ce que + verb (U3) | Unit 3 est-ce que row | SIMPLIFY → "Il ne fait plus quoi ?" |
| 237 | d'abord, et puis, alors, enfin | connectors | not in ceilings | UNCLEAR |
| 238, 242, 236 | Bon rétablissement; Amitiés, Bises; Cher/Chère | not in box/rows | Unit 2 souhaits row | UNCLEAR |
| 211–214 | occasions: examen, déménagement, holiday note | — | — | UNCLEAR |
| 494–501 CAST | frère, sœur, voisin, cousine, coéquipière, « meilleur(e) ami(e) », étudiant(e) | family words; *meilleur* (superlative out in U4) | Unit 4 appréciation row | UNCLEAR → ASK DAN |

### Lessons (lessons/native/)
| Where | Text | Beyond | Ceil | Proposal |
|---|---|---|---|---|
| qu-est-ce-que-c-est.gen.ts:42 | règle | listed out | Unit 2 objets row | CUT |
| qu-est-ce-que-c-est.tsx:38–66, 97, 125–128; .gen.ts kind "pronom" | « C'est un sac → Il est là » (il/elle/ils/elles for objects) | not in the c'est box | Unit 2 c'est un row | UNCLEAR → ASK DAN |
| qu-est-ce-que-c-est.gen.ts:39, 50, 51, 64 | crayon, écouteurs, mouchoirs, une étudiante | — | | UNCLEAR |
| possessifs.tsx:24, 26–27, 30, 42, 44 (OWNERS, ALL_POSS, ROWS → memo table + dice) | à nous / à eux / à elles; notre, nos, leur, leurs | A-U7; guide table is « à moi, à toi, à lui/elle, à vous » | Unit 2 possessifs row, G23 p.70 | CUT those rows |
| possessifs.tsx:58, 78, 110, 113–114, 149 | "fém. + voyelle" column; « mon agrafeuse » | *mon* + feminine vowel not a rule | Unit 2 possessifs row | CUT |
| possessifs.tsx:151, 154, 156 | notre ordinateur / nos lunettes / leurs ciseaux | A-U7 | | CUT |
| possessifs.tsx:12, 13, 16, 109 | agrafeuse, écouteurs, affaires, voiture | | | UNCLEAR |
| aimer.tsx:102, 105 | Nous détestons… / Ils adorent… | B-er | | SIMPLIFY → vous / il |
| aimer.tsx:108; aimer.gen.ts:30 | piano | instrument (U5) | Unit 2 loisirs row | CUT |
| aimer.gen.ts:17–18 | SUBJECTS Nous, Ils, Elles | B-er | | CUT those subjects |
| aimer.tsx:30, 32; aimer.gen.ts:31, 37 | l'art, films d'horreur, chant, concerts | | | UNCLEAR |
| aimer-infinitif.tsx:26 | full paradigm « nous aimons … ils aiment » | B-er | | SIMPLIFY → 4 persons |
| aimer-infinitif.tsx:42, 49; .gen.ts:16–17 | Nous adorons / Elles adorent; SUBJECTS nous/ils | B-er | | SIMPLIFY |
| aimer-infinitif.gen.ts:26–36 | distractor nouns: la cuisine, les voyages, le chant, la course à pied, la télévision, les sorties, le sommeil; sortir, dormir | not in lists | | UNCLEAR |
| conjugaison-er.tsx:20 | full -er paradigm (parlons, parlent) | B-er | | SIMPLIFY → 4 persons |
| conjugaison-er.gen.ts:39–44 (IRR_MEMO) → tsx:25 | pouvoir column; faisons; veulent | A-U6; B | | CUT pouvoir column, nous/ils rows |
| conjugaison-er.tsx:53, 56, 59 | Elle peut… / Vous pouvez venir demain / Ils ne peuvent pas… | pouvoir | A-U6 (vous pouvez is U4 conseil box) | CUT |
| conjugaison-er.tsx:54, 55 | Nous parlons français. / Ils habitent en France. | B-er; *en* + country (U3) | B-er; Unit 3 villes row | SIMPLIFY → "Vous parlez français." / "Il habite à …" → MOVE |
| conjugaison-er.tsx:61 | Nous voulons aller au parc. | parc (U3); nous voulons (D) | Unit 3 lieux | SIMPLIFY → "Je veux aller au musée." |
| conjugaison-er.gen.ts:17–18, 29–30 | SUBJECTS nous/ils; faire/aller nous/ils forms | B | | ASK DAN (allons/vont/font) / CUT (faisons, -er) |
| faire.tsx:27, 32, 157, 163; faire.gen.ts:26, 32 | Nous faisons… / paradigm incl. faisons | B-faire | | SIMPLIFY → vous |
| faire.tsx:29, 32, 158, 164 | Ils font des arts martiaux / Elles font… | ils font (D); arts martiaux | Ceil D | ASK DAN |
| faire.gen.ts:43, 48–51 | chant; arts martiaux, chansons, livres, BDs, films, vidéos (with *des*) | not in lists | | UNCLEAR |
| parce-que.tsx (whole: REASONS l.47–53, concept, memo l.200–229, dice, bonus) | « Pourquoi … ? — Parce que … » | pourquoi taught, parce que productive | A-U6; Unit 2 pourquoi row | MOVE → unit 6 |
| aller.tsx:31; aller.gen.ts:54 | à l'école | U3 test only | Unit 3 lieux row | SIMPLIFY → "à l'opéra" |
| aller.tsx:33, 98; .gen.ts:56 | aux magasins | U3 | Unit 3 lieux row | SIMPLIFY → "aux toilettes" |
| aller.tsx:101; .gen.ts:45 | au parc | U3 | Unit 3 lieux row | SIMPLIFY → "au musée" |
| aller.gen.ts:49 | supermarché | U3 test / U4 | Unit 4 commerces row | CUT |
| aller.tsx:39; aller.gen.ts:59–62, 70–72 | chips « chez moi, chez un ami, chez le médecin »; dice drills chez as a prep slot | chez never a drill target; *chez moi* A-U7 | Unit 2 aller row | CUT |
| aller.tsx:21, 98, 100, 105; .gen.ts:35–38 | nous allons / ils vont | Ceil D | | ASK DAN |
| aller.tsx:100, 102; .gen.ts:52–53, 55, 58 | plage, en ville, montagne, église | | | UNCLEAR |
| quand.tsx:47, 126 | « Quelle heure est-il ? » | inversion; book gives *Quelle heure il est ? / Il est quelle heure ?* | Unit 2 l'heure row Bk p.36; Unit 3 est-ce que row | SIMPLIFY → "Quelle heure il est ?" |
| quand.tsx:52, 67–103 (whole concept), 150; dice randH() 1 | « Il est une heure (cinq) », « why une heure has no -s » | *une heure* never shown | Ceil C ("une heure (singular) is never shown") | CUT (dice: hours 2–23 + midi/minuit) |
| quand.tsx:57 | « la nuit » | listed out | Unit 2 moments row | SIMPLIFY → "le week-end" |
| quand.tsx:54, 96, 151; dice randH() 0 | « zéro heure trente » | book says *minuit* | Ceil C | UNCLEAR → SIMPLIFY → "minuit" |
| quand.tsx:144 | « Il est douze heures. » | book: *Il est midi* for 12h | Ceil C | UNCLEAR → ASK DAN |
| quand.tsx:16, 27 | « vingt et une heures », minutes « … et une » | feminine agreement not shown | Ceil C | UNCLEAR |
| negation.tsx:90 | flow « me · te · se · y are part of it » | *y* (U3), pronominal family (U6) | Unit 3 y row; A-U6 | SIMPLIFY → "m', t', s' (s'appeler) are part of it" |
| negation.tsx:16, 44, 48–49, 135 | « Il y a un chat → Il n'y a pas de chat » | *il y a* as grammar | Unit 2 c'est un row | UNCLEAR |
| rendezvous.tsx:18, 63, 82, 119, 200, 204 | « On se retrouve … ? » | pronominal | A-U6 | SIMPLIFY → "Tu veux venir au cinéma samedi soir ?" (Bk p.37) |
| rendezvous.tsx:20, 25, 71, 207 | « On peut se voir… », « On peut se retrouver plus tard ? » | pouvoir + pronominal | A-U6 | CUT |
| rendezvous.tsx:32–33 | « Désolé, je ne peux pas. » (dice slot "peux") | pouvoir | A-U6 | SIMPLIFY → "Désolé, je ne suis pas libre." |
| rendezvous.tsx:24, 28, 34, 40 | Plutôt…, occupé, Ce n'est pas possible, Ça me convient | in no row | | UNCLEAR |
| modaux.tsx:15–32, 49–91; .gen.ts:31–32 | devoir column, « Nous devons partir », whole il faut/devoir concept | devoir absent until Unit 6 | A-U6; B devoir; Unit 4 devoir row | CUT for SIO-029 |
| modaux.tsx:22–32, 42; .gen.ts:25–26 | pouvoir paradigm; « Ils ne peuvent pas venir » | A-U6 | B pouvoir | CUT for SIO-029 |
| modaux.tsx:36–37, 60 | « il faut + infinitive », « Il faut boire de l'eau » | U4 | Unit 4 devoir+conseil row Bk p.65 | MOVE → unit 4 |
| modaux.tsx:102, 104, 106, 108, 110 | peut / pouvez / peuvent / peux / pouvons | A-U6 | | CUT |
| modaux.tsx:105, 109; .gen.ts:22, 37 | Nous voulons aller au parc / Elles veulent…; aller au parc | veulent out; parc U3; voulons (D) | Unit 2 vouloir row | SIMPLIFY |
| atelier-email.tsx:48, 57 | « bon anniversaire » | not in box | Unit 2 souhaits row | SIMPLIFY → "joyeux anniversaire" |
| atelier-email.tsx:99 | « à bientôt » | U3 | Bienvenue salutations row | SIMPLIFY → "à samedi" |
| atelier-email.tsx:77, 90 | « bonne chance pour (ton examen) » | pour | | UNCLEAR |

## 3. Whole-goal issues

1. **SIO-025 « Pourquoi ? Parce que »** — the book teaches no pourquoi question until Unit 6 (Bk p.11), and *parce que* appears only receptively in Unit 2 (Bk p.33, G23 act.3b). Its deck, pretest, lesson, memo card, 6 Finale items and the « parce que » chips all drill a point the book has not taught. MOVE → unit 6, or ASK DAN whether to keep *parce que* as listen-only.
2. **SIO-029 relies on pouvoir and on pronominal verbs.** « Je ne peux pas », « On peut se voir », « On se retrouve » carry the refuse and reschedule steps. Pouvoir is not conjugated until Unit 6, and pronominal verbs other than s'appeler are Unit 6. The `modaux` lesson adds a full devoir table and *il faut*, and devoir is in no unit up to 4. The book's own Unit 2 kit is *Tu veux venir ? Tu es libre samedi soir ? RDV à 19h au cinéma. D'accord / Je veux bien / À tout à l'heure / À samedi* (Bk p.37).
3. **SIO-022 includes notre/nos/leur/leurs and « mon + feminine noun with a vowel ».** Both are Unit 7, or never stated as a rule (Bk p.33).
4. **Persons beyond the box, app-wide in Unit 2.** SIO-023 promises "all persons" of aimer, but the book has no -er paradigm (Ceil B). faire/aller/vouloir show all 6 persons in ConjugaZone, conjugaison-er, faire, aller and modaux. *nous faisons* and *ils veulent* are out. *ils font, nous allons, ils vont, nous voulons* appear in the guide test only. **ASK DAN** for that set.
5. **SIO-027's frequency half (« tous les jours/soirs/matins »)** is Unit 4. The `quand` lesson does not drill the goal's own points (*le lundi*, *à + heure*). Instead it teaches *une heure / zéro heure* and *Quelle heure est-il ?*, none of which the book shows (Ceil C).
6. **SIO-026's place list is mostly Unit 3** (parc, marché, magasins) **or Unit 3 test-only** (école, hôpital, gare, banque, université), so the whole « à l' » column has no in-scope noun except *opéra*. It also drills *chez* as a choice, which the book uses only receptively.
7. **SIO-028 leans on Unit 4 food and partitives** (*il y a du café, pas de chocolat / viande / pain / eau*, *manger / boire*), and its description promises "quantities" (Unit 4).
8. **SIO-030** wishes *Bon anniversaire*, which is not in the box (the box has *Joyeux anniversaire*). The goal grades connectors (*d'abord, ensuite, enfin*) that the ceilings file never places in Units 0–2 (UNCLEAR). The model e-mail and chips use *à + ville*, *à bientôt* and *qu'est-ce que tu fais*, all Unit 3.
9. **Family vocabulary** (père, mère, frère, sœur, oncle, tante, cousin…) carries most of the possessives deck and the « Présenter quelqu'un » cast, but no ceilings row covers it. ASK DAN whether the book teaches family in Units 0–2.
