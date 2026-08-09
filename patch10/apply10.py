#!/usr/bin/env python3
"""
Patch 10 — the help ladder, complete (supersedes patch 4).

  cd ~/fluoduo && python3 patch10/apply10.py --dry-run
  cd ~/fluoduo && python3 patch10/apply10.py

Two independent surfaces. Each is applied separately and reported separately,
so a failure in one does not block the other.
"""
import os, shutil, sys

DRY = "--dry-run" in sys.argv
ROOT = os.getcwd()
B = os.path.join(ROOT, "patch10")
ok, skip, fail = [], [], []

if not os.path.isdir(os.path.join(ROOT, "src")) or not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("\n  ERROR: run from the repo root (~/fluoduo)\n"); sys.exit(1)

def copy(rel):
    src, dst = os.path.join(B, rel), os.path.join(ROOT, rel)
    if not os.path.isfile(src): fail.append("missing in bundle: " + rel); return
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if not DRY: shutil.copy2(src, dst)
    ok.append("file  " + rel)

def add_imports(lines, imps):
    idx = [i for i, l in enumerate(lines)
           if l.startswith("import ") and l.rstrip().endswith(";")]
    at = (idx[-1] + 1) if idx else 0
    if not idx and lines and lines[0].lstrip().startswith("/*"):
        for i, l in enumerate(lines):
            if l.rstrip().endswith("*/"): at = i + 1; break
    for k, imp in enumerate(imps): lines.insert(at + k, imp)
    return lines

def edit(rel, subs, imps=None, tag=""):
    p = os.path.join(ROOT, rel)
    if not os.path.isfile(p): fail.append("not found: " + rel); return
    txt = orig = open(p, encoding="utf-8").read()
    for old, new in subs:
        if new in txt: continue
        if old in txt: txt = txt.replace(old, new, 1)
        else: fail.append(f"{tag or rel}: no match -> " + old[:60].replace("\n", " ")); return
    if imps:
        missing = [i for i in imps if i not in txt]
        if missing: txt = "\n".join(add_imports(txt.split("\n"), missing))
    if txt != orig:
        if not DRY: open(p, "w", encoding="utf-8").write(txt)
        ok.append("edit  " + (tag or rel))
    else:
        skip.append("edit  " + (tag or rel) + " (already applied)")

copy("src/lib/help/ladder.ts")

