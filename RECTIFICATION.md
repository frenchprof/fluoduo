# RECTIFICATION — Restoring the slot-cascade Exercise tab

> Added 2026-09-17 by Super Z (Z.ai). This doc supersedes none of `AGENTS.md` — it
> adds to it. Read this BEFORE touching the lesson pager or any slotted lesson
> generator (`src/content/lessons/native/*.gen.ts`). The work it describes was
> done with the user (Dr Daniel Chan) over one session; the architecture decisions
> here are SETTLED unless Dan reopens them.
>
> **UPDATE 2026-09-18 (Dan's review of the restored Exercise, glm-lane).**
> Seven rulings, all shipped the same day:
>
> 1. **FAIRE STANDS ALONE** — *"I prefer to keep Faire separate on its own to
>    allow it to be worked on on its own."* Its Verbe dropdown drills the
>    PARTITIVE HOBBY-VERB FAMILY — faire · écouter · lire · regarder — each
>    with the nouns it genuinely takes (écouter → musique/chansons, lire →
>    livres/BDs, regarder → films/vidéos, faire + every activity). The aimer
>    verbs are OUT of faire and stay in the aimer lesson. **This supersedes
>    the cumulative-bank-on-faire example in §"The buildup pattern" below**:
>    the buildup pattern itself is not dead, but a lesson imports its FAMILY,
>    not its predecessors, unless Dan asks otherwise. The 12-frame taxonomy
>    and the migration table remain the map.
> 2. **Two orange bands, one cue language** — PICK AS YOU WISH over the three
>    dropdowns, PICK FOR ME at Random. Band text is THICK BY STROKE
>    (`-webkit-text-stroke` + `paint-order`) because the hand face ignores
>    font-weight — this thickens NEXT PART IS BELOW too, which Dan called
>    "insufficient" as it was.
> 3. **Random is THE main button** — primary and a size up; everything else
>    on the tab is secondary to it.
> 4. **English buttons**: ✅ CHECK · ✏️ REDO · 🏁 END (reversing the 17 Sep
>    keep-French-labels instruction — Dan's later ruling wins).
> 5. **★ lets the learner choose the gap** — verb or article ("if
>    intermédiaire involves two gaps, Facile should allow users to decide if
>    they want to focus on one or the other").
> 6. **🎁 Bonus joins the ladder at every stop** — ★/★★/★★★/🎁, labels from
>    ENTRY_LABELS, the reward pen for the fourth tier.
> 7. **Bonus has a full-sentence field** — the English sentence is the
>    prompt, the whole French sentence is typed; the French meta and noun are
>    withdrawn (they are the answer).
>
> **UPDATE 2026-09-17 (late session)** — pulled latest main (`98f485d`, deploy
> 108) which includes Claude's PRs #395–#398. These changed the lesson tab
> structure: tabs are now English-named and reordered to `Goal · Form · Idea ·
> Exercise` (Form moved ahead of Idea), and MémoiRecall is FOLDED into the Form
> tab (no longer a separate station at `/practice/flip-it` from the lesson's
> perspective). The `exercise` prop signature on `LessonTabs` is unchanged —
> my ExerciseSlotCascade integration survives the pull cleanly. The 4-section
> framing below is updated to reflect that MémoiRecall is now PART of Form,
> not a separate section. See Claude's handoff (16 Sep 2026, end of day) for
> the rulings that pinned these changes.

---

## What drifted, and what we are fixing

Claude (the prior assistant) evolved FluOLinGo beyond what was wanted. The
gamified shell — auth, Firestore, XP, leaderboard, Next.js 16, the lesson
front-matter tabs (now `Goal · Form · Idea · Exercise` in English) — **stays**.
What drifted are three per-lesson tab sections (plus MémoiRecall which is now
folded into Form):

| Section | In repo (as of `98f485d`) | Status as of 2026-09-17 |
|---|---|---|
| **Idea** | `concept` tab in `LessonTabs.tsx` — renders `<Concept c={lesson?.concept}/>` | Not yet touched — exists, needs comparison to the HTML's "Big Idea" animation |
| **Form** (now contains MémoiRecall) | `formes` tab — renders `<Formes memo={...} deck={...}/>` with MémoiRecall folded under the Mémo (PR #397) | Not yet touched — exists; the word table was retired by Claude (#397); flashcards are the one copy of the deck. Need to verify the "Lexique spirit" (show/hide columns + sort) survives in the flashcard view |
| **Exercise** | `exercice` tab — passes the `exercise` prop | **Stage A done for `faire` only** (see below); ~14 other Category A lessons to port |
| ~~MémoiRecall~~ | ~~separate station at `/practice/flip-it`~~ | **FOLDED into Form by PR #397** — no longer a separate section from the lesson's perspective. The route `/practice/flip-it` still exists as the standalone activity, but the lesson frame now hosts the flashcards inline under the Form tab's Mémo. |

The reference design is the user's attached HTML: `/home/z/my-project/upload/09-faire-du-de-la copy.html` (also archived in the user's `frenchwithdrchan` originals). The HTML's Exercise tab is the model.

---

## The Exercise mechanic we are restoring

The HTML's L'exercice tab is a **slot-cascade sentence builder**:

- **3 live dropdowns at the top** (subject / verb / activity) — visible the whole time, not behind a chooser
- **Cycleable difficulty banner** ★ / ★★ / ★★★ — changeable MID-RUN, not a one-shot chooser
- **Slot-cascade prompt visual** — meta + the bare noun + the English reference
- **Sentence area** whose shape changes with the difficulty:
  - **★ Facile** — inline dropdown for the verb only
  - **★★ Intermédiaire** — inline dropdowns for verb AND article
  - **★★★ Difficile** — single free-text input
- **Check button** with diagnostic feedback (article error vs verb error)
- **🎲 random** (pick random values for every dropdown), **🔊 pronounce** (TTS), **✏️ redo**, **🏁 finish** (summary table)
- **📋 cheat sheet** floating button (full conjugation + article reference)

The Claude-built `LessonPager` replaced this with a one-card-at-a-time flow
that hid the slot structure. We are restoring the slot-cascade inline.

---

## The data layer is already there

Each slotted lesson (`src/content/lessons/native/*.gen.ts`) already declares:

- `SUBJECTS` — 9 subject pronouns with `{disp, slot}`
- A verb table (e.g., `FAIRE = {je: "fais", tu: "fais", il: "fait", ...}`)
- An activities/nouns list with articles (e.g., `ACTIVITIES = [{fr: "sport", part: "du", en: "sport"}, ...]`)
- A `slotsFor()` function that returns the sentence in parts: `[{text:"Je"}, {key:"verb", text:"fais", choices:[...]}, {key:"article", text:"du", choices:[...]}, {text:"sport."}]`
- A `*Question(pinned)` generator that returns a `DiceQuestion` with `slots`

The slot-cascade component renders these slots generically — fixed-text slots as inline text, blankable slots (`key` + `choices`) as inline `<select>` dropdowns. ★ blanks the first blankable, ★★ blanks two, ★★★ shows a free-text input. **No UI changes are needed per-lesson** — the per-lesson generator decides what slots to produce and what choices each offers.

---

## The buildup pattern (cumulative verb bank)

The user's curriculum is a **spiral**: each new lesson reinforces prior knowledge by integrating it. The `faire` lesson (SIO-024) does NOT replace the `aimer` lesson (SIO-023) — it BUILDS ON it, so the learner sees both aimer verbs (definite article) AND faire (partitive article) in the same Exercise, with the contrast being the grammatical point of the lesson.

**Implementation:** each slotted lesson's `*.gen.ts` imports the prior lesson's verbs/nouns and merges them into its own cumulative bank. No central registry — explicit per-lesson imports. The pattern:

```typescript
// In faire.gen.ts
import { VERBS as AIMER_VERBS, NOUNS as AIMER_NOUNS, END_EXPORT as AIMER_END } from "./aimer.gen";

const VERB_BANK: VerbEntry[] = [
  // Frame A — liking verbs from SIO-023 aimer (cumulative).
  ...AIMER_VERBS.map((v) => ({
    lemma: v.stem + "er",
    frame: "A" as const,                              // Frame A = definite article
    conj: (slot: string) => v.stem + AIMER_END[slot],
    en: v.en,
  })),
  // Frame B — doing verbs (this lesson's own).
  { lemma: "faire", frame: "B", conj: (slot) => FAIRE[slot], en: "do" },
];
```

The 3-4-step chain (e.g., SIO-048 devoir/falloir pulling in aimer + faire + aller + vouloir + pouvoir) is fine with explicit imports — switch to a registry only if it becomes painful.

---

## The 12 verb frames

Each verb in the cumulative bank is typed by its **argument structure** — what kind of complement it takes. The slot layout adapts to the frame. A given lesson only shows verbs from its declared frame set, so `Paul aime / déteste / est / a / s'appelle` never appears as a single dropdown — those verbs live in different frames.

| Frame | Pattern | Verbs | Article / complement behaviour |
|---|---|---|---|
| **A** liking | subj · verb · **definite art** · noun | aimer · adorer · détester · aimer bien · ne pas aimer · préférer | `le`/`la`/`l'`/`les` → stays in negative |
| **B** doing | subj · verb · **partitive art** · noun | faire · ne pas faire | `du`/`de la`/`de l'`/`des` → `de`/`d'` in negative |
| **C** being | subj · être · (zero OR indef art) · noun | être | zero for professions (`Paul est étudiant`) · `un`/`une` for noun classes |
| **D** motion | subj · verb · **preposition** · place | aller · venir · partir | `à`/`en`/`au`/`aux` by place's gender/number |
| **E** possession/state | subj · avoir · (age/state — no article+noun) | avoir | `J'ai 20 ans` · `J'ai faim` |
| **F** reflexive naming | subj · se · verb · **name** (no article) | s'appeler | proper noun |
| **G** modal | subj · modal · **infinitive** (inherits infinitive's complement) | vouloir · pouvoir · devoir · falloir | recursive — slots depend on the chosen infinitive's frame |
| **H** impersonal | **il** (dummy subj) · verb · (complement) | falloir (`il faut`) · pleuvoir (`il pleut`) · il fait · il y a · il est [heure] | no subject conjugation |
| **I** imperative | **verb imp form** · (complement) — addressee encoded in verb form | Tourne · Tournons · Tournez · Prenez · Allez | tu/nous/vous encoded in verb ending |
| **J** stressed pronoun pair | subj pronoun · ↔ · stressed pronoun | moi↔je, toi↔tu, lui↔il, elle↔elle, nous↔nous, vous↔vous, eux↔ils, elles↔elles | pair selection |
| **K** question formation | canonical statement · [q-word gap] · ? | est-ce que · inversion · intonation · quel · où · quand · comment · pourquoi · combien · qui · que | gap-filling in canonical statement |
| **L** quel+noun | **quel form** · noun (agreement) | quel/quelle/quels/quelles | agreement with the noun's gender/number |

**"Any-prior-verb" SIOs** (025 parce-que · 028 negation · 034 questions · 043 frequency) span ALL prior frames — the verb dropdown pulls from every frame the learner has met so far, and the structural rule wraps whichever verb the learner picks.

---

## What's done (Stage A — `faire` lesson only)

### Files added
- `src/app/lessons/pager/ExerciseSlotCascade.tsx` (~425 lines) — the slot-cascade Exercise component. Self-contained, no API changes to the lesson pager. Renders inline in the `exercice` tab.

### Files modified
- `src/app/lessons/pager/LessonPager.tsx` — added an import + a ternary: when `lesson?.slug === "faire"`, pass `<ExerciseSlotCascade lesson={lesson} activityKey={activityKey}/>` as the `exercise` prop instead of the existing `chooser`. Every other lesson is untouched.
- `src/content/lessons/native/aimer.gen.ts` — added `export` to `VERBS`, `NOUNS`, `END_EXPORT`, `conj` (was previously internal). Single-line changes; nothing else moved.
- `src/content/lessons/native/faire.gen.ts` — retrofitted to import aimer's verbs + nouns, build a cumulative `VERB_BANK` (Frame A + Frame B), build a unified `NOUN_BANK` with both definite + partitive articles, add a `verb` axis (was missing), and update `slotsFor()` to handle both frames. The article slot's `choices` is now the full set of 10 French articles (`le / la / l' / les / du / de la / de l' / des / de / d'`) — the learner picks, the check function validates.

### Verified end-to-end (via agent-browser, 2026-09-17)
- Typecheck clean (`npx tsc --noEmit`).
- `/lessons/faire` loads; the new **Verbe** axis appears in the dropdown row (was missing before).
- The inline verb dropdown (in the sentence) shows subject-conjugated forms across ALL cumulative verbs: e.g. for `Je` → `aime / adore / déteste / fais`; for `Vous` → `aimez / adorez / détestez / faites`.
- The inline article dropdown shows all 10 French articles.
- Picking `adorez` + `la` for `Vous adorez ... photographie` → `✔ C'est correct !` (Frame A verb + definite article).
- Picking `aime` + `du` for `J'aime ... athlétisme` → `✘ Pas correct. → J'aime l'athlétisme. 🔊` (Frame A verb + partitive article — wrong because aimer takes definite, not partitive).
- Score / streak / best / total update correctly. 🏁 Terminer shows the summary table. ↺ Recommencer resets.

### Screenshots (in `/home/z/my-project/download/`)
- `faire-lesson-01-initial.png` — initial render with slot-cascade visible
- `faire-lesson-02-correct-answer.png` — after a correct answer (★ Facile)
- `faire-lesson-03-difficile-free-text.png` — ★★★ with free-text input
- `faire-lesson-04-end-screen.png` — 🏁 summary table
- `faire-lesson-05-buildup-verified.png` — final state with cumulative verb bank working

---

## What's NOT done (the rest of the work)

### Stage B-D for the Exercise tab (the `faire` lesson)
- **Article-vs-verb diagnostic feedback** — the HTML's `checkMain()` distinguishes article-error vs verb-error and links back to "Les formes" tab. The current `ExerciseSlotCascade` only shows the correct sentence; it doesn't diagnose WHICH slot was wrong.
- **📋 cheat sheet** floating button — full conjugation + article reference.
- **localStorage progress** + Plausible analytics.
- **XP write + Firestore activityLog + SIO done (`markSioDone`) + saveRun/clearRun** (resume state). Currently the slot-cascade doesn't write to the gamified shell — it just shows an inline summary. Wiring the `onFinish` callback to the existing end-screen logic in `LessonPager.tsx` is the move.
- **Confetti** + wrong-answers re-queue at end.

### Porting the buildup to other Category A lessons
~14 lessons should get the same cumulative-bank treatment, in curriculum order:

| Lesson | SIO | Cumulative from | Frame(s) |
|---|---|---|---|
| `aimer` | 023 | (root) | A only |
| `faire` | 024 | aimer | **DONE** — A + B |
| `aller` | 026 | aimer, faire | D (motion) |
| `vouloir-inviter` (rendezvous) | 029 | aimer, faire, aller | G (modal) |
| `pouvoir` | 037 | aimer, faire, aller, vouloir | G |
| `envies-besoins` | 039 | aimer, faire, aller, vouloir, pouvoir | G (vouloir/devoir) |
| `manger-boire` | 042 | aimer, faire, aller, vouloir, pouvoir | B (partitive like faire) |
| `futur-proche` | 047 | (all prior) | G (aller + inf) |
| `conseils` (modaux-avis) | 048 | (all prior) | G + H (devoir/falloir) |
| `etre-etudiant` | 014 | (root for C) | C only |
| `possessifs` | 022 | (root) | (possessive + noun) — Frame C-ish |
| `negation` | 028 | (all prior) | any prior frame + negative |
| `demonstratifs` | 046 | (all prior) | C (ce/cet/cette/ces) |
| `avoir-etats` | 019 | (root for E) | E only |
| `sappeler` | 001 | (root for F) | F only |

**Migration pattern** (per lesson, ~30 min each):
1. Add `export` to the lesson's internal `VERBS` / `NOUNS` / conjugation helpers.
2. In the NEXT lesson's `*.gen.ts`, import them; build a cumulative `VERB_BANK` with frame info; build a cumulative `NOUN_BANK` with both article types.
3. Add a `verb` axis (if missing); update `slotsFor()` to handle both frames; update `*Question()` to roll from the cumulative bank with frame-aware noun filtering.
4. Update `LessonPager.tsx`'s ternary to include the new lesson slug.
5. Typecheck + verify end-to-end with `agent-browser open http://localhost:3000/lessons/<slug>` with `NEXT_PUBLIC_OPEN_APP=1`.

### The other three sections (Idea / Form / MemoiRecall)
- **Idea** — compare `LessonTabs.tsx`'s `<Concept>` to the HTML's "Big Idea" tab (the type-level vs instance-level animation). The existing component takes a `LessonConcept` prop with fields `{subtitle, contrast, question, answer, pitfall, flow, check, remember}`. The HTML's animation is more interactive — needs design discussion before code.
- **Form** — compare `<Formes>` to the HTML's "Explorer / Conjuguer" paradigm. The HTML has two side-by-side columns (liking-verb forms · doing-verb forms) with a polarity toggle and article pattern animations. The existing `<Formes>` shows the Mémo + deck table + lexique.
- **MemoiRecall** — verify the existing `/practice/flip-it` route carries the HTML's Le lexique spirit (Cards / See All / Table views + show/hide Article/French/Gender/English columns + multi-column sort). The HANDOFF says it has these — needs verification against the HTML.

### Categories B, C, D, E (the other ~35 SIOs)
These are NOT slot-cascade material:
- **B (vocabulary reference)** — the existing Flip-It / MémoiRecall is the right mechanic; preserve the "Lexique spirit" (show/hide columns + sort).
- **C (atelier role-play)** — already has its own handling in the repo; not slot-cascade.
- **D (numbers/alphabet/days)** — own mechanics (NumBus, spelling, sequence); not slot-cascade.
- **E (grammar-structural)** — prepositions/question-words/directions; needs its own slot patterns (Frames D, K, L above) but not the verb+article+noun cascade.

---

## How to verify the work

```bash
cd /home/z/my-project/fluoduo
npm install                       # if node_modules missing
NEXT_PUBLIC_OPEN_APP=1 npm run dev # bypasses AuthGate on localhost
# Open http://localhost:3000/lessons/faire in a browser
# Scroll to the 🏋️ Exercice tab
# You should see:
#   - Difficulty banner ★ Facile / ★★ Intermédiaire / ★★★ Difficile
#   - 3 dropdowns: Sujet / Verbe / Forme
#   - 🎲🎲 Random + 🔊 Listen buttons
#   - Inline sentence with the verb dropdown (showing all 4 cumulative verbs' conjugated forms for the chosen subject)
#   - At ★★: inline article dropdown (showing all 10 French articles)
#   - At ★★★: single free-text input
#   - ✅ Je vérifie + ✏️ Refaire + 🏁 Terminer
```

To typecheck only:
```bash
cd /home/z/my-project/fluoduo && npx tsc --noEmit
```

To verify with agent-browser (installed at /usr/local/bin/agent-browser):
```bash
agent-browser set viewport 1280 900
agent-browser open http://localhost:3000/lessons/faire
agent-browser eval "document.querySelectorAll('[role=dialog]').forEach(el=>el.remove()); 'dismissed';"  # dismiss first-run hint
agent-browser snapshot -i  # see the interactive elements + their refs
agent-browser screenshot --full /tmp/state.png  # capture
```

---

## What NOT to touch

- **`AGENTS.md`** — 1,294+ lines of accumulated rulings from Claude. Most still apply. Add to it; don't rewrite.
- **The gamified shell** — auth, Firestore, XP, leaderboard, lesson front-matter tabs (now `Goal · Form · Idea · Exercise` in English). These stay.
- **Non-Category-A lessons** — the ~35 SIOs that aren't slot-cascade material. They have their own mechanics.
- **The existing `LessonPager` for non-faire lessons** — gated by `lesson?.slug === "faire"` in `LessonPager.tsx`; don't remove the gate until other lessons are ported.

### Rulings from Claude's 16 Sep handoff (PRs #395–#398, deploy 108) — do NOT undo

These were merged to main the same day this rectification work began. They are SETTLED:

1. **Cards and Form are one thing.** MémoiRecall lives INSIDE the Form tab, under the Mémo. No new tab, no new category. Don't pull flashcards back out into a separate MémoiRecall tab/station from the lesson's perspective.
2. **Tab order is `Goal · Form · Idea · Exercise`.** Form moved AHEAD of Idea. The lesson still LANDS on Idea on arrival (Dan, 13 Sep). Don't revert to the old `Goal · Idea · Form · Exercise` order.
3. **Tab names are English** (`Goal`, `Form`, `Idea`, `Exercise`). Keys (`parcours` / `concept` / `formes` / `exercice`) and routes did NOT move. Display renames never touch keys.
4. **The Form tab's word table is GONE.** The flashcards are the one copy of the deck. Don't restore the lexique/table view to Form.
5. **NumBus: everything on one phone screen.** Five-across pad, no slab, shorter scene. Sound keys sit in the pad's fifth column.
6. **Se présenter** has the two-column Mémo + English signposts; the other lessons still use one-column lines with a dash. Rolling two-column across the other lessons is a content pass, one file per lesson — not in scope here.

### Open decisions Claude left for Dan (NOT for the next assistant to decide)

These five are Dan's to call, NOT ours. Don't action them unless asked:

1. Where to surface a word's gender (the only column that showed it was the retired Form word table; the aliments deck marks 9 words whose article hides gender). `verify59` says this out loud rather than failing.
2. Whether to hide the framed MémoiRecall's top band inside a lesson (it currently shows a ✕ and the goal badge).
3. Rolling the two-column Mémo across the other lessons (currently only Se présenter has it).
4. NumBus worded line under the digits (slimmer line ships today; B words replace the digits on reveal; C words in the bus badge).
5. Bug collection: a "copy for the agent" button + GitHub issues via a Cloudflare function with a secret token. Endorsed, not started.

---

## TL;DR for the next assistant

1. The user wants the Exercise tab back as a slot-cascade (HTML reference: `09-faire-du-de-la copy.html`). Done for `faire`; ~14 lessons to port.
2. The buildup pattern: each lesson imports its prior lessons' verbs/nouns. Static imports, no registry (yet).
3. The 12-frame taxonomy (A–L) types each verb by its argument structure. A lesson only shows verbs from its declared frame set.
4. The data layer is already in place per-lesson (`*.gen.ts` files). The slot-cascade component is generic; per-lesson work is in the generator.
5. Don't touch Categories B–E (other ~35 SIOs). They have their own mechanics.
6. Don't touch the gamified shell. Don't rewrite `AGENTS.md`. Add to it.
