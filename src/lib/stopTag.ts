/**
 * WHICH STOP AM I ON? — the one answer, for every surface that has one.
 *
 * Dan, 2026-09-01, closing a four-part chrome audit: *"there are pages where
 * there is no identity tag regarding which stop it belongs to."* He was right
 * about the whole app. A learner deep in Flip It, a deck's MCQ or a pre-test
 * had nothing on screen saying which of the fifty stops the work belonged to —
 * the page named the ACTIVITY and the DECK and never the position, so the only
 * way back to "where am I on the course" was the map.
 *
 * WHY A SHARED FILE. `SIOS.find((s) => s.collectionId === …)` was already
 * written out twice — DrillShell (for the ✕'s exit) and CahierShell (for a
 * deck's pre-test link) — and this adds a third caller and a second lookup
 * shape (a pre-test's id, which encodes its stop rather than carrying it). Two
 * copies of a lookup is how `gapSentence` came to exist; three is not a thing
 * to let happen twice in one day.
 *
 * THE TAG IS DATA, NOT DESCRIPTION, because that is what PageBand's sub-line
 * is for — "course · week, deck · count, never description". So it reads
 * « STOP 39/50 · UNITÉ 3 » and says nothing a learner could have guessed from
 * the title above it.
 */
import { SIOS } from "@/content/sios";

type Sio = (typeof SIOS)[number];

/** The stop a deck belongs to, or null for a deck outside the study path. */
export function stopForDeck(collectionId: string | undefined | null): Sio | null {
  if (!collectionId) return null;
  return SIOS.find((s) => s.collectionId === collectionId) ?? null;
}

/**
 * The stop a pre-test belongs to. A pre-test carries no stop id — the id
 * ENCODES it ("u3-sio039" → SIO-039), which is the only place that string is
 * decoded, so the pattern lives here rather than in each page that needs it.
 * Unit-0 pre-tests are keyed by the stop directly ("SIO-010").
 */
export function stopForPretestId(id: string | undefined | null): Sio | null {
  if (!id) return null;
  const m = /sio-?(\d{2,3})/i.exec(id);
  if (!m) return null;
  const wanted = `SIO-${m[1].padStart(3, "0")}`;
  return SIOS.find((s) => s.id === wanted) ?? null;
}

/**
 * The band sub-line: the stop's position on the path and its unit.
 *
 * The POSITION, not the id. `SIO-039` is the identifier the content uses and
 * it means nothing to a learner; "39/50" is the same figure Home already puts
 * in its counter well, so the two surfaces agree about where the learner is
 * without anyone having to translate.
 */
export function stopTag(sio: Sio | null): string | undefined {
  if (!sio) return undefined;
  const n = SIOS.indexOf(sio) + 1;
  return `STOP ${n}/${SIOS.length} · UNITÉ ${sio.unit}`;
}

/** Shorthand for the common case: a deck id straight to its band sub-line. */
export function stopTagForDeck(collectionId: string | undefined | null): string | undefined {
  return stopTag(stopForDeck(collectionId));
}
