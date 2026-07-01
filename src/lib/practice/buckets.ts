/**
 * Per-card review buckets for Flip It — "reviewed" vs "to-review" (Leitner-style).
 * Local-first (localStorage per deck); mirrors the notes store. Firebase sync can
 * be layered on later the same way as notes.
 */
export type Bucket = "reviewed" | "toReview";

const lsKey = (deckId: string) => `fln-buckets:${deckId}`;

export function loadBuckets(deckId: string): Record<string, Bucket> {
  try {
    return JSON.parse(localStorage.getItem(lsKey(deckId)) || "{}");
  } catch {
    return {};
  }
}

export function setBucket(
  deckId: string,
  itemId: string,
  bucket: Bucket | null,
): Record<string, Bucket> {
  const m = loadBuckets(deckId);
  if (bucket) m[itemId] = bucket;
  else delete m[itemId];
  localStorage.setItem(lsKey(deckId), JSON.stringify(m));
  return m;
}
