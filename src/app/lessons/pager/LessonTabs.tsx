"use client";

/**
 * The six tabs — Dan's own lesson framework, restored (2026-08-30).
 *
 * He sent three lessons from his original course site and said: "this
 * framework is how it should be in EVERY SIO." All three carry the same six
 * tabs, in the same order, numbered as a path:
 *
 *   🗺 0 Le parcours · 💡 1 Le concept · 📖 2 Les formes
 *   📝 3 L'exercice  · ⭐ 4 Le bonus   · 📚 5 Le lexique
 *
 * Three of them were already here under other names — the Mémo IS Les formes,
 * `dice` IS L'exercice, `bonus` IS Le bonus. This adds the three that were
 * missing and puts a frame around all six.
 *
 * THIS DOES NOT REOPEN PATCH 22. The pager exists because the imported HTML
 * put "44 tappable controls before the first answer, two identical difficulty
 * pickers, three 🎲 roll buttons, a drill that never ended" in front of a
 * learner. That fix stands, and the distinction that keeps both true is:
 *
 *     the tabs are the LESSON's navigation.
 *     one card at a time is the EXERCISE's.
 *
 * So these tabs are FRONT MATTER: they exist only while `asked` is false. The
 * moment a learner picks an entry level, the tabs go and the pager takes the
 * full screen, one card at a time, exactly as before. Nothing here is
 * reachable mid-run.
 *
 * WHY THE TABS ARE NUMBERED. Not decoration — Dan's own exercise card reads
 * "Step 3 of 5: Practice", so the order is a claim about sequence: understand
 * why (concept) before how (formes) before doing it (exercice). The numbers
 * encode that, which is the only thing that earns a numbered marker.
 *
 * AN EMPTY TAB SAYS SO. `concept` is optional while 47 of them are drafted;
 * a lesson without one renders the tab with the reason it is empty, rather
 * than hiding the tab. A hidden gap is a gap nobody fixes.
 */
import { useState, type ReactNode } from "react";
import type { Collection } from "@/lib/collections/schema";
import type { Sio } from "@/content/sios";
import type { LessonConcept, NativeLesson } from "@/content/lessons/native/types";

type TabKey = "parcours" | "concept" | "formes" | "exercice" | "bonus" | "lexique";

const TABS: { key: TabKey; emoji: string; label: string; does: string }[] = [
  // `does` earns the path list its place. Without it that list is the tab
  // strip retyped one inch lower, which is exactly what Dan's litmus test
  // deletes: text that, removed, costs the learner nothing.
  { key: "parcours", emoji: "🗺", label: "Le parcours", does: "what you will be able to do" },
  { key: "concept", emoji: "💡", label: "Le concept", does: "why French does it this way" },
  { key: "formes", emoji: "📖", label: "Les formes", does: "the forms themselves" },
  { key: "exercice", emoji: "📝", label: "L'exercice", does: "use them, one card at a time" },
  { key: "bonus", emoji: "⭐", label: "Le bonus", does: "the other direction — English to French" },
  { key: "lexique", emoji: "📚", label: "Le lexique", does: "every word in this lesson" },
];

/** Section heading inside a panel. The panels are read, not scanned, so they
 *  get ordinary prose hierarchy rather than the app's band furniture. */
