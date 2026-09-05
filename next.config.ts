import type { NextConfig } from "next";

/**
 * PAGES_BASE_PATH exists because the GitHub Pages preview can sit in a FOLDER.
 *
 *   frenchprof.github.io/fluoduo/   a project site -> needs basePath /fluoduo
 *   any custom domain, at its root  -> needs basePath "" (the default)
 *
 * The Cloudflare hosts — the live ones, and staging — are always domain roots,
 * so they never set it and are unaffected by anything here.
 *
 * WHICH ONE THE PREVIEW IS depends on a setting in GitHub's dashboard, not on
 * anything in this repository, and it has been changed by hand twice without
 * the build changing with it: attached in August (17 days of 404s), cleared
 * between 2 and 5 Sep (404s again, mirrored). So the Pages workflow now
 * DECLARES its home in one line beside the build, and verify91 holds the build
 * to that declaration in both directions.
 *
 * THIS COMMENT HAS BEEN WRONG TWICE, which is worth more than the rule. It
 * asserted the subdirectory as fact while a custom domain served the root, and
 * then asserted that "NOTHING SETS IT" days before the subpath came back.
 * Every audit that read it believed it. If you are here to check how the
 * preview is served, the deploy log is the only thing in reach that cannot go
 * stale: actions/deploy-pages prints "Evaluated environment url" on every run.
 *
 * Do not hard-code a subpath here. The default must stay "" so a build with
 * the variable unset — every Cloudflare build — lands at a root.
 */
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  // Allow the dev server (HMR etc.) to be reached from other devices on the LAN
  allowedDevOrigins: ["192.168.68.60", "192.168.68.*"],
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
