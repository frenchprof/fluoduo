"use client";

/**
 * Réglages — FluOlin User's fourth segment.
 *
 * Dan, 2026-08-10: "We can allow users to toggle back the words under User
 * (Moi) Settings. So 5. FluOlin User needs to include Settings."
 *
 * It has exactly one setting today and that is fine. The point of the page is
 * that there is now somewhere for the next one to go — every preference in the
 * app currently lives in its own ad-hoc localStorage key inside the component
 * that owns it, which is why nothing is discoverable and nothing is resettable.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import CahierShell, { withActive } from "@/components/CahierShell";
import { siteTabs } from "@/components/siteTabs";
import { DEFAULTS, readUiPrefs, writeUiPrefs, type UiPrefs } from "@/lib/uiPrefs";
import { FAMILIES, familyShort } from "@/content/activities";

export default function ReglagesPage() {
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
    /* `active=""` until 1 Sep, which is the emptiest possible answer to
       "which page is this?" — familyOf("") returns null before it looks
       anything up, so Settings had no spine, no family ink and no heading
       band, and its title sat as a bare <h1> on plain paper. `reglages` was
       already mapped to the user family; the page simply never said so. */
    <CahierShell tabs={withActive(siteTabs(), "reglages")} active="reglages" band={{ title: "Settings" }}>
      <div className="mx-auto max-w-2xl px-2 pb-8 pt-2">
        {/* « Settings » is the band's now (1 Sep). */}
        {/* gap-5, not gap-2: these rows are 20px tall, so the fat-finger
            floor (fluo-hit44) pads them — the halos need room apart. */}
        <div className="mt-2 flex gap-5 text-sm font-bold">
          <Link href="/moi" className="fluo-hit44 no-underline text-[color:var(--cahier-accent,#2f4fa8)]">My Progress</Link>
          <Link href="/leaderboard" className="fluo-hit44 no-underline text-[color:var(--cahier-accent,#2f4fa8)]">Leaderboard</Link>
          <Link href="/profil" className="fluo-hit44 no-underline text-[color:var(--cahier-accent,#2f4fa8)]">Profile</Link>
        </div>

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
                  ? "Names are shown under activity tiles and the bottom bar."
                  : "Tiles show the icon only. Tap and hold one to see its name."}
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
      </div>
    </CahierShell>
  );
}
