# Unit 1 « C'est qui ? » (SIO-011 to SIO-020): content checked against the book's limits

All paths are relative to `/home/user/fluoduo/src/`. The "ceilings" file is `scratchpad/scope/ceilings.md`, and each finding cites the row and book page it relies on. Items from Bienvenue and Unit 1 count as in scope. Items from Units 2–8 count as over.

**The three verdicts:**
- **OVER**: the ceilings file names the form as out of scope, or places it in a later unit.
- **NOT LISTED**: a word missing from the ceilings row's own list of the book's words for that piece (box + Mémo + activities + answer keys). This means the book does not cover it as vocabulary.
- **UNCLEAR**: the ceilings file does not decide it.

Distractors are flagged only when they use vocabulary or grammar from later units.

## 1. Summary

| file | items checked | over (OVER) | not listed | unclear |
|---|---|---|---|---|
| content/sios/sios.json (SIO-011..020) | 10 | 6 | 0 | 2 |
| content/collections/stress-pronouns.json | 12 | 4 | 0 | 0 |
| content/collections/professions.json | 33 | 0 | 7 | 10 |
| content/collections/matieres.json | 16 | 16 | 0 | 0 |
| content/collections/etre-etudiant.json | 14 | 0 | 0 | 14 |
| content/collections/countries-letris.json | 26 | 0 | 13 | 0 |
| content/collections/nationalities.json | 26 | 2 | 13 | 0 |
| content/collections/languages.json | 19 | 19 | 0 | 0 |
| content/collections/numbers-20-69.json | 15 | 0 | 0 | 0 |
| content/collections/avoir-etats.json | 31 | 7 | 0 | 2 |
| content/avoir-etats.json (Letris tiles) | 16 | 6 | 0 | 0 |
| content/countries-letris.json (tiles) | 27 | 0 | 16 | 0 |
| content/countries-expert-letris.json | 185 | 1 (whole set) | — | — |
| content/languages-letris.json | 19 | 19 | 0 | 0 |
| content/matieres.json (tiles) | 16 | 16 | 0 | 0 |
| content/nationalities-letris.json | 24 | 4 | 3 | 0 |
| content/numbers-20-69-letris.json | 15 | 0 | 0 | 0 |
| content/professions.json (tiles) | 16 | 0 | 1 | 5 |
| content/stress-pronouns.json (tiles) | 12 | 0 | 0 | 0 |
| content/pretests/u1-sio011.json | 10 | 5 | 0 | 1 |
| content/pretests/u1-sio012.json | 10 | 1 | 1 | 2 |
| content/pretests/u1-sio013.json | 31 | 31 | 0 | 0 |
| content/pretests/u1-sio014.json | 10 | 3 | 2 | 1 |
| content/pretests/u1-sio015.json | 25 | 0 | 13 | 0 |
| content/pretests/u1-sio016.json | 8 | 8 | 0 | 0 |
| content/pretests/u1-sio017.json | 9 | 6 | 0 | 1 |
| content/pretests/u1-sio018.json | 7 | 2 | 0 | 0 |
| content/pretests/u1-sio019.json | 10 | 5 | 0 | 2 |
| content/ateliers.ts SIO-020 (+ pretests/ateliers.gen.ts, which reuses it) | 6 | 3 | 0 | 2 |
| content/finale.ts (unit 1 items) | 61 | 39 | 2 | 9 |
| content/gcompris.ts (unit-1 scenes: 4 texts + 18 questions) | 22 | 9 | 0 | 1 |
| content/textgen/unit1.ts (title + sentence templates) | 53 | 11 | 1 | 5 |
| games/compose/banks.tsx `greetings` (unit 1) | 19 | 6 | 0 | 4 |
| games/compose/banks-production.tsx `presenter-pays` | 47 | 19 | 0 | 5 |
| lessons/native/moi-aussi(.gen).ts(x) | 39 | 6 | 0 | 2 |
| lessons/native/professions.tsx | 34 | 9 | 3 | 1 |
| lessons/native/quelle-matiere(.gen).ts(x) | 30 | 30 | 0 | 0 |
| lessons/native/conjugaison-u1(.gen).ts(x) | 51 | 7 | 0 | 1 |
| lessons/native/negation.tsx (2nd lesson on SIO-014) | 35 | 5 | 0 | 0 |
| lessons/native/articles-pays.tsx | 30 | 2 | 1 | 0 |
| lessons/native/quel-prefere(.gen).ts(x) | 45 | 12 | 0 | 1 |
| lessons/native/nationalities(.gen).ts(x) | 36 | 5 | 1 | 0 |
| lessons/native/langues-pays(.gen).ts(x) | 40 | 14 | 1 | 0 |
| lessons/native/nombres-echanges(.gen).ts(x) | 60 | 13 | 0 | 2 |
| lessons/native/avoir-etats(.gen).ts(x) | 30 | 7 | 0 | 0 |
| lessons/native/atelier-pays.tsx (concept) | 6 | 1 | 0 | 1 |
| lessons/native/revisions.tsx `revision-u1` | 6 | 3 | 0 | 0 |
| content/memos.tsx (Unit 1 deck cards) | 20 | 6 | 0 | 0 |
| content/transfer.ts (nationalities, SIO-016) | 8 | 0 | 0 | 3 |
| content/conjugaison.ts (CONJ_BY_SIO for SIO-014 and SIO-019) | 3 | 0 | 0 | 0 |

