# Units 0–4: what is still over the book after Dan's rulings

This takes the five audits (`unit0.md` … `unit4.md`) and checks every finding against Dan's rulings, which override `scope/ceilings.md`. Paths are under `src/`.

**How it is counted.** One "flag" is one row in an audit's findings tables. A row can cover several items; for example, one row covers all 12 colour questions. A row is **cleared** only when the ruling removes the whole problem. If a ruling fixes one half but not the other, the row stays **still over**. Example: « Mes parents parlent… / nous parlons » — *nous parlons* is fine now, but *mes* is still Unit 2. **Unclear** means neither the ceilings file nor the rulings decide it.

How some rulings were applied:
- **s'appeler** is taught from Bienvenue, so *nous nous appelons* and *ils s'appellent* are cleared in Unit 0 too.
- **« Il est midi »** used as a clock time in Unit 1 is still over, because telling the time is Unit 2. *Midi* as a moment of the day (*dimanche midi*) is fine from Bienvenue.
- **Enchanté(e)** is not in any unit. The Unit 0 audit says "Unit 2", but ceilings §D lists it as absent from the book and from all three guides.
- **combien** is in scope from Bienvenue (G01 p.15, « Combien ? » for counting; Unit 1 « combien coûte un café », « Elle a combien d'enfants ? »). Every flag that called it Unit 4 is cleared. The Unit 0 `combien` lesson stays over, but only because of *il y a* (and 11–20). « Combien de personnes y a-t-il ? » stays over because of the inversion.
- **chez:** the G-Compris question answered with « chez Julien » is cleared, because the learner only reads it. The `aller` lesson's chips, which make the learner produce *chez moi*, are still over.

## (a) The count per unit

| Unit | Original flags (over + unclear) | Cleared by Dan's rulings | Still over | Unclear |
|---|---|---|---|---|
| 0 Bienvenue (SIO-001–010) | 119 (99 + 20) | 8 | 91 | 20 |
| 1 (SIO-011–020) | 137 (107 + 30) | 5 | 103 | 29 |
| 2 (SIO-021–030) | 212 (156 + 56) | 33 | 138 | 41 |
| 3 (SIO-031–040) | 255 (194 + 61) | 26 | 191 | 38 |
| 4 (SIO-041–050) | 131 (68 + 63) | 19 | 65 | 47 |
| **Total** | **854** | **91** | **588** | **175** |

Unit 3's "still over" (191) is one more than its original 194 minus the 26 cleared rows. That is because one row moved from unclear to over: the `modaux` lesson's *voulons / veulent / pouvons / peuvent*. Its vouloir half is cleared, but its pouvoir half is not.

What the rulings cleared, by ruling:
- **Ruling 1, all nine persons (52 rows).** This is Unit 2's whole "persons" issue: aimer, faire, aller and vouloir in ConjugaZone, the lessons, the decks and the Finale. It also covers aller nous/ils across every Unit 3 surface, s'appeler in Units 0–1, and -er nous/ils in Unit 4.
- **Ruling 2, the publisher's unit tests (31 rows).** This covers *ces* (SIO-046) and *nous allons / ils vont* (SIO-047). It also covers gare, banque, poste, hôpital, école, université, boulangerie and supermarché in Unit 3, *content* in Unit 1, and the *peur* distractor.
- **Ruling 3, the corrections (4 rows).** *préférer* in Units 2–3, *Il est midi* in Unit 2, and *chez* in a reading question.
- **The later combien ruling (4 rows).** « C'est combien ? » in Units 1 and 3, and « Combien ça coûte ? » in SIO-044.

## (b) What is still over, by cause

Proposal words: **CUT** remove it · **SIMPLIFY →** replace it with the in-scope version · **MOVE →** move it to the unit that teaches it.

### Unit 0 — 91 rows

| Cause | Rows | Files | Examples → in-scope replacement | Proposal |
|---|---|---|---|---|
| Greetings from Units 1–3, plus phrases in no unit | 28 | content/sios/sios.json (SIO-009, -010); content/collections/salutations.json + content/salutations.json; content/ateliers.ts; content/sios/unit0-questions.ts; content/finale.ts; content/lessons/native/salutations.tsx, ca-secrit.tsx, atelier-rencontre.tsx; content/memos.tsx; content/textgen/unit0.ts; games/compose/banks-production.tsx | « Enchanté ! » → « Au revoir ! » · « Et toi ? » → « Et vous ? » · « s'il te plaît » chip → cut | SIMPLIFY → Bonjour, Bonsoir, Salut, Au revoir (+ madame/monsieur). MOVE Ça va, merci and de rien → U1; Bonne journée/soirée/nuit → U2; À bientôt and À demain → U3. CUT Enchanté, Bon week-end and Merci beaucoup (in no unit). |
| Numbers 11–20 in Bienvenue, plus the *il y a* frame | 8 | sios.json (SIO-007); content/collections/numbers-0-20.json + content/numbers-0-20-letris.json; unit0-questions.ts; finale.ts; memos.tsx; content/lessons/native/combien.tsx (+ .gen.ts); textgen/unit0.ts | « quinze, dix-neuf » → « Cinq plus cinq : ___ » (dix) · « L'alphabet a ___ lettres » (vingt-six) → « A, E, I, O, U, Y : six ___ » (voyelles) · « Il y a combien d'étudiants ? » → « Combien d'étudiants ? — Sept. » (combien is fine; *il y a* is not) | SIMPLIFY the stop → 0–10. MOVE 11–20 → the U1 numbers deck. Rebuild the `combien` lesson without *il y a*. |
| Colours beyond rouge and bleu | 9 | sios.json (SIO-005); content/collections/colors.json; unit0-questions.ts; finale.ts; content/lessons/native/colors.tsx; memos.tsx | « le jaune, le vert… » → MOVE to U1 · « l'orange, le marron, le beige » → cut · « soleil → jaune » → « un béret ___ » (rouge) | SIMPLIFY → rouge, bleu. MOVE jaune, rose, violet, vert, blanc and noir → U1, and gris → U2. CUT orange, marron and beige (in no unit) and the example nouns. |
| Unit 2 time words (après-midi, semaine, week-end, aujourd'hui, demain, clock times) | 11 | sios.json (SIO-004); content/collections/days.json + content/days-letris.json; unit0-questions.ts; finale.ts; content/lessons/native/quel-jour.tsx (+ .gen.ts); textgen/unit0.ts | « l'après-midi » → « midi » · « EN SEMAINE / LE WEEK-END » → English column labels · « Il est 20 h. — ___, madame ! » → « Samedi soir : « ___, madame ! » » | SIMPLIFY → matin, midi, soir. MOVE « Minuit ! … Bonne ___ ! » → U2. |
| Unit 1–2 grammar (ta/ton/mon, être, aller, « On fait quoi ? », toi, quel, qu'est-ce que, *Qui est-ce ?*, the article rule, inversion) | 20 | content/collections/tu-vous.json + content/tu-vous.json; content/collections/consignes.json; finale.ts; content/lessons.ts + content/conjugaison.ts (SIO-001 → être); content/lessons/native/tu-vous.tsx, on-fait-quoi.tsx; memos.tsx; textgen/unit0.ts | « ta petite sœur » → « une petite fille » · « Madame, comment ___ appelez-vous ? » → « Madame, vous ___ appelez comment ? » · « Tu parles français ? » → « Tu t'appelles comment ? » | SIMPLIFY. MOVE « On fait quoi ? » → U2. Unlink SIO-001 from `conjugaison-u1` and from être. |
| Nouns from Units 1–2 (professeur, nom, livre, cahier, tableau, café, football…) | 6 | content/collections/core-nouns.json + content/core-nouns.json; unit0-questions.ts; finale.ts; textgen/unit0.ts | LIVRE, CAHIER, TABLEAU → U2 · PROFESSEUR, NOM → U1 · « étudiante en droit » → cut | MOVE |
| Classroom language that is not a book consigne | 6 | unit0-questions.ts; finale.ts; memos.tsx (consignes) | « Vous pouvez ___, s'il vous plaît ? » → « Écoutez et ___ ! » (répétez) · « Nous partons : Au ___ ! » → « Au ___, madame ! » · « je vous présente Marc » items → cut | SIMPLIFY/CUT. CUT the "-ez = polite command" rule line. |
| Accent and gender rules | 3 | finale.ts; content/lessons/native/ca-secrit.tsx (+ .gen.ts), core-nouns.tsx | Inès "E accent grave" (taught in no unit) → cut · "-ité is always feminine" → cut · the accent aigu items → MOVE to U1 | CUT / MOVE |

### Unit 1 — 103 rows

| Cause | Rows | Files | Examples → in-scope replacement | Proposal |
|---|---|---|---|---|
| Unit 2 grammar used early (possessives, on = nous, aimer/adorer/mais, préférer, « C'est un + profession », *Qui est-ce ?*, pas de, ne… plus, il y a, aujourd'hui/demain) | 28 | content/sios/sios.json (SIO-012, -015); content/pretests/u1-sio011, -014, -017, -018.json; content/ateliers.ts; content/finale.ts; content/textgen/unit1.ts; games/compose/banks-production.tsx; content/lessons/native/moi-aussi, professions, conjugaison-u1, negation (via content/lessons.ts), quel-prefere, langues-pays, atelier-pays | « Mon père a soixante ans. » → « Il a soixante ans. » · « Nous, on étudie » → « Nous, nous sommes étudiants » · « Vous préférez quelles couleurs ? » → « Vous connaissez quels pays ? » | SIMPLIFY. MOVE the possessive half of `quel-prefere` → U2. Take `negation` off SIO-014. |
| Unit 3–4 words in Unit 1 sentences (envie/besoin, calme, sympa, weather, hôpital, université, boulangère, ces, sandwich, beaucoup de, sur/dans, deuxième, grand/petit) | 21 | content/collections/avoir-etats.json + content/avoir-etats.json; pretests u1-sio011, -012, -014, -018, -019; ateliers.ts; finale.ts; banks-production.tsx; content/lessons/native/nombres-echanges, avoir-etats; content/lessons/native/revisions.tsx | « Il travaille à l'hôpital » → « Il est ___ : il chante. » (chanteur) · « ces croissants sont pour vous » → « — Vous êtes français ? — Nous, oui ! » · « J'ai besoin d'un café. » → cut | SIMPLIFY/CUT. *content* is now fine; *calme* is not. |
| Telling the time and Unit 2 greetings | 10 | pretests/u1-sio019.json; finale.ts; content/gcompris.ts (3 scenes); textgen/unit1.ts; games/compose/banks.tsx; moi-aussi.tsx | « Il est midi. Vous avez faim ? » → « Vous avez faim ? » · « Il est minuit. J'ai envie de dormir. » → « Bof… Je suis ___. » (fatigué) · « Enchantée ! » chips → cut | SIMPLIFY. MOVE the 3 G-Compris scenes → U2 (retag them). |
| Country prepositions, *venir de*, *en* + continent (Unit 3) | 10 | pretests/u1-sio016, -017; finale.ts; banks-production.tsx; content/lessons/native/langues-pays.tsx (+ .gen.ts) | « Il vient du Portugal : il est ___ » → « Le pays, c'est le Portugal : il est ___ » · « En Allemagne, on parle ___ » → « Il est allemand : il parle ___ » · « Le Portugal est ___ Europe » → MOVE to U3 | SIMPLIFY. MOVE the `langues-pays` "prep" mode → SIO-032. |
| School subjects (SIO-013) | 9 | sios.json; content/collections/matieres.json + content/matieres.json; pretests/u1-sio013.json (31 items); finale.ts; gcompris.ts; textgen/unit1.ts; content/lessons/native/quelle-matiere.tsx (+ .gen.ts); memos.tsx | « J'étudie le droit » → cut · « étudiante en chimie » → « Elle ___ étudiante. » · « étudiant(e) en <matière> » → « Je suis étudiant(e). » | CUT (a whole-goal question) |
| Professions and nationalities not in the book | 7 | content/collections/professions.json, nationalities.json; content/nationalities-letris.json; pretests/u1-sio016; finale.ts; content/lessons/native/professions.tsx, nationalities.tsx (+ .gen.ts); memos.tsx | médecin, artiste → photographe, pâtissier · grec/grecque, turc/turque → cut · rule "-eur → -euse" → cut the rule, keep the pairs | SIMPLIFY/CUT |
| Language names with an article; *un peu* | 6 | sios.json (SIO-017); content/collections/languages.json; content/languages-letris.json; memos.tsx; textgen/unit1.ts; langues-pays.tsx | « Je parle le français » → « Je parle français » · « …et un peu français » → cut | SIMPLIFY → the book's 6 languages, with no article |
| Stressed pronoun after a preposition (Unit 7) | 4 | sios.json (SIO-011); pretests/u1-sio011; finale.ts; memos.tsx | « Je suis avec lui » → « C'est Marc ? Oui, c'est lui. » · « Tu viens avec ___ ? » → cut | SIMPLIFY/CUT |
| Inversion | 3 | pretests/u1-sio019; finale.ts; textgen/unit1.ts | « Quel âge as-tu ? » → « Tu as quel âge ? » · « Qui suis-je ? » → « C'est qui ? » | SIMPLIFY |
| tu-commands, *s'il te plaît*, *avoir sommeil* | 3 | pretests/u1-sio019; banks-production.tsx | « Ferme la fenêtre, s'il te plaît. » → « J'ai froid ! » · « J'ai sommeil. » → « J'ai soif. » · « Parle-moi du Canada ! » → « C'est quel pays ? » | SIMPLIFY |
| Dates (months, *mille*, *né*) | 2 | content/lessons/native/nombres-echanges.gen.ts ("date" mode), avoir-etats.gen.ts ("naissance" round) | « C'est le premier mai deux mille cinq » → cut | CUT |

### Unit 2 — 138 rows

| Cause | Rows | Files | Examples → in-scope replacement | Proposal |
|---|---|---|---|---|
| pouvoir, devoir and pronominal verbs (SIO-029) | 23 | content/sios/sios.json (SIO-029); content/collections/vouloir-inviter.json; content/pretests/u2-sio029.json; content/finale.ts; content/textgen/unit2.ts; content/conjugaison.ts; content/lessonVerbs.ts; games/compose/banks.tsx, banks-production.tsx; content/lessons/native/conjugaison-er, negation, rendezvous, modaux | « Désolé(e), je ne peux pas. » → « Désolé(e), je ne suis pas libre. » · « On se retrouve samedi ? » → « RDV samedi au cinéma ? » · « On peut se voir samedi ? » → « Tu es libre samedi ? » | SIMPLIFY. CUT pouvoir from SIO-029's ConjugaZone tables. Unlink `modaux`. |
| Unit 3 grammar used early (qu'est-ce que + verb, à + city / en + country, y, *où* questions, revenir, prendre, lire, the pronoun *en*, À bientôt) | 22 | pretests u2-sio022, -026; finale.ts; content/gcompris.ts; textgen/unit2.ts; lessonVerbs.ts; content/ateliers.ts (SIO-030); banks.tsx; banks-production.tsx; content/lessons/native/atelier-email, conjugaison-er, modaux | « Et toi, qu'est-ce que tu fais ? » → « Et toi, tu fais quoi ? » · « Bonne journée et à bientôt ! » → « …et à samedi ! » · « Tu vas où ? » → « Tu ___ au cinéma ? » | SIMPLIFY. MOVE the *au Portugal* G-Compris scene → U3. |
| Unit 7 forms: notre, nos, leur, leurs; *mon* before a feminine vowel; *avec nous*, *chez moi* | 18 | sios.json (SIO-022); pretests u2-sio022, -029; finale.ts; gcompris.ts; textgen/unit2.ts; banks-production.tsx; vouloir-inviter.json; content/lessons/native/possessifs.tsx, aller.tsx (+ .gen.ts) | « Bienvenue dans notre appartement ! » → cut · « Tu veux venir avec nous au cinéma ? » → « Tu ___ venir au cinéma ? » · `aller` chips « chez moi, chez un ami » → cut | CUT/SIMPLIFY |
| Unit 4 food, manger/boire, partitives, il faut, ce + noun | 18 | sios.json (SIO-028); content/collections/negation-pas.json, possessives.json; pretests u2-sio021, -028; finale.ts; memos.tsx; modaux.tsx | « Il n'y a pas d'eau. » → « Il ne fait pas d'athlétisme. » · « Je n'aime pas ___ poisson. » → « …___ football. » · « Nous ne mangeons pas de chocolat » → MOVE to U4 | SIMPLIFY/MOVE → U4 |
| Unit 3 places used in Unit 2 (parc, marché, magasins; école, hôpital, gare, banque, université, supermarché) | 15 | sios.json (SIO-026); content/collections/aller-destinations.json + content/aller-destinations.json; pretests/u2-sio026; finale.ts; textgen/unit2.ts; banks-production.tsx; content/lessons/native/aller.tsx (+ .gen.ts) | « à l'école » → « à l'opéra » · « au parc » → « au musée » · « aux magasins » → « aux toilettes » | SIMPLIFY (these places are fine from Unit 3) |
| pourquoi / parce que (SIO-025) | 9 | sios.json; content/collections/parce-que.json; pretests/u2-sio025; finale.ts; memos.tsx; banks-production.tsx; content/lessons/native/parce-que.tsx | « Pourquoi tu aimes… ? — Parce que… » → the whole stop | MOVE → U6 (a whole-goal question) |
| Frequency (Unit 4) | 8 | sios.json (SIO-027); content/collections/quand-time.json + content/quand-time.json; pretests/u2-sio027; finale.ts; textgen/unit2.ts | « tous les soirs » → « le soir » · « — Oui, souvent ! » → « — Oui, le samedi ! » | SIMPLIFY; MOVE the FRÉQUENCE column → U4 |
| Telling the time beyond the book | 8 | pretests/u2-sio027; gcompris.ts (3 scenes); content/lessons/native/quand.tsx | « deux heures et demie » → « neuf heures ___ » (trente) · « Alors à 2 heures » (14 h) → « à 14 heures » · « zéro heure trente » → « minuit » | SIMPLIFY. CUT the *une heure* concept. |
| Wishes not in the box; *s'il te plaît* | 6 | sios.json (SIO-030); vouloir-inviter.json; ateliers.ts; banks.tsx; banks-production.tsx; atelier-email.tsx | « Bon anniversaire » → « Joyeux anniversaire » · « Félicitations » → « Bonne santé » · « s'il te plaît » chip → cut | SIMPLIFY/CUT |
| Other early or absent items (règle, piano, school subjects, comprendre/apprendre) | 11 | content/collections/objets-articles.json, faire-activites.json; banks.tsx; content/lessons/native/qu-est-ce-que-c-est.gen.ts, aimer.tsx (+ .gen.ts); finale.ts; textgen/unit2.ts; pretests/u2-sio027; gcompris.ts; lessonVerbs.ts | « une règle » → « une valise » · « Elle fait du piano » → « Elle fait de la danse » · « Le lundi, j'ai français » → « Le lundi, je fais du sport » | CUT/SIMPLIFY |

### Unit 3 — 191 rows

| Cause | Rows | Files | Examples → in-scope replacement | Proposal |
|---|---|---|---|---|
| Weather words not in the box (mauvais, frais, doux, il gèle, il grêle, brouillard, tonnerre, tempête, il tonne, il bruine, verglas, depuis, il va pleuvoir, months, parapluie) | 33 | content/sios/sios.json (SIO-031); content/collections/weather-letris.json + content/weather-letris.json; content/pretests/u3-l1-weather.json; content/finale.ts; content/memos.tsx; content/lessons/native/meteo.tsx | « Il fait mauvais. » → cut · « Au printemps, il fait doux. » → « …il fait beau. » · « Il pleut depuis ce matin. » → « Il pleut aujourd'hui. » | CUT/SIMPLIFY |
| Places not in the book (pharmacie and mairie are named out; église, aéroport, arrêt de bus, librairie, bureau, parking, plage, centre-ville, avenue are not in the book) | 32 | sios.json (SIO-033); content/collections/lieux-letris.json + content/lieux-letris.json; pretests/u3-sio033, -035, -036; finale.ts; content/textgen/unit3.ts; games/compose/banks.tsx, banks-production.tsx; memos.tsx; content/lessons/native/prepositions-core, prepositions-lieux, ou-est.gen, le-chemin.gen | « Je vais à la pharmacie. » → « Je vais à la banque. » · « La mairie se trouve en face de la gare. » → « La poste se trouve… » · « aéroport » → cut | SIMPLIFY → the book's places, which now include gare, banque, poste, hôpital, école, université, boulangerie and supermarché |
| Direction and distance phrases not in the book (au bout de, arrivé(e), sortir/partir/arriver, jusqu'au carrefour, pont, passage piéton, là-bas/partout, moto/taxi/tramway, premièrement, environ, un quart d'heure) | 32 | sios.json (SIO-036); content/collections/directions-matching.json, loin-lesson.json, transport.json (+ Letris tiles); pretests u3-sio036, -038; finale.ts; textgen/unit3.ts; banks.tsx; banks-production.tsx; memos.tsx; ou-est.gen.ts, le-chemin.gen.ts, transport.gen.ts | « C'est au bout de la rue. » → « C'est à droite. » · « Vous sortez de la station. » → « Vous continuez tout droit. » · « un quart d'heure » → « quinze minutes » | CUT/SIMPLIFY |
| Unit 4 content (souvent, parfois, tous les jours, beaucoup de, ce + noun, manger/food, partitive explanations, il faut, futur proche, 96) | 31 | sios.json (SIO-036); content/collections/weather-letris, question-words, envies-besoins; pretests u3-l1-weather, u3-l2-city-preps, u3-sio036, -038; finale.ts; textgen/unit3.ts; content/lessons/native/ou-est, le-chemin, modaux, envies-besoins, revisions | « Au feu rouge, il faut tourner à gauche. » → « Au café, vous ___ à gauche. » (tournez) · « Il y a beaucoup de nuages. » → « Il y a des nuages. » · « Ce vin vient de France. » → « Je viens de France. » | SIMPLIFY; MOVE the *il faut* and *il va pleuvoir* items → U4 |
| pouvoir as a full table, devoir, pronominal verbs (SIO-037) | 22 | sios.json (SIO-037); content/collections/pouvoir.json; pretests u3-sio035, -037; finale.ts; textgen/unit3.ts; content/lessons/native/pouvoir.tsx (+ .gen.ts), modaux.tsx (+ .gen.ts); content/conjugaison.ts | « Ils peuvent attendre ici. » → cut · « Tu peux te garer là. » → cut · « nous ___ entrer ? » (pouvons) → « on ___ entrer ? » (peut) | MOVE → U6, or keep only *je peux / tu peux / on peut / vous pouvez* (a whole-goal question) |
| Countries not in the book's list (Brésil, Philippines, Maldives, Inde, Israël, Mozambique…; compass points; continents taught as a rule) | 14 | content/collections/en-au-aux-a.json + content/en-au-aux-a.json; pretests/u3-l2-city-preps; finale.ts; textgen/unit3.ts; banks-production.tsx; content/lessons/native/prepositions.tsx, prepositions-core.tsx | « au Brésil » → « au Mexique » · « aux Philippines » → « aux Seychelles » · « en Inde » → « en Iran » | SIMPLIFY (depends on the Unit 1 country-list answer) |
| Question words from later units (pourquoi, où/comment + est-ce que), and inversion | 11 | sios.json (SIO-034); content/collections/question-words.json; pretests/u3-sio034; finale.ts; content/lessons/native/mots-interrogatifs.tsx | « Pourquoi tu étudies le français ? » → cut · « Où est-ce que tu vas ? » → « Est-ce que tu vas au cinéma ? » · « Quel âge as-tu ? » → « Tu as quel âge ? » | CUT/SIMPLIFY (a whole-goal question) |
| Other later forms (notre, the pronoun en, negation with y, future/conditional/past distractors, tu-commands, *s'il te plaît*, 200, revenir and 10 verbs with no box, the U1 revision pulling in U3 lessons) | 16 | pretests u3-sio035, -036, -038, -039; finale.ts; banks-production.tsx; content/lessons/native/revisions.tsx; content/lessonVerbs.ts | « C'est notre neuvième soirée » → « C'est la neuvième rue » · « Tu ___ m'aider, s'il te plaît ? » → cut · « 200 mètres » → « 50 mètres » | CUT/SIMPLIFY |

### Unit 4 — 65 rows

| Cause | Rows | Files | Examples → in-scope replacement | Proposal |
|---|---|---|---|---|
| devoir, and pouvoir beyond *tu peux / vous pouvez* (SIO-048) | 19 | content/sios/sios.json (SIO-048); content/collections/modaux-avis.json; content/modaux-letris.json; content/pretests/u4-sio048-advice.json; content/finale.ts; content/textgen/unit4.ts; content/conjugaison.ts; content/lessonVerbs.ts; content/lessons/native/conseils.tsx, modaux.tsx | « Tu dois manger des légumes. » → « Il faut manger des légumes. » · « Elle peut cuisiner. » → « Tu peux cuisiner. » · « Tu es fatigué : tu ___ dormir ! » (dois) → « …il ___ dormir ! » (faut) | SIMPLIFY → *il faut / tu peux / vous pouvez* |
| Quantity words not in the box (assez de, trop de, une tranche, une douzaine, il me faut) | 12 | content/collections/partitifs.json; pretests/u4-sio047.json, u4-sio048-advice.json; finale.ts; content/lessons/native/au-marche.tsx (+ .gen.ts); games/compose/banks.tsx | « une tranche de jambon » → « un morceau de fromage » · « une douzaine d'œufs » → « une barquette de fraises » · « trop de sel » → « beaucoup de sel » | SIMPLIFY. *Un morceau, un paquet, une botte, une barquette* and *cl* are now in scope. |
| le goûter (a 4th meal) | 6 | sios.json (SIO-041); content/collections/aliments.json; pretests/u4-sio041.json; textgen/unit4.ts; content/lessons/native/aliments.tsx; banks.tsx | « Pour le goûter, elle mange une pomme. » → « Au déjeuner, elle mange une pomme. » | CUT → 3 meals |
| Appreciation forms that are out (trop + adjective, *Quel… !*, c'était, Dis-moi) | 5 | sios.json (SIO-049); finale.ts; games/compose/banks-production.tsx | « C'est trop cher » → « C'est un peu cher » · « c'était comment ? Dis-moi… » → « Alors, ce restaurant, c'est comment ? » | SIMPLIFY |
| -là, demonstrative pronouns, and notre accepted as an answer | 5 | finale.ts; pretests/u4-sio047.json | « ce fromage-là » → « ce fromage » · distractors *celui / ceux* → *ce / cette* | SIMPLIFY (*ces* is now fine) |
| Definite vs partitive taught as a contrast with aimer | 3 | sios.json (SIO-042); content/collections/partitifs.json; pretests/u4-sio042.json | « J'aime le pain → Je mange du pain » → « Je mange du pain → Je ne mange pas de pain » | a whole-goal question |
| septante / nonante as distractors | 2 | pretests/u4-sio045a-nombres.json; content/lessons/native/soixante-dix.gen.ts | « nonante-neuf » → « quatre-vingt-dix-neuf » traps such as « soixante-dix-un » | SIMPLIFY (traps a learner could produce, as the 1 Sep rule on wrong answers requires) |
| Other (the pronoun en, y with other verbs, the passé composé, Merci beaucoup, ne… rien, pharmacie, the 56-food list, de temps en temps, du matin) | 11 | content/collections/commerces.json; textgen/unit4.ts; banks.tsx; banks-production.tsx; finale.ts; memos.tsx; content/devine-aliments.json; pretests u4-sio041, u4-sio045 | « Je vous en mets combien ? » → cut · « Vous avez réservé ? » → « Une table pour combien de personnes ? » · « de temps en temps » → « quelquefois » | CUT/SIMPLIFY |
| **Not about scope: French errors** | 2 | content/collections/modaux-plans.json (item 09); content/lessons/native/au-marche.gen.ts | « Je ne vais pas faire du sport » → « …de sport » · « deux de baguettes », served as the right answer → « deux baguettes » | Fix in any case |

## (c) Whole-goal issues still standing

Closed by the rulings, so no longer questions: s'appeler in 4 persons only (SIO-001); persons app-wide in Unit 2; SIO-046 *ces*; SIO-047 "all persons"; the test-only places that SIO-033, -035 and -036 rest on; aller nous/ils in Unit 3; *content* in SIO-019.

Still standing, one question each:

| Goal | Question for Dan |
|---|---|
| SIO-001 | Unlink SIO-001 from the être/avoir lesson and ConjugaZone's être, which are Unit 1? |
| SIO-002 | Keep tu/vous as recognition only, and drop "give a reason" and the "plural vous" situations? |
| SIO-003 | Keep the 7 vowel-sound groups and "E accent aigu" in Unit 0, or limit them to vowels/consonants and lip shape? |
| SIO-004 | Replace *après-midi* with *midi* and drop the weekday/weekend split? |
| SIO-005 | Cut to rouge + bleu, move 8 colours to Units 1–2, and drop orange/marron/beige (in no unit)? |
| SIO-006 | Make SIO-006 a word list only: no gender rule, no « C'est qui ? », and cut "-ité is feminine"? |
| SIO-007 | Cut to 0–10, move 11–20 into Unit 1, and keep « Combien… ? » but drop the « Il y a… » frame? |
| SIO-008 | Swap « Notez ! » for a book consigne and move « On fait quoi ? » to Unit 2? |
| SIO-009 | Limit greetings to Bonjour / Bonsoir / Salut / Au revoir, and move the rest to Units 1–3? |
| SIO-010 | *Enchanté(e)* is in no unit of the book: drop it as a scored step everywhere, or keep it as your own addition? |
| SIO-011 | Drop "after a preposition" (Unit 7), and keep *moi aussi / moi non plus*, which the book does not show? |
| SIO-012 | Limit the stop to « il est / elle est + profession », dropping « C'est un/une » and the -euse/-trice rules? |
| SIO-013 | Cut school subjects (not in the book), or replace the stop with *formules de politesse* (Bk p.26, which has no stop)? |
| SIO-014 | Take the Unit 2 `negation` lesson off SIO-014? |
| SIO-015/016 | Keep the Singapore-relevant countries the book lacks (Singapour, Malaisie, Thaïlande…), or switch to the book's list (Liban, Sénégal, Gabon, luxembourgeois…)? |
| SIO-017 | Reduce to « Tu parles quelles langues ? — Je parle X » with the book's 6 languages and no article? |
| SIO-019 | Cut *avoir envie/besoin*, *calme* and the birth-date round, leaving faim/soif/chaud/froid plus triste/fatigué/en forme/malade/content/peur? |
| SIO-020 | Saying where a country is needs *en Europe* (Unit 3): drop "location" from the task, or move it to Unit 3? |
| SIO-022 | Cut notre/nos/leur/leurs and « mon + feminine vowel » from the goal and the lesson table? |
| SIO-025 | Move « Pourquoi ? / Parce que » to Unit 6, or keep *parce que* as listen-only and give the stop a new job? |
| SIO-026 | Restrict places to the Unit 2 list (théâtre, musée, cinéma, patinoire, restaurant, bar, piscine, bibliothèque, café, stade, opéra, toilettes) and stop drilling *chez*? |
| SIO-027 | Move « tous les jours » to Unit 4, and rebuild the `quand` lesson on *le lundi / à + heure* without *une heure* or *zéro heure*? |
| SIO-028 | Drop "quantities" and the food items, and drill *pas de* with faire and *le/la/les* with aimer? |
| SIO-029 | Rebuild refuse and reschedule on the book's kit (Tu veux venir ? Tu es libre ? D'accord / Je veux bien), with no pouvoir and no *se voir*? |
| SIO-030 | Use « Joyeux anniversaire » for « Bon anniversaire », and are *d'abord / ensuite / enfin* allowed (see d)? |
| SIO-034 | Reduce the "7 question words" to *est-ce que / qu'est-ce que* plus *combien*, with *pourquoi* out and *comment/où* as set phrases only? |
| SIO-036 | Remove *il faut* and *au bout de* from the competence, using *vous + present* only? |
| SIO-037 | Move pouvoir to Unit 6, or keep only the 4 seen chunks (je peux, tu peux, on peut, vous pouvez) as phrases? |
| SIO-040 | Are the sequencing connectors that the whole stop rests on in scope (see d)? |
| SIO-041 | Three meals, no *goûter*? |
| SIO-042 | Drop the « J'aime le / Je mange du » contrast and drill the partitive and *pas de* only? |
| SIO-044 | Replace *tranche / douzaine / il me faut* with the book's quantities (now including morceau, paquet, botte, barquette)? |
| SIO-048 | Rename the stop « Donner un conseil — il faut / tu peux / vous pouvez » and remove devoir everywhere? |
| SIO-049 | Rebuild the verdict on the guide's words (long, rapide, délicieux, un peu élevés, Excellent !) in place of « Je recommande », « trop cher » and « lent »? |

## (d) Unclear items that need Dan — 175 rows

| Group | Rows | Example |
|---|---|---|
| Everyday words outside the book's word lists (family, extra objects, sports, foods, shops) | 64 | père, mère, frère · crayon, passeport · judo, escalade · riz, frites, jambon, sushis · librairie, monnaie · étudiant(e) |
| Small grammar points the ceilings file never mentions | 18 | -euse feminines · "countries in -e are feminine" · *de* of possession · *il/elle* for objects · un verre de · il faut + noun · *ce n'est pas du* · jouer au · là / ici / voici |
| Question frames the book does not box | 12 | quand · « Comment on va au musée ? » · *si* and *n'est-ce pas* · « C'est qui / où / quoi ? » · *moi aussi* |
| Social phrases not in the book | 13 | Coucou, À plus · Bonjour à tous · Mademoiselle · Ça me convient, Plutôt dimanche ? · Bises, Bon rétablissement · the waiter's « Autre chose ? » |
| Sequencing connectors (SIO-030, SIO-040) | 12 | d'abord, ensuite, puis, enfin |
| *il y a* as a frame | 10 | il y a du soleil / de la pluie · il n'y a pas de café · Il y a quarante étudiants |
| Alphabet and classroom teaching choices (Unit 0) | 9 | 7 vowel-sound groups · E accent aigu · tu/vous rules · « Notez ! » · « Vous vous écrivez… » |
| Small time and number details | 8 | Il est douze heures · vingt et une heures · trente et une personnes · ce mois, cette nuit · à 9 h précises |
| Verbs with no box that ConjugaZone or sentences use | 8 | utiliser, porter, oublier, dormir, vendre, mettre, voir · visiter, sortir, rentrer, courir |
| Restaurant-review words (SIO-049) | 7 | je recommande · lent · *je trouve que* |
| Countries, nationalities and languages beyond the book's lists (Unit 1) | 7 | Singapour, Malaisie · tamoul, mandarin · the 185-country expert set · transfer probes indien, égyptien |
| Guide-model-only items the rulings do not name | 4 | traverser (3 rows) · régulièrement (1) |
| "Location" in SIO-020 | 3 | « en Europe » · « Où est-ce ? » |
