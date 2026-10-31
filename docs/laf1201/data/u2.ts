import type { Sheet } from "./types";

export const u2: Sheet = {
  id: "u2",
  label: "Unité 2",
  title: "Unité 2 · On fait quoi ce week-end ?",
  subtitle: "LAF1201 French 1 · Atelier A1 · Objets, goûts et sorties",
  sections: [
    {
      id: "u2-1",
      number: 1,
      title: "Objects with un, une, des and mon, ma, mes",
      theme: "objets",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          headers: ["", "Masculine", "Feminine", "Plural"],
          rows: [
            ["a / some", "*C'est **un** sac.*", "*C'est **une** clé.*", "*Ce sont **des** livres.*"],
            ["my", "*C'est **mon** sac.*", "*C'est **ma** clé.*", "*Ce sont **mes** livres.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~C'est des livres.~~ → **Ce sont des livres.** : use *ce sont* in the plural.",
            "~~ma amie~~ → **mon amie** : *mon* before a vowel, even for a feminine word.",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— C'est quoi ? (👜) → _____" },
          { label: "b", text: "— C'est quoi ? (🔑 · moi) → _____" },
          { label: "c", text: "— C'est quoi ? (📚) → _____" },
          { label: "d", text: "— C'est quoi ? (🖊️🖊️ · moi) → _____" },
          { label: "e", text: "— C'est quoi ? (📱 · moi) → _____" },
          { label: "f", text: "— C'est quoi ? (⌚) → _____" },
        ],
        answers: [
          "a. C'est un sac.",
          "b. C'est ma clé.",
          "c. Ce sont des livres.",
          "d. Ce sont mes stylos.",
          "e. C'est mon téléphone.",
          "f. C'est une montre.",
        ],
      },
    },
    {
      id: "u2-2",
      number: 2,
      title: "Saying what you like and dislike",
      theme: "gouts",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          rows: [
            ["❤️❤️", "*J'**adore** le cinéma.*"],
            ["❤️", "*J'**aime** la musique.*"],
            ["✖️", "*Je **n'**aime **pas** le football.*"],
            ["✖️✖️", "*Je **déteste** les jeux vidéo.*"],
            ["+ a verb", "*J'aime **danser**.* · *Je déteste **cuisiner**.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~J'aime du sport.~~ → **J'aime le sport.** : after *aimer, adorer, détester*, use *le, la, les*.",
            "~~Je ne aime pas~~ → **Je n'aime pas** : *ne* becomes *n'* before a vowel.",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— Tu aimes le cinéma ? (❤️❤️) → _____" },
          { label: "b", text: "— Tu aimes la musique ? (❤️) → _____" },
          { label: "c", text: "— Tu aimes le football ? (✖️) → _____" },
          { label: "d", text: "— Et les jeux vidéo ? (✖️✖️) → _____" },
          { label: "e", text: "— Et elle, elle aime danser ? (❤️) → _____" },
          { label: "f", text: "— _____ — Oui, j'aime le sport. (to a friend)" },
        ],
        answers: [
          "a. J'adore le cinéma.",
          "b. J'aime la musique.",
          "c. Je n'aime pas le football.",
          "d. Je déteste les jeux vidéo.",
          "e. Elle aime danser.",
          "f. Tu aimes le sport ?",
        ],
      },
    },
    {
      id: "u2-3",
      number: 3,
      title: "Giving a reason",
      theme: "gouts",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          rows: [
            ["Why?", "*Pourquoi ?* → *Parce que c'est…*"],
            ["😀", "*amusant · intéressant · génial · sympa*"],
            ["🙁", "*ennuyeux · difficile · nul*"],
            ["Example", "*J'aime le cinéma **parce que c'est** amusant.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: ["~~parce que est amusant~~ → **parce que c'est amusant** : don't forget *c'*."],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— Tu aimes le cinéma ? Pourquoi ? (❤️ · amusant) → _____" },
          { label: "b", text: "— Et le football ? (✖️ · ennuyeux) → _____" },
          { label: "c", text: "— Et la musique ? (❤️❤️ · génial) → _____" },
          { label: "d", text: "— Et la danse ? (✖️✖️ · difficile) → _____" },
          { label: "e", text: "— Je n'aime pas le football. — _____ — Parce que c'est ennuyeux." },
        ],
        answers: [
          "a. J'aime le cinéma parce que c'est amusant.",
          "b. Je n'aime pas le football parce que c'est ennuyeux.",
          "c. J'adore la musique parce que c'est génial.",
          "d. Je déteste la danse parce que c'est difficile.",
          "e. Pourquoi ?",
        ],
      },
    },
    {
      id: "u2-4",
      number: 4,
      title: "Inviting, accepting and refusing",
      theme: "sorties",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          rows: [
            ["Inviting", "*Tu es libre samedi soir ?* · *Tu veux venir ?* · *Tu veux aller **au** cinéma ?*"],
            ["Accepting", "*Oui, je veux bien !* · *D'accord !*"],
            ["Refusing", "*Désolé, je ne suis pas libre.* · *Non merci, je n'aime pas le cinéma.*"],
          ],
        },
        {
          type: "table",
          headers: ["à + article", "Example"],
          rows: [
            ["à + le → **au**", "*au cinéma, au restaurant, au concert*"],
            ["à + la → **à la**", "*à la piscine, à la plage*"],
            ["à + l' → **à l'**", "*à l'opéra*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: ["~~Tu veux aller à le cinéma ?~~ → **Tu veux aller au cinéma ?** : *à + le* always becomes *au*."],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "(to a friend · 🎬 le cinéma) → _____" },
          { label: "b", text: "(to a friend · 🏊 la piscine) → _____" },
          { label: "c", text: "— Tu veux aller au concert ? (😀) → _____" },
          { label: "d", text: "— Tu veux aller au cinéma ce soir ? (😕 · pas libre · you are a boy) → _____" },
          { label: "e", text: "(to a friend · 🍽️ le restaurant) → _____" },
        ],
        answers: [
          "a. Tu veux aller au cinéma ?",
          "b. Tu veux aller à la piscine ?",
          "c. Oui, je veux bien !",
          "d. Désolé, je ne suis pas libre.",
          "e. Tu veux aller au restaurant ?",
        ],
      },
    },
    {
      id: "u2-5",
      number: 5,
      title: "Arranging where and when",
      theme: "sorties",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          rows: [
            ["Are you free?", "*Tu es libre samedi soir ?*"],
            ["Will you come?", "*Je vais à la piscine vendredi. Tu veux venir ?*"],
            ["Where and when", "*Rendez-vous **au** cinéma **à** dix-neuf heures.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Rendez-vous à le cinéma.~~ → **Rendez-vous au cinéma.** : *à + le* becomes *au*.",
            "~~à dix-neuf heure~~ → **à dix-neuf heures** : *heures* takes an *s* from two o'clock on.",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— _____ — Oui, je suis libre ! (to a friend · samedi soir)", distractors: ["libres", "est"] },
          { label: "b", text: "— Je vais à la piscine vendredi. _____ (to a friend)", distractors: ["veut", "viens"] },
          { label: "c", text: "(🎬 le cinéma · 19 h) → _____", distractors: ["le", "heure"] },
          { label: "d", text: "(☕ le café · samedi) → _____", distractors: ["le", "à"] },
          { label: "e", text: "(🏊 la piscine · vendredi · 15 h) → _____", distractors: ["au", "heure"], alternates: ["Rendez-vous vendredi à quinze heures à la piscine.", "Rendez-vous vendredi à la piscine à quinze heures."] },
        ],
        answers: [
          "a. Tu es libre samedi soir ?",
          "b. Tu veux venir ?",
          "c. Rendez-vous au cinéma à dix-neuf heures.",
          "d. Rendez-vous au café samedi.",
          "e. Rendez-vous à la piscine vendredi à quinze heures.",
        ],
      },
    },
  ],
};
