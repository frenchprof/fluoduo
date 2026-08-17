"use client";
/**
 * 📊 /moi — « My Progress » (Dan, 2026-07-24: students want the REAL
 * analytics of their own learning — "what they got wrong, where, how often").
 * Reads the learner's OWN responses subcollection (users/{uid}/responses —
 * the same records the teacher page aggregates) plus local state. Signed-out
 * learners still get the device view (progress + activity ledger).
 *
 * Patch 26 (2026-08-17), per the audit:
 *   · a THIN stat-strip hero (DrillShell-header standard, like Home's) —
 *     chips + hairlines, never a page-dominating card;
 *   · the syllabus heat-strip under it — fifty outcomes, colour = tier;
 *   · six tabs → four segments: Fix · Exercises · History · Journey;
 *   · "Hardest items" is outcome rows with items nested (outcomeForItem —
 *     patch 12's spine, which this page never called), colour = accuracy
 *     tier, unmapped ids in one bucket pinned last;
 *   · every list capped at 5 with "+N more".
 * All metalanguage in English (Dan, 2026-07-23); French only where it IS the
 * content. Tokens only — no hex, no stock palette (verify19b's ratchet).
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SIOS } from "@/content/sios";
import { loadProgress, type Progress } from "@/lib/progress";
import { SortableTable } from "@/lib/sortTable";
import { useAuthUser } from "@/lib/firebase/auth";
import { describeActivity, hrefForActivity, describeItem } from "@/lib/labels";
import { loadLedger } from "@/lib/activityLedger";
import { UNMAPPED, outcomeRows, outcomeAccuracy, isMiss, tierToken, tierClass, type OutcomeRow } from "@/lib/outcomeRows";
import { UNIT_ACCENTS } from "@/components/siteTabs";
import HeatStrip, { type HeatValues } from "@/components/HeatStrip";

type Resp = { item: string; status: string; activityId: string; ts: number; given?: string };

/** Every list on this page shows this many, then "+N more". */
const CAP = 5;

const SEGMENTS = [
  { key: "fix", label: "Fix" },
  { key: "exercises", label: "Exercises" },
  { key: "history", label: "History" },
  { key: "journey", label: "Journey" },
] as const;
type Seg = (typeof SEGMENTS)[number]["key"];

/** The Index row for an outcome — one place, every activity for it. */
const indexHref = (sio: string) => {
  const s = SIOS.find((x) => x.id === sio);
  return s ? `/activities?unit=${s.unit}#${s.id}` : "/activities";
};

const INK = "var(--cahier-ink)";
const SOFT = "var(--cahier-ink-soft)";
const LINE = "var(--cahier-line-strong)";
const PAPER = "var(--cahier-paper-raised)";

