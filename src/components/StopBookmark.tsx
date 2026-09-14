"use client";

/**
 * The editable stop number — the bookmark's face (Dan, 2026-09-02: "we need
 * a way for users to book mark the stop that they have left off … For the
 * home page, we can make the stop number indicator editable. For the map,
 * could that editable indicator be placed to the left of zoom control").
 *
 * It LOOKS like the reading it replaced — « 46/50 » — because it is that
 * reading: the number shown is the current stop, computed or bookmarked.
 * Editing it writes the bookmark; clearing it erases the bookmark and the
 * computed reading returns. The chrome (well, font, size) stays the
 * parent's — this component is only the number, the slash and the total,
 * so Home's hand-written well and the map's mono control row each dress
 * it as their own.
 */
import { useState } from "react";
import { SIOS } from "@/content/sios";
import { saveBookmark } from "@/lib/continuer";

export default function StopBookmark({
  stopNo,
  totalClassName,
}: {
  /** The current stop's number — bookmark if set, computed otherwise. */
  stopNo: number;
  /**
   * How to set « /50 », and OMIT IT TO DROP IT ENTIRELY (Dan, 2026-09-14:
   * *"the numbered stop-indicatpr, why on earth did you add '/50' it pushed
   * down my map"*).
   *
   * The total is not new — it has been in this component since #211 — but on
   * the MAP it fails Dan's own rule from 1 Sep: *a count earns its place when
   * it describes what you cannot see*. The map draws all fifty stops on
   * screen; the denominator is the one number a learner is already looking at,
   * and on that row it was spending width and height the map wanted.
   *
   * Optional rather than deleted, because the total is right wherever the
   * fifty are NOT on screen — which is what this component is for elsewhere.
   */
  totalClassName?: string;
}) {
  // While the learner is typing, the field is theirs — committing on every
  // keystroke would bookmark "4" on the way to "46". Commit on Enter/blur.
  const [draft, setDraft] = useState<string | null>(null);

  // A save elsewhere (the other surface, another tab) must not be fought by
  // a stale draft here — when the shown number changes underneath, the draft
  // yields. Adjusted during render (the React-documented idiom), not in an
  // effect, so there is no flash of the stale draft.
  const [lastStop, setLastStop] = useState(stopNo);
  if (lastStop !== stopNo) {
    setLastStop(stopNo);
    setDraft(null);
  }

  const commit = () => {
    if (draft === null) return;
    const n = Number(draft.trim());
    if (draft.trim() === "") saveBookmark(null);
    else if (Number.isInteger(n) && n >= 1 && n <= SIOS.length) saveBookmark(n);
    setDraft(null);
  };

  // Two digits at rest — « 01 », never « 1 » (Dan, 7 Sep: "I need the
  // editable stop field to have two digits, so 01 would be shown in this
  // case"). Only the RESTING face pads; while the learner types, the field
  // shows their keystrokes untouched, and a committed "7" comes back "07".
  const shown = String(stopNo).padStart(2, "0");

  return (
    <>
      <input
        type="text"
        inputMode="numeric"
        value={draft ?? shown}
        aria-label={`Your stop, 1 to ${SIOS.length} — edit it to bookmark one`}
        title="Your stop. Edit it to bookmark where you left off; clear it to go back to automatic."
        onFocus={(e) => {
          setDraft(shown);
          e.target.select();
        }}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") setDraft(null);
        }}
        /* All the dressing lives in globals.css under this class — the
           cahier shells skin every input with a white box at a specificity
           no utility class can beat, so the escape has to be CSS too. */
        className="fluo-bookmark"
      />
      {totalClassName ? <span className={totalClassName}>/{SIOS.length}</span> : null}
    </>
  );
}