## 2. Findings

### Goal descriptions: content/sios/sios.json
| where | text | what goes beyond the book | ceilings evidence | proposal |
|---|---|---|---|---|
| sios.json:173 SIO-011 description | "after a preposition" | stressed pronoun after a preposition | U1 pronoms toniques, Out column: "Pronoms toniques (2) et les prépositions", Unit 7 (Bk p.18, p.28) | SIMPLIFY → "after c'est, or to insist (Moi, je…)" |
| sios.json:173 SIO-011 canDo | "moi aussi, moi non plus" | aussi / non plus is not in the row | U1 pronoms toniques In column has only "pour insister", Moi, je…, Et toi ? | UNCLEAR, ASK DAN |
| sios.json:190 SIO-012 description and competence | "C'est un/une ___" | C'est un + profession taught as a rule | U1 professions, Out column: "C'est un acteur vs Il est acteur as a rule"; un/une is the U2 box (Bk p.32) | SIMPLIFY → "il est / elle est + profession" |
| sios.json:207 SIO-013 | "les matières… Qu'est-ce que tu étudies ? / Je suis étudiant(e) en ___" | the whole topic; qu'est-ce que | U1 matières: "no basis in the book for a matières piece" (Bk p.25); qu'est-ce que is U3 (Bk p.48) | CUT the goal (see §3) |
| sios.json:241 SIO-015 canDo | "ask which country someone prefers" | préférer | U2 aimer row, Out column: "préférer as taught (incidental only)" | SIMPLIFY → "ask which countries someone knows (Tu connais quels pays ?)" |
| sios.json:275 SIO-017 | "Name languages linked to 25 countries" | a list of language names | U1 langues: "No box… only parler + langue… out: a language-name list" (Bk p.24) | SIMPLIFY → "Tu parles quelles langues ? / Je parle X" with the book's 6 languages |
| sios.json:309 SIO-019 description | "être (triste, fatigué, content)" | content | U1 avoir row: "Je suis content(e) appear only in the guide's test answer key" | SIMPLIFY → "triste, fatigué(e), en forme, malade" |
| sios.json:326 SIO-020 | "location… one cultural fact" | saying where a country is needs *en Europe* (U3) | U3 villes et pays: continents only incidental; prepositions with countries are U3 | UNCLEAR, ASK DAN (the competence may be impossible without U3) |

### Decks (collections and Letris word sets)
| where | text | what goes beyond the book | ceilings evidence | proposal |
|---|---|---|---|---|
| collections/stress-pronouns.json:130,154,166,178 (items 08, 10, 11, 12) | frames "___ nous appelons…", "___ s'appellent…" | s'appeler with nous and ils/elles | Bienvenue s'appeler: "4 persons only… Out: nous nous appelons, ils s'appellent" (Bk p.18) | SIMPLIFY → être frames "___ sommes…", "___ sont…" |
| collections/professions.json:228,253,290,303 (+ items 28–30) | artiste, médecin, musicien(ne) | not in the book's profession list | U1 professions In column (Bk p.18, p.28, answer keys) | SIMPLIFY → photographe, pâtissier, écrivain(e), professeur(e), footballeur |
| collections/professions.json items 06,08,10,19,23,27 | joueuse, nageuse, chanteuse, serveuse | feminine -euse forms; the book lists only the masculine | U1 professions: feminine-formation rules are never boxed | UNCLEAR, ASK DAN |
| collections/professions.json 11,12,32,33; whole etre-etudiant.json | étudiant(e) | étudiant is not in any ceilings row | — | UNCLEAR, ASK DAN (the whole SIO-014 deck rests on it) |
| collections/matieres.json (all 16); matieres.json tiles (all 16) | français, dessin, géographie… | school subjects | U1 matières (Bk p.25) | CUT |
| collections/countries-letris.json: Indonésie, Corée, Mexique, Cuba, Philippines, Turquie, Cambodge, Singapour, Malaisie, Thaïlande, Angleterre, Grande-Bretagne, Tunisie | — | countries the book does not list (the book has the EU, Maroc, Liban, Canada, etc.) | U1 pays + article lists (Bk p.20, p.28; G01 p.44–45) | ASK DAN (likely deliberate for Singapore learners) |
| countries-letris.json tiles: Madagascar, Suriname, Mexique, Mozambique, Cambodge, Belize, Zimbabwe, Corée, Irak, Équateur, Angleterre, Écosse, Philippines, Émirats arabes unis, Singapour, Cuba | — | same issue (16 tiles) | same | ASK DAN, or SIMPLIFY → the book's list (Chypre and Malte already cover the ∅ article) |
| countries-expert-letris.json:4 | "niveau expert, hors programme" (185 countries) | 185 countries, beyond any list | same | ASK DAN (keep as a shop extra, labelled off-syllabus?) |
| collections/nationalities.json:211,226; nationalities-letris.json:121,133,139 | grec/grecque, turc/turque | irregular feminines | U1 nationalités, Out column: "Irregular feminines (grec/grecque, turc/turque)" (Bk p.21) | CUT |
| collections/nationalities.json: portugais, indonésien, mexicain, cubain, philippin, argentin, cambodgien, singapourien, malaisien, thaïlandais, britannique, tunisien, algérien | — | vocabulary not in the book's list; the rules are in scope | U1 nationalités list (Bk p.21, p.24, p.28) | ASK DAN (the book has libanais, italien, luxembourgeois, brésilien, which the deck lacks) |
| collections/languages.json (all 19) | "l'anglais", "le hindi", "le tamoul"… | language names learned with their article, as a list | U1 langues, Out column: "A language-name list; parler le français" (Bk p.24) | SIMPLIFY → bare after parler, with the book's français, anglais, espagnol, italien, danois, japonais |
| languages-letris.json:10,15 (all 19 tiles) | prefix "Je parle le " / "Je parle l'" | *parler le français* | U1 langues, Out column: "parler le français" | SIMPLIFY → drop the prefix ("le français") or CUT the set |
| collections/avoir-etats.json:97,109; avoir-etats.json:48,54 | envie, besoin (avoir envie de / besoin de) | U3 "Exprimer une envie, un besoin" | U3 vouloir / avoir besoin de (Bk p.54) | MOVE → unit 3 |
| collections/avoir-etats.json:169,228 (+ subtitle :4); avoir-etats.json:84,114 | calme, calmes | U3 adjective | Also in Unit 3 adjectives: "calme" | SIMPLIFY → "en forme" (U1 être list) |
| collections/avoir-etats.json:134,193, item 25; avoir-etats.json:66,96 | content(s), "Ils sont contents." | test answer key only | U1 avoir row: "Je suis content(e)… only in the guide's test answer key" | ASK DAN (or SIMPLIFY → triste / en forme) |
| collections/avoir-etats.json:343,356 | "en retard", "Pardon, je suis en retard !" | not in any row | — | UNCLEAR |