export default function MoiContent() {
  const [p, setP] = useState<Progress | null>(null);
  const [seg, setSeg] = useState<Seg>("fix");
  const [resp, setResp] = useState<Resp[] | null>(null);
  const [respState, setRespState] = useState<"loading" | "ready" | "signedout" | "error">("loading");
  const [time, setTime] = useState<{ ms: number; n: number; byAct: [string, number][] } | null>(null);
  const [ledgerAcc, setLedgerAcc] = useState<HeatValues>({});

  // Auth state arrives ASYNCHRONOUSLY — checking auth.currentUser on mount
  // told signed-in users to sign in (Dan, 2026-07-24). useAuthUser waits:
  // undefined = still resolving, null = truly signed out.
  const user = useAuthUser();
  useEffect(() => {
    setP(loadProgress());
    // Device ledger → per-outcome accuracy, for the signed-out heat-strip.
    const l = loadLedger();
    const sum: Record<string, { r: number; w: number }> = {};
    for (const bySio of Object.values(l)) for (const [sio, t] of Object.entries(bySio)) {
      const s = (sum[sio] ??= { r: 0, w: 0 });
      s.r += t.right; s.w += t.wrong;
    }
    const acc: HeatValues = {};
    for (const [sio, s] of Object.entries(sum)) if (s.r + s.w > 0) acc[sio] = Math.round((100 * s.r) / (s.r + s.w));
    setLedgerAcc(acc);
  }, []);
  useEffect(() => {
    if (user === undefined) return; // still resolving — keep "loading"
    void (async () => {
      try {
        const [{ getDocs, collection }, { db }] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase/db"),
        ]);
        const uid = user?.uid;
        if (!uid) { setRespState("signedout"); return; }
        const [snap, sessSnap] = await Promise.all([
          getDocs(collection(db, "users", uid, "responses")),
          getDocs(collection(db, "users", uid, "sessions")).catch(() => null),
        ]);
        if (sessSnap) {
          let ms = 0, n = 0;
          const byAct = new Map<string, number>();
          sessSnap.forEach((sd) => {
            const x = sd.data() as { durationMs?: number; activityId?: string };
            if (typeof x.durationMs === "number" && x.durationMs > 0) {
              ms += x.durationMs; n += 1;
              const k = String(x.activityId ?? "");
              if (k) byAct.set(k, (byAct.get(k) ?? 0) + x.durationMs);
            }
          });
          setTime({ ms, n, byAct: [...byAct.entries()].sort((a, b) => b[1] - a[1]) });
        }
        const rows: Resp[] = [];
        snap.forEach((d) => {
          const x = d.data() as { item?: string; status?: string; activityId?: string; timestamp?: { toMillis?: () => number }; givenAnswer?: unknown };
          rows.push({
            item: String(x.item ?? ""),
            status: String(x.status ?? ""),
            activityId: String(x.activityId ?? ""),
            ts: x.timestamp?.toMillis?.() ?? 0,
            given: typeof x.givenAnswer === "string" ? x.givenAnswer : undefined,
          });
        });
        setResp(rows);
        setRespState("ready");
      } catch {
        setRespState("error");
      }
    })();
  }, [user]);

  // ── the quantitative picture, ranked (Dan: "% and so on") ──
  const byExercise = useMemo(() => {
    if (!resp) return [];
    const m = new Map<string, { key: string; label: string; href: string | null; n: number; ok: number; missed: number; last: number }>();
    for (const r of resp) {
      const key = r.activityId || "unknown";
      let g = m.get(key);
      if (!g) m.set(key, (g = { key, label: describeActivity(key).label, href: hrefForActivity(key), n: 0, ok: 0, missed: 0, last: 0 }));
      g.n += 1;
      if (isMiss(r.status)) g.missed += 1; else g.ok += 1;
      if (r.ts > g.last) g.last = r.ts;
    }
    return [...m.values()].sort((a, b) => b.missed / b.n - a.missed / a.n);
  }, [resp]);

  // Outcome rows — the audit's cure for the flat "hardest items" grid.
  const rows = useMemo(() => (resp ? outcomeRows(resp) : []), [resp]);
  const toFix = useMemo(() => rows.filter((r) => r.missed > 0), [rows]);
  const heat = useMemo<HeatValues>(() => (resp ? outcomeAccuracy(resp) : ledgerAcc), [resp, ledgerAcc]);

  const totals = useMemo(() => {
    if (!resp || resp.length === 0) return null;
    const missed = resp.filter((r) => isMiss(r.status)).length;
    return { n: resp.length, missed, acc: Math.round(100 * (1 - missed / resp.length)) };
  }, [resp]);

  const dueNow = p ? Object.values(p.itemSrs).filter((st) => st.due <= Date.now()).length : 0;
  const doneSet = useMemo(() => new Set(p?.doneSios ?? []), [p]);

  if (!p) return <p className="px-1 py-6 text-sm" style={{ color: SOFT }}>Loading your progress…</p>;

  const donePct = Math.round((100 * p.doneSios.length) / SIOS.length);
  const fmtWhen = (t: number) => (t ? new Date(t).toLocaleDateString("en-SG", { day: "numeric", month: "short" }) : "—");
  const chip = "fluo-mono inline-flex items-center gap-1 rounded-lg border-2 px-1.5 py-0.5 text-xs font-black";
  const chipStyle = { borderColor: INK, background: PAPER, color: INK } as const;

  return (
    <div className="pb-10">
      {/* ── The stat-strip hero: thin, information-only (DrillShell standard;
          verify25's rules) — chips, then two 3px hairlines. ── */}
      <section
        aria-label="Your progress"
        className="moi-hero rounded-2xl border-2 p-2.5 shadow-[4px_4px_0_var(--fluo-hl)]"
        style={{ borderColor: INK, background: PAPER }}
      >
        <div className="flex flex-wrap items-center gap-1">
          <span className={chip} style={chipStyle} title="Outcomes marked done">✓ {p.doneSios.length}/{SIOS.length}</span>
          {totals && <span className={`${chip} ${tierClass(totals.acc)}`} style={chipStyle} title={`${totals.n} answers recorded`}>🎯 {totals.acc}%</span>}
          {totals && totals.missed > 0 && <span className={chip} style={chipStyle} title="Answers missed"><span className="tier-weak">✗</span> {totals.missed}</span>}
          {p.streak > 0 && <span className={chip} style={chipStyle} title="Day streak">🔥 {p.streak}</span>}
          {p.xp > 0 && <a href="/leaderboard" className={`${chip} no-underline hover:-translate-y-0.5`} style={chipStyle} title="XP · leaderboard">⭐ {p.xp}</a>}
          {dueNow > 0 && (
            <a href="/reviser" className={`${chip} ml-auto no-underline hover:-translate-y-0.5`} style={{ ...chipStyle, background: INK, color: PAPER }} title="DéjàRevu — due for review now">
              🔁 {dueNow}
            </a>
          )}
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className="fluo-mono w-14 shrink-0 text-[10px] font-bold" style={{ color: INK }}>Course</span>
            <span className="h-[3px] flex-1 overflow-hidden rounded-full" style={{ background: "var(--cahier-line)" }} role="progressbar" aria-valuenow={donePct} aria-valuemin={0} aria-valuemax={100}>
              <span className="block h-full rounded-full" style={{ width: `${Math.max(donePct, 1)}%`, background: "var(--cahier-accent)" }} />
            </span>
            <span className="fluo-mono w-8 shrink-0 text-right text-[10px] font-bold" style={{ color: INK }}>{donePct}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="fluo-mono w-14 shrink-0 text-[10px] font-bold" style={{ color: INK }}>Accuracy</span>
            <span className="h-[3px] flex-1 overflow-hidden rounded-full" style={{ background: "var(--cahier-line)" }} role="progressbar" aria-valuenow={totals?.acc ?? 0} aria-valuemin={0} aria-valuemax={100}>
              <span className="block h-full rounded-full" style={{ width: `${Math.max(totals?.acc ?? 0, 1)}%`, background: tierToken(totals?.acc ?? null) }} />
            </span>
            <span className={`fluo-mono w-8 shrink-0 text-right text-[10px] font-bold ${tierClass(totals?.acc)}`} style={totals ? undefined : { color: INK }}>{totals ? `${totals.acc}%` : "—"}</span>
          </div>
        </div>
      </section>

      {/* ── The syllabus heat-strip: fifty outcomes, colour = tier. A tap
          opens that outcome's Index row. ── */}
      <HeatStrip className="mt-3" values={heat} done={doneSet} hrefFor={indexHref} label="Syllabus, by outcome — your accuracy" />

      {/* ── Four segments (were six tabs). ── */}
      <div role="group" aria-label="View" className="moi-segments fluo-mono mt-3 grid grid-cols-4 overflow-hidden rounded-xl border-2 text-xs font-black" style={{ borderColor: INK }}>
        {SEGMENTS.map((s) => {
          const on = s.key === seg;
          return (
            <button key={s.key} type="button" aria-pressed={on} onClick={() => setSeg(s.key)} className="py-2 leading-none"
              style={{ background: on ? INK : PAPER, color: on ? PAPER : INK }}>
              {s.label}
            </button>
          );
        })}
      </div>

      {respState === "signedout" && seg !== "journey" && (
        <p className="mt-3 rounded-xl border-2 px-3 py-2 text-sm font-bold" style={{ borderColor: "var(--tier-medium)", background: "var(--tier-medium-soft)", color: INK }}>
          🔑 Sign in to see your full answer history — this device's practice only, for now.
        </p>
      )}
      {respState === "error" && (
        <p className="mt-3 rounded-xl border-2 px-3 py-2 text-sm font-bold" style={{ borderColor: "var(--tier-weak)", background: "var(--tier-weak-soft)", color: INK }}>
          Couldn't load your answer history just now — the device view below still works.
        </p>
      )}

      {seg === "fix" && (
        <div className="mt-3">
          {toFix.length > 0 ? (
            <Capped items={toFix} render={(r) => <OutcomeCard key={r.sio} row={r} />} />
          ) : (
            <p className="text-sm" style={{ color: SOFT }}>{respState === "ready" ? "Nothing to fix — no misses on record." : "Sign in to see what to fix."}</p>
          )}
        </div>
      )}

      {seg === "exercises" && (
        <div className="mt-3">
          {byExercise.length > 0 ? (
            <Capped
              items={byExercise}
              wrap={(kids) => (
                <div className="overflow-x-auto rounded-xl border-2" style={{ borderColor: LINE, background: PAPER }}>
                  <SortableTable head={["Exercise", "✓", "✗", "Score", "Last"]} headAlign={(h, i) => (i === 0 ? "text-left" : "text-right")} rows={kids} />
                </div>
              )}
              render={(g) => (
                <tr key={g.key} className="border-t" style={{ borderColor: "var(--cahier-line)" }}>
                  <td className="px-2 py-1.5 font-bold">{g.href ? <a href={g.href} className="underline underline-offset-2" style={{ color: "var(--cahier-accent)" }}>{g.label}</a> : g.label}</td>
                  <td className="px-2 py-1.5 text-right tier-good">{g.ok}</td>
                  <td className="px-2 py-1.5 text-right tier-weak">{g.missed}</td>
                  <td className={`px-2 py-1.5 text-right font-black ${tierClass(Math.round((100 * g.ok) / g.n))}`}>{Math.round((100 * g.ok) / g.n)}%</td>
                  <td className="px-2 py-1.5 text-right" style={{ color: SOFT }}>{fmtWhen(g.last)}</td>
                </tr>
              )}
            />
          ) : respState === "ready" ? (
            <p className="text-sm" style={{ color: SOFT }}>No recorded answers yet — practise anywhere and your picture appears here.</p>
          ) : null}
        </div>
      )}

      {seg === "history" && (
        <div className="mt-3">
          {time && time.n > 0 && (
            <p className="mb-2 text-xs font-bold" style={{ color: SOFT }}>
              ⏱ {Math.round(time.ms / 60000)} min on task · {time.n} session{time.n === 1 ? "" : "s"}
              {time.byAct.length > 0 && <> · {time.byAct.slice(0, 3).map(([k, v]) => `${describeActivity(k).label} ${Math.round(v / 60000)} min`).join(" · ")}</>}
            </p>
          )}
          {resp && resp.length > 0 ? (
            <Capped
              items={[...resp].sort((a, b) => b.ts - a.ts)}
              wrap={(kids) => (
                <div className="overflow-x-auto rounded-xl border-2" style={{ borderColor: LINE, background: PAPER }}>
                  <SortableTable head={["When", "Item", "✓/✗", "Activity"]} headAlign={(h, i) => (i === 2 ? "text-center" : "text-left")} rows={kids} />
                </div>
              )}
              render={(r, i) => (
                <tr key={`${r.ts}-${r.item}-${i}`} className="border-t" style={{ borderColor: "var(--cahier-line)" }}>
                  <td className="px-2 py-1 text-xs whitespace-nowrap" style={{ color: SOFT }}>{r.ts ? new Date(r.ts).toLocaleString("en-SG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                  <td className="px-2 py-1 font-bold" lang="fr" title={r.item}>{describeItem(r.item).label}{r.given && <span className="font-normal" style={{ color: SOFT }}> · «{r.given}»</span>}</td>
                  <td className="px-2 py-1 text-center">{isMiss(r.status) ? <span className="tier-weak">✗</span> : <span className="tier-good">✓</span>}</td>
                  <td className="px-2 py-1 text-xs">
                    {hrefForActivity(r.activityId)
                      ? <a href={hrefForActivity(r.activityId) ?? undefined} title={r.activityId} className="font-bold underline underline-offset-2" style={{ color: "var(--cahier-accent)" }}>{describeActivity(r.activityId).label}</a>
                      : <span className="font-bold" title={r.activityId}>{describeActivity(r.activityId).label}</span>}
                  </td>
                </tr>
              )}
            />
          ) : (
            <p className="text-sm" style={{ color: SOFT }}>{respState === "ready" ? "No recorded answers yet — practise anywhere and your history appears here." : "Sign in to see your answer history."}</p>
          )}
        </div>
      )}

      {seg === "journey" && (
        <div className="mt-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { e: "⭐", k: "XP", v: p.xp },
              { e: "🔥", k: "Streak", v: `${p.streak}d` },
              { e: "💎", k: "Gems", v: p.gems },
              { e: "🎯", k: "Done", v: `${p.doneSios.length}/${SIOS.length}` },
              { e: "🎖️", k: "Badges", v: p.badges.length },
              { e: "🧠", k: "Words", v: Object.keys(p.itemSrs).length },
            ].map((c) => (
              <div key={c.k} className="rounded-xl border-2 p-2 text-center" style={{ borderColor: LINE, background: PAPER }}>
                <div className="text-lg leading-none">{c.e}</div>
                <div className="fluo-mono mt-1 text-base font-black leading-none" style={{ color: INK }}>{c.v}</div>
                <div className="mt-0.5 text-[10px] font-bold" style={{ color: SOFT }}>{c.k}</div>
              </div>
            ))}
          </div>
          <a href="/practice/grammarathon/finale" className="mt-3 block rounded-xl border-2 px-3 py-2 text-center text-sm font-black no-underline shadow-[3px_3px_0_var(--cahier-ink)] transition hover:-translate-y-0.5" style={{ borderColor: INK, background: "var(--fluo-hl)", color: INK }}>
            🏁 Marathon — 50 questions, aimed at your weak spots
          </a>
        </div>
      )}
    </div>
  );
}

