"use client";

/**
 * Number-key navigation for the SpecuLearn gallery (Dan, 2026-07-19: "the
 * number shortcuts don't work on /practice/speculearn"): 1–N opens the Nth
 * deck tile. Registering through useChoiceKeys makes KeyNav's two-digit SIO
 * jump stand down while the gallery is mounted — digits mean tiles here.
 */

import { useRouter } from "next/navigation";
import { useChoiceKeys } from "@/lib/useChoiceKeys";

export default function TileKeys({ hrefs }: { hrefs: string[] }) {
  const router = useRouter();
  useChoiceKeys({
    count: hrefs.length,
    onPick: (i) => {
      const href = hrefs[i];
      if (href) router.push(href);
    },
  });
  return null;
}
