"use client";

/**
 * A landing page for ONE activity, listing every deck that supports it,
 * in the order a learner meets them.
 *
 * WHY THIS EXISTS. Seven activities had no page of their own — Flip It,
 * Complete It, GramMarathon, Dice, Say It, Compose It, Match It. You could
 * only reach Flip It *through* a deck, so there was no answer to "what can I
 * flip?". The flap rail had to expand into deck lists to compensate, and
 * clicking substituted for organisation (Dan, 2026-08-10: "how to make it less
 * clicking to reach each of those while maintaining a sense of organisation…
 * each of those should also land on a main page for that activity just like
 * how all the SIOs for a single unit have a main page").
 *
 * ELIGIBILITY IS NOT RE-DERIVED HERE. `deckActivityTabs()` already decides
 * which activities a deck supports — GramMarathon needs gap-authored items,
 * Match It needs pairs, Compose It needs a bank. Asking it, rather than
 * re-implementing the rules, is the whole lesson of gapSentence and the four
 * `deckToSio` maps: one definition, imported. A deck that gains gaps tomorrow
 * appears here automatically.
 *
 * ORDER IS THE CURRICULUM, not the alphabet. Decks are grouped by unit and
 * sequenced by taught order, using the journey key from @/lib/curriculum — the
 * same spine the units, the teacher tables and /moi now use. A learner reading
 * down this page reads down the course.
 */
import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import { deckActivityTabs } from "@/components/CahierShell";
import { CURATED } from "@/content/collections";
import { describeDeck, journeyKey } from "@/lib/labels";

export default function ActivityHub({
  activityKey,
  title,
  emoji,
  blurb,
}: {
  /** The `key` used by deckActivityTabs — "flip", "grammarathon", … */
  activityKey: string;
  title: string;
  emoji: string;
  /** One line. What this activity asks of the learner, not how it works. */
  blurb: string;
}) {
  const entries = CURATED.map((c) => {
    const tab = deckActivityTabs(c.id).find((t) => t.key === activityKey);
    // A tab without an href is a button, not a destination — skip it rather
    // than render a link to nowhere.
    if (!tab?.href) return null;
    const info = describeDeck(c.id);
    return { id: c.id, href: tab.href as string, info, sort: journeyKey(info) };
  })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.sort - b.sort);

  // Group by unit band ("Unité 0" … "Toutes unités"), preserving the sort.
  const groups: Array<{ band: string; items: typeof entries }> = [];
  for (const e of entries) {
    const band = e.info.journey?.band ?? "Autres";
    const last = groups[groups.length - 1];
    if (last && last.band === band) last.items.push(e);
    else groups.push({ band, items: [e] });
  }

  return (
    <CahierShell active={activityKey}>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="cahier-display text-3xl text-[color:var(--cahier-ink)]">
          {emoji} {title}
        </h1>
        <p className="mt-1 text-sm text-[color:var(--cahier-ink-soft)]">{blurb}</p>
        <p className="mt-1 text-xs text-[color:var(--cahier-ink-faint,#8a8a8a)]">
          {entries.length} {entries.length === 1 ? "leçon" : "leçons"} · dans l&rsquo;ordre du cours
        </p>

        {groups.length === 0 && (
          <p className="mt-6 text-sm text-[color:var(--cahier-ink-soft)]">
            Aucune leçon ne propose cette activité pour l&rsquo;instant.
          </p>
        )}

        {groups.map((g) => (
          <section key={g.band} className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wide text-[color:var(--cahier-ink-soft)]">
              {g.band}
            </h2>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {g.items.map((e) => (
                <li key={e.id}>
                  <Link
                    href={e.href}
                    className="block rounded-xl border-2 px-3 py-2 no-underline transition hover:-translate-y-0.5"
                    style={{
                      background: "var(--cahier-paper-raised, #fff)",
                      borderColor: "var(--cahier-line-strong, #ddd)",
                      boxShadow: "var(--shadow-card, 0 2px 0 rgba(0,0,0,0.06))",
                    }}
                  >
                    {e.info.sio && (
                      <span
                        className="block text-[11px] font-bold"
                        style={{ color: "var(--cahier-accent, #2f4fa8)" }}
                      >
                        {e.info.sio}
                      </span>
                    )}
                    <span
                      lang="fr"
                      className="block text-sm font-bold text-[color:var(--cahier-ink)]"
                    >
                      {e.info.topic ?? e.info.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </CahierShell>
  );
}
