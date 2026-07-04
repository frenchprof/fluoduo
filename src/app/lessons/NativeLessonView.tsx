"use client";

/**
 * A native lesson page — real in-app content inside the CahierShell notebook
 * (Dan, 2026-07-03: "lessons native in CahierShell", not iframed HTML). One
 * scrolling cahier page: the Mémo card, the 🎲 dice trainer, the ⭐ bonus. The
 * flap tabs (→ ☰ burger when narrow) come from the shared shell.
 */

import CahierShell from "@/components/CahierShell";
import DiceTrainer, { BonusTrainer } from "@/games/dice/DiceTrainer";
import { getNativeLesson } from "@/content/lessons/native";

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--cahier-ink)] text-[10px] font-black text-white">{n}</span>
      <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">{label}</span>
      <div className="h-px flex-1 bg-[color:var(--cahier-rule)]" />
    </div>
  );
}

export default function NativeLessonView({ slug, title, unit }: { slug: string; title: string; unit: number }) {
  const lesson = getNativeLesson(slug);
  if (!lesson) return null;

  return (
    <CahierShell
      tabs={[
        { key: "gallery", label: "Lessons", emoji: "📚", href: "/lessons" },
        { key: "lesson", label: title, emoji: "🎲" },
      ]}
      active="lesson"
      crumb={`Unité ${unit}`}
    >
      <div className="mx-auto max-w-2xl space-y-4 px-2 py-4">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]" lang="fr">{title}</h1>
        <StepLabel n={1} label="Recall the idea" />
        {lesson.memo}
        <DiceTrainer config={lesson.dice} />
        <BonusTrainer items={lesson.bonus} />
      </div>
    </CahierShell>
  );
}
