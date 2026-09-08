# The English-before-you-pick audit — 2026-09-08

Dan, shown two cards side by side and asked whether the English translation
should be held back until after the pick:

> *"so it is a case by case basis, that is what the audit is for, NOT a clean
> sweep modify-all-once lazy method, but meticulous check that only AI can help
> do"*

THE TEST, applied to each of the 88 authored questions that carried
`transFirst` (the flag that shows the English BEFORE the attempt):

> With that line hidden, does the French sentence plus its four options still
> leave exactly ONE defensible answer?

If yes, the English was only handing the answer over, and the flag comes off —
it still appears the moment the learner answers, where it is feedback. If no,
the flag stays: the English is the only thing that chooses, and hiding it would
make the card unanswerable.

    88 audited
    29  flag removed — the French already decides
    25  flag kept — two options are both correct French
    34  flag kept — the card has no French sentence at all (the five ateliers)

The 29th is goal 41 q1, which was put to Dan and settled the same day — see
the note under the second table.

This file is the record so the next session neither redoes the audit nor undoes
it with a sweep. `verify140` pins the counts and the 28 ids.


## The 29 where the flag came off

| pre-test / item | the card | English (was first) | answer | why the French alone decides |
|---|---|---|---|---|
| `u3-l1-weather` / `05-il-fait-frais` | Il fait___ mais c'est agréable. | It's cool but pleasant. | **frais** | « mais c'est agréable » rules out froid; fraîche and « frais et froid » are not French. Only frais is left. |
| `u3-l1-weather` / `12-quel-temps-fait-il` | —___ à Lyon en ce moment ? | What's the weather like in Lyon right now? — the formal question. | **Quel temps fait-il** | Three of the four are malformed questions. The item is decided on French, not on meaning. |
| `u1-sio011` / `u1-sio011-02` | Moi, c'est Léa. Et ___ ? | Me, I'm Léa. And you? | **toi** | After « Et » the pronoun must be stressed — toi, never tu. The English « And you? » does not even distinguish them. |
| `u1-sio017` / `u1-sio017-08` | Tu viens de ___ pays ? | Which country are you from? | **quel** | « pays » here is masculine singular, so quel. Pure agreement. |
| `u1-sio019` / `u1-sio019-01` | Il est midi. Vous avez ___ ? | It's noon. Are you hungry? | **faim** | « Il est midi » is the cue. Noon means faim. |
| `u2-sio027` / `u2-sio027-07` | Il est deux heures ___. | It's half past two. | **et demie** | « heure » is feminine, so « et demie ». The English « half past two » cannot spell it for you. |
| `u2-sio027` / `u2-sio027-08` | Il est ___, on mange ! | It's noon — let's eat! | **midi** | « on mange » with a clock: French says midi, not « douze heures ». |
| `u3-sio039` / `u3-sio039-02` | J'ai ___ d'un hôtel. | I need a hotel. | **besoin** | « avoir besoin DE » is the construction; faim and soif do not take « de + hôtel », and « envie d'un hôtel » is not said. |
| `u4-sio041` / `u4-sio041-03` | Il mange ___ et des tomates. | He eats (some) salad and tomatoes. | **de la salade** | « du salade » and « de le salade » are not French; « la salade » is not partitive. One correct form. |
| `u4-sio045` / `u4-sio045-03` | Je mange ___ au fast-food. | I rarely eat at fast-food places. | **rarement** | Only « rarement » is an adverb — rares, rare and « très rare » cannot sit there at all. |
| `u4-sio046` / `u4-sio046-02` | On fait les courses ___ après-midi. | We're doing the shopping this afternoon. | **cet** | « après-midi » is masculine and starts with a vowel, so cet. Pure agreement. |
| `u4-sio047` / `u4-sio047-11` | Le marchand : « Et avec ___ ? » | Anything else? (literally: and with this?) | **ceci** | « Et avec ceci ? » is the fixed shop phrase; celui, ceux and cet cannot end it. |
| `u4-sio047` / `u4-sio047-16` | Le prix au poids : « C'est trois euros ___ kilo. » | It's three euros a kilo. | **le** | « trois euros LE kilo » is the fixed price form. |
| `u4-sio047-plans` / `u4-sio047-plans-01` | Je ___ manger de la pizza ce soir. | I'm going to eat pizza this evening. | **vais** | « Je » decides vais. The subject is on the card. |
| `u4-sio047-plans` / `u4-sio047-plans-02` | Nous ___ cuisiner ensemble cette semaine. | We're going to cook together this week. | **allons** | « Nous » decides allons. |
| `u4-sio047-plans` / `u4-sio047-plans-03` | Qu'est-ce que vous ___ commander ? | What are you going to order? | **allez** | « vous » decides allez. |
| `u4-sio047-plans` / `u4-sio047-plans-04` | Je ne vais pas ___ de viande ce soir. | I'm not going to eat meat this evening. | **manger** | After « vais pas » only an infinitive can follow. |
| `u4-sio047-plans` / `u4-sio047-plans-07` | Après le cours, on ___ manger au café. | After class, we're going to eat at the café. | **va** | « on » decides va. |
| `u4-sio047-plans` / `u4-sio047-plans-08` | Nous n'___ pas manger au restaurant ce soir. | We're not going to eat at the restaurant tonight. | **allons** | « Nous » decides allons. |
| `u4-sio047-plans` / `u4-sio047-plans-09` | Qu'est-ce qu'on ___ manger ce week-end ? | What are we going to eat this weekend? | **va** | « on » decides va. |
| `u4-sio047-plans` / `u4-sio047-plans-10` | Elles ___ acheter des fruits au marché. | They're going to buy fruit at the market. | **vont** | « Elles » decides vont. |
| `u4-sio047-plans` / `u4-sio047-plans-11` | Est-ce que tu ___ prendre un dessert ? | Are you going to have a dessert? | **vas** | « tu » decides vas. |
| `u4-sio047-plans` / `u4-sio047-plans-12` | Vous n'___ pas commander de vin ? | Aren't you going to order wine? | **allez** | « Vous » decides allez; avez and êtes cannot take a bare infinitive here. |
| `u4-sio048-advice` / `u4-sio048-advice-06` | Vous ___ étudier pour le quiz. | You must study for the quiz. | **devez** | « Vous » decides devez — devons, doivent and dois are other people. |
| `u4-sio048-advice` / `u4-sio048-advice-08` | Elles ___ boire plus d'eau. | They must drink more water. | **doivent** | « Elles » decides doivent. |
| `u4-sio048-advice` / `u4-sio048-advice-09` | Il ne ___ pas manger trop de sucre. | One mustn't eat too much sugar. | **faut** | After « Il ne » only faut fits — « il ne peux / dois » are the wrong person, and faux is not a verb. |
| `u4-sio048-advice` / `u4-sio048-advice-10` | On ___ acheter des légumes frais au marché. | You can buy fresh vegetables at the market. | **peut** | « On » decides peut. |
| `u4-sio048-advice` / `u4-sio048-advice-11` | Pour bien dormir, vous ne ___ pas boire de café le soir. | To sleep well, you mustn't drink coffee in the evening. | **devez** | « vous » decides devez. |

