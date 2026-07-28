"use client";

/**
 * "This learner played this activity", logged once per visit.
 *
 * Several activities recorded every ANSWER (recordItemResult → responses) but
 * never announced the play itself, so the dashboard's play counts and its
 * activity table — both fed by `game.start` — showed nothing for GramMarathon,
 * Complete It, ConjugaZone, DéjàRevu or the Lesson drills. This is the missing
 * half, in one line per activity.
 *
 * Gated on the RESOLVED user, like PageViewTracker: Firebase restores the
 * session asynchronously, and logEvent drops anything written before it lands
 * (silently — it must never interrupt a learner). Logging on bare mount is
 * exactly how deck.open came to record almost nothing.
 */

import { useEffect, useRef } from "react";
import { useAuthUser } from "@/lib/firebase/auth";
import { logEvent } from "@/lib/firebase/usage";

export function useActivityPlay(game: string, collectionId?: string): void {
  const user = useAuthUser();
  const uid = user?.uid;
  const logged = useRef<string | null>(null);
  useEffect(() => {
    if (!uid) return;
    const key = `${uid}:${game}:${collectionId ?? ""}`;
    if (logged.current === key) return;
    logged.current = key;
    void logEvent("game.start", { game, ...(collectionId ? { collectionId } : {}) });
  }, [uid, game, collectionId]);
}