### Pre-tests
| where | text | what goes beyond the book | ceilings evidence | proposal |
|---|---|---|---|---|
| u1-sio011-03/-04/-05 (json:45,63,81) | "Je suis avec lui", "Je parle avec elle", "J'étudie avec eux… dans mon groupe" | stressed pronoun after a preposition; *mon* | U1 pronoms toniques Out column (U7); U2 possessifs (Bk p.33) | SIMPLIFY → "C'est Marc ? Oui, c'est lui." / "Lui, il est mexicain." |
| u1-sio011-09 (:141) | "ces croissants sont pour vous" | ces; croissant; pour + pronoun | U4 démonstratifs ("ces" unclear/out); U4 aliments; U1 pronoms Out column | SIMPLIFY → "— Vous êtes français ? — Nous, oui !" |
| u1-sio011-10 (:159) | "Eux, ils sont dans mon groupe." | mon (U2); dans (U3) | U2 possessifs; U3 prépositions de lieu (Bk p.49) | SIMPLIFY → "Eux, ils sont étudiants." |
| u1-sio011-01 | "Qui est là ?" | *là* | — | UNCLEAR |
| u1-sio012-09 (:155) | "Elle est boulangère." (distractor: boulangerie) | shopkeeper nouns; U4 shop | U4 commerces, Out column: "Shopkeeper nouns (le boulanger…)" | SIMPLIFY → "Elle est photographe." |
| u1-sio012 distractors | cuisine, chanson, jeu, style, journal | vocabulary not in any row | — | UNCLEAR (low priority) |
| u1-sio013 (all 31) | "J'étudie le droit / la comptabilité / la science des données…", "étudiant en droit" | matières | U1 matières (Bk p.25) | CUT |
| u1-sio014-04 (:63) | "On est étudiants à NUS." | on = nous, with plural agreement | Unit 2 "Also": "the pronoun on = nous" | SIMPLIFY → "Nous sommes étudiants." |
| u1-sio014-05 (:81) | "Nous sommes dans la même classe." | dans (U3) | U3 prépositions de lieu (Bk p.49) | SIMPLIFY → "Nous sommes étudiants." |
| u1-sio014-09 (:153) | "Le café ? Il est fermé aujourd'hui." | aujourd'hui | U2 moments box (Bk p.36); Bienvenue Out column | SIMPLIFY → "Le café ? Il est super." |
| u1-sio016-01…08 | "Marie vient de France…", "viennent d'Allemagne" | venir de + country | U3 venir / villes et pays (Bk p.47) | SIMPLIFY → "Marie, c'est la France : elle est française." |
| u1-sio016-08 | "Elle est grecque." | irregular feminine | U1 nationalités Out column | CUT |
| u1-sio017-01 (:9) | "Quelle langue tu veux apprendre ?" | vouloir (U2); apprendre | U2 vouloir (Bk p.37); U3 Out column: "apprendre… as taught verbs" | SIMPLIFY → "Tu parles quelle langue ?" |
| u1-sio017-03/-04 (:45,:63) | "Mes parents parlent…", "nous parlons" | mes (U2); -er verbs in the ils and nous forms | §B: -er verbs "Used in je/tu/il/vous forms"; U2 possessifs | SIMPLIFY → "Vous parlez…" / "Il parle…" |
| u1-sio017-05 (:81) | distractor "du français"; the WHY says "j'aime le français" | partitive (U4); aimer + le (U2) | U4 partitifs; U2 aimer | SIMPLIFY the WHY; swap the distractor → "le français" |
| u1-sio017-06 (:100) | distractor "mais" | U2 linker | U2 aimer row: "Linker mais" | SIMPLIFY → distractor "avec" or "ou" |
| u1-sio017-08 (:137) | "Tu viens de quel pays ?" | venir (U3) | U3 venir (Bk p.47) | SIMPLIFY → "Tu connais quel pays ?" (U1 quel box) |
| u1-sio017-09 | "Quels pays tu visites ?" | visiter | — | UNCLEAR (the book frame is "Tu connais quels pays… ?") |
| u1-sio018-05 (:81) | distractor "deuxième" | ordinal (U3) | U3 ordinaux (Bk p.50) | swap → "douze" |
| u1-sio018-07 (:117) | "Mon père a soixante ans." | mon (U2) | U2 possessifs (Bk p.33) | SIMPLIFY → "Il a soixante ans." |
| u1-sio019-01 (:9) | "Il est midi. Vous avez faim ?"; distractor "sommeil" | telling the time (U2 box); avoir sommeil | §C / U2 l'heure (Bk p.36); U1 avoir, Out column: "avoir sommeil" | SIMPLIFY → "Vous avez faim ?"; distractor → "chaud" |
| u1-sio019-02 (:27) | "Ferme la fenêtre, s'il te plaît."; distractors peur, raison | tu imperative; s'il te plaît; peur (test only) | Bienvenue consignes, Out column (tu commands, U8); U1 politesse, Out column: "s'il te plaît"; U1 avoir: "J'ai peur… only test" | SIMPLIFY → "J'ai froid !"; distractors → chaud / faim |
| u1-sio019-03 (:45) | "J'ai sommeil. Je rentre." | avoir sommeil | U1 avoir, Out column | SIMPLIFY → "J'ai soif." |
| u1-sio019-04 (:63) | "Quel âge as-tu ?" | inversion | U3 est-ce que, Out column: "Inversion as grammar"; the book form is "Il a quel âge ?" (Bk p.22) | SIMPLIFY → "Tu as quel âge ?" |
| u1-sio019-09 (:153) | "Il fait 32°C. J'ai chaud !" | weather (U3) | U3 météo (Bk p.46) | SIMPLIFY → "J'ai chaud !" |
| u1-sio019-05/-07 | "très froid", "Je rentre" | très; rentrer | — | UNCLEAR |

