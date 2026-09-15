/**
 * G-COMPRIS! — the reading bank.
 *
 * Dan named it on 2026-09-15: *"Call the reading exercises : G-Compris!"* —
 * « j'ai compris », read aloud. It lives in 🛠️ FluOLin Texts, the family he
 * renamed the same day from « Write » to « Texts » so that reading a text
 * would have somewhere to be.
 *
 * ── WHAT A READING QUESTION IS ACTUALLY FOR ───────────────────────────────
 * Dan, looking at the reading section of the real paper: *"it is not so much
 * about reading per se, but what those reading questions are really
 * testing"*. A question that can be answered by matching a string is not a
 * reading question — the learner finds « mardi » in the text and copies it
 * without knowing what it means. So every question here turns on something
 * the course teaches:
 *
 *     négation      the text says « Je ne suis pas là ce soir » and the
 *                   question asks whether she is home. A learner who skips
 *                   « ne … pas » answers Vrai.
 *     possessives   « son frère » — WHOSE brother? The text names two people
 *                   and only the possessive says which.
 *     nationality   the text says « marocaine », the question asks the
 *                   COUNTRY. Nothing to copy; the ending has to be read.
 *     aller + à     « au cinéma », « à la bibliothèque », « chez Julien » —
 *                   three different shapes for one idea.
 *     numbers       written out in the text, asked for as digits, or the
 *                   other way round.
 *
 * ── AND IT MUST NOT LOOK TAILORED ─────────────────────────────────────────
 * Dan, when the first outline was put to him: *"Ok but it must not look like
 * we tailored exercises around the test"*. Every scene here is an ordinary
 * document a person actually meets — a note on a kitchen table, a club
 * noticeboard, a doctor's voicemail, a postcard — chosen for being ordinary.
 * None of them mirrors a question on the paper, and there are ten, which is
 * more than any paper asks for.
 *
 * ── THE VOCABULARY CEILING IS STOP 30 ─────────────────────────────────────
 * Units 0, 1 and 2. That is the same ruling that scoped the Finale: *"Stops 0
 * to 30 only please"*. Reading is RECEPTIVE, so a text may carry a word the
 * course has not drilled — « bibliothèque », « gratuit » — the way any real
 * note would; what it may never do is make that word the ANSWER. `verify770`
 * pins the rule that matters: no question's answer is a word outside the
 * course. A learner is never marked wrong for something nobody told them,
 * which is verify40's ruling (27 Aug) applied a third time.
 */

export type GCQuestion = {
  /** Stable within its scene — the scene id plus this is the evidence tag. */
  id: string;
  /** The question, in English: chrome is English (the beginner lock). */
  q: string;
  /** Tap-one options. Two of them spell Vrai / Faux. Omit for a typed answer. */
  options?: string[];
  /** The expected answer. For `options`, one of them, spelled identically. */
  answer: string;
  /** Other spellings a typed answer may take — « 19 » for « dix-neuf ». */
  also?: string[];
  /** THE RULE, shown behind the WHY button after answering — never inline
   *  (the litmus test, 2 Jul). It names the grammar, not the line: « Quel âge
   *  a-t-elle ? » is answered by « avoir + a number », and that is what the
   *  learner needs next time. */
  why: string;
};

export type GCScene = {
  id: string;
  /** The document's own name, as a learner would call it. */
  title: string;
  /** One line of situation — who wrote it and why. English. */
  setup: string;
  /** Which unit's language it is built from. Display only. */
  unit: 0 | 1 | 2;
  /** The text itself. Blank lines separate paragraphs; nothing else is
   *  markup, so a scene stays a document rather than a template. */
  text: string;
  questions: GCQuestion[];
};

const VF = ["Vrai", "Faux"];

