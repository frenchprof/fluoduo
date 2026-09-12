/**
 * An activity's icon: its emoji on a tile filled with its DEMAND band.
 *
 * Dan, 2026-08-29, on seeing the stop sheet: "actually those icons are very
 * good. i want to use them" — on the activity landing pages and in the stop
 * popup. They had existed in exactly one place, inline inside StopSheet, so
 * "use them elsewhere" meant either a second copy or this file. One copy,
 * because a duplicated tile is how the same activity ends up wearing two
 * different colours on two screens, which is the fault `activities.ts` was
 * created to end.
 *
 * WHY THE COLOUR IS THE STRIP AND NOT THE FAMILY'S HUE. It is what the
 * activity ASKS OF YOU — recognise, produce, guess — not which menu family it
 * files under (verify36, 2026-08-26). Two activities that demand the same
 * thing therefore look alike here on purpose. An activity with no strip falls
 * back to paper rather than to a colour of its own, so a missing one reads as
 * "no claim made", never as a fourth category.
 *
 * SINCE 2026-09-11 THE TILE IS THE ACTIVITY'S FAMILY, not what it demands.
 * Dan, shown a goal's seven doors in both: *"the goal sheet keys too, make them
 * family colors"*. The page strips and the ☰ menu had already moved; this was
 * the last surface left on the demand axis, and the reason it follows is the
 * sentence three lines up — the same activity wearing two colours on two
 * screens is the fault activities.ts exists to end.
 *
 * WHAT IT COSTS, NAMED RATHER THAN GLOSSED. The demand axis grouped by KIND OF
 * WORK: on goal 23 the two games and MémoiRecall all wore sky because all
 * three are "recognise". That reading is gone, and the three Practice doors —
 * SpecuLearn, MneMemo, MémoiRecall — are now one blue, so only the name tells
 * them apart. What replaces it is a grid that groups itself by family and a
 * door whose colour matches its row in the ☰ and the strip on the page it
 * opens.
 *
 * `stripOf`, `bandOf` and `BAND` are all untouched. `lib/evidence.ts` still
 * stores what the exercise demands and verify62 still holds the two together;
 * only the paint moved. ConjugaZone's own teal (`OWN_STRIP`, 8 Sep) is
 * satisfied by this rule for free — Revise IS teal.
 *
 * The tile is decorative: it is `aria-hidden`, and every caller prints the
 * activity's NAME beside it. Colour reinforces, never carries alone — the
 * rule the band system has followed since it was introduced.
 */
import { familyOf } from "@/content/activities";

export default function ActivityIcon({
  activityKey,
  emoji,
  size = "md",
}: {
  /** Registry key — `familyOf` reads this, so it must be the key, not the name. */
  activityKey: string;
  /** Optional because ShellTab's is: a hand-made tab need not carry one. */
  emoji?: string;
  /** md = the stop sheet's 40px tile; sm = 28px, for a dense 50-row list. */
  size?: "sm" | "md";
}) {
  // No emoji, no tile. An empty coloured square reads as a rendering fault,
  // and this element is decorative — the caller always prints the name — so
  // absent is the honest fallback. Registry-built tabs always have one.
  if (!emoji) return null;
  const fam = familyOf(activityKey);
  const box = size === "sm" ? "h-7 w-7 rounded-lg text-base" : "h-10 w-10 rounded-xl text-xl";
  return (
    <span
      aria-hidden
      /* `--strip` is the one token the band, the spine and the binding read, so
         a tile cannot drift from the page it opens. An activity with no family
         (/moi, /profil — SELF_COLOURED) falls back to paper, which is the same
         "no claim made" the demand axis fell back to. */
      className={`grid shrink-0 place-items-center ${box}${fam ? ` fam-${fam}` : ""}`}
      /* THE FALLBACK IS SPELT OUT, NOT LEFT TO `var()`. A custom property
         INHERITS, so `var(--strip, …)` never reaches its fallback on a page
         that sets one — measured on goal 23: WorDrill, whose key resolved to
         no family, came out in the goals page's YELLOW rather than paper,
         because the tile inherited the page's own strip. With a `fam-` class
         the element defines `--strip` itself and wins; without one there is
         nothing to read, so the fill is named outright. */
      style={{ background: fam ? "var(--strip)" : "var(--cahier-paper-2)" }}
    >
      {emoji}
    </span>
  );
}
