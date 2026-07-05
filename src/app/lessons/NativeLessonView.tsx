"use client";

/**
 * A native lesson page — real in-app content inside the CahierShell notebook
 * (Dan, 2026-07-03: "lessons native in CahierShell", not iframed HTML). One
 * scrolling cahier page: the Mémo card, the 🎲 dice trainer, the ⭐ bonus. The
 * flap tabs (→ ☰ burger when narrow) come from the shared shell.
 */

import CahierShell, { deckActivityTabs, withActive } from "@/components/CahierShell";
import DiceTrainer, { BonusTrainer } from "@/games/dice/DiceTrainer";
import { getNativeLesson } from "@/content/lessons/native";
import { deckForLesson } from "@/content/lessons";

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--cahier-ink)] text-[10px] font-black text-white">{n}</span>
      <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">{label}</span>
      <div className="h-px flex-1 bg-[color:var(--cahier-rule)]" />
    </div>
  );
}

export default function NativeLessonView({ slug, title, unit, embedded = false }: { slug: string; title: string; unit: number; embedded?: boolean }) {
  const lesson = getNativeLesson(slug);
  if (!lesson) return null;

  const body = (
      <div className="mx-auto max-w-2xl space-y-4 px-2 py-4">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]" lang="fr">{title}</h1>
        <StepLabel n={1} label="Recall the idea" />
        {lesson.memo}
        <DiceTrainer config={lesson.dice} />
        <BonusTrainer items={lesson.bonus} />
      </div>
  );
  if (embedded) return body;

  // A lesson is part of its SIO's flow, not a standalone page (Dan,
  // 2026-07-04): when it belongs to a deck, it carries THAT deck's activity
  // tabs — the learner rolls straight from the lesson into Flip It / drills.
  // No lessons gallery exists (Dan, 2026-07-05: everything parks under the
  // units) — cross-unit revisions tab home instead.
  const deckId = deckForLesson(slug);
  const tabs = deckId
    ? withActive(deckActivityTabs(deckId), "lesson")
    : [
        { key: "home", label: "Accueil", emoji: "🏠", href: "/" },
        { key: "lesson", label: title, emoji: "🎲" },
      ];

  return (
    <CahierShell
      tabs={tabs}
      active="lesson"
      crumb={`Unité ${unit}`}
    >
      {body}
    </CahierShell>
  );
}
