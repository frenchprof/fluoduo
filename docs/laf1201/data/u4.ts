import type { Sheet } from "./types";

export const u4: Sheet = {
  id: "u4",
  label: "Unité 4",
  title: "Unité 4 · On mange quoi cette semaine ?",
  subtitle: "LAF1201 French 1 · Atelier A1 · Repas, courses et projets",
  sections: [
    {
      id: "u4-1",
      number: 1,
      title: "Meals and what you eat and drink",
      theme: "repas",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          rows: [
            ["Meals", "*le petit-déjeuner, le déjeuner, le dîner*"],
            ["Some (partitive)", "*du pain, du café · de la viande, de la salade · de l'eau · des fruits*"],
            ["Eating, drinking", "*Je mange **du** pain. · Je bois **du** café.*"],
            ["How often", "*toujours · souvent · parfois* → *Je bois **souvent** du thé.*"],
          ],
        },
        {
          type: "table",
          headers: ["boire", "", "manger", ""],
          rows: [
            ["je bois", "nous buvons", "je mange", "nous mangeons"],
            ["tu bois", "vous buvez", "tu manges", "vous mangez"],
            ["il / elle boit", "ils / elles boivent", "il / elle mange", "ils / elles mangent"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Je ne mange pas du pain.~~ → **Je ne mange pas de pain.** : *du, de la, des* become *de* after a negation.",
            "~~Je souvent bois du thé.~~ → **Je bois souvent du thé.** : the adverb goes after the verb.",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— Qu'est-ce que tu manges au petit-déjeuner ? (🍞) → _____" },
          { label: "b", text: "— Tu bois du thé ? (souvent) → _____" },
          { label: "c", text: "— Tu manges de la viande ? (✖️) → _____" },
          { label: "d", text: "— Vous buvez de l'eau ? (nous · toujours) → _____" },
          { label: "e", text: "— Et elle, au dîner ? (🥗 · parfois) → _____" },
        ],
        answers: [
          "a. Au petit-déjeuner, je mange du pain.",
          "b. Je bois souvent du thé.",
          "c. Je ne mange pas de viande.",
          "d. Nous buvons toujours de l'eau.",
          "e. Au dîner, elle mange parfois de la salade.",
        ],
      },
    },
    {
      id: "u4-2",
      number: 2,
      title: "Food shops and doing the shopping",
      theme: "repas",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          headers: ["Shop", "What you buy"],
          rows: [
            ["la boulangerie", "*du pain, des croissants*"],
            ["la boucherie", "*de la viande*"],
            ["la fromagerie", "*du fromage*"],
            ["le marché", "*des fruits, des légumes*"],
            ["le supermarché", "*un peu de tout*"],
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Saying where you shop",
          lines: ["*Je fais mes courses **au** supermarché.* · *J'achète du pain **à la** boulangerie.*"],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: ["~~Je fais mes courses à le marché.~~ → **Je fais mes courses au marché.** : *à + le* becomes *au*."],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— Tu fais tes courses où ? (🛒 le supermarché) → _____" },
          { label: "b", text: "— Où est-ce que tu achètes le pain ? (🥖 la boulangerie) → _____" },
          { label: "c", text: "— Et la viande ? (🥩 la boucherie) → _____" },
          { label: "d", text: "— Et les fruits ? (🍎 le marché) → _____" },
          { label: "e", text: "— _____ — Au supermarché. (à un ami)" },
        ],
        answers: [
          "a. Je fais mes courses au supermarché.",
          "b. J'achète du pain à la boulangerie.",
          "c. J'achète de la viande à la boucherie.",
          "d. J'achète des fruits au marché.",
          "e. Tu fais tes courses où ?",
        ],
      },
    },
    {
      id: "u4-3",
      number: 3,
      title: "Talking about plans with aller + infinitive",
      theme: "projets",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          rows: [
            ["Form", "*aller* (present) + infinitive"],
            ["Examples", "*Je **vais manger** mieux. · Nous **allons faire** du sport. · Elle **va cuisiner**.*"],
            ["Negative", "*Je **ne** vais **pas** manger de chocolat.*"],
          ],
        },
        {
          type: "table",
          headers: ["aller", "", "aller", ""],
          rows: [
            ["je vais", "nous allons", "tu vas", "vous allez"],
            ["il / elle va", "ils / elles vont", "", ""],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Je vais mange.~~ → **Je vais manger.** : the second verb stays in the infinitive.",
            "~~Je vais ne pas manger.~~ → **Je ne vais pas manger.** : *ne… pas* goes around *aller*.",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— Qu'est-ce que tu vas faire ? (manger · mieux) → _____" },
          { label: "b", text: "— Et vous ? (nous · faire du sport) → _____" },
          { label: "c", text: "— Et elle, ce soir ? (cuisiner) → _____" },
          { label: "d", text: "— Tu vas manger du chocolat ? (✖️) → _____" },
          { label: "e", text: "— Et eux ? (boire · plus d'eau) → _____" },
        ],
        answers: [
          "a. Je vais manger mieux.",
          "b. Nous allons faire du sport.",
          "c. Elle va cuisiner ce soir.",
          "d. Je ne vais pas manger de chocolat.",
          "e. Ils vont boire plus d'eau.",
        ],
      },
    },
  ],
};
