"use client";

/**
 * A "← back" that actually goes back (Dan, 2026-07-05: "clicking on the back
 * does not take me back to where i last was"). If the browser has somewhere
 * to return to, use real history — the learner lands exactly where they left
 * (unit page with its scroll, popup context, rail page…). Direct entries
 * (bookmark, shared link, new tab) fall back to the given href.
 */
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { HOME_HREF } from "@/lib/routes";

export default function BackLink({
  fallback = HOME_HREF,
  className,
  children,
}: {
  fallback?: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <a
      href={fallback}
      className={className}
      onClick={(e) => {
        if (window.history.length > 1) {
          e.preventDefault();
          router.back();
        }
      }}
    >
      {children}
    </a>
  );
}
