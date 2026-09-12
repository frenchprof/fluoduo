"use client";

/**
 * THE SWITCH — a chunky pill with the state written inside it.
 *
 * Dan drew it on 1 Sep for the map's 2D/3D control ("can the 2D 3D switch look
 * more like this", with two pictures: a knob at one end and the label in the
 * empty half at the other, each in its own colour). Later the same day, on the
 * deck page's 📖/✍️ control: *"the study-test switch should be redone like the
 * 2D 3D switch."* So it stops being one page's control and becomes the app's.
 *
 * WHAT THE SHAPE IS FOR. A knob alone says a switch is on or off; it does not
 * say on or off OF WHAT, and a caption outside it ("3D view", "Study") names
 * the property without naming the state — a knob sitting left beside the words
 * "3D view" answers neither question. Two characters inside the track answer
 * both, and the caption's removal then costs a learner nothing, which is Dan's
 * litmus test.
 *
 * THE GEOMETRY IS FIXED AND THE LABEL DEPENDS ON IT. Track 72, padding 4, knob
 * 28, so the travel is 36 and the free half is 36 wide; the label is pinned 10
 * from the end the knob is NOT at, which clears it by 6px in both positions. A
 * caller passing a long word would overrun that, which is why the labels are
 * two-or-three characters by contract and asserted by verify80.
 */

type Hue = "focus" | "reward" | "win" | "streak";

const KNOB: Record<Hue, string> = {
  focus: "linear-gradient(155deg, color-mix(in oklab, var(--dopa-focus) 55%, white) 0%, var(--dopa-focus) 52%, color-mix(in oklab, var(--dopa-focus) 70%, black) 100%)",
  reward: "linear-gradient(155deg, color-mix(in oklab, var(--dopa-reward) 55%, white) 0%, var(--dopa-reward) 52%, color-mix(in oklab, var(--dopa-reward) 70%, black) 100%)",
  win: "linear-gradient(155deg, color-mix(in oklab, var(--dopa-win) 55%, white) 0%, var(--dopa-win) 52%, color-mix(in oklab, var(--dopa-win) 70%, black) 100%)",
  streak: "linear-gradient(155deg, color-mix(in oklab, var(--dopa-streak) 55%, white) 0%, var(--dopa-streak) 52%, color-mix(in oklab, var(--dopa-streak) 70%, black) 100%)",
};

const INK: Record<Hue, string> = {
  focus: "var(--dopa-focus-ink)",
  reward: "var(--dopa-reward-ink)",
  win: "var(--dopa-win-ink)",
  streak: "var(--dopa-streak-ink)",
};

export default function PillSwitch({
  on,
  onFlip,
  offLabel,
  onLabel,
  offSpoken,
  onSpoken,
  offHue = "focus",
  onHue = "reward",
  label,
  title,
  className = "",
}: {
  on: boolean;
  onFlip: (next: boolean) => void;
  /** What the pill SHOWS. Two or three characters, or one emoji — the free
   *  half of the track is 36px wide and a word does not fit in it. */
  offLabel: string;
  onLabel: string;
  /**
   * What a screen reader HEARS, where the visible label is not words. « 📖 »
   * is a fine thing to look at and a useless thing to be read aloud, so the
   * study–test switch shows the emoji and says "Study" / "Test". Defaults to
   * the visible label, which is right for « 2D » / « 3D ».
   */
  offSpoken?: string;
  onSpoken?: string;
  offHue?: Hue;
  onHue?: Hue;
  /** What the switch is FOR, for a screen reader. The visible label is the
   *  state; this is the property, and it never appears on screen. */
  label: string;
  title?: string;
  className?: string;
}) {
  const name = on ? onLabel : offLabel;
  const spoken = on ? (onSpoken ?? onLabel) : (offSpoken ?? offLabel);
  const hue = on ? onHue : offHue;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`${label}: ${spoken}`}
      title={title ?? `${label} — ${spoken}`}
      onClick={() => onFlip(!on)}
      className={`neo-well relative flex fluo-switch shrink-0 items-center rounded-full p-[4px] transition ${className}`}
    >
      {/* The knob wears the same hue as the word, so the pill reads as one
          object in one state rather than a coloured word next to a neutral
          part. The label sits at the end the knob is not at, and swaps with
          it — pinned to one side it would be underneath in one position. */}
      <span
        aria-hidden
        className="fluo-mono absolute top-1/2 -translate-y-1/2 text-[16px] font-black leading-none tracking-tight"
        style={{ [on ? "left" : "right"]: "10px", color: INK[hue] }}
      >
        {name}
      </span>
      {/* A rounded SQUARE, as Dan drew it — the same corner-radius family as
          the keys it sits beside, so a row of controls reads as one set of
          physical parts rather than a switch borrowed from somewhere else. */}
      <span
        aria-hidden
        // SPRINGY, LIKE A REAL SWITCH (Dan, 6 Sep: "and switches — pareil").
        // duration-200 ease-out slid the knob to the far end and stopped dead,
        // which is how a slider on a screen moves and not how a switch in the
        // hand does: a real one is thrown, arrives with momentum and settles.
        // .fluo-spring carries the same overshoot curve the stops and the keys
        // use, so every throwable thing in the app answers the same way.
        // .fluo-spring sits AFTER the size, not before it: verify80 reads the
        // knob's height straight out of this string with `neo-key block h-[Np]`
        // to check the travel arithmetic, and a class wedged between them makes
        // it unreadable. Better to keep their check strict than to loosen it.
        className="neo-key block fluo-switch-knob fluo-spring rounded-[9px]"
        style={{ transform: on ? "translateX(36px)" : "translateX(0)", background: KNOB[hue] }}
      />
    </button>
  );
}
