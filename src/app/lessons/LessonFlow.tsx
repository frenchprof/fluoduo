"use client";

/**
 * THE unified lesson for a deck (Dan, 2026-07-05: "Complete It, Diced Practice
 * and GramMarathon are actually components of Lessons") — one scrolling flow of
 * sections, each headed by the big salient StepLabel, numbered sequentially
 * with only the sections that apply:
 *
 *   Lire          — the native lesson's Mémo, or the deck's Mémo card
 *                   (memos.tsx); decks with neither get a Flip It link-card.
 *   Débutant      — the dice MCQ (hasDicePractice) or the lesson's 🎲 trainer.
 *   Intermédiaire — Complete It (always).
 *   Difficile     — GramMarathon (gap-ready decks) or the lesson's ⭐ bonus.
 *
 * A sticky chip row up top jumps to the rendered sections by anchor.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import type { ReactNode } from "react";
import CahierShell, { deckActivityTabs, hasDicePractice, withActive } from "@/components/CahierShell";
import DiceTrainer, { BonusTrainer } from "@/games/dice/DiceTrainer";
import { CURATED } from "@/content/collections";
import { isGramMarathonReadyId } from "@/lib/collections/gramMarathonReady";
import { lessonsForDeck } from "@/content/lessons";
import { getNativeLesson } from "@/content/lessons/native";
import { memoForDeck } from "@/content/memos";

// The three drill engines are heavy — load them only when the flow mounts.
const PracticeContent = dynamic(() => import("@/app/practice/dice/[collectionId]/PracticeContent"));
const CompleteItContent = dynamic(() => import("@/app/practice/complete-it/[collectionId]/CompleteItContent"));
const GramMarathonContent = dynamic(() => import("@/app/practice/grammarathon/[collectionId]/GramMarathonContent"));

function StepLabel({ n, label }: { n: number; label: string }) {
  // Big, bold, contrasting (Dan, 2026-07-05: steps were "not salient enough
  // for the users to notice what to do where").
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--cahier-ink)] text-base font-black text-white shadow-[2px_2px_0_var(--cahier-hl,#ffe000)]">{n}</span>
      <span className="cahier-hl rounded-sm px-1.5 text-base font-black uppercase tracking-wide text-[color:var(--cahier-ink)]">{label}</span>
      <div className="h-[2px] flex-1 bg-[color:var(--cahier-ink)]/25" />
    </div>
  );
}

/** Lire fallback when a deck has no Mémo (ateliers + wave-2 decks): one
 *  prominent link-card to the deck's Flip It cards. */
function FlipItCard({ collectionId }: { collectionId: string }) {
  return (
    <div className="flex justify-center rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-6">
      <Link href={`/practice/flip-it/${collectionId}`} className="fluo-btn">
        🃏 Lire les cartes — Flip It
      </Link>
    </div>
  );
}

type Section = { id: string; label: string; node: ReactNode };

export default function LessonFlow({
  collectionId,
  lessonSlug,
  embedded = false,
}: {
  collectionId: string;
  /** Which of the deck's lessons drives Lire (+ trainer/bonus fallbacks) —
   *  decks like SIO-035's carry several; /lessons/[slug] passes its own so
   *  every authored lesson stays reachable. Default: the deck's first. */
  lessonSlug?: string;
  embedded?: boolean;
}) {
  const deck = CURATED.find((c) => c.id === collectionId);
  if (!deck) return <main className="p-6 text-[color:var(--fluo-ink)]">No deck <code>{collectionId}</code>.</main>;

  const deckLessons = lessonsForDeck(collectionId);
  const lesson = getNativeLesson(lessonSlug ?? deckLessons[0]?.slug ?? "");
  const memo = lesson?.memo ?? memoForDeck(collectionId);
  // Sibling lessons of this deck stay one tap away from Lire.
  const siblings = deckLessons.filter((l) => l.slug !== (lessonSlug ?? deckLessons[0]?.slug));

  const sections: Section[] = [
    { id: "lire", label: "Lire", node: memo ?? <FlipItCard collectionId={collectionId} /> },
  ];
  if (hasDicePractice(collectionId)) {
    sections.push({ id: "debutant", label: "Débutant", node: <PracticeContent collectionId={collectionId} embedded /> });
  } else if (lesson) {
    sections.push({ id: "debutant", label: "Débutant", node: <DiceTrainer config={lesson.dice} /> });
  }
  sections.push({ id: "intermediaire", label: "Intermédiaire", node: <CompleteItContent collectionId={collectionId} embedded /> });
  if (isGramMarathonReadyId(collectionId)) {
    sections.push({ id: "difficile", label: "Difficile", node: <GramMarathonContent collectionId={collectionId} embedded /> });
  } else if (lesson) {
    sections.push({ id: "difficile", label: "Difficile", node: <BonusTrainer items={lesson.bonus} /> });
  }

  const shown = deckLessons.find((l) => l.slug === (lessonSlug ?? deckLessons[0]?.slug));
  const body = (
    <div className="mx-auto max-w-2xl space-y-5 px-2 py-4">
      <h1 lang="fr" className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
        📚 {shown?.title ?? deck.title}
      </h1>
      {siblings.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {siblings.map((l) => (
            <Link key={l.slug} href={`/lessons/${l.slug}`} className="fluo-btn fluo-btn-sm">
              📚 {l.title}
            </Link>
          ))}
        </div>
      )}

      <div className={`sticky ${embedded ? "top-0" : "top-[58px]"} z-[5] -mx-2 flex flex-wrap gap-1.5 rounded-lg bg-[color:var(--cahier-paper,#fdfbf4)]/90 px-2 py-1.5 backdrop-blur`}>
        {sections.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => document.getElementById(`lf-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="rounded-full border-2 border-[color:var(--cahier-ink)]/25 bg-white px-2.5 py-0.5 text-xs font-bold text-[color:var(--cahier-ink)] transition hover:border-[color:var(--cahier-ink)]"
          >
            {i + 1} · {s.label}
          </button>
        ))}
      </div>

      {sections.map((s, i) => (
        <section key={s.id} id={`lf-${s.id}`} className="scroll-mt-16 space-y-3">
          <StepLabel n={i + 1} label={s.label} />
          {s.node}
        </section>
      ))}
    </div>
  );

  if (embedded) return body;
  return (
    <CahierShell tabs={withActive(deckActivityTabs(collectionId), "lesson")} active="lesson" crumb="📚 Lesson">
      {body}
    </CahierShell>
  );
}
