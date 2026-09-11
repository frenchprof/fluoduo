/**
 * Learner tutorial (Dan, 2026-07-05: "a new user might be quite lost", then
 * "way too wordy — succinct yet clear", then "needs more color"). The one
 * page where prose is allowed (the litmus rule bans it inside activities) —
 * but even here, each idea gets ONE line. Color comes from the site's six
 * unit hues (.fluo-h-*): one per step card, one per activity tile. The ✨
 * chip at the bottom left replays the guided tour.
 */
import GuideBody from "@/components/GuideBody";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";

export default function GuidePage() {
  return (
    // An explicit band title (1 Sep): `guide` resolves to a family, so this
    // page had a spine and an ink — but its name is not a flap label, so the
    // shell had nothing to put in the band and drew none. A page with a
    // family and no band is the one shape the 1 Sep chrome pass missed.
    <CahierShell tabs={tabsWithActive(siteTabs(), "guide")} active="guide" band={{ title: "Guide" }}>
      <div className="mx-auto max-w-2xl px-3 py-5">
        {/* NO « ❓ HELP! » HEADING AND NO SECOND HOME BUTTON (11 Sep rewrite).
            The band above already says GUIDE, and « Start here 🏠 » went to
            the same /home as the ▶ Continue inside GuideBody — two buttons,
            one destination. Dan's litmus test, applied to a heading and a
            control. */}
        <GuideBody />
      </div>
    </CahierShell>
  );
}
