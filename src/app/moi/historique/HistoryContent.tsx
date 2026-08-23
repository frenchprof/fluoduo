"use client";
/**
 * ⌛ The full history — every recorded answer, and the same log folded by
 * exercise (Dan, 2026-08-22: "can we add full history of user's activities
 * through a link at the base of this page").
 *
 * The profile page states WHERE YOU ARE. This one states WHAT YOU DID. They
 * were one page before the merge, and the answer log lost that argument: it is
 * a reference you consult, not a thing you act on, so it moved out from behind
 * a segment control and became a door at the profile's foot.
 *
 * NOT capped. The profile caps every list at five because a phone screenful is
 * the budget there; here the whole point is completeness, so the tables run
 * long and sort.
 */
import { useEffect, useMemo, useState } from "react";
import { SortableTable } from "@/lib/sortTable";
import { useAuthUser } from "@/lib/firebase/auth";
import { describeActivity, hrefForActivity, describeItem } from "@/lib/labels";
import { isMiss, tierClass } from "@/lib/outcomeRows";

type Resp = { item: string; status: string; activityId: string; ts: number; given?: string };

const INK = "var(--cahier-ink)";
const SOFT = "var(--cahier-ink-soft)";
const LINE = "var(--cahier-line-strong)";
const PAPER = "var(--cahier-paper-raised)";

export default function HistoryContent() {
  const [resp, setResp] = useState<Resp[] | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "signedout" | "error">("loading");
  const user = useAuthUser();

  useEffect(() => {
    if (user === undefined) return; // still resolving
    void (async () => {
      try {
        const uid = user?.uid;
        if (!uid) { setState("signedout"); return; }
        const [{ getDocs, collection }, { db }] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase/db"),
        ]);
        const snap = await getDocs(collection(db, "users", uid, "responses"));
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
        setState("ready");
      } catch {
        setState("error");
      }
    })();
  }, [user]);

  /** The same answers, folded by exercise — worst hit-rate first. */
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

  const recent = useMemo(() => (resp ? [...resp].sort((a, b) => b.ts - a.ts) : []), [resp]);
  const fmtWhen = (t: number) => (t ? new Date(t).toLocaleDateString("en-SG", { day: "numeric", month: "short" }) : "—");

  if (state === "loading") return <p className="py-6 text-sm" style={{ color: SOFT }}>Loading your history…</p>;

  if (state === "signedout") {
    return (
      <p className="rounded-xl border-2 px-3 py-2 text-sm font-bold" style={{ borderColor: "var(--tier-medium)", background: "var(--tier-medium-soft)", color: INK }}>
        🔑 Sign in to see your answer history — it lives with your account, not this device.
      </p>
    );
  }

  if (state === "error") {
    return (
      <p className="rounded-xl border-2 px-3 py-2 text-sm font-bold" style={{ borderColor: "var(--tier-weak)", background: "var(--tier-weak-soft)", color: INK }}>
        Couldn&rsquo;t load your history just now. Your profile still reads from this device.
      </p>
    );
  }

  if (recent.length === 0) {
    return <p className="py-6 text-sm" style={{ color: SOFT }}>No recorded answers yet — practise anywhere and everything you do lands here.</p>;
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <section>
        <h2 className="fluo-mono mb-2 text-[11px] font-black tracking-[0.08em]" style={{ color: INK }}>
          BY EXERCISE · {byExercise.length}
        </h2>
        <div className="overflow-x-auto rounded-xl border-2" style={{ borderColor: LINE, background: PAPER }}>
          <SortableTable
            head={["Exercise", "✓", "✗", "Score", "Last"]}
            headAlign={(h, i) => (i === 0 ? "text-left" : "text-right")}
            rows={byExercise.map((g) => (
              <tr key={g.key} className="border-t" style={{ borderColor: "var(--cahier-line)" }}>
                <td className="px-2 py-1.5 font-bold">
                  {g.href ? <a href={g.href} className="underline underline-offset-2" style={{ color: "var(--cahier-accent)" }}>{g.label}</a> : g.label}
                </td>
                <td className="px-2 py-1.5 text-right tier-good">{g.ok}</td>
                <td className="px-2 py-1.5 text-right tier-weak">{g.missed}</td>
                <td className={`px-2 py-1.5 text-right font-black ${tierClass(Math.round((100 * g.ok) / g.n))}`}>{Math.round((100 * g.ok) / g.n)}%</td>
                <td className="px-2 py-1.5 text-right" style={{ color: SOFT }}>{fmtWhen(g.last)}</td>
              </tr>
            ))}
          />
        </div>
      </section>

      <section>
        <h2 className="fluo-mono mb-2 text-[11px] font-black tracking-[0.08em]" style={{ color: INK }}>
          EVERY ANSWER · {recent.length}
        </h2>
        <div className="overflow-x-auto rounded-xl border-2" style={{ borderColor: LINE, background: PAPER }}>
          <SortableTable
            head={["When", "Item", "✓/✗", "Activity"]}
            headAlign={(h, i) => (i === 2 ? "text-center" : "text-left")}
            rows={recent.map((r, i) => (
              <tr key={`${r.ts}-${r.item}-${i}`} className="border-t" style={{ borderColor: "var(--cahier-line)" }}>
                <td className="px-2 py-1 text-xs whitespace-nowrap" style={{ color: SOFT }}>
                  {r.ts ? new Date(r.ts).toLocaleString("en-SG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                </td>
                <td className="px-2 py-1 font-bold" lang="fr" title={r.item}>
                  {describeItem(r.item).label}
                  {r.given && <span className="font-normal" style={{ color: SOFT }}> · «{r.given}»</span>}
                </td>
                <td className="px-2 py-1 text-center">{isMiss(r.status) ? <span className="tier-weak">✗</span> : <span className="tier-good">✓</span>}</td>
                <td className="px-2 py-1 text-xs">
                  {hrefForActivity(r.activityId)
                    ? <a href={hrefForActivity(r.activityId) ?? undefined} title={r.activityId} className="font-bold underline underline-offset-2" style={{ color: "var(--cahier-accent)" }}>{describeActivity(r.activityId).label}</a>
                    : <span className="font-bold" title={r.activityId}>{describeActivity(r.activityId).label}</span>}
                </td>
              </tr>
            ))}
          />
        </div>
      </section>
    </div>
  );
}
