/**
 * The Quick Guide — Dan's final cut (2026-07-14): three one-liners and a red
 * ▶ Continue, NOTHING else. Shared between /guide and the first-visit splash.
 * On the splash, Continue dismisses it for good (onContinue); on the page it
 * simply leads home. Everything longer lives behind 💡 About and the tour.
 */
import Link from "next/link";

const STEPS: { hue: number; what: React.ReactNode }[] = [
  { hue: 1, what: <>🏠 <b>Unité 0–4</b> flaps → tap the goal</> },
  { hue: 3, what: <>🧪 Pre-Test <b className="cahier-hl px-0.5">before</b> it&rsquo;s taught</> },
  { hue: 4, what: <>🎲 After class, drill with these</> },
];

const CONTINUE_STYLE =
  "mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-[#9f1239] bg-[#e11d48] px-5 py-2 font-black text-white shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5";

export default function GuideBody({ onContinue }: { onContinue?: () => void }) {
  return (
    <>
      <ol className="mt-3 space-y-2.5">
        {STEPS.map((s, i) => (
          <li
            key={i}
            className={`fluo-h-${s.hue} flex items-center gap-3 rounded-xl border-2 p-3`}
            style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ background: "var(--fluo-card-accent)" }}
            >
              {i + 1}
            </span>
            <p className="text-sm font-bold leading-relaxed text-[color:var(--cahier-ink)]">{s.what}</p>
          </li>
        ))}
      </ol>
      {onContinue ? (
        <button type="button" onClick={onContinue} className={CONTINUE_STYLE}>
          <span aria-hidden>▶</span> Continue
        </button>
      ) : (
        <Link href="/" className={CONTINUE_STYLE}>
          <span aria-hidden>▶</span> Continue
        </Link>
      )}
    </>
  );
}
