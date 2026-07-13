"use client";

/**
 * Site-wide attendance log (Dan, 2026-07-13: "how many people was on which
 * page on which days"). Mounted once in the root layout; logs a `page.view`
 * event on every route change for SIGNED-IN users (logEvent already skips
 * anonymous visitors, and identity is stamped into the payload there). The
 * teacher dashboard (/teacher) aggregates these into a day × page table.
 *
 * Supplement pages are standalone HTML outside the app, so this tracker never
 * sees them — their visits are logged at the door instead (CahierShell's
 * trackSupplementOpen).
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthUser } from "@/lib/firebase/auth";
import { logEvent } from "@/lib/firebase/usage";

export default function PageViewTracker() {
  const pathname = usePathname();
  const user = useAuthUser();
  const uid = user?.uid;
  useEffect(() => {
    if (!uid || !pathname) return;
    void logEvent("page.view", { path: pathname });
  }, [uid, pathname]);
  return null;
}
