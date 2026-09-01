import type { Metadata } from "next";
import FluolingoOrigin from "@/components/FluolingoOrigin";
import { BEATS, STAGES, stageText } from "@/lib/fluolingoOrigin";

/**
 * A page to WATCH the origin animation on, and nothing else.
 *
 * It lives under /hidden for the same reason Vocabularain does: it is not part
 * of the course and a learner has no business finding it in a menu. It exists
 * because an animation that can only be seen inside whatever page eventually
 * hosts it cannot be judged — Dan has to be able to look at the thing itself,
 * at a size, on a phone, as many times as he likes, before deciding where it
 * belongs. `robots: noindex` keeps it out of search.
 *
 * The stage list under it is the SPEC, printed from the same table the
 * animation runs on. If the two ever disagree, the page says so on its face.
 */
export const metadata: Metadata = {
  title: "FluOLinGo · where the name comes from",
  description: "Fluency On Linguistic Goals — the origin animation.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <div
        className="rounded-3xl border-2 p-6 sm:p-10"
        style={{
          borderColor: "var(--cahier-ink)",
          background: "var(--cahier-paper-raised)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <FluolingoOrigin />
      </div>

      {/* Closed on arrival — the animation is the page, and a table of its
          internals is reference (the collapse rule, 31 Aug). The count is on
          the summary so a closed section is not a mystery. */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-bold text-[color:var(--cahier-ink)]">
          The {STAGES.length} stages, and the beats they land on
        </summary>
        <ol className="mt-3 space-y-1.5 text-sm text-[color:var(--cahier-ink)]">
          {STAGES.map((s) => (
            <li key={s.key} className="flex flex-wrap items-baseline gap-x-3">
              <code className="text-[color:var(--fluo-ink-soft)]">{s.key}</code>
              <b className="cahier-hand text-lg">{stageText(s)}</b>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-[color:var(--fluo-ink-soft)]">
          One pass runs {(BEATS.end / 1000).toFixed(1)}s, then repeats.
        </p>
      </details>
    </main>
  );
}
