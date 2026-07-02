# FluoLingo — Pretest questions for the remaining SIOs (v2, legacy-based — validation copy)

_Generated 2 Jul 2026, v2. Questions are **based on the laf1201.withdrchan.com bank** (795 items
extracted to `docs/handoff/legacy-laf1201-questions.json`), adapted — not copied blindly. Format
per Dan's minimalist rule — each question is exactly four things: the **gapped sentence in
French**, the **TTS** (always the full completed sentence), the **intended meaning in English**,
and the **choices** (correct in **bold**)._

**Leaks cut during adaptation** (recurring patterns in the legacy bank):
- Hint-in-question: the countries quiz said "(masculine, consonant start)" in the question — answers themselves. All such hints stripped; the sentence frame does the work.
- Imperative stems: the legacy directions quiz is built on *Tournez/Prenez/Continuez* — guard-rail violation. Rewritten into *il faut + inf / on + présent / c'est* frames; imperative forms survive only as **wrong** distractors.
- Tense leaks: legacy pronoun-y items used passé composé (*j'y suis allé*) and imperatives (*Vas-y*) — dropped or recast in the present.
- Capitalisation leak: one nationality item's only capitalised option was the answer — replaced.
- Nonsense distractors (*chève*, *thaïlandas*) that eliminate themselves — replaced with credible morphology.
- Story-character names (Wei, Mateo, Amara, Madame Benali) de-branded to neutral ones.
- Vocabulary aligned to the locked lists: countries restricted to the 25-country list, professions to the deck's 10.

Already live: SIO-031 (weather), SIO-032 (city/country preps). Unit 0 has its own popup quizzes.
Production SIOs get no pretest. Where the legacy bank has no coverage (013, 018, 025, 028, 033,
037, 039), the v1 authored sets stand — repeated here so this document is complete.

---

## Unité 1

### SIO-011 · Stress pronouns _(source: legacy 0-03 + 0-03b)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | — Qui est là ? — C'est ___ ! | — Who's there? — It's me! | **moi** · vous · elles · nous |
| 2 | Moi, c'est Léa. Et ___ ? | Me, I'm Léa. And you? | **toi** · tu · nous · elle |
| 3 | C'est Marc. Je suis avec ___ en classe. | That's Marc. I'm with him in class. | **lui** · nous · eux · vous |
| 4 | Mika est japonaise. Je parle avec ___ en français. | Mika is Japanese. I speak French with her. | **elle** · moi · lui · eux |
| 5 | Marc et Anna sont dans mon groupe. J'étudie avec ___. | Marc and Anna are in my group. I study with them. | **eux** · vous · toi · elles |
| 6 | ___ suis étudiant. | I am a student. | **Je** · Moi |
| 7 | ___, je suis français. | Me, I'm French. | **Moi** · Je |
| 8 | ___, il est mexicain. | Him, he's Mexican. | **Lui** · Il |

### SIO-012 · Professions _(source: legacy 1-05, restricted to the deck's 10 professions)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Elle est ___. | She is a journalist. | **journaliste** · journalistes · journalist · journalière |
| 2 | Elle est ___. | She is a student. | **étudiante** · étudiant · étudie · étudiantes |
| 3 | Elle est ___. | She is an actress. | **actrice** · acteur · actrise · acteuse |
| 4 | Il est ___. | He is an actor. | **acteur** · actrice · acteurs · actor |
| 5 | Elle est ___. | She is a chef. | **cheffe** · chef · chefe · cheffes |
| 6 | Il est ___. | He is a fashion designer. | **styliste** · stylistes · stylist · stylisteur |
| 7 | Elle est ___. | She is a singer. | **chanteuse** · chanteur · chanteure · chanteuses |
| 8 | Il est ___ de tennis. | He is a tennis player. | **joueur** · joueuse · jouer · jeu |

### SIO-013 · Matières _(no legacy coverage — v1 authored set)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | J'étudie ___ français. | I study French. | **le** · la · l' · les |
| 2 | Elle étudie ___ économie. | She studies economics. | **l'** · le · la · les |
| 3 | Nous étudions ___ mathématiques. | We study mathematics. | **les** · le · la · l' |
| 4 | Tu étudies ___ chimie ? | Do you study chemistry? | **la** · le · l' · les |
| 5 | Je suis étudiant ___ droit. | I'm a law student. | **en** · au · de · à |

### SIO-014 · Subject pronouns + ÊTRE _(source: legacy 1-04, 8 of 32, de-branded)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Je ___ singapourien. | I am Singaporean. | **suis** · sont · êtes · sommes |
| 2 | Tu ___ français ? | Are you French? | **es** · est · sommes · sont |
| 3 | Il ___ professeur. | He is a professor. | **est** · sommes · êtes · suis |
| 4 | On ___ étudiants à NUS. | We're students at NUS (casual "on"). | **est** · êtes · es · sommes |
| 5 | Nous ___ dans la même classe. | We are in the same class. | **sommes** · sont · êtes · suis |
| 6 | Vous ___ le professeur de français ? | Are you the French professor? | **êtes** · sont · sommes · est |
| 7 | Marie et Léa ___ étudiantes. | Marie and Léa are students. | **sont** · êtes · es · est |
| 8 | Je ___ en retard, pardon ! | I'm late, sorry! | **suis** · es · est · sommes |

### SIO-015 · Countries _(source: legacy 1-06, hints stripped, restricted to the 25-country list)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Le pays, c'est ___ France. | The country is France. | **la** · le · l' · les |
| 2 | Le pays, c'est ___ Portugal. | The country is Portugal. | **le** · la · l' · les |
| 3 | Le pays, c'est ___ Allemagne. | The country is Germany. | **l'** · la · le · les |
| 4 | Le pays, c'est ___ États-Unis. | The country is the United States. | **les** · le · la · l' |
| 5 | Le pays, c'est ___ Mexique. | The country is Mexico. | **le** · la · l' · les |
| 6 | Le pays, c'est ___ Philippines. | The country is the Philippines. | **les** · la · le · l' |
| 7 | Le pays, c'est ___ Singapour. | The country is Singapore. | **∅ (no article)** · le · la · les |
| 8 | Le pays, c'est ___ Algérie. | The country is Algeria. | **l'** · la · le · les |

### SIO-016 · Nationalities _(source: legacy 1-07, capitalisation leak + off-list items fixed)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Marie est ___. | Marie is French. | **française** · français · françaises · francaise |
| 2 | Pierre et Marie sont ___. | Pierre and Marie are French. | **français** · françaises · française · francs |
| 3 | Marie et Léa sont ___. | Marie and Léa are French. | **françaises** · français · française · françaisses |
| 4 | Emma est ___. | Emma is English. | **anglaise** · anglais · anglaises · angleterre |
| 5 | Léa est ___. | Léa is Singaporean. | **singapourienne** · singapourien · singapouriens · singapourienne­s |
| 6 | Jun est ___. | Jun is Singaporean. | **singapourien** · singapourienne · singapouriens · singapourain |
| 7 | Anna, Lukas et Felix sont ___. | Anna, Lukas and Felix are German. | **allemands** · allemande · allemandes · allemand |
| 8 | Sofia est ___. | Sofia is Greek. | **grecque** · grec · grecques · grecs |

### SIO-017 · Languages _(source: legacy 1-10; the bare-"parler français" items dropped — the deck teaches "on parle le français")_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | « ___ langue tu veux apprendre ? » | Which language do you want to learn? | **Quelle** · Quel · Quels · Quelles |
| 2 | « ___ langues vous parlez ? » | Which languages do you speak? | **Quelles** · Quelle · Quels · Quel |
| 3 | Mes parents ___ chinois et anglais. | My parents speak Chinese and English. | **parlent** · parle · parles · parler |
| 4 | À la maison, nous ___ français. | At home, we speak French. | **parlons** · parlent · parle · parlez |
| 5 | En France, on parle ___ français. | In France, people speak French. | **le** · l' · la · en |
| 6 | À Singapour, on parle l'anglais ___ le chinois. | In Singapore, people speak English and Chinese. | **et** · avec · mais · ou |
| 7 | Non, je ___ allemand. | No, I don't speak German. | **ne parle pas** · parle ne pas · ne parler pas · n'parle pas |

### SIO-018 · Numbers 20–69 _(no legacy coverage — v1 authored set)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | 31 : trente ___ un | thirty-one | **et** · - · plus · de |
| 2 | 44 : ___ | forty-four | **quarante-quatre** · quatre-quarante · quatorze-quatre · quarante-quatorze |
| 3 | 61 : soixante ___ un | sixty-one | **et** · - · plus · dix |
| 4 | 55 : ___-cinq | fifty-five | **cinquante** · quinze · cinq · soixante |
| 5 | 22 : vingt-___ | twenty-two | **deux** · et deux · douze · deuxième |

### SIO-019 · Avoir — age & states _(source: legacy 1-09b + 1-09c, de-branded)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Il est midi. Vous avez ___ ? | It's noon. Are you hungry? | **faim** · soif · froid · sommeil |
| 2 | J'ai ___ ! Ferme la fenêtre, s'il te plaît. | I'm cold! Close the window, please. | **froid** · chaud · peur · raison |
| 3 | Je ___ sommeil. Je rentre. | I'm sleepy. I'm going home. | **ai** · suis · a · est |
| 4 | — Quel âge as-tu ? — J'___ 21 ans. | — How old are you? — I'm 21. | **ai** · suis · a · ont |
| 5 | Anna et Mika ___ très froid. | Anna and Mika are very cold. | **ont** · a · as · avez |
| 6 | Tu ___ fatigué ! | You're tired! | **es** · as · a · avez |
| 7 | Je ___ malade. Je rentre. | I'm ill. I'm going home. | **suis** · ai · es · est |
| 8 | Marc et moi, nous ___ froid. | Marc and I, we're cold. | **avons** · sommes · avez · êtes |

---

## Unité 2

### SIO-021 · c'est / ce sont + un/une/des _(source: legacy 2-05)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Dans mon sac, il y a ___ livre. | In my bag, there's a book. | **un** · une · des · le |
| 2 | Dans mon sac, il y a ___ trousse. | In my bag, there's a pencil case. | **une** · un · des · la |
| 3 | Dans mon sac, il y a ___ stylos. | In my bag, there are pens. | **des** · un · une · les |
| 4 | Sur la table, ___ une pomme. | On the table, there is an apple. | **il y a** · elle est · c'est · il a |
| 5 | ___ des livres. | They are books. | **Ce sont** · C'est · Il est · Elle est |
| 6 | Dans mon sac, il n'y a pas ___ livre. | In my bag, there's no book. | **de** · des · un · le |
| 7 | Non, ce n'est pas ___ livre, c'est un cahier. | No, it's not a book, it's a notebook. | **un** · de · d' · le |

### SIO-022 · Possessives _(source: legacy 2-13, adjectives only — the "c'est à moi" items are a different structure, dropped)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | J'ai oublié ___ livre chez moi. | I left my book at home. | **mon** · mes · ton · ma |
| 2 | Je voudrais vous présenter ___ famille. | I'd like to introduce my family. | **ma** · mon · sa · mes |
| 3 | Pierre a posé ___ sac sur la chaise. | Pierre put his bag on the chair. | **son** · sa · mon · ses |
| 4 | J'ai perdu ___ clés ! | I've lost my keys! | **mes** · mon · ma · tes |
| 5 | Je te présente ___ amie Camille. | Let me introduce my friend Camille. | **mon** · ma · ton · une |
| 6 | Bienvenue dans ___ appartement ! | Welcome to our apartment! | **notre** · nos · votre · son |
| 7 | Madame, montrez ___ passeport, s'il vous plaît. | Madam, your passport, please. | **votre** · vos · ton · notre |
| 8 | Les étudiants écoutent ___ professeur. | The students listen to their teacher. | **leur** · leurs · son · notre |

### SIO-023 · aimer _(source: legacy 2-07)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | J'aime ___ café. | I like coffee. | **le** · du · de · un |
| 2 | J'adore ___ musique classique. | I love classical music. | **la** · de la · une · le |
| 3 | J'aime ___ chats. | I like cats. | **les** · des · de · le |
| 4 | J'aime ___ avec mes amis. | I like dancing with my friends. | **danser** · danse · à danser · que je danse |
| 5 | Je n'aime pas ___ café. | I don't like coffee. | **le** · de · du · d' |
| 6 | Je préfère le cinéma ___ théâtre. | I prefer cinema to theatre. | **au** · à le · à la · que le |

### SIO-024 · faire + du/de la/de l'/des _(source: legacy 2-01)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Le week-end, je ___ du sport. | At the weekend, I do sport. | **fais** · fait · faire · fais le |
| 2 | Pierre ___ de la natation. | Pierre swims. | **fait** · fais · font · faits |
| 3 | Nous ___ des promenades le dimanche. | We go for walks on Sundays. | **faisons** · faisez · faits · sommes |
| 4 | Vous ___ de la musique ? | Do you play music? | **faites** · faisez · faisons · fais |
| 5 | Mes amis ___ du foot le samedi. | My friends play football on Saturdays. | **font** · fait · faits · sont |
| 6 | Avec mes amis, je fais ___ vélo. | With my friends, I go cycling. | **du** · de la · de l' · des |
| 7 | Non, je ___ pas de sport. | No, I don't do any sport. | **ne fais** · fais pas · n'fais · fais ne |

### SIO-025 · pourquoi ? parce que _(no legacy coverage — v1 authored set)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | ___ tu aimes le français ? | Why do you like French? | **Pourquoi** · Parce que · Quand · Comment |
| 2 | — Pourquoi tu vas au cinéma ? — ___ j'aime les films. | — Why do you go to the cinema? — Because I like films. | **Parce que** · Pourquoi · Quand · Où |
| 3 | Parce que c'est ___. | Because it's fun. | **amusant** · amusante · amusants · amuser |
| 4 | Parce que c'est ___. | Because it's quiet. | **calme** · calmes · le calme · calmer |

### SIO-026 · aller + au/à la/à l'/aux _(source: legacy 2-02)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Je ___ au cinéma ce soir. | I'm going to the cinema tonight. | **vais** · vas · va · allons |
| 2 | Nous ___ au restaurant samedi. | We're going to the restaurant on Saturday. | **allons** · vont · allez · va |
| 3 | Je vais ___ cinéma. | I'm going to the cinema. | **au** · à le · à la · à |
| 4 | Léa va ___ piscine le mardi. | Léa goes to the pool on Tuesdays. | **à la** · au · à le · à |
| 5 | Le patient va ___ hôpital. | The patient is going to the hospital. | **à l'** · au · à la · à le |
| 6 | Je vais ___ toilettes, je reviens. | I'm going to the toilet, I'll be back. | **aux** · au · à les · à la |
| 7 | L'année prochaine, je vais ___ Paris. | Next year, I'm going to Paris. | **à** · au · à la · en |

### SIO-027 · Time — when I do it _(v1 authored + legacy 2-08 scheduling items)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | ___ lundi, j'ai français. | On Mondays, I have French. | **Le** · Au · En · À |
| 2 | Je fais du sport ___ les soirs. | I do sport every evening. | **tous** · tout · toute · toutes |
| 3 | Le cours est ___ 8 heures. | The class is at 8 o'clock. | **à** · au · en · le |
| 4 | « ___ tu commences le travail ? » | What time do you start work? | **À quelle heure** · Quelle heure · C'est quand · Combien d'heures |
| 5 | Le film, ___ quelle heure ? | The film — (at) what time is it on? | **c'est à** · il est · il est à · c'est |
| 6 | Elle étudie ___ matin. | She studies in the morning. | **le** · au · à · en |

### SIO-028 · avec — with whom _(no legacy coverage — v1 authored set)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Je vais au cinéma avec ___. | I go to the cinema with them (m). | **eux** · ils · les · leur |
| 2 | Tu viens avec ___ ? | Are you coming with me? | **moi** · je · me · mon |
| 3 | Elle étudie ___. | She studies alone. | **seule** · seul · seules · la seule |
| 4 | Nous mangeons avec ___ amis. | We eat with our friends. | **nos** · notre · les · nous |

### SIO-029 · vouloir — inviting _(source: legacy 2-03)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Je ___ sortir ce soir. | I want to go out tonight. | **veux** · veut · voulez · voulons |
| 2 | Tu ___ venir avec nous au cinéma ? | Do you want to come to the cinema with us? | **veux** · veut · voulez · aimes |
| 3 | Pierre ___ un café. | Pierre wants a coffee. | **veut** · veux · voulons · veulent |
| 4 | Vous ___ un thé ou un café ? | Would you like tea or coffee? | **voulez** · voulons · veulent · veulez |
| 5 | Je ___ un sac, s'il vous plaît. | I'd like a bag, please (polite). | **voudrais** · veux · voudrai · voulez |
| 6 | Non, je ___ pas sortir ce soir. | No, I don't want to go out tonight. | **ne veux** · veux ne · n'veux · ne veut |

---

## Unité 3 (SIO-031 and SIO-032 already live)

### SIO-033 · Places in town _(no aligned legacy coverage — v1 authored set)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Je vais ___ pharmacie. | I'm going to the pharmacy. | **à la** · au · à l' · aux |
| 2 | Il est ___ marché. | He's at the market. | **au** · à la · à l' · aux |
| 3 | Elle vient ___ hôpital. | She's coming from the hospital. | **de l'** · du · de la · des |
| 4 | Nous allons ___ hôtel. | We're going to the hotel. | **à l'** · au · à la · aux |
| 5 | Ils viennent ___ restaurant. | They're coming from the restaurant. | **du** · de la · de l' · de |

### SIO-034 · Locating places _(source: legacy 3-09)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Mon passeport est ___ le sac. | My passport is in the bag. | **dans** · sur · en · à |
| 2 | Les assiettes sont ___ la table. | The plates are on the table. | **sur** · dans · à · sous |
| 3 | On se retrouve ___ le cinéma à 19h. | We're meeting in front of the cinema at 7pm. | **devant** · derrière · avant · face à |
| 4 | La pharmacie est ___ la boulangerie. | The pharmacy is next to the bakery. | **à côté de** · à côté du · au côté de · à côté |
| 5 | L'hôtel est ___ parc. | The hotel is opposite the park. | **en face du** · en face de · en face de la · face au |
| 6 | L'aéroport est assez ___ centre-ville. | The airport is quite far from the city centre. | **loin du** · loin de · loin de le · loin des |

### SIO-035 · Questions _(source: legacy 3-05)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | ___ (spoken, casual) | Where are you going? | **Tu vas où ?** · Où allez-vous ? · Où est-ce tu vas ? · Où tu vas-tu ? |
| 2 | ___ (neutral, est-ce que) | Where are you going? | **Où est-ce que tu vas ?** · Est-ce que où tu vas ? · Où est-ce tu vas ? · Où tu est-ce que vas ? |
| 3 | ___ ce musée ouvre ? | When does this museum open? | **Quand est-ce que** · Quand que · Est-ce que quand · Quand est-ce |
| 4 | ___ est le nom de ce musée ? | What is the name of this museum? | **Quel** · Quelle · Quels · Quelles |
| 5 | ___ ? — Dix euros. | How much is it? — Ten euros. | **C'est combien** · Combien c'est-il · Combien coûte-il · C'est comment |
| 6 | ___ est-ce que tu viens ? — En bus. | How are you coming? — By bus. | **Comment** · Combien · Quand · Pourquoi |

### SIO-036 · Directions + ordinals _(source: legacy 3-03 + 3-08 — imperative stems rewritten to il faut/on/c'est; imperatives survive only as wrong choices)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | C'est ___ droit. | It's straight ahead. | **tout** · tous · très · toute |
| 2 | Au feu rouge, il faut ___ à gauche. | At the red light, you have to turn left. | **tourner** · tournez · tourne · tourné |
| 3 | On prend la ___ rue à droite après le café. | You take the first street on the right after the café. | **première** · premier · premières · premièrement |
| 4 | Votre chambre est au ___ étage. | Your room is on the first floor. | **premier** · première · premièrement · un |
| 5 | Le Marais est dans le ___ arrondissement. | Le Marais is in the third arrondissement. | **troisième** · trois · troième · seconde |
| 6 | Il faut ___ à Châtelet. | You have to get off at Châtelet. | **descendre** · descendez · descend · descendu |
| 7 | La mairie se trouve ___ la gare. | The town hall is opposite the station. | **en face de** · en face du · devant de · face à |
| 8 | Vous n'êtes pas ___ du tout ! | You're not far at all! | **loin** · loins · proche · lointain |

### SIO-037 · pouvoir _(no legacy coverage — v1 authored set)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Je ___ manger ici ? | Can I eat here? | **peux** · peut · pouvez · pouvoir |
| 2 | On ___ visiter le musée. | We can visit the museum. | **peut** · peux · peuvent · pouvons |
| 3 | Vous ___ acheter les billets ici. | You can buy the tickets here. | **pouvez** · pouvons · peuvent · peux |
| 4 | Ils ne ___ pas fumer ici. | They can't smoke here. | **peuvent** · peut · pouvez · peux |

### SIO-038 · Transport + prendre + y _(source: legacy 3-04 + 3-10 — passé-composé and imperative items dropped)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Je ___ la ligne 4 jusqu'à Montparnasse. | I take line 4 to Montparnasse. | **prends** · prend · prenons · pris |
| 2 | Pour aller à l'Opéra, vous ___ la ligne 3. | To get to the Opéra, you take line 3. | **prenez** · prenons · prennent · prendez |
| 3 | Nous ___ le métro tous les jours. | We take the metro every day. | **prenons** · prends · prennent · prenez |
| 4 | Je vais à l'université ___ bus. | I go to university by bus. | **en** · à · au · avec |
| 5 | Elle va au marché ___ pied. | She goes to the market on foot. | **à** · en · au · par |
| 6 | — On va à la plage ? — Oui, on ___ va demain. | — Are we going to the beach? — Yes, we're going there tomorrow. | **y** · là · le · en |
| 7 | Ce café ? J'___ vais souvent le matin. | This café? I often go there in the morning. | **y** · en · le · me |

### SIO-039 · Wants and needs _(no legacy coverage — v1 authored set)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Je ___ un café, s'il vous plaît. | I would like a coffee, please. | **voudrais** · voudrez · voulez · veut |
| 2 | J'ai ___ d'un hôtel. | I need a hotel. | **besoin** · envie · faim · soif |
| 3 | J'___ visiter Paris. | I'd like to visit Paris. | **aimerais** · aimerait · aimeriez · aimes |
| 4 | Je veux ___ en vacances. | I want to go on holiday. | **partir** · pars · part · parti |

---

## Unité 4

### SIO-041 · Food + meals _(source: legacy 4-01)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Je prends ___ à sept heures. | I have breakfast at seven o'clock. | **le petit-déjeuner** · le déjeuner · la matinée · le repas du matin |
| 2 | Pour le goûter, elle mange ___. | For her snack, she eats an apple. | **une pomme** · un pomme · la pomme · de la pomme |
| 3 | Il mange ___ et des tomates. | He eats (some) salad and tomatoes. | **de la salade** · du salade · la salade · une salade |
| 4 | Je bois ___ minérale. | I drink (some) mineral water. | **de l'eau** · l'eau · du eau · de l'eaux |
| 5 | En France, on mange ___ après le plat principal. | In France, people eat cheese after the main course. | **du fromage** · le fromage · de la fromage · des fromages |
| 6 | Les Français mangent beaucoup de ___. | The French eat a lot of bread. | **pain** · du pain · le pain · pains |
| 7 | On va manger ___ ce soir. | We're going to eat pasta tonight. | **des pâtes** · de la pâte · les pâtes · du pâtes |

### SIO-042 · Definite vs partitive _(source: legacy 4-02 — the imperative recipe stem recast)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Chaque matin, je bois ___ café. | Every morning, I drink (some) coffee. | **du** · le · un · de la |
| 2 | Elle mange ___ salade tous les midis. | She eats (some) salad every lunchtime. | **de la** · la · une · du |
| 3 | Tu veux ___ eau ? | Do you want some water? | **de l'** · l' · du · de la |
| 4 | Il y a ___ oranges sur la table. | There are some oranges on the table. | **des** · les · de les · de |
| 5 | J'adore ___ pizza. | I love pizza (in general). | **la** · de la · du · une |
| 6 | On ajoute ___ huile d'olive. | You add some olive oil. | **de l'** · de la · du · une |
| 7 | J'aime la bière, mais ce soir je bois ___ vin. | I like beer, but tonight I'm drinking (some) wine. | **du** · le · de la · un |

### SIO-043 · Partitive → negative _(source: legacy 4-03)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Elle ne mange pas ___ viande. | She doesn't eat meat. | **de** · de la · du · pas de la |
| 2 | Il ne boit pas ___ eau — seulement du jus. | He doesn't drink water — only juice. | **d'** · de · de l' · pas d' |
| 3 | Elle mange ___ légumes chaque jour. | She eats a lot of vegetables every day. | **beaucoup de** · beaucoup des · beaucoup du · beaucoup de les |
| 4 | Tu veux ___ lait dans ton café ? | Do you want a little milk in your coffee? | **un peu de** · un peu du · un peu de la · peu de |
| 5 | — C'est du café ? — Non, ___ café — c'est du thé. | — Is it coffee? — No, it's not coffee — it's tea. | **ce n'est pas du** · ce n'est pas de · il n'y a pas de · ce n'est pas de la |
| 6 | Il n'y a pas ___ sel dans cette soupe. | There isn't enough salt in this soup. | **assez de** · assez du · assez de le · beaucoup de |

### SIO-044 · manger / boire _(source: legacy 4-04)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Le matin, je ___ des œufs. | In the morning, I eat eggs. | **mange** · manges · mangez · mangeons |
| 2 | Nous ___ toujours ensemble le soir. | We always eat together in the evening. | **mangeons** · mangons · mangent · mangez |
| 3 | Les enfants ___ des pâtes ce soir. | The children are eating pasta tonight. | **mangent** · mangeont · mange · mangeons |
| 4 | Je ___ de l'eau toute la journée. | I drink water all day long. | **bois** · boit · boire · buvons |
| 5 | Nous ___ beaucoup d'eau pendant l'entraînement. | We drink a lot of water during training. | **buvons** · boivons · buvez · buvont |
| 6 | Les invités ___ du champagne. | The guests are drinking champagne. | **boivent** · buvent · boive · buvons |
| 7 | Est-ce que vous ___ des légumes tous les jours ? | Do you eat vegetables every day? | **mangez** · mangeons · mange · mangerez |

### SIO-045 · Frequency adverbs _(source: legacy 4-05)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Je mange ___ du riz le soir. | I always eat rice in the evening. | **toujours** · parfois · jamais · souvent |
| 2 | Nous mangeons ___ du gâteau le week-end. | We sometimes eat cake at the weekend. | **parfois** · quelque-fois · parfois de · quelque fois |
| 3 | Je mange ___ de la restauration rapide. | I rarely eat fast food. | **rarement** · peu souvent · très rare · rare |
| 4 | Elle ne mange ___ de sucre. | She never eats sugar. | **jamais** · pas · pas jamais · toujours pas |
| 5 | Je bois du café ___. | I drink coffee every day. | **tous les jours** · tout les jours · toutes les jours · chaque les jours |
| 6 | On mange au restaurant ___. | We eat out from time to time. | **de temps en temps** · des temps en temps · de temps à temps · du temps en temps |

### SIO-046 · Demonstratives _(source: legacy 4-06)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Je voudrais ___ plat, s'il vous plaît. | I'd like this dish, please. | **ce** · cet · cette · ces |
| 2 | On fait les courses ___ après-midi. | We're doing the shopping this afternoon. | **cet** · ce · cette · ces |
| 3 | Qu'est-ce qu'on mange ___ semaine ? | What are we eating this week? | **cette** · ce · cet · ces |
| 4 | ___ légumes ont l'air très frais. | These vegetables look very fresh. | **Ces** · Ce · Cet · Cette |
| 5 | Tu connais ___ endroit ? | Do you know this place? | **cet** · ce · cette · ces |
| 6 | ___ fromage sent très fort ! | This cheese smells very strong! | **Ce** · Cet · Cette · Ces |
| 7 | On mange beaucoup d'abricots ___ été. | We eat a lot of apricots this summer. | **cet** · ce · cette · ces |

### SIO-047 · Commerces _(source: legacy 4-08)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Pour acheter une baguette, on va à la ___. | To buy a baguette, you go to the bakery. | **boulangerie** · boucherie · épicerie · fromagerie |
| 2 | Pour acheter du poulet, on va à la ___. | To buy chicken, you go to the butcher's. | **boucherie** · boulangerie · poissonnerie · charcuterie |
| 3 | Je cherche du camembert. Je vais à la ___. | I'm looking for camembert. I'm going to the cheese shop. | **fromagerie** · boulangerie · épicerie · boucherie |
| 4 | Bonjour, ___ deux croissants, s'il vous plaît. | Hello, I'd like two croissants, please. | **je voudrais** · je veux · donnez-moi · je voulais |
| 5 | Le client demande : « ___ ? » | The customer asks: "How much is it?" | **Ça fait combien** · Combien de · Quel est le prix · C'est cher non |
| 6 | — Et avec ceci ? — « ___, merci. » | — Anything else? — "That's all, thank you." | **C'est tout** · Ça fait combien · Je voudrais encore · En espèces |
| 7 | Je voudrais ___ tomates, s'il vous plaît. | I'd like a kilo of tomatoes, please. | **un kilo de** · une tranche de · un verre de · une bouteille de |

### SIO-048 · aller / pouvoir / devoir / falloir + infinitif _(source: legacy 4-07 for futur proche; devoir/falloir authored — no legacy coverage)_

| # | Gapped sentence (FR) | Meaning (EN) | Choices |
|---|---|---|---|
| 1 | Je ___ manger de la pizza ce soir. | I'm going to eat pizza this evening. | **vais** · vas · va · allons |
| 2 | Nous ___ cuisiner ensemble cette semaine. | We're going to cook together this week. | **allons** · va · vont · allez |
| 3 | Qu'est-ce que vous ___ commander ? | What are you going to order? | **allez** · allons · vont · va |
| 4 | Je ne vais pas ___ de viande ce soir. | I'm not going to eat meat this evening. | **manger** · mange · manges · mangé |
| 5 | Tu ___ manger des légumes. | You must eat vegetables. | **dois** · vas · peux · veux |
| 6 | Il ___ boire de l'eau. | One must drink water. | **faut** · doit · va · peut |
| 7 | Elle ___ cuisiner. | She can cook. | **peut** · va · doit · faut |
