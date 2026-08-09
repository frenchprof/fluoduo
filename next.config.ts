import type { NextConfig } from "next";

/**
 * PAGES_BASE_PATH exists so one build can serve two hosts.
 *
 * Cloudflare Pages serves fluolingo.withdrchan.com at the DOMAIN ROOT, so the
 * variable is unset there and basePath stays "" — production is byte-identical
 * to what it was before this file changed.
 *
 * GitHub Pages serves a project site from a SUBDIRECTORY
 * (frenchprof.github.io/fluoduo/). Without basePath every stylesheet, script
 * and route would resolve to the domain root and 404. The preview workflow
 * sets PAGES_BASE_PATH=/fluoduo.
 *
 * Do not hard-code the subpath here. Hard-coding it would silently break
 * production the next time someone builds without the variable — which is the
 * same class of mistake as a config that only works on one machine.
 */
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  // Allow the dev server (HMR etc.) to be reached from other devices on the LAN
  allowedDevOrigins: ["192.168.68.60", "192.168.68.*"],
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
