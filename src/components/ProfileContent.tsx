"use client";
/**
 * THE profile page — one learner model (Design handoff, 2026-08-22).
 *
 * WHAT THIS REPLACES. /profil was the economy (level ring, XP bar, badge grid,
 * gem boutique) and /moi was the learning (hero chips, heat-strip, four
 * segments). Two profile pages, and the one a learner opens to ask "what do I
 * do now?" answered with a level ring. Dan's call, 2026-08-22: merge into ONE
 * page, the self-regulated-learning loop IS the page, and the economy is
 * demoted to a single strip.
 *
 * THE SHAPE. Two things are always visible because they are the two you act
 * on — the pinned goal and the single next action. Everything else is the
 * RECORD, collapsed, one section open at a time, each row carrying its own
 * summary value on the right so the whole state reads without opening
 * anything.
 *
 * THE FIVE ROWS are Dan's rhyming spine (2026-08-22). The plain word used to
 * follow the rhyme in brackets — FRILLS (showcase), ILLS (problems noted),
 * THRILLS (rewards). Dan, 2026-09-11: *"am trying to explore deleting the
 * english in brackets and putting an emoji at the start of the line instead"*.
 * So the bracket goes and a glyph leads:
 *
 *   ⏱️ RE-DRILLS · 🧮 SKILLS · 🎞️ FRILLS · 🩹 ILLS · 💫 THRILLS
 *
 * Each glyph is unused anywhere else in the app — the one-glyph-one-meaning
 * rule of 2026-09-09, which is why this is not ⏰ (already in use), 🔄 (Revise),
 * 🎁 or ✨ (both taken) — and why THRILLS is not 🏅: the badge count on that
 * very row is 🎖️, a different codepoint that is all but indistinguishable at
 * 15px, so the row would have led with a look-alike of one of its own marks.
 *
 * WHAT WENT, AND WHY (all Dan, same day):
 *   · "Where you stand" / CEFR self-placement — in a 12-week A1 course nobody
 *     credibly reaches A2, so "A2 DEVELOPING" was flattery. Replaced by
 *     per-skill SIO coverage, which is the same accuracy grouped a second way.
 *   · "Due for review" and "What is shaky" were two lists showing the same
 *     outcome twice. One queue now, sorted by both reasons.
 *   · The weekly commitment ("2/3") — unlabelled and therefore unreadable.
 *   · N-levels — "we don't need levels lah". The ranks live on in economy.ts
 *     for the leaderboard; nothing on this page shows them.
 *   · Progress bars, full-width buttons, explanation prose — the litmus test
 *     (AGENTS.md) plus "SPACE-OCCUPYING PROGRESS BARS".
 *
 * Section accents come from globals.css `.fluo-h-*` (teal / violet / orange /
 * amber) and `--fluo-hl` for the one next action; accuracy keeps `--tier-*`,
 * deliberately a different scale so "weak" never matches a section's identity.
 * Tokens only — verify19b's raw-hex ratchet.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SIOS } from "@/content/sios";
import { buyUnlock, loadProgress, type Progress } from "@/lib/progress";
import { useAuthUser } from "@/lib/firebase/auth";
import { loadLedger } from "@/lib/activityLedger";
import { EXPERT_UNLOCKS } from "@/lib/economy";
import { outcomeAccuracy, tierToken } from "@/lib/outcomeRows";
import {
  attemptedCount, nextAction, redrills, skillCoverage,
  type Accuracy,
} from "@/lib/learnerModel";
import { addBlocker, leftThisWeek, loadBlockers, weekKey, type Blocker } from "@/lib/blockers";
import HeatStrip, { type HeatValues } from "@/components/HeatStrip";
import Rewards from "@/components/Rewards";

type Resp = { item: string; status: string; activityId: string; ts: number; outcomeId?: string | null };

/** The five rows. `hue` is the globals.css card-accent class; THRILLS is the
 *  deliberately colourless one — rewards are the demoted section. */
