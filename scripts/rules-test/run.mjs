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

/* A DEAD EMULATOR IS AN ANSWER, NOT SOMETHING TO WAIT OUT. The wait is 240 s
 * so a cold runner can finish downloading; but when the process has already
 * EXITED, no amount of waiting will open the port, and the four minutes buy
 * nothing but a slower red build. CI spent them twice over a wrong JDK pin
 * before this existed. `waitFor` bails the moment this flips. */
let emuDead = false;

/* 240 s, not 60. The 60 came from this container, where firebase-tools and the
 * emulator JAR were already cached; a COLD GitHub runner fetches both before
 * the port ever opens, and the first CI run timed out at 60 s mid-download.
 * The wait costs nothing on a warm run — it returns the moment the port
 * answers — so the number only has to be larger than the worst cold start. */
async function waitFor(url, tries = 240) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.ok) return true; } catch { /* not up yet */ }
    if (emuDead) return false;          // it exited; the port is never coming
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

/* THE EMULATOR'S OUTPUT IS KEPT, NOT DISCARDED. The first CI run of this
 * workflow died on "emulator never came up" and the log said nothing else,
 * because this spawn used stdio:"ignore" — so the one question worth asking
 * (was it downloading, or was it broken?) had no answer anywhere. Buffered
 * here and printed only if the wait times out: quiet on a green run, and
 * diagnosable on a red one. */
let emuLog = "";
const bin = process.env.FIREBASE_BIN;          // set by CI, which installs it once
/* REFUSE TO RUN AGAINST AN EMULATOR THIS SCRIPT DID NOT START, and this guard
 * is here because its absence faked a pass. A stale emulator from an earlier
 * invocation was still holding the port; the "cold start" test connected to it
 * and reported 9 PASS in 1.4 seconds with the emulator JAR deleted — a result
 * that was measuring the OLD process, with whatever rules it was last given.
 * A port that already answers is not a convenience, it is a different
 * experiment. */
{
  let taken = false;
  try { taken = (await fetch(`http://127.0.0.1:${PORT}/`)).ok; } catch { taken = false; }
  if (taken) {
    console.error(`\n  Port ${PORT} is already answering — something else is running there.`);
    console.error("  Stop it first; this script must own the emulator it tests against,");
    console.error("  or the rules it thinks it loaded are not the rules being enforced.\n");
    process.exit(2);
  }
}

const emu = bin
  ? spawn(bin, ["emulators:start", "--only", "firestore", "--project", PROJECT],
          { cwd: WORK, stdio: ["ignore", "pipe", "pipe"], detached: true })
  : spawn("npx", ["--yes", "firebase-tools@15", "emulators:start", "--only", "firestore",
                  "--project", PROJECT], { cwd: WORK, stdio: ["ignore", "pipe", "pipe"], detached: true });
emu.stdout?.on("data", (d) => { emuLog += d; });
emu.stderr?.on("data", (d) => { emuLog += d; });
emu.on("exit", () => { emuDead = true; });
/* KILL THE GROUP, NOT THE CHILD. `firebase emulators:start` is a launcher: the
 * thing holding the port is a JAVA process it spawned. SIGTERM to the launcher
 * alone left that Java running, so the NEXT run of this script found port 8181
 * still answering and stopped at the guard above with exit 2 — a clean tree
 * looking like a broken setup. Measured: after a green run the port still
 * returned 200. `detached: true` puts the launcher in its own process group,
 * and a negative pid signals the whole group. */
const stop = () => {
  try { process.kill(-emu.pid, "SIGTERM"); }
  catch { try { emu.kill("SIGTERM"); } catch { /* already gone */ } }
};
process.on("exit", stop); process.on("SIGINT", () => { stop(); process.exit(130); });

let failed = false;
try {
  if (!await waitFor(`http://127.0.0.1:${PORT}/`)) {
    console.error("\n  The emulator never opened port " + PORT + ". Its own output:\n");
    console.error(emuLog || "  (nothing — the process produced no output at all)");
    throw new Error("emulator never came up");
  }

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
    for (const suite of ["attacks.mjs", "legit-paths.mjs", "favourites.mjs"]) {
      const code = await new Promise((res) =>
        sh("node", [join(HERE, suite), path, `${suite.replace(".mjs", "")} · ${label}`],
           { cwd: ROOT }).on("exit", res));
      if (code !== 0 && !COMPARE) failed = true;   // main's copy is expected to fail attacks
    }
  }
} finally { stop(); }

process.exit(failed ? 1 : 0);
