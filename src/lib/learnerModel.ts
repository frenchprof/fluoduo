/**
 * The learner model behind the profile page (Design handoff, 2026-08-22).
 *
 * ONE fold, four readings, all off the same fifty-outcome spine the rest of
 * the app already uses:
 *
 *   · `redrills`      — what to practise again, and WHY it is there. Weak
 *                       (accuracy under the tier floor) and due (the SRS
 *                       interval elapsed) are DIFFERENT reasons, which is why
 *                       "What is shaky" and "Due for review" were two lists
 *                       showing the same SIO twice. One queue, tagged.
 *   · `skillCoverage` — the four `skill` values on the spine, counted. Replaces
 *                       the CEFR self-placement: in a 12-week A1 course nobody
 *                       credibly reaches A2, so "A2 DEVELOPING" was flattery
 *                       (Dan, 2026-08-22). Coverage is a regrouping of the same
 *                       per-outcome accuracy, and it answers the one question
 *                       the other sections do not: am I neglecting a skill?
 *   · `nextAction`    — the single thing to do next. A TEMPLATE filled from the
 *                       SIO's own `short` + `skill` (Dan chose "template from
 *                       SIO data — no AI"): the spine carries topic and skill,
 *                       so a table of four phrasings covers all fifty.
 *   · `goalLine`      — the pinned commitment. The fifty ARE the catalogue; what
 *                       the catalogue cannot hold is which one you are aiming at
 *                       and by when, so that is all the goal stores.
 *
 * Learner-safe: spine + content only, no roster/teacher imports (verify18/18b).
 */
import { SIOS, type Sio, type SioSkill } from "@/content/sios";
import { outcomeForItem } from "@/lib/evidence";
import { tierFor, type Progress } from "@/lib/progress";

const SIO_BY_ID = new Map(SIOS.map((s) => [s.id, s] as const));

/** Display order for the 2×2 skill grid — widest coverage first, so the two
 *  tiles that carry the course (interaction, production) lead. */
export const SKILL_ORDER: SioSkill[] = ["interaction", "production", "writing", "listening"];

export const SKILL_LABEL: Record<SioSkill, string> = {
  interaction: "Interaction",
  production: "Production",
  writing: "Writing",
  listening: "Listening",
};

/** sio id → 0..100 accuracy; absent = never attempted. Same map the heat-strip eats. */
export type Accuracy = Record<string, number | null | undefined>;

// ── Skill coverage ──────────────────────────────────────────────────────────

export type SkillCoverage = {
  skill: SioSkill;
  name: string;
  /** Outcomes of this skill the learner has attempted. */
  done: number;
  /** Outcomes of this skill on the spine. */
  total: number;
  /** Mean accuracy across the attempted ones; null when none attempted. */
  pct: number | null;
};

/**
 * Per-skill coverage off the spine's `skill` field. `done / total` is
 * attempted-out-of-existing; `pct` is the mean accuracy of the attempted ones.
 * Nothing here is new information — it is the SAME per-outcome accuracy that
 * drives the re-drill queue, grouped a second way.
 */
export function skillCoverage(acc: Accuracy): SkillCoverage[] {
  return SKILL_ORDER.map((skill) => {
    const all = SIOS.filter((s) => s.skill === skill);
    const seen = all.map((s) => acc[s.id]).filter((p): p is number => p != null);
    return {
      skill,
      name: SKILL_LABEL[skill],
      done: seen.length,
      total: all.length,
      pct: seen.length ? Math.round(seen.reduce((a, b) => a + b, 0) / seen.length) : null,
    };
  });
}

/** Outcomes attempted at all, over the fifty — the SKILLS row's summary chip. */
export function attemptedCount(acc: Accuracy): number {
  return SIOS.filter((s) => acc[s.id] != null).length;
}

// ── The re-drill queue ──────────────────────────────────────────────────────

export type Redrill = {
  sio: string;
  num: number;
  /** Phone-legible label — the tile shows this, not the full topic. */
  short: string;
  topic: string;
  /** 0..100, or null when the outcome has an SRS debt but no graded accuracy. */
  pct: number | null;
  /** The SRS interval elapsed on at least one of its items. */
  due: boolean;
  /** Accuracy under the weak floor (progress.ts owns the threshold). */
  weak: boolean;
};

/**
 * One queue, both reasons. Weak and due genuinely differ — an outcome at 77%
 * can be due (it has simply been a while) and one at 48% need not be (it was
 * seen yesterday) — so the same SIO used to appear in two sections at once.
 * Sorted worst-first: both reasons, then weak, then due; ties by accuracy.
 */
