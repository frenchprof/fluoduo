import Link from "next/link";
import type { ReactNode } from "react";
import { HOME_HREF } from "@/lib/routes";
import FavouriteHeart from "@/components/FavouriteHeart";

/**
 * The page's heading band — ONE structure site-wide, ONE LINE, three parts.
 *
 * Dan drew it on 2026-09-01: *"can i have all strips looking like this: (1)
 * with a X (2) with a circle and the related goal number"*, over three bands
 * reading « ✕  MémoiRecall … 🎯39 ».
 *
 *     ✕   MémoiRecall                                        (🎯39)
 *
 * WHAT EACH PART IS, and why it is that part.
 *
 *   THE ✕ is the way out, and it is on EVERY band now rather than on drills
 *   alone. It was already the drill's only exit; a page whose heading offers
 *   no way back just makes the learner find the browser's. `exitHref` decides
 *   where — a drill goes to its goal's unit, a site page to Home.
 *
 *   THE NAME is the ACTIVITY's (Dan, same day: "the word that appears must be
 *   the activity name"), never the deck's, the pre-test's or the signed-in
 *   user's. Two bands opened with one of those and both read as the same thing
 *   said twice once the goal arrived beside them.
 *
 *   THE CIRCLE is the goal, 🎯 and its number. It REPLACED an inline
 *   « GOAL 39/50 · Wants & needs », and the trade is why it is better: that
 *   text shared one line with the activity's name and truncated on four bands
 *   at 320px. A circle cannot run out of room. What the trade costs is the
 *   goal's NAME, which the map and the goal's own page still carry.
 *
 * ONE LINE, ONE THICKNESS. Before this the band stacked a title over a mono
 * sub-line, so it stood 55px where a page had a sub and 41px where it did not
 * — the site had no uniform strip because the component could be either. Every
 * band on the site now measures the same, Home's rainbow hero excepted by
 * Dan's own words ("except for the rainbow strip on the home page").
 *
 * AND NOTHING ELSE AT THE END. There was a `trailing` slot for "one extra
 * control, never a number", and one page used it — the deck's band mounted a
 * (?) that opens the Menu, which is what the ☰ two centimetres above it opens.
 * Dan found it the moment the bands were lined up side by side ("what is with
 * the question mark on the deck strip"): a slot that exists is a slot that
 * gets filled, and the band's whole claim is that it is the same three parts
 * everywhere. So the slot is gone, not just its one occupant.
 *
 * AND NO NUMBER AT THE END that is not the goal's. The old chip carried a
 * drill's i/total, the profile's outcomes done and a deck page's (?) — one
 * shape meaning three things, which is not a figure a learner can read.
 *
 * The colour comes off the page's own class, with no prop. A `band-*` class
 * (--band) wins where one is set — that is WHAT THE ACTIVITY ASKS of the
 * learner (Dan, 2026-08-26). Otherwise it falls back to the `fam-*` family ink.
 */
