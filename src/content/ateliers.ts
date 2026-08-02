/**
 * Atelier mini-dialogues — the model conversations the production SIOs open to
 * (Dan, 2026-07-02: "they should look like the mini-dialogue in 010, then an
 * option either to play all integrally at once or to play only selected lines").
 *
 * Each atelier is built ONLY from what its unit (and the ones before it) has
 * covered — a model to read and hear, then perform in class. Speaker A is voiced
 * female, speaker B male (pitch cue — see games/letris/speech.ts). Monologue
 * ateliers use only speaker A. `say` overrides the spoken text when it differs
 * from what's shown (e.g. spelling aloud). Grammar guard-rails: present + futur
 * proche only, no passé composé.
 */

export type DialogueLine = {
  who: "A" | "B";
  fr: string;
  en: string;
  /** Spoken form when it differs from `fr` (e.g. "Ça s'écrit, L, É, A"). */
  say?: string;
};

export const ATELIER_DIALOGUES: Record<string, DialogueLine[]> = {
  // Unité 0 — first-meeting (greetings, s'appeler, spelling aloud, enchanté).
  "SIO-010": [
    { who: "A", fr: "Bonjour !", en: "Hello!" },
    { who: "B", fr: "Bonjour !", en: "Hello!" },
    { who: "A", fr: "Comment tu t'appelles ?", en: "What's your name?" },
    { who: "B", fr: "Je m'appelle Marc. Et toi ?", en: "My name is Marc. And you?" },
    { who: "A", fr: "Moi, je m'appelle Léa.", en: "Me, my name is Léa." },
    { who: "B", fr: "Comment ça s'écrit ?", en: "How do you spell it?" },
    { who: "A", fr: "Ça s'écrit L – É – A.", en: "It's spelled L – E – A.", say: "Ça s'écrit, L, É, A" },
    { who: "B", fr: "Enchanté !", en: "Nice to meet you!" },
    { who: "A", fr: "Enchantée ! Au revoir !", en: "Nice to meet you! Goodbye!" },
    { who: "B", fr: "Au revoir, à demain !", en: "Goodbye, see you tomorrow!" },
  ],

  // Unité 1 — present a country (countries, nationalities, languages, aimer).
  "SIO-020": [
    { who: "A", fr: "Bonjour ! Voici le Japon.", en: "Hello! Here is Japan." },
    { who: "A", fr: "C'est un pays asiatique.", en: "It's an Asian country." },
    { who: "A", fr: "Ici, il y a des Japonais.", en: "Here, there are Japanese people." },
    { who: "A", fr: "Beaucoup de Japonais parlent japonais.", en: "Many Japanese people speak Japanese." },
    { who: "A", fr: "Le drapeau a deux couleurs : le rouge et le blanc.", en: "The flag has two colours: red and white." },
    { who: "A", fr: "Il y a un rond rouge sur un fond blanc.", en: "There is a red circle on a white background." },
  ],

  // Unité 2 — a short friendly email (aller, faire, avec, connectors, well wishes).
  // 2026-08-02: extended to actually demonstrate all 5 well-wish formulas and
  // all 6 connectors SIO-030 names (Salut Marie/friends-at-the-cinema kept
  // from the original) — each connector and each formula gets its own line
  // so it's individually flashcard-drillable, not buried inside a longer
  // sentence.
  "SIO-030": [
    { who: "A", fr: "Salut Marie !", en: "Hi Marie!" },
    { who: "A", fr: "Merci pour ton message.", en: "Thanks for your message." },
    { who: "A", fr: "D'abord, bon anniversaire pour vendredi !", en: "First, happy birthday for Friday!" },
    { who: "A", fr: "Ensuite, bonne chance pour ton examen la semaine prochaine !", en: "Then, good luck for your exam next week!" },
    { who: "A", fr: "Aussi, bon voyage pour tes vacances en juillet !", en: "Also, safe travels for your holiday in July!" },
    { who: "A", fr: "Mais surtout, bonne année pour dans deux semaines !", en: "But most of all, happy new year, in two weeks!" },
    { who: "A", fr: "Et bonne fête à toi aussi !", en: "And happy name day to you too!" },
    { who: "A", fr: "Ce week-end, je vais au cinéma avec des amis.", en: "This weekend I'm going to the cinema with friends." },
    { who: "A", fr: "Et toi, qu'est-ce que tu fais ?", en: "And you, what are you doing?" },
    { who: "A", fr: "Enfin, bonne journée et à bientôt !", en: "Finally, have a good day and see you soon!" },
    { who: "A", fr: "Léa", en: "Léa", say: "Léa" },
  ],

  // Unité 3 — give an itinerary (directions, transport, pouvoir, connectors).
  "SIO-040": [
    { who: "A", fr: "Pour aller à la gare, c'est facile.", en: "To get to the station, it's easy." },
    { who: "A", fr: "D'abord, tu prends la première rue à droite.", en: "First, take the first street on the right." },
    { who: "A", fr: "Ensuite, tu vas tout droit.", en: "Then go straight ahead." },
    { who: "A", fr: "Puis, tu tournes à gauche à la banque.", en: "Then turn left at the bank." },
    { who: "A", fr: "Enfin, la gare est en face du parc.", en: "Finally, the station is opposite the park." },
    { who: "A", fr: "Tu peux aussi prendre le bus numéro cinq.", en: "You can also take bus number five." },
  ],

  // Unité 4 — restaurant role-play (vouloir/voudrais, aliments, partitives, politeness).
  // 2026-08-02: extended to actually hit all 6 competence steps (greet, read
  // the menu, order entrée/plat/boisson/dessert, interact during the meal,
  // ask for the bill, pay and say goodbye) — the original 7 lines only
  // covered greeting + a café-style order, missing the menu, the bill, and
  // paying/leaving entirely.
  "SIO-049": [
    { who: "B", fr: "Bonjour ! Une table pour un ?", en: "Hello! A table for one?" },
    { who: "A", fr: "Bonjour ! Oui, merci.", en: "Hello! Yes, thank you." },
    { who: "B", fr: "Voici la carte.", en: "Here's the menu." },
    { who: "A", fr: "Merci. Qu'est-ce que vous recommandez ?", en: "Thanks. What do you recommend?" },
    { who: "B", fr: "Le poulet est excellent aujourd'hui.", en: "The chicken is excellent today." },
    { who: "A", fr: "Alors, une salade en entrée, le poulet comme plat, et de l'eau, s'il vous plaît.", en: "Then, a salad to start, the chicken for my main, and water, please." },
    { who: "B", fr: "Très bien. Et comme dessert ?", en: "Very well. And for dessert?" },
    { who: "A", fr: "Une glace, s'il vous plaît.", en: "Ice cream, please." },
    { who: "B", fr: "Voilà votre plat. Bon appétit !", en: "Here's your dish. Enjoy your meal!" },
    { who: "A", fr: "Merci ! C'est délicieux.", en: "Thanks! It's delicious." },
    { who: "B", fr: "Tout va bien ?", en: "Is everything alright?" },
    { who: "A", fr: "Oui, très bien, merci.", en: "Yes, very well, thank you." },
    { who: "A", fr: "L'addition, s'il vous plaît.", en: "The bill, please." },
    { who: "B", fr: "Voici l'addition.", en: "Here's the bill." },
    { who: "A", fr: "Je peux payer par carte ?", en: "Can I pay by card?" },
    { who: "B", fr: "Bien sûr. Merci et au revoir !", en: "Of course. Thank you and goodbye!" },
    { who: "A", fr: "Au revoir, bonne journée !", en: "Goodbye, have a good day!" },
  ],

  // Unité 4 — review a restaurant (aimer, c'est, adjectives, frequency, recommander).
  "SIO-050": [
    { who: "A", fr: "J'aime beaucoup ce restaurant.", en: "I really like this restaurant." },
    { who: "A", fr: "C'est délicieux !", en: "It's delicious!" },
    { who: "A", fr: "Le service est rapide.", en: "The service is fast." },
    { who: "A", fr: "Ce n'est pas cher.", en: "It's not expensive." },
    { who: "A", fr: "Parfois, le service est un peu lent.", en: "Sometimes the service is a bit slow." },
    { who: "A", fr: "Mais je recommande ce restaurant !", en: "But I recommend this restaurant!" },
  ],
};

export function getAtelier(sioId: string): DialogueLine[] | undefined {
  return ATELIER_DIALOGUES[sioId];
}
