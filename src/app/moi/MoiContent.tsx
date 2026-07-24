"use client";
/**
 * 📊 /moi v2 — « My Progress » (Dan, 2026-07-24: students want the REAL
 * analytics of their own learning — "gems and streaks won't gain them real
 * points at the exam, but what they got wrong, where, how often, personalised
 * tips — these will"). Reads the learner's OWN responses subcollection
 * (users/{uid}/responses — the same records the teacher page aggregates),
 * plus local SRS state. Signed-out learners still get the local view.
 * All metalanguage in English (Dan, 2026-07-23); French only where it IS the
 * content. Colourful ST2FR26-style tabs.
 */
import { useEffect, useMemo, useState } from "react";
import { SIOS } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { loadProgress, type Progress } from "@/lib/progress";
import { useAuthUser } from "@/lib/firebase/auth";

const HUES = ["var(--cahier-t0)", "var(--cahier-t1)", "var(--cahier-t2)", "var(--cahier-t3)", "var(--cahier-t4)", "var(--cahier-t5)"] as const;

type Resp = { item: string; status: string; activityId: string; ts: number };

// ── activity naming (a friendly local cousin of the teacher's normalizer) ──
function labelActivity(id: string): string {
  if (id.startsWith("/practice/flip-it/")) return "Flip It · " + id.split("/").pop();
  if (id.startsWith("/practice/speculearn/")) return "SpecuLearn · " + id.split("/").pop();
  if (id === "/practice/grammarathon/finale") return "🏁 GramMarathon Final";
  if (id.startsWith("/practice/grammarathon/")) return "🏃 GramMarathon · " + id.split("/").pop();
  if (id.startsWith("/games/lexicalater")) return "LexicaLater";
  if (id.startsWith("/games/vocabularain") || id.startsWith("/games/letris")) return "VocabulaRain";
  if (id.startsWith("/games/compose")) return "Compose It";
  if (id === "/conjugaison") return "ConjugaZone";
  if (id === "/reviser") return "DéjàRevu";
  if (id.startsWith("mcq:")) return "Deck MCQ · " + id.slice(4);
  return id;
}

function itemDeck(item: string): { label: string; href: string } | null {
  if (item.startsWith("finale:")) return { label: "GramMarathon Final", href: "/practice/grammarathon/finale" };
  if (item.startsWith("conj-")) return { label: "ConjugaZone", href: "/conjugaison" };
  const c = CURATED.find((x) => x.items?.some((it: { id?: string }) => it.id === item));
  return c ? { label: c.id, href: `/practice/flip-it/${c.id}` } : null;
}

