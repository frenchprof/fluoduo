import type { Sheet } from "./types";

const DIRECTIONS = {
  type: "audio" as const,
  title: "🗺️ Dans la rue",
  lines: [
    "— Pardon, madame. La pharmacie, c'est loin ?",
    "— Non, c'est près d'ici. Vous allez tout droit et vous prenez la deuxième rue à droite.",
    "— La deuxième rue à droite. D'accord.",
    "— La pharmacie est entre la banque et la boulangerie, en face de la poste.",
    "— Et le parc, s'il vous plaît ?",
    "— Le parc est au bout de la rue, à gauche du musée.",
    "— Merci beaucoup, madame !",
  ],
};

const PHONE = {
  type: "audio" as const,
  title: "📞 Au téléphone",
  lines: [
    "— Allô, bonjour ! C'est bien l'école de langues Bonjour Paris ?",
    "— Oui, bonjour !",
    "— Je voudrais un cours de français, s'il vous plaît.",
    "— Très bien. Il y a deux cours : le lundi et le mercredi soir, de dix-huit heures à vingt heures, ou le samedi matin, de neuf heures à midi.",
    "— Le samedi matin, c'est parfait.",
    "— D'accord. Le cours commence le quatre novembre. Il coûte cent vingt euros par mois.",
    "— Cent vingt euros. Je paie quand ?",
    "— Il faut payer avant le vingt-huit octobre.",
    "— Merci beaucoup. Au revoir !",
  ],
};

export const ls: Sheet = {
  id: "ls",
  label: "Listening",
  title: "Listening",
  subtitle: "LAF1201 French 1 · directions and a phone call",
  sections: [
    {
      id: "ls-1",
      number: 1,
      title: "Prepositions of place",
      theme: "ecoute",
      blocks: [
        {
          type: "table",
          headers: ["Preposition", "Meaning", "Example"],
          rows: [
            ["entre… et…", "between", "*entre la banque et la poste*"],
            ["en face de", "opposite", "*en face **de la** poste*"],
            ["à côté de", "next to", "*à côté **du** musée*"],
            ["à gauche de / à droite de", "to the left / right of", "*à gauche **du** musée*"],
            ["au bout de", "at the end of", "*au bout **de la** rue*"],
            ["près de / loin de", "near / far from", "*près d'ici · loin de la gare*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: ["~~à gauche de le musée~~ → **à gauche du musée** : *de + le* becomes *du* after every one of these prepositions."],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— Où est la pharmacie ? (entre · la banque · la poste) → _____", distractors: ["à", "de"] },
          { label: "b", text: "— Où est le parc ? (au bout · la rue) → _____", distractors: ["du", "le"] },
          { label: "c", text: "— Où est le café ? (à gauche · le musée) → _____", distractors: ["de", "le"] },
          { label: "d", text: "— La gare, c'est loin ? (non · près · ici) → _____", distractors: ["loin", "de"] },
          { label: "e", text: "— Où est l'hôtel ? (en face · la gare) → _____", distractors: ["du", "à"] },
        ],
        answers: [
          "a. La pharmacie est entre la banque et la poste.",
          "b. Le parc est au bout de la rue.",
          "c. Le café est à gauche du musée.",
          "d. Non, c'est près d'ici.",
          "e. L'hôtel est en face de la gare.",
        ],
      },
    },
    {
      id: "ls-2",
      number: 2,
      title: "Following directions",
      theme: "ecoute",
      blocks: [
        {
          type: "callout",
          variant: "tip",
          title: "Before you listen",
          lines: ["Listen once for the general idea, then again for each place. Note every preposition: one word changes the answer."],
        },
        DIRECTIONS,
      ],
      exercise: {
        title: "Listen. *Vrai* or *faux*?",
        items: [
          { label: "a", text: "La pharmacie est loin. → _____" },
          { label: "b", text: "Il faut prendre la première rue à droite. → _____" },
          { label: "c", text: "La pharmacie est entre la banque et la boulangerie. → _____" },
          { label: "d", text: "La pharmacie est à côté de la poste. → _____" },
          { label: "e", text: "Le parc est au bout de la rue. → _____" },
          { label: "f", text: "Le parc est à droite du musée. → _____" },
        ],
        answers: ["a. faux", "b. faux", "c. vrai", "d. faux", "e. vrai", "f. faux"],
      },
    },
    {
      id: "ls-3",
      number: 3,
      title: "A phone call: true or false?",
      theme: "ecoute",
      blocks: [
        {
          type: "callout",
          variant: "tip",
          title: "Before you listen",
          lines: [
            "A phone call has several details to note separately: the days, the times, the price, the start date, the deadline.",
            "Times: *dix-huit heures* = 18 h · *midi* = 12 h. Prices: *cent vingt euros* = 120 €.",
          ],
        },
        PHONE,
      ],
      exercise: {
        title: "Listen. *Vrai* or *faux*?",
        items: [
          { label: "a", text: "Il y a deux cours. → _____" },
          { label: "b", text: "Le cours du samedi est l'après-midi. → _____" },
          { label: "c", text: "La personne choisit le cours du mercredi. → _____" },
          { label: "d", text: "Le cours commence le quatre novembre. → _____" },
          { label: "e", text: "Le cours coûte cent euros par mois. → _____" },
          { label: "f", text: "Il faut payer avant le vingt-huit octobre. → _____" },
        ],
        answers: ["a. vrai", "b. faux", "c. faux", "d. vrai", "e. faux", "f. vrai"],
      },
    },
    {
      id: "ls-4",
      number: 4,
      title: "A phone call: the details",
      theme: "ecoute",
      blocks: [PHONE],
      exercise: {
        title: "Listen and answer.",
        items: [
          { label: "a", text: "— Le cours du samedi, c'est à quelle heure ? → _____", distractors: ["dix", "vingt"] },
          { label: "b", text: "— Le cours coûte combien ? → _____", distractors: ["cent", "douze"] },
          { label: "c", text: "— Le cours commence quand ? → _____", distractors: ["octobre", "quatorze"] },
          { label: "d", text: "— Il faut payer avant quelle date ? → _____", distractors: ["novembre", "vingt"] },
          { label: "e", text: "— Le cours du soir, c'est quels jours ? → _____", distractors: ["samedi", "mardi"] },
        ],
        answers: [
          "a. De neuf heures à midi.",
          "b. Cent vingt euros par mois.",
          "c. Le quatre novembre.",
          "d. Avant le vingt-huit octobre.",
          "e. Le lundi et le mercredi.",
        ],
      },
    },
  ],
};
