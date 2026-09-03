import type { NextConfig } from "next";

/**
 * PAGES_BASE_PATH is a subdirectory escape hatch, and NOTHING SETS IT.
 *
 * Both live sites are served at a DOMAIN ROOT, so both build with it unset and
 * basePath stays "":
 *
 *   fluolingo.com               GitHub Pages, built by pages-preview.yml.
 *                               A CUSTOM DOMAIN, and a custom domain serves a
 *                               Pages site at the root — the /fluoduo project
 *                               path stops being the address the moment one is
 *                               attached.
 *   fluolingo.withdrchan.com    Cloudflare Pages, built from dckg/fluo, which
 *                               deploy-live.yml mirrors main into.
 *
 * THIS COMMENT USED TO SAY the opposite — that GitHub Pages serves "a project
 * site from a SUBDIRECTORY (frenchprof.github.io/fluoduo/)" — and that
 * sentence outlived its truth by seventeen days. The custom domain arrived in
 * the same commit as the workflow, on 17 Aug; from that moment the build was
 * emitting /fluoduo/_next/… for a site served at /, so fluolingo.com loaded
 * its HTML and 404'd every stylesheet and script. Dan found it on 2 Sep by
 * reading the workflow. A premise written down as fact is how a config bug
 * hides in plain sight: everyone who read this file believed the subdirectory.
 *
 * The variable stays because a future subdirectory host is a real possibility
 * and hard-coding a path here would break both roots. But if you find yourself
 * setting it for a host that has a custom domain, the answer is no — see
 * verify91.
 */
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  // Allow the dev server (HMR etc.) to be reached from other devices on the LAN
  allowedDevOrigins: ["192.168.68.60", "192.168.68.*"],
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
