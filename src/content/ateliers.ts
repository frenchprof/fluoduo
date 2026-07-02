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
    { who: "A", fr: "Bonjour ! Je te présente le Japon.", en: "Hello! Let me introduce Japan." },
    { who: "A", fr: "C'est un pays en Asie.", en: "It's a country in Asia." },
    { who: "A", fr: "Au Japon, on parle japonais.", en: "In Japan, people speak Japanese." },
    { who: "A", fr: "Les Japonais aiment le sport et l'art.", en: "The Japanese like sport and art." },
    { who: "A", fr: "Moi, j'aime beaucoup le Japon !", en: "Me, I really like Japan!" },
  ],

  // Unité 2 — a short friendly email (aller, faire, avec, connectors, well wishes).
  "SIO-030": [
    { who: "A", fr: "Salut Marie !", en: "Hi Marie!" },
    { who: "A", fr: "Merci pour ton message.", en: "Thanks for your message." },
    { who: "A", fr: "Ce week-end, je vais au cinéma avec des amis.", en: "This weekend I'm going to the cinema with friends." },
    { who: "A", fr: "Et toi, qu'est-ce que tu fais ?", en: "And you, what are you doing?" },
    { who: "A", fr: "Bonne journée et à bientôt !", en: "Have a good day and see you soon!" },
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

  // Unité 4 — review a restaurant (aimer, c'est, adjectives, frequency, recommander).
  "SIO-049": [
    { who: "A", fr: "J'aime beaucoup ce restaurant.", en: "I really like this restaurant." },
    { who: "A", fr: "C'est délicieux !", en: "It's delicious!" },
    { who: "A", fr: "Le service est rapide.", en: "The service is fast." },
    { who: "A", fr: "Ce n'est pas cher.", en: "It's not expensive." },
    { who: "A", fr: "Parfois, le service est un peu lent.", en: "Sometimes the service is a bit slow." },
    { who: "A", fr: "Mais je recommande ce restaurant !", en: "But I recommend this restaurant!" },
  ],

  // Unité 4 — restaurant role-play (vouloir/voudrais, aliments, partitives, politeness).
  "SIO-050": [
    { who: "B", fr: "Bonjour ! Vous désirez ?", en: "Hello! What would you like?" },
    { who: "A", fr: "Bonjour ! Je voudrais un café, s'il vous plaît.", en: "Hello! I'd like a coffee, please." },
    { who: "B", fr: "Et pour manger ?", en: "And to eat?" },
    { who: "A", fr: "Je voudrais un croissant et une pomme.", en: "I'd like a croissant and an apple." },
    { who: "B", fr: "Très bien. Vous voulez de l'eau ?", en: "Very well. Would you like some water?" },
    { who: "A", fr: "Oui, je veux bien. Merci !", en: "Yes, please. Thank you!" },
    { who: "B", fr: "Voilà ! Bon appétit !", en: "Here you are! Enjoy your meal!" },
  ],
};

export function getAtelier(sioId: string): DialogueLine[] | undefined {
  return ATELIER_DIALOGUES[sioId];
}