export const GC_SCENES: GCScene[] = [
  {
    id: "mot-de-la-coloc",
    title: "Le mot de la coloc",
    setup: "A note left on the kitchen table by your flatmate.",
    unit: 2,
    text: `Salut Léa !

Je ne suis pas là ce soir. Je vais au cinéma avec Karim. Il est tunisien, il est dans mon cours d'espagnol. Nous partons à 8 heures.

Tu aimes le cinéma ? Samedi, on regarde un film ici, si tu veux. Il y a aussi Clara et son frère.

À samedi !
Inès`,
    questions: [
      {
        id: "q1",
        q: "Where is Inès going tonight?",
        options: ["au cinéma", "au restaurant", "à la bibliothèque", "à la maison"],
        answer: "au cinéma",
        why: "« aller » + « au » before a masculine place — au cinéma, au restaurant, au parc. « à la » before a feminine one, « à l' » before a vowel.",
      },
      {
        id: "q2",
        q: "True or false: Inès is at home this evening.",
        options: VF,
        answer: "Faux",
        why: "« Je ne suis pas là » — the two halves of the negation sit around the verb: ne + être + pas. Drop either half and the sentence says the opposite.",
      },
      {
        id: "q3",
        q: "Karim's nationality — write it as the text does.",
        answer: "tunisien",
        why: "« Il est tunisien » — no article and no capital letter for a nationality after être. The feminine would be « tunisienne » : -ien → -ienne.",
      },
      {
        id: "q4",
        q: "Which day are they watching a film at the flat?",
        answer: "samedi",
        why: "The days run lundi · mardi · mercredi · jeudi · vendredi · samedi · dimanche, and take no capital letter in French.",
      },
      {
        id: "q5",
        q: "« son frère » — whose brother is it?",
        options: ["Clara's", "Inès's", "Léa's", "Karim's"],
        answer: "Clara's",
        why: "« son » agrees with the THING owned, not with the owner — son frère, sa sœur. It is the last person named that it belongs to: « Clara et son frère ».",
      },
    ],
  },

  {
    id: "nouvelle-etudiante",
    title: "La nouvelle étudiante",
    setup: "A student introduces herself on the course's message board.",
    unit: 1,
    text: `Je m'appelle Mei-Ling. J'ai dix-neuf ans et je suis singapourienne. Je parle anglais, chinois et un peu français.

Je suis étudiante en médecine à Lyon. J'habite avec une amie allemande. Elle s'appelle Hannah et elle a vingt-deux ans.

Je n'aime pas le froid, mais j'adore la ville !`,
    questions: [
      {
        id: "q1",
        q: "How old is Mei-Ling? Answer in digits.",
        answer: "19",
        also: ["dix-neuf", "dix neuf"],
        why: "Age is « avoir », never « être » : j'ai dix-neuf ans. And « ans » is never left out — « j'ai dix-neuf » is not a sentence.",
      },
      {
        id: "q2",
        q: "How many languages does she speak?",
        options: ["deux", "trois", "quatre", "cinq"],
        answer: "trois",
        why: "anglais, chinois, français — three. A language takes no capital letter, exactly like a nationality.",
      },
      {
        id: "q3",
        q: "True or false: Hannah is French.",
        options: VF,
        answer: "Faux",
        why: "« une amie allemande » — the -e on allemande agrees with amie. She is German; the text never says anyone is French.",
      },
      {
        id: "q4",
        q: "Write Mei-Ling's nationality as she writes it.",
        answer: "singapourienne",
        why: "-ien → -ienne in the feminine: singapourien → singapourienne, like coréen → coréenne and tunisien → tunisienne.",
      },
      {
        id: "q5",
        q: "True or false: she likes the cold.",
        options: VF,
        answer: "Faux",
        why: "« Je n'aime pas » — before a vowel « ne » becomes « n' », and the « pas » still follows the verb. « mais j'adore » afterwards is about the city, not the cold.",
      },
    ],
  },

  {
    id: "message-du-professeur",
    title: "Le message du professeur",
    setup: "An email to the class on a Friday afternoon.",
    unit: 1,
    text: `Bonjour à tous,

Le cours de mardi est à 10 heures, salle 14. Attention : ce n'est pas la salle 4 !

Le livre est obligatoire. Il y a un petit test sur les nombres et les nationalités.

Bon week-end,
M. Bertrand`,
    questions: [
      {
        id: "q1",
        q: "Which day is the class?",
        answer: "mardi",
        why: "lundi · mardi · mercredi — mardi is the second. « le mardi » with the article would mean every Tuesday; « mardi » alone means this one.",
      },
      {
        id: "q2",
        q: "Which room? Answer in digits.",
        answer: "14",
        also: ["quatorze"],
        why: "quatorze, not quatre. The text says so twice, once by denying the other: « ce n'est pas la salle 4 ».",
      },
      {
        id: "q3",
        q: "What time does it start?",
        options: ["8 heures", "10 heures", "14 heures", "4 heures"],
        answer: "10 heures",
        why: "« à » + the hour: à 10 heures. « heures » is plural from two onwards — à une heure, à deux heures.",
      },
      {
        id: "q4",
        q: "True or false: the test is about colours.",
        options: VF,
        answer: "Faux",
        why: "« les nombres et les nationalités » — numbers and nationalities. The plural article « les » is the same for both genders, which is why it tells you nothing here and the noun does.",
      },
    ],
  },

  {
    id: "carte-postale",
    title: "La carte postale",
    setup: "A postcard from a friend on holiday.",
    unit: 2,
    text: `Chère Mamie,

Je suis au Portugal avec Thomas ! Nous sommes à Porto.

Le matin, nous visitons la ville. L'après-midi, j'écoute de la musique — Thomas, lui, adore le sport, alors il fait du vélo.

Nous rentrons dimanche. Bises,
Camille`,
    questions: [
      {
        id: "q1",
        q: "Which country is Camille in?",
        options: ["le Portugal", "l'Espagne", "la Suisse", "les États-Unis"],
        answer: "le Portugal",
        why: "« au Portugal » — au = à + le, so the country is masculine: le Portugal. « en Espagne » would have told you it was feminine.",
      },
      {
        id: "q2",
        q: "True or false: Camille rides a bike.",
        options: VF,
        answer: "Faux",
        why: "« il fait du vélo » — « il » is Thomas, named just before. Camille listens to music; the two clauses are separated by « alors », not joined.",
      },
      {
        id: "q3",
        q: "What does Thomas love?",
        answer: "le sport",
        also: ["sport"],
        why: "After aimer · adorer · détester the noun keeps its article: j'adore LE sport, je déteste LA musique. This is the one place « du / de la » is wrong.",
      },
      {
        id: "q4",
        q: "Which day do they come home?",
        answer: "dimanche",
        why: "dimanche closes the week in French — lundi first, dimanche last. No capital letter.",
      },
    ],
  },

  {
    id: "invitation",
    title: "L'invitation",
    setup: "A message from a friend, on a Wednesday.",
    unit: 2,
    text: `Coucou Malik !

Samedi, c'est l'anniversaire de ma sœur. Elle a vingt ans !

On mange à la maison à 7 heures, et après on va à une fête chez Julien. Tu veux venir ? Ma sœur veut inviter tout le cours.

Tu n'es pas libre samedi ? Alors dimanche, on prend un café.

Bisous,
Sarah`,
    questions: [
      {
        id: "q1",
        q: "How old is Sarah's sister? Answer in digits.",
        answer: "20",
        also: ["vingt"],
        why: "« Elle a vingt ans » — avoir again, never être. vingt · vingt et un · vingt-deux.",
      },
      {
        id: "q2",
        q: "Where is the party?",
        options: ["chez Julien", "à la maison", "au restaurant", "chez Sarah"],
        answer: "chez Julien",
        why: "« chez » + a person's name means at their place. « à la maison » two lines earlier is where they EAT — two different addresses in one message.",
      },
      {
        id: "q3",
        q: "« ma sœur » — whose sister?",
        options: ["Sarah's", "Malik's", "Julien's", "the class's"],
        answer: "Sarah's",
        why: "Sarah is writing, so « ma » is hers. « ma », not « mon », because sœur is feminine — the possessive follows the thing owned.",
      },
      {
        id: "q4",
        q: "What happens if Malik is not free on Saturday?",
        options: ["coffee on Sunday", "nothing", "dinner on Friday", "the party moves"],
        answer: "coffee on Sunday",
        why: "« Tu n'es pas libre ? Alors dimanche » — the negative question sets up the alternative. « n'es » is « ne es » with the vowel squeezed out.",
      },
    ],
  },

  {
    id: "les-messages",
    title: "Les messages",
    setup: "Two friends texting at eleven in the morning.",
    unit: 2,
    text: `— Tu es où ?
— À la bibliothèque. Je travaille.
— Tu manges avec nous à midi ?
— Non, je ne suis pas libre. J'ai un cours de chinois à midi.
— Alors à 2 heures, au café ?
— D'accord ! À tout à l'heure.`,
    questions: [
      {
        id: "q1",
        q: "Where is the second person?",
        options: ["à la bibliothèque", "au café", "à la maison", "au cours"],
        answer: "à la bibliothèque",
        why: "« à la » before a feminine place, « au » before a masculine one — à la bibliothèque, au café. Both appear in these six lines.",
      },
      {
        id: "q2",
        q: "True or false: they eat together at midday.",
        options: VF,
        answer: "Faux",
        why: "« je ne suis pas libre » answers the invitation, not the question about being hungry. The whole answer is in the ne … pas.",
      },
      {
        id: "q3",
        q: "Which class is at midday?",
        answer: "chinois",
        why: "« un cours de chinois » — « de » links the class to its subject, with no article: un cours de chinois, un cours de français.",
      },
      {
        id: "q4",
        q: "What time do they finally meet?",
        options: ["2 heures", "midi", "11 heures", "3 heures"],
        answer: "2 heures",
        why: "« à 2 heures » — the preposition « à » is what makes a number a time. Without it, « 2 heures » is just a quantity.",
      },
    ],
  },

  {
    id: "le-panneau",
    title: "Le panneau du club",
    setup: "A noticeboard in the corridor outside the language department.",
    unit: 1,
    text: `CLUB DE FRANÇAIS — salle 12

lundi · 17 heures · cinéma français
mercredi · 18 heures · conversation
vendredi · 17 heures · musique et chansons

Étudiants : c'est gratuit.
Contact : Amira — 06 24 51 38 07`,
    questions: [
      {
        id: "q1",
        q: "Which day is the conversation session?",
        answer: "mercredi",
        why: "lundi · mardi · mercredi · jeudi · vendredi — mercredi is the middle of the working week, between mardi and jeudi.",
      },
      {
        id: "q2",
        q: "What time is the film session?",
        options: ["17 heures", "18 heures", "12 heures", "7 heures"],
        answer: "17 heures",
        why: "French timetables run on the 24-hour clock: 17 heures is five in the afternoon, 18 heures is six. Seventeen is dix-sept — ten plus seven.",
      },
      {
        id: "q3",
        q: "True or false: students have to pay.",
        options: VF,
        answer: "Faux",
        why: "« c'est gratuit ». « c'est » introduces a description of the whole thing — c'est gratuit, c'est samedi, c'est ma sœur.",
      },
      {
        id: "q4",
        q: "Amira's number is read in pairs. Which one is it?",
        options: [
          "zéro six, vingt-quatre, cinquante et un, trente-huit, zéro sept",
          "zéro six, quarante-deux, quinze, quatre-vingt-trois, soixante-dix",
          "zéro six, vingt-quatre, quinze, trente-huit, zéro sept",
        ],
        answer: "zéro six, vingt-quatre, cinquante et un, trente-huit, zéro sept",
        why: "A French number is said in two-digit blocks: 06 · 24 · 51 · 38 · 07. 51 is cinquante et un — « et un » with no hyphen, the one exception in the fifties.",
      },
    ],
  },

  {
    id: "message-telephonique",
    title: "Le message téléphonique",
    setup: "A voicemail, written out by the person who took the call.",
    unit: 2,
    text: `Bonjour, c'est le cabinet du docteur Lambert.

Votre rendez-vous de jeudi n'est pas à 9 heures. Il est à 11 heures. C'est jeudi 14, pas jeudi 7 !

Notre numéro : 04 78 62 09 31. Au revoir.`,
    questions: [
      {
        id: "q1",
        q: "What time is the appointment?",
        options: ["11 heures", "9 heures", "7 heures", "14 heures"],
        answer: "11 heures",
        why: "« n'est pas à 9 heures. Il est à 11 heures » — the negation cancels the first time and the next sentence gives the real one. Reading only the first half gets it wrong.",
      },
      {
        id: "q2",
        q: "Which Thursday? Answer in digits.",
        answer: "14",
        also: ["quatorze", "jeudi 14"],
        why: "« jeudi 14, pas jeudi 7 » — the same ne … pas shape, this time with « pas » alone because there is no second verb to wrap.",
      },
      {
        id: "q3",
        q: "True or false: the appointment is on the 7th.",
        options: VF,
        answer: "Faux",
        why: "« pas jeudi 7 » is the whole of the answer. Seven is sept and fourteen is quatorze — nothing alike said out loud, which is why the message spells both.",
      },
    ],
  },

  {
    id: "page-de-journal",
    title: "Une page de journal",
    setup: "A page from someone's diary, written on a Monday evening.",
    unit: 2,
    text: `Lundi

Aujourd'hui, je suis fatiguée. J'ai trois cours : anglais, histoire et informatique. Je n'aime pas l'informatique, mais le professeur est sympa.

À midi, je mange avec Nadia. Elle est marocaine et elle parle arabe, français et anglais.

Le soir, je fais du sport. Après, je regarde un film avec mon frère. Son film préféré, c'est « Les Choristes ».`,
    questions: [
      {
        id: "q1",
        q: "How many classes does she have? Answer in digits.",
        answer: "3",
        also: ["trois"],
        why: "« J'ai trois cours » — avoir for what you have, être for what you are. « Je suis fatiguée » one line earlier is the other one.",
      },
      {
        id: "q2",
        q: "Which subject does she dislike?",
        answer: "informatique",
        also: ["l'informatique", "l informatique"],
        why: "« Je n'aime pas l'informatique » — « l' » before a vowel, and the article stays after aimer. « je n'aime pas informatique » is not French.",
      },
      {
        id: "q3",
        q: "Which country is Nadia from?",
        options: ["le Maroc", "l'Algérie", "la Tunisie", "le Sénégal"],
        answer: "le Maroc",
        why: "« marocaine » → le Maroc. The nationality is built from the country, so the ending gives it back: tunisienne → la Tunisie, algérienne → l'Algérie.",
      },
      {
        id: "q4",
        q: "True or false: she watches a film with her sister.",
        options: VF,
        answer: "Faux",
        why: "« mon frère » — mon is masculine, frère is a brother. « ma sœur » is the one the question is fishing for and it is not in the text.",
      },
      {
        id: "q5",
        q: "« Son film préféré » — whose favourite film?",
        options: ["her brother's", "hers", "Nadia's", "the teacher's"],
        answer: "her brother's",
        why: "« son » points back at the last person named — her brother. It agrees with « film », which is masculine, and tells you nothing about whether the owner is male or female.",
      },
    ],
  },

  {
    id: "mot-du-voisin",
    title: "Le mot du voisin",
    setup: "A note slipped under the door by someone who has just moved in.",
    unit: 1,
    text: `Bonjour,

Je m'appelle Piotr et j'habite au numéro 12. Je suis polonais. Je ne parle pas très bien français — je suis dans un cours, le mardi et le jeudi.

Vous êtes libre samedi ? Ma femme et moi, nous invitons les voisins à 6 heures. Il y a mes deux filles aussi : Zofia a huit ans et Ana a onze ans.

Piotr — appartement 12`,
    questions: [
      {
        id: "q1",
        q: "Write Piotr's nationality as he writes it.",
        answer: "polonais",
        why: "« Je suis polonais » — masculine. The feminine adds -e: polonaise, like français → française and chinois → chinoise.",
      },
      {
        id: "q2",
        q: "True or false: Piotr speaks French very well.",
        options: VF,
        answer: "Faux",
        why: "« Je ne parle pas très bien français ». The « très bien » sits inside the negation, so it is the speaking-well that is denied, not the speaking.",
      },
      {
        id: "q3",
        q: "Which days does he have his class?",
        options: [
          "mardi et jeudi",
          "lundi et mercredi",
          "mercredi et vendredi",
          "samedi et dimanche",
        ],
        answer: "mardi et jeudi",
        why: "« le mardi et le jeudi » — the article makes it every week, unlike « samedi » in the next line, which is one Saturday.",
      },
      {
        id: "q4",
        q: "How old is Ana? Answer in digits.",
        answer: "11",
        also: ["onze"],
        why: "onze, not huit — Zofia is the eight-year-old. Both take avoir: elle a huit ans, elle a onze ans.",
      },
      {
        id: "q5",
        q: "How many daughters does Piotr have?",
        options: ["deux", "une", "trois", "quatre"],
        answer: "deux",
        why: "« mes deux filles » — « mes » is the plural possessive, the same word whatever the gender: mes filles, mes frères.",
      },
    ],
  },
];

export function scene(id: string): GCScene | undefined {
  return GC_SCENES.find((s) => s.id === id);
}
