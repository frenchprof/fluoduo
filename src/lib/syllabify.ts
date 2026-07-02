/**
 * Syllable source for Lexicalator. HAND-AUTHORED data is the source of truth —
 * an item's `syllables` field (set in the deck JSON, signed off by Dan) always
 * wins, because French syllabification's silent-tail and glide/diérèse cases
 * can't be reliably computed (see the long design thread: "pel·lent" is the
 * trap). The heuristic below is only a *fallback* for words not yet hand-pinned;
 * a deck is only offered in the new Lexicalator once every word it uses has a
 * real segmentation (hand-authored), so the fallback never ships unreviewed.
 */

const VOWELS = "aàâäeéèêëiîïoôöuùûüyœæ";
const isV = (c: string) => VOWELS.includes(c.toLowerCase());

/**
 * Best-effort spoken-syllable split — fallback only. Rules approximated:
 * break at true consonants (single → onset of next; keep C+r/l clusters whole),
 * a silent final -e / -ent glues to the last syllable. Glide/hiatus nuances are
 * NOT handled here — that's what the hand-authored data is for.
 */
export function syllabifyFallback(word: string): string[] {
  const w = word;
  const n = w.length;
  if (n <= 3) return [w];
  // Find vowel-group end indices (a nucleus = a maximal run of vowel letters).
  const nuclei: [number, number][] = [];
  let i = 0;
  while (i < n) {
    if (isV(w[i])) {
      let j = i;
      while (j + 1 < n && isV(w[j + 1])) j++;
      nuclei.push([i, j]);
      i = j + 1;
    } else i++;
  }
  if (nuclei.length <= 1) return [w];

  const KEEP = new Set(["bl", "cl", "fl", "gl", "pl", "br", "cr", "dr", "fr", "gr", "pr", "tr", "vr", "ch", "ph", "th", "gn"]);
  const cuts: number[] = [];
  for (let k = 0; k < nuclei.length - 1; k++) {
    const vEnd = nuclei[k][1];
    const nextVStart = nuclei[k + 1][0];
    const cons = w.slice(vEnd + 1, nextVStart); // consonants between the two nuclei
    let cut: number;
    if (cons.length === 0) cut = nextVStart; // hiatus → split between the vowels
    else if (cons.length === 1) cut = vEnd + 1; // single consonant → onset of next
    else {
      const lastTwo = cons.slice(-2).toLowerCase();
      // keep an inseparable cluster with the following vowel
      cut = KEEP.has(lastTwo) ? nextVStart - 2 : nextVStart - 1;
    }
    cuts.push(cut);
  }
  const parts: string[] = [];
  let start = 0;
  for (const c of cuts) {
    parts.push(w.slice(start, c));
    start = c;
  }
  parts.push(w.slice(start));
  // A trailing silent syllable (bare consonants, or a lone mute -e) glues left.
  return parts.filter((p) => p.length > 0).reduce<string[]>((acc, p) => {
    if (acc.length && ![...p].some(isV)) acc[acc.length - 1] += p;
    else acc.push(p);
    return acc;
  }, []);
}

/** Syllables for a word: hand-authored data wins; else the fallback. */
export function syllablesFor(word: string, authored?: string[]): string[] {
  if (authored && authored.length && authored.join("") === word) return authored;
  return syllabifyFallback(word);
}
