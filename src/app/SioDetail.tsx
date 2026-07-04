"use client";

/**
 * The essentials-only body for a SIO popup (Dan, 2026-07-01: "STICK TO THE
 * ESSENTIALS. SHORT AND SWEET. EFFICIENT" — no "Statement of SIO" / "Measurable
 * Language Competency" headers, just one merged sentence via sioStatement()).
 * Below it: two tiles side by side, Pre-Test Prep / Post-Class Practice.
 * Shared between SioHub's Units 1-4 popups and (indirectly, via the same
 * merged sentence) Unit0Panel's popup.
 *
 * Post-Class Practice always offers Flip It, Say It, Complete It, and Match It
 * (Conveyor — works for any FR/EN deck), PLUS Classify It (Letris) whenever the
 * deck has a sort-column axis. Dan, 2026-07-01: "some topics are better as
 * letris..., others as lexpress..., sometimes both" — an earlier pass treated
 * these as mutually exclusive; that was wrong, this shows both when both apply.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { sioStatement, type Sio } from "@/content/sios";
import {
  missesForSio,
  PRETEST_RECORD_EVENT,
} from "@/lib/pretestRecord";
import type { Collection } from "@/lib/collections/schema";
import { getAtelier } from "@/content/ateliers";
import { lessonsForSio } from "@/content/lessons";
import { isLexReady } from "@/lib/collections/lexReady";
import { UNIT_PAGES } from "@/components/CahierShell";
import { getLetrisSet } from "@/games/letris/sets";
import AuthGate from "@/components/AuthGate";
import PretestQuiz from "./PretestQuiz";
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
  const lessons = lessonsForSio(sio.id);

  // Dan's litmus test (see AGENTS.md) applies to TEXT only: the tile border
  // stays (decorative, serves the visual), the label text does not.
  return (
    <div>
      <p className="fluo-serif mb-4 text-base font-bold leading-snug text-[color:var(--fluo-ink)]">
        <span className="fluo-hl">{sioStatement(sio)}</span>
      </p>

      {lessons.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {lessons.map((l) => (
            <Link key={l.slug} href={`/lessons/${l.slug}`} className="fluo-btn fluo-btn-sm inline-flex">
              🎲 {l.title}
            </Link>
          ))}
        </div>
      )}

      {dialogue ? (
        <div className="space-y-3">
          <DialoguePlayer lines={dialogue} />
          {practiceTile}
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
  const hasLetris = !!getLetrisSet(deck.id.replace("-letris", ""));
  const chips = [
    { key: "flip", label: "🃏 Flip It", href: `/practice/flip-it/${deck.id}` },
    { key: "say", label: "🎤 Say It", href: `/practice/say-it/${deck.id}` },
    { key: "complete", label: "✏️ Complete It", href: `/practice/complete-it/${deck.id}` },
    // Lexicalator only where the deck is hand-syllabified (no old-game fallback).
    ...(isLexReady(deck)
      ? [{ key: "match", label: "🧰 Lexicalator", href: `/games/conveyor/${deck.id}` }]
      : []),
    ...(hasLetris
      ? [{ key: "classify", label: "🌧️ Vocabularain", href: `/games/letris/${deck.id.replace("-letris", "")}` }]
      : []),
    ...(UNIT_PAGES[deck.id]
      ? [{ key: "unit", label: `${UNIT_PAGES[deck.id].emoji} ${UNIT_PAGES[deck.id].label}`, href: UNIT_PAGES[deck.id].href }]
      : []),
  ];
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