export function redrills(p: Progress, acc: Accuracy, now: number): Redrill[] {
  const dueSios = new Set<string>();
  for (const [item, srs] of Object.entries(p.itemSrs)) {
    if (srs.due > now) continue;
    const sio = outcomeForItem(item);
    if (sio) dueSios.add(sio);
  }

  const rows: Redrill[] = [];
  for (const s of SIOS) {
    const pct = acc[s.id] ?? null;
    const weak = tierFor(pct) === "weak";
    const due = dueSios.has(s.id);
    if (!weak && !due) continue;
    rows.push({ sio: s.id, num: s.num, short: s.short, topic: s.topic, pct, due, weak });
  }

  const rank = (r: Redrill) => (r.weak && r.due ? 0 : r.weak ? 1 : 2);
  return rows.sort((a, b) => rank(a) - rank(b) || (a.pct ?? 101) - (b.pct ?? 101) || a.num - b.num);
}

// ── The next action ─────────────────────────────────────────────────────────

/**
 * The four phrasings. `{topic}` is the SIO's own `short` label, lowercased —
 * the spine carries topic and skill, so four templates cover all fifty
 * outcomes. No model call: Dan chose "template from SIO data — no AI"
 * (2026-08-22). An AI would only be needed to read the learner's actual wrong
 * answers and name the specific confusion, which nothing stores today.
 */
const TEMPLATES: Record<SioSkill, (topic: string) => string> = {
  interaction: (t) => `Retrieve ${t}, then ask and answer three questions with it.`,
  production: (t) => `Retrieve ${t}, then say three sentences using it.`,
  writing: (t) => `Retrieve ${t}, then write three sentences using it.`,
  listening: (t) => `Listen for ${t}, then repeat the three you catch.`,
};

export type NextAction = {
  sio: string;
  short: string;
  text: string;
  minutes: number;
  pct: number | null;
  /** First line of "Why this?" — the number that put it at the head. */
  why: string;
  /** Second line — what the pattern of misses suggests. */
  whyDetail: string;
  /** It is a prerequisite of the pinned goal (same unit, earlier in the spine). */
  forGoal: boolean;
};

/** Roughly a minute an item, floored at a session worth doing and capped at
 *  something that still fits between classes. */
function minutesFor(itemsDue: number): number {
  return Math.min(12, Math.max(5, 5 + itemsDue));
}

/**
 * The head of the queue, preferring an outcome the pinned goal actually needs.
 * Returns null when there is nothing to re-drill — an empty queue is not a
 * failure state and the card simply does not render.
 */
export function nextAction(p: Progress, queue: Redrill[], now: number): NextAction | null {
  const goal = p.goal?.sio ? SIO_BY_ID.get(p.goal.sio) : undefined;
  const needed = (r: Redrill) => !!goal && SIO_BY_ID.get(r.sio)!.num < goal.num;
  const pick = queue.find(needed) ?? queue[0];
  if (!pick) return null;

  const s = SIO_BY_ID.get(pick.sio)!;
  const itemsDue = Object.entries(p.itemSrs).filter(
    ([item, srs]) => srs.due <= now && outcomeForItem(item) === pick.sio,
  ).length;

  const forGoal = needed(pick);
  return {
    sio: pick.sio,
    short: pick.short,
    text: TEMPLATES[s.skill](s.short.toLowerCase()),
    minutes: minutesFor(itemsDue),
    pct: pick.pct,
    why: [
      pick.pct != null ? `${pick.pct}% on ${pick.sio}` : `${pick.sio} is due`,
      forGoal ? "needed for your goal" : pick.weak && pick.due ? "weak and due" : pick.weak ? "your weakest outcome" : "the interval has elapsed",
    ].join(" · "),
    whyDetail: pick.due && !pick.weak
      ? "the interval elapsed → recall, not the rule"
      : `${itemsDue || "several"} items waiting under this outcome`,
    forGoal,
  };
}

// ── The pinned goal ─────────────────────────────────────────────────────────

export type GoalLine = {
  sio: string;
  short: string;
  /** The verbatim can-do — shown only when you open the goal, never on the pin. */
  canDo: string;
  /** "8 NOV", already upper-cased for the mono pin. */
  by: string;
  /** Days left; negative once the date has passed. */
  daysLeft: number;
};

/** The goal, resolved against the spine. Null when nothing is pinned yet. */
export function goalLine(p: Progress, now: number): GoalLine | null {
  const g = p.goal;
  if (!g?.sio) return null;
  const s = SIO_BY_ID.get(g.sio);
  if (!s) return null;
  const by = g.by ? new Date(g.by) : null;
  return {
    sio: s.id,
    short: s.short,
    canDo: s.canDo,
    by: by ? by.toLocaleDateString("en-SG", { day: "numeric", month: "short" }).toUpperCase() : "—",
    daysLeft: by ? Math.ceil((by.getTime() - now) / 86_400_000) : 0,
  };
}

/** Goal candidates: the fifty, latest first — you aim forward, so the far end
 *  of the spine is the useful end of the list. */
export function goalCandidates(): Sio[] {
  return [...SIOS].sort((a, b) => b.num - a.num);
}