const ROWS = [
  { key: "redrills", emoji: "⏱️", label: "RE-DRILLS", hue: "fluo-h-1" },
  { key: "skills", emoji: "🧮", label: "SKILLS", hue: "fluo-h-3" },
  { key: "frills", emoji: "🎞️", label: "FRILLS", hue: "fluo-h-4" },
  { key: "ills", emoji: "🩹", label: "ILLS", hue: "fluo-h-2" },
  { key: "thrills", emoji: "💫", label: "THRILLS", hue: "" },
] as const;
type RowKey = (typeof ROWS)[number]["key"];

/** The grid's key: one word per colour, in the order a learner meets them.
 *  The tokens are HeatStrip's own (`--tier-*`, `--cahier-line`), never a
 *  hand-picked hex — verify19b's raw-hex ratchet, and so the key cannot say a
 *  different green from the one on the tiles. */
/**
 * WHICH ROWS APPEAR AT ALL (Dan, 2026-09-12). Three of the five were on the
 * page with nothing in them, each for a different reason, and he ruled on each:
 *
 *   FRILLS   "should not appear in here until the student has completed one
 *            creation (either ChaTutor or ComposeIt)"
 *   ILLS     "is unclear what this is about - i suggest also to hide until we
 *            figure out to use it"
 *   THRILLS  "Don't show this section until there is something to show for it"
 *
 * This is the collapse rule's harder sibling: that one folds away what earns
 * its place but not its position; this removes what has not earned a place at
 * all. A row that always reads EMPTY teaches a learner only that the app has
 * a hole in it.
 *
 * KNOWN GAP, not an oversight: a ChaTutor conversation is invisible here.
 * `activityLedger`'s PREFIX_TO_KEY maps ComposeIt (`compose`) and not ChaTutor,
 * so "one creation" can only be detected for half of what Dan named. Wiring
 * ChaTutor into the ledger is its own change; until then FRILLS opens on a
 * ComposeIt creation alone.
 */
function rowsToShow(p: Progress, hasCreation: boolean): typeof ROWS[number][] {
  const deck = EXPERT_UNLOCKS.some((u) => (p.unlocks ?? []).includes(u.id) || p.gems >= u.cost);
  return ROWS.filter((r) => {
    // ...WITH ONE ADDITION THE SAME DAY. Dan moved the expert game deck into
    // FRILLS ("leave the expert deck under frills"), and the shelf it came
    // from is gone — so a FRILLS hidden until a first creation would be a
    // deck nobody can buy. It therefore also opens once the deck is OWNED or
    // AFFORDABLE, which is the same test the row was given in the first
    // place: never open on nothing, always open on something you can act on.
    if (r.key === "frills") return hasCreation || deck;
    if (r.key === "ills") return false;
    // SKILLS dropped (Dan, 2026-09-12: "drop skills"). He had asked the day
    // before for it to list the skills a learner has actually acquired; shown
    // the row as it stands — four tiles reading 0 / 21, 0 / 26, 0 / 2, 0 / 1
    // for an account 21 goals in, because it counts answers logged and not
    // goals done — he dropped it instead. No condition brings it back: unlike
    // FRILLS, which returns on a first creation, this one waits on a decision.
    if (r.key === "skills") return false;
    if (r.key === "thrills") return p.badges.length > 0;
    return true;
  });
}

const LEGEND: { word: string; token: string; ring?: boolean }[] = [
  { word: "STRONG", token: "var(--tier-good)" },
  { word: "MIXED", token: "var(--tier-medium)" },
  { word: "WEAK", token: "var(--tier-weak)" },
  { word: "NEW", token: "var(--cahier-line)" },
  { word: "DONE", token: "", ring: true },
];


const INK = "var(--cahier-ink)";
const SOFT = "var(--cahier-ink-soft)";
const LINE = "var(--cahier-line-strong)";
const PAPER = "var(--cahier-paper-raised)";
const HL = "var(--fluo-hl)";