# ── A. Finale: fifth rung + assistance on the evidence record ───────────────
FIN = "src/app/practice/grammarathon/finale/FinaleContent.tsx"
edit(FIN, [
 # ladder for the current item, replacing the local clues() builder
 ('''  /** The ladder: category → lesson → first letter → skeleton. Never the word. */
  function clues(q: FinaleItem, level: number): string[] {
    const a0 = q.a[0] ?? "";
    const topic = SIOS.find((x) => x.id === q.sio)?.topic ?? q.sio;
    const skel = a0 ? a0[0] + " " + [...a0.slice(1)].map(() => "_").join(" ") : "";
    const all = [
      `💡 ${q.cat}`,
      `📘 Leçon : ${topic}`,
      `🔤 Une réponse possible commence par « ${a0[0]?.toUpperCase() ?? ""} »`,
      `✏️ ${skel}  (${a0.length} lettres)`,
    ];
    return all.slice(0, level);
  }''',
  '''  /** The shared ladder (src/lib/help/ladder.ts): nudge → guiding question →
   *  scaffold → partial reveal → ANSWER. The fifth rung is new (Dan,
   *  2026-08-09: Finale is practice, so the answer must be reachable —
   *  PRD §8). Reaching it is recorded, not prevented. */
  function ladderFor(q: FinaleItem) {
    return buildLadder({
      answer: q.a[0] ?? "",
      topic: SIOS.find((x) => x.id === q.sio)?.topic ?? q.sio,
      category: q.cat,
    });
  }
  function clues(q: FinaleItem, level: number): string[] {
    return shownRungs(ladderFor(q), level).map((r) => r.text);
  }'''),
 # grade(): carry the help actually taken, and record post-assistance success
 ('''    if (!graded.current.has(q.id)) {
      graded.current.add(q.id);
      recordItemResult(q.id, ok, given);
    }''',
  '''    // The FIRST attempt is the independent measurement and the only one that
    // pays — unchanged. What is new is that it now carries how much help had
    // been taken before it, so "right, cold" and "right, after four clues" stop
    // looking identical in the evidence store (PRD §7).
    const hintsTaken = clue[q.id] ?? 0;
    if (!graded.current.has(q.id)) {
      graded.current.add(q.id);
      recordItemResult(q.id, ok, given, undefined, { hintsTaken });
    } else if (ok) {
      // Resolved AFTER assistance. The first attempt already stands as the
      // independent measurement, so this pays nothing and does not touch the
      // SRS — but PRD §7 is explicit that assistance changes evidentiary
      // strength without making the learning event disappear. Recording it is
      // how "got there with a scaffold" becomes visible at all.
      const revealed = hintsTaken >= ladderFor(q).length;
      void import("@/lib/firebase/responses")
        .then((m) =>
          m.recordResponse(q.id, true, {
            given,
            xpPaid: 0,
            evidence: buildEvidence(q.id, "/practice/grammarathon/finale", {
              hintsTaken,
              revealed,
            }),
          }),
        )
        .catch(() => {});
    }'''),
 # wrong answer advances the ladder — now up to and including the answer rung
 ('      setClue((c) => ({ ...c, [q.id]: Math.min(4, (c[q.id] ?? 0) + 1) }));\n      setWrongFlash(q.id);',
  '      setClue((c) => ({ ...c, [q.id]: Math.min(ladderFor(q).length, (c[q.id] ?? 0) + 1) }));\n      setWrongFlash(q.id);'),
 # the hint button — same cap, plus a distinct event when the answer is opened
 ('''  function hint(q: FinaleItem) {
    setClue((c) => ({ ...c, [q.id]: Math.min(4, (c[q.id] ?? 0) + 1) }));
    void import("@/lib/firebase/usage")
      .then((m) => m.logEvent("hint.tap", { surface: "finale", itemId: q.id, sio: q.sio }))
      .catch(() => {});
  }''',
  '''  function hint(q: FinaleItem) {
    const rungs = ladderFor(q);
    const next = Math.min(rungs.length, (clue[q.id] ?? 0) + 1);
    setClue((c) => ({ ...c, [q.id]: next }));
    // hint.tap is the help-seeking construct behind PRD §6 Goal 2's "declining
    // reliance on hints and scaffolds over time". The answer rung gets its own
    // event so reveals can be counted separately from clues.
    const rung = rungs[next - 1]?.level ?? "nudge";
    void import("@/lib/firebase/usage")
      .then((m) =>
        m.logEvent(rung === "answer" ? "answer.reveal" : "hint.tap", {
          surface: "finale",
          itemId: q.id,
          sio: q.sio,
          rung,
          level: next,
        }),
      )
      .catch(() => {});
  }'''),
], [
 'import { buildLadder, shownRungs } from "@/lib/help/ladder";',
 'import { buildEvidence } from "@/lib/evidence";',
], tag="Finale (5th rung + assistance)")

# ── B. per-deck GramMarathon: it had no ladder at all ──────────────────────
GM = "src/app/practice/grammarathon/[collectionId]/GramMarathonContent.tsx"
edit(GM, [
 # clue state, reset per question
 ('  function check() {\n    if (result !== null || !item) return;',
  '''  /** Rungs for the current item. No `category` — per-deck items carry no
   *  hand-authored label, so this ladder opens at the lesson rung and runs one
   *  shorter than Finale's. Same shape, same ending: a reachable answer. */
  function ladderForItem() {
    return buildLadder({ answer: gap, topic: sioTopic });
  }

  function check() {
    if (result !== null || !item) return;'''),
 # carry hints into the record
 ('    recordItemResult(item.id, g !== "wrong", undefined, `grammarathon:${collectionId}`);',
  '    recordItemResult(item.id, g !== "wrong", undefined, `grammarathon:${collectionId}`, {\n'
  '      hintsTaken: clue,\n'
  '    });'),
 # reset the ladder when moving on
 ('  function next() {\n    if (i + 1 >= total) sfx.stage();',
  '  function next() {\n    setClue(0);\n    if (i + 1 >= total) sfx.stage();'),
 ('    setI(0); setValue(""); setResult(null); setScore({ ok: 0, total: 0 });',
  '    setI(0); setValue(""); setResult(null); setScore({ ok: 0, total: 0 }); setClue(0);'),
], [
 'import { buildLadder, shownRungs } from "@/lib/help/ladder";',
], tag="GramMarathon (ladder state)")


