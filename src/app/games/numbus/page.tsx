import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive, UNIT_ACCENTS } from "@/components/siteTabs";
import { NUMBUS_LINES } from "@/games/numbus/lines";

/** The NumBus gallery — Cahier skin like every other section page, one grid,
 *  each tile a route with the range it calls out. */

const EXTRA = "#e0567f";

export default function NumBusIndexPage() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="numbus" crumb="🚌 NumBus">
      <div className="mx-auto max-w-3xl px-4 pb-4 pt-2">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
          🚌 NumBus
          <span className="ml-2 text-sm font-bold text-[color:var(--cahier-ink-soft)]">
            type the number you hear before the bus pulls away
          </span>
        </h1>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {NUMBUS_LINES.map((l) => {
            const accent = l.unit === null ? EXTRA : UNIT_ACCENTS[l.unit];
            return (
              <Link
                key={l.id}
                href={`/games/numbus/${l.id}`}
                className="flex items-center gap-2.5 rounded-xl border-2 border-b-4 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: accent }}
              >
                <span className="text-xl" aria-hidden>{l.emoji}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-black leading-tight text-[color:var(--cahier-ink)]" lang="fr">
                    {l.scale}
                  </span>
                  <span className="block truncate text-[11px] font-bold" style={{ color: accent }}>
                    {l.unit === null ? l.place : `U${l.unit}`}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </CahierShell>
  );
}
