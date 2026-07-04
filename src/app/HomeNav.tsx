"use client";

import Link from "next/link";
import { useState } from "react";

const UNITS = [
  { id: "unit-0", label: "Unité 0", emoji: "👋", accent: "#e0567f" },
  { id: "unit-1", label: "Unité 1", emoji: "🪪", accent: "#2bb6c2" },
  { id: "unit-2", label: "Unité 2", emoji: "🎉", accent: "#e3a700" },
  { id: "unit-3", label: "Unité 3", emoji: "🗺️", accent: "#8a5fd4" },
  { id: "unit-4", label: "Unité 4", emoji: "🍽️", accent: "#e8852e" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Right-side sticky tab rail — rendered outside the page element, CSS shows it ≥1100px. */
export function HomeNavTabs() {
  return (
    <nav className="cahier-tabs" aria-label="Jump to unit">
      {UNITS.map((u) => (
        <button
          key={u.id}
          type="button"
          onClick={() => scrollTo(u.id)}
          className="cahier-tab"
          style={{ "--tab-hue": u.accent } as React.CSSProperties}
        >
          <span aria-hidden>{u.emoji}</span>
          <span>{u.label}</span>
        </button>
      ))}
      <Link href="/activities" className="cahier-tab" style={{ "--tab-hue": "#5b8def" } as React.CSSProperties}>
        <span aria-hidden>🗂️</span>
        <span>Index</span>
      </Link>
    </nav>
  );
}

/** Burger menu for narrow screens — rendered inside the page header, CSS shows it <1100px. */
export function HomeNavBurger() {
  const [open, setOpen] = useState(false);

  return (
    <div className="cahier-menu relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fluo-btn fluo-btn-sm"
        aria-expanded={open}
        aria-label="Navigation"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 rounded-xl border-2 border-[color:var(--fluo-line)] bg-[var(--cahier-paper,#fbfbf6)] shadow-lg">
          {UNITS.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => { scrollTo(u.id); setOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-bold text-[color:var(--cahier-ink,#2a2e6e)] hover:bg-[#f0f0ea] first:rounded-t-xl last:rounded-b-xl"
              style={{ borderLeft: `4px solid ${u.accent}` }}
            >
              <span aria-hidden>{u.emoji}</span>
              <span>{u.label}</span>
            </button>
          ))}
          <Link
            href="/activities"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-bold text-[color:var(--cahier-ink,#2a2e6e)] hover:bg-[#f0f0ea] last:rounded-b-xl"
            style={{ borderLeft: "4px solid #5b8def" }}
          >
            <span aria-hidden>🗂️</span>
            <span>Index</span>
          </Link>
        </div>
      )}
    </div>
  );
}
