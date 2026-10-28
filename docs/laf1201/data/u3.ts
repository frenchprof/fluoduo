import type { Sheet } from "./types";

export const u3: Sheet = {
  id: "u3",
  label: "Unité 3",
  title: "Unité 3 · On va où cet été ?",
  subtitle: "LAF1201 French 1 · Atelier A1 · Météo, ville et chemin",
  sections: [
    {
      id: "u3-1",
      number: 1,
      title: "The weather and the temperature",
      theme: "meteo",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          rows: [
            ["Asking", "*Quel temps fait-il ?*"],
            ["Il fait…", "*Il fait **beau**. · Il fait **chaud**. · Il fait **froid**. · Il fait **mauvais**.*"],
            ["Other verbs", "*Il **pleut**. · Il **neige**.*"],
            ["Il y a…", "*Il y a **du soleil**. · Il y a **du vent**. · Il y a **des nuages**.*"],
            ["Temperature", "*Il fait **vingt-cinq degrés**.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Il est chaud.~~ → **Il fait chaud.** : weather uses *il fait*.",
            "~~Il fait pluie.~~ → **Il pleut.** : rain and snow have their own verbs.",
          ],
        },
      ],
      exercise: {
        title: "Describe the weather.",
        items: [
          { label: "a", text: "☀️ It's nice weather. → _____" },
          { label: "b", text: "🌧️ It's raining. → _____" },
          { label: "c", text: "🥶 It's cold and it's snowing. → _____" },
          { label: "d", text: "💨 It's windy. → _____" },
          { label: "e", text: "🌡️ It's 30 degrees. → _____" },
          { label: "f", text: "Ask what the weather is like. → _____" },
        ],
        answers: [
          "a. Il fait beau.",
          "b. Il pleut.",
          "c. Il fait froid et il neige.",
          "d. Il y a du vent.",
          "e. Il fait trente degrés.",
          "f. Quel temps fait-il ?",
        ],
      },
    },
    {
      id: "u3-2",
      number: 2,
      title: "Places in town",
      theme: "ville",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          rows: [
            ["Places", "*la gare, la poste, la banque, le musée, le parc, la pharmacie, l'hôtel*"],
            ["Is there…?", "*Est-ce qu'il y a une pharmacie ?* → *Oui, il y a une pharmacie.*"],
            ["Where is…?", "*Où est la gare ?* → *La gare est **à côté de** la poste.*"],
          ],
        },
        {
          type: "table",
          headers: ["Preposition", "Example"],
          rows: [
            ["à côté de", "*à côté de la banque*"],
            ["en face de", "*en face de la poste*"],
            ["entre… et…", "*entre la gare et le parc*"],
            ["de + le → **du**", "*à côté **du** musée, en face **du** parc*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: ["~~à côté de le musée~~ → **à côté du musée** : *de + le* always becomes *du*."],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "Ask where the station is. → _____" },
          { label: "b", text: "Ask if there is a pharmacy. → _____" },
          { label: "c", text: "The station is next to the post office. → _____" },
          { label: "d", text: "The bank is opposite the museum. → _____" },
          { label: "e", text: "The hotel is between the station and the park. → _____" },
        ],
        answers: [
          "a. Où est la gare ?",
          "b. Est-ce qu'il y a une pharmacie ?",
          "c. La gare est à côté de la poste.",
          "d. La banque est en face du musée.",
          "e. L'hôtel est entre la gare et le parc.",
        ],
      },
    },
    {
      id: "u3-3",
      number: 3,
      title: "Asking for and giving directions",
      theme: "ville",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          rows: [
            ["Asking", "*Pardon, où est le musée, s'il vous plaît ?*"],
            ["Straight on", "*Vous allez **tout droit**.*"],
            ["Turning", "*Vous prenez la **première** rue **à gauche**. · la **deuxième** rue **à droite**.*"],
            ["Arriving", "*Le musée est **en face de** la banque.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~la rue première~~ → **la première rue** : the ordinal number comes before the noun.",
            "~~Vous allez droit.~~ → **Vous allez tout droit.** : *tout droit* = straight on.",
          ],
        },
      ],
      exercise: {
        title: "Give the directions.",
        items: [
          { label: "a", text: "Go straight on. → _____" },
          { label: "b", text: "Take the first street on the left. → _____" },
          { label: "c", text: "Take the second street on the right. → _____" },
          { label: "d", text: "The museum is opposite the bank. → _____" },
          { label: "e", text: "Ask politely where the museum is. → _____" },
        ],
        answers: [
          "a. Vous allez tout droit.",
          "b. Vous prenez la première rue à gauche.",
          "c. Vous prenez la deuxième rue à droite.",
          "d. Le musée est en face de la banque.",
          "e. Où est le musée, s'il vous plaît ?",
        ],
      },
    },
  ],
};
