"use client";

/**
 * THE unified lesson for a deck (Dan, 2026-07-05: "Complete It, Diced Practice
 * and GramMarathon are actually components of Lessons") — one scrolling flow of
 * sections, each headed by the big salient StepLabel, numbered sequentially
 * with only the sections that apply:
 *
 *   Lire       — the native lesson's Mémo, or the deck's Mémo card
 *                (memos.tsx); atelier decks read the model dialogue
 *                (DialoguePlayer). Decks with neither skip Lire entirely
 *                (Dan, 2026-07-05: no pointing Lire at Flip It).
 *   Pratique   — Diced Practice, the one 4-level widget over the deck's own
 *                items (★ Facile → ★★ Intermédiaire → ★★★ Difficile → ⭐
 *                Bonus); it absorbed the former Débutant / Intermédiaire /
 *                Difficile drill sections (Dan's BIG ASK, 2026-07-05).
 *   Générateur — where a native lesson exists, its 🎲 trainer + ⭐ bonus: the
 *                lesson's infinite generated sentences complement the deck's
 *                finite items.
 *
 * A sticky chip row up top jumps to the rendered sections by anchor.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import type { ReactNode } from "react";
import CahierShell, { deckActivityTabs, withActive } from "@/components/CahierShell";
import DialoguePlayer from "@/app/DialoguePlayer";
import DiceTrainer, { BonusTrainer } from "@/games/dice/DiceTrainer";
import { getAtelier } from "@/content/ateliers";
import { SIOS } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { lessonsForDeck } from "@/content/lessons";
import { getNativeLesson } from "@/content/lessons/native";
import { memoForDeck } from "@/content/memos";

// The drill engine is heavy — load it only when the flow mounts.
const DicedPractice = dynamic(() => import("@/games/dice/DicedPractice"));

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
  // Atelier decks read the model dialogue instead of a Mémo — resolve the deck
  // back to its production SIO (atelier deck ids are "atelier-sio-0xx").
  const sio = SIOS.find((s) => s.collectionId === collectionId);
  const atelierLines =
    collectionId.startsWith("atelier-") || sio?.isProduction
      ? getAtelier(sio?.id ?? collectionId.slice("atelier-".length).toUpperCase())
      : undefined;
  const lire = memo ?? (atelierLines ? <DialoguePlayer lines={atelierLines} /> : undefined);
  const currentSlug = lessonSlug ?? deckLessons[0]?.slug;
  // Multi-lesson decks: ALL lessons as one toggle row — the active one
  // depressed, the others waiting (Dan, 2026-07-05). Short names: drop the
  // "(Unité 1)" / "— …" / ": …" tails to save space.
  const shortTitle = (t: string) => t.split("—")[0].split("(")[0].split(" : ")[0].trim();

  const sections: Section[] = [];
  // No Lire content at all (defensive — waves 1+2 cover every deck): skip the
  // section; numbering adjusts naturally and the flow starts at Débutant.
  if (lire) sections.push({ id: "lire", label: "Lire", node: lire });
  sections.push({ id: "pratique", label: "Pratique", node: <DicedPractice collectionId={collectionId} embedded /> });
  if (lesson) {
    sections.push({
      id: "generateur",
      label: "Générateur 🎲",
      node: (
        <div className="space-y-3">
          <DiceTrainer config={lesson.dice} />
          <BonusTrainer items={lesson.bonus} />
        </div>
      ),
    });
  }

  const shown = deckLessons.find((l) => l.slug === (lessonSlug ?? deckLessons[0]?.slug));
  const body = (
    <div className="mx-auto max-w-2xl space-y-5 px-2 py-4">
      <h1 lang="fr" className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
        📚 {shown?.title ?? deck.title}
      </h1>
      {deckLessons.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {deckLessons.map((l) =>
            l.slug === currentSlug ? (
              <span
                key={l.slug}
                aria-current="page"
                className="fluo-btn fluo-btn-sm pointer-events-none translate-y-[1px] !bg-[color:var(--cahier-hl,#eaff00)] !shadow-none font-black"
              >
                📚 {shortTitle(l.title)}
              </span>
            ) : (
              <Link key={l.slug} href={`/lessons/${l.slug}`} className="fluo-btn fluo-btn-sm">
                {shortTitle(l.title)}
              </Link>
            ),
          )}
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
