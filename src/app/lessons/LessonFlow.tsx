"use client";

/**
 * THE unified lesson for a deck (Dan, 2026-07-05: "Complete It, Diced Practice
 * and GramMarathon are actually components of Lessons") — one scrolling flow of
 * sections, each headed by the big salient StepLabel, numbered sequentially
 * with only the sections that apply:
 *
 *   Lire          — the native lesson's Mémo (when one exists) + a compact
 *                   read table of the deck (fr 🔊 | en).
 *   Débutant      — the dice MCQ (hasDicePractice) or the lesson's 🎲 trainer.
 *   Intermédiaire — Complete It (always).
 *   Difficile     — GramMarathon (gap-ready decks) or the lesson's ⭐ bonus.
 *
 * A sticky chip row up top jumps to the rendered sections by anchor.
 */

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import CahierShell, { deckActivityTabs, hasDicePractice, withActive } from "@/components/CahierShell";
import DiceTrainer, { BonusTrainer } from "@/games/dice/DiceTrainer";
import { CURATED } from "@/content/collections";
import { displayEn, displayFr, practiceItems } from "@/lib/collections/display";
import { isGramMarathonReadyId } from "@/lib/collections/gramMarathonReady";
import { lessonsForDeck } from "@/content/lessons";
import { getNativeLesson } from "@/content/lessons/native";
import { speak } from "@/games/letris/speech";
import type { Collection } from "@/lib/collections/schema";

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

/** Compact read table: fr (bold, spoken form, 🔊) | en. Fragments hidden the
 *  same way the drill surfaces hide them (practiceItems). */
function ReadTable({ deck }: { deck: Collection }) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {practiceItems(deck).map((it) => {
            const fr = displayFr(it, deck);
            return (
              <tr key={it.id} className="border-b border-[color:var(--cahier-rule)]/60 last:border-b-0">
                <td className="w-8 px-2 py-1.5 text-center">
                  <button type="button" onClick={() => speak(fr, "fr-FR")} className="opacity-70 transition hover:opacity-100" title="Écouter" aria-label={`Écouter : ${fr}`}>🔊</button>
                </td>
                <td lang="fr" className="px-2 py-1.5 font-bold text-[color:var(--cahier-ink)]">
                  {it.emoji && <span aria-hidden className="mr-1">{it.emoji}</span>}
                  {fr}
                </td>
                <td className="px-2 py-1.5 text-[color:var(--cahier-ink-soft)]">{displayEn(it)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type Section = { id: string; label: string; node: ReactNode };

export default function LessonFlow({ collectionId, embedded = false }: { collectionId: string; embedded?: boolean }) {
  const deck = CURATED.find((c) => c.id === collectionId);
  if (!deck) return <main className="p-6 text-[color:var(--fluo-ink)]">No deck <code>{collectionId}</code>.</main>;

  const lessonMeta = lessonsForDeck(collectionId)[0];
  const lesson = lessonMeta ? getNativeLesson(lessonMeta.slug) : undefined;

  const sections: Section[] = [
    {
      id: "lire",
      label: "Lire",
      node: (
        <div className="space-y-3">
          {lesson?.memo}
          <ReadTable deck={deck} />
        </div>
      ),
    },
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

  const body = (
    <div className="mx-auto max-w-2xl space-y-5 px-2 py-4">
      <h1 lang="fr" className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
        📚 {lessonMeta?.title ?? deck.title}
      </h1>

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