## The 25 where it stays — two options are both correct French

(The goal 41 row below is the 29th removal, kept here with its reasoning.)

| pre-test / item | the card | English | answer | equally grammatical |
|---|---|---|---|---|
| `u3-l1-weather` / `02-il-fait-chaud` | En juillet à Paris, il fait très___. | In July in Paris, it is very hot. | **chaud** | froid, beau, mauvais |
| `u1-sio012` / `u1-sio012-03` | Elle est ___. | She is an actress. | **actrice** | acteur, acteurs, chanteuse |
| `u1-sio012` / `u1-sio012-04` | Il est ___. | He is an actor. | **acteur** | actrice, acteurs, chanteur |
| `u1-sio017` / `u1-sio017-06` | À Singapour, on parle anglais ___ chinois. | In Singapore, people speak English and Chinese. | **et** | avec, mais, ou |
| `u1-sio017` / `u1-sio017-09` | ___ pays tu visites ? | Which countries are you visiting? | **Quels** | Quel, Quelle, Quelles |
| `u2-sio022` / `u2-sio022-06` | Bienvenue dans ___ appartement ! | Welcome to our apartment! | **notre** | nos, votre, son |
| `u2-sio023` / `u2-sio023-08` | J'___ la musique — c'est ma passion ! | I absolutely LOVE music — it's my passion! | **adore** | aime, déteste, aime pas |
| `u3-sio035` / `u3-sio035-01` | Mon passeport est ___ le sac. | My passport is in the bag. | **dans** | sur, en, à |
| `u3-sio035` / `u3-sio035-02` | Les assiettes sont ___ la table. | The plates are on the table. | **sur** | dans, à, sous |
| `u3-sio035` / `u3-sio035-03` | On se retrouve ___ le cinéma à 19h. | We're meeting in front of the cinema at 7pm. | **devant** | derrière, avant, face à |
| `u3-sio035` / `u3-sio035-07` | Le chat dort ___ le lit. | The cat is sleeping under the bed. | **sous** | sur, dans, devant |
| `u4-sio041` / `u4-sio041-01` | Je prends ___ à sept heures. | I have breakfast at seven o'clock. *(see the note below)* | **le petit-déjeuner** | le déjeuner, la matinée, le dîner |
| `u4-sio042` / `u4-sio042-01` | Chaque matin, je bois ___ café. | Every morning, I drink (some) coffee. | **du** | le, un, de la |
| `u4-sio042` / `u4-sio042-02` | Elle mange ___ salade tous les midis. | She eats (some) salad every lunchtime. | **de la** | la, une, du |
| `u4-sio042` / `u4-sio042-03` | Tu veux ___ eau ? | Do you want some water? | **de l'** | l', du, de la |
| `u4-sio045` / `u4-sio045-01` | Je mange ___ du riz le soir. | I always eat rice in the evening. | **toujours** | parfois, jamais, souvent |
| `u4-sio045` / `u4-sio045-02` | Nous mangeons ___ du gâteau le week-end. | We sometimes eat cake at the weekend. | **parfois** | souvent, parfois de, jamais |
| `u4-sio045` / `u4-sio045-04` | Elle ne mange ___ de sucre. | She never eats sugar. | **jamais** | pas, pas jamais, toujours pas |
| `u4-sio045` / `u4-sio045-07` | Elle mange ___ de la salade au déjeuner. | She often eats salad at lunch. | **souvent** | souvent de, souvents, parfois |
| `u4-sio047` / `u4-sio047-09` | Il me faut ___ jambon, s'il vous plaît. | I need a slice of ham, please. | **une tranche de** | un kilo de, une bouteille de, un morceau de |
| `u4-sio048-advice` / `u4-sio048-advice-01` | Tu ___ manger des légumes. | You must eat vegetables. | **dois** | vas, peux, veux |
| `u4-sio048-advice` / `u4-sio048-advice-02` | Nous ___ boire de l'eau. | We must drink water. | **devons** | faut, devez, pouvons |
| `u4-sio048-advice` / `u4-sio048-advice-03` | Elle ___ cuisiner ce soir. | She can cook tonight. | **peut** | va, doit, faut |
| `u4-sio048-advice` / `u4-sio048-advice-04` | Pour rester en bonne santé, ___ manger équilibré. | To stay healthy, one must eat a balanced diet. | **il faut** | tu peux, tu faut, il peux |
| `u4-sio048-advice` / `u4-sio048-advice-05` | Pour être en forme, il ___ faire du sport. | To be in shape, one must do sport. | **faut** | dois, peut, va |
| `u4-sio048-advice` / `u4-sio048-advice-07` | Tu ___ prendre le bus pour aller au marché. | You can take the bus to go to the market. | **peux** | peut, pouvez, veux |

