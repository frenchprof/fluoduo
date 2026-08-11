"use client";

/**
 * 🎖️ Profil — the one surface that ties the whole economy together (Dan,
 * 2026-07-06). Shows the learner's Level (from lifetime XP), their fire streak
 * and its XP multiplier, the badge collection, and the gem boutique where the
 * spendable balance buys cosmetics (a home accent colour) — never learning,
 * since "nothing is locked".
 */
import { useEffect, useState } from "react";
import CahierShell from "@/components/CahierShell";
import RankBadge from "@/components/RankBadge";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import {
  buyCosmetic,
  defaultProgress,
  equipCosmetic,
  loadProgress,
  type Progress,
} from "@/lib/progress";
import {
  BADGES,
  COSMETICS,
  DEFAULT_ACCENT,
  levelForXp,
  xpMultiplier,
} from "@/lib/economy";

export default function ProfilePage() {
  const [p, setP] = useState<Progress>(defaultProgress());

  useEffect(() => {
    const refresh = () => setP(loadProgress());
    refresh();
    window.addEventListener("fluolingo:progress-updated", refresh);
    return () => window.removeEventListener("fluolingo:progress-updated", refresh);
  }, []);

  const lvl = levelForXp(p.xp);
  const mult = xpMultiplier(p.streak);
  const xpPct = Math.round((lvl.into / lvl.span) * 100);
  const mastered = Object.values(p.itemSrs).filter((s) => s.intervalDays > 0).length;
  const equippedAccentId = p.cosmetics.equipped.homeAccent ?? null;

  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="profil">
      <div className="mx-auto max-w-xl px-3 py-5">
        <h1 className="cahier-display cahier-hand text-3xl font-normal text-[color:var(--cahier-ink)]">🎖️ Your Profile</h1>

        {/* Door to the learning-data mirror (Dan, 2026-07-23: access from the
            user info page). Profil = the economy; /moi = the learning. */}
        <a href="/moi" className="mt-3 flex items-center justify-between rounded-2xl border-[3px] border-slate-900 bg-yellow-100 px-4 py-3 font-black text-slate-900 shadow-[3px_3px_0_#1f2440] transition hover:-translate-y-0.5">
          <span>📊 My Progress — your strengths, weaknesses & personal tips</span>
          <span aria-hidden>→</span>
        </a>

        {/* Level + XP */}
        <section className="mt-4 rounded-2xl border-2 border-[color:var(--cahier-ink)] bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-4 border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl,#eaff00)]/50">
              <span className="text-[10px] font-bold leading-none text-[color:var(--cahier-ink)]">LVL</span>
              <span className="text-2xl font-black leading-none text-[color:var(--cahier-ink)]">{lvl.level}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="cahier-display text-xl font-black text-[color:var(--cahier-ink)]">
                <RankBadge level={lvl.level} name={lvl.name} />
              </p>
              <span className="mt-1 block h-2.5 overflow-hidden rounded-full border-2 border-[color:var(--cahier-ink)] bg-white">
                <span className="block h-full rounded-full bg-[var(--cahier-hl)] transition-all duration-500" style={{ width: `${Math.max(xpPct, 2)}%` }} />
              </span>
              <p className="mt-1 text-xs font-bold text-[color:var(--cahier-ink-soft)]">{lvl.into} / {lvl.span} XP → level {lvl.level + 1}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-[color:var(--cahier-ink)]">
            <span className="rounded-full border-2 border-[color:var(--cahier-rule)] px-3 py-1">⭐ {p.xp} XP</span>
            <span className="rounded-full border-2 border-[color:var(--cahier-rule)] px-3 py-1">
              🔥 {p.streak} d{mult > 1 && <b className="text-[color:var(--fluo-danger,#e0384e)]"> · XP ×{mult}</b>}
            </span>
            <span className="rounded-full border-2 border-[color:var(--cahier-rule)] px-3 py-1">💎 {p.gems}</span>
            <span className="rounded-full border-2 border-[color:var(--cahier-rule)] px-3 py-1">📚 {mastered} words</span>
          </div>
        </section>

        {/* Badges */}
        <section className="mt-5">
          <h2 className="cahier-display text-lg font-black text-[color:var(--cahier-ink)]">🎖️ Badges <span className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">· one-off achievements — each pays 💎</span></h2>
          <p className="text-xs text-[color:var(--cahier-ink-soft)]">
            Two separate systems: the <b>N1–N10 Level</b> (above) rises without limit with your ⭐ XP;
            <b>badges</b> are one-off trophies that pay 💎 once.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BADGES.map((b) => {
              const has = p.badges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`rounded-xl border-2 p-3 text-center ${
                    has ? "border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl,#eaff00)]/25" : "border-[color:var(--cahier-rule)] bg-white opacity-60"
                  }`}
                >
                  <div className={`text-2xl ${has ? "" : "grayscale"}`} aria-hidden>{b.icon}</div>
                  <p className="mt-1 text-sm font-black text-[color:var(--cahier-ink)]">{b.label}</p>
                  <p className="text-[11px] leading-tight text-[color:var(--cahier-ink-soft)]">{b.desc}</p>
                  <p className="mt-1 text-[11px] font-bold text-[color:var(--cahier-ink)]">{has ? "✓ earned" : `💎 ${b.gems}`}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Boutique */}
        <section className="mt-5">
          <h2 className="cahier-display text-lg font-black text-[color:var(--cahier-ink)]">Shop</h2>
          <p className="text-xs text-[color:var(--cahier-ink-soft)]">
            Your 💎 buy an <b>accent colour</b>: it repaints YOUR home page —
            the ▶ button, the progress bars, the travelled road. Purely decorative;
            nothing blocks learning.
          </p>
          <div className="mt-2 space-y-2">
            {/* Default (always free / equippable) */}
            <div className="flex items-center gap-3 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-2">
              <span className="h-6 w-6 shrink-0 rounded-full border-2 border-[color:var(--cahier-ink)]" style={{ background: DEFAULT_ACCENT }} />
              <span className="flex-1 text-sm font-bold text-[color:var(--cahier-ink)]">Default</span>
              {equippedAccentId === null ? (
                <span className="cahier-btn cahier-btn-sm cahier-btn-primary pointer-events-none">✓ Equipped</span>
              ) : (
                <button type="button" onClick={() => setP(equipCosmetic(null))} className="cahier-btn cahier-btn-sm">Equip</button>
              )}
            </div>
            {COSMETICS.map((c) => {
              const owned = p.cosmetics.owned.includes(c.id);
              const equipped = equippedAccentId === c.id;
              const affordable = p.gems >= c.cost;
              return (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-2">
                  <span className="h-6 w-6 shrink-0 rounded-full border-2 border-[color:var(--cahier-ink)]" style={{ background: c.swatch }} />
                  <span className="flex-1 text-sm font-bold text-[color:var(--cahier-ink)]">
                    {c.label}
                    {!owned && <span className="ml-1.5 text-xs font-bold text-[color:var(--cahier-ink-soft)]">💎 {c.cost}</span>}
                  </span>
                  {equipped ? (
                    <span className="cahier-btn cahier-btn-sm cahier-btn-primary pointer-events-none">✓ Equipped</span>
                  ) : owned ? (
                    <button type="button" onClick={() => setP(equipCosmetic(c.id))} className="cahier-btn cahier-btn-sm">Equip</button>
                  ) : (
                    <button
                      type="button"
                      disabled={!affordable}
                      onClick={() => setP(buyCosmetic(c.id))}
                      className="cahier-btn cahier-btn-sm cahier-btn-gold disabled:opacity-40"
                    >
                      Buy
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </CahierShell>
  );
}
