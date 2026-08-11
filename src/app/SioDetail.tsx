"use client";

/**
 * The essentials-only body for a SIO popup (Dan, 2026-07-01: "STICK TO THE
 * ESSENTIALS. SHORT AND SWEET. EFFICIENT" — no "Statement of SIO" / "Measurable
 * Language Competency" headers, just one merged sentence via sioStatement()).
 * Below it: two tiles side by side, Pre-Test Prep / Post-Class Practice.
 * Shared between SioHub's Units 1-4 popups and (indirectly, via the same
 * merged sentence) Unit0Panel's popup.
 *
 * Post-Class Practice's chips (PracticeChips, below) are derived straight from
 * deckActivityTabs() (CahierShell.tsx) so this can't drift out of sync with
 * the popup's own flaps again — don't hardcode an activity list here. As of
 * 2026-08-02 that list shows as WorDrill (renamed from Say It, 2026-07-19)
 * and has no separate Complete It chip (folded into the Lesson's Pratique
 * step); check deckActivityTabs directly for the current set. Dan, 2026-07-01:
 * "some topics are better as letris..., others as lexpress..., sometimes
 * both" — Letris and Match It (Conveyor) show together whenever both apply,
 * not as mutually-exclusive alternatives.
 */
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { sioStatement, type Sio } from "@/content/sios";
import {
  missesForSio,
  PRETEST_RECORD_EVENT,
} from "@/lib/pretestRecord";
import type { Collection } from "@/lib/collections/schema";
import { getAtelier } from "@/content/ateliers";
import { lessonsForSio } from "@/content/lessons";
import { deckActivityTabs } from "@/components/CahierShell";
import AuthGate from "@/components/AuthGate";
import PretestQuiz from "./PretestQuiz";
import SioObjective from "@/components/SioObjective";
import DialoguePlayer from "./DialoguePlayer";

export default function SioDetail({
  sio,
  deck,
  pretestHref,
  pretestId,
  showPractice = true,
}: {
  sio: Sio;
  deck?: Collection;
  pretestHref: string | null;
  /** Authored pretest id — when set, its questions render RIGHT HERE, Unit-0
   *  style (all visible at a glance, immediate per-question autocorrection),
   *  instead of a link out to the pretest page. */
  pretestId?: string | null;
  /** Popups pass false — activities live on the popup's flap tabs instead. */
  showPractice?: boolean;
}) {
  const practiceTile = !showPractice ? null : (
    <div className="rounded-xl border-2 p-3" style={{ borderColor: "#3a9b5c" }}>
      <p className="fluo-label mb-2" style={{ color: "#3a9b5c" }}>Post-Class Practice</p>
      {deck ? (
        <PracticeChips deck={deck} />
      ) : sio.isProduction ? (
        <span className="text-xs text-[color:var(--fluo-ink-soft)]">🗣️ In-class task</span>
      ) : (
        <span className="text-xs text-[color:var(--fluo-ink-soft)]">Planned</span>
      )}
    </div>
  );

  // Production SIOs (ateliers) open to a model mini-dialogue to read, hear
  // (play-all or tap a line), then perform in class — no pretest/practice grid.
  const dialogue = sio.isProduction ? getAtelier(sio.id) : undefined;

  // Ported grammar lessons (with the 🎲 dice sentence-trainer) for this SIO.
  // Rendered at the BOTTOM, and — when the pretest runs inline — only after
  // every question is answered (Dan, 2026-07-05: pretest first, lesson after).
  const lessons = lessonsForSio(sio.id);
  const lessonChips =
    lessons.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {lessons.map((l) => (
          <Link key={l.slug} href={`/lessons/${l.slug}`} className="fluo-btn fluo-btn-sm inline-flex">
            🎲 {l.title}
          </Link>
        ))}
      </div>
    ) : null;

  // Dan's litmus test (see AGENTS.md) applies to TEXT only: the tile border
  // stays (decorative, serves the visual), the label text does not.
  return (
    <div>
      <p className="fluo-serif mb-4 text-base font-bold leading-snug text-[color:var(--fluo-ink)]">
        <span className="fluo-hl">{sioStatement(sio)}</span>
      </p>
      <SioObjective id={sio.id} />

      {dialogue ? (
        <div className="space-y-3">
          <DialoguePlayer lines={dialogue} />
          {practiceTile}
          {lessonChips}
        </div>
      ) : pretestId ? (
        <div className="space-y-3">
          <div className="rounded-xl border-2 p-3" style={{ borderColor: "#7c6cff" }}>
            <AuthGate what="take the pre-test" compact>
              <PretestQuiz pretestId={pretestId} />
            </AuthGate>
          </div>
          <BringToClass sioId={sio.id} />
          {practiceTile}
          <AfterPretest>{lessonChips}</AfterPretest>
        </div>
      ) : showPractice ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border-2 p-3" style={{ borderColor: "#7c6cff" }}>
            <p className="fluo-label mb-2" style={{ color: "#7c6cff" }}>Pre-Test Prep</p>
            {pretestHref ? (
              <Link href={pretestHref} className="fluo-btn fluo-btn-sm">🧪 Start</Link>
            ) : (
              <span className="text-xs text-[color:var(--fluo-ink-soft)]">Planned</span>
            )}
          </div>
          {practiceTile}
        </div>
      ) : null /* popups: the Pre-Test flap on the popup edge carries the link */}
    </div>
  );
}

