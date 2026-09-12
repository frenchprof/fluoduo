/* Start the Firestore emulator, run both rules suites, report.
 *
 * WHY A RUNNER AND NOT JUST `node attacks.mjs`. The suites need an emulator on
 * a known port, and the emulator needs to be TORN DOWN whatever happens — a
 * stray one holds the port and the next run fails for a reason that has
 * nothing to do with the rules.
 *
 * AND ONE TRAP WORTH THE PARAGRAPH. The obvious way to check a rules file is
 * `firebase emulators:exec --only firestore "true"`, which prints a cheerful
 * startup and exits 0. It does NOT compile the rules: fed a file with a
 * deliberate syntax error (`allow read: if isSignedIn(` — unclosed), it still
 * exits 0. The emulator's own REST endpoint is what actually compiles them,
 * which is why `compile()` below PUTs to :securityRules and reads the 400.
 * Checked by breaking the file on purpose and confirming the rejection names
 * the line — a validator nobody has seen fail is not a validator.
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const PORT = 8181;
const PROJECT = "demo-fluo-rules";
const COMPARE = process.argv.includes("--compare");

// A throwaway firebase project dir, so this never touches the repo root.
const WORK = join(ROOT, "node_modules", ".cache", "rules-test");
mkdirSync(WORK, { recursive: true });
writeFileSync(join(WORK, "firebase.json"), JSON.stringify({
  firestore: { rules: "firestore.rules" },
  emulators: { firestore: { port: PORT }, ui: { enabled: false } },
}));
writeFileSync(join(WORK, "firestore.rules"), readFileSync(join(ROOT, "firestore.rules")));

const sh = (cmd, args, opts = {}) => spawn(cmd, args, { stdio: "inherit", ...opts });

async function waitFor(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.ok) return true; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

/** PUT the rules at the emulator's compiler. Returns null on success, or the
 *  compiler's message ("L408:7 Unexpected 'allow'.") on a syntax error. */
async function compile(path) {
  const res = await fetch(`http://127.0.0.1:${PORT}/emulator/v1/projects/${PROJECT}:securityRules`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rules: { files: [{ name: "firestore.rules", content: readFileSync(path, "utf8") }] } }),
  });
  if (res.ok) return null;
  return JSON.parse(await res.text())?.error?.message ?? `HTTP ${res.status}`;
}

const emu = sh("npx", ["--yes", "firebase-tools@15", "emulators:start", "--only", "firestore",
                       "--project", PROJECT], { cwd: WORK, stdio: "ignore" });
const stop = () => { try { emu.kill("SIGTERM"); } catch { /* already gone */ } };
process.on("exit", stop); process.on("SIGINT", () => { stop(); process.exit(130); });

let failed = false;
try {
  if (!await waitFor(`http://127.0.0.1:${PORT}/`)) throw new Error("emulator never came up");

  const targets = [[join(ROOT, "firestore.rules"), "firestore.rules (this branch)"]];
  if (COMPARE) {
    const { execFileSync } = await import("node:child_process");
    const p = join(WORK, "main.rules");
    writeFileSync(p, execFileSync("git", ["show", "origin/main:firestore.rules"], { cwd: ROOT }));
    targets.push([p, "origin/main's copy (for comparison)"]);
  }

  for (const [path, label] of targets) {
    const err = await compile(path);
    if (err) { console.error(`\n  COMPILE FAILED — ${label}\n    ${err}`); failed = true; continue; }
    console.log(`\n  compiles clean — ${label}`);
    for (const suite of ["attacks.mjs", "legit-paths.mjs"]) {
      const code = await new Promise((res) =>
        sh("node", [join(HERE, suite), path, `${suite.replace(".mjs", "")} · ${label}`],
           { cwd: ROOT }).on("exit", res));
      if (code !== 0 && !COMPARE) failed = true;   // main's copy is expected to fail attacks
    }
  }
} finally { stop(); }

process.exit(failed ? 1 : 0);
