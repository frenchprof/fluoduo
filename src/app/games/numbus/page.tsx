import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive, UNIT_ACCENTS } from "@/components/siteTabs";
import { NUMBUS_ROUTES } from "@/games/numbus/lines";

const EXTRA = "#e0567f";

export default function NumBusIndexPage() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="numbus" crumb="🚌 NumBus">
      <div className="mx-auto max-w-3xl px-4 pb-4 pt-2">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
          🚌 NumBus
          <span className="ml-2 text-sm font-bold text-[color:var(--cahier-ink-soft)]">
            hear the number — type the digits before time runs out
          </span>
        </h1>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-2">
          {NUMBUS_ROUTES.map((r) => {
            const accent = r.unit === null ? EXTRA : UNIT_ACCENTS[r.unit];
            return (
              <Link
                key={r.id}
                href={`/games/numbus/${r.id}`}
                className="flex items-center gap-2.5 rounded-xl border-2 border-b-4 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: accent }}
              >
                <span className="text-xl" aria-hidden>{r.emoji}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-black leading-tight text-[color:var(--cahier-ink)]" lang="fr">
                    {r.brand === "NumBus" ? r.scale : r.brand}
                  </span>
                  <span className="block truncate text-[11px] font-bold" style={{ color: accent }}>
                    {r.brand === "NumBus" ? r.place : r.scale}
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