function H({ children }: { children: ReactNode }) {
  return (
    <p className="fluo-label mt-4 text-[color:var(--fluo-ink-soft)] first:mt-0">{children}</p>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="pb-4 pt-3 text-[15px] leading-relaxed text-[color:var(--cahier-ink)]">{children}</div>;
}

/** A tab with nothing behind it yet. Names what is missing and who owes it,
 *  because "coming soon" tells a learner nothing and tells us less. */
function Empty({ what }: { what: string }) {
  return (
    <Panel>
      <p className="rounded-xl border-2 border-dashed border-[color:var(--cahier-rule)] p-4 text-center text-sm font-bold text-[color:var(--fluo-ink-soft)]">
        {what}
      </p>
    </Panel>
  );
}

/* ── 0 · Le parcours ───────────────────────────────────────────────────────
 * Generated, not authored. Every SIO record already carries `canDo` (the
 * learner-facing goal) and `competence` (the measurable criteria), so the tab
 * Dan opens with — "By the end of this module, you will correctly use…" — is
 * a rendering job, not a writing one. */
function Parcours({ sio, here }: { sio?: Sio; here: TabKey }) {
  if (!sio) {
    return <Empty what="This lesson is not wired to a curriculum objective, so there is no parcours to show." />;
  }
  return (
    <Panel>
      <H>By the end of this lesson</H>
      <p className="text-base font-bold">{sio.canDo}</p>
      <H>What that means exactly</H>
      <p>{sio.competence}</p>
      <H>The path</H>
      <ol className="mt-1 space-y-2">
        {TABS.map((t, n) => (
          <li key={t.key} className="flex items-baseline gap-2.5">
            <span className="shrink-0 font-mono text-xs font-bold text-[color:var(--fluo-ink-soft)]">{n}</span>
            <span aria-hidden>{t.emoji}</span>
            <span>
              <span className={t.key === here ? "font-black" : "font-bold"}>{t.label}</span>
              <span className="text-[color:var(--fluo-ink-soft)]"> — {t.does}</span>
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ── 1 · Le concept ────────────────────────────────────────────────────────
 * The slots are Dan's, read off his own concept tabs — see LessonConcept in
 * native/types.ts for which are required and why. */
function Concept({ c }: { c?: LessonConcept }) {
  if (!c) {
    return <Empty what="Le concept has not been written for this lesson yet. Les formes has the rules in the meantime." />;
  }
  return (
    <Panel>
      <h2 className="cahier-display text-lg font-black leading-tight">{c.subtitle}</h2>
      <p className="mt-2">{c.contrast}</p>

      <H>One question</H>
      <p className="text-base font-bold">{c.question}</p>
      <H>The answer</H>
      <p>{c.answer}</p>

      {c.pitfall && c.pitfall.length > 0 && (
        <>
          <H>⚠️ The common pitfall</H>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-[color:var(--fluo-ink-soft)]">
                  <th className="py-1 pr-3 font-bold" />
                  <th className="py-1 pr-3 font-bold text-[color:var(--drill-bad-mid)]">✗ English logic</th>
                  <th className="py-1 font-bold text-[color:var(--drill-ok)]">✓ French logic</th>
                </tr>
              </thead>
              <tbody>
                {c.pitfall.map((row, n) => (
                  <tr key={n} className="border-t border-[color:var(--cahier-rule)]">
                    <td className="py-1.5 pr-3 font-bold">{row.label}</td>
                    <td className="py-1.5 pr-3 text-[color:var(--drill-bad-mid)] line-through">{row.wrong}</td>
                    <td className="py-1.5 font-bold text-[color:var(--drill-ok)]">{row.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {c.flow && c.flow.length > 0 && (
        <>
          <H>How to decide</H>
          <div className="overflow-x-auto rounded-xl bg-[color:var(--cahier-paper-raised)] p-3">
            {c.flow.map((line, n) => (
              <p
                key={n}
                className="whitespace-pre font-mono text-[13px] leading-6"
                style={{ paddingInlineStart: `${line.depth * 1.4}rem` }}
              >
                {line.text}
              </p>
            ))}
          </div>
        </>
      )}

      {c.check && c.check.length > 0 && (
        <>
          <H>✅ Before you go on</H>
          <div className="flex flex-col gap-2">
            {c.check.map((x, n) => (
              // <details> rather than state: the answer must stay hidden until
              // asked for, and a native disclosure is keyboard- and
              // screen-reader-correct for free.
              <details key={n} className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-raised)] p-3">
                <summary className="cursor-pointer font-bold">{x.q}</summary>
                <p className="mt-2 text-[color:var(--fluo-ink-soft)]">{x.a}</p>
              </details>
            ))}
          </div>
        </>
      )}

      {c.inShort && (
        <>
          <H>The whole system</H>
          <p>{c.inShort}</p>
        </>
      )}

      <p className="mt-4 rounded-xl border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-3 font-bold">
        If you remember only one thing: {c.remember}
      </p>
    </Panel>
  );
}

/* ── 4 · Le bonus ──────────────────────────────────────────────────────────
 * The reverse direction, which the run already uses as its last card kind.
 * Here it is browsable: the pairs, answers hidden until asked for. */
function Bonus({ pairs }: { pairs?: NativeLesson["bonus"] }) {
  if (!pairs?.length) return <Empty what="No bonus sentences for this lesson." />;
  return (
    <Panel>
      <H>Say it in French</H>
      <div className="flex flex-col gap-2">
        {pairs.map((b) => (
          <details key={b.en} className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-raised)] p-3">
            <summary className="cursor-pointer font-bold">{b.en}</summary>
            <p lang="fr" className="mt-2 font-black text-[color:var(--cahier-ink)]">{b.fr}</p>
          </details>
        ))}
      </div>
    </Panel>
  );
}

/**
 * A NOUN HAS FORMS, AND ITS ARTICLE OFTEN HIDES THEM.
 *
 * Dan, 30-31 Aug, settling the Tier 2 shape: "a vocab list with gender and so
 * on, as seen in SpecuLearn." Sorting `aliments` by gender gives 23 masculine,
 * 10 feminine, and NINE whose article says nothing — `de l'` before a vowel and
 * `des` in the plural. A learner who only ever meets « de l'eau » is never told
 * that `eau` is feminine, and that is the gap the column exists to close.
 *
 * `gender` has been in the Item schema all along and NO deck populated it — a
 * dead field. `aliments` is the first to carry it. Where a deck has not, the
 * column shows nothing rather than guessing from the article, because guessing
 * from the article is exactly the mistake the learner is making.
 */
const GENDER_LABEL: Record<string, { short: string; full: string; hue: string }> = {
  m: { short: "m", full: "masculine", hue: "var(--gram-masc)" },
  f: { short: "f", full: "feminine", hue: "var(--gram-fem)" },
  mpl: { short: "m pl", full: "masculine plural", hue: "var(--gram-masc)" },
  fpl: { short: "f pl", full: "feminine plural", hue: "var(--gram-fem)" },
};

/** True when the item's own French gives the gender away, so the column is
 *  only telling the learner something they could not already see. */
function articleShowsGender(fr: string): boolean {
  return /^(le|la|un|une|du|de la)\s/i.test(fr.trim());
}

/* ── 5 · Le lexique ────────────────────────────────────────────────────────
 * The deck's words, as a reveal table.
 *
 * NOT `CuratedDeckTable`. That component is the deck PAGE — a thousand lines
 * of buckets, notes, sorting, selection and test mode — and importing it here
 * would put all of it in every lesson route's bundle for a tab most learners
 * open once. `output: "export"` means that weight is paid at build time by
 * every lesson, not lazily by the few who look.
 *
 * So this is the reading half only, which is what Dan's lexique tab does:
 * hide a column, reveal cells one at a time. The full table with its buckets
 * and notes stays one tap away at /decks/[id], where it already lives. */
function Lexique({ deck }: { deck?: Collection }) {
  const [hide, setHide] = useState<"none" | "fr" | "en">("none");
  const [shown, setShown] = useState<Set<string>>(new Set());
  if (!deck?.items?.length) {
    return <Empty what="This lesson has no deck, so there is no lexique." />;
  }
  const reveal = (id: string) => setShown((s) => new Set(s).add(id));
  const hiddenCount = deck.items.filter((i) => i.gender && !articleShowsGender(i.fr)).length;
  const cell = (id: string, col: "fr" | "en", text: string, lang?: string) => {
    // A hidden cell is a QUESTION, so it is a button — tapping it is the
    // answer. Revealed cells stop being interactive rather than staying
    // clickable buttons that do nothing.
    if (hide !== col || shown.has(id)) {
      return <span lang={lang}>{text}</span>;
    }
    return (
      <button
        type="button"
        onClick={() => reveal(id)}
        className="w-full rounded-md border-2 border-dashed border-[color:var(--cahier-rule)] py-0.5 text-center text-[color:var(--fluo-ink-soft)]"
      >
        <span className="sr-only">Reveal</span>
        <span aria-hidden>· · ·</span>
      </button>
    );
  };
  return (
    <Panel>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {([["none", "Show both"], ["en", "Hide English"], ["fr", "Hide French"]] as const).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => { setHide(k); setShown(new Set()); }}
            aria-pressed={hide === k}
            className={[
              "rounded-lg border-2 px-2.5 py-1 text-xs font-black",
              hide === k
                ? "border-[color:var(--cahier-ink)] bg-[color:var(--fam-ink)] text-white"
                : "border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-raised)] text-[color:var(--fluo-ink-soft)]",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {deck.items.map((it) => {
              const g = it.gender ? GENDER_LABEL[it.gender] : undefined;
              const hidden = !!g && !articleShowsGender(it.fr);
              return (
                <tr key={it.id} className="border-t border-[color:var(--cahier-rule)]">
                  <td className="w-8 py-1.5 text-lg" aria-hidden>{it.emoji ?? ""}</td>
                  <td className="py-1.5 pr-3 font-bold text-[color:var(--cahier-ink)]">
                    {cell(it.id, "fr", it.fr, "fr")}
                  </td>
                  {/* The gender column. Emphasised only where the article does
                      NOT already show it — those are the words a learner would
                      otherwise never be told, and the reason the column is
                      here rather than being left to the article. */}
                  <td className="w-12 py-1.5 pr-3 text-center">
                    {g && (
                      <span
                        title={hidden ? `${g.full} — the article does not show it` : g.full}
                        className={[
                          "inline-block rounded px-1.5 py-0.5 text-[11px] font-black",
                          hidden ? "text-white" : "",
                        ].join(" ")}
                        style={hidden
                          ? { background: g.hue }
                          : { color: g.hue }}
                      >
                        {g.short}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 text-[color:var(--fluo-ink-soft)]">
                    {cell(it.id, "en", it.en ?? "")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {hiddenCount > 0 && (
        <p className="mt-3 text-xs font-bold text-[color:var(--fluo-ink-soft)]">
          <span className="mr-1.5 inline-block rounded bg-[color:var(--gram-fem)] px-1.5 py-0.5 text-[11px] font-black text-white">f</span>
          {hiddenCount} of these {deck.items.length} words hide their gender behind{" "}
          <i lang="fr">de l&rsquo;</i> or <i lang="fr">des</i> — the article will not tell you.
        </p>
      )}
      <p className="mt-2 text-xs font-bold text-[color:var(--fluo-ink-soft)]">
        {deck.items.length} words · the full table, with your notes and review marks, is on the deck page.
      </p>
    </Panel>
  );
}

export default function LessonTabs({
  sio,
  deck,
  concept,
  memo,
  bonus,
  exercise,
  lexique,
}: {
  sio?: Sio;
  deck?: Collection;
  concept?: LessonConcept;
  /** Les formes — the Mémo, exactly as the run's rule card renders it. */
  memo?: ReactNode;
  bonus?: NativeLesson["bonus"];
  /** L'exercice — the entry-level chooser. Picking a level ends the tabs. */
  exercise: ReactNode;
  /** Le lexique — the deck table, passed in so this file stays free of the
   *  decks route's imports. */
  lexique?: ReactNode;
}) {
  // Opens on L'exercice, NOT on Le parcours. A learner returning to a lesson
  // they know wants the exercise, and Dan's own path is a path, not a gate —
  // his tab bar lets you start anywhere. Reading order is offered, not forced.
  const [tab, setTab] = useState<TabKey>("exercice");

  return (
    <div className="pt-1">
      <div role="tablist" aria-label="Lesson sections" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2">
        {TABS.map((t, n) => {
          const on = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => setTab(t.key)}
              className={[
                "flex shrink-0 items-center gap-1.5 rounded-xl border-2 px-2.5 py-1.5 text-[13px] font-black transition",
                on
                  ? "border-[color:var(--cahier-ink)] bg-[color:var(--fam-ink)] text-white"
                  : "border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-raised)] text-[color:var(--fluo-ink-soft)]",
              ].join(" ")}
            >
              <span className="font-mono text-[10px] opacity-70">{n}</span>
              <span aria-hidden>{t.emoji}</span>
              <span className="whitespace-nowrap">{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === "parcours" && <Parcours sio={sio} here={tab} />}
      {tab === "concept" && <Concept c={concept} />}
      {tab === "formes" && (memo ? <Panel>{memo}</Panel> : <Empty what="No Mémo for this lesson." />)}
      {tab === "exercice" && <Panel>{exercise}</Panel>}
      {tab === "bonus" && <Bonus pairs={bonus} />}
      {tab === "lexique" && (lexique ?? <Lexique deck={deck} />)}
    </div>
  );
}
