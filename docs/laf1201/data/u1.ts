import type { Sheet } from "./types";

export const u1: Sheet = {
  id: "u1",
  label: "Unité 1",
  title: "Unité 1 · C'est qui ?",
  subtitle: "LAF1201 French 1 · Atelier A1 · Se présenter et présenter quelqu'un",
  sections: [
    {
      id: "u1-1",
      number: 1,
      title: "First name and surname",
      theme: "saluer",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          headers: ["", "Informal", "Formal"],
          rows: [
            ["First name", "*Quel est **ton** prénom ?*", "*Quel est **votre** prénom ?*"],
            ["Surname", "*Quel est **ton** nom ?*", "*Quel est **votre** nom ?*"],
            ["Answer", "*Mon prénom est Léa. Mon nom est Martin.*", ""],
            ["Someone else", "*Et lui ?* → *Il s'appelle Paul.* · *Et elle ?* → *Elle s'appelle Léa.*", ""],
          ],
        },
        {
          type: "table",
          headers: ["s'appeler", "", "s'appeler", ""],
          rows: [
            ["je m'appelle", "nous nous appelons", "tu t'appelles", "vous vous appelez"],
            ["il / elle s'appelle", "ils / elles s'appellent", "", ""],
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Spelling your name",
          lines: ["*Comment ça s'écrit ?* → *M-A-R-T-I-N.*"],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Ils s'appelle Paul et Léa.~~ → **Ils s'appellent Paul et Léa.** : *-ll-* in *je, tu, il, ils*; one *l* in *nous, vous*.",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— _____ — Mon prénom est Léa. (to a classmate)" },
          { label: "b", text: "— _____ — Mon nom est Martin. (to the teacher)" },
          { label: "c", text: "— Quel est ton prénom ? (Léa) → _____" },
          { label: "d", text: "— Et lui ? (Paul) → _____" },
          { label: "e", text: "— Et eux ? (Paul et Léa) → _____" },
          { label: "f", text: "— _____ — M-A-R-T-I-N." },
        ],
        answers: [
          "a. Quel est ton prénom ?",
          "b. Quel est votre nom ?",
          "c. Mon prénom est Léa.",
          "d. Il s'appelle Paul.",
          "e. Ils s'appellent Paul et Léa.",
          "f. Comment ça s'écrit ?",
        ],
      },
    },
    {
      id: "u1-2",
      number: 2,
      title: "Countries and the definite article",
      theme: "identite",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          headers: ["Article", "When", "Examples"],
          rows: [
            ["le", "masculine country", "*le Japon, le Canada, le Portugal*"],
            ["la", "feminine country (most end in -e)", "*la France, la Chine, la Suisse*"],
            ["l'", "before a vowel", "*l'Italie, l'Allemagne, l'Espagne*"],
            ["les", "plural country", "*les États-Unis*"],
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Asking which country someone likes",
          lines: ["*Tu aimes quel pays ?* · *Vous aimez quel pays ?* → *J'aime **la** France.*"],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: ["~~J'aime France.~~ → **J'aime la France.** : a country takes its article."],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— _____ — J'aime la France. (to a friend)" },
          { label: "b", text: "— Tu aimes quel pays ? (🇫🇷) → _____" },
          { label: "c", text: "— Tu aimes quel pays ? (🇯🇵) → _____" },
          { label: "d", text: "— Tu aimes quel pays ? (🇮🇹) → _____" },
          { label: "e", text: "— Tu aimes quel pays ? (🇺🇸) → _____" },
          { label: "f", text: "— _____ — J'aime le Japon. (to the teacher)" },
        ],
        answers: [
          "a. Tu aimes quel pays ?",
          "b. J'aime la France.",
          "c. J'aime le Japon.",
          "d. J'aime l'Italie.",
          "e. J'aime les États-Unis.",
          "f. Vous aimez quel pays ?",
        ],
      },
    },
    {
      id: "u1-3",
      number: 3,
      title: "Nationality and profession with être",
      theme: "identite",
      blocks: [
        {
          type: "table",
          headers: ["être", "", "être", ""],
          rows: [
            ["je suis", "nous sommes", "tu es", "vous êtes"],
            ["il / elle est", "ils / elles sont", "", ""],
          ],
        },
        {
          type: "table",
          firstColHeader: true,
          headers: ["", "He", "She"],
          rows: [
            ["Nationality", "*Il est **chinois**.* · *Il est **italien**.*", "*Elle est **chinoise**.* · *Elle est **italienne**.*"],
            ["Profession", "*Il est **médecin**.*", "*Elle est **étudiante**.*"],
            ["Asking", "*Quelle est ta nationalité ?* · *Quelle est votre profession ?*", ""],
            ["Negative", "*Je **ne** suis **pas** français.*", ""],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Elle est une médecin.~~ → **Elle est médecin.** : no *un / une* before a profession.",
            "~~Il est Chinois.~~ → **Il est chinois.** : no capital letter for a nationality adjective.",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— _____ — Je suis chinoise. (to a friend)" },
          { label: "b", text: "— Et elle ? (🇨🇳) → _____" },
          { label: "c", text: "— Et lui ? (🇮🇹 · médecin) → _____", alternates: ["Il est médecin et il est italien."] },
          { label: "d", text: "— _____ — Je suis professeur. (to the teacher)" },
          { label: "e", text: "— Vous êtes français ? (non · un homme) → _____" },
          { label: "f", text: "— Vous êtes étudiants ? (oui · nous) → _____" },
        ],
        answers: [
          "a. Quelle est ta nationalité ?",
          "b. Elle est chinoise.",
          "c. Il est italien et il est médecin.",
          "d. Quelle est votre profession ?",
          "e. Je ne suis pas français.",
          "f. Nous sommes étudiants.",
        ],
      },
    },
    {
      id: "u1-4",
      number: 4,
      title: "Age with avoir",
      theme: "identite",
      blocks: [
        {
          type: "table",
          headers: ["avoir", "", "avoir", ""],
          rows: [
            ["j'ai", "nous avons", "tu as", "vous avez"],
            ["il / elle a", "ils / elles ont", "", ""],
          ],
        },
        {
          type: "table",
          firstColHeader: true,
          rows: [
            ["Asking", "*Quel est ton âge ?* · *Quel est votre âge ?* · *Tu as quel âge ?*"],
            ["Answer", "*J'ai dix-neuf ans.* · *Elle a vingt ans.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Je suis dix-neuf ans.~~ → **J'ai dix-neuf ans.** : age uses *avoir*, not *être*.",
            "~~J'ai dix-neuf.~~ → **J'ai dix-neuf ans.** : don't forget *ans*.",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "— _____ — J'ai dix-neuf ans. (to a friend)" },
          { label: "b", text: "— Quel est ton âge ? (19) → _____" },
          { label: "c", text: "— Et elle ? (21) → _____" },
          { label: "d", text: "— _____ — J'ai quarante ans. (to the teacher)" },
          { label: "e", text: "— Vous avez quel âge ? (nous · 20) → _____" },
        ],
        answers: [
          "a. Quel est ton âge ?",
          "b. J'ai dix-neuf ans.",
          "c. Elle a vingt et un ans.",
          "d. Quel est votre âge ?",
          "e. Nous avons vingt ans.",
        ],
      },
    },
    {
      id: "u1-5",
      number: 5,
      title: "Contact details",
      theme: "identite",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          headers: ["", "Informal", "Formal"],
          rows: [
            ["Address", "*Quelle est ton adresse ?*", "*Quelle est votre adresse ?*"],
            ["Email (courriel)", "*Quelle est ton adresse courriel ?*", "*Quelle est votre adresse courriel ?*"],
            ["Phone", "*Quel est ton numéro de téléphone ?*", "*Quel est votre numéro de téléphone ?*"],
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Saying a courriel address",
          lines: ["@ = *arobase* · . = *point* → *lea point martin arobase gmail point com*"],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: ["~~Quel est ton adresse ?~~ → **Quelle est ton adresse ?** : *adresse* is feminine, so *quelle*."],
        },
      ],
      exercise: {
        title: "Ask the question.",
        items: [
          { label: "a", text: "— _____ — C'est 12, rue de la Paix. (to a friend)" },
          { label: "b", text: "— _____ — C'est marie.dupont@nus.edu.sg. (to the teacher)" },
          { label: "c", text: "— _____ — C'est le 06 12 34 56 78. (to a friend)" },
          { label: "d", text: "— _____ — C'est le 06 98 76 54 32. (to a stranger)" },
          { label: "e", text: "— _____ — C'est lea@gmail.com. (to a friend)" },
        ],
        answers: [
          "a. Quelle est ton adresse ?",
          "b. Quelle est votre adresse courriel ?",
          "c. Quel est ton numéro de téléphone ?",
          "d. Quel est votre numéro de téléphone ?",
          "e. Quelle est ton adresse courriel ?",
        ],
      },
    },
  ],
};
