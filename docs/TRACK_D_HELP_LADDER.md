# Track D — the help ladder inside DrillShell (spec + what shipped)

17 Aug 2026. Rows 1–7 of `docs/planning/UI_WORK_PLAN_1.md` "Track D — AI
behaviour spec". Check: `verify/verify28-trackd.py`. Code:
`src/lib/help/{ladder,hints,useHelpLadder,feedback,requestFeedback}.ts`,
`src/lib/help/evalCases.json`, `src/components/{DrillShell,OpenFeedback}.tsx`,
`functions/api/feedback.js`.

Everything below is IMPLEMENTED unless marked *(spec only)*. Thresholds
Dan is asked to confirm are in `docs/STATUS.md`.

## 0. Principles (from PRD §7–8, AGENTS.md, and the patch 3–12 evidence model)

- The answer must ultimately be reachable — but **never handed over before one
  real attempt**, and never by the learner merely idling.
- Help changes the *evidentiary strength* of an answer, not the learning event:
  a hinted or revealed answer still counts as practised, never as independent
  mastery. The stored fields already exist (`assistance`, `assistCount`,
  `independent`, `evidenceType`, `outcomeId` on `users/{uid}/responses`) —
  the ladder WRITES them truthfully.
- Rules before models. A hint must be instant and offline. The LLM touches
  only **open production**, through a Pages Function, with a rule-based
  fallback; the learner is never blocked on the network.
- One control (`?`), the rung visible in the shell bar, explanations behind
  WHY (litmus test), English chrome, French where it teaches.

## 1. State machine (row 1) — `src/lib/help/ladder.ts`

```
FRESH ──wrong──▶ TRY ──wrong×N | idle | ?──▶ HINT_1 ──▶ HINT_2 ──▶ REVEAL
  │               │                            │           │          │
  └── correct ────┴──────── correct ───────────┴───────────┘          ▼
                                   ▼                          RETRY_AFTER_REVEAL
                                 DONE ◀──── correct | wrong | skip ──────┘
```

| state | meaning |
|---|---|
| `FRESH` | item shown; no attempt, no help |
| `TRY` | ≥ 1 wrong attempt, no help yet |
| `HINT_1`, `HINT_2` | first / second rule-based rung on screen |
| `REVEAL` | the answer is on screen; the task cannot be retried (MCQ, flashcard) |
| `RETRY_AFTER_REVEAL` | the answer is on screen AND the input is open once more (typed, cloze, dictation, say, ordering, open) |
| `DONE` | closed — a correct answer, or a miss the learner moved past |

Events: `attempt {correct}`, `help` (the learner tapped `?`), `tick`
(the 1 s idle clock), `skip` (Continue without another attempt). The
transition function `step(ladder, event) → {ladder, effect, auto}` is pure
(no clock, no React) and returns one of `none | hint | reveal | done`.

**What "stuck" is** (`LADDER_CONFIG`, per task kind):

| kind | wrong tries at a rung → climb | idle at a rung → climb (hints only) | `?` before an attempt | reveal cold | retry after reveal |
|---|---|---|---|---|---|
| mcq | 1 | never | no | no | no |
| cloze | 1 | 20 s | yes | no | yes |
| typed | 1 | 20 s | yes | no | yes |
| dictation | 1 | 30 s | yes | no | yes |
| say | 2 | 30 s | yes | no | yes |
| ordering | 1 | 20 s | yes | no | yes |
| flashcard (4Mémoire test) | 1 | never | yes | **yes** | no |
| open | 2 | never | yes | no | yes |

Rules the machine enforces (unit table in verify28, 66 rows):
- Escalation is learner-initiated (`?`) OR automatic on stuck. Auto-climb
  by *wrong tries* may reach REVEAL (a wrong try IS the one real attempt);
  auto-climb by *idle* stops at HINT_2.
