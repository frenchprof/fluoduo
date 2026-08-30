"use client";

/**
 * One activity, all fifty stops — the landing an activity tile opens.
 *
 * Dan, 2026-08-29: "we shouldn't have to land on the index page at all. the
 * maps should still be the front door for everything" and, for the tiles,
 * "it takes them to the landing page that lists all the X on the website, and
 * perhaps highlight the one relevant to their latest Pre-test".
 *
 * So the two doors do different jobs, and neither is the old Index:
 *   the MAP  is how you choose a STOP — tap one, get its popup, pick anything.
 *   THIS     is how you choose a STOP once you have already chosen the
 *            ACTIVITY — every stop that has 4Mémoire, in course order.
 *
 * WHAT THIS REPLACES. `/activities` was 50 rows × 9 activity columns, then a
 * chip rail over a unit segmented control; Dan's verdict on it was "I really
 * don't understand how to read it". Its cells said how you DID; this says what
 * you can DO, which is the only question a learner opening an activity has.
 *
 * THREE DECISIONS WORTH KEEPING
 *
 * One unit open at a time (`<details name>`, exclusive accordion). Fifty rows
 * at once is the wall the Index was. `name` groups them natively; browsers
 * without exclusive accordions fall back to the effect below, which closes the
 * others by hand rather than leaving five open.
 *
 * A stop that lacks this activity GHOSTS rather than disappears. A missing row
 * says "this stop has nothing"; what it actually has is everything except this
 * one activity, and the learner needs to see the gap is in the activity, not
 * in their course. `cellHref` already answers whether the door exists, so the
 * ghost is derived, never a second list to keep in step.
 *
 * The last pre-tested stop is marked, and its unit opens first. A guess before
 * instruction is the best signal the app has for where someone actually is.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import SectionBand from "@/components/SectionBand";
import { siteTabs } from "@/components/siteTabs";
import { activity } from "@/content/activities";
import { SIOS, UNIT_META, type Sio } from "@/content/sios";
import { cellHref } from "@/lib/indexMatrix";
import { latestPretestSio, PRETEST_RECORD_EVENT } from "@/lib/pretestRecord";
import { nextSioId } from "@/lib/continuer";
import { loadProgress } from "@/lib/progress";

const UNITS = [0, 1, 2, 3, 4];

export default function ActivityLanding({ activityKey }: { activityKey: string }) {
  const act = activity(activityKey);

  // Read on mount, not during render: localStorage is not available on the
  // server and reading it in the body breaks hydration.
  const [lastSio, setLastSio] = useState<string | null>(null);
  useEffect(() => {
    const read = () => setLastSio(latestPretestSio());
    read();
    window.addEventListener(PRETEST_RECORD_EVENT, read);
    return () => window.removeEventListener(PRETEST_RECORD_EVENT, read);
  }, []);

  const rows = useMemo(
    () => SIOS.map((s) => ({ sio: s, href: cellHref(activityKey, s) })),
    [activityKey],
  );
  const have = rows.filter((r) => r.href).length;

  // Which unit opens first: the one the learner last pre-tested in, else the
  // one their next stop is in, else Unité 0.
  const [openUnit, setOpenUnit] = useState<number | null>(null);
  useEffect(() => {
    const focus = lastSio ?? nextSioId(loadProgress());
    const sio = SIOS.find((s) => s.id === focus);
    // Which unit to open is read from localStorage, which does not exist on
    // the server — so this cannot be derived during render without breaking
    // the prerender. The lint rule and that constraint genuinely disagree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenUnit(sio ? sio.unit : 0);
  }, [lastSio]);

  // `<details name>` is an exclusive accordion natively. Where it is not
  // supported the group would simply all stay open, so close the others by
  // hand — the whole point of the pattern is one unit at a time.
  const wrap = useRef<HTMLDivElement>(null);
  const onToggle = (unit: number, open: boolean) => {
    if (!open) return;
    setOpenUnit(unit);
    wrap.current?.querySelectorAll<HTMLDetailsElement>("details[name='unit']").forEach((d) => {
      if (Number(d.dataset.unit) !== unit) d.open = false;
    });
  };

  if (!act) return <main className="p-6">No activity <code>{activityKey}</code>.</main>;

  return (
    // `active` is the ACTIVITY, not the open unit. It was `unit-N`, which is
    // why every landing's coloured strip said "Unité 0" while every other page
    // in the app said its own name (Dan, 2026-08-29: "why is the coloured
    // heading strip not consistently showing the name of activity"). The strip
    // takes its label, its family wash and its demand band from `active`, so
    // this one word is the whole fix. No unit flap is marked now, which is
    // honest: this page spans all five.
    <CahierShell tabs={siteTabs()} active={activityKey}>
      {(
        <SectionBand
          family={act.family}
          label={`${act.emoji} ${act.name}`}
          gloss={act.blurb}
          pill={`${have}/50`}
        >
          <div ref={wrap} className="flex flex-col gap-2">
            {UNITS.map((u) => {
              const unitRows = rows.filter((r) => r.sio.unit === u);
              const meta = UNIT_META[u];
              const got = unitRows.filter((r) => r.href).length;
              return (
                <details
                  key={u}
                  name="unit"
                  data-unit={u}
                  open={openUnit === u}
                  onToggle={(e) => onToggle(u, (e.currentTarget as HTMLDetailsElement).open)}
                  className="overflow-hidden rounded-2xl border-2 bg-[var(--fluo-card)]"
                  style={{ borderColor: "var(--fluo-line)" }}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                    <span className="flex items-center gap-2 font-black text-[color:var(--fluo-ink)]">
                      <span aria-hidden>{meta?.emoji}</span>
                      <span>{meta?.label}</span>
                    </span>
                    <span className="fluo-mono text-xs font-bold text-[color:var(--fluo-ink-soft)]">
                      {got}/{unitRows.length}
                    </span>
                  </summary>
                  <ul className="stop-grid px-3 pb-3">
                    {unitRows.map(({ sio, href }) => (
                      <Row key={sio.id} sio={sio} href={href} act={act} isLast={sio.id === lastSio} />
                    ))}
                  </ul>
                </details>
              );
            })}
          </div>

          <p className="mt-4 text-center text-xs font-bold text-[color:var(--fluo-ink-soft)]">
            Looking for something else at a stop?{" "}
            <Link href="/map" className="underline">Open the map</Link>.
          </p>
        </SectionBand>
      )}
    </CahierShell>
  );
}

/** One stop. A whole button when the activity exists here, a dead dashed
 *  shape when it does not — the row keeps its place either way. */
