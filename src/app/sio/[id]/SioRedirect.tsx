"use client";

/** `replace`, so Back does not bounce through the old SIO page. */
import { useEffect } from "react";

export default function SioRedirect({ href }: { href: string }) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);
  return null;
}
