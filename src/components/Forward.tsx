"use client";

/**
 * A route that has moved, kept answering at its old address.
 *
 * `/carte` had its own copy of this from the day it was renamed `/map`, and
 * `/unit/<n>` a third; the pre-tests' move under SpecuLearn (2026-09-07) would
 * have been the fourth. `replace`, never `push`, so the browser's Back does
 * not bounce a learner through a page that no longer exists — and the query
 * and hash travel with them, because a deep link into a stop is the whole
 * reason these stubs are kept.
 */
import { useEffect } from "react";

export default function Forward({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(`${to}${window.location.search}${window.location.hash}`);
  }, [to]);
  return null;
}
