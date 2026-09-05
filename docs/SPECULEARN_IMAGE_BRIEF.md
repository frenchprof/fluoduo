# SpecuLearn — image brief

146 images to generate. Every row in `speculearn-image-brief.csv`
carries a ready-to-paste `prompt` column.

**ALL FOUR PRIORITIES ARE REQUIRED** (Dan, 5 Sep). Asked whether SpecuLearn should be
"all photos and no emojis", he chose photos everywhere. That settles P4, which had been
written as optional — an emoji that names its word correctly is still an emoji sitting
beside a photograph, and the inconsistency is the point he was making. Priority is now
the ORDER to generate in, not a line between must and might.

The 19 *languages* items remain held back, and not for want of a decision: Dan ruled on
31 Aug that they lose their flags for "script and other linguistic-related elements", but
**ten of the nineteen languages are written in the Latin alphabet** — English, Spanish,
French, Portuguese, German, Indonesian, Turkish, Vietnamese, Filipino, Malay. A picture
built from script would give those ten the same picture, which is the fault Dan spent
5 Sep reporting on commerces ("this seemes to have two answers possible"). See the note
at the foot of this file.

## House style, applied to every prompt

> hyperrealistic 3D render, single subject centred and isolated, plain warm off-white
> background (#FBFBF6), soft studio key light from upper-left with a gentle fill, subtle
> contact shadow beneath, photoreal materials and micro-detail, no text, no labels, no
> watermark, square 1:1, 1024x1024

Deliver as **PNG, 1024×1024**. They render at 132 CSS px, so 1024 covers a 3× phone with
room to spare; anything smaller than 512 will look soft again.


## P1 · LOW-RES — the 56 that prompted this — 56 images

Every *aliments* photo on disk is **160×160, ~3 KB**, displayed at 132 CSS px. On a 2× phone that is a
1.6× upscale, on a 3× phone 2.5×. They are not wrong, they are too small. Same subjects, properly rendered.
Keep the existing filenames so nothing else has to change.

| deck | id | French | now | filename |
|---|---|---|---|---|
| aliments | `l-abricot.jpg` | les abricots | /devine/l-abricot.jpg | `l-abricot.jpg` |
| aliments | `l-ail.jpg` | l'ail | /devine/l-ail.jpg | `l-ail.jpg` |
| aliments | `l-ananas.jpg` | l'ananas | /devine/l-ananas.jpg | `l-ananas.jpg` |
| aliments | `l-avocat.jpg` | l'avocat | /devine/l-avocat.jpg | `l-avocat.jpg` |
| aliments | `l-eau.jpg` | l'eau | /devine/l-eau.jpg | `l-eau.jpg` |
| aliments | `l-huile-d-olive.jpg` | l'huile d'olive | /devine/l-huile-d-olive.jpg | `l-huile-d-olive.jpg` |
| aliments | `l-orange.jpg` | l'orange | /devine/l-orange.jpg | `l-orange.jpg` |
| aliments | `la-baguette.jpg` | la baguette | /devine/la-baguette.jpg | `la-baguette.jpg` |
| aliments | `la-banane.jpg` | les bananes | /devine/la-banane.jpg | `la-banane.jpg` |
| aliments | `la-carotte.jpg` | la carotte | /devine/la-carotte.jpg | `la-carotte.jpg` |
| aliments | `la-confiture.jpg` | la confiture | /devine/la-confiture.jpg | `la-confiture.jpg` |
| aliments | `la-fraise.jpg` | la fraise | /devine/la-fraise.jpg | `la-fraise.jpg` |
| aliments | `la-pasteque.jpg` | la pastèque | /devine/la-pasteque.jpg | `la-pasteque.jpg` |
| aliments | `la-peche.jpg` | la pêche | /devine/la-peche.jpg | `la-peche.jpg` |
| aliments | `la-pizza.jpg` | la pizza | /devine/la-pizza.jpg | `la-pizza.jpg` |
| aliments | `la-poire.jpg` | les poires | /devine/la-poire.jpg | `la-poire.jpg` |
| aliments | `la-pomme.jpg` | les pommes | /devine/la-pomme.jpg | `la-pomme.jpg` |
| aliments | `la-salade.jpg` | la salade | /devine/la-salade.jpg | `la-salade.jpg` |
| aliments | `la-tomate.jpg` | les tomates | /devine/la-tomate.jpg | `la-tomate.jpg` |
| aliments | `la-vanille.jpg` | la vanille | /devine/la-vanille.jpg | `la-vanille.jpg` |
| aliments | `la-viande.jpg` | la viande | /devine/la-viande.jpg | `la-viande.jpg` |
| aliments | `le-beurre.jpg` | le beurre | /devine/le-beurre.jpg | `le-beurre.jpg` |
| aliments | `le-brocoli.jpg` | le brocoli | /devine/le-brocoli.jpg | `le-brocoli.jpg` |
| aliments | `le-cafe.jpg` | le café | /devine/le-cafe.jpg | `le-cafe.jpg` |
| aliments | `le-champignon.jpg` | le champignon | /devine/le-champignon.jpg | `le-champignon.jpg` |
| aliments | `le-chocolat.jpg` | le chocolat | /devine/le-chocolat.jpg | `le-chocolat.jpg` |
| aliments | `le-chou-fleur.jpg` | le chou-fleur | /devine/le-chou-fleur.jpg | `le-chou-fleur.jpg` |
| aliments | `le-citron.jpg` | le citron | /devine/le-citron.jpg | `le-citron.jpg` |
| aliments | `le-concombre.jpg` | les concombres | /devine/le-concombre.jpg | `le-concombre.jpg` |
| aliments | `le-croissant.jpg` | le croissant | /devine/le-croissant.jpg | `le-croissant.jpg` |
| aliments | `le-fromage.jpg` | le fromage | /devine/le-fromage.jpg | `le-fromage.jpg` |
| aliments | `le-gateau-au-chocolat.jpg` | le gâteau au chocolat | /devine/le-gateau-au-chocolat.jpg | `le-gateau-au-chocolat.jpg` |
| aliments | `le-jambon.jpg` | le jambon | /devine/le-jambon.jpg | `le-jambon.jpg` |
| aliments | `le-kiwi.jpg` | le kiwi | /devine/le-kiwi.jpg | `le-kiwi.jpg` |
| aliments | `le-lait.jpg` | le lait | /devine/le-lait.jpg | `le-lait.jpg` |
| aliments | `le-miel.jpg` | le miel | /devine/le-miel.jpg | `le-miel.jpg` |
| aliments | `le-pain.jpg` | le pain | /devine/le-pain.jpg | `le-pain.jpg` |
| aliments | `le-pamplemousse.jpg` | le pamplemousse | /devine/le-pamplemousse.jpg | `le-pamplemousse.jpg` |
| aliments | `le-poisson.jpg` | le poisson | /devine/le-poisson.jpg | `le-poisson.jpg` |
| aliments | `le-poivre.jpg` | le poivre | /devine/le-poivre.jpg | `le-poivre.jpg` |
| aliments | `le-poivron.jpg` | les poivrons | /devine/le-poivron.jpg | `le-poivron.jpg` |
| aliments | `le-poulet.jpg` | le poulet | /devine/le-poulet.jpg | `le-poulet.jpg` |
| aliments | `le-riz.jpg` | le riz | /devine/le-riz.jpg | `le-riz.jpg` |
| aliments | `le-saucisson.jpg` | le saucisson | /devine/le-saucisson.jpg | `le-saucisson.jpg` |
| aliments | `le-sel.jpg` | le sel | /devine/le-sel.jpg | `le-sel.jpg` |
| aliments | `le-sucre.jpg` | le sucre | /devine/le-sucre.jpg | `le-sucre.jpg` |
| aliments | `le-vinaigre.jpg` | le vinaigre | /devine/le-vinaigre.jpg | `le-vinaigre.jpg` |
| aliments | `le-yaourt.jpg` | le yaourt | /devine/le-yaourt.jpg | `le-yaourt.jpg` |
| aliments | `les-crepes.jpg` | les crêpes | /devine/les-crepes.jpg | `les-crepes.jpg` |
| aliments | `les-haricots-verts.jpg` | les haricots verts | /devine/les-haricots-verts.jpg | `les-haricots-verts.jpg` |
| aliments | `les-macarons.jpg` | les macarons | /devine/les-macarons.jpg | `les-macarons.jpg` |
| aliments | `les-pates.jpg` | les pâtes | /devine/les-pates.jpg | `les-pates.jpg` |
| aliments | `les-petits-pois.jpg` | les petits pois | /devine/les-petits-pois.jpg | `les-petits-pois.jpg` |
| aliments | `les-pommes-de-terre.jpg` | les pommes de terre | /devine/les-pommes-de-terre.jpg | `les-pommes-de-terre.jpg` |
| aliments | `les-sushis.jpg` | les sushis | /devine/les-sushis.jpg | `les-sushis.jpg` |
| aliments | `les-ufs.jpg` | les œufs | /devine/les-ufs.jpg | `les-ufs.jpg` |

## P2 · COLLISION — retired, 5 Sep — 0 images

All four were commerces money words (« euros », « monnaie », « Ça fait combien ? »,
« Voici votre monnaie. ») whose 💶 and 🪙 answered to two words each. That collision is
gone because the deck no longer plays them. See "14 rows retired" below.

Two playable items in the same deck currently share one emoji, so whichever is asked the other answer is
defensible. These need pictures that separate them.

| deck | id | French | now | filename |
|---|---|---|---|---|
| commerces | `commerces-16` | Ça fait combien ? | 💶 | `commerces-16.png` |
| commerces | `commerces-25` | Voici votre monnaie. | 🪙 | `commerces-25.png` |
| commerces | `commerces-27` | euros | 💶 | `commerces-27.png` |
| commerces | `commerces-28` | monnaie | 🪙 | `commerces-28.png` |

## P3 · SENTENCE — 9 items an emoji cannot carry — 9 images

The ten commerces sentences that were here are retired (below); these nine are *consignes*,
whose classroom commands are one category and do play.

These are full clauses, not nouns. A 🍎 does not say *“Je voudrais deux kilos de pommes.”* Each prompt
describes the SCENE the sentence names.

| deck | id | French | now | filename |
|---|---|---|---|---|
| commerces | `commerces-15` | Je voudrais deux kilos de pommes. | 🍎 | `commerces-15.png` |
| commerces | `commerces-17` | C'est tout, merci ! | ✅ | `commerces-17.png` |
| commerces | `commerces-18` | Vous avez des fraises ? | 🍓 | `commerces-18.png` |
| commerces | `commerces-19` | Voilà dix euros. | 💸 | `commerces-19.png` |
| commerces | `commerces-20` | Je vais prendre un melon. | 🍈 | `commerces-20.png` |
| commerces | `commerces-21` | Bonjour, vous désirez ? | 🧑‍🌾 | `commerces-21.png` |
| commerces | `commerces-22` | Et avec ceci ? | ➕ | `commerces-22.png` |
| commerces | `commerces-23` | Ça fait 5,89 euros. | 🧾 | `commerces-23.png` |
| commerces | `commerces-24` | C'est trois euros le kilo. | ⚖️ | `commerces-24.png` |
| commerces | `commerces-26` | Je vous en mets combien ? | 🤲 | `commerces-26.png` |
| consignes | `consignes-01` | Écoutez ! | 👂 | `consignes-01.png` |
| consignes | `consignes-02` | Regardez ! | 👀 | `consignes-02.png` |
| consignes | `consignes-03` | Répétez ! | 🔁 | `consignes-03.png` |
| consignes | `consignes-04` | Lisez ! | 📖 | `consignes-04.png` |
| consignes | `consignes-05` | Écrivez ! | ✍️ | `consignes-05.png` |
| consignes | `consignes-06` | Parlez ! | 🗣️ | `consignes-06.png` |
| consignes | `consignes-08` | Comptez ! | 🔢 | `consignes-08.png` |
| consignes | `consignes-09` | Associez ! | 🔗 | `consignes-09.png` |
| consignes | `consignes-10` | On fait quoi ? | ❓ | `consignes-10.png` |

## P4 · OK-emoji — 81 that name their word, but are emoji — 81 images

Required, like the rest (Dan, 5 Sep: photos everywhere). These emoji are not WRONG — 🥖
does mean *une boulangerie* — they are simply the last 81 places where a learner meets an
emoji instead of a picture.

These read unambiguously today. They are listed because a deck that is half 3D render and half Apple emoji
will look broken. Generate them for consistency, or leave them and accept the mixture — your call.

| deck | id | French | now | filename |
|---|---|---|---|---|
| colors | `colors-01` | le rouge | 🔴 | `colors-01.png` |
| colors | `colors-02` | l'orange | 🟠 | `colors-02.png` |
| colors | `colors-03` | le jaune | 🟡 | `colors-03.png` |
| colors | `colors-04` | le vert | 🟢 | `colors-04.png` |
| colors | `colors-05` | le bleu | 🔵 | `colors-05.png` |
| colors | `colors-06` | le violet | 🟣 | `colors-06.png` |
| colors | `colors-07` | le marron | 🟤 | `colors-07.png` |
| colors | `colors-08` | le blanc | ⚪ | `colors-08.png` |
| colors | `colors-09` | le noir | ⚫ | `colors-09.png` |
| colors | `colors-10` | le gris | 🩶 | `colors-10.png` |
| colors | `colors-11` | le rose | 🩷 | `colors-11.png` |
| commerces | `commerces-05` | boulangerie | 🥖 | `commerces-05.png` |
| commerces | `commerces-06` | pâtisserie | 🧁 | `commerces-06.png` |
| commerces | `commerces-07` | boucherie | 🥩 | `commerces-07.png` |
| commerces | `commerces-09` | poissonnerie | 🐟 | `commerces-09.png` |
| commerces | `commerces-10` | librairie | 📚 | `commerces-10.png` |
| commerces | `commerces-33` | prix | 🏷️ | `commerces-33.png` |
| countries-letris | `countries-letris-01-france` | France | 🇫🇷 | `countries-letris-01-france.png` |
| countries-letris | `countries-letris-02-portugal` | Portugal | 🇵🇹 | `countries-letris-02-portugal.png` |
| countries-letris | `countries-letris-03-chine` | Chine | 🇨🇳 | `countries-letris-03-chine.png` |
| countries-letris | `countries-letris-04-indonesie` | Indonésie | 🇮🇩 | `countries-letris-04-indonesie.png` |
| countries-letris | `countries-letris-05-coree` | Corée | 🇰🇷 | `countries-letris-05-coree.png` |
| countries-letris | `countries-letris-06-etats-unis` | États-Unis | 🇺🇸 | `countries-letris-06-etats-unis.png` |
| countries-letris | `countries-letris-07-mexique` | Mexique | 🇲🇽 | `countries-letris-07-mexique.png` |
| countries-letris | `countries-letris-08-cuba` | Cuba | 🇨🇺 | `countries-letris-08-cuba.png` |
| countries-letris | `countries-letris-09-philippines` | Philippines | 🇵🇭 | `countries-letris-09-philippines.png` |
| countries-letris | `countries-letris-10-argentine` | Argentine | 🇦🇷 | `countries-letris-10-argentine.png` |
| countries-letris | `countries-letris-11-russie` | Russie | 🇷🇺 | `countries-letris-11-russie.png` |
| countries-letris | `countries-letris-12-suisse` | Suisse | 🇨🇭 | `countries-letris-12-suisse.png` |
| countries-letris | `countries-letris-13-belgique` | Belgique | 🇧🇪 | `countries-letris-13-belgique.png` |
| countries-letris | `countries-letris-14-grece` | Grèce | 🇬🇷 | `countries-letris-14-grece.png` |
| countries-letris | `countries-letris-15-turquie` | Turquie | 🇹🇷 | `countries-letris-15-turquie.png` |
| countries-letris | `countries-letris-16-allemagne` | Allemagne | 🇩🇪 | `countries-letris-16-allemagne.png` |
| countries-letris | `countries-letris-17-cambodge` | Cambodge | 🇰🇭 | `countries-letris-17-cambodge.png` |
| countries-letris | `countries-letris-18-singapour` | Singapour | 🇸🇬 | `countries-letris-18-singapour.png` |
| countries-letris | `countries-letris-19-malaisie` | Malaisie | 🇲🇾 | `countries-letris-19-malaisie.png` |
| countries-letris | `countries-letris-20-thailande` | Thaïlande | 🇹🇭 | `countries-letris-20-thailande.png` |
| countries-letris | `countries-letris-21-angleterre` | Angleterre | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 | `countries-letris-21-angleterre.png` |
| countries-letris | `countries-letris-22-grande-bretagne` | Grande-Bretagne | 🇬🇧 | `countries-letris-22-grande-bretagne.png` |
| countries-letris | `countries-letris-23-tunisie` | Tunisie | 🇹🇳 | `countries-letris-23-tunisie.png` |
| countries-letris | `countries-letris-24-maroc` | Maroc | 🇲🇦 | `countries-letris-24-maroc.png` |
| countries-letris | `countries-letris-25-algerie` | Algérie | 🇩🇿 | `countries-letris-25-algerie.png` |
| lieux-letris | `lieux-letris-01-cafe` | café | ☕ | `lieux-letris-01-cafe.png` |
| lieux-letris | `lieux-letris-02-restaurant` | restaurant | 🍽️ | `lieux-letris-02-restaurant.png` |
| lieux-letris | `lieux-letris-03-cinema` | cinéma | 🎬 | `lieux-letris-03-cinema.png` |
| lieux-letris | `lieux-letris-05-parc` | parc | 🌳 | `lieux-letris-05-parc.png` |
| lieux-letris | `lieux-letris-08-stade` | stade | 🏟️ | `lieux-letris-08-stade.png` |
| lieux-letris | `lieux-letris-10-pharmacie` | pharmacie | 💊 | `lieux-letris-10-pharmacie.png` |
| lieux-letris | `lieux-letris-11-bibliotheque` | bibliothèque | 📚 | `lieux-letris-11-bibliotheque.png` |
| lieux-letris | `lieux-letris-13-gare` | gare | 🚉 | `lieux-letris-13-gare.png` |
| lieux-letris | `lieux-letris-14-poste` | poste | 📮 | `lieux-letris-14-poste.png` |
| lieux-letris | `lieux-letris-15-piscine` | piscine | 🏊 | `lieux-letris-15-piscine.png` |
| lieux-letris | `lieux-letris-18-eglise` | église | ⛪ | `lieux-letris-18-eglise.png` |
| lieux-letris | `lieux-letris-20-universite` | université | 🎓 | `lieux-letris-20-universite.png` |
| lieux-letris | `lieux-letris-21-aeroport` | aéroport | ✈️ | `lieux-letris-21-aeroport.png` |
| lieux-letris | `lieux-letris-23-arret-de-bus` | arrêt de bus | 🚏 | `lieux-letris-23-arret-de-bus.png` |
| lieux-letris | `lieux-letris-26-toilettes-publiques` | toilettes publiques | 🚻 | `lieux-letris-26-toilettes-publiques.png` |
| lieux-letris | `lieux-letris-27-feux-de-circulation` | feux de circulation | 🚦 | `lieux-letris-27-feux-de-circulation.png` |
| objets-articles | `objets-articles-01` | sac | 🎒 | `objets-articles-01.png` |
| objets-articles | `objets-articles-02` | livre | 📖 | `objets-articles-02.png` |
| objets-articles | `objets-articles-03` | cahier | 📓 | `objets-articles-03.png` |
| objets-articles | `objets-articles-04` | téléphone | 📱 | `objets-articles-04.png` |
| objets-articles | `objets-articles-05` | stylo | 🖊️ | `objets-articles-05.png` |
| objets-articles | `objets-articles-06` | crayon | ✏️ | `objets-articles-06.png` |
| objets-articles | `objets-articles-08` | carte d'identité | 🪪 | `objets-articles-08.png` |
| objets-articles | `objets-articles-10` | ciseaux | ✂️ | `objets-articles-10.png` |
| objets-articles | `objets-articles-13` | lunettes | 👓 | `objets-articles-13.png` |
| objets-articles | `objets-articles-14` | clé | 🔑 | `objets-articles-14.png` |
| objets-articles | `objets-articles-15` | règle | 📏 | `objets-articles-15.png` |
| objets-articles | `objets-articles-16` | écouteurs | 🎧 | `objets-articles-16.png` |
| objets-articles | `objets-articles-18` | ordinateur | 💻 | `objets-articles-18.png` |
| objets-articles | `objets-articles-20` | souris | 🖱️ | `objets-articles-20.png` |
| transport | `transport-01-en-train` | en train | 🚄 | `transport-01-en-train.png` |
| transport | `transport-02-en-bus` | en bus | 🚌 | `transport-02-en-bus.png` |
| transport | `transport-03-en-metro` | en métro | 🚇 | `transport-03-en-metro.png` |
| transport | `transport-04-en-voiture` | en voiture | 🚗 | `transport-04-en-voiture.png` |
| transport | `transport-05-en-avion` | en avion | ✈️ | `transport-05-en-avion.png` |
| transport | `transport-06-en-bateau` | en bateau | ⛵ | `transport-06-en-bateau.png` |
| transport | `transport-07-a-velo` | à vélo | 🚲 | `transport-07-a-velo.png` |
| transport | `transport-08-a-pied` | à pied | 🚶 | `transport-08-a-pied.png` |
| transport | `transport-09-a-moto` | à moto | 🏍️ | `transport-09-a-moto.png` |



## Where they go

`public/speculearn/<filename>` for the new decks; `public/devine/<filename>` for the
aliments replacements (existing names, so no code change). The empty `SPECULEARN_ITEM_IMAGES`
map in `src/lib/collections/speculearnReady.ts` is what wires an item id to a file.


## 14 rows retired, 5 Sep — do not generate

commerces used to play its whole deck, so the brief asked for pictures of « Ça fait
combien ? » and « Voilà dix euros. » as well as of the shops. A picture cannot name a
sentence, which is what produced Dan's run of "this question does not have an answer"
reports; the deck now plays its shop nouns only. Those 14 rows are marked
**priority 0 / DROPPED** in the CSV and are not wanted.

That leaves commerces with six: the five shops it plays, plus « le prix ».

## The languages deck — the one thing still open

Dan, 31 Aug: "remove the flags for the languages and replace with script and other
linguistic-related elements." Written as image prompts, that breaks:

    Latin alphabet, 10 of 19   l'anglais · l'espagnol · le français · le portugais ·
                               l'allemand · l'indonésien · le turc · le vietnamien ·
                               le filipino · le malais
    own script, 9 of 19        le chinois 中文 · le hindi हिन्दी · l'arabe العربية ·
                               le russe русский · le japonais 日本語 · le tamoul தமிழ் ·
                               le cantonais 廣東話 · le coréen 한국어 · le thaï ไทย

A card asking « l'espagnol » against four Latin-alphabet pictures has four answers. The
same objection retired *nationalities* and *tu-vous* from SpecuLearn in the 14 Jul audit.

Three ways out, for Dan:
1. **A word, not an alphabet.** Each language shows its own greeting — Hello · Hola ·
   Bonjour · Olá · Hallo · Halo · Merhaba · Xin chào · Kumusta · Apa khabar · 你好 · नमस्ते
   · مرحبا · Привет · こんにちは · வணக்கம் · 안녕하세요 · สวัสดี. Different WORDS, so the ten
   Latin ones stay apart, and it is more linguistic than a flag, not less.
2. **Keep the flags here only.** They are unmistakable, which is what the game needs.
3. **Retire languages from SpecuLearn**, as nationalities and tu-vous already are. It
   keeps its Letris, Flip It and MCQ.

Option 1 needs the word rendered exactly; generators garble text, so each of the 19 has
to be checked by eye against the string above before it ships.
