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

export default function ReglagesPage() {
  const [prefs, setPrefs] = useState<UiPrefs>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPrefs(readUiPrefs());
    setReady(true);
  }, []);

  function set<K extends keyof UiPrefs>(key: K, value: UiPrefs[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
    writeUiPrefs({ [key]: value } as Partial<UiPrefs>);
  }

  return (
    <CahierShell tabs={withActive(siteTabs(), "")} active="">
      <div className="mx-auto max-w-2xl px-2 pb-8 pt-2">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">⚙️ Réglages</h1>

        <div className="mt-2 flex gap-2 text-sm font-bold">
          <Link href="/moi" className="no-underline text-[color:var(--cahier-accent,#2f4fa8)]">Mon progrès</Link>
          <Link href="/leaderboard" className="no-underline text-[color:var(--cahier-accent,#2f4fa8)]">Classement</Link>
          <Link href="/profil" className="no-underline text-[color:var(--cahier-accent,#2f4fa8)]">Profil</Link>
        </div>

        <section
          className="mt-5 rounded-xl border-2 p-4"
          style={{ background: "var(--cahier-paper-raised, #fff)", borderColor: "var(--cahier-line-strong, #ddd)" }}
        >
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={prefs.showNavLabels}
              disabled={!ready}
              onChange={(e) => set("showNavLabels", e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0"
            />
            <span>
              <span className="block font-bold text-[color:var(--cahier-ink)]">
                Toujours afficher les mots sous les icônes
              </span>
              <span className="block text-sm text-[color:var(--cahier-ink-soft)]">
                Sinon, appuyez longuement sur une icône pour voir son nom.
              </span>
            </span>
          </label>
        </section>
      </div>
    </CahierShell>
  );
}
