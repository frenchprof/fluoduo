"use client";

/**
 * The Settings body, lifted out of `/reglages` so the framed copy inside the
 * User page and the standalone route render the SAME component and cannot
 * drift — the pattern `/profil/embed` set on 2026-09-07.
 *
 * The three sibling links that used to sit at the top (My Progress ·
 * Leaderboard · Profile) are gone: they were the only navigation of their kind
 * in the app, on the only page that had them, and the User tab strip above now
 * carries all four — including Settings itself, which that row never did.
 */
import { useEffect, useState } from "react";
import { DEFAULTS, readUiPrefs, writeUiPrefs, type UiPrefs } from "@/lib/uiPrefs";
import { FAMILIES, familyShort } from "@/content/activities";
import AccentColours from "@/components/AccentColours";

export default function SettingsContent() {
  const [prefs, setPrefs] = useState<UiPrefs>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The saved prefs live in localStorage, which cannot be read during
    // render (the site is statically exported) — this mount effect has to
    // seed them. Block-disabled: the rule reports only the first setState it
    // meets, and which one that is differs between local and CI eslint.
    /* eslint-disable react-hooks/set-state-in-effect */
    setPrefs(readUiPrefs());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function set<K extends keyof UiPrefs>(key: K, value: UiPrefs[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
    writeUiPrefs({ [key]: value } as Partial<UiPrefs>);
  }

  return (
      <div className="mx-auto max-w-2xl px-2 pb-8 pt-2">
        {/* « Settings » is the band's now (1 Sep). */}

        <section
          className="mt-5 rounded-xl border-2 p-4"
          style={{ background: "var(--cahier-paper-raised, #fff)", borderColor: "var(--cahier-line-strong, #ddd)" }}
        >
          {/* A switch, and the line under it says what the CURRENT position
              means (Dan, 5 Sep: "settings description should change based on
              choice") — not what the other one would. */}
          <label className="flex items-start justify-between gap-3">
            <span>
              <span className="block font-bold text-[color:var(--cahier-ink)]">
                Icon labels
              </span>
              <span className="block text-sm text-[color:var(--cahier-ink-soft)]">
                {prefs.showNavLabels
                  ? "Icon labels are always shown."
                  : "Tap and hold an icon to view its label."}
              </span>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={prefs.showNavLabels}
              disabled={!ready}
              onChange={(e) => set("showNavLabels", e.target.checked)}
              className="fluo-switch mt-1"
            />
          </label>
        </section>

        {/* Dan, 2026-09-05: "the bottom bar is optional and users can opt to
            remove it or to replace the items there (but there should be some
            defaults)." Six rows in FAMILIES order — membership is the choice,
            the order never is. Unticking all six removes the bar; the Revise
            due count then moves to a badge on the ☰ button. */}
        <section
          className="mt-5 rounded-xl border-2 p-4"
          /* no hex fallbacks here — the tokens are always defined, and
             verify19b counts every raw hex in components */
          style={{ background: "var(--cahier-paper-raised)", borderColor: "var(--cahier-line-strong)" }}
        >
          <p className="font-bold text-[color:var(--cahier-ink)]">Bottom bar — choose your tabs</p>
          {/* Two columns (Dan, 5 Sep): a tickable row stretched across the
              whole page is a full-width button, which is now against the
              rule — see AGENTS.md, "No control spans the whole width". */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {FAMILIES.map((f) => (
              <label
                key={f.key}
                className="flex items-center gap-2 rounded-lg border-2 px-2.5 py-2"
                style={{ background: `var(--fam-${f.key}-wash)`, borderColor: "var(--cahier-line-strong)" }}
              >
                <input
                  type="checkbox"
                  checked={prefs.bottomNav.includes(f.key)}
                  disabled={!ready}
                  onChange={(e) =>
                    // Rebuilt from FAMILIES, never appended: whatever a
                    // learner ticks, the bar keeps FAMILIES order.
                    set(
                      "bottomNav",
                      FAMILIES.filter((g) =>
                        g.key === f.key ? e.target.checked : prefs.bottomNav.includes(g.key),
                      ).map((g) => g.key),
                    )
                  }
                  className="h-5 w-5 shrink-0"
                />
                <span aria-hidden className="text-lg">{f.emoji}</span>
                {/* The hand face in heavy bold — narrower, so the label
                    fits its half-width tile (Dan, 5 Sep). */}
                <span className="fluo-btn-hand text-base text-[color:var(--cahier-ink)]">{familyShort(f)}</span>
              </label>
            ))}
          </div>
        </section>

        {/* THE ACCENT COLOURS (Dan, 2026-09-12: "As for the 'payable' colors,
            move them into Settings instead"). They used to sit in the profile's
            THRILLS shop; a colour you own is a preference, not an achievement,
            and preferences live here. */}
        <section
          className="mt-5 rounded-xl border-2 p-4"
          style={{ background: "var(--cahier-paper-raised, #fff)", borderColor: "var(--cahier-line-strong, #ddd)" }}
        >
          <h2 className="mb-2.5 text-base font-extrabold" style={{ color: "var(--cahier-ink)" }}>Accent colour</h2>
          <AccentColours />
        </section>
      </div>
  );
}