const TABS = [
  { key: "erreurs", label: "📉 Where I lose marks" },
  { key: "items", label: "🎯 My hardest items" },
  { key: "forces", label: "💪 Strong vs weak" },
  { key: "conseils", label: "💡 My tips" },
  { key: "parcours", label: "🏆 Journey" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function MoiContent() {
  const [p, setP] = useState<Progress | null>(null);
  const [tab, setTab] = useState<TabKey>("erreurs");
  const [resp, setResp] = useState<Resp[] | null>(null);
  const [respState, setRespState] = useState<"loading" | "ready" | "signedout" | "error">("loading");

  // Auth state arrives ASYNCHRONOUSLY — checking auth.currentUser on mount
  // told signed-in users to sign in (Dan, 2026-07-24). useAuthUser waits:
  // undefined = still resolving, null = truly signed out.
  const user = useAuthUser();
  useEffect(() => { setP(loadProgress()); }, []);
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
        const snap = await getDocs(collection(db, "users", uid, "responses"));
        const rows: Resp[] = [];
        snap.forEach((d) => {
          const x = d.data() as { item?: string; status?: string; activityId?: string; timestamp?: { toMillis?: () => number } };
          rows.push({
            item: String(x.item ?? ""),
            status: String(x.status ?? ""),
            activityId: String(x.activityId ?? ""),
            ts: x.timestamp?.toMillis?.() ?? 0,
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
    const m = new Map<string, { label: string; href: string | null; n: number; ok: number; missed: number; last: number }>();
    for (const r of resp) {
      const key = r.activityId || "unknown";
      let g = m.get(key);
      if (!g) m.set(key, (g = { label: labelActivity(key), href: key.startsWith("/") ? key : null, n: 0, ok: 0, missed: 0, last: 0 }));
      g.n += 1;
      if (r.status === "missed") g.missed += 1; else g.ok += 1;
      if (r.ts > g.last) g.last = r.ts;
    }
    // ranked by error rate, most bleeding first — ALL of them (Dan,
    // 2026-07-24: "they deserve to see ALL, not some arbitrary top X").
    return [...m.values()].sort((a, b) => b.missed / b.n - a.missed / a.n);
  }, [resp]);

  const hardest = useMemo(() => {
    if (!resp) return [];
    const m = new Map<string, number>();
    for (const r of resp) if (r.status === "missed" && r.item) m.set(r.item, (m.get(r.item) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]); // every missed item, complete
  }, [resp]);

  const totals = useMemo(() => {
    if (!resp || resp.length === 0) return null;
    const missed = resp.filter((r) => r.status === "missed").length;
    return { n: resp.length, missed, acc: Math.round(100 * (1 - missed / resp.length)) };
  }, [resp]);

  // per-SIO strength from local SRS (works signed-out too)
  const sioStats = useMemo(() => {
    if (!p) return [];
    // SOLID = the item has EARNED a multi-day interval (answered correctly
    // enough to be trusted for days). Due-for-refresh is NOT weakness — with
    // the old due-based test, any practice gap showed 0% everywhere (Dan,
    // 2026-07-24). Due-ness lives in the review count, where it belongs.
    return (SIOS as { id: string; topic: string; unit: number; collectionId: string }[]).map((s) => {
      const c = CURATED.find((x) => x.id === s.collectionId);
      const ids = [...((c?.items ?? []).map((it: { id?: string }) => it.id).filter(Boolean) as string[])];
      let tracked = 0, bad = 0;
      for (const id of ids) {
        const st = p.itemSrs[id];
        if (!st) continue;
        tracked += 1;
        if (st.intervalDays <= 1) bad += 1;
      }
      for (const [id, st] of Object.entries(p.itemSrs)) {
        if (!id.startsWith(`finale:${s.id}:`)) continue;
        tracked += 1;
        if (st.intervalDays <= 1) bad += 1;
      }
      return { ...s, tracked, bad };
    });
  }, [p]);
  const touched = sioStats.filter((s) => s.tracked > 0);
  const ranked = [...touched].sort((a, b) => b.bad / b.tracked - a.bad / a.tracked); // ALL touched lessons, weakest first
  const weak = ranked.filter((s) => s.bad > 0);
  const dueNow = p ? Object.values(p.itemSrs).filter((st) => st.due <= Date.now()).length : 0;

  if (!p) return <p className="px-1 py-6 text-sm text-slate-500">Loading your progress…</p>;

  const fmtWhen = (t: number) => (t ? new Date(t).toLocaleDateString("en-SG", { day: "numeric", month: "short" }) : "—");
  const Pct = ({ ok, n }: { ok: number; n: number }) => {
    const pct = Math.round((100 * ok) / n);
    const tone = pct >= 75 ? "text-emerald-700" : pct >= 50 ? "text-amber-700" : "text-rose-600";
    return <b className={tone}>{pct}%</b>;
  };

  return (
    <div className="pb-10">
      <p className="text-sm text-slate-600">
        This is <b>your own</b> learning data — the same records your teacher sees, shown to their owner. It updates with every answer.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`rounded-full border-2 px-3.5 py-1 text-sm font-black transition ${tab === t.key ? "text-white shadow-[2px_2px_0_rgba(0,0,0,0.2)]" : "bg-white text-slate-700 hover:-translate-y-0.5"}`}
            style={{ borderColor: HUES[i % HUES.length], background: tab === t.key ? HUES[i % HUES.length] : undefined }}>
            {t.label}
          </button>
        ))}
      </div>

      {respState === "signedout" && tab !== "forces" && tab !== "parcours" && (
        <p className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          🔑 Sign in to see your full answer history — right now only this device's practice state is available.
        </p>
      )}
      {respState === "error" && (
        <p className="mt-4 rounded-xl border-2 border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          Couldn't load your answer history just now — the local view below still works. Try again in a moment.
        </p>
      )}

      {tab === "erreurs" && (
        <div className="mt-4">
          {totals && (
            <div className="mb-3 flex flex-wrap gap-3">
              {[
                { e: "🧾", k: "Answers recorded", v: totals.n },
                { e: "🎯", k: "Overall accuracy", v: `${totals.acc}%` },
                { e: "❌", k: "Total misses", v: totals.missed },
              ].map((c, i) => (
                <div key={c.k} className="flex-1 rounded-2xl border-2 bg-white p-3 text-center shadow-[2px_2px_0_rgba(0,0,0,0.10)]" style={{ borderColor: HUES[i % HUES.length], minWidth: 110 }}>
                  <div className="text-xl">{c.e}</div>
                  <div className="text-lg font-black text-slate-900">{c.v}</div>
                  <div className="text-[11px] font-bold text-slate-500">{c.k}</div>
                </div>
              ))}
            </div>
          )}
          {byExercise.length > 0 ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Ranked: where you miss most, first — start at the top</p>
              <table className="mt-1 w-full text-sm">
                <thead><tr className="text-left text-xs uppercase text-slate-400"><th className="px-2 py-1">Exercise</th><th className="px-2 py-1 text-right">✓</th><th className="px-2 py-1 text-right">✗</th><th className="px-2 py-1 text-right">Score</th><th className="px-2 py-1 text-right">Last</th></tr></thead>
                <tbody>
                  {byExercise.map((g) => (
                    <tr key={g.label} className="border-t border-slate-100">
                      <td className="px-2 py-1.5 font-bold">{g.href ? <a href={g.href} className="text-blue-700 underline underline-offset-2 hover:text-blue-900">{g.label}</a> : g.label}</td>
                      <td className="px-2 py-1.5 text-right text-emerald-700">{g.ok}</td>
                      <td className="px-2 py-1.5 text-right text-rose-600">{g.missed}</td>
                      <td className="px-2 py-1.5 text-right"><Pct ok={g.ok} n={g.n} /></td>
                      <td className="px-2 py-1.5 text-right text-slate-400">{fmtWhen(g.last)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : respState === "ready" ? (
            <p className="text-sm text-slate-500">No recorded answers yet — practise anywhere and your picture appears here.</p>
          ) : null}
        </div>
      )}

      {tab === "items" && (
        <div className="mt-4">
          {hardest.length > 0 ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Your personal top misses — each links to the place to fix it</p>
              <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {hardest.map(([item, n], i) => {
                  const d = itemDeck(item);
                  return (
                    <div key={item} className="flex items-center justify-between rounded-xl border-2 bg-white px-3 py-2 text-sm shadow-[2px_2px_0_rgba(0,0,0,0.08)]" style={{ borderColor: HUES[i % HUES.length] }}>
                      <span className="font-bold text-slate-800" lang="fr">{item}</span>
                      <span className="ml-2 shrink-0 text-xs">
                        <b className="text-rose-600">✗ {n}</b>
                        {d && <> · <a href={d.href} className="font-bold text-blue-700 underline underline-offset-2">practise</a></>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">{respState === "ready" ? "No repeated misses — impressive!" : "Sign in to see your hardest items."}</p>
          )}
        </div>
      )}

      {tab === "forces" && (
        <div className="mt-4">
          {touched.length === 0 ? (
            <p className="text-sm text-slate-500">Practise a little — your strengths and weaknesses will appear here!</p>
          ) : (
            <>
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">All your lessons, weakest first — every one you've touched</h3>
              <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ranked.map((s) => {
                  const solid = s.tracked - s.bad;
                  const pct = Math.round((100 * solid) / s.tracked);
                  const tone = pct >= 75
                    ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                    : pct >= 50
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : "border-rose-300 bg-rose-50 text-rose-700";
                  return (
                    <a key={s.id} href={`/practice/flip-it/${s.collectionId}`} className={`block rounded-xl border-2 px-3 py-2 text-sm font-bold shadow-[2px_2px_0_rgba(0,0,0,0.10)] transition hover:-translate-y-0.5 ${tone}`}>
                      <span className="text-xs text-slate-400">{s.id} · U{s.unit}</span><br />{s.topic}<br />
                      <span className="text-xs font-normal">{solid}/{s.tracked} solid ({pct}%){pct < 75 ? " → practise?" : " ✓"}</span>
                    </a>
                  );
                })}
              </div>
              <a href="/practice/grammarathon/finale" className="mt-4 block rounded-2xl border-[3px] border-slate-900 bg-yellow-100 px-4 py-3 text-center font-black text-slate-900 shadow-[3px_3px_0_#1f2440] transition hover:-translate-y-0.5">
                🏁 Start a marathon — it targets your weak spots automatically
              </a>
            </>
          )}
        </div>
      )}

      {tab === "conseils" && (
        <div className="mt-4 space-y-2">
          {byExercise[0] && byExercise[0].missed / byExercise[0].n > 0.3 && (
            <p className="rounded-xl border-2 border-rose-200 bg-rose-50 px-3 py-2 text-sm text-slate-800">
              📉 Your biggest mark-loser right now: <b>{byExercise[0].label}</b> ({Math.round((100 * byExercise[0].ok) / byExercise[0].n)}% correct){byExercise[0].href && <> — <a href={byExercise[0].href} className="font-bold text-blue-700 underline underline-offset-2">go fix it</a></>}.
            </p>
          )}
          {weak[0] && (
            <p className="rounded-xl border-2 border-rose-200 bg-rose-50 px-3 py-2 text-sm text-slate-800">
              🎯 Weakest lesson: <b lang="fr">{weak[0].topic}</b> — <a href={`/practice/flip-it/${weak[0].collectionId}`} className="font-bold text-blue-700 underline underline-offset-2">start here</a>.
            </p>
          )}
          <p className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800">
            📬 {dueNow} {dueNow === 1 ? "item is" : "items are"} due for review — <a href="/reviser" className="font-bold text-blue-700 underline underline-offset-2">DéjàRevu</a> brings back exactly what you got wrong, at the right moment.
          </p>
          <p className="rounded-xl border-2 border-sky-200 bg-sky-50 px-3 py-2 text-sm text-slate-800">
            🏁 One 50-question marathon a day until the test: every draw is different, and it knows your weak spots better than you do.
          </p>
        </div>
      )}

      {tab === "parcours" && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-slate-500">The fun numbers — they keep you coming back, but the tabs to the left are what earn marks.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { e: "⭐", k: "XP", v: p.xp },
              { e: "🔥", k: "Streak", v: `${p.streak} ${p.streak === 1 ? "day" : "days"}` },
              { e: "💎", k: "Gems", v: p.gems },
              { e: "🎯", k: "Lessons done", v: `${p.doneSios.length} / ${SIOS.length}` },
              { e: "🎖️", k: "Badges", v: p.badges.length },
              { e: "🧠", k: "Words tracked", v: Object.keys(p.itemSrs).length },
            ].map((c, i) => (
              <div key={c.k} className="rounded-2xl border-2 bg-white p-3 text-center shadow-[2px_2px_0_rgba(0,0,0,0.10)]" style={{ borderColor: HUES[i % HUES.length] }}>
                <div className="text-2xl">{c.e}</div>
                <div className="text-xl font-black text-slate-900">{c.v}</div>
                <div className="text-xs font-bold text-slate-500">{c.k}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
