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
 * THE FIVE ROWS are Dan's rhyming spine (2026-08-22), glosses in brackets so
 * the rhyme leads and the plain word follows:
 *
 *   RE-DRILLS · SKILLS · FRILLS (showcase) · ILLS (problems noted) · THRILLS (rewards)
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
import { loadProgress, setGoal, type Progress } from "@/lib/progress";
import { useAuthUser } from "@/lib/firebase/auth";
import { loadLedger } from "@/lib/activityLedger";
import { outcomeAccuracy, tierToken } from "@/lib/outcomeRows";
import { COURSE_CODE, COURSE_LEVEL, courseWeek } from "@/lib/term";
import {
  attemptedCount, goalCandidates, goalLine, nextAction, redrills, skillCoverage,
  type Accuracy,
} from "@/lib/learnerModel";
import { addBlocker, leftThisWeek, loadBlockers, weekKey, type Blocker } from "@/lib/blockers";
import HeatStrip, { type HeatValues } from "@/components/HeatStrip";
import Rewards from "@/components/Rewards";

type Resp = { item: string; status: string; activityId: string; ts: number; outcomeId?: string | null };

/** The five rows. `hue` is the globals.css card-accent class; THRILLS is the
 *  deliberately colourless one — rewards are the demoted section. */
const ROWS = [
  { key: "redrills", label: "RE-DRILLS", gloss: null, hue: "fluo-h-1" },
  { key: "skills", label: "SKILLS", gloss: null, hue: "fluo-h-3" },
  { key: "frills", label: "FRILLS", gloss: "showcase", hue: "fluo-h-4" },
  { key: "ills", label: "ILLS", gloss: "problems noted", hue: "fluo-h-2" },
  { key: "thrills", label: "THRILLS", gloss: "rewards", hue: "" },
] as const;
type RowKey = (typeof ROWS)[number]["key"];

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
  const [picking, setPicking] = useState(false);
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
  const queue = useMemo(() => (p && now ? redrills(p, acc, now) : []), [p, acc, now]);
  const skills = useMemo(() => skillCoverage(acc), [acc]);
  const next = useMemo(() => (p && now ? nextAction(p, queue, now) : null), [p, queue, now]);
  const goal = useMemo(() => (p && now ? goalLine(p, now) : null), [p, now]);
  const doneSet = useMemo(() => new Set(p?.doneSios ?? []), [p]);

  if (!p || now === null) return <p className="px-1 py-6 text-sm" style={{ color: SOFT }}>Loading your progress…</p>;

  const attempted = attemptedCount(acc);
  const left = leftThisWeek(blockers, now);
  const thisWeek = blockers.filter((b) => b.week === weekKey(now)).slice(-1)[0];

  const toggle = (k: RowKey) => setOpen((cur) => (cur === k ? null : k));

  const summaryOf = (k: RowKey): string =>
    k === "redrills" ? `${queue.length} SIOS`
      : k === "skills" ? `${attempted} / ${SIOS.length}`
      : k === "frills" ? "EMPTY"
      : `${Math.min(blockers.filter((b) => b.week === weekKey(now)).length, 3)} / 3`;

  return (
    <div className="profile-page pb-8">
      {/* ── Who, which course, how far. The count is the only number here:
          the whole point of the page is that progress is outcomes done. ── */}
      <header
        className="flex items-center justify-between gap-3 rounded-t-2xl px-4 py-3"
        style={{ background: "var(--fluo-secondary)", borderBottom: `3px solid ${INK}` }}
      >
        <div className="min-w-0">
          {/* Sized from the scale, not invented: the header is a compact strip
              that also carries the outcome count, so it takes --fs-h2 rather
              than the h1 default (globals.css `h1.cahier-display`). */}
          <h1 className="fluo-band-hand truncate font-semibold leading-none text-white" style={{ fontSize: "var(--fs-h2)" }}>
            {user?.displayName ?? "Moi"}
          </h1>
          {/* A label, not prose — `.cahier-page p` would force it to body size. */}
          <span className="fluo-mono mt-1.5 block truncate text-[10px] font-bold leading-none tracking-[0.06em] text-white/90">
            {COURSE_CODE} · {COURSE_LEVEL} · WEEK {courseWeek(now)}
          </span>
        </div>
        <span className="fluo-mono shrink-0 rounded-md px-2 py-1.5 text-[11px] font-black" style={{ background: HL, color: INK }}>
          {p.doneSios.length} / {SIOS.length}
        </span>
      </header>

      {/* Wide: the two things you act on pin to the left, the record collapses
          beside them. Phone: one column, the same order. */}
      <div className="grid items-start gap-0 lg:grid-cols-[340px_1fr] lg:gap-5 lg:px-4 lg:pt-4">
        <div className="lg:flex lg:flex-col lg:gap-3">
          {/* ── The pinned goal. One line: which of the fifty, by when. The
              can-do sentence appears only when you open it to change it —
              the fifty are the catalogue, this is the commitment. ── */}
          <button
            type="button"
            onClick={() => setPicking((v) => !v)}
            aria-expanded={picking}
            className="flex min-h-[48px] w-full items-center gap-2 px-4 py-3 text-left lg:rounded-xl"
            style={{ background: INK, borderBottom: `3px solid ${INK}` }}
          >
            <span className="fluo-mono shrink-0 text-[9.5px] font-black tracking-[0.1em]" style={{ color: HL }}>GOAL</span>
            {goal ? (
              <>
                <span className="fluo-mono truncate text-[11.5px] font-bold text-white">{goal.sio} · {goal.short.toUpperCase()}</span>
                <span className="fluo-mono ml-auto shrink-0 text-[11.5px] font-bold text-white/70">BY {goal.by}</span>
              </>
            ) : (
              <span className="fluo-mono text-[11.5px] font-bold text-white/70">PICK ONE OF THE FIFTY</span>
            )}
            <span aria-hidden className="shrink-0 text-sm text-white/60">{picking ? "▾" : "›"}</span>
          </button>

          {picking && (
            <GoalPicker
              current={p.goal?.sio ?? null}
              by={p.goal?.by ?? null}
              canDo={goal?.canDo ?? null}
              onSave={(sio, by) => { setP(setGoal(sio, by)); setPicking(false); }}
            />
          )}

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
          {ROWS.map((row) => (
            <Section
              key={row.key}
              hue={row.hue}
              label={row.label}
              gloss={row.gloss}
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
                  ) : (
                    <p className="text-sm" style={{ color: SOFT }}>Nothing waiting — practise anywhere and it lands here.</p>
                  )}
                  <div className="mt-3 border-t pt-3" style={{ borderColor: "color-mix(in oklab, var(--fluo-card-accent) 25%, transparent)" }}>
                    <HeatStrip values={acc as HeatValues} done={doneSet} hrefFor={indexHref} label="Syllabus, by outcome — your accuracy" />
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
                // Honestly empty: nothing in the app stores recordings or
                // drafts yet, so the three slots state what they will hold
                // rather than inventing a count.
                <div className="flex gap-2">
                  {[["🎙", "CLIPS"], ["✎", "DRAFTS"], ["↩", "REVISED"]].map(([icon, what]) => (
                    <span key={what} className="flex h-[58px] flex-1 flex-col items-center justify-center gap-1 rounded-lg border-[1.5px] border-dashed"
                          style={{ borderColor: "var(--fluo-card-accent)", color: "var(--fluo-card-accent)" }}>
                      <span aria-hidden className="text-[1.05rem]">{icon}</span>
                      <span className="fluo-mono text-[9px] font-black">0 {what}</span>
                    </span>
                  ))}
                </div>
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

              {row.key === "thrills" && <Rewards p={p} onChange={setP} />}
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
  );
}

