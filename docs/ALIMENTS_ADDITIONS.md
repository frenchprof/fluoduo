# What `aliments` is missing — and the bigger thing the search found

**Peers, 31 Aug 2026.** Dan asked "what other words are we thinking about" after
specifying two patterns for the Tier 2 sample: the « avec » frame
(*du pain avec du beurre / avec de la confiture*) and the compound-name contrast
(*une tarte **aux** pommes* against *un jus **de** pomme*). Neither can be taught
from `src/content/collections/aliments.json` as it stands.

## The bigger thing first

**`aliments` is not the union of the course's food vocabulary.** It holds 24
foods plus 4 meal names. A search across every deck in `collections/` turns up
food nouns in five other places, and the learner meets all of them:

| deck | stop | food words it introduces |
|---|---|---|
| `demonstratifs` | 46 | abricot · banane · carottes · fraises · gâteau · légumes · orange · tarte · œuf (as bare nouns, for ce/cette/ces) |
| `partitifs` | 42 | confiture · sel · chocolat · sushis · fruits · eau gazeuse (inside sentences only) |
| `commerces` | 44 | fraises · pommes (in the market exchange) |
| `core-nouns` | — | café · croissant |
| `frequence` · `negation-pas` · `modaux-avis` | 43 · 28 · 48 | reuse the above in sentences |

So the course teaches roughly **35 distinct food nouns** and the stop whose
lexique is supposed to *be* the food vocabulary shows 24.

That matters for Tier 2 specifically. For a Lexical Core stop the word list is
the lesson, so a word list that is missing a third of the field is not a gap in
a deck — it is a gap in the lesson. **Settle this before authoring fifteen of
them:** either `aliments` becomes the union, or a Tier 2 stop is explicitly
allowed to teach with words it does not own.

## For the « avec » frame

| word | status |
|---|---|
| de la confiture | in `partitifs` as a sentence (« Je mange de la confiture. »), not as a deck item |

One word, and it is the natural partner for *du pain*. Butter alone makes a thin
exercise.

## For the à / de contrast

The pattern needs at least two clean examples on each side. Marked ✓ where the
noun already exists somewhere in the course.

**à + article + noun — one important ingredient, among others**

| compound | parts |
|---|---|
| une tarte **aux** pommes | tarte ✓ (`demonstratifs`) · pomme ✓ (`aliments`) |
| un sandwich **au** fromage | sandwich ✗ new · fromage ✓ |
| un café **au** lait | café ✓ · lait ✓ — the compound itself is new |
| une glace **à la** vanille | glace ✗ new · vanille ✗ new |

**de + noun, no article — what the thing is made of**

| compound | parts |
|---|---|
| un jus **de** pomme | jus ✓ (inside *du jus d'orange*) · pomme ✓ |
| du jus **d'**orange | ✓ already the deck's only compound |
| une soupe **de** poisson | soupe ✓ · poisson ✓ |
| une salade **de** fruits | salade ✓ · fruits ✓ (`partitifs`, in a sentence) |

**Genuinely new to the whole course: four words** — sandwich, glace, vanille,
and (if the sandwich is worth two flavours) jambon. Everything else is
recombination of nouns the learner already has, which is the argument for
teaching the pattern here: it costs almost no new vocabulary and it explains
every food name they will read on a menu.

## The candidate list, if `aliments` is to become the union

Nine bare nouns already taught at stop 46, given the articles this deck uses:

    un abricot · une banane · des carottes · des fraises · un gâteau
    des légumes · une orange · une tarte · un œuf

Six that currently appear only inside other decks' sentences:

    de la confiture · du sel · du chocolat · des fruits · du poivre · des œufs

Four new, for the compound pattern:

    un sandwich · une glace · de la vanille · du jambon

**Dan, 31 Aug: "then grow it!"** Done — the deck went from 28 to **42**, not
47, and the five that fell away fell away for a reason:

| dropped | why |
|---|---|
| du poivre | no emoji depicts ground pepper; 🌶️ is a chilli |
| de la vanille | unpicturable, and it is only ever needed inside *une glace à la vanille* |
| des fruits | a category word, and every candidate emoji collides with 🍎 pomme |
| des légumes | same, and 🥦 would sit next to 🥬 asperges |
| des œufs | *un œuf* covers it; a singular/plural pair of the same word is not two words |

That is the deck's own SpecuLearn rule applied honestly: an emoji must depict the
word and map to exactly one word in its deck (`speculearnReady.ts`,
`SPECULEARN_ITEMS.md`). Five words could not clear it, so they are not in.

### A correction, because it was in three documents

I had called the 12 untagged items a content gap. They are not. `col:` values
feed `gameConfig.letris.columns`, which declares four columns — repas, legumes,
viandes, boissons — and an item with no `col:` tag simply does not appear in
Letris. It is a game roster, not a taxonomy, and inventing `col:feculents` would
have produced a tag that nothing reads. The new words follow the same rule: only
*des carottes* (legumes) and *du jambon* (viandes) took a tag.

**The real gap stands and is untouched by this commit: nothing anywhere records
a course.** That is what a Tier 2 word list needs to arrange itself, and it has
no source in the data yet.

## Why this is not just a content chore

Both of Dan's patterns are things a **word list cannot state**. *Tarte aux
pommes* against *jus de pomme* is a rule about how French builds names, and it
is invisible in English, which builds both the same way. That is exactly the
material a Tier 2 *forms* tab exists for — the same slot that holds gender. It
is the second demonstration that a vocabulary stop does have forms; they are
simply not conjugations.
