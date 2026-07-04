"use client";

/**
 * Mounts once in the root layout: when a user is signed in, their progress
 * follows them across devices (pull-merge on sign-in, debounced push on every
 * save). Renders nothing. The sync module is imported dynamically so this
 * component adds nothing to the static graph.
 */
import { useEffect } from "react";
import { useAuthUser } from "@/lib/firebase/auth";

export default function ProgressSync() {
  const user = useAuthUser();

  useEffect(() => {
    if (!user) return;
    let stopped = false;
    void import("@/lib/firebase/progressSync").then((m) => {
      if (!stopped) void m.startProgressSync();
    });
    return () => {
      stopped = true;
      void import("@/lib/firebase/progressSync").then((m) => m.stopProgressSync());
    };
  }, [user]);

  return null;
}