export default function PageBand({
  title,
  emoji,
  goal,
  exitHref = HOME_HREF,
  activeKey,
  exitLabel = "Close",
  right,
  className = "",
}: {
  /** The ACTIVITY's name — MémoiRecall, GramMarathon, MneMemo, Settings.
   *  Pass it in its natural casing; the band uppercases it in CSS. Stop names
   *  stay in sentence case and do not belong here (Dan, 2026-09-05). */
  title: ReactNode;
  /** The activity's own emoji, from the registry — 🏃 GramMarathon, 💡
   *  SpecuLearn (Dan, 2026-09-11: *"can precede each title with the emoji?
   *  we have fixed emojis for them"*). Never spelt here: the caller looks it
   *  up by the page's key, so a glyph changes in `content/activities.ts` or it
   *  does not change — the 9 Sep deduplication (🐞 🤹 🛠️ 🔐) is only worth
   *  anything if one table owns them. `aria-hidden`, because the name beside
   *  it already says which activity this is. */
  emoji?: string;
  /** The goal's number, 1–50. Omitted on a page that belongs to no goal, and
   *  the circle is then not drawn rather than drawn empty. */
  goal?: number;
  /** THE BAND'S BLANK SPACE, filled (Dan, 2026-09-14: "the link to the full
   *  guide (and to the quick start guide) to be made more prominent in the
   *  yellow colored strip within that blank space").
   *
   *  A band is a title, a ✕ and — on a goal page — a chip, which on a wide
   *  screen leaves most of a coloured strip doing nothing. This is for the one
   *  thing a page's band can usefully carry. It sits BEFORE the goal chip so
   *  the chip stays the rightmost object, and it shrinks before the title does.
   *  Optional everywhere: a band given nothing draws nothing, as before. */
  right?: ReactNode;
  /** Where the ✕ goes. A drill passes its goal's unit; a site page takes Home. */
  exitHref?: string;
  exitLabel?: string;
  className?: string;
  /** CahierShell's `active` key, so the heart can ASK which page this is
   *  rather than guess it from the path — see lib/favouriteHere's note on why
   *  guessing named WorDrill « FluOLinGo ». */
  activeKey?: string;
}) {
  return (
    <header
      className={`page-band flex items-center gap-2 py-3 pl-4 pr-3 sm:pl-6 ${className}`}
      style={{ background: "var(--strip, var(--fam-ink, var(--cahier-ink)))", borderBottom: "3px solid var(--cahier-ink)" }}
    >
      {/* -my-1 keeps a 36px tap target without growing the band: the title
          line is 28px inside py-2, so an untrimmed control would add height
          and give back less than it saved. */}
      <Link
        href={exitHref}
        aria-label={exitLabel}
        className="fluo-hit44 -my-1 -ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl font-black text-black/60 no-underline transition hover:bg-black/10 hover:text-black"
      >
        ✕
      </Link>
      {/* ONE LINE. `min-w-0` lets the flex child shrink below its content and
          `truncate` cuts what is left — without the first, the second never
          fires and a long name pushes the goal circle off the band. */}
      {/* `min-w-0` IS LOAD-BEARING AND STAYS (verify82): it is what lets the
          title shrink and truncate instead of pushing the row wider, which is
          Dan's 1 Sep rule that every strip is one line and the same thickness.
          A floor was tried here when the heart made /guide's band too full and
          the title read « Gui… »; it bought two characters and cost the rule.
          The room comes out of the EMOJI instead — see below. */}
      <p className="min-w-0 flex-1 truncate leading-none">
        {/* SPELT THE WAY THE NAME IS SPELT (Dan, 2026-09-11, shown the two side
            by side: *"GramMarathon instead of GRAMMARATHON"*). This REVERSES
            5 Sep's "the names of activities in FULL caps", and the reason that
            ruling gave is the one thing that had to be answered rather than
            dropped: caps were chosen because "the coloured strip name of
            activity is a little too tiny", and capitals fill the em where
            lower case leaves headroom above the x-height. So the type goes up
            two steps and the band an extra 8px with it — otherwise spelling it
            properly costs presence, which is what the caps bought.

            What it buys back is the capital in the MIDDLE. GRAMMARATHON is one
            unbroken block of letters; GramMarathon shows it is two words, and
            so do WorDrill, VocabulaRain, ÉcouTexte and MémoiRecall. The names
            were always stored this way — the shouting was only ever CSS, which
            is also why a screen reader said "SpecuLearn" and not
            "S-P-E-C-U-L-E-A-R-N" either way.

            The letter-spacing goes with the caps that needed it: a
            hand-lettered face set in CAPS at a tight fit reads as a solid
            block and 0.045em was what separated the letters again. Mixed case
            has its own ascenders and descenders doing that job. */}
        <span
          className="fluo-band-hand leading-none text-black"
          /* fontWeight inline, NOT `font-bold`: .fluo-band-hand declares
             font-weight 600 and globals.css is imported after Tailwind, so a
             utility of equal specificity loses to it. Measured: the class
             version computed to 600. The weight is not shared with the other
             users of .fluo-band-hand (the English on a practice card), so it
             belongs on the element rather than in the class. */
          style={{ fontSize: "calc(var(--fs-h2) * 1.35)", fontWeight: 700 }}
        >
          {/* A BAND THAT CARRIES A KEY DROPS ITS EMOJI. Measured at 430px: the
              guide's strip is 398px and its four parts — ✕, title, « 📖 Full
              guide here », 🤍 — want more than that, so the title truncated to
              « Gui… ». Of the two things in the title, the NAME is what the
              band is for and the glyph is decoration; 🧑‍🏫 is a ZWJ sequence
              costing about a third of the title's width on its own. So the
              emoji yields first, and only on the bands that have a key to make
              room for — every other band keeps it exactly as before. */}
          {emoji && !right && <span aria-hidden className="mr-1.5">{emoji}</span>}
          {title}
        </span>
      </p>
      {right && <div className="min-w-0 shrink truncate [&>a]:max-w-full [&>a]:truncate">{right}</div>}
      {goal != null && (
        <span
          aria-label={`Goal ${goal}`}
          /* THE CHIP CARRIES AN INK EDGE (Dan, 2026-09-09, looking at the
             bands side by side: *"the horizontal strips for conjugazone and
             mnememo looks off"*).

             Measured, on the built export: the chip's chartreuse sits at hue
             71 degrees and MneMemo's band at 69 — TWO DEGREES APART. On every
             other band the two are 35 to 166 degrees apart, so the pill reads
             as an object; on the lesson's olive it read as a lighter smudge of
             the band it sits on. Luminance was never the problem (the fill is
             1.8-2.0:1 against all five bands alike), which is why this is an
             EDGE and not a different fill: an outline separates the chip on a
             band of any hue, and the other four keep the colour they have.

             A shadow ring rather than a border, so the 36px height the band's
             one-line rule depends on does not grow by 4px. */
          className="fluo-mono -my-1 flex h-9 shrink-0 items-center gap-0.5 rounded-full px-2 text-[13px] font-black leading-none"
          style={{
            background: "var(--cahier-hl)",
            color: "var(--cahier-ink)",
            boxShadow: "0 0 0 2px var(--cahier-ink)",
          }}
        >
          <span aria-hidden>🎯</span>
          <span aria-hidden>{goal}</span>
        </span>
      )}
      {/* 🤍 AT THE END OF THE BAND, ON EVERY PAGE (Dan, 2026-09-14: *"can you
          put 🤍 at the end of each colore band. When users tap on it, they
          favourite it and it becomes ❤️"*).

          AFTER the goal chip, which reverses this file's own note that the
          chip "stays the rightmost object" — the chip is a LABEL and the heart
          is a CONTROL, and the end of the strip is where a control that acts
          on the whole page belongs. Nothing about the chip changes; it simply
          is no longer last.

          The bar's ★ becomes the door to the LIST only, because this is now
          the way a page is saved — see FavouriteHeart. */}
      <FavouriteHeart activeKey={activeKey} />
    </header>
  );
}
