"use client";

/** /games is RETIRED (Dan, 2026-09-09: "retire /games") — the last of the
 *  three hub pages the new 7-family grid ☰ menu made redundant (Skills and
 *  Practice went first; Games was the one he hedged on, "nearly all", until
 *  now). Unlike those two, none of Games' three members (NumBus, VocabulaRain,
 *  LexicaLocker) has a plain page you'd send a learner to without a picker in
 *  front of it — they're all three pop-up-gated in the ☰ menu. VocabulaRain's
 *  own gallery is the pick: the same shape of door as Skills→VoixLà and
 *  Practice→SpecuLearn, one real member page rather than the hub. Any
 *  bookmark or old link lands here and forwards — `replace`, so Back does
 *  not bounce through. */
import { useEffect } from "react";

export default function GamesRedirect() {
  useEffect(() => {
    window.location.replace(`/games/vocabularain${window.location.search}${window.location.hash}`);
  }, []);
  return null;
}