/** Hidden until the inline pretest fires its completion event — the lesson
 *  button must not tempt learners away before they finish (Dan, 2026-07-05). */
export function AfterPretest({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const onDone = () => setDone(true);
    window.addEventListener("fluolingo:pretest-complete", onDone);
    return () => window.removeEventListener("fluolingo:pretest-complete", onDone);
  }, []);
  if (!done || !children) return null;
  return <>{children}</>;
}

/** The learner's gap report (PRIME "bring to class"): items whose LAST attempt
 *  was wrong. Reads localStorage on mount (so a reopened popup shows the
 *  latest attempt) and refreshes on every recorded answer while mounted. */
function BringToClass({ sioId }: { sioId: string }) {
  const [misses, setMisses] = useState<ReturnType<typeof missesForSio>>([]);
  useEffect(() => {
    const read = () => setMisses(missesForSio(sioId));
    read();
    window.addEventListener(PRETEST_RECORD_EVENT, read);
    return () => window.removeEventListener(PRETEST_RECORD_EVENT, read);
  }, [sioId]);

  if (misses.length === 0) return null;
  const shown = misses.slice(0, 6);
  const extra = misses.length - shown.length;
  return (
    <div className="rounded-xl border-2 p-3" style={{ borderColor: "#e8a13a" }}>
      <p className="fluo-label mb-2" style={{ color: "#b06e10" }}>📝 Bring to class</p>
      <ul className="space-y-1">
        {shown.map((m) => (
          <li key={m.itemId} className="text-xs leading-snug text-[color:var(--fluo-ink)]">
            <span lang="fr">{m.stem}</span>
            <span aria-hidden> → </span>
            <span lang="fr" className="font-bold">{m.answer}</span>
          </li>
        ))}
      </ul>
      {extra > 0 && (
        <p className="mt-1 text-[0.65rem] font-bold text-[color:var(--fluo-ink-soft)]">
          +{extra} more
        </p>
      )}
    </div>
  );
}

export function PracticeChips({ deck }: { deck: Collection }) {
  // Derived from the ONE unified flap list so chips can never drift from the
  // rails/popup again; the Pre-Test entry is dropped (this tile is post-class).
  const chips = deckActivityTabs(deck.id)
    .filter((t) => t.key !== "pretest")
    .map((t) => ({ key: t.key, label: `${t.emoji} ${t.label}`, href: t.href }));
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) =>
        c.href ? (
          <Link key={c.key} href={c.href} className="fluo-btn fluo-btn-sm">
            {c.label}
          </Link>
        ) : (
          <span
            key={c.key}
            title="Coming soon"
            className="rounded-full border border-[color:var(--fluo-line)] px-2.5 py-1 text-xs font-bold text-[color:var(--fluo-ink-soft)] opacity-60"
          >
            {c.label}
          </span>
        ),
      )}
    </div>
  );
}
