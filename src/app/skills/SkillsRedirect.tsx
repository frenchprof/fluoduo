"use client";

/** /skills is RETIRED (Dan, 2026-09-09): the family it hubbed split into
 *  Oral and Tools, and the new 7-family grid ☰ menu lists every activity
 *  directly — a hub page aggregating them is exactly the redundant page
 *  this restructure retires. Any bookmark or old link lands here and
 *  forwards to VoixLà, Oral's own deliberate door (see DELIBERATE_DOOR in
 *  activities.ts) — `replace`, so Back does not bounce through. */
import { useEffect } from "react";

export default function SkillsRedirect() {
  useEffect(() => {
    window.location.replace(`/tts${window.location.search}${window.location.hash}`);
  }, []);
  return null;
}
