/**
 * Native "Professions" lesson (Unité 1) — authored 2026-08-23 to the
 * LESSON_PLAN U1 #5 row (emoji + English → un X / une Y; un vs une):
 * Mémo + 🎲 dice trainer + EN→FR bonus. All professions are the professions
 * deck's own items (col:il / col:elle pairs + the col:both epicenes).
 */
import type { NativeLesson } from "./types";

/** m/f pairs from the deck (col:il / col:elle). */
const PAIRS = [
  { m: "chef", f: "cheffe", en: "chef" },
  { m: "acteur", f: "actrice", en: "actor / actress" },
  { m: "joueur de tennis", f: "joueuse de tennis", en: "tennis player" },
  { m: "nageur", f: "nageuse", en: "swimmer" },
  { m: "chanteur", f: "chanteuse", en: "singer" },
  { m: "étudiant", f: "étudiante", en: "student" },
  { m: "serveur", f: "serveuse", en: "waiter / waitress" },
  { m: "musicien", f: "musicienne", en: "musician" },
] as const;
/** One form for both (col:both). */
const EPICENE = [
  { m: "journaliste", f: "journaliste", en: "journalist" },
  { m: "styliste", f: "styliste", en: "fashion designer" },
  { m: "artiste", f: "artiste", en: "artist" },
  { m: "architecte", f: "architecte", en: "architect" },
  { m: "médecin", f: "médecin", en: "doctor" },
] as const;

type Genre = "m" | "f";
const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export const professionsLesson: NativeLesson = {
  slug: "professions",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Les professions — <em>il est, elle est, c&rsquo;est un/une</em>
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-[color:var(--gram-masc)]">-eur</b> → <b className="text-[color:var(--gram-fem)]">-euse</b> — <i lang="fr">serveur / serveuse, chanteur / chanteuse</i></li>
        <li><b className="text-[color:var(--gram-masc)]">-teur</b> → <b className="text-[color:var(--gram-fem)]">-trice</b> — <i lang="fr">acteur / actrice</i></li>
        <li><b className="text-[color:var(--gram-masc)]">-ien</b> → <b className="text-[color:var(--gram-fem)]">-ienne</b> — <i lang="fr">musicien / musicienne</i></li>
        <li>+ <b className="text-[color:var(--gram-fem)]">e</b> — <i lang="fr">étudiant / étudiant<b>e</b></i></li>
        <li>ends in <b className="text-[color:var(--gram-neutral)]">-e</b> → no change — <i lang="fr">journaliste, artiste, architecte</i></li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ No article after <i lang="fr">être</i>: <span lang="fr"><b>Il est</b> médecin.</span>{" "}
        The article returns with <i lang="fr">c&rsquo;est</i>: <span lang="fr"><b>C&rsquo;est un</b> médecin. <b>C&rsquo;est une</b> actrice.</span>
      </p>
    </div>
  ),
  dice: {
    instruction: "Present the person: il est / elle est, or c'est un / une.",
    newQuestion() {
      const g: Genre = pick(["m", "f"] as const);
      const gLabel = g === "m" ? "(m.)" : "(f.)";

      if (Math.random() < 0.5) {
        // il est / elle est + the right form, no article
        const p = pick(PAIRS);
        const subj = g === "m" ? "Il" : "Elle";
        const form = p[g];
        const wrongForm = p[g === "m" ? "f" : "m"];
        const art = g === "m" ? "un" : "une";
        const correct = `${subj} est ${form}.`;
        return {
          meta: `${subj.toLowerCase()} → profession`,
          big: `${p.en} ${gLabel}`,
          correct,
          easyOptions: [correct, `${subj} est ${wrongForm}.`, `${subj} est ${art} ${form}.`, `C'est ${form}.`],
          med: { before: `${subj} est`, choices: [p.m, p.f], correct: form, after: "." },
        };
      }

      // c'est un / une + profession
      const p = pick([...PAIRS, ...EPICENE] as const);
      const form = p[g];
      const art = g === "m" ? "un" : "une";
      const wrongArt = g === "m" ? "une" : "un";
      const correct = `C'est ${art} ${form}.`;
      return {
        meta: "C'est … (un ou une ?)",
        big: `${p.en} ${gLabel}`,
        correct,
        easyOptions: [correct, `C'est ${wrongArt} ${form}.`, `C'est ${form}.`, `${g === "m" ? "Il" : "Elle"} est ${art} ${form}.`],
        med: { before: "C'est", choices: ["un", "une"], correct: art, after: `${form}.` },
      };
    },
  },
  bonus: [
    { en: "He is a singer.", fr: "Il est chanteur.", alt: ["C'est un chanteur."] },
    { en: "She is an actress.", fr: "Elle est actrice.", alt: ["C'est une actrice."] },
    { en: "She is a doctor.", fr: "Elle est médecin.", alt: ["C'est une médecin."] },
    { en: "He is a student.", fr: "Il est étudiant.", alt: ["C'est un étudiant."] },
    { en: "She is a student.", fr: "Elle est étudiante.", alt: ["C'est une étudiante."] },
    { en: "This is a journalist. (f.)", fr: "C'est une journaliste." },
    { en: "This is a musician. (m.)", fr: "C'est un musicien." },
    { en: "She is a waitress.", fr: "Elle est serveuse.", alt: ["C'est une serveuse."] },
    { en: "He is an architect.", fr: "Il est architecte.", alt: ["C'est un architecte."] },
    { en: "She is a tennis player.", fr: "Elle est joueuse de tennis.", alt: ["C'est une joueuse de tennis."] },
  ],
};