function Row({
  sio,
  href,
  act,
  isLast,
}: {
  sio: Sio;
  href: string | null;
  act: NonNullable<ReturnType<typeof activity>>;
  isLast: boolean;
}) {
  const label = (
    <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[0.7rem] font-black"
        style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
      >
        {String(sio.num).padStart(2, "0")}
      </span>
      <span className="min-w-0">
        <span lang="fr" className="block truncate text-[13px] font-bold leading-tight text-[color:var(--fluo-ink)]">{sio.fr}</span>
        <span className="block truncate text-[0.7rem] text-[color:var(--fluo-ink-soft)]">{sio.short}</span>
      </span>
      {isLast && (
        <span className="fluo-label shrink-0 rounded-full border-2 px-2 py-0.5 text-[0.55rem]"
              style={{ borderColor: "var(--fluo-card-accent)", color: "var(--fluo-card-accent)" }}>
          your last pre-test
        </span>
      )}
    </span>
  );

  const base = "flex w-full items-center gap-1.5 rounded-xl border-2 px-2.5 py-2 transition";
  if (!href) {
    return (
      <li>
        <div
          aria-disabled
          title={`${act.name} has no content for this stop yet`}
          className={`${base} border-dashed opacity-45`}
          style={{ borderColor: "var(--fluo-line)" }}
        >
          {label}
          <span className="fluo-mono shrink-0 text-[0.6rem] font-bold text-[color:var(--fluo-ink-soft)]">—</span>
        </div>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={href}
        className={`${base} bg-white hover:-translate-y-0.5`}
        style={{ borderColor: isLast ? "var(--fluo-card-accent)" : "var(--fluo-line)" }}
      >
        {label}
        <span aria-hidden className="shrink-0 text-sm font-black text-[color:var(--fluo-ink)]/35">›</span>
      </Link>
    </li>
  );
}
