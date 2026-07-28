/**
 * French number words for NumBus, in the traditional (pre-1990-reform)
 * spelling the rest of the site already uses — "soixante et onze",
 * "quatre-vingts", "deux cents" (see src/content/collections/numbers-*.json).
 *
 * Covers 0 → 999 999 999 999, plus the three spoken shapes a station tannoy
 * uses that are NOT plain cardinals: fares, clock times and phone numbers.
 * `explain()` returns the arithmetic behind a number — that is what the WHY
 * button reveals once a bus has been answered.
 */

const SMALL = [
  "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
  "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
  "dix-sept", "dix-huit", "dix-neuf",
];

/** 70 and 90 have no word of their own: they carry on counting from 60 and 80. */
const TENS: Record<number, string> = {
  2: "vingt", 3: "trente", 4: "quarante", 5: "cinquante", 6: "soixante",
  7: "soixante", 8: "quatre-vingt", 9: "quatre-vingt",
};

export function underHundred(n: number): string {
  if (n < 20) return SMALL[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (t === 7 || t === 9) {
    // 70s / 90s: the tens word stays put and the teens run on top of it.
    if (t === 7 && u === 1) return "soixante et onze";
    return `${TENS[t]}-${SMALL[10 + u]}`;
  }
  if (u === 0) return t === 8 ? "quatre-vingts" : TENS[t];
  // 81 is quatre-vingt-un — the "et" belongs to 21…71 only.
  if (u === 1 && t !== 8) return `${TENS[t]} et un`;
  return `${TENS[t]}-${SMALL[u]}`;
}

export function underThousand(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h === 0) return underHundred(n);
  if (r === 0) return h === 1 ? "cent" : `${SMALL[h]} cents`;
  return `${h === 1 ? "cent" : `${SMALL[h]} cent`} ${underHundred(r)}`;
}

/** "cents" and "quatre-vingts" drop their -s in front of mille (mille is not a
 *  noun); they keep it in front of million/milliard, which are. */
const beforeMille = (s: string) => s.replace(/s$/, "");

export function frenchNumber(n: number): string {
  if (n < 0) return `moins ${frenchNumber(-n)}`;
  if (n < 1000) return underThousand(n);
  if (n < 1e6) {
    const th = Math.floor(n / 1000);
    const r = n % 1000;
    // mille never takes an -s and never says "un mille".
    const head = th === 1 ? "mille" : `${beforeMille(underThousand(th))} mille`;
    return r === 0 ? head : `${head} ${underThousand(r)}`;
  }
  const scale = n >= 1e9 ? 1e9 : 1e6;
  const word = scale === 1e9 ? "milliard" : "million";
  const count = Math.floor(n / scale);
  const rest = n % scale;
  const head = `${frenchNumber(count)} ${word}${count > 1 ? "s" : ""}`;
  return rest === 0 ? head : `${head} ${frenchNumber(rest)}`;
}

/** Feminine agreement for the "un" that ends a count of feminine things
 *  (une heure, vingt et une heures). */
const feminine = (s: string) => s.replace(/un$/, "une");

/** A fare, the way a driver says it: "douze euros cinquante". */
export function frenchPrice(cents: number): string {
  const euros = Math.floor(cents / 100);
  const rest = cents % 100;
  const head = `${frenchNumber(euros)} euro${euros > 1 ? "s" : ""}`;
  return rest === 0 ? head : `${head} ${frenchNumber(rest)}`;
}

/** A departure time on the 24-hour clock: "quatorze heures trente". */
export function frenchTime(h: number, m: number): string {
  const head =
    h === 0 ? "zéro heure" : h === 1 ? "une heure" : `${feminine(frenchNumber(h))} heures`;
  return m === 0 ? head : `${head} ${frenchNumber(m)}`;
}

/** A French phone number, read in five two-digit blocks. A block beginning
 *  with 0 is spelled out digit by digit ("zéro six"). */
export function frenchPhone(digits: string): string {
  const blocks = digits.match(/\d{2}/g) ?? [];
  return blocks
    .map((b) => (b[0] === "0" ? `${SMALL[+b[0]]} ${SMALL[+b[1]]}` : frenchNumber(+b)))
    .join(", ");
}

/* ── the WHY panel ─────────────────────────────────────────────────────── */

/** Splits a number into the scale groups French actually names. */
function groups(n: number): { words: string; value: number }[] {
  const out: { words: string; value: number }[] = [];
  let rest = n;
  for (const [scale, word] of [[1e9, "milliard"], [1e6, "million"]] as const) {
    const c = Math.floor(rest / scale);
    if (c > 0) {
      out.push({ words: `${frenchNumber(c)} ${word}${c > 1 ? "s" : ""}`, value: c * scale });
      rest %= scale;
    }
  }
  const th = Math.floor(rest / 1000);
  if (th > 0) {
    out.push({ words: th === 1 ? "mille" : `${beforeMille(underThousand(th))} mille`, value: th * 1000 });
    rest %= 1000;
  }
  const h = Math.floor(rest / 100);
  if (h > 0) {
    const tail = rest % 100 === 0;
    out.push({ words: h === 1 ? "cent" : `${SMALL[h]} cent${tail ? "s" : ""}`, value: h * 100 });
    rest %= 100;
  }
  if (rest > 0 || out.length === 0) out.push({ words: underHundred(rest), value: rest });
  return out;
}

const fmt = (v: number) => v.toLocaleString("fr-FR").replace(/ | /g, " ");

/** Why the French looks the way it does — the sum first, then the traps that
 *  actually bite this number, most specific first. Three lines at most: this
 *  is a hint panel, not a grammar chapter. */
export function explain(n: number): string[] {
  const lines: string[] = [];
  const g = groups(n);
  if (g.length > 1) {
    lines.push(`${frenchNumber(n)} = ${g.map((p) => `${p.words} (${fmt(p.value)})`).join(" + ")}`);
  }

  const tail = n % 100;
  const t = Math.floor(tail / 10);
  const u = tail % 10;
  if (tail >= 70 && tail <= 79) {
    lines.push(`There is no word for 70: ${underHundred(tail)} counts 60 + ${tail - 60} — soixante + ${SMALL[tail - 60]}.`);
  } else if (tail >= 90) {
    lines.push(`There is no word for 90: ${underHundred(tail)} is 4 × 20 + ${tail - 80} — quatre-vingt + ${SMALL[tail - 80]}.`);
  } else if (tail === 80) {
    lines.push("quatre-vingts is 4 × 20, and the -s survives only when 80 ends the number.");
  } else if (tail > 80) {
    lines.push(`${underHundred(tail)} is 4 × 20 + ${u}: a hyphen, never « quatre-vingt et un ».`);
  }
  if (u === 1 && t >= 2 && t <= 7) {
    lines.push(`${underHundred(tail)} joins its 1 with et and no hyphen — the hyphen is for ${underHundred(tail + 1)}.`);
  }
  if (Math.floor((n % 1000) / 100) > 1) {
    lines.push(
      n % 100 === 0
        ? "cents keeps its -s here because the hundreds end the number."
        : "cent loses its -s as soon as anything follows it — deux cents, but deux cent un.",
    );
  }
  if (n >= 1000) lines.push("mille never changes: no -s, and never « un mille ».");
  return lines.slice(0, 3);
}
