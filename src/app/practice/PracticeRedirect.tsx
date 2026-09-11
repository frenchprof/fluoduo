"use client";

/** /practice is RETIRED (Dan, 2026-09-09): "all those hub pages have been
 *  made redundant by the pop ups" — the new 7-family grid ☰ menu lists
 *  SpecuLearn and MémoiRecall directly, and MémoiRecall now opens the
 *  50-stop slider pop-up instead of this gallery. Any bookmark or old link
 *  lands here and forwards to SpecuLearn, Practice's own deliberate door
 *  (see DELIBERATE_DOOR in activities.ts) — `replace`, so Back does not
 *  bounce through. */
import { useEffect } from "react";

export default function PracticeRedirect() {
  useEffect(() => {
    window.location.replace(`/practice/speculearn${window.location.search}${window.location.hash}`);
  }, []);
  return null;
}