### SIO-020 model dialogue: content/ateliers.ts:38–45 (also its generated pre-test and the atelier-pays lesson's Mémo and bonus)
| where | text | what goes beyond the book | ceilings evidence | proposal |
|---|---|---|---|---|
| ateliers.ts line 3 | "Ici, il y a des Japonais." | il y a as grammar; nationality nouns | U2 c'est un, Out column: "il y a as grammar"; U1 nationalités Out column: "nationality nouns… as grammar" | SIMPLIFY → "Le japonais ? On parle japonais." or CUT the line |
| ateliers.ts line 4 | "Beaucoup de Japonais parlent japonais." | beaucoup de (U4); ils parlent | U4 quantités (Bk p.62); §B -er forms | SIMPLIFY → "On parle japonais." |
| ateliers.ts line 6 | "Il y a un rond rouge sur un fond blanc." | sur (U3); rond (U2) | U3 prépositions (Bk p.49); U2 objets "Forms" (Bk p.32) | CUT, or keep only line 5 (the colours) |
| ateliers.ts lines 1–2 | "Voici le Japon.", "un pays asiatique" | voici; asiatique | — | UNCLEAR |
| lessons/native/atelier-pays.tsx:52–124 (concept) | "Il y a — says what is there" | teaches il y a as grammar | U2 Out column: "il y a as grammar" | SIMPLIFY the concept to C'est only, or ASK DAN |

