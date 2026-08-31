/**
 * Flip-card decks for the production SIOs (ateliers), generated from the model
 * mini-dialogues in content/ateliers.ts — the dialogue lines ARE the cards, so
 * students can drill the model line-by-line (Flip It / WorDrill / the
 * Lesson's Pratique step) before performing it in class. One deck per
 * production SIO; no letris/syllables — games aren't forced where they don't
 * fit.
 */
import { ATELIER_DIALOGUES } from "@/content/ateliers";
import type { Collection } from "@/lib/collections/schema";

const ATELIER_META: Record<string, { title: string; subtitle: string; unit: number; lessonNo: number; slug: string; seq: number }> = {
  "SIO-010": { title: "Atelier — Première rencontre", subtitle: "the first-meeting role-play, line by line", unit: 0, lessonNo: 10, slug: "atelier-rencontre", seq: 10 },
  "SIO-020": { title: "Atelier — Présenter un pays", subtitle: "the country presentation, line by line", unit: 1, lessonNo: 10, slug: "atelier-pays", seq: 120 },
  "SIO-030": { title: "Atelier — Un petit e-mail", subtitle: "the friendly e-mail, line by line", unit: 2, lessonNo: 10, slug: "atelier-email", seq: 230 },
  "SIO-040": { title: "Atelier — L'itinéraire", subtitle: "the itinerary, line by line", unit: 3, lessonNo: 10, slug: "atelier-itineraire", seq: 340 },
  "SIO-049": { title: "Atelier — Avis de restaurant", subtitle: "the restaurant review, line by line", unit: 4, lessonNo: 9, slug: "atelier-avis-resto", seq: 449 },
  "SIO-050": { title: "Atelier — Au restaurant", subtitle: "the restaurant scene, line by line", unit: 4, lessonNo: 10, slug: "atelier-resto", seq: 450 },
};

export const ATELIER_DECKS: Collection[] = Object.entries(ATELIER_META).map(([sioId, meta]) => {
  const lines = ATELIER_DIALOGUES[sioId] ?? [];
  const idBase = `atelier-${sioId.toLowerCase()}`;
  return {
    id: idBase,
    title: meta.title,
    subtitle: meta.subtitle,
    langPair: "fr-en",
    owner: "curated",
    visibility: "public",
    unit: meta.unit,
    lessonNo: meta.lessonNo,
    lessonSlug: meta.slug,
    tags: [],
    seq: meta.seq,
    // A DIALOGUE LINE IS NOT ALWAYS A CARD (Dan, 2026-08-31: "yes pls fix").
    //
    // The dialogues are correct as dialogues — two people really do both say
    // « Bonjour ! », and an e-mail really does end on the sender's name. As
    // FLASHCARDS those same lines are faults: SIO-010 dealt "Bonjour !" twice
    // in a row as two identical cards, and SIO-030 ended on a card reading
    // « Léa » / "Léa", which asks the learner to recall nothing. So the filter
    // is here, on the deck, and the dialogue above is left alone — Les formes
    // still renders « Le modèle » complete, turn by turn.
    //
    // Two rules, both about whether a card can teach:
    //   · a line already dealt (same `fr`) — a duplicate card is a free point
    //   · a line whose French and English are identical — a proper name, not
    //     language to learn
    //
    // THE INDEX IS THE LINE'S, NOT THE CARD'S. Ids are SRS keys and stored
    // response keys, so renumbering after a filter would silently detach every
    // learner's history for these decks. `i` stays the position in the
    // dialogue; the ids simply skip the numbers the filter removed.
    items: lines
      .map((l, i) => ({
        id: `${idBase}-${String(i + 1).padStart(2, "0")}`,
        fr: l.fr,
        en: l.en,
        tags: [] as string[],
      }))
      .filter((it, i, all) => {
        if (it.fr.trim() === it.en.trim()) return false;
        return all.findIndex((o) => o.fr === it.fr) === i;
      }),
  } as Collection;
});
