/**
 * The three Révision compilations as native MIXED trainers: each rolls a
 * random question from its unit's already-converted lesson generators —
 * interleaved retrieval over the whole unit instead of the old static
 * recap HTML. The memo is just the map of what's in the mix (each links
 * to its full lesson); the drill itself is the revision.
 */
import Link from "next/link";
import type { NativeLesson } from "./types";
import { sePresenterLesson } from "./se-presenter";
import { negationLesson } from "./negation";
import { conjugaisonU1Lesson } from "./conjugaison-u1";
import { questionsOuiNonLesson } from "./questions-oui-non";
import { motsInterrogatifsLesson } from "./mots-interrogatifs";
import { articlesPaysLesson } from "./articles-pays";
import { allerLesson } from "./aller";
import { quandLesson } from "./quand";
import { prepositionsLesson } from "./prepositions";
import { partitifsLesson } from "./partitifs";
import { mangerBoireLesson } from "./manger-boire";
import { futurProcheLesson } from "./futur-proche";
import { frequenceLesson } from "./frequence";
import { demonstratifsLesson } from "./demonstratifs";

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

/** n bonus items from each source, interleaved (static slice — no randomness at module scope). */
const bonusMix = (sources: NativeLesson[], n: number) =>
  sources.flatMap((l) => l.bonus.slice(0, n));

function mixMemo(title: string, sources: { slug: string; label: string }[]) {
  return (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">{title}</h2>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((s) => (
          <Link key={s.slug} href={`/lessons/${s.slug}`}
            className="rounded-full border border-[color:var(--cahier-rule)] bg-white px-2.5 py-0.5 text-[13px] font-bold text-[color:var(--cahier-ink)] hover:bg-[color:var(--cahier-hl)]/25">
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function mixLesson(slug: string, title: string, sources: { lesson: NativeLesson; label: string }[]): NativeLesson {
  return {
    slug,
    memo: mixMemo(title, sources.map((s) => ({ slug: s.lesson.slug, label: s.label }))),
    dice: {
      instruction: "Questions from the whole unit, mixed — one roll, any lesson.",
      newQuestion: () => pick(sources).lesson.dice.newQuestion(),
    },
    bonus: bonusMix(sources.map((s) => s.lesson), 2),
  };
}

export const revisionU1Lesson = mixLesson("revision-u1", "Révision — Unité 1, tout mélangé", [
  { lesson: sePresenterLesson, label: "Se présenter" },
  { lesson: conjugaisonU1Lesson, label: "s'appeler · être · avoir" },
  { lesson: negationLesson, label: "La négation" },
  { lesson: questionsOuiNonLesson, label: "Questions oui/non" },
  { lesson: motsInterrogatifsLesson, label: "Mots interrogatifs" },
  { lesson: articlesPaysLesson, label: "Articles des pays" },
]);

export const revisionU3U4Lesson = mixLesson("revision-u3u4", "Révision — Unités 3 & 4, tout mélangé", [
  { lesson: prepositionsLesson, label: "Prépositions de & à" },
  { lesson: allerLesson, label: "Aller à + lieu" },
  { lesson: quandLesson, label: "L'heure" },
  { lesson: motsInterrogatifsLesson, label: "Mots interrogatifs" },
  { lesson: partitifsLesson, label: "Partitifs" },
]);

export const revisionU4Lesson = mixLesson("revision-u4", "Révision — Unité 4, tout mélangé", [
  { lesson: partitifsLesson, label: "Partitifs" },
  { lesson: mangerBoireLesson, label: "Manger & boire" },
  { lesson: futurProcheLesson, label: "Futur proche" },
  { lesson: frequenceLesson, label: "Fréquence" },
  { lesson: demonstratifsLesson, label: "Démonstratifs" },
]);