/** A list capped at CAP with one "+N more" — the rule for every list here. */
function Capped<T>({ items, render, wrap }: { items: T[]; render: (t: T, i: number) => ReactNode; wrap?: (kids: ReactNode[]) => ReactNode }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, CAP);
  const kids = shown.map(render);
  const rest = items.length - CAP;
  return (
    <>
      {wrap ? wrap(kids) : <div className="space-y-2">{kids}</div>}
      {rest > 0 && (
        <button type="button" onClick={() => setAll((v) => !v)} className="moi-more fluo-mono mt-2 rounded-lg border-2 px-2.5 py-1 text-xs font-black" style={{ borderColor: LINE, background: PAPER, color: INK }}>
          {all ? "Show less" : `+${rest} more`}
        </button>
      )}
    </>
  );
}

/**
 * One outcome row: header (SIO · topic · unit), a bar of weak items over
 * items seen tinted by the outcome's tier, the miss count, Practise → the
 * Index row, then the missed items as chips (CAP shown, rest behind +N).
 * The unmapped bucket is the same card, collapsed, pinned last by the sort.
 */
function OutcomeCard({ row }: { row: OutcomeRow }) {
  const [more, setMore] = useState(false);
  const unmapped = row.sio === UNMAPPED;
  const [open, setOpen] = useState(!unmapped);
  const tone = tierToken(row.pct);
  const items = more ? row.items : row.items.slice(0, CAP);
  const rest = row.items.length - CAP;
  return (
    <article className="moi-outcome rounded-xl border-2 p-2.5" style={{ borderColor: tone, background: PAPER }}>
      <div className="flex items-center gap-2">
        {!unmapped ? (
          <span className="fluo-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-black" style={{ background: UNIT_ACCENTS[row.unit], color: PAPER }} title={`Unité ${row.unit}`}>{row.num}</span>
        ) : (
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="fluo-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-black" style={{ background: LINE, color: INK }}>{open ? "▾" : "▸"}</button>
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-black" style={{ color: INK }} lang={unmapped ? undefined : "fr"} title={unmapped ? "Answers whose item is in no outcome (raw French from a game, retired ids)" : `${row.sio} · ${row.topic}`}>
          {unmapped ? "Not yet mapped" : row.topic}
        </span>
        <span className={`fluo-mono shrink-0 text-xs font-black ${tierClass(row.pct)}`}>{row.pct}%</span>
        {!unmapped && (
          <a href={indexHref(row.sio)} className="shrink-0 rounded-lg border-2 px-2 py-0.5 text-xs font-black no-underline transition hover:-translate-y-0.5" style={{ borderColor: INK, background: INK, color: PAPER }} title={`Practise ${row.sio}`}>▶</a>
        )}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="h-[3px] flex-1 overflow-hidden rounded-full" style={{ background: "var(--cahier-line)" }} role="progressbar" aria-label="Items weak" aria-valuenow={row.weakItems} aria-valuemin={0} aria-valuemax={row.itemsSeen}>
          <span className="block h-full rounded-full" style={{ width: `${row.itemsSeen ? Math.max((100 * row.weakItems) / row.itemsSeen, 1) : 0}%`, background: tone }} />
        </span>
        <span className="fluo-mono shrink-0 text-[10px] font-bold" style={{ color: SOFT }}>{row.weakItems}/{row.itemsSeen} weak · <span className="tier-weak">✗ {row.missed}</span></span>
      </div>
      {open && row.items.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {items.map((it) => (
            <span key={it.item} className="rounded-md border px-1.5 py-0.5 text-xs font-bold" lang="fr" title={`${it.item} · ${it.missed} of ${it.n} missed`} style={{ borderColor: tierToken(Math.round((100 * (it.n - it.missed)) / it.n)), color: INK }}>
              {it.label} <span className="tier-weak">✗{it.missed}</span>
            </span>
          ))}
          {rest > 0 && (
            <button type="button" onClick={() => setMore((v) => !v)} className="fluo-mono rounded-md border px-1.5 py-0.5 text-xs font-black" style={{ borderColor: LINE, color: INK }}>
              {more ? "less" : `+${rest} ▾`}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
