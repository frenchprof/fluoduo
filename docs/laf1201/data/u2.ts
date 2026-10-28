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
          { label: "a", text: "It's a bag. → _____" },
          { label: "b", text: "It's my key. → _____" },
          { label: "c", text: "They are books. → _____" },
          { label: "d", text: "They are my pens. → _____" },
          { label: "e", text: "It's my phone. → _____" },
          { label: "f", text: "It's a watch. → _____" },
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
          { label: "a", text: "I love cinema. → _____" },
          { label: "b", text: "I like music. → _____" },
          { label: "c", text: "I don't like football. → _____" },
          { label: "d", text: "I hate video games. → _____" },
          { label: "e", text: "She likes dancing. → _____" },
          { label: "f", text: "Ask a friend: do you like sport? → _____" },
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
          { label: "a", text: "I like cinema because it's fun. → _____" },
          { label: "b", text: "I don't like football because it's boring. → _____" },
          { label: "c", text: "I love music because it's great. → _____" },
          { label: "d", text: "I hate dancing because it's difficult. → _____" },
          { label: "e", text: "Ask a friend why. → _____" },
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
            ["Inviting", "*Tu veux aller **au** cinéma ?* · *Tu veux aller **à la** piscine ?*"],
            ["Accepting", "*Oui, avec plaisir !* · *D'accord !* · *Bonne idée !*"],
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
          { label: "a", text: "Invite a friend to the cinema. → _____" },
          { label: "b", text: "Invite a friend to the swimming pool. → _____" },
          { label: "c", text: "Accept with pleasure. → _____" },
          { label: "d", text: "Refuse: sorry, you are not free (you are a man). → _____" },
          { label: "e", text: "Invite a friend to the restaurant. → _____" },
        ],
        answers: [
          "a. Tu veux aller au cinéma ?",
          "b. Tu veux aller à la piscine ?",
          "c. Oui, avec plaisir !",
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
            ["Where?", "*On se retrouve où ?* → *Au café.* · *Au cinéma.*"],
            ["When?", "*On se retrouve quand ?* → *Samedi soir.*"],
            ["What time?", "*À quelle heure ?* → *À huit heures.* · *À midi.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: ["~~À huit heure.~~ → **À huit heures.** : *heures* takes an *s* from two o'clock on."],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "Ask where you are meeting. → _____" },
          { label: "b", text: "Ask at what time. → _____" },
          { label: "c", text: "Suggest: at the café, on Saturday. → _____" },
          { label: "d", text: "Suggest: on Friday, at eight o'clock. → _____" },
          { label: "e", text: "Suggest: on Sunday, at noon. → _____" },
        ],
        answers: [
          "a. On se retrouve où ?",
          "b. À quelle heure ?",
          "c. Au café, samedi.",
          "d. Vendredi, à huit heures.",
          "e. Dimanche, à midi.",
        ],
      },
    },
  ],
};