### Finale: content/finale.ts
| where | text | what goes beyond the book | ceilings evidence | proposal |
|---|---|---|---|---|
| :188 SIO-011:2 | "Oui, lui, il est sympa." | sympa (U3 adjective) | U3 Also: sympathique | SIMPLIFY → "lui, il est acteur." |
| :289 SIO-011:3 | "Nous, on étudie ; et vous, vous travaillez." | on = nous (U2) | Unit 2 Also: on = nous | SIMPLIFY → "Nous, nous sommes étudiants ; et vous, vous êtes professeurs." |
| :392 SIO-011:6 | "Tu viens avec ___ ? Nous allons au parc." | venir (U3); avec + stressed pronoun (U7); nous allons; au parc | U3 venir; U1 pronoms Out column; §B aller lacks the nous form | CUT |
| :189 SIO-012:1 | "Il travaille à l'hôpital" (accepts docteur/infirmier) | hôpital (U3, test only) | U3 lieux: "la gare and l'hôpital are test-only" | SIMPLIFY → "Il est ___ : il chante." → chanteur |
| :393 SIO-012:5 | "Il fait et il vend du pain… il est boulanger" | shopkeeper noun; partitive | U4 commerces Out column; U4 partitifs | CUT |
| :291, :292 SIO-012:3/4 | pompier, dentiste (with éteint les incendies, soigne les dents) | not in the book's professions | U1 professions list | SIMPLIFY → acteur / journaliste clues |
| :191, :192, :293, :294, :395, :396 SIO-013:1–6 | "Qu'est-ce que tu étudies ?", "J'étudie le droit"… | matières; qu'est-ce que (U3) | U1 matières; U3 est-ce que (Bk p.48) | CUT |
| :193 SIO-014:1 | "à l'université" | université (U3, test only) | U3 lieux, test only | SIMPLIFY → "Nous ___ étudiants." |
| :398 SIO-014:6 | "étudiante en chimie" | matières | U1 matières | SIMPLIFY → "Elle ___ étudiante." |
| :196 SIO-015:2 | "Tokyo est sa capitale" | sa (U2) | U2 possessifs (Bk p.33) | SIMPLIFY → "Tokyo ? C'est ___ Japon." |
| :298 SIO-015:4 | "___ États-Unis sont en Amérique." | en + continent | U3 villes et pays: continents incidental | SIMPLIFY → "___ États-Unis, c'est un pays." |
| :400 SIO-015:6 | "Cet été, je visite ___ Portugal." | cet (U4); été (U3); visiter | U4 démonstratifs; U3 météo (seasons) | SIMPLIFY → "Je connais ___ Portugal." |
| :197, :198, :299, :300, :401, :402 SIO-016:1–6 | "Il vient du Portugal : il est ___" | venir de + country | U3 venir / villes et pays (Bk p.47) | SIMPLIFY → "Le pays, c'est le Portugal : il est ___" |
| :199, :200, :301, :302, :403, :404 SIO-017:1–6 | "En Allemagne / À Singapour / Au Mexique / Au Canada / En Égypte, on parle ___" | en / au / à + country | U1 pays row, Out column: "Prepositions with countries… Unit 3"; U3 villes et pays | SIMPLIFY → "Il est allemand : il parle ___." |
| :200, :404 | answers mandarin, malais, tamoul, arabe | languages beyond the book's 6 | U1 langues | ASK DAN |
| :203 SIO-019:1 | "Quel âge as-tu ?" | inversion | U3 Out column; Bk p.22 "Il a quel âge ?" | SIMPLIFY → "Tu as quel âge ?" |
| :204 SIO-019:2 | "Il est midi et je n'ai pas de sandwich" | the time (U2); pas de (U2); sandwich (U4) | §C / U2 l'heure; U2 négation pas de; U4 aliments | SIMPLIFY → "Un café, s'il vous plaît ! J'ai ___ !" (answer: soif) |
| :306 SIO-019:5 | "Il fait -5 °C et je n'ai pas de manteau" | weather (U3); pas de (U2) | U3 météo; U2 négation | SIMPLIFY → "Brrr ! J'ai ___ !" |
| :407 SIO-019:6 | "Nous avons un examen demain." | demain (U2) | U2 moments box (Bk p.36) | SIMPLIFY → "Nous ___ vingt ans." |
| :408 SIO-019:7 | "Il est minuit. J'ai envie de dormir." | the time (U2); avoir envie de (U3) | §C; U3 envie box (Bk p.54) | SIMPLIFY → "Bof… Je suis ___." (fatigué) |
| :206, :307, :409 SIO-020:1/3/5 | "Le Portugal est ___ Europe." (answer: en) | en + continent as the ANSWER | U3 villes et pays; continents incidental | MOVE → unit 3, or CUT |
| :207 SIO-020:2; :308 SIO-020:4 | "La France est en Europe ; ___ parle français", "En Italie, ___ parle" | en + continent or country in the frame | same | SIMPLIFY → "C'est la France : ___ parle français." |
| :410 SIO-020:6 | "La capitale du Japon" | du = de + le (taught U2/U3) | U2 Mémo "de + le = du"; U3 contractions (Bk p.49) | SIMPLIFY → "Le Japon ? La capitale, c'___ Tokyo." |
| :187, :190, :195, :201, :297, :399, :406, :295 | ici; enseigne; capitale; fois; moins; à NUS | not in any row | — | UNCLEAR |

### G-Compris: content/gcompris.ts (scenes tagged unit 1)
| where | text | what goes beyond the book | ceilings evidence | proposal |
|---|---|---|---|---|
| :137, :141, q5 :172 « nouvelle-étudiante » | "un peu français", "étudiante en médecine à Lyon", "Je n'aime pas le froid, mais j'adore la ville" (q5 is answered from aimer) | un peu; matières; à + city (U3); aimer/adorer/mais (U2) | U1 langues Out column; U1 matières; U3 villes; U2 aimer (Bk p.34) | MOVE → unit 2 (retag) |
| :186–191, q3 :209 « message-du-professeur » | "Le cours… est à 10 heures", "Bon week-end", "Il y a un petit test" (q3 is answered from the time) | the time (U2); Bon week-end (out); il y a | §C / U2 l'heure; U2 souhaits, Out column: "Bon week-end" | MOVE → unit 2; replace "Bon week-end" → "Bonne journée" |
| q2 :379, q4 :396 « le-panneau » | "17 heures"; distractors "quatre-vingt-trois", "soixante-dix" | the time (U2); 70+ (U4) | §C; U4 nombres 70–99 | MOVE → unit 2; distractors → numbers ≤69 |
| :498–500, q5 :538 « mot-du-voisin » | "Vous êtes libre samedi ?", "Ma femme et moi", "à 6 heures", "mes deux filles" (q5 is answered from mes) | U2 invitation; possessives; the time; nous invitons | U2 vouloir (Bk p.37); U2 possessifs; §C; §B | MOVE → unit 2 |
| :515 q2 | "très bien" | not in any row | — | UNCLEAR |

