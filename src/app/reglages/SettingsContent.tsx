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
import GemShelf from "@/components/GemShelf";

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

          {/* THE MAP'S WHEEL (Dan, 2026-09-11). He asked for the direction
              changed AND for the learner to be able to change it back — and
              he drew the line that matters himself: *"there are two things:
              swipe down with finger, and scroll down with mouse. don't
              confuse them"*. This switch is the WHEEL only. A finger drags
              the road and always has; that half was already right, and
              flipping the container would have flipped both.

              One switch, not two. Nobody wants to configure their mouse and
              their thumb separately.

              The line under it says what the CURRENT position means, per
              Dan's 5 Sep rule — not what the other one would do.

              REPLAYED HERE BY THE INTEGRATION LANE, 12 Sep — and this one was
              genuinely LOST, not merely moved. The four user routes became one
              tabbed page in the same hours this switch was added to the old
              /reglages, so the branch that carried the settings into this file
              was cut before the switch existed and arrived without it. Nothing
              conflicted; the control simply stopped being on the page. It was
              `verify211-map-wheel.py` that said so, reading for
              `wheelDownComesBack` and not finding it — the difference between
              this and the two stale pins resolved in the same merge is that
              those checks were pointing at the wrong file and this one was
              pointing at the right file and telling the truth. */}
          <label className="mt-4 flex items-start justify-between gap-3 border-t-2 pt-4" style={{ borderColor: "var(--cahier-line)" }}>
            <span>
              <span className="block font-bold text-[color:var(--cahier-ink)]">
                Mouse wheel on the map
              </span>
              <span className="block text-sm text-[color:var(--cahier-ink-soft)]">
                {prefs.wheelDownComesBack
                  ? "Rolling down brings the road toward you."
                  : "Rolling down travels forward, away from you."}
              </span>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={prefs.wheelDownComesBack}
              disabled={!ready}
              onChange={(e) => set("wheelDownComesBack", e.target.checked)}
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
          {/* Two columns AT LEAST (Dan, 5 Sep): a tickable row stretched
              across the whole page is a full-width button, which is against
              the rule — see AGENTS.md, "No control spans the whole width".
              On the shared tile floor since 11 Sep, so seven short rows use a
              wide screen instead of running down it in two columns; the floor
              still guarantees the two a phone needs.

              REPLAYED HERE BY THE INTEGRATION LANE, 12 Sep. This pick-list
              moved out of `reglages/page.tsx` into this file in the same
              hours that #313 put it on the shared grid, and the two branches
              never saw each other: taking this file as written would have
              reverted the grid to `grid-cols-2` with nothing failing and
              nothing in either diff looking wrong. Same shape as the
              `blankKeysFor` collision AGENTS.md records. */}
          <div className="fluo-tilegrid mt-3" style={{ ["--tile-min" as string]: "9rem", ["--tile-gap" as string]: "8px" }}>
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

        {/* WHAT GEMS BUY, AND ONLY WHAT GEMS BUY (Dan, 2026-09-12, two
            messages: "As for the 'payable' colors, move them into Settings
            instead" and "move the bouclier to settings too. but we should
            call it streak-freezer instead of bouclier"). Both left the
            profile's reward shelf for the same reason — a colour you own and
            a freezer you hold are things you ARRANGE, not things you earned.
            One balance covers both; see GemShelf's own note. */}
        <section
          className="mt-5 rounded-xl border-2 p-4"
          style={{ background: "var(--cahier-paper-raised, #fff)", borderColor: "var(--cahier-line-strong, #ddd)" }}
        >
          <h2 className="mb-2.5 text-base font-extrabold" style={{ color: "var(--cahier-ink)" }}>Gems</h2>
          <GemShelf />
        </section>
      </div>
  );
}
