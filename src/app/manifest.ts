import type { MetadataRoute } from "next";

// next.config sets `output: "export"` (the site is a static bundle on
// Cloudflare Pages), and a metadata route has to opt in explicitly or the
// export refuses to collect it.
export const dynamic = "force-static";

/**
 * The web app manifest — what makes FluOLinGo installable.
 *
 * Until this file existed there was NO way back in. No manifest, no service
 * worker, no notification of any kind: a student on a phone had no icon to
 * tap, so returning meant remembering a URL and typing it, on a device built
 * entirely around icons. Every other retention idea optimises a loop whose
 * entrance was missing (DOPAMINE_REVIEW §1).
 *
 * Deliberately NOT a service worker. Offline caching for a site whose whole
 * job is recording answers for learning analytics is a synchronisation problem
 * we have not designed for, and a stale cached bundle is a worse failure than
 * a missing one. This is the icon and the standalone window, nothing more.
 *
 * `id` is pinned so a future path change cannot orphan installs.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "FluOLinGo — French A1 for LAF1201",
    short_name: "FluOLinGo",
    description:
      "French A1 practice for NUS LAF1201 — vocabulary games, speech drills, spaced revision and an AI tutor.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // The kraft paper and the ink, so the OS chrome matches the page rather
    // than framing it in white.
    background_color: "#faf6ee",
    theme_color: "#312620",
    categories: ["education"],
    lang: "fr",
    dir: "ltr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Separate art with the safe area respected — a launcher that crops to a
      // circle would otherwise clip the notebook's binding.
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
