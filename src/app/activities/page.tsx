"use client";

/**
 * 📖 The Index — patch 24 (UI_WORK_PLAN_1 → PATCH 24, the Index redesign).
 *
 * WHAT IT WAS: 50 deck rows × 9 activity columns, five collapsible unit
 * tables, 3810px tall on a phone (audit, 2026-08-10) — and 277 of the 450
 * cells painted an emoji meaning "this link works". Three columns were the
 * same emoji fifty times.
 *
 * WHAT IT IS: one activity at a time (the chip rail), one unit at a time
 * (the segmented control), TEN rows — one per SIO of that unit — and every
 * row's cell says HOW YOU DID on that activity for that outcome: a disc in
 * the accuracy tier colour with the number, a hollow ring when you have not
 * tried it, a dash when there is nothing to try. The three activities every
 * outcome has (xPlain · 4Mémoire · WorDrill) are buttons on the row, not
 * columns. State lives in the URL (`?activity=…&unit=N`) so a chip, a flap
 * or a bookmark all land on the same screen; the four activity hubs that
 * used to list decks now redirect here with their activity preselected.
 *
 * `?gaps=1` is Dan's authoring backlog: every activity × SIO with no content,
 * all fifty rows, counts per column.
 *
 * Data: src/lib/indexMatrix.ts (which activity is a chip and why, cell hrefs
 * via deckActivityTabs) and src/lib/activityLedger.ts (the device-local
 * tally recordResponse writes).
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import CahierShell, { withActive } from "@/components/CahierShell";
import MyDecks from "@/app/MyDecks";
import { siteTabs, UNIT_ACCENTS } from "@/components/siteTabs";
import { activity } from "@/content/activities";
import { SIOS, UNIT_META, type Sio } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { nextSioId } from "@/lib/continuer";
import { accuracyFor, LEDGER_EVENT, loadLedger, tierToken, type Ledger } from "@/lib/activityLedger";
import { cellHref, chipActivities, gapCells, isFocusKey, lessonAuthored, rowButtonActivities, siosOfUnit, type FocusKey } from "@/lib/indexMatrix";
import { isSioDone, loadProgress, type Progress } from "@/lib/progress";
import { searchDecks } from "@/lib/search";

const UNITS = [0, 1, 2, 3, 4];

type UrlState = { activity: FocusKey; unit: number; gaps: boolean };

function readUrl(fallbackUnit: number): UrlState {
  const q = new URLSearchParams(window.location.search);
  const a = q.get("activity");
  const u = q.get("unit");
  return {
    activity: isFocusKey(a) ? a : "speculearn",
    unit: u !== null && /^[0-4]$/.test(u) ? Number(u) : fallbackUnit,
    gaps: q.get("gaps") === "1",
  };
}

function writeUrl(s: UrlState) {
  const q = new URLSearchParams();
  q.set("activity", s.activity);
  q.set("unit", String(s.unit));
  if (s.gaps) q.set("gaps", "1");
  window.history.replaceState(null, "", `${window.location.pathname}?${q}`);
}

// The page's external state — URL, progress, ledger — as ONE subscription
// (useSyncExternalStore: the sanctioned way to read browser state without a
// set-state-in-effect). The snapshot is a version number that bumps on
// popstate, a progress save, a ledger write or our own replaceState; the
// server snapshot is -1, which renders the empty shell until hydration.
const URL_EVENT = "fluolingo:index-url";
let version = 0;
function subscribe(cb: () => void) {
  const bump = () => { version += 1; cb(); };
  const evs = ["popstate", "fluolingo:progress-updated", LEDGER_EVENT, URL_EVENT];
  evs.forEach((e) => window.addEventListener(e, bump));
  return () => evs.forEach((e) => window.removeEventListener(e, bump));
}

export default function ActivitiesIndexPage() {
  const tick = useSyncExternalStore(subscribe, () => version, () => -1);
  const mounted = tick >= 0;
  const [q, setQ] = useState("");

  // Progress + ledger + URL, on the client only (static export). The default
  // unit is where the learner is on the path — the same stop Home's
  // ▶ Continue points at — so the Index opens on their ten rows.
  const { progress, ledger, url } = useMemo(() => {
    if (!mounted) return { progress: null as Progress | null, ledger: {} as Ledger, url: null as UrlState | null };
    const p = loadProgress();
    const next = SIOS.find((s) => s.id === nextSioId(p));
    return { progress: p, ledger: loadLedger(), url: readUrl(next?.unit ?? 0) };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick IS the dependency: it names the external state
  }, [mounted, tick]);

  const set = (patch: Partial<UrlState>) => {
    if (!url) return;
    writeUrl({ ...url, ...patch });
    window.dispatchEvent(new Event(URL_EVENT));
  };

  const chips = useMemo(() => chipActivities(), []);
  // On a phone the rail scrolls; keep the selected chip in view (a deep link
  // to VocabulaRain must not land on a rail showing SpecuLearn).
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = railRef.current;
    const on = rail?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!rail || !on) return;
    const left = on.offsetLeft - rail.offsetLeft;
    if (left < rail.scrollLeft || left + on.offsetWidth > rail.scrollLeft + rail.clientWidth) {
      rail.scrollTo({ left: Math.max(0, left - 12), behavior: "auto" });
    }
  }, [url?.activity]);
  const buttons = useMemo(() => rowButtonActivities(), []);

  // Word-level search (Dan, 2026-07-08) — « bruine » finds the weather
  // outcome. A live query overrides the unit: hits from every unit, in
  // course order, with the matched words under the label.
  const hits = useMemo(() => {
    if (!q.trim()) return null;
    const m = new Map(searchDecks(q).map((h) => [h.deck.id, h]));
    return { map: m, sios: SIOS.filter((s) => s.collectionId && m.has(s.collectionId)) };
  }, [q]);

  if (!url) {
    return (
      <CahierShell tabs={withActive(siteTabs(), "index")} active="index">
        <div className="mx-auto max-w-2xl px-3 pt-2" aria-busy="true" />
      </CahierShell>
    );
  }

  const act = activity(url.activity)!;
  const rows: Sio[] = hits ? hits.sios : siosOfUnit(url.unit);
  const accent = UNIT_ACCENTS[url.unit];

  return (
    <CahierShell tabs={withActive(siteTabs(), "index")} active="index">
      <div className="index-page mx-auto max-w-2xl px-3 pb-6 pt-2">
        {/* ONE row on every width (Dan, 2026-07-20): heading + search. */}
        <div className="flex flex-nowrap items-center gap-3">
          <h1 className="cahier-display shrink-0 text-2xl font-black text-[color:var(--cahier-ink)]">📖 Index</h1>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 bruine, aller…"
            aria-label="Search words and decks"
            className="w-full min-w-0 max-w-xs flex-1 rounded-full border-[3px] border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl)]/40 px-4 py-2 text-sm font-black text-[color:var(--cahier-ink)] shadow-[3px_3px_0_var(--cahier-ink)] outline-none placeholder:font-bold placeholder:text-[color:var(--cahier-ink)]/60 focus:bg-[color:var(--cahier-paper-raised)]"
          />
        </div>

        {url.gaps ? (
          <GapsView onClose={() => set({ gaps: false })} />
        ) : (
          <>
            {/* The chip rail — one activity at a time. Horizontal scroll on
                phones, no wrap: seven chips, the selected one in its own hue. */}
            <div ref={railRef} role="tablist" aria-label="Activity" className="index-chips -mx-3 mt-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {chips.map((a) => {
                const on = a.key === url.activity;
                return (
                  <button
                    key={a.key}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    title={a.blurb}
                    onClick={() => set({ activity: a.key as FocusKey })}
                    className="index-chip fluo-mono shrink-0 whitespace-nowrap rounded-full border-2 px-3 py-1.5 text-xs font-black leading-none transition"
                    style={{
                      borderColor: on ? a.hue : "var(--cahier-line-strong)",
                      background: on ? a.hue : "var(--cahier-paper-raised)",
                      color: on ? "var(--cahier-paper-raised)" : "var(--cahier-ink)",
                    }}
                  >
                    <span aria-hidden>{a.emoji}</span> {a.name}
                  </button>
                );
              })}
            </div>

            {/* The unit segmented control — five equal segments, the selected
                one in its unit accent. Dimmed while a search is live (search
                spans all units). */}
            <div
              role="group"
              aria-label="Unit"
              className="index-units fluo-mono mt-2 grid grid-cols-5 overflow-hidden rounded-xl border-2 text-xs font-black"
              style={{ borderColor: "var(--cahier-ink)", opacity: hits ? 0.45 : 1 }}
            >
              {UNITS.map((u) => {
                const on = u === url.unit && !hits;
                return (
                  <button
                    key={u}
                    type="button"
                    aria-pressed={on}
                    onClick={() => { setQ(""); set({ unit: u }); }}
                    className="py-2 leading-none"
                    style={{
                      background: on ? UNIT_ACCENTS[u] : "var(--cahier-paper-raised)",
                      color: on ? "var(--cahier-paper-raised)" : "var(--cahier-ink)",
                    }}
                  >
                    <span aria-hidden>{UNIT_META[u]?.emoji}</span> U{u}
                  </button>
                );
              })}
            </div>

            {hits && hits.sios.length === 0 && (
              <p className="mt-4 text-sm font-bold text-[color:var(--cahier-ink-soft)]">No results for « {q} »</p>
            )}

            {/* The ten rows. */}
            <ol className="index-rows mt-3 divide-y-2 overflow-hidden rounded-xl border-2" style={{ borderColor: hits ? "var(--cahier-line-strong)" : accent, background: "var(--cahier-paper-raised)" }}>
              {rows.map((sio) => {
                const href = cellHref(url.activity, sio);
                const done = progress ? isSioDone(sio.id, progress) : false;
                const pct = accuracyFor(ledger, url.activity, sio.id);
                const rowAccent = UNIT_ACCENTS[sio.unit];
                const hit = hits && sio.collectionId ? hits.map.get(sio.collectionId) : undefined;
                const label = sio.short;
                return (
                  <li key={sio.id} className="index-row flex items-center gap-1.5 px-1.5 py-1.5 sm:gap-2 sm:px-2" style={{ borderColor: "var(--cahier-line)" }}>
                    {/* The stop — the number the learner tapped on Home; ✓ once
                        the outcome is marked done. Links back to that stop. */}
                    <Link
                      href={`/?unit=${sio.unit}#${sio.id}`}
                      aria-label={`${sio.id} — ${sio.topic}`}
                      title={sio.topic}
                      className="index-stop fluo-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-black no-underline"
                      style={{
                        background: done ? "var(--tier-good)" : rowAccent,
                        color: "var(--cahier-paper-raised)",
                      }}
                    >
                      {done ? "✓" : sio.num}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div lang="fr" className="truncate text-[13px] font-bold text-[color:var(--cahier-ink)] sm:text-sm" title={sio.topic}>
                        <span className="sm:hidden">{label}</span>
                        <span className="hidden sm:inline">{sio.topic}</span>
                      </div>
                      {hit && hit.words.length > 0 && (
                        <div className="truncate text-xs text-[color:var(--cahier-ink-soft)]">
                          {hit.words.map((w, i) => (
                            <span key={w.id}>
                              {i > 0 && " · "}
                              <b lang="fr">{w.fr}</b> — {w.en}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* THE CELL — how you did on this activity for this outcome. */}
                    <ResultCell activityName={act.name} sio={sio} href={href} pct={pct} />

                    {/* The three every outcome has. */}
                    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                      {buttons.map((b) => {
                        const h = cellHref(b.key, sio);
                        // `?activity=flip` (the 4Mémoire flap) focuses a button:
                        // it wears its hue and the cell reports that activity.
                        const on = b.key === url.activity;
                        return h ? (
                          <Link
                            key={b.key}
                            href={h}
                            aria-label={`${b.name} — ${sio.topic}`}
                            aria-current={on ? "true" : undefined}
                            title={b.name}
                            className="index-btn flex h-7 w-7 items-center justify-center rounded-lg border-2 text-sm no-underline transition hover:-translate-y-0.5 sm:h-8 sm:w-8 sm:text-base"
                            style={{ borderColor: on ? b.hue : "var(--cahier-line-strong)", background: on ? `color-mix(in srgb, ${b.hue} 22%, var(--cahier-paper-raised))` : "var(--cahier-paper-raised)" }}
                          >
                            <span aria-hidden>{b.emoji}</span>
                          </Link>
                        ) : (
                          <span key={b.key} aria-hidden className="flex h-7 w-7 items-center justify-center text-[color:var(--cahier-ink-faint)] sm:h-8 sm:w-8">—</span>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}

        {/* The learner's own shelf — deck-building is a library action, so it
            lives here, not on Home (Dan, 2026-07-05: "Home = where am I,
            Index = the library"). */}
        <section className="fluo-h-5 mt-6">
          <div className="mb-2 flex items-center gap-2 rounded-xl px-4 py-2" style={{ background: "var(--fluo-card-accent)" }}>
            <span aria-hidden>✨</span>
            <span className="fluo-serif font-black" style={{ color: "var(--cahier-paper-raised)" }}>Your decks</span>
          </div>
          <MyDecks bare />
          <Link href="/decks/new" className="fluo-btn fluo-btn-sm mt-3 inline-flex">
            ➕ Nouveau deck
          </Link>
        </section>
      </div>
    </CahierShell>
  );
}

/**
 * The cell. Three states, one glyph each:
 *   disc, tier colour, the number   → you tried it; this is your accuracy
 *   hollow ring                     → content is there; you have not
 *   dash                            → nothing authored for this pair
 */
function ResultCell({ activityName, sio, href, pct }: { activityName: string; sio: Sio; href: string | null; pct: number | null }) {
  if (!href) {
    return (
      <span
        aria-label={`${activityName} — nothing yet for ${sio.topic}`}
        title={`${activityName} — nothing yet`}
        className="index-cell index-cell-none flex h-9 w-9 shrink-0 items-center justify-center text-[color:var(--cahier-ink-faint)]"
      >
        —
      </span>
    );
  }
  const tried = pct !== null;
  return (
    <Link
      href={href}
      aria-label={tried ? `${activityName} — ${sio.topic}: ${pct}%` : `${activityName} — ${sio.topic}`}
      title={tried ? `${pct}%` : activityName}
      className={`index-cell ${tried ? "index-cell-tried" : "index-cell-open"} fluo-mono flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] text-[0.7rem] font-black no-underline transition hover:scale-110`}
      style={
        tried
          ? { borderColor: tierToken(pct), background: tierToken(pct), color: "var(--cahier-paper-raised)" }
          : { borderColor: "var(--cahier-ink)", background: "var(--cahier-paper-raised)", color: "var(--cahier-ink)" }
      }
    >
      {tried ? pct : ""}
    </Link>
  );
}

/**
 * `?gaps=1` — Dan's authoring backlog. All fifty outcomes × the seven chip
 * activities + xPlain-authored, a mark where nothing exists, a count per
 * column. Not linked from anywhere a learner goes.
 */
function GapsView({ onClose }: { onClose: () => void }) {
  const chips = chipActivities();
  const cols = [...chips, activity("lesson")!];
  const gaps = gapCells();
  const missing = (key: string, sio: Sio) => gaps.some((g) => g.key === key && g.sio.id === sio.id);
  const count = (key: string) => gaps.filter((g) => g.key === key).length;
  const decksById = new Map(CURATED.map((c) => [c.id, c]));
  return (
    <div className="index-gaps mt-3">
      <div className="flex items-center gap-2">
        <span className="fluo-mono text-xs font-black text-[color:var(--cahier-ink)]">
          {gaps.length} gaps
        </span>
        <button type="button" onClick={onClose} className="fluo-btn fluo-btn-ghost fluo-btn-sm ml-auto">
          ← Index
        </button>
      </div>
      <div className="mt-2 overflow-x-auto rounded-xl border-2" style={{ borderColor: "var(--cahier-ink)", background: "var(--cahier-paper-raised)" }}>
        <table className="w-full text-left text-xs">
          <thead>
            <tr style={{ background: "var(--cahier-hover)" }}>
              <th className="px-2 py-1.5" />
              {cols.map((a) => (
                <th key={a.key} className="fluo-mono px-1 py-1.5 text-center font-black" title={a.name}>
                  <span aria-hidden>{a.emoji}</span>
                  <span className="sr-only">{a.name}</span>
                  <div style={{ color: count(a.key) ? "var(--tier-weak)" : "var(--tier-good)" }}>{count(a.key)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIOS.map((sio, i) => {
              const first = i === 0 || SIOS[i - 1].unit !== sio.unit;
              const deck = sio.collectionId ? decksById.get(sio.collectionId) : undefined;
              return (
                <tr key={sio.id} className={first ? "border-t-2" : "border-t"} style={{ borderColor: first ? UNIT_ACCENTS[sio.unit] : "var(--cahier-line)" }}>
                  <td className="max-w-[6.5rem] truncate px-1.5 py-1 font-bold text-[color:var(--cahier-ink)] sm:max-w-[12rem] sm:px-2" title={`${sio.id} · ${sio.topic} · ${deck?.id ?? "no deck"}`}>
                    <span className="fluo-mono mr-1" style={{ color: UNIT_ACCENTS[sio.unit] }}>{sio.num}</span>
                    <span lang="fr">{sio.short}</span>
                  </td>
                  {cols.map((a) => {
                    const gap = a.key === "lesson" ? !lessonAuthored(sio) : missing(a.key, sio);
                    return (
                      <td key={a.key} className="px-1 py-1 text-center" style={gap ? { background: "var(--tier-weak-soft)" } : undefined}>
                        <span aria-label={`${a.name} — ${sio.id}: ${gap ? "missing" : "present"}`} style={{ color: gap ? "var(--tier-weak)" : "var(--cahier-line-strong)" }}>
                          {gap ? "—" : "·"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
