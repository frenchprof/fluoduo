import type { Sheet } from "./types";

export const wr: Sheet = {
  id: "wr",
  label: "Writing",
  title: "Writing",
  subtitle: "LAF1201 French 1 · an informal email giving advice",
  sections: [
    {
      id: "wr-1",
      number: 1,
      title: "The parts of an informal email",
      theme: "ecriture",
      blocks: [
        {
          type: "table",
          headers: ["Part", "Example"],
          rows: [
            ["1. Greeting", "*Salut Lucas,* · *Chère Julie,* · *Cher Paul,*"],
            ["2. Opening", "*Super, tu viens à Singapour !* · *Merci pour ton message !*"],
            ["3. Main body", "your advice, each with a reason or an example"],
            ["4. Closing", "*Bon voyage !* · *À bientôt !* · *Bonne visite !*"],
            ["5. Sign-off", "*Bises,* · *Amitiés,* + your first name"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: ["~~Cher Julie,~~ → **Chère Julie,** : *cher* agrees with the person: *Cher Paul, Chère Julie*."],
        },
      ],
      exercise: {
        title: "Build the line.",
        items: [
          { label: "a", text: "1. Greeting (à Julie) → _____", distractors: ["Cher"] },
          { label: "b", text: "1. Greeting (à Paul) → _____", distractors: ["Chère"] },
          { label: "c", text: "2. Opening (Lucas vient à Singapour) → _____", distractors: ["vient", "en"] },
          { label: "d", text: "4. Closing (un voyage) → _____", distractors: ["Bonne"] },
          { label: "e", text: "4. Closing (une visite) → _____", distractors: ["Bon"] },
        ],
        answers: [
          "a. Chère Julie,",
          "b. Cher Paul,",
          "c. Super, tu viens à Singapour !",
          "d. Bon voyage !",
          "e. Bonne visite !",
        ],
      },
    },
    {
      id: "wr-2",
      number: 2,
      title: "Advice with a reason",
      theme: "ecriture",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          headers: ["Advice", "+ a reason or an example"],
          rows: [
            ["*Il faut prendre le métro…*", "*…parce que c'est rapide.*"],
            ["*Il est important de boire de l'eau…*", "*…parce qu'il fait chaud.*"],
            ["*Je te conseille de visiter Chinatown…*", "*…parce que c'est intéressant.*"],
            ["*Tu devrais manger dans un hawker centre…*", "*…par exemple du poulet au riz.*"],
            ["*Va au marché…* (imperative)", "*…parce que c'est sympa.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~parce que il fait chaud~~ → **parce qu'il fait chaud** : *que* becomes *qu'* before a vowel.",
            "~~Tu devrais prends le métro.~~ → **Tu devrais prendre le métro.** : an infinitive after *il faut, tu devrais, je te conseille de*.",
          ],
        },
      ],
      exercise: {
        title: "Build the advice.",
        items: [
          { label: "a", text: "(il faut · prendre le métro · rapide) → _____", distractors: ["prends", "que"] },
          { label: "b", text: "(il est important de · boire de l'eau · il fait chaud) → _____", distractors: ["du", "que"] },
          { label: "c", text: "(je te conseille de · visiter Chinatown · intéressant) → _____", distractors: ["visites", "à"] },
          { label: "d", text: "(tu devrais · manger au marché · pas cher) → _____", distractors: ["manges", "chère"] },
          { label: "e", text: "(impératif, tu · aller au parc · le matin) → _____", distractors: ["Vas", "Allez"] },
        ],
        answers: [
          "a. Il faut prendre le métro parce que c'est rapide.",
          "b. Il est important de boire de l'eau parce qu'il fait chaud.",
          "c. Je te conseille de visiter Chinatown parce que c'est intéressant.",
          "d. Tu devrais manger au marché parce que ce n'est pas cher.",
          "e. Va au parc le matin !",
        ],
      },
    },
    {
      id: "wr-3",
      number: 3,
      title: "Writing the email",
      theme: "ecriture",
      blocks: [
        {
          type: "callout",
          variant: "tip",
          title: "What is marked",
          lines: [
            "75 to 85 words · the five parts of the email · at least five pieces of advice, each with a reason or an example.",
            "Grammar: verb conjugation, adjective agreement, articles (*du, de la, des, pas de*) and prepositions (*à, en, au*).",
          ],
        },
      ],
      writing: {
        task: "Ton ami Lucas vient à Singapour pour une semaine. Il te demande des conseils. Écris-lui un e-mail de 75 à 85 mots. Donne au moins cinq conseils, avec une raison ou un exemple pour chaque conseil.",
        minWords: 75,
        maxWords: 85,
        outline: [
          { label: "Greeting", example: "Salut Lucas," },
          { label: "Opening", example: "Super, tu viens à Singapour !" },
          { label: "Main body", example: "5 pieces of advice + a reason or an example each" },
          { label: "Closing", example: "Bon voyage !" },
          { label: "Sign-off", example: "Bises, + your first name" },
        ],
        phrases: [
          "il faut + infinitif",
          "il est important de + infinitif",
          "je te conseille de + infinitif",
          "tu devrais + infinitif",
          "l'impératif : prends, visite, mange, bois, va",
          "parce que c'est… · parce qu'il fait…",
          "par exemple…",
        ],
        checklist: [
          "I have a greeting, an opening, a closing and a sign-off.",
          "I give at least five pieces of advice.",
          "Each piece of advice has a reason or an example.",
          "After il faut, tu devrais, je te conseille de, the verb is an infinitive.",
          "My verbs are conjugated correctly (nous prenons, vous faites…).",
          "My adjectives agree (une ville intéressante).",
          "My articles are right (du, de la, des; pas de after a negative).",
          "My prepositions are right (à Singapour, en métro, au marché).",
        ],
        model: [
          "Salut Lucas,",
          "Super, tu viens à Singapour ! Voici mes conseils. Il fait très chaud, alors il est important de boire beaucoup d'eau. Je te conseille de prendre le métro parce que c'est rapide et pas cher. Tu devrais visiter Chinatown : c'est très intéressant. Mange dans un hawker centre, par exemple du poulet au riz. C'est délicieux ! Il faut aussi aller au Jardin botanique le matin, parce qu'il fait moins chaud.",
          "Tu vas adorer Singapour ! Bon voyage !",
          "Bises,",
          "Mei",
        ],
      },
    },
  ],
};