- `?` cannot open REVEAL before one attempt (except flashcard test — "reveal
  then check" is what a flashcard is for). MCQ has no cold hint: its first
  rung is the struck wrong pick.
- After REVEAL, one attempt closes the item either way; `skip` closes it.
- `DONE` is terminal.

## 2. Reveal rules by task context (row 2) — `src/lib/help/hints.ts` `hintsFor(kind, item)`

Rungs are computed from the item, at most two before the answer. Each rung
carries the assistance level it amounts to (nudge / question / scaffold /
partial) — decided by what it gives away, not by its position.

| kind | rung 1 | rung 2 | REVEAL shows | wired in |
|---|---|---|---|---|
| **mcq** | (≥ 3 options) the wrong pick is struck — "Not that one — pick again" *(scaffold)* | (≥ 4 options) strike distractors down to two — "One of two" *(partial)* | the answer highlighted; Continue | EtuDice, SpecuLearn (word/image), lesson MCQ cards |
| **cloze** | gender/POS/lemma nudge if the item has one *(nudge)*, else first letter + letter count *(scaffold)* | skeleton `d _ _` + the model sentence with the gap blanked *(partial)* | the gap; input reopens: "Type it" | GramMarathon, lesson gap cards |
| **typed** | as cloze (article → gender) | as cloze | the answer (+ accepted alternates); "Type it" | iComplete, lesson build/translate cards |
| **dictation** | word count + first letter *(scaffold)* | skeleton *(partial)* | the sentence | *(spec only — ÉcouTexte is a multi-blank sheet with its own per-sentence reveal; a check after that reveal is now recorded as assisted and queued, see §3)* |
| **say** | how it starts + letter count *(scaffold)* | skeleton *(partial)* | the written form + model voice; "Say it" | WorDrill (the 🔤 peek IS the answer rung; V key), SpecuLearn 🎤 |
| **ordering** | as typed | as typed | the sentence | lesson build cards with tiles (typed path) |
| **flashcard** | as typed | as typed | the answer (no retype) | 4Mémoire test (`?` replaces 💡 Révéler) |
| **open** | the SIO topic *(question)* | the model sentence blanked *(partial)* | model answer ("Model answer" mode) | lesson end write (§7) |

A 2-option MCQ has no rungs — the only hint IS the answer, so a wrong pick
reveals (as before). Pretests are cold diagnostics and stay off the ladder.
Study mode of 4Mémoire self-marks — no ladder.

**Evidence tagging after assistance** (`evidenceOf(ladder)` → `recordItemResult(..., {assistance, hintsTaken, revealed})` → `buildEvidence`):
- `assistance` = the highest rung ACTUALLY shown before that attempt:
  `none | nudge | question | scaffold | partial | answer` (the enum
  firestore.rules already accepts). A second try after a bare "wrong" with
  no hint is `nudge` (the miss itself was the nudge) — repaired, not
  independent.
- `independent = (assistance === "none")` — true only for a first-try,
  no-hint success.
- `assistCount = hintsTaken` (0–2, or 3 counting the reveal via `revealed`).
- **Post-reveal recall** = `assistance: "answer"` on a `met` record.
  There is no `"assisted-recall"` value in `evidenceType` — the rules enum
  is `recognition|constrained|free|receptive|productive|transfer|delayed|
  diagnostic|teacher` and adding one needs a rules deploy. Readers derive it:
  `status === "met" && assistance === "answer"`. Dan to say if he wants the
  enum widened.
- Every attempt is a record ("every question, every attempt"); the drill's
  score counts the first try only.

## 3. Spaced-retrieval hooks into ReVue (row 3)

`itemSrs` semantics (progress.ts): correct → 1 → 3 → 7 → 14 d; a miss → due
now (`intervalDays: 0`); `queueForReview(ids)` = due now (patch 23).

- Independent success: `recordItemResult` steps the ladder as before
  (lengthens).
- Hinted or revealed item: when it CLOSES (`effect === "done"`),
  `useHelpLadder` calls `queueForReview([itemId])` → `{due: now,
  intervalDays: 0}` — it must earn its interval again on a later day,
  unaided (`shouldQueueForReview` = `revealed || hintsTaken > 0`). A clean
  retype after a reveal therefore lands at 0 (shorter than the 1-day rung a
  bare correct would give), and the ReVue session tags that later answer
  `delayed`.
- A miss is already reset by `recordItemResult`.
- ÉcouTexte: words marked after the sentence was revealed are recorded
  `revealed: true` and queued.

## 4. Structured output + research log (row 4)

**Feedback schema** (`src/lib/help/feedback.ts`, validated client-side by
`isFeedback`, shaped server-side in `functions/api/feedback.js`):

```json
{ "verdict": "correct" | "partial" | "wrong" | "off_task",
  "errors": [ { "span": "text verbatim from the answer",
                "kind": "spelling|accent|agreement|conjugation|article|word_order|vocabulary|register|missing|extra|elision|other",
                "fix": "corrected French", "why": "one English line" } ],
  "model_answer": "…", "next_hint": "what to look at, never the answer",
  "source": "llm" | "rules", "model": "…" }
```

**Research-log events** (`events` collection, `logEvent`; both new types are
in `EventType`):

- `help.rung` — ONE per ladder transition:
  `{surface, itemId?, kind, from, to, effect, auto, hintsTaken, wrongTries, msSinceStart}`.
  `auto: true` = the machine climbed (stuck); `false` = the learner asked.
  The older `hint.tap` / `answer.reveal` are still emitted (with `auto`) so
  the teacher dashboards keep counting.
- `feedback.request` — one per open-production request:
  `{surface, mode, source, verdict, errors, ms}`.

Response docs carry the evidence block above; `given` is stored on every
attempt.

## 5. Evaluation cases (row 5) — `src/lib/help/evalCases.json`

22 cases: 8 adversarial (prompt injection ×2, off-topic, English answer,
profanity, empty, model echo, hallucinated-span guard) and 14 pedagogical
(accent-only, gender agreement, wrong tense, subject/verb, tu/vous register,
elision, article, partial answer, right meaning other words, spelling, extra
word, clean correct, no model answer, vocabulary). Each carries `expect`
(what the LLM path must return — run by hand against a deployed
`/api/feedback`) and `rules` (what the offline grader MUST return —
executed in node by verify28; 22/22 today). Where the rules cannot know
(legitimate rephrasing, no model answer) they must say `partial`, never
`wrong` or `correct`.

## 6. The ladder in the shell (row 6)

`DrillShell` props: `help?: DrillHelp` (the `?` control + rung dots
`○○●` in the bar — the last dot is the answer, hint chips under the item)
and `feedback.why?: ReactNode` (a WHY toggle at the tray's right; the
explanation opens above the tray, never inline by default).

Drill flow (typed/cloze): Check → wrong → tray "✗ Not yet · Try again",
a hint chip appears (auto), the field stays live → wrong again → second
chip → wrong again → "→ answer 🔊 · Type it" (the answer chip stays while
the learner retypes) → Check → Continue (WHY on the tray when the item has
an example). MCQ: wrong pick struck, "Pick again"; second wrong → answer,
Continue. Say: two misses climb; the 🔤 peek climbs by hand.

## 7. Open-production feedback modes (row 7)

Surface: the lesson end card (`LessonPager`) gains **✍️ In French: <the
SIO's can-do>** (`OpenFeedback.tsx`) — the "SIO write". Model answer = the
deck's first authored `example` (13 of 44 decks today; without one the
rules only screen and say `partial`).

- **Correct me** — write first; errors as `~~span~~ → fix`, WHY toggles the
  one-line reasons and `next_hint`. Evidence `assistance: "none"`,
  `independent: true`, `evidenceType: "free"`, `outcomeId` = the SIO.
- **Model answer** — the model is shown first (🔊), then write; graded
  against it. Evidence `assistance: "answer"`, `independent: false`.

`requestFeedback()` → `POST /api/feedback` with an 8 s budget; on timeout,
non-200, 503 (no key), bad shape or offline → `ruleFeedback()` (cloze-grader
tiers: perfect → correct, accent-only → partial/accent, else a word diff with
elision/register/article/agreement/conjugation heuristics). Same shape,
`source` says which. No XP is paid for open production.

Provider: the ChaTutor path — OpenRouter, `ANTHROPIC_API_KEY`
(`sk-or-…`), `anthropic/claude-haiku-4.5`, Mistral Large fallback,
`TUTOR_MODEL` override. ~500 output tokens max, temperature 0.2 → about
$0.003 per call. The learner's answer is fenced as `<answer>` data; any
error whose `span` is not in the answer is dropped server-side.

## 8. Not done / decisions for Dan

See `docs/STATUS.md` → "Track D — what was left out or decided on the fly".