/** The Index row for an outcome — one place, every activity for it. */
const indexHref = (sio: string) => {
  const s = SIOS.find((x) => x.id === sio);
  return s ? `/unit/${s.unit}#${s.id}` : "/map";
};

export default function ProfileContent() {
  const [p, setP] = useState<Progress | null>(null);
  const [open, setOpen] = useState<RowKey | null>("redrills");
  const [why, setWhy] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [resp, setResp] = useState<Resp[] | null>(null);
  const [ledgerAcc, setLedgerAcc] = useState<Accuracy>({});
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [draft, setDraft] = useState("");
  // One clock read, shared by every derivation on the page — two calls a
  // render could straddle midnight and disagree about what is due.
  const [now, setNow] = useState<number | null>(null);

  const user = useAuthUser();

  // Device state is an EXTERNAL store: localStorage, plus the
  // `fluolingo:progress-updated` event every write already broadcasts. So this
  // subscribes rather than reading once — finishing a drill in another tab, or
  // buying a cosmetic in the THRILLS strip below, repaints the page.
  useEffect(() => {
    const sync = () => {
      setP(loadProgress());
      setBlockers(loadBlockers());
      setNow(Date.now());
      const sum: Record<string, { r: number; w: number }> = {};
      for (const bySio of Object.values(loadLedger())) for (const [sio, t] of Object.entries(bySio)) {
        const s = (sum[sio] ??= { r: 0, w: 0 });
        s.r += t.right; s.w += t.wrong;
      }
      const acc: Accuracy = {};
      for (const [sio, s] of Object.entries(sum)) if (s.r + s.w > 0) acc[sio] = Math.round((100 * s.r) / (s.r + s.w));
      setLedgerAcc(acc);
    };
    sync();
    window.addEventListener("fluolingo:progress-updated", sync);
    return () => window.removeEventListener("fluolingo:progress-updated", sync);
  }, []);

  // Auth resolves asynchronously: undefined = still resolving, null = signed out.
  useEffect(() => {
    if (user === undefined) return;
    void (async () => {
      try {
        const uid = user?.uid;
        if (!uid) return;
        const [{ getDocs, collection }, { db }] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase/db"),
        ]);
        const snap = await getDocs(collection(db, "users", uid, "responses"));
        const rows: Resp[] = [];
        snap.forEach((d) => {
          const x = d.data() as { item?: string; status?: string; activityId?: string; timestamp?: { toMillis?: () => number }; outcomeId?: unknown };
          rows.push({
            item: String(x.item ?? ""),
            status: String(x.status ?? ""),
            activityId: String(x.activityId ?? ""),
            ts: x.timestamp?.toMillis?.() ?? 0,
            outcomeId: typeof x.outcomeId === "string" ? x.outcomeId : null,
          });
        });
        setResp(rows);
      } catch {
        // The device view below is the fallback — nothing to announce.
      }
    })();
  }, [user]);

  // Signed in: the answer log. Signed out: this device's ledger. Same shape.
  const acc = useMemo<Accuracy>(() => (resp ? outcomeAccuracy(resp) : ledgerAcc), [resp, ledgerAcc]);

  /** Has the learner made something? ComposeIt tallies under `compose` in the
   *  ledger; a single attempt on any deck counts as one creation. */
  const hasCreation = useMemo(() => {
    const byDeck = loadLedger()["compose"];
    return !!byDeck && Object.values(byDeck).some((t) => t.right + t.wrong > 0);
    // `ledgerAcc` is not read here — it is the SIGNAL. It is set by the same
    // effect that reads localStorage, so it is the only thing in this component
    // that changes when the ledger does, and dropping it would freeze this at
    // whatever the ledger held on mount. The rule cannot see a dependency that
    // exists to time a re-read rather than to be read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerAcc]);
  const queue = useMemo(() => (p && now ? redrills(p, acc, now) : []), [p, acc, now]);
  const skills = useMemo(() => skillCoverage(acc), [acc]);
  const next = useMemo(() => (p && now ? nextAction(p, queue, now) : null), [p, queue, now]);
  const doneSet = useMemo(() => new Set(p?.doneSios ?? []), [p]);

  if (!p || now === null) return <p className="px-1 py-6 text-sm" style={{ color: SOFT }}>Loading your progress…</p>;

  const attempted = attemptedCount(acc);
  const left = leftThisWeek(blockers, now);
  const thisWeek = blockers.filter((b) => b.week === weekKey(now)).slice(-1)[0];

  const toggle = (k: RowKey) => setOpen((cur) => (cur === k ? null : k));

  const summaryOf = (k: RowKey): string =>
    k === "redrills" ? `${queue.length} SIOS`
      : k === "skills" ? `${attempted} / ${SIOS.length}`
      : k === "frills" ? `${EXPERT_UNLOCKS.filter((u) => (p.unlocks ?? []).includes(u.id)).length} / ${EXPERT_UNLOCKS.length} DECKS`
      : `${Math.min(blockers.filter((b) => b.week === weekKey(now)).length, 3)} / 3`;

  return (
    <div className="profile-page pb-8">
      {/* THE BAND MOVED TO THE SHELL (Dan, 1 Sep: "can you see that it is
          vertically not visually uniform?"). It was drawn HERE, inside the
          content well, and pulled back out with negative margins — which put
          it 20px lower than every other band on the site, because the well is
          padded `py-5` and the shell's band sits above that padding. Measured:
          77px down the page against 57 everywhere else.

          It can move now because it no longer needs anything only this
          component knows: the title became the activity's name ("Moi") this
          morning and the outcome count came off the strip with every other
          trailing number. profil/page.tsx and moi/page.tsx pass it. */}
      {/* THE COURSE LINE AND THE PINNED-GOAL STRIP ARE GONE (Dan, 2026-09-11:
          "There is no need for the black strip and the words above the black
          strip. Start directly after the 4 tabs with REDRILLS"). The line read
          « Moi · LAF1201 · A1 · GOAL 22 / 50 »; the strip under it was the
          black bar that opened the goal picker. The panel opens on the first
          thing a learner acts on instead. */}
      {/* The body keeps the reading width the page wrapper used to give it —
          the band must be outside it, or a band centred inside 768px is not a
          band that reaches the paper. */}
      <div className="mx-auto max-w-3xl">

      {/* Wide: the two things you act on pin to the left, the record collapses
          beside them. Phone: one column, the same order. */}
      <div className="grid items-start gap-0 lg:grid-cols-[340px_1fr] lg:gap-5 lg:px-4 lg:pt-4">
        <div className="lg:flex lg:flex-col lg:gap-3">

          {/* ── The one next action. Chartreuse because it is the only thing
              on the page that is an instruction. Sized to its text — no
              full-width buttons (Dan). ── */}
          {next && !dismissed && (
            <section className="px-4 py-3.5 lg:rounded-xl" style={{ background: HL, borderBottom: `3px solid ${INK}` }}>
              <span className="fluo-mono block text-[9.5px] font-black tracking-[0.1em] opacity-75" style={{ color: INK }}>
                DO THIS NEXT · {next.minutes} MIN · {next.sio}
              </span>
              {/* The one piece of real prose on the page — body size, from the scale. */}
              <p className="mt-2 font-extrabold leading-tight" style={{ color: INK }}>{next.text}</p>
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={indexHref(next.sio)}
                  className="inline-flex min-h-[44px] items-center rounded-[10px] px-5 text-[0.94rem] font-extrabold no-underline"
                  style={{ background: INK, color: PAPER }}
                >
                  Start
                </a>
                <button
                  type="button"
                  onClick={() => setWhy((v) => !v)}
                  aria-expanded={why}
                  className="min-h-[44px] rounded-[10px] border-[1.5px] px-3 text-[0.85rem] font-bold"
                  style={{ borderColor: "color-mix(in oklab, var(--cahier-ink) 40%, transparent)", color: INK }}
                >
                  {why ? "Hide" : "Why this?"}
                </button>
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  aria-label="Dismiss this suggestion"
                  className="ml-auto min-h-[44px] w-10 text-[1.05rem] font-bold opacity-45"
                  style={{ color: INK }}
                >
                  ✕
                </button>
              </div>
              {why && (
                <div
                  className="mt-3 flex flex-col gap-1 rounded-lg px-3 py-2.5"
                  style={{ background: "color-mix(in oklab, var(--cahier-ink) 10%, transparent)" }}
                >
                  <span className="fluo-mono text-[11px] font-bold leading-snug" style={{ color: INK }}>{next.why}</span>
                  <span className="fluo-mono text-[11px] font-bold leading-snug opacity-65" style={{ color: INK }}>{next.whyDetail}</span>
                </div>
              )}
            </section>
          )}
        </div>

        {/* ── The record. One open at a time; every row states its own value
            on the right, so the page reads shut. ── */}
        <div className="lg:min-w-0">
          {rowsToShow(p, hasCreation).map((row) => (
            <Section
              key={row.key}
              hue={row.hue}
              label={row.label}
              emoji={row.emoji}
              open={open === row.key}
              onToggle={() => toggle(row.key)}
              summary={row.key === "thrills" ? undefined : summaryOf(row.key)}
              trailing={row.key === "thrills" ? <RewardMarks p={p} /> : undefined}
            >
              {row.key === "redrills" && (
                <>
                  {queue.length > 0 ? (
                    <Tiles>
                      {queue.slice(0, 4).map((d) => (
                        <a key={d.sio} href={indexHref(d.sio)} className="block rounded-[9px] px-2.5 py-2.5 no-underline"
                           style={{ background: "color-mix(in oklab, var(--fluo-card-accent) 12%, transparent)" }}>
                          <div className="flex items-center gap-1.5">
                            <span className="fluo-mono min-w-0 flex-1 truncate text-[10px] font-bold" style={{ color: SOFT }}>{d.sio}</span>
                            <span className="fluo-mono shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black text-white"
                                  style={{ background: tierToken(d.pct) }}>
                              {d.pct == null ? "—" : `${d.pct}%`}
                            </span>
                          </div>
                          <span className="mt-1.5 block text-[0.87rem] font-extrabold leading-tight" style={{ color: INK }}>{d.short}</span>
                        </a>
                      ))}
                    </Tiles>
                  ) : null}
                  {/* RESOLVED BY THE INTEGRATION LANE, 12 Sep — both of Dan's
                      11 Sep instructions, which looked like one conflict and
                      are not. « All clear » sits OVER the middle of the grid,
                      so it is not "text between the green stripe REDRILL and
                      the grid items below"; the sentence that WAS between them
                      is gone on both branches. The legend keeps its place under
                      the grid. Dropping either side would have quietly undone
                      an instruction he gave the same afternoon. */}
                  {/* ALL CLEAR, OVER THE GRID (Dan, 2026-09-11: *"there is no
                      need to say 'Nothing waiting'.... Just say two words 'All
                      clear' and over the middle of the grid rather than above
                      the grid"*).

                      The sentence it replaces was the litmus test's own case
                      twice over: « Nothing waiting » says what the empty grid
                      below it already says, and « practise anywhere and it
                      lands here » explains a mechanism nobody has to know to
                      find their next move. Two words are left, and they are the
                      two that are not redundant — an empty grid alone reads as
                      a grid that failed to load.

                      OVER the grid, not above it: the empty grid IS the
                      evidence, so the words belong on it. `pointer-events-none`
                      keeps every cell underneath tappable, and the border-top
                      goes with the tiles — a rule separating a list from a grid
                      is furniture once there is no list. */}
                  <div className={queue.length > 0 ? "mt-3 border-t pt-3" : ""} style={queue.length > 0 ? { borderColor: "color-mix(in oklab, var(--fluo-card-accent) 25%, transparent)" } : undefined}>
                    <div className="relative">
                      <HeatStrip values={acc as HeatValues} done={doneSet} hrefFor={indexHref} label="Syllabus, by outcome — your accuracy" />
                      {queue.length === 0 && (
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <span className="rounded-lg px-3 py-1 text-base font-black"
                                style={{ color: INK, background: "color-mix(in oklab, var(--cahier-paper) 86%, transparent)" }}>
                            All clear
                          </span>
                        </span>
                      )}
                    </div>
                    {/* THE GRID GETS A KEY (Dan, 2026-09-11: "there should be a
                        legend below that grid to show what color tile means
                        what in very concise one-word-per color legend. and in a
                        single row"). Same complaint he made about the Index on
                        24 Aug: fifty coloured squares and nothing saying what a
                        colour is. One word each, one row, and the words are the
                        app's own tiers — the swatches read their colour from
                        the very tokens HeatStrip paints the cells with, so a
                        palette change moves both. DONE is the ring, not a fill,
                        which is why its swatch is drawn as an outline. */}
                    <ul className="mt-2 flex list-none items-center gap-x-2.5 p-0">
                      {LEGEND.map((l) => (
                        <li key={l.word} className="flex items-center gap-1">
                          <span
                            aria-hidden
                            className="inline-block h-2.5 w-2.5 rounded-[2px]"
                            style={l.ring
                              ? { background: "transparent", boxShadow: `inset 0 0 0 1.5px ${INK}` }
                              : { background: l.token }}
                          />
                          <span className="fluo-mono whitespace-nowrap text-[9px] font-bold" style={{ color: SOFT }}>{l.word}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {row.key === "skills" && (
                <>
                  <Tiles>
                    {skills.map((s) => (
                      <div key={s.skill} className="rounded-[9px] px-2.5 py-2.5"
                           style={{ background: "color-mix(in oklab, var(--fluo-card-accent) 10%, transparent)" }}>
                        <div className="flex items-center gap-1.5">
                          <span className="min-w-0 flex-1 truncate text-[0.85rem] font-extrabold" style={{ color: INK }}>{s.name}</span>
                          <span className="fluo-mono shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black text-white"
                                style={{ background: tierToken(s.pct) }}>
                            {s.pct == null ? "—" : `${s.pct}%`}
                          </span>
                        </div>
                        <span className="fluo-mono mt-1.5 block text-[15px] font-black leading-none" style={{ color: INK }}>{s.done} / {s.total}</span>
                      </div>
                    ))}
                  </Tiles>
                  <span className="fluo-mono mt-2.5 block text-[10px] font-semibold leading-relaxed" style={{ color: SOFT }}>
                    SIOS ATTEMPTED · AVG ACCURACY
                  </span>
                </>
              )}

              {row.key === "frills" && (
                <>
                  {/* Honestly empty: nothing in the app stores recordings or
                      drafts yet, so the three slots state what they will hold
                      rather than inventing a count. */}
                  <div className="flex gap-2">
                    {[["🎙", "CLIPS"], ["✎", "DRAFTS"], ["↩", "REVISED"]].map(([icon, what]) => (
                      <span key={what} className="flex h-[58px] flex-1 flex-col items-center justify-center gap-1 rounded-lg border-[1.5px] border-dashed"
                            style={{ borderColor: "var(--fluo-card-accent)", color: "var(--fluo-card-accent)" }}>
                        <span aria-hidden className="text-[1.05rem]">{icon}</span>
                        <span className="fluo-mono text-[9px] font-black">0 {what}</span>
                      </span>
                    ))}
                  </div>

                  {/* THE EXPERT DECK LIVES HERE NOW (Dan, 2026-09-12: "leave
                      the expert deck under frills. that is all."). It used to
                      sit on the reward shelf beside the Bouclier and the
                      accent colours; those two are preferences and went to
                      Settings, and this one is not — « Tous les pays
                      (Expert) », 185 country tiles, is extra COURSE, which is
                      what FRILLS is for. The gem balance travels with it: a
                      price with no balance beside it cannot be weighed. */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="fluo-mono rounded-md border-2 px-2 py-1.5 text-[12px] font-bold" style={{ borderColor: LINE, color: INK }}>
                      💎 {p.gems}
                    </span>
                    {EXPERT_UNLOCKS.map((u) => {
                      const owned = (p.unlocks ?? []).includes(u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          disabled={owned || p.gems < u.cost}
                          onClick={() => setP(buyUnlock(u.id))}
                          title={owned ? `${u.label} — unlocked, find it in the games` : `${u.label} — an expert game deck, 💎 ${u.cost}`}
                          className="flex items-center gap-2 rounded-lg border-2 px-2.5 py-2 text-left text-[12px] font-bold disabled:opacity-55"
                          style={{ borderColor: LINE, background: PAPER, color: INK }}
                        >
                          <span>{u.emoji} {u.label}</span>
                          <span className="fluo-mono text-[11px]" style={{ color: SOFT }}>{owned ? "✓" : `💎${u.cost}`}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {row.key === "ills" && (
                <>
                  <p className="font-extrabold" style={{ color: INK }}>What blocked you twice?</p>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={left === 0}
                    placeholder={thisWeek ? thisWeek.text : "In your own words…"}
                    rows={2}
                    className="mt-2 block min-h-[44px] w-full rounded-[9px] border-[1.5px] px-3 py-2.5 text-[0.85rem] font-semibold leading-snug"
                    style={{ borderColor: "var(--fluo-card-accent)", background: PAPER, color: INK }}
                  />
                  <div className="mt-2.5 flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={!draft.trim() || left === 0}
                      onClick={() => { setBlockers(addBlocker(draft, now)); setDraft(""); }}
                      className="min-h-[40px] rounded-[9px] px-4 text-[0.87rem] font-extrabold disabled:opacity-40"
                      style={{ background: "var(--fluo-card-accent)", color: INK }}
                    >
                      Save
                    </button>
                    <span className="fluo-mono text-[11px] font-bold" style={{ color: SOFT }}>
                      {left} LEFT · WK {new Date(weekKey(now)).toLocaleDateString("en-SG", { day: "numeric", month: "short" }).toUpperCase()}
                    </span>
                  </div>
                </>
              )}

              {row.key === "thrills" && <Rewards p={p} />}
            </Section>
          ))}

          {/* ── The footer line: the three doors out of the page. The
              "TEACHER SEES OUTCOMES · ACCURACY" label that used to open it
              was cut by Dan (2 Sep) under the litmus test — removing it
              stops no learner from finding anything. ── */}
          <div className="flex flex-wrap items-center gap-2.5 px-4 py-3" style={{ background: PAPER }}>
            <a href="/map" className="fluo-mono text-[10px] font-bold no-underline">MAP</a>
            <button type="button" onClick={() => exportCsv(acc)} className="fluo-mono text-[10px] font-bold underline underline-offset-2" style={{ color: "var(--cahier-accent)" }}>
              EXPORT
            </button>
            <a href="/moi/historique" className="fluo-mono text-[10px] font-bold no-underline">HISTORY</a>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

/** One collapsible row: tinted header carrying its own summary, accent bar
 *  down the left edge, body in a lighter wash of the same accent. */
function Section({
  hue, emoji, label, summary, trailing, open, onToggle, children,
}: {
  hue: string;
  label: string;
  emoji: string;
  summary?: string;
  trailing?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  // THRILLS has no card-accent class of its own — the rewards row is the
  // colourless one, which is the demotion made visible.
  const accent = hue ? "var(--fluo-card-accent)" : LINE;
  const head = hue ? "var(--fluo-card-tint)" : PAPER;
  return (
    <div className={hue}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-h-[56px] w-full items-center gap-2.5 px-3.5 py-3 text-left"
        /* No left stub (Dan, 6 Sep, pointing at the lettered options: "C —
           the band stubs"): stacked, they read as a broken second vertical
           line beside the binder rings. The wash carries the section's
           colour alone. */
        style={{ background: head, borderBottom: `1px solid ${LINE}` }}
      >
        {/* Dan, 2026-09-11: "the words frills ills etc can be bigger (without
            overflowing the line)". The NAME goes up to 15px and the
            letter-spacing comes in from .08em to .03em, which is
            what buys the width back — "ILLS (problems noted)" is the longest
            row and it has to sit on one line beside its own count badge on a
            390px phone. `whitespace-nowrap` so it can never wrap under the
            badge; `min-w-0` so the name shrinks rather than pushing the count
            off the row. The glyph is aria-hidden: it repeats the word beside
            it, and a screen reader should not read "bandage ILLS". */}
        <span aria-hidden className="shrink-0 text-[15px] leading-none">{emoji}</span>
        <span className="fluo-mono min-w-0 whitespace-nowrap text-[15px] font-black tracking-[0.03em]"
              style={{ color: hue ? INK : SOFT }}>
          {label}
        </span>
        {summary !== undefined && (
          <span className="fluo-mono ml-auto shrink-0 rounded-[5px] px-1.5 py-1 text-[11px] font-black"
                style={{ background: accent, color: hue ? PAPER : INK }}>
            {summary}
          </span>
        )}
        {trailing}
        <span aria-hidden className="w-3.5 shrink-0 text-center text-sm" style={{ color: hue ? INK : SOFT }}>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div
          className="px-3.5 py-3.5"
          style={{
            background: hue ? "color-mix(in oklab, var(--fluo-card-accent) 6%, transparent)" : PAPER,
                        borderBottom: `1px solid ${LINE}`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** The grid both tile sections share — the page has two shapes total: pinned
 *  cards on top, tiled accordions below.
 *
 *  Was a hard 2×2 at every width. On the shared tile floor since 11 Sep, so
 *  it widens on a desktop and still never drops below the two columns a phone
 *  needs. */
function Tiles({ children }: { children: ReactNode }) {
  return (
    <div className="fluo-tilegrid" style={{ ["--tile-min" as string]: "11rem", ["--tile-gap" as string]: "8px" }}>
      {children}
    </div>
  );
}

/** The economy, as four marks on the shut row: number above emoji (Dan). */
function RewardMarks({ p }: { p: Progress }) {
  const marks: [number | string, string][] = [
    [p.streak, "🔥"],
    [p.xp.toLocaleString("en-SG"), "⭐"],
    [p.gems, "💎"],
    [p.badges.length, "🎖️"],
  ];
  return (
    <span className="ml-auto flex items-end gap-3.5">
      {marks.map(([v, e]) => (
        <span key={e} className="flex flex-col items-center gap-0.5">
          <span className="fluo-mono text-[12px] font-black leading-none" style={{ color: INK }}>{v}</span>
          <span aria-hidden className="text-[0.95rem] leading-none">{e}</span>
        </span>
      ))}
    </span>
  );
}


/** The learner's own outcome table, as a file. Client-side: the data is
 *  already in the page, and a download needs no endpoint. */
function exportCsv(acc: Accuracy): void {
  const lines = ["sio,unit,topic,skill,accuracy"];
  for (const s of SIOS) {
    const pct = acc[s.id];
    lines.push([s.id, s.unit, `"${s.topic.replace(/"/g, '""')}"`, s.skill, pct == null ? "" : pct].join(","));
  }
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "fluolingo-outcomes.csv";
  a.click();
  URL.revokeObjectURL(url);
}
