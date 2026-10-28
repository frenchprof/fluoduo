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
          { label: "a", text: "Ask a classmate for their first name. → _____" },
          { label: "b", text: "Ask your teacher for their surname. → _____" },
          { label: "c", text: "Give your first name (Léa). → _____" },
          { label: "d", text: "And him? (Paul) → _____" },
          { label: "e", text: "And them? (Paul and Léa) → _____" },
          { label: "f", text: "Ask how it is spelt. → _____" },
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
          { label: "a", text: "Ask a friend which country they like. → _____" },
          { label: "b", text: "Say you like France. → _____" },
          { label: "c", text: "Say you like Japan. → _____" },
          { label: "d", text: "Say you like Italy. → _____" },
          { label: "e", text: "Say you like the United States. → _____" },
          { label: "f", text: "Ask your teacher which country they like. → _____" },
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
          { label: "a", text: "Ask a friend their nationality. → _____" },
          { label: "b", text: "She is Chinese. → _____" },
          { label: "c", text: "He is Italian and he is a doctor. → _____" },
          { label: "d", text: "Ask your teacher their profession. → _____" },
          { label: "e", text: "I am not French (you are a man). → _____" },
          { label: "f", text: "We are students. → _____" },
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
          { label: "a", text: "Ask a friend their age. → _____" },
          { label: "b", text: "I am 19. → _____" },
          { label: "c", text: "She is 21. → _____" },
          { label: "d", text: "Ask your teacher their age. → _____" },
          { label: "e", text: "We are 20. → _____" },
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
            ["Email", "*Quelle est ton adresse e-mail ?*", "*Quelle est votre adresse e-mail ?*"],
            ["Phone", "*Quel est ton numéro de téléphone ?*", "*Quel est votre numéro de téléphone ?*"],
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Saying an email address",
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
          { label: "a", text: "Ask a friend for their address. → _____" },
          { label: "b", text: "Ask your teacher for their email address. → _____" },
          { label: "c", text: "Ask a friend for their phone number. → _____" },
          { label: "d", text: "Ask a stranger for their phone number. → _____" },
          { label: "e", text: "Ask a friend for their email address. → _____" },
        ],
        answers: [
          "a. Quelle est ton adresse ?",
          "b. Quelle est votre adresse e-mail ?",
          "c. Quel est ton numéro de téléphone ?",
          "d. Quel est votre numéro de téléphone ?",
          "e. Quelle est ton adresse e-mail ?",
        ],
      },
    },
  ],
};
