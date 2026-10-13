# Unit 0 (Bienvenue, SIO-001 to SIO-010): content checked against the book's limits

Read-only audit. The limits come from `scope/ceilings.md`, cited below as "Ceil". Bienvenue covers book pp. 12–15. Anything taught in Unit 1 or later is counted as **over the limit** in Unit 0, even though it is fine French.
All paths are relative to `/home/user/fluoduo/src/`.

Files that hold no Unit 0 content:
- `content/gcompris.ts` has no `unit: 0` texts.
- `content/transfer.ts` has no Unit 0 items.
- There is no `pretests/u0-*.json`. The Unit 0 question bank is `content/sios/unit0-questions.ts`.
- `content/pretests/ateliers.gen.ts` leaves SIO-010 out on purpose.

## 1. Summary

| File | Items checked | Over the limit | Unclear |
|---|---|---|---|
| content/sios/sios.json (SIO-001..010: description, canDo, competence) | 10 | 9 | 1 |
| content/collections/sappeler.json | 13 | 3 | 0 |
| content/collections/tu-vous.json + content/tu-vous.json (word set, same items) | 12 | 5 | 6 |
| content/collections/alphabet.json + content/alphabet-letris.json | 26 | 0 | 1 (the sound-group sorting) |
| content/collections/days.json + content/days-letris.json | 10 + 3 column labels | 3 | 0 |
| content/collections/colors.json | 12 (+12 example nouns) | 10 (+ example nouns) | 0 |
| content/collections/core-nouns.json | 18 | 4 | 11 |
| content/core-nouns.json (word set tiles) | 24 | 6 | 13 |
| content/collections/numbers-0-20.json + content/numbers-0-20-letris.json | 21 | 10 | 0 |
| content/collections/consignes.json | 10 | 1 | 1 |
| content/collections/salutations.json + content/salutations.json | 13 | 6 | 3 |
| content/ateliers.ts SIO-010 (also feeds the atelier-sio-010 deck) | 10 | 3 | 1 |
| content/sios/unit0-questions.ts (Unit 0 practice/pretest bank) | 132 | 59 | 20 |
| content/finale.ts (`unit: 0` items) | 61 | 53 | 4 |
| content/lessons/native/se-presenter.tsx + .gen.ts | 25 | 4 | 1 |
| content/lessons/native/tu-vous.tsx | 30 | 15 | 6 |
| content/lessons/native/salutations.tsx | 45 | 30 | 5 |
| content/lessons/native/ca-secrit.tsx + .gen.ts | 25 | 9 | 1 |
| content/lessons/native/quel-jour.tsx + .gen.ts | 20 | 7 | 0 |
| content/lessons/native/combien.tsx + .gen.ts | 15 | 10 | 0 |
| content/lessons/native/on-fait-quoi.tsx + .gen.ts | 15 | 6 | 1 |
| content/lessons/native/colors.tsx | 34 | 22 | 0 |
| content/lessons/native/core-nouns.tsx | 30 | 8 | 12 |
| content/lessons/native/atelier-rencontre.tsx + .gen.ts | 15 | 3 | 3 |
| content/memos.tsx (unit-0 cards: alphabet, colors, tu-vous, core-nouns, days, numbers-0-20, salutations, consignes) | 8 cards | 6 | 1 |
| content/textgen/unit0.ts (3 scenarios) | 60 | 25 | 6 |
| games/compose/banks-production.tsx FIRST_MEETING_BANK | 20 | 10 | 0 |
| content/conjugaison.ts (s'appeler row, CONJ_BY_SIO SIO-001) | 2 | 2 | 0 |
| content/lessons.ts LESSONS_BY_SIO SIO-001 | 1 | 1 | 0 |
| **Total** | **~770** | **~370** | **~97** |

## 2. Findings

Proposals use four words:
- **CUT**: remove the item.
- **SIMPLIFY**: replace it with an in-scope version.
- **MOVE**: move it to a later unit.
- **ASK DAN**: Dan has to decide.

### sios.json (goal text)

| Where | Text | What goes beyond the book | Evidence | Proposal |
|---|---|---|---|---|
| SIO-001 description and competence | "conjugate s'appeler across all persons"; "all 6 persons (≥5/6)" | The book gives only 4 persons of s'appeler (je, tu, il/elle, vous). | Ceil Bienvenue *s'appeler (1)* and B; Bk p.18 | SIMPLIFY → "je, tu, il/elle, vous (4 persons)"; competence "≥4/4" |
| SIO-002 description and competence | "Select tu / vous (polite) / vous (plural) in 12 situations; give a one-phrase reason" | In the book, tu/vous is a culture point only. Rules for tu/vous as grammar are out of scope. | Ceil Bienvenue *tu / vous*; Bk p.7, p.12 act.3 | ASK DAN (keep it as recognition only; drop "give a reason") |
| SIO-003 description and competence | "group by vowel sound… 7 vowel-sound groups" | The book splits letters into vowels and consonants, plus lip shape. It has no 7-group sorting. | Ceil Bienvenue *l'alphabet*; Bk p.13 | UNCLEAR → ASK DAN |
| SIO-004 description | "3 moments of the day (matin, après-midi, soir)"; "weekday vs weekend" | *après-midi* and *week-end* are Unit 2. The Bienvenue moments are matin, **midi**, soir. | Ceil Bienvenue *jours + moments* | SIMPLIFY → "matin, midi, soir"; drop weekday/weekend |
| SIO-005 description, canDo and competence | "12 colours (orange, brown, beige…)", mnemonic objects | Bienvenue has **rouge and bleu only**. jaune, rose, violet, vert, blanc and noir are Unit 1; gris is Unit 2. **orange, marron and beige appear nowhere in Units 0–4.** | Ceil Bienvenue *couleurs (1)*; Unit 1 "colours (2)" | SIMPLIFY → rouge, bleu; MOVE the rest to unit 1; CUT orange/marron/beige (or ASK DAN) |
| SIO-006 description | "C'est où ? / C'est qui ? / C'est quoi ?"; 18 nouns by gender | Bienvenue has no gender rule box. *C'est qui ?* is Unit 1. The un/une rule is Unit 2. | Ceil Bienvenue *noms masc./fém.* (marked Unclear); Unit 2 *c'est un / ce sont des* | ASK DAN |
| SIO-007 description, canDo and competence | "0–16… 17,18,19… 20"; "Il y a combien d'étudiants ?" | Bienvenue numbers are **0–10 only**; 11–20 are Unit 1. *il y a* is Unit 2, and only as a frame. *combien* comes in Unit 4 (*Ça fait combien*). | Ceil Bienvenue *chiffres* (explicit: "An app piece for 0–20 over-teaches"); Unit 2 *c'est un* row; Unit 4 *commerces* | SIMPLIFY → "0–10"; drop *Il y a combien* |
| SIO-008 description and canDo | "Notez !"; "ask On fait quoi ?" | *Notez* is not in the book's box or its activity headers. *on fait* uses faire, which is Unit 2. | Ceil Bienvenue *consignes*; Unit 2 *faire* | *Notez*: UNCLEAR → CUT; *On fait quoi ?*: MOVE → unit 2 |
| SIO-009 description | "distinguish formal, versatile, casual by time of day and register" | The content behind this goal relies on Unit 1 and Unit 2 phrases (see the salutations rows below). The book's Bienvenue set is Bonjour, Bonsoir, Salut, Au revoir. | Ceil Bienvenue *salutations* | SIMPLIFY the scope to those 4 (+ madame/monsieur) |
| SIO-010 description and competence | "… → Enchanté(e) → …"; "say Enchanté(e)" is a scored step; "plural vous of a group" | *Enchanté(e)* is Unit 2. A group register is tu/vous treated as a rule. | Ceil Bienvenue *salutations* (out column); *tu / vous* | SIMPLIFY: drop the Enchanté step (6 steps). Group register: ASK DAN |

### Collections and word sets

| Where | Text | What goes beyond the book | Evidence | Proposal |
|---|---|---|---|---|
| collections/sappeler.json:45 (sappeler-05) | Nous nous appelons Léa et Marc. | nous form | Ceil B (4 persons) | CUT |
| collections/sappeler.json:60, :67 (sappeler-07, -08) | Ils/Elles s'appellent… | ils/elles form | Ceil B | CUT |
| collections/tu-vous.json:36, :52, :100 (+ tu-vous.json word set) | ta petite sœur · ton meilleur ami · tes parents | possessives (Unit 2) | Ceil Unit 2 *possessifs (1)* | SIMPLIFY → "une petite fille" (Bk p.12) · "un ami" · "des parents" |
| collections/tu-vous.json:60, :44 | le professeur · un enfant | Unit 1 vocabulary (professions; liaison *un enfant*) | Ceil Unit 1 *professions*, *la liaison* | low; ASK DAN |
| collections/tu-vous.json:28,68,76,84,108 | un copain, une vendeuse, le directeur, une personne âgée, les voisins | not in the ceilings | — | UNCLEAR |
| collections/days.json:157 + days-letris (L'APRÈS-MIDI) | l'après-midi | Unit 2 | Ceil Bienvenue *jours + moments* | SIMPLIFY → "midi" |
| collections/days.json:18, :24 + days-letris columns | EN SEMAINE / LE WEEK-END | *la semaine* and *le week-end* are Unit 2 | Ceil Bienvenue *jours + moments*; Unit 2 *les moments* | SIMPLIFY → column labels in English ("weekday / weekend") |
| collections/colors.json items 02–04, 06–12 | l'orange, le jaune, le vert, le violet, le marron, le blanc, le noir, le gris, le rose, le beige | Only rouge and bleu are in Bienvenue. orange, marron and beige are not in the book at all (Units 0–4). | Ceil Bienvenue *couleurs (1)* | SIMPLIFY the deck → rouge, bleu; MOVE the rest → unit 1; CUT orange/marron/beige |
| collections/colors.json "example" on every item | le lait blanc, le chocolat marron (Unit 4), le nuage gris (Unit 3), le citron, le concombre, le raisin, le flamant, le sable, le fluo, le feu | Example nouns from later units, or not in the book | Ceil Unit 4 *aliments*; Unit 3 *météo* | CUT the examples (or ASK DAN) |
| collections/core-nouns.json items 07, 11, 13, 18 | un café · le football · la danse · une nationalité | Unit 1 (café ordering; *nationalité*) and Unit 2 (sports/leisure Mémo) | Ceil Unit 1 *formules de politesse*, *quel*; Unit 2 *loisirs + sports* | MOVE → unit 1/2 or ASK DAN |
| collections/core-nouns.json, every "example" | « C'est qui ? — C'est un homme. » | *C'est qui ?* is Unit 1. The un/une rule is Unit 2. | Ceil Unit 1 *quel* row (set phrases); Unit 2 *c'est un* | ASK DAN (whole goal) |
| content/core-nouns.json tiles | LIVRE, CAHIER, TABLEAU | Unit 2 objects | Ceil Unit 2 *objets* | MOVE → unit 2 |
| content/core-nouns.json tiles | PROFESSEUR, PROFESSEURE, NOM | Unit 1 (professions; *Quel est ton nom ?*) | Ceil Unit 1 *professions*; Bienvenue *s'appeler* out column | MOVE → unit 1 |
| collections/numbers-0-20.json -12..-21 + numbers-0-20-letris "11 – 20" column | onze … vingt | 11–20 are Unit 1 | Ceil Bienvenue *chiffres* | MOVE → unit 1 (into numbers-20-69); deck becomes 0–10 |
| collections/consignes.json consignes-10 | On fait quoi ? | faire is Unit 2 | Ceil Unit 2 *faire* | MOVE → unit 2 |
| collections/consignes.json consignes-07 | Notez ! | not in the book's consignes list | Ceil Bienvenue *consignes* | UNCLEAR → SIMPLIFY → "Complétez !" or "Observez !" (both in the book) |
| collections/salutations.json -03, -06, -08..-11 (+ word set) | Enchanté ! · Ça va ? · À demain ! · À bientôt ! · Bonne journée ! · Bonne nuit ! | Ça va is Unit 1; the others are Unit 2 | Ceil Bienvenue *salutations* (out column names each one) | MOVE → unit 1/2 |
| collections/salutations.json -05, -12, -13 | Coucou ! · À plus tard ! · À plus ! | not in the ceilings | — | UNCLEAR |
| ateliers.ts:28, :32–34 (SIO-010 dialogue, also atelier-sio-010 deck) | Et toi ? · Enchanté ! / Enchantée ! · à demain | *toi* is Unit 1; Enchanté and à demain are Unit 2 | Ceil Unit 1 *pronoms toniques*; Bienvenue *salutations* | SIMPLIFY → "Et vous ?"… drop Enchanté; "Au revoir !" |

### content/sios/unit0-questions.ts (the Unit 0 question bank)

| Where | Text | What goes beyond the book | Evidence | Proposal |
|---|---|---|---|---|
| :622, :625, :626 | Nous ___ / Ils ___ / Elles ___ (s'appeler) | nous and ils/elles forms (also used as distractors in :618–:624) | Ceil B | CUT the 3 items; distractors → only je/tu/il/vous forms |
| :627–:632 | « Monsieur, je vous présente Marc. Il s'appelle Marc Tan. » / « je te présente » | présenter + object pronoun is never boxed; direct object pronouns are Unit 7; *professor* | Ceil A (pronouns le/la/les Unit 7) | CUT |
| :671 (+ distractors at :668–:674) | après-midi (answer); nuit, après-midi (distractors) | Unit 2 | Ceil Bienvenue *jours + moments* | SIMPLIFY → answers matin/midi/soir only; distractors from days |
| :680–:691 (all 12 colorQ) | orange…beige answers; blanc/jaune/rose… distractors; mnemonic nouns | colours beyond rouge/bleu; orange/marron/beige are in no unit | Ceil Bienvenue *couleurs (1)* | Keep only rouge/bleu (2 items); MOVE the rest → unit 1; CUT orange/marron/beige |
| :695–:716 | prénom/nom, professeur, livre, cahier, tableau | Unit 1 (*nom*, professions), Unit 2 (objects) | Ceil Unit 1 *professions*; Unit 2 *objets* | MOVE → unit 1/2 |
| :696–:716 others | garçon, dame, ami, salle (de classe), table, chaise, crayon, casque, micro | not in the ceilings | Ceil Bienvenue *noms* "Unclear" | UNCLEAR |
| :736–:742 (+ distractors onze…seize in :725–:735) | 11, 12, 13, 14, 15, 16, 20 | Unit 1 | Ceil Bienvenue *chiffres* | CUT; distractors from 0–10 only |
| :754 | Notez ! (answer; also a distractor in 6 items) | not in the book's list | Ceil Bienvenue *consignes* | UNCLEAR → SIMPLIFY → "Complétez !" |
| :765, :778, :797 | Enchanté. (distractor) | Unit 2 vocabulary in a distractor | Ceil Bienvenue *salutations* | SIMPLIFY → "Au revoir." / "Salut !" |
| :776 | À demain ! (answer) | Unit 2 | same | CUT the item |
| :782 | Bonne soirée ! (answer, "around 7pm") | Unit 2 | same | CUT |
| :789 | Bonne journée ! (answer) | Unit 2 | same | CUT |
| :817 | Bonne nuit. (answer) | Unit 2 | same | CUT |
| :772, :484, :567 | À plus ! / Coucou ! (Coucou is the ANSWER at :484) | not in the ceilings | — | UNCLEAR → ASK DAN |
| :86–:129 meetOptions + meetQ (3 situations) | Enchantée ! / Enchanté, madame. (answers) | Unit 2 | Ceil Bienvenue *salutations* | CUT the step (3 items) |
| :472 leaveEnchante (3 leave items) | Enchanté(e) distractor | Unit 2 | same | SIMPLIFY → "Bonjour, madame." / "Salut !" |
| :499, :535, :573, :582 | Comment allez-vous ? · Comment ça va ? (distractors) | Inversion; Ça va is Unit 1 | Ceil Unit 3 *est-ce que* (inversion out); Unit 1 *avoir + sensations* | SIMPLIFY → "Comment vous vous appelez ?" (already a distractor elsewhere) or "Bonjour !" |
| :410, :412, :528, :529 | Nous nous appelons / Ils s'appellent / Comment ils s'appellent ? / Comment nous nous appelons ? | nous/ils forms of s'appeler | Ceil B | SIMPLIFY → "Il s'appelle…" / "Tu t'appelles…" |
| :519–:524, :540–:545 | Bonjour à tous ! · Salut tout le monde ! · Au revoir tout le monde ! (ANSWER at :541) | not in the ceilings; the group register is tu/vous treated as a rule | Ceil Bienvenue *tu / vous* | UNCLEAR → ASK DAN |
| :446 | Vous vous écrivez L – É – A. | s'écrire conjugated; not in the ceilings | — | UNCLEAR |
| :31 and every spelling of Léa | « L – É – A », said as "E accent aigu" | Spelling an accent aloud is shown only in Unit 1 (Piste 31) | Ceil Bienvenue *l'alphabet* | ASK DAN (low) |

### content/finale.ts (`unit: 0` items)

All of these are scored. In scope: :269, :275, :371, :372. Unclear: :167 ("et toi"), :171 (Comment ça s'écrit ?), :273 (« lettres », « seulement »), :373 (« on dit », « client »).

| Where | Text (short) | What goes beyond the book | Evidence | Proposal |
|---|---|---|---|---|
| :55 SIO-006:1 | La porte de la salle de classe est verte. | colour agreement (*verte*, never taught in 0–4); possessive *de*; *porte* | Ceil Bienvenue *couleurs (1)* | CUT |
| :168, :270 | Ils s'___ Hugo et Nathan · Nous nous ___ Chan et Lim | ils/nous forms | Ceil B | SIMPLIFY → "Il s'___ Hugo." / "Vous vous ___ comment ?" |
| :169 | Madame, comment ___ appelez-vous ? | inversion | Ceil Unit 3 *est-ce que* (inversion out) | SIMPLIFY → "— Madame, vous ___ appelez comment ?" (vous) |
| :170 | Salut Emma ! Tu ___ bien ? (vas) | aller is Unit 2 | Ceil Unit 2 *aller* | CUT |
| :172 | Mon prénom s'___ K–A–R–I–M. | *mon* (Unit 2) | Ceil Unit 2 *possessifs (1)* | SIMPLIFY → "Karim, ça s'___ K–A–R–I–M." |
| :173 | Demain, c'est vendredi. Aujourd'hui, c'est ___. | demain/aujourd'hui (Unit 2) | Ceil Unit 2 *les moments* | CUT (:275 already tests day order) |
| :174 | Après le dîner samedi ___, nous allons au cinéma. | dîner (Unit 4), nous allons, au cinéma (Unit 2) | Ceil Unit 4 *aliments*; Unit 2 *aller* | SIMPLIFY → "Samedi ___ ou dimanche matin ?" (soir) |
| :175, :176 | drapeau… bleu, ___ et rouge (blanc) · La nuit, le ciel est ___ (noir) | blanc/noir (Unit 1); nuit (Unit 2) | Ceil Bienvenue *couleurs (1)*; Unit 1 colours (2) | MOVE → unit 1 |
| :277, :278, :379, :380 | soleil → jaune; tomate → rouge; pain → blanc/marron…; citron → jaune/vert | Unit 1+ colours; nouns from Units 3–4; *De quelle couleur* uses quel (Unit 1) | same; Ceil Unit 1 *quel* | :278 SIMPLIFY → "un béret ___" (rouge); rest MOVE → unit 1 / CUT |
| :177, :381 | ___ est-ce ? — C'est mon professeur · Qui ___-ce ? | *Qui est-ce ?* is out even in Unit 2; *mon* | Ceil Unit 2 *c'est un* (out column) | CUT |
| :178, :280 | ___ est-ce que c'est ? — un stylo · Qu'est-ce que c'___ ? — une gomme | Unit 2 | Ceil Unit 2 *c'est un*, *objets* | MOVE → unit 2 |
| :279 | C'est ___ ? — C'est Léa, ma sœur. | C'est qui (Unit 1); *ma* (Unit 2) | Ceil Unit 1 *quel*; Unit 2 *possessifs* | MOVE → unit 2 |
| :382 | C'est un stylo ? — Non, c'est ___ crayon. | article rule (Unit 2); stylo (Unit 2) | Ceil Unit 2 *c'est un* | MOVE → unit 2 |
| :179, :180, :281, :282, :383, :384 | quinze, dix-neuf, vingt, quatorze, douze; dix-sept moins dix | 11–20 (Unit 1); *ne… plus* (Unit 2); *ça fait* (Unit 4) | Ceil Bienvenue *chiffres* | SIMPLIFY → "Cinq plus cinq, ça fait ___" (dix), "Dix moins trois…" (sept); CUT :180 |
| :181 | …Alors, ___-le à la page douze ! (ouvrez) | not a book consigne; imperative + pronoun (Units 7/8); douze | Ceil Bienvenue *consignes*; A | CUT |
| :182 | Je ne comprends pas. Vous pouvez ___, s'il vous plaît ? | pouvoir (Unit 6), s'il vous plaît (Unit 1), negation (Unit 1) | Ceil A; Unit 1 *formules de politesse* | SIMPLIFY → "Écoutez et ___ !" (répétez) |
| :183, :285 | Il est 20 h. — ___, madame ! · Il est 8 h du matin. — ___, monsieur ! | clock time (Unit 2); *du matin* is out in every unit | Ceil C | SIMPLIFY → "Samedi soir : « ___, madame ! »" / "Lundi matin : « ___, monsieur ! »" |
| :184 | Le prochain cours est dans une semaine… à ___ prochain ! | *prochain*, *semaine*, *nous sommes* | Ceil Unit 2 *les moments*; Unit 4 *futur proche* | CUT |
| :185, :287 | Je te présente Chloé. — ___ ! · Je vous ___ Monsieur Tan. — Enchanté ! | Enchanté (Unit 2); présenter + object pronoun | Ceil Bienvenue *salutations*; A | CUT |
| :186 | C'___ mon amie : elle s'appelle Chloé. | *mon amie* is explicitly never taught as a rule | Ceil Unit 2 *possessifs (1)* out column | SIMPLIFY → "Moi, c'___ Chloé." |
| :271, :272, :374 | À mon ami, je dis « ___ » · vous ___ professeur ? · Tu ___ en forme ? (es) | mon (Unit 2); être + professeur, en forme (Unit 1) | Ceil Unit 1 *être*, *avoir + sensations* | SIMPLIFY → "— Salut ! ___ t'appelles comment ?" (tu) / "— Madame, ___ vous appelez comment ?" (vous) |
| :274, :376 | Ça s'écrit ___ un accent ? — é, accent aigu · « café »… un ___ accent aigu | accent aigu is shown only in Unit 1 | Ceil Bienvenue *l'alphabet* | MOVE → unit 1 or ASK DAN |
| :276 | Le matin, le midi, l'après-midi et le ___. | après-midi | Ceil Bienvenue *jours + moments* | SIMPLIFY → "Le matin, le midi et le ___." |
| :283, :284, :385, :386 | Parlez lentement, s'il vous plaît · ___ vos livres (fermez/rangez) · Prenez un stylo et ___ · pour tout le monde : ___ bien | trop vite/lentement, vos, livres, prenez, stylo — Units 1–3 or not in the book | Ceil Bienvenue *consignes* | SIMPLIFY → "Lisez et ___ !" (écrivez), "___ et répétez !" (écoutez); CUT :284 |
| :286 | Nous partons : « Au ___ ! À lundi ! » | partir is never boxed | Ceil B | SIMPLIFY → "« Au ___, madame ! »" (revoir) |
| :288, :389 | Oui, c'est ___ ! (moi) · Et ___ ? (toi) | stressed pronouns, Unit 1 (only *Moi, c'est…* is Bienvenue) | Ceil Unit 1 *pronoms toniques* | SIMPLIFY :389 → "Et ___, vous vous appelez comment ?" (vous); CUT :288 |
| :375 | L'alphabet français a ___ lettres (vingt-six) | 26 and avoir (Unit 1) | Ceil Bienvenue *chiffres* | SIMPLIFY → "A, E, I, O, U, Y : six ___" (voyelles) |
| :377, :378 | c'est le ___ (week-end) · Le premier jour de la semaine en France | week-end, semaine (Unit 2); premier, en France (Unit 3) | Ceil Unit 2 *les moments*; Unit 3 *ordinaux*, *villes et pays* | CUT / MOVE → unit 2 |
| :387 | Minuit ! Je vais dormir : « Bonne ___ ! » | minuit, je vais, Bonne nuit (Unit 2); dormir (Unit 4) | Ceil Bienvenue *salutations*; C | MOVE → unit 2 |
| :388 | Merci beaucoup ! — De ___ ! | *Merci beaucoup* is out in every unit; De rien is Unit 1 | Ceil Unit 1 *formules de politesse* | MOVE → unit 1 as "— Merci ! — De ___ !" |
| :390 | Voici Anna : ___ est étudiante en droit. | être (Unit 1); school subjects are not in the book | Ceil Unit 1 *matières* | CUT |

### Lessons, memos, generators

| Where | Text | What goes beyond the book | Evidence | Proposal |
|---|---|---|---|---|
| lessons.ts:107 (LESSONS_BY_SIO) + conjugaison.ts:107 (CONJ_BY_SIO) | SIO-001 → conjugaison-u1; SIO-001 → ["sappeler","etre"] | links Unit 0 to être/avoir in all 6 persons (Unit 1) | Ceil Unit 1 *être*; B | SIMPLIFY → SIO-001: se-presenter / sappeler only |
| conjugaison.ts:64 | s'appeler forms incl. nous nous appelons, s'appellent | 2 persons beyond the book | Ceil B | SIMPLIFY → show 4 persons |
| lessons/native/se-presenter.gen.ts:23–26, :52–57; se-presenter.tsx:78, :156 | nous/ils/elles subjects; 6-row table; bonus "Ils s'appellent Paul et Thomas." | nous/ils forms | Ceil B | SIMPLIFY → 4 rows; CUT bonus :156 |
| se-presenter.gen.ts:143 | "Mademoiselle" (distractor) | not in the ceilings | — | UNCLEAR |
| lessons/native/tu-vous.tsx:31–33, :182–:191 | Tu parles français ? · Tu habites où ? · Tu vas bien ? / Vous allez bien ? | parler, habiter (Unit 1); *où* (Unit 3/6); aller (Unit 2) | Ceil Unit 1 *langues*, *négation*; Unit 2 *aller*; A | SIMPLIFY → keep only the s'appeler frame ("Tu t'appelles / Vous vous appelez comment ?") |
| tu-vous.tsx:14, :16, :22 | ta petite sœur · ton meilleur ami · tes parents | possessives (Unit 2) | Ceil Unit 2 *possessifs (1)* | as in the deck row above |
| lessons/native/salutations.tsx:120 | Bonne soirée, Bon week-end, Bon voyage, Bon appétit | *Bon week-end* is out in every unit; the rest are Unit 2 | Ceil Unit 2 *souhaits* | CUT the row |
| salutations.tsx:146–:152 (fold "7 rows") | Merci beaucoup, Merci bien, Il n'y a pas de quoi, Comment ça va ?, Comment allez-vous ?, S'il te plaît, Excuse-moi, Oui volontiers, Avec plaisir, Bien sûr, Je vous en prie, De rien | Unit 1 or not in the book; *Merci beaucoup* and *s'il te plaît* are explicitly out; *Excuse-moi* is a tu command (out) | Ceil Unit 1 *formules de politesse*; Bienvenue *consignes* | CUT the fold (or MOVE → unit 1 as the book's box only) |
| salutations.tsx:14–24, :84–96, :303–:312 | Enchanté, Ça va ?, À demain, À bientôt, Bonne journée, Bonne nuit (answers) | Units 1–2 | Ceil Bienvenue *salutations* | MOVE → unit 1/2 |
| lessons/native/ca-secrit.tsx:44, :65, :111; ca-secrit.gen.ts:50, :57 | Inès → "E accent grave" | accent grave is **never taught** | Ceil Bienvenue *l'alphabet* (out column) | CUT Inès |
| ca-secrit.tsx:25–68 (concept), :110, :131 | "E accent aigu" as the lesson's main idea | shown only in Unit 1 | same | ASK DAN |
| ca-secrit.tsx:129, :132 | Et toi, comment tu t'appelles ? · Enchanté ! | toi (Unit 1); Enchanté (Unit 2) | Ceil Unit 1 *pronoms toniques*; Bienvenue *salutations* | SIMPLIFY → "Et vous, vous vous appelez comment ?"; CUT Enchanté |
| lessons/native/quel-jour.tsx:80, :94; :86, :107; quel-jour.gen.ts:17, :77; quel-jour.tsx:44, :52 | On est quel jour ? / C'est quel moment ? · Aujourd'hui, c'est… · l'après-midi · la France | quel (Unit 1); aujourd'hui, après-midi (Unit 2); countries (Unit 1) | Ceil Unit 1 *quel*, *pays*; Unit 2 *les moments* | SIMPLIFY → "C'est lundi." / "C'est le matin."; moments matin/midi/soir; drop the France example |
| lessons/native/combien.tsx (whole), combien.gen.ts | Il y a combien d'étudiants ? — Il y a sept étudiants. | *il y a* is not grammar even in Unit 2; *combien (de)* is Unit 4 | Ceil Unit 2 *c'est un* (out column); Unit 4 *commerces* | CUT the lesson or MOVE → unit 2/4 (whole goal) |
| lessons/native/on-fait-quoi.tsx:31 heading; :55, :82; gen :27–:28, :58–:59 | Et vous, qu'est-ce que vous dites ? · Pardon, on fait quoi ? · Répétez s'il vous plaît · "faites/fais quoi" distractors | qu'est-ce que (Unit 3); faire (Unit 2); s'il vous plaît (Unit 1) | Ceil Unit 3 *est-ce que*; Unit 2 *faire*; Unit 1 *politesse* | SIMPLIFY → just the book's consignes; MOVE "on fait quoi" → unit 2 |
| lessons/native/colors.tsx:42–53, :223–:232 | 12 colour + noun pairs | 10 colours beyond the book; nouns from Units 3–4 or not in the book; "colour after noun" is not in the ceilings (UNCLEAR) | Ceil Bienvenue *couleurs (1)* | SIMPLIFY → rouge, bleu (e.g. "le béret rouge", "les Bleus") |
| lessons/native/core-nouns.tsx:104, :127–:129, :193–:195 | "-ité is always feminine" | gender by word ending is explicitly out | Ceil Bienvenue *noms masc./fém.* out column | CUT |
| core-nouns.tsx:55 + examples | C'est qui ? / C'est où ? / C'est quoi ? | *C'est qui* is Unit 1; others not in the ceilings | Ceil Unit 1 *quel* row | ASK DAN |
| memos.tsx:274–:292 (colors) | 12 colours | as above | Ceil Bienvenue *couleurs (1)* | SIMPLIFY |
| memos.tsx:345–:368 (core-nouns) | "general word takes un/une; the named one takes le/la" | article rule (Unit 2 at the earliest; definite vs indefinite is never boxed) | Ceil Unit 2 *c'est un* | CUT the paragraph |
| memos.tsx:568–:582 (numbers-0-20) | onze … dix-neuf | Unit 1 | Ceil Bienvenue *chiffres* | SIMPLIFY → 0–10 |
| memos.tsx:611–:632 (salutations) | Coucou, Bonne journée, À demain, À bientôt, À plus (tard) | Unit 2 / not in the book | Ceil Bienvenue *salutations* | SIMPLIFY → Bonjour, Bonsoir, Salut, Au revoir |
| memos.tsx:635–:652 (consignes) | "verb + -ez = polite command"; Notez | imperative as grammar (Unit 8) | Ceil A; Bienvenue *consignes* | CUT the rule line; drop Notez |
| memos.tsx:321–:331 (tu-vous) | Tu parles / Vous parlez | parler (Unit 1) | Ceil Unit 1 *langues* | SIMPLIFY → t'appelles / vous appelez |
| memos.tsx:260–:270 (alphabet) | "7 familles de sons" | not in the book | Ceil Bienvenue *l'alphabet* | UNCLEAR → ASK DAN |
| lessons/native/atelier-rencontre.tsx:103–:107, :126–:128 | Enchantée, madame · Bonjour à tous ! … Au revoir tout le monde ! | Enchanté (Unit 2); group formulas not in the ceilings | Ceil Bienvenue *salutations* | CUT Enchanté; UNCLEAR the group lines |
| textgen/unit0.ts:186–:202, :261 | Ça va ? — Ça va, merci ! | Unit 1 | Ceil Unit 1 *avoir + sensations* | CUT |
| textgen/unit0.ts:196, :207–:209 | Et toi ? | Unit 1 | Ceil Unit 1 *pronoms toniques* | SIMPLIFY → "Et vous ?" (or ASK DAN) |
| textgen/unit0.ts:53, LA_RENCONTRE last line; :126–:127, :140–:143 | Enchanté(e) · À demain · À bientôt · Bonne journée | Unit 2 | Ceil Bienvenue *salutations* | SIMPLIFY → "Au revoir !" |
| textgen/unit0.ts:112 | après-midi | Unit 2 | Ceil Bienvenue *jours + moments* | SIMPLIFY → "midi" |
| textgen/unit0.ts:288–:296 | Dans la classe, il y a sept étudiants · Il y a combien d'étudiants ? | il y a / combien | Ceil Unit 2 *c'est un*; Unit 4 | CUT |
| textgen/unit0.ts:334–:337, :367, :375 | Qui est-ce ? · Qu'est-ce que c'est ? | *Qui est-ce* is out; *Qu'est-ce que c'est* is Unit 2 | Ceil Unit 2 *c'est un* | SIMPLIFY → drop the question lines; keep "C'est un/une…" (ASK DAN) |
| textgen/unit0.ts:58–:79 (PERSONNES/OBJETS) | professeur(e), livre, cahier, tableau | Units 1–2 | Ceil Unit 1 *professions*; Unit 2 *objets* | MOVE |
| textgen/unit0.ts:121, :125, :343 | Coucou ! · À plus tard ! · Voici… | not in the ceilings | — | UNCLEAR |
| games/compose/banks-production.tsx:65 | opening « Et toi, comment tu t'appelles ? » | toi (Unit 1) | Ceil Unit 1 *pronoms toniques* | SIMPLIFY → "Bonjour ! Moi, c'est Camille. Tu t'appelles comment ?" |
| banks-production.tsx:74 | chips Et toi ? · Enchanté · Enchantée | Units 1–2 | as above | CUT |
| banks-production.tsx:76 | chips s'il te plaît · merci · de rien | *s'il te plaît* is out; merci and de rien are Unit 1 | Ceil Unit 1 *formules de politesse* | CUT the Politesse group |
| banks-production.tsx:77 | chips À bientôt · À demain · Bonne journée | Unit 2 | Ceil Bienvenue *salutations* | SIMPLIFY → "Au revoir", "Salut" |

## 3. Whole-goal issues

1. **SIO-007 Numbers 0–20.** The book's Bienvenue numbers are **0–10**. 11–20 are Unit 1, and the ceilings file says outright that "an app piece for 0–20 over-teaches". The goal's frame *Il y a combien d'étudiants ?* is also not taught: *il y a* is a frame only, in Unit 2, and *combien* is Unit 4. So the whole `combien` lesson is beyond the book.
2. **SIO-005 Colours.** The book has 2 colours (rouge, bleu); the goal teaches 12. orange, marron and beige appear in no unit from 0 to 4. The mnemonic nouns (lait, chocolat, nuage, citron…) come from later units or from nowhere in the book.
3. **SIO-001 Introductions.** The goal promises s'appeler in all 6 persons (pass mark ≥5/6), but the book gives 4. It is also linked to `conjugaison-u1` (être and avoir) and to ConjugaZone's être.
4. **SIO-009 Greetings.** The book's Bienvenue set is Bonjour, Bonsoir, Salut, Au revoir (+ madame/monsieur). About two-thirds of the goal's content is *Ça va* (Unit 1) or Unit 2 phrases (Enchanté, À demain, À bientôt, Bonne journée/soirée/nuit). The lesson's fold adds phrases that are out in every unit: *Merci beaucoup*, *s'il te plaît*, *Bon week-end*.
5. **SIO-010 First meeting.** *Enchanté(e)* is a scored step, but it is Unit 2. The "group / plural vous" register treats tu/vous as a rule, which the book does not; there it is a culture point only. ASK DAN.
6. **SIO-004 Days and moments.** The goal uses *après-midi* (Unit 2) where the book has *midi*. The weekday/weekend split uses *semaine* and *week-end* (Unit 2); the lesson adds *aujourd'hui* (Unit 2) and *quel* (Unit 1).
7. **SIO-006 Some nouns.** Bienvenue has no gender box (the ceilings mark this Unclear). *C'est qui ?* is Unit 1 and the un/une rule is Unit 2. The lesson's "-ité is feminine" is a gender-by-ending rule, which the ceilings mark as out of scope. ASK DAN.
8. **SIO-002 Tu/Vous.** The book treats tu/vous as culture only, and tu/vous rules as grammar are out. The goal asks for 12 situations plus a reason. ASK DAN.
9. **SIO-008 Classroom.** *Notez !* is not in the book's list. *On fait quoi ?* uses faire (Unit 2). The memo teaches "-ez = polite command", which is the imperative as grammar (Unit 8).
10. **SIO-003 Alphabet.** The "7 vowel-sound groups" sorting is not in the book (UNCLEAR). The accent work leans on Unit 1 (*E accent aigu*) and on *accent grave*, which the book never teaches.