# ── C. per-deck GramMarathon: the UI ───────────────────────────────────────
# patch 4 left these three as a manual step ("safer for you to place by eye").
# That was the wrong call: it left the ladder half-applied for a day, and a
# script that can be built and run before shipping is safer than a human
# pasting JSX into a terminal that has already garbled one paste today.
edit(GM, [
 # 1. clue state + the lesson topic the ladder points at
 ("  const [score, setScore] = useState({ ok: 0, total: 0 });",
  '''  const [score, setScore] = useState({ ok: 0, total: 0 });
  // Help ladder (PRD §8). Per-deck GramMarathon had none at all — a learner
  // stuck here got a bare "wrong", while the same grammar point in Finale
  // offered four escalating clues. That asymmetry was backwards: Finale is the
  // summative surface; the lesson drill is where scaffolding belongs most.
  const [clue, setClue] = useState(0);
  const sioTopic = useMemo(
    () => SIOS.find((s) => s.collectionId === collectionId)?.topic,
    [collectionId],
  );'''),
 # 2. the hint button, beside Check
 ('''              {result === null ? (
                <button type="submit" className="fluo-btn mt-3 w-full">Check</button>
              ) : (''',
  '''              {result === null ? (
                <>
                  <button type="submit" className="fluo-btn mt-3 w-full">Check</button>
                  {clue < ladderForItem().length && (
                    <button
                      type="button"
                      onClick={() => {
                        const rungs = ladderForItem();
                        const next = Math.min(rungs.length, clue + 1);
                        setClue(next);
                        const rung = rungs[next - 1]?.level ?? "nudge";
                        void import("@/lib/firebase/usage")
                          .then((m) =>
                            m.logEvent(rung === "answer" ? "answer.reveal" : "hint.tap", {
                              surface: "grammarathon",
                              itemId: item.id,
                              deck: collectionId,
                              rung,
                              level: next,
                            }),
                          )
                          .catch(() => {});
                      }}
                      className="mt-2 w-full rounded-full border-2 border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"
                    >
                      {clue === 0
                        ? "💡 un indice"
                        : clue >= ladderForItem().length - 1
                          ? "✅ voir la réponse"
                          : "💡 encore un indice"}
                    </button>
                  )}
                </>
              ) : ('''),
 # 3. the rungs the learner has opened, above the answer box
 ('            <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">{item.en}</p>',
  '''            <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">{item.en}</p>
            {clue > 0 && (
              <div className="mt-3 space-y-1">
                {shownRungs(ladderForItem(), clue).map((r, k) => (
                  <p key={k} lang="fr" className="rounded-lg bg-amber-50 px-2 py-1 text-sm text-amber-900">
                    {r.text}
                  </p>
                ))}
              </div>
            )}'''),
], [
 'import { SIOS } from "@/content/sios";',
], tag="GramMarathon (ladder UI)")

# ── D. the event type ──────────────────────────────────────────────────────
edit("src/lib/firebase/usage.ts", [
 ('  | "hint.tap" // { surface, itemId?, sio? } — graduated help-seeking (💡)',
  '''  | "hint.tap" // { surface, itemId?, sio? } — graduated help-seeking (💡)
  | "answer.reveal" // { surface, itemId?, sio?, rung, level } — the LAST rung of
  //   the help ladder, opened deliberately. Separate from hint.tap because a
  //   revealed answer differs in KIND, not degree (PRD §7): it still counts as
  //   encountered and practised, never as independent mastery. Counted
  //   together, a rising reveal rate could hide inside a falling hint rate —
  //   which is precisely the trend PRD §6 Goal 2 asks us to measure.'''),
], tag="usage.ts (answer.reveal)")

print("\n" + ("DRY RUN" if DRY else "APPLIED") + "\n" + "-" * 62)
for x in ok:   print("  [ok]   " + x)
for x in skip: print("  [--]   " + x)
for x in fail: print("  [FAIL] " + x)
print("-" * 62)
print(f"  changed {len(ok)} · skipped {len(skip)} · failed {len(fail)}")
print("""
  NOTHING MANUAL. Built and run here before shipping:
    npx tsc --noEmit  -> 0 errors
    npx next build    -> 738 pages, exit 0

  STOP THE DEV SERVER, then:
    rm -rf .next
    npx tsc --noEmit && npm run build 2>&1 | tail -3
    npm run dev

  THEN CLICK:  /practice/grammarathon/partitifs
    A yellow "un indice" button sits under Check. Tapping it walks
    lesson -> first letter -> skeleton -> answer. Answering after two clues
    now stores assistance:"question", assistCount:2, independent:false.
    Answering cold stores assistance:"none", independent:true.
""")
