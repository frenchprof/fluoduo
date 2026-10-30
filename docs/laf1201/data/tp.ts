import type { Sheet } from "./types";

export const tp: Sheet = {
  id: "tp",
  label: "Grammar",
  title: "Grammar",
  subtitle: "LAF1201 French 1 · verbs, articles, à and en, y, agreement, word order, advice",
  sections: [
    {
      id: "tp-1",
      number: 1,
      title: "Regular verbs: -er, -ir, -re",
      theme: "verbes",
      blocks: [
        {
          type: "table",
          headers: ["", "visiter (-er)", "finir (-ir)", "attendre (-re)"],
          rows: [
            ["je", "visite", "finis", "attends"],
            ["tu", "visites", "finis", "attends"],
            ["il / elle", "visite", "finit", "attend"],
            ["nous", "**visitons**", "**finissons**", "**attendons**"],
            ["vous", "**visitez**", "**finissez**", "**attendez**"],
            ["ils / elles", "visitent", "finissent", "attendent"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Nous finis.~~ → **Nous finissons.** : -ir verbs add *-iss-* in *nous, vous, ils*.",
            "~~Ils visite.~~ → **Ils visitent.** : *ils* takes the silent *-ent* ending.",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "(nous · visiter · le musée) → _____", distractors: ["visitez", "visitent"] },
          { label: "b", text: "(vous · finir · 6 h) → _____", distractors: ["finissent", "finissons"] },
          { label: "c", text: "(ils · attendre · le bus) → _____", distractors: ["attends", "attendez"] },
          { label: "d", text: "(nous · finir · l'exercice) → _____", distractors: ["finit", "finissez"] },
          { label: "e", text: "(vous · visiter · Paris · ?) → _____", distractors: ["visitons", "visites"] },
          { label: "f", text: "(elle · attendre · son amie) → _____", distractors: ["attendent", "attends"] },
        ],
        answers: [
          "a. Nous visitons le musée.",
          "b. Vous finissez à six heures.",
          "c. Ils attendent le bus.",
          "d. Nous finissons l'exercice.",
          "e. Vous visitez Paris ?",
          "f. Elle attend son amie.",
        ],
      },
    },
    {
      id: "tp-2",
      number: 2,
      title: "Irregular verbs: être, avoir, aller, faire",
      theme: "verbes",
      blocks: [
        {
          type: "table",
          headers: ["", "être", "avoir", "aller", "faire"],
          rows: [
            ["je / j'", "suis", "ai", "vais", "fais"],
            ["tu", "es", "as", "vas", "fais"],
            ["il / elle", "est", "a", "va", "fait"],
            ["nous", "**sommes**", "**avons**", "**allons**", "**faisons**"],
            ["vous", "**êtes**", "**avez**", "**allez**", "**faites**"],
            ["ils / elles", "sont", "ont", "vont", "font"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Vous faisons.~~ → **Vous faites.** : *faire* is irregular; like *vous êtes*, *vous faites* has no *-ez*.",
            "~~Ils va.~~ → **Ils vont.**",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "(vous · faire · du sport · ?) → _____", distractors: ["faisons", "font"] },
          { label: "b", text: "(nous · être · étudiants) → _____", distractors: ["êtes", "sont"] },
          { label: "c", text: "(ils · aller · au cinéma) → _____", distractors: ["va", "allez"] },
          { label: "d", text: "(nous · avoir · une voiture) → _____", distractors: ["avez", "ont"] },
          { label: "e", text: "(vous · être · fatigués · ?) → _____", distractors: ["sont", "sommes"] },
          { label: "f", text: "(ils · faire · leurs courses) → _____", distractors: ["faites", "fait"] },
        ],
        answers: [
          "a. Vous faites du sport ?",
          "b. Nous sommes étudiants.",
          "c. Ils vont au cinéma.",
          "d. Nous avons une voiture.",
          "e. Vous êtes fatigués ?",
          "f. Ils font leurs courses.",
        ],
      },
    },
    {
      id: "tp-3",
      number: 3,
      title: "Irregular verbs: prendre, partir, venir, vouloir, boire",
      theme: "verbes",
      blocks: [
        {
          type: "table",
          headers: ["", "prendre", "partir", "venir", "vouloir", "boire"],
          rows: [
            ["je", "prends", "pars", "viens", "veux", "bois"],
            ["tu", "prends", "pars", "viens", "veux", "bois"],
            ["il / elle", "prend", "part", "vient", "veut", "boit"],
            ["nous", "**prenons**", "**partons**", "**venons**", "**voulons**", "**buvons**"],
            ["vous", "**prenez**", "**partez**", "**venez**", "**voulez**", "**buvez**"],
            ["ils / elles", "prennent", "partent", "viennent", "veulent", "boivent"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Nous prennent.~~ → **Nous prenons.** : no *d* and a single *n* in *nous prenons* and *vous prenez*.",
            "~~Vous boivent.~~ → **Vous buvez.** : *boire* changes its stem in *nous buvons, vous buvez*.",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "(nous · prendre · le métro) → _____", distractors: ["prenez", "prennent"] },
          { label: "b", text: "(vous · venir · avec nous · ?) → _____", distractors: ["viennent", "venons"] },
          { label: "c", text: "(ils · vouloir · partir) → _____", distractors: ["veut", "partent"] },
          { label: "d", text: "(nous · boire · de l'eau) → _____", distractors: ["boivent", "buvez"] },
          { label: "e", text: "(je · partir · 8 h) → _____", distractors: ["part", "partir"] },
          { label: "f", text: "(vous · prendre · le train · ?) → _____", distractors: ["prennent", "prenons"] },
        ],
        answers: [
          "a. Nous prenons le métro.",
          "b. Vous venez avec nous ?",
          "c. Ils veulent partir.",
          "d. Nous buvons de l'eau.",
          "e. Je pars à huit heures.",
          "f. Vous prenez le train ?",
        ],
      },
    },
    {
      id: "tp-4",
      number: 4,
      title: "Partitive articles: du, de la, de l', des",
      theme: "partitifs",
      blocks: [
        {
          type: "table",
          headers: ["", "Article", "Example"],
          rows: [
            ["masculine", "**du**", "*du pain, du fromage*"],
            ["feminine", "**de la**", "*de la viande, de la salade*"],
            ["before a vowel", "**de l'**", "*de l'eau, de l'huile*"],
            ["plural", "**des**", "*des légumes, des fruits*"],
            ["after a negative", "**de / d'**", "*Je ne mange **pas de** viande. · Je ne bois **pas d'**eau.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Je ne bois pas du café.~~ → **Je ne bois pas de café.** : after a negative, *du, de la, de l', des* become *de*.",
            "~~Je mange de le fromage.~~ → **Je mange du fromage.**",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— Qu'est-ce que tu manges ? (🧀 fromage) → _____", distractors: ["de", "le"] },
          { label: "b", text: "— Tu bois du café ? (✖️) → _____", distractors: ["du"] },
          { label: "c", text: "— Qu'est-ce qu'elle boit ? (💧 eau) → _____", distractors: ["de la", "du"] },
          { label: "d", text: "— Qu'est-ce que vous mangez ? (nous · 🥕 légumes) → _____", distractors: ["du", "de"] },
          { label: "e", text: "— Il mange de la viande ? (✖️) → _____", distractors: ["de la"] },
          { label: "f", text: "— Qu'est-ce que tu achètes ? (🥗 salade) → _____", distractors: ["du", "des"] },
        ],
        answers: [
          "a. Je mange du fromage.",
          "b. Je ne bois pas de café.",
          "c. Elle boit de l'eau.",
          "d. Nous mangeons des légumes.",
          "e. Il ne mange pas de viande.",
          "f. J'achète de la salade.",
        ],
      },
    },
    {
      id: "tp-5",
      number: 5,
      title: "À and en: places and transport",
      theme: "lieux",
      blocks: [
        {
          type: "table",
          headers: ["Where", "Preposition", "Example"],
          rows: [
            ["a city", "**à**", "*à Paris, à Singapour*"],
            ["a place", "**à la / au / à l'**", "*à la bibliothèque, au cinéma, à l'école*"],
            ["feminine country", "**en**", "*en France, en Belgique, en Chine*"],
            ["masculine country + vowel", "**en**", "*en Iran*"],
            ["masculine country", "**au**", "*au Japon, au Canada*"],
            ["plural country", "**aux**", "*aux États-Unis*"],
          ],
        },
        {
          type: "table",
          headers: ["Transport", "Example"],
          rows: [
            ["**en** (you are inside)", "*en avion, en train, en métro, en voiture, en bus*"],
            ["**à** (you are on it)", "*à pied, à vélo*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Je vais à France.~~ → **Je vais en France.** : feminine country → *en*.",
            "~~en pied~~ → **à pied** : feet and bikes take *à*.",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— Elle habite où ? (🇧🇪 Belgique) → _____", distractors: ["à", "au"] },
          { label: "b", text: "— Vous allez où ? (nous · 🇯🇵 Japon) → _____", distractors: ["en", "à"] },
          { label: "c", text: "— Tu vas où, et comment ? (🏫 l'école · 🚶) → _____", distractors: ["en"] },
          { label: "d", text: "— Il va où, et comment ? (📚 la bibliothèque · 🚲) → _____", distractors: ["en"] },
          { label: "e", text: "— Ils voyagent où, et comment ? (🇨🇳 Chine · ✈️) → _____", distractors: ["à", "au"] },
          { label: "f", text: "— Tu vas où, et comment ? (Paris · 🚆) → _____", distractors: ["au", "dans"] },
        ],
        answers: [
          "a. Elle habite en Belgique.",
          "b. Nous allons au Japon.",
          "c. Je vais à l'école à pied.",
          "d. Il va à la bibliothèque à vélo.",
          "e. Ils voyagent en Chine en avion.",
          "f. Je vais à Paris en train.",
        ],
      },
    },
    {
      id: "tp-6",
      number: 6,
      title: "The pronoun y",
      theme: "lieux",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          rows: [
            ["What y replaces", "a place after *à, au, en, dans, chez*: *Tu vas **à la piscine** ? → Oui, j'**y** vais.*"],
            ["Position", "before the verb: *J'**y** vais.*"],
            ["Negative", "*ne* + *y* + verb + *pas*: *Je **n'y** vais **pas**.*"],
            ["With aller + infinitive", "before the infinitive: *Je vais **y** aller.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Je vais y.~~ → **J'y vais.** : *y* goes before the verb.",
            "~~Je ne vais pas y.~~ → **Je n'y vais pas.**",
            "~~J'y vais aller.~~ → **Je vais y aller.** : *y* goes before the infinitive.",
          ],
        },
      ],
      exercise: {
        title: "Answer with *y*.",
        items: [
          { label: "a", text: "Tu vas à la piscine ? Oui, → _____", distractors: ["le", "en"] },
          { label: "b", text: "Tu vas au cinéma ? Non, → _____", distractors: ["le", "en"] },
          { label: "c", text: "Tu vas aller à Paris ? Oui, → _____", distractors: ["en", "le"] },
          { label: "d", text: "Elle habite en France ? Oui, → _____", distractors: ["la", "en"] },
          { label: "e", text: "Vous allez au marché ? Non, nous → _____", distractors: ["le", "en"] },
        ],
        answers: [
          "a. j'y vais.",
          "b. je n'y vais pas.",
          "c. je vais y aller.",
          "d. elle y habite.",
          "e. n'y allons pas.",
        ],
      },
    },
    {
      id: "tp-7",
      number: 7,
      title: "Adjective agreement",
      theme: "adjectifs",
      blocks: [
        {
          type: "table",
          headers: ["Pattern", "Masculine", "Feminine"],
          rows: [
            ["+ e", "*grand, amusant*", "*grande, amusante*"],
            ["-eux → -euse", "*sérieux, heureux*", "*sérieuse, heureuse*"],
            ["-if → -ive", "*sportif, actif*", "*sportive, active*"],
            ["-ien → -ienne", "*italien, canadien*", "*italienne, canadienne*"],
            ["-eur → -euse", "*travailleur*", "*travailleuse*"],
            ["irregular", "*beau, vieux, gentil, blanc*", "*belle, vieille, gentille, blanche*"],
            ["plural", "+ *s* (not after -s or -x)", "*grands, grandes · sérieux, sérieuses*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Elle est sportif.~~ → **Elle est sportive.** : the adjective agrees with *elle*.",
            "~~Les filles sont amusants.~~ → **Les filles sont amusantes.** : feminine plural → *-es*.",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— Elle est comment ? (sérieux) → _____", distractors: ["sérieux", "sérieuses"] },
          { label: "b", text: "— Ils sont comment ? (sportif) → _____", distractors: ["sportif", "sportives"] },
          { label: "c", text: "— Ta mère est comment ? (travailleur) → _____", distractors: ["travailleur", "travailleurs"] },
          { label: "d", text: "— Les filles sont comment ? (amusant) → _____", distractors: ["amusants", "amusante"] },
          { label: "e", text: "— Elle est de quelle nationalité ? (canadien) → _____", distractors: ["canadiens", "canadien"] },
          { label: "f", text: "— C'est quoi ? (🏚️ · une maison · vieux) → _____", distractors: ["vieux", "vieil"] },
        ],
        answers: [
          "a. Elle est sérieuse.",
          "b. Ils sont sportifs.",
          "c. Ma mère est travailleuse.",
          "d. Les filles sont amusantes.",
          "e. Elle est canadienne.",
          "f. C'est une vieille maison.",
        ],
      },
    },
    {
      id: "tp-8",
      number: 8,
      title: "Word order: questions, negation and adverbs",
      theme: "phrases",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          rows: [
            ["Statement", "subject + verb + object: *Paul aime le café.*"],
            ["Yes/no question", "***Est-ce que** Paul aime le café ?* · ***Est-ce qu'**il aime le café ?*"],
            ["Negation", "*ne* before the verb, *pas* after it: *Il **ne** prend **pas** le bus.*"],
            ["Adverbs of frequency", "after the verb: *Je vais **souvent** au cinéma.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Est-ce que il travaille ?~~ → **Est-ce qu'il travaille ?** : *que* becomes *qu'* before a vowel.",
            "~~Je ne pas aime~~ → **Je n'aime pas** : *pas* comes after the verb.",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "(à un ami · est-ce que · aimer · le café) → _____", distractors: ["qu'est-ce"] },
          { label: "b", text: "(est-ce que · il · travailler · le samedi) → _____", distractors: ["que"] },
          { label: "c", text: "— Tu vas au cinéma ? (oui · souvent) → _____", distractors: ["toujours"] },
          { label: "d", text: "— Vous prenez le bus ? (non · nous) → _____", distractors: ["rien"] },
          { label: "e", text: "(au professeur · est-ce que · parler · anglais) → _____", distractors: ["qu'est-ce"] },
          { label: "f", text: "— Elle mange à quelle heure ? (toujours · 12 h) → _____", distractors: ["souvent"] },
        ],
        answers: [
          "a. Est-ce que tu aimes le café ?",
          "b. Est-ce qu'il travaille le samedi ?",
          "c. Je vais souvent au cinéma.",
          "d. Nous ne prenons pas le bus.",
          "e. Est-ce que vous parlez anglais ?",
          "f. Elle mange toujours à midi.",
        ],
      },
    },
    {
      id: "tp-9",
      number: 9,
      title: "Giving advice",
      theme: "conseils",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          headers: ["Expression", "How strong", "Example"],
          rows: [
            ["il faut + infinitive", "strong: what must be done", "*Il **faut** boire beaucoup d'eau.*"],
            ["tu peux + infinitive", "gentle: a suggestion", "*Tu **peux** faire du sport.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Il faut dors plus.~~ → **Il faut dormir plus.** : after *il faut* and *tu peux*, the second verb is an infinitive.",
            "~~Je faut manger.~~ → **Il faut manger.** : *il faut* never changes.",
          ],
        },
      ],
      exercise: {
        title: "Give the advice.",
        items: [
          { label: "a", text: "Conseil (il faut) : 😴 dormir plus → _____", distractors: ["dors", "dort"] },
          { label: "b", text: "Conseil (il faut) : 💧 boire beaucoup d'eau → _____", distractors: ["bois", "boit"] },
          { label: "c", text: "Conseil (il faut) : ☕ faire des pauses → _____", distractors: ["fais", "fait"] },
          { label: "d", text: "Conseil (tu peux) : ⚽ faire du sport → _____", distractors: ["peut", "fais"] },
          { label: "e", text: "Conseil (tu peux) : 🚌 prendre le bus → _____", distractors: ["prends", "peut"] },
          { label: "f", text: "Conseil (tu peux) : 🧺 aller au marché → _____", distractors: ["vas", "peut"] },
        ],
        answers: [
          "a. Il faut dormir plus.",
          "b. Il faut boire beaucoup d'eau.",
          "c. Il faut faire des pauses.",
          "d. Tu peux faire du sport.",
          "e. Tu peux prendre le bus.",
          "f. Tu peux aller au marché.",
        ],
      },
    },
  ],
};
