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
 * SINCE 2026-09-08 AN ACTIVITY MAY OWN ITS COLOUR OUTRIGHT, which is why this
 * reads `stripOf` and not `bandOf` (Dan: *"ConjugaZone pages should be in Teal
 * colored strip ok"*). That does not reopen the ruling above — ConjugaZone's
 * BAND is still `prod`, so the teacher's record still says what it demands.
 * What changed is that the demand no longer has to be the only thing the
 * colour can say. The reason this file follows rather than keeping the band is
 * the sentence three lines up: the same activity wearing two colours on two
 * screens is the fault activities.ts exists to end, and a teal page with an
 * orange tile in the ☰ would have been exactly that.
 *
 * The tile is decorative: it is `aria-hidden`, and every caller prints the
 * activity's NAME beside it. Colour reinforces, never carries alone — the
 * rule the band system has followed since it was introduced.
 */
import { stripOf } from "@/content/activities";

export default function ActivityIcon({
  activityKey,
  emoji,
  size = "md",
}: {
  /** Registry key — `stripOf` reads this, so it must be the key, not the name. */
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
  const band = stripOf(activityKey);
  const box = size === "sm" ? "h-7 w-7 rounded-lg text-base" : "h-10 w-10 rounded-xl text-xl";
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center ${box}${band ? ` band-${band}` : ""}`}
      style={{ background: "var(--band, var(--cahier-paper-2))" }}
    >
      {emoji}
    </span>
  );
}
