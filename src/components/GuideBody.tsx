/**
 * The Quick Guide — Dan's final cut (2026-07-14): three one-liners and a red
 * ▶ Continue, NOTHING else. Shared between /guide and the first-visit splash.
 * On the splash, Continue dismisses it for good (onContinue); on the page it
 * simply leads home. Everything longer lives behind 💡 About and the tour.
 *
 * The activity grid DERIVES from the registry (patch 19c). This panel used to
 * keep its own list of 15 activities with its own names ("Lesson", "Flip It")
 * and its own emoji — one of the four disagreeing surfaces the registry was
 * built to end, and the one patch 19 did not reach. Two of its tiles both
 * truncated to "GramMara…" and became the same button. Now: every registry
 * activity, grouped by family in family order, four columns, names never
 * truncated — and a rename in activities.ts lands here by itself.
 */
import Link from "next/link";
import { FAMILIES, activitiesIn, familyShort } from "@/content/activities";

const STEPS: { hue: number; what: React.ReactNode }[] = [
  { hue: 1, what: <>🏠 <b>Unité 0–4</b> flaps → tap the goal</> },
  { hue: 3, what: <>💡 Pre-Test <b className="cahier-hl px-0.5">before</b> it&rsquo;s taught</> },
  { hue: 4, what: <>🎲 After class, drill with these</> },
];

const CONTINUE_STYLE =
  "mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-[#9f1239] bg-[#e11d48] px-5 py-2 font-black text-white shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5";

export default function GuideBody({ onContinue }: { onContinue?: () => void }) {
  return (
    <>
      {/* Steps 1 and 2 share the row, half each; step 3 (with the icons)
          takes the full width (Dan, 2026-07-14). */}
      <ol className="mt-3 grid grid-cols-2 gap-2.5">
        {STEPS.map((s, i) => (
          <li
            key={i}
            // Step 3 stacks on a phone: beside the number circle the grid got
            // ~64px per column and 12-char names (VocabulaRain, LexicaLater)
            // collided — caught on the 390px screenshot, invisible to the
            // structural check.
            className={`fluo-h-${s.hue} flex items-center gap-3 rounded-xl border-2 p-3 ${i === 2 ? "col-span-2 !items-start max-sm:flex-col max-sm:!items-stretch" : ""}`}
            style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ background: "var(--fluo-card-accent)" }}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-relaxed text-[color:var(--cahier-ink)]">{s.what}</p>
              {i === 2 && (
                <div className="mt-3 flex flex-col gap-3">
                  {FAMILIES.map((f) => (
                    <div key={f.key}>
                      {/* The family name is navigation text — it is the same
                          label the bottom bar derives (nav.ts), pointing at
                          the same doors. */}
                      <p className="text-[11px] font-black uppercase tracking-wide text-[color:var(--cahier-ink)]/60">
                        <span aria-hidden>{f.emoji}</span> {familyShort(f)}
                      </p>
                      <ul className="mt-1.5 grid grid-cols-4 gap-x-1 gap-y-3 sm:gap-x-2">
                        {activitiesIn(f.key).map((a) => (
                          <li key={a.key} className="flex flex-col items-center gap-1" title={a.blurb}>
                            <Link
                              href={a.href ?? "/map"}
                              className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-white/80 text-2xl shadow-[2px_2px_0_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
                              style={{ borderColor: a.hue }}
                            >
                              {a.emoji}
                            </Link>
                            {/* Full name, always — 8 of 15 used to cut to
                                "GramMara…". Wrapping is allowed; cutting is
                                not. */}
                            <span className="w-full break-words text-center text-[10px] font-bold leading-tight tracking-tight text-[color:var(--cahier-ink)] sm:text-[11px] sm:tracking-normal">
                              {a.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </span>
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
