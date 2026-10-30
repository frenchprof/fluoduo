import type { Sheet } from "./types";

const MENU = {
  type: "document" as const,
  title: "Café du Marché",
  lines: [
    "**Entrées**",
    "Salade de tomates · 5 €",
    "Soupe de légumes · 6 €",
    "**Plats**",
    "Poulet frites · 14 €",
    "Poisson et riz · 16 €",
    "Omelette au fromage (végétarienne) · 11 €",
    "**Desserts**",
    "Tarte aux pommes · 6 €",
    "Salade de fruits · 5 €",
    "Glace (2 boules) · 4 €",
    "**Formule midi** (entrée + plat) · 15 € · du mardi au vendredi",
    "**Horaires** · du mardi au dimanche, de 12 h à 14 h 30 et de 19 h à 22 h · fermé le lundi",
  ],
};

const POSTCARD = {
  type: "document" as const,
  title: "☀️ Nice",
  lines: [
    "Chère Julie,",
    "Je suis à Nice, dans le sud de la France, avec ma famille. Nous habitons dans un petit hôtel en face de la plage.",
    "Il fait très beau et il fait trente degrés ! Le matin, nous allons à la plage. L'après-midi, il fait trop chaud : nous visitons les musées. Quand il pleut, nous allons au cinéma.",
    "Nice est une belle ville, avec un grand marché aux fleurs. La cuisine est délicieuse : je mange du poisson tous les jours.",
    "Demain, nous allons visiter Monaco en train. Samedi, je rentre à Paris.",
    "Bises,",
    "Thomas",
  ],
};

export const rd: Sheet = {
  id: "rd",
  label: "Reading",
  title: "Reading",
  subtitle: "LAF1201 French 1 · a menu and a postcard",
  sections: [
    {
      id: "rd-1",
      number: 1,
      title: "Reading a menu: true or false?",
      theme: "lecture",
      blocks: [
        {
          type: "callout",
          variant: "tip",
          title: "How to read a menu",
          lines: [
            "*entrées* = starters · *plats* = main courses · *desserts* = desserts",
            "*formule* = a set menu at one price · *végétarien* = no meat · *horaires* = opening times",
            "Read the whole document before answering. A single word (*fermé*, *lundi*, *soir*) can make a sentence false.",
          ],
        },
        MENU,
      ],
      exercise: {
        title: "Read the menu. *Vrai* or *faux*?",
        items: [
          { label: "a", text: "Le restaurant est ouvert le lundi. → _____" },
          { label: "b", text: "L'omelette est un plat végétarien. → _____" },
          { label: "c", text: "La soupe est un dessert. → _____" },
          { label: "d", text: "La glace coûte quatre euros. → _____" },
          { label: "e", text: "Le soir, le restaurant ferme à 22 heures. → _____" },
          { label: "f", text: "La formule midi existe le samedi. → _____" },
        ],
        answers: ["a. faux", "b. vrai", "c. faux", "d. vrai", "e. vrai", "f. faux"],
      },
    },
    {
      id: "rd-2",
      number: 2,
      title: "Reading a menu: the details",
      theme: "lecture",
      blocks: [MENU],
      exercise: {
        title: "Read the menu and answer.",
        items: [
          { label: "a", text: "— Il y a combien d'entrées ? → _____", distractors: ["trois", "une"] },
          { label: "b", text: "— Le poisson coûte combien ? → _____", distractors: ["six", "quatorze"] },
          { label: "c", text: "— Le soir, le restaurant ouvre à quelle heure ? → _____", distractors: ["douze", "vingt-deux"] },
          { label: "d", text: "— Le restaurant est fermé quel jour ? → _____", distractors: ["dimanche", "mardi"] },
          { label: "e", text: "— La formule midi coûte combien ? → _____", distractors: ["onze", "seize"] },
        ],
        answers: [
          "a. Il y a deux entrées.",
          "b. Il coûte seize euros.",
          "c. Il ouvre à dix-neuf heures.",
          "d. Il est fermé le lundi.",
          "e. Elle coûte quinze euros.",
        ],
      },
    },
    {
      id: "rd-3",
      number: 3,
      title: "Reading a postcard: true or false?",
      theme: "lecture",
      blocks: [
        {
          type: "callout",
          variant: "tip",
          title: "What to look for",
          lines: [
            "Where the writer is and where they live · the weather · what they do in each kind of weather · the food and the city · their plans (*demain, samedi* + present or *aller* + infinitive).",
          ],
        },
        POSTCARD,
      ],
      exercise: {
        title: "Read the postcard. *Vrai* or *faux*?",
        items: [
          { label: "a", text: "Thomas est à Paris. → _____" },
          { label: "b", text: "L'hôtel est en face de la plage. → _____" },
          { label: "c", text: "À Nice, il fait froid. → _____" },
          { label: "d", text: "L'après-midi, ils vont à la plage. → _____" },
          { label: "e", text: "Quand il pleut, ils vont au cinéma. → _____" },
          { label: "f", text: "Demain, ils vont aller à Monaco en voiture. → _____" },
        ],
        answers: ["a. faux", "b. vrai", "c. faux", "d. faux", "e. vrai", "f. faux"],
      },
    },
    {
      id: "rd-4",
      number: 4,
      title: "Reading a postcard: the details",
      theme: "lecture",
      blocks: [POSTCARD],
      exercise: {
        title: "Read the postcard and answer.",
        items: [
          { label: "a", text: "— Quel temps fait-il à Nice ? → _____", distractors: ["mauvais", "froid"] },
          { label: "b", text: "— Qu'est-ce que Thomas mange tous les jours ? → _____", distractors: ["de", "le"] },
          { label: "c", text: "— Qu'est-ce qu'ils font le matin ? → _____", distractors: ["au", "en"] },
          { label: "d", text: "— Qu'est-ce qu'ils vont faire demain ? → _____", distractors: ["visitent", "allons"] },
          { label: "e", text: "— Samedi, Thomas va dans quelle ville ? → _____", distractors: ["En", "Au"] },
        ],
        answers: [
          "a. Il fait beau.",
          "b. Il mange du poisson.",
          "c. Ils vont à la plage.",
          "d. Ils vont visiter Monaco.",
          "e. À Paris.",
        ],
      },
    },
  ],
};