### Generated listening texts: content/textgen/unit1.ts
| where | text | what goes beyond the book | ceilings evidence | proposal |
|---|---|---|---|---|
| :475 | title "Qui suis-je ?" | inversion | U3 est-ce que, Out column | SIMPLIFY → "C'est qui ?" (the book's title) |
| :230 | "…parle X, et un peu français." | un peu | U1 langues, Out column: "couramment, un peu" | CUT the variant |
| :284 | "C'est un/une + profession" | c'est un rule (U2) | U1 professions Out column; U2 c'est un (Bk p.32) | CUT the variant |
| :315 | "aujourd'hui, il a X ans !" | aujourd'hui (U2) | U2 moments box | CUT the variant |
| :376, :380, :384, :448, :452, :456 | "étudiant(e) en <matière>" | matières | U1 matières | SIMPLIFY → "Il est étudiant." / "Je suis étudiant(e)." |
| :413 (beat at ~:466) | "Enchanté(e) !" | Enchanté is U2 | Bienvenue salutations, Out column: "Enchanté(e)… (Unit 2)" | CUT the variant |
| :73–96 PAYS | Cuba, Singapour, Malaisie…; cantonais, tamoul, filipino… | countries and languages not in the book's lists | U1 pays / langues | ASK DAN |
| :268, :348, :384, :452, la dame | Voici; comme moi; ici; la dame | not in any row | — | UNCLEAR |

### ComposeIt scenes
| where | text | what goes beyond the book | ceilings evidence | proposal |
|---|---|---|---|---|
| banks.tsx:437, :441 `greetings` (unit 1) | "Enchantée !", chips "Enchanté", "Enchantée" | U2 | Bienvenue salutations, Out column | MOVE the scene → unit 2, or CUT the chips |
| banks.tsx:442 | "À bientôt", "À demain", "Bonne journée" | U2 | Bienvenue salutations Out column; U2 souhaits | CUT the chips (keep Au revoir, Salut) |
| banks.tsx:439–440 | Coucou; Ça va bien; Très bien; Comme ci comme ça | not in the book's Ça va replies (Super ! Ça va. Bien, merci. Bof !) | U1 avoir row (Bk p.29) | UNCLEAR → SIMPLIFY to the book's four replies |
| banks-production.tsx:196, :199 | "Parle-moi du Canada !", "Et dis-moi une chose sur ce pays." | tu imperative + me; ce (U4); sur (U3) | Bienvenue consignes, Out column (U8); U4 démonstratifs | SIMPLIFY → "C'est quel pays ?" / "Une chose sur le pays ?" (sur is still U3, so ASK DAN) |
| banks-production.tsx:197 | "Où est-ce ?" | où questions | §A: "Questions with comment / où / pourquoi… Unit 6" | ASK DAN (the competence's "location" element itself is the problem) |
| banks-production.tsx:198 | "On y parle quelle langue ?" | y (U3) | U3 transports + y (Bk p.51) | SIMPLIFY → "On parle quelle langue ?" |
| banks-production.tsx:149, :188 model | "en Europe / en Afrique / en Asie / en Amérique" | en + continent | U3 villes et pays (continents incidental) | ASK DAN (with SIO-020) |
| banks-production.tsx:126–131 facts | "En hiver, il fait très froid.", "Il y a beaucoup de montagnes.", "On y mange des frites et du chocolat.", "…est très belle." | seasons and weather (U3); beaucoup de (U4); y (U3); manger + partitive (U4); belle (U3) | U3 météo; U4 quantités; U3 y; U4 partitifs; U3 adjectives | SIMPLIFY → "La capitale est X." for every country |
| banks-production.tsx:156 | "grand", "petit" | U3 adjectives | U3 Also: adjectives | MOVE → U3; UNCLEAR: magnifique, intéressant |
| banks-production.tsx:168 | "J'aime", "J'adore", "parce que", "Je voudrais visiter" | aimer (U2); parce que (receptive only); je voudrais + infinitive (U3) | U2 aimer; U2 pourquoi row; U3 envie box | CUT the Opinion group |

### MneMemo lessons on Unit 1 goals
| where | text | what goes beyond the book | ceilings evidence | proposal |
|---|---|---|---|---|
| moi-aussi.tsx:81, :142; moi-aussi.gen.ts:330 | "Qui est-ce ?" | Qui est-ce ? | U2 c'est un, Out column; U1 quel row gives "C'est qui ? Qui ?" | SIMPLIFY → "C'est qui ?" |
| moi-aussi.gen.ts:223; moi-aussi.tsx:144 | "Je n'ai pas le livre.", "Nous n'avons pas le livre." | livre (U2 objects) | U2 objets Mémo (Bk p.42) | SIMPLIFY → "Je n'ai pas vingt ans." |
| moi-aussi.tsx:145 | "Bonne journée ! — Toi aussi !" | U2 wish | U2 souhaits (Bk p.40) | CUT |
| moi-aussi (whole) | moi aussi / moi non plus | not in the row | U1 pronoms toniques In column | UNCLEAR (Dan chose it on 29 Aug; confirm against the book) |
| moi-aussi.gen.ts:219 | "J'ai un frère." | frère | — | UNCLEAR |
| professions.tsx:114–117; memos.tsx:722–723 | "-eur → -euse", "-teur → -trice" | feminine-formation rules | U1 professions, Out column: "Feminine-formation rules… never boxed" | CUT the rule rows; keep the pairs as vocabulary |
| professions.tsx:56–106, :126–127, :154–165, :170–179 alts, :175–176 | "Il est médecin vs C'est un médecin"; c'est un/une dice branch | c'est un rule | U1 professions Out column; U2 c'est un box | MOVE the concept and the c'est-branch → unit 2 |
| professions.tsx:17–26 | médecin, artiste, musicien | not listed | U1 professions | SIMPLIFY → photographe, pâtissier, écrivain |
| quelle-matiere.tsx / .gen.ts (all) | "Tu étudies quoi ? J'étudie les mathématiques"; the concept also uses "du pain" (U4) and "j'aime le sport" (U2) | matières | U1 matières | CUT |
| conjugaison-u1.gen.ts:151–152; conjugaison-u1.tsx:113 | "nous appelons / s'appellent", "Elles s'appellent Léa et Emma." | s'appeler in the nous and ils forms | Bienvenue s'appeler: 4 persons only; §B | SIMPLIFY → "—" for those cells, as falloir does |
| conjugaison-u1.tsx:114 | "Nous n'avons pas de nom." | pas de (U2) | U2 négation pas de (Bk p.35) | SIMPLIFY → "Nous n'avons pas vingt ans." |
| conjugaison-u1.tsx:76–79 | "Je, ne, le, de and que all drop their vowel" | que → qu' as a rule | U2 élision, Out column: "que → qu' as a rule" | SIMPLIFY → "je, ne" |
| negation.tsx:259, :266 | "ne … plus", "Le stylo n'est plus sur la table." | ne…plus (U2); sur (U3) | U2 négation (Bk p.32); U3 prépositions | MOVE: take negation off SIO-014's rail (lessons.ts LESSONS_BY_SIO), so it stays SIO-028 only |
| negation.tsx:237, :265, :269–270, :356 | "Il n'y a pas de chat dans ma famille." | il y a; pas de; ma | U2 Out column (il y a); U2 pas de; U2 possessifs | same MOVE |
| articles-pays.tsx:52–57, :69–71, :117–118 | "countries ending in -e are feminine" | gender rules by ending | Bienvenue noms, Out column: "Gender rules by word ending" | ASK DAN (the book box gives la/le/l'/les only) |
| quel-prefere.tsx:117–157, :97–105, bonus :235–238, :242–244; gen.ts "avant" mode | mon/ma/mes, ton/ta/tes, vos/votre | possessives (U2) | U2 possessifs (1) (Bk p.33). The U1 quel row allows only set phrases "Quel est votre nom" | MOVE the possessive half → unit 2; keep "Vous connaissez quels pays ?" |
| quel-prefere.gen.ts:383–387; tsx:203, :241 | "Vous préférez / aimez quelles couleurs ?" | préférer; aimer (U2) | U2 aimer row | SIMPLIFY → connaître / parler only |
| quel-prefere.gen.ts:307 | villes: Paris, Tokyo, Séoul, Kuala Lumpur… | ville | — | UNCLEAR |
| nationalities.tsx:126, :140–141; nationalities.gen.ts:176–177 | grec → grecque, turc → turque | irregular feminines | U1 nationalités Out column | CUT |
| langues-pays.tsx:29–51, :97–119, :137–144; .gen.ts:246–263 ("prep" mode) | "en France · au Portugal · aux États-Unis · à Singapour" | prepositions with countries | U1 pays, Out column: "(en France, au Maroc): Unit 3"; U3 villes et pays (Bk p.47) | MOVE → unit 3 (SIO-032) |
| langues-pays.tsx:145 | "Je parle anglais et un peu français." | un peu | U1 langues Out column | CUT |
| langues-pays.tsx:59–65 | "j'aime le français" | aimer + le (U2) | U2 aimer | CUT the check |
| nombres-echanges.gen.ts:213–231, :372–507 ("date" mode) | months; "Nous sommes en deux mille…"; "C'est le premier mai deux mille cinq" | months (no box in 0–4); mille (U5); premier (U3 ordinal) | Bienvenue jours, Out column (months); §A numbers 100+ (U5); U3 ordinaux | CUT the date mode |
| nombres-echanges.tsx:58, :97, :133; gen.ts:359 | "C'est combien ?" | U4 shopping phrase | U4 commerces (Bk p.63) | SIMPLIFY → "Un café ? Un euro quarante." (U1 politesse price) |
| nombres-echanges.tsx:105, :134–135; gen.ts:509–523 | "Il y a quarante étudiants." | il y a as grammar | U2 Out column | ASK DAN, or CUT the quantity mode |
| nombres-echanges.gen.ts:194 | "le sandwich" | U4 food | U4 aliments | SIMPLIFY → "le café" |
| nombres-echanges.tsx:44–54, :116; tsx:94 | "trente et une personnes" (un agreement); "Ça coûte" | not in any row | — | UNCLEAR |
| avoir-etats.tsx:33–34, :100–101 | "J'ai envie de dormir. J'ai besoin d'un café." | U3 envie / besoin | U3 box (Bk p.54) | CUT |
| avoir-etats.gen.ts:185, :200–264 ("naissance" round) | "Je suis née en deux mille cinq", "Il est né en mai" | né (passé composé, U5); mille (U5); months | §A passé composé U5, numbers 100+ U5; Bienvenue Out column (months) | CUT |
| avoir-etats.gen.ts:158, :161; tsx:102 | content, calme | test only / U3 | U1 avoir row; U3 adjectives | SIMPLIFY → en forme / triste |
| revisions.tsx:59–66 `revision-u1` | includes questionsOuiNonLesson, motsInterrogatifsLesson, negationLesson | est-ce que, si (U3); inversion "Quel âge as-tu ?", "De quel pays viens-tu ?", "Combien de personnes y a-t-il dans ta famille ?"; ne…plus / il y a | U3 est-ce que (Bk p.48); U3 venir; U2 possessifs | SIMPLIFY → mix only se-presenter, conjugaison-u1, articles-pays |
| memos.tsx:542–543 (stress-pronouns card) | "Moi, j'aime le café"; "avec lui, pour elle" | aimer (U2); preposition + stressed pronoun (U7) | U2 aimer; U1 pronoms Out column | SIMPLIFY → "Moi, je suis français"; CUT the preposition line |
| memos.tsx:657 (languages card) | "language = le + masculine nationality" | a language list with articles | U1 langues Out column | SIMPLIFY → "Je parle français (no article)" |
| memos.tsx:678–692 (matieres card) | — | matières | U1 matières | CUT |

### transfer.ts
| where | text | what goes beyond the book | ceilings evidence | proposal |
|---|---|---|---|---|
| transfer.ts:61, :71, :73 | indien, égyptien, hollandais | not in the book's nationalities (the rules are in scope; the items are unscored) | U1 nationalités list | UNCLEAR. Note: luxembourgeois, italien, libanais, danois and brésilien ARE book words (Bk p.21, p.24, p.28) yet are used as "never taught" probes. ASK DAN whether they belong in the deck instead |

## 3. Whole-goal issues
1. **SIO-013 Les matières.** The book has no school-subjects piece. Its only traces are « J'étudie la physique et les maths » in one riddle and « professeur d'économie » in a test (ceilings U1 matières, Bk p.25). The goal's deck, word set, lesson, Mémo card, pre-test (31 items), six Finale items and the textgen "étudiant(e) en ___" beats all go beyond the book. Proposal: CUT the goal, or ASK DAN to replace it with an in-scope stop (e.g. *formules de politesse*, Bk p.26, which has no stop of its own).
2. **SIO-017 Languages.** The book teaches no list of language names, only *parler* + language with no article: français, anglais, espagnol, italien, danois, japonais. Out of scope: "A language-name list; parler le français". The goal asks for 25 countries' languages. The deck and the Letris set teach « le / l' + langue » ("Je parle le …"), and the lesson teaches *en / au / aux / à* + country, which is Unit 3. Proposal: SIMPLIFY to « Tu parles quelles langues ? — Je parle X » with the book's six.
3. **SIO-020 Present a country.** The competence requires a "location". The only way to say it, *en Europe / en Asie*, is Unit 3 (continents appear only incidentally). The Finale answers *en* three times, and the ComposeIt scene asks « Où est-ce ? » (*où* questions are Unit 6). Proposal: ASK DAN, either drop "location" from the competence or MOVE the task to unit 3.
4. **SIO-012 Professions** promises « C'est un/une ___ », which ceilings puts out of scope for Unit 1. *un / une* is the Unit 2 box, and the -eur → -euse rule is never boxed. Proposal: limit the goal to « il est / elle est + profession ».
5. **SIO-011 Stressed pronouns.** The description promises "after a preposition", which is Unit 7. The canDo promises *moi aussi / moi non plus*, which ceilings does not settle (UNCLEAR). The pre-test drills *avec lui / avec eux* (3 items).
6. **SIO-015 and SIO-016 (25 countries and nationalities).** About half of the 25 are not in the book's lists (Singapour, Malaisie, Thaïlande, Cambodge, Philippines, Indonésie, Mexique, Cuba…). Meanwhile the book's own words (italien, libanais, luxembourgeois, brésilien, le Liban, le Sénégal, le Gabon…) are missing. *grec / turc* are explicitly out. The SIO-016 pre-test and Finale set every nationality item up with *venir de* (Unit 3). Proposal: ASK DAN about the country list; CUT grec/turc; SIMPLIFY the frames.
7. **SIO-019 Avoir.** The deck and the lesson include *avoir envie / besoin de* (Unit 3), *calme* (Unit 3) and *content* (test only). The lesson's "né / née" round needs the passé composé, *mille* and months. Proposal: CUT those parts and keep faim, soif, chaud, froid + triste, fatigué, en forme, malade.
8. **SIO-014** pulls in the Unit 2 *negation* lesson (ne…plus, il n'y a pas de, ma famille) through `lessons.ts` LESSONS_BY_SIO. Proposal: MOVE, i.e. drop it from SIO-014.