### The one put to Dan, and settled — `u4-sio041` / `u4-sio041-01`

    was:  « Je ___ à sept heures. »          / I have breakfast at seven o'clock.
    now:  « Je ___ à sept heures du matin. » / I have breakfast at seven in the morning.

This card was in both camps, which is why it went to Dan rather than being
decided here. The English did name the answer — and with it hidden the card had
TWO defensible answers, because seven o'clock is breakfast in the morning and
dinner in the evening. So the fault was the French, not the flag.

Dan, 2026-09-08, choosing between adding « du matin », leaving it alone, and
changing the four options: **add « du matin »**. With the morning stated,
« le dîner » is out on the French alone, and the flag came off with the other
28. « le dîner »'s WHY was rewritten to name the new reason rather than the old
one — a learner who picks it is now being told about the hour, not the meal.


## The 34 where it stays — the card has no French sentence

The five atelier line-match pre-tests (goals 20, 30, 40, 49, 50). The
card is bare: the English IS the question and the four options are whole French
lines. Hiding it leaves nothing on screen.

| pre-test / item | English | answer |
|---|---|---|
| `atelier-sio-020` / `sio-020-line-01` | Hello! Here is Japan. | **Bonjour ! Voici le Japon.** |
| `atelier-sio-020` / `sio-020-line-02` | It's an Asian country. | **C'est un pays asiatique.** |
| `atelier-sio-020` / `sio-020-line-03` | Here, there are Japanese people. | **Ici, il y a des Japonais.** |
| `atelier-sio-020` / `sio-020-line-04` | Many Japanese people speak Japanese. | **Beaucoup de Japonais parlent japonais.** |
| `atelier-sio-020` / `sio-020-line-05` | The flag has two colours: red and white. | **Le drapeau a deux couleurs : le rouge et le blanc.** |
| `atelier-sio-020` / `sio-020-line-06` | There is a red circle on a white background. | **Il y a un rond rouge sur un fond blanc.** |
| `atelier-sio-030` / `sio-030-line-01` | Hi Marie! | **Salut Marie !** |
| `atelier-sio-030` / `sio-030-line-02` | Thanks for your message. | **Merci pour ton message.** |
| `atelier-sio-030` / `sio-030-line-03` | This weekend I'm going to the cinema with friends. | **Ce week-end, je vais au cinéma avec des amis.** |
| `atelier-sio-030` / `sio-030-line-04` | And you, what are you doing? | **Et toi, qu'est-ce que tu fais ?** |
| `atelier-sio-030` / `sio-030-line-05` | It's your birthday on Saturday — happy birthday! | **C'est ton anniversaire samedi : bon anniversaire !** |
| `atelier-sio-030` / `sio-030-line-06` | Good luck with your exam! | **Bonne chance pour ton examen !** |
| `atelier-sio-030` / `sio-030-line-07` | You're going to Paris with your family? Have a good trip! | **Tu vas à Paris avec ta famille ? Bon voyage !** |
| `atelier-sio-030` / `sio-030-line-08` | Have a good day and see you soon! | **Bonne journée et à bientôt !** |
| `atelier-sio-040` / `sio-040-line-01` | To get to the station, it's easy. | **Pour aller à la gare, c'est facile.** |
| `atelier-sio-040` / `sio-040-line-02` | First, take the first street on the right. | **D'abord, tu prends la première rue à droite.** |
| `atelier-sio-040` / `sio-040-line-03` | Then go straight ahead. | **Ensuite, tu vas tout droit.** |
| `atelier-sio-040` / `sio-040-line-04` | Then turn left at the bank. | **Puis, tu tournes à gauche à la banque.** |
| `atelier-sio-040` / `sio-040-line-05` | Finally, the station is opposite the park. | **Enfin, la gare est en face du parc.** |
| `atelier-sio-040` / `sio-040-line-06` | You can also take bus number five. | **Tu peux aussi prendre le bus numéro cinq.** |
| `atelier-sio-049` / `sio-049-line-01` | I really like this restaurant. | **J'aime beaucoup ce restaurant.** |
| `atelier-sio-049` / `sio-049-line-02` | I always have fish with chips. | **Je prends toujours du poisson avec des frites.** |
| `atelier-sio-049` / `sio-049-line-03` | It's delicious! | **C'est délicieux !** |
| `atelier-sio-049` / `sio-049-line-04` | The service is fast. | **Le service est rapide.** |
| `atelier-sio-049` / `sio-049-line-05` | It's not expensive. | **Ce n'est pas cher.** |
| `atelier-sio-049` / `sio-049-line-06` | Sometimes the service is a bit slow. | **Parfois, le service est un peu lent.** |
| `atelier-sio-049` / `sio-049-line-07` | But I recommend this restaurant! | **Mais je recommande ce restaurant !** |
| `atelier-sio-050` / `sio-050-line-01` | Hello! What would you like? | **Bonjour ! Vous désirez ?** |
| `atelier-sio-050` / `sio-050-line-02` | Hello! I'd like a coffee, please. | **Bonjour ! Je voudrais un café, s'il vous plaît.** |
| `atelier-sio-050` / `sio-050-line-03` | And to eat? | **Et pour manger ?** |
| `atelier-sio-050` / `sio-050-line-04` | I'd like a croissant and an apple. | **Je voudrais un croissant et une pomme.** |
| `atelier-sio-050` / `sio-050-line-05` | Very well. Would you like some water? | **Très bien. Vous voulez de l'eau ?** |
| `atelier-sio-050` / `sio-050-line-06` | Yes, please. Thank you! | **Oui, je veux bien. Merci !** |
| `atelier-sio-050` / `sio-050-line-07` | Here you are! Enjoy your meal! | **Voilà ! Bon appétit !** |