/** One collapsible row: tinted header carrying its own summary, accent bar
 *  down the left edge, body in a lighter wash of the same accent. */
function Section({
  hue, label, gloss, summary, trailing, open, onToggle, children,
}: {
  hue: string;
  label: string;
  gloss: string | null;
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
        style={{ background: head, borderLeft: `7px solid ${accent}`, borderBottom: `1px solid ${LINE}` }}
      >
        <span className="fluo-mono text-[11px] font-black tracking-[0.08em]" style={{ color: hue ? INK : SOFT }}>
          {label}{gloss && <span className="opacity-60"> ({gloss})</span>}
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
            borderLeft: `7px solid ${accent}`,
            borderBottom: `1px solid ${LINE}`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** The 2×2 grid both tile sections share — the page has two shapes total:
 *  pinned cards on top, tiled accordions below. */
function Tiles({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
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

/** Pick one of the fifty, and a date. The can-do sentence shows HERE and only
 *  here — it is the criterion you judge yourself against, so it belongs at the
 *  moment you commit, not pinned to every screenful. */
function GoalPicker({
  current, by, canDo, onSave,
}: {
  current: string | null;
  by: string | null;
  canDo: string | null;
  onSave: (sio: string | null, by: string | null) => void;
}) {
  const [sio, setSio] = useState(current ?? "");
  const [date, setDate] = useState(by ?? "");
  const picked = SIOS.find((s) => s.id === sio);
  return (
    <section className="px-4 py-3.5 lg:rounded-xl" style={{ background: PAPER, borderBottom: `3px solid ${INK}` }}>
      {canDo && !picked && <p className="mb-2.5 text-[0.85rem] font-semibold leading-snug" style={{ color: SOFT }}>{canDo}</p>}
      <label className="fluo-mono block text-[9.5px] font-black tracking-[0.1em]" style={{ color: SOFT }}>OUTCOME</label>
      <select
        value={sio}
        onChange={(e) => setSio(e.target.value)}
        className="mt-1 block min-h-[44px] w-full rounded-[9px] border-2 px-2 text-[0.85rem] font-bold"
        style={{ borderColor: INK, background: PAPER, color: INK }}
      >
        <option value="">—</option>
        {goalCandidates().map((s) => (
          <option key={s.id} value={s.id}>{s.id} · {s.short}</option>
        ))}
      </select>
      {picked && <p className="mt-2 text-[0.85rem] font-semibold leading-snug" style={{ color: INK }}>{picked.canDo}</p>}
      <label className="fluo-mono mt-3 block text-[9.5px] font-black tracking-[0.1em]" style={{ color: SOFT }}>BY</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mt-1 block min-h-[44px] w-full rounded-[9px] border-2 px-2 text-[0.85rem] font-bold"
        style={{ borderColor: INK, background: PAPER, color: INK }}
      />
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={!sio}
          onClick={() => onSave(sio, date || null)}
          className="min-h-[44px] rounded-[10px] px-5 text-[0.9rem] font-extrabold disabled:opacity-40"
          style={{ background: INK, color: PAPER }}
        >
          Pin it
        </button>
        {current && (
          <button type="button" onClick={() => onSave(null, null)} className="min-h-[44px] px-3 text-[0.85rem] font-bold" style={{ color: SOFT }}>
            Clear
          </button>
        )}
      </div>
    </section>
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
