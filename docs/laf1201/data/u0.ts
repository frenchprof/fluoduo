import type { Sheet } from "./types";

export const u0: Sheet = {
  id: "u0",
  label: "Unité 0",
  title: "Unité 0 · Premiers contacts",
  subtitle: "LAF1201 French 1 · Atelier A1 · Bienvenue !",
  sections: [
    {
      id: "u0-1",
      number: 1,
      title: "Greeting someone and saying who you are",
      theme: "saluer",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          headers: ["", "French", "When"],
          rows: [
            ["Hello", "*Bonjour !* · *Bonsoir !* · *Salut !*", "*Bonjour* in the day, *bonsoir* in the evening, *salut* with friends."],
            ["Your name", "*Je m'appelle Léa.* · ***Moi**, je m'appelle Léa.*", "*Moi, je…* puts the stress on you."],
            ["Asking back", "*Et toi ?* · *Et vous ?*", "*toi* to a friend, *vous* to someone you address formally."],
            ["Who is it?", "*C'est qui ?* → *C'est **Monsieur** Dupont.* · *C'est **Madame** Martin.*", "*Monsieur* for a man, *Madame* for a woman."],
            ["Student", "*Je suis **étudiant**.* · *Je suis **étudiante**.*", "Add *-e* if you are a woman."],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~Je suis Léa.~~ → **Je m'appelle Léa.** : to give your name, use *s'appeler*.",
            "~~Je suis un étudiant.~~ → **Je suis étudiant.** : no *un / une* before a profession after *être*.",
          ],
        },
      ],
      exercise: {
        title: "Build the sentence.",
        items: [
          { label: "a", text: "(20 h · Paul) — Bonsoir ! Moi, c'est Marie. Et vous ? → _____" },
          { label: "b", text: "— Toi, tu t'appelles comment ? (moi · Léa) → _____" },
          { label: "c", text: "Bonjour, je m'appelle Léa. _____ (au professeur)" },
          { label: "d", text: "— Vous êtes étudiante ? — Oui. _____" },
          { label: "e", text: "— C'est qui ? (M. Dupont) → _____" },
          { label: "f", text: "Salut ! Je m'appelle Léa. _____ (à un ami)" },
        ],
        answers: [
          "a. Bonsoir, je m'appelle Paul.",
          "b. Moi, je m'appelle Léa.",
          "c. Et vous ?",
          "d. Je suis étudiante.",
          "e. C'est Monsieur Dupont.",
          "f. Et toi ?",
        ],
      },
    },
    {
      id: "u0-2",
      number: 2,
      title: "Tu or vous?",
      theme: "saluer",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          headers: ["", "Who", "Example"],
          rows: [
            ["tu", "one person you know well: a friend, a classmate, a child", "*Tu t'appelles comment ?*"],
            ["vous (formal)", "one person you don't know, or someone older: a teacher, a shop assistant", "*Vous vous appelez comment ?*"],
            ["vous (plural)", "several people, friends or not", "*Vous êtes étudiants ?*"],
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Tip",
          lines: ["If you are not sure, use *vous*: it is never rude."],
        },
      ],
      exercise: {
        title: "Choose *tu* or *vous*.",
        items: [
          { label: "a", text: "À Paul, ton camarade : _____ t'appelles comment ?" },
          { label: "b", text: "À ton professeur : _____ vous appelez comment ?" },
          { label: "c", text: "À trois amis : _____ êtes étudiants ?" },
          { label: "d", text: "À un enfant : _____ es français ?" },
          { label: "e", text: "À un vendeur : _____ êtes français ?" },
        ],
        answers: ["a. tu", "b. vous", "c. vous", "d. tu", "e. vous"],
      },
    },
    {
      id: "u0-3",
      number: 3,
      title: "Days of the week and parts of the day",
      theme: "temps",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          rows: [
            ["The days", "*lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche*"],
            ["Parts of the day", "*le matin, l'après-midi, le soir*"],
            ["When?", "*C'est quand ?* → *C'est **lundi matin**.* · *C'est **samedi soir**.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~C'est Lundi.~~ → **C'est lundi.** : days take no capital letter in French.",
            "~~C'est matin lundi.~~ → **C'est lundi matin.** : the day comes first.",
          ],
        },
      ],
      exercise: {
        title: "Answer the question *C'est quand ?*",
        items: [
          { label: "a", text: "— Le cours de français ? (lundi · matin) → _____" },
          { label: "b", text: "— La fête ? (samedi · soir) → _____" },
          { label: "c", text: "— L'examen ? (mercredi · après-midi) → _____" },
          { label: "d", text: "— Le film ? (vendredi · soir) → _____" },
          { label: "e", text: "— Le marché ? (dimanche · matin) → _____" },
        ],
        answers: [
          "a. C'est lundi matin.",
          "b. C'est samedi soir.",
          "c. C'est mercredi après-midi.",
          "d. C'est vendredi soir.",
          "e. C'est dimanche matin.",
        ],
      },
    },
    {
      id: "u0-4",
      number: 4,
      title: "Numbers from 0 to 20",
      theme: "temps",
      blocks: [
        {
          type: "table",
          firstColHeader: true,
          rows: [
            ["0–10", "*zéro, un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix*"],
            ["11–20", "*onze, douze, treize, quatorze, quinze, seize, dix-sept, dix-huit, dix-neuf, vingt*"],
            ["How many?", "*Il y a combien d'étudiants ?* → *Il y a **douze** étudiants.*"],
          ],
        },
        {
          type: "callout",
          variant: "error",
          title: "⚠️ Common mistakes",
          lines: [
            "~~dix sept~~ → **dix-sept** : 17, 18 and 19 take a hyphen.",
            "~~Il y a combien de étudiants ?~~ → **Il y a combien d'étudiants ?** : *de* becomes *d'* before a vowel.",
          ],
        },
      ],
      exercise: {
        title: "Answer with *Il y a…*",
        items: [
          { label: "a", text: "— Il y a combien d'étudiants ? (15) → _____" },
          { label: "b", text: "— Il y a combien de livres ? (12) → _____" },
          { label: "c", text: "— Il y a combien de chaises ? (20) → _____" },
          { label: "d", text: "— Il y a combien de stylos ? (17) → _____" },
          { label: "e", text: "— Il y a combien de tables ? (6) → _____" },
        ],
        answers: [
          "a. Il y a quinze étudiants.",
          "b. Il y a douze livres.",
          "c. Il y a vingt chaises.",
          "d. Il y a dix-sept stylos.",
          "e. Il y a six tables.",
        ],
      },
    },
    {
      id: "u0-5",
      number: 5,
      title: "Classroom instructions",
      theme: "classe",
      blocks: [
        {
          type: "table",
          headers: ["To one classmate (tu)", "To the group (vous)", "Meaning"],
          rows: [
            ["*Écoute !*", "*Écoutez !*", "listen"],
            ["*Lis !*", "*Lisez !*", "read"],
            ["*Écris !*", "*Écrivez !*", "write"],
            ["*Répète !*", "*Répétez !*", "repeat"],
            ["*Regarde !*", "*Regardez !*", "look"],
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Checking what to do",
          lines: ["*On fait quoi ?* = What are we doing?"],
        },
      ],
      exercise: {
        title: "Give the instruction.",
        items: [
          { label: "a", text: "(à un camarade · 👂) → _____" },
          { label: "b", text: "(au groupe · 📖 le texte) → _____" },
          { label: "c", text: "(au groupe · ✍️ la phrase) → _____" },
          { label: "d", text: "(à un camarade · 🔁) → _____" },
          { label: "e", text: "— _____ — Vous lisez le texte. (au professeur · 🤷)" },
        ],
        answers: [
          "a. Écoute !",
          "b. Lisez le texte !",
          "c. Écrivez la phrase !",
          "d. Répète !",
          "e. On fait quoi ?",
        ],
      },
    },
  ],
};
