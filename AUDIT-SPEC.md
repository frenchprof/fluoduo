# AUDIT-SPEC — Content, UI/UX, and Typography audit methodology

> Added 2026-09-17 by Super Z (Z.ai). This doc captures the audit methodology
> and a complete sample audit on the `faire` lesson, so any assistant (Zcode,
> Claude Code, or successor) can scale the same approach to the other 49 SIOs
> and remaining UI/UX routes consistently. Read this BEFORE doing audit work.
>
> **Companion to `RECTIFICATION.md`** — RECTIFICATION covers the architecture
> (slot-cascade, buildup, 12-frame taxonomy); AUDIT-SPEC covers the quality
> bar (French accuracy, pedagogy, visual organisation, relative units).

---

## Scope — three audits, in this order

| # | Audit | What it covers | Effort | Status |
|---|---|---|---|---|
| **1** | Typography / code | Hardcoded `text-[Npx]` → relative units (`rem` or Tailwind named sizes); CSS var consistency; mobile-vs-desktop font scaling | Fast — grep + script | **DONE 2026-09-17** — 326 sites fixed via `/home/z/my-project/scripts/typography-fix.py`. Script is reusable. |
| **2** | UI/UX | Mobile (390px) + desktop (1280px) layouts; visible vertical frames; visual hierarchy; touch targets; spacing; contrast; "information not in organised fashion" | Medium — agent-browser screenshots per route | Sample done on `faire`; remaining ~15 routes for Zcode |
| **3** | Content / pedagogy | Per-lesson French accuracy + English gloss fidelity + example quality + buildup integrity + Mémo/Concept consistency | Slow — per-lesson judgment | Sample done on `faire`; remaining 49 lessons for Zcode |

**Typography is done.** This spec covers UI/UX and Content.

---

## The "visible vertical frames" design principle — a stated rule

Carry this rule into every audit finding and every fix:

> **Every lesson panel (Goal / Form / Idea / Exercise) and every distinct
> content group within a panel (the Mémo / the conjugation table / the
> negative warning / the MémoiRecall link / the Concept accordion / the
> slot-cascade / the toolbar) must sit inside a visible vertical frame:
> `border-2 + rounded-2xl + bg-<surface>` with consistent spacing.**
>
> Tabs at the top = the navigation strip (already there). Within each tab
> panel, content is grouped into distinct visual frames — bordered
> boxes/columns, NOT flowing text with headings. Each frame has a clear
> purpose. Mobile = frames stack vertically (one per row). Desktop = frames
> can sit side-by-side (the HTML reference uses `.guide-columns{display:grid;
> grid-template-columns:1fr 1fr;gap:20px;}` — two-column layouts for grammar
> paradigms).
>
> Frame borders are VISIBLE — not just whitespace. The HTML reference uses
> `border:2px solid var(--line)` with rounded corners. The current repo uses
> scroll-snap sections (good — vertical snapping), but the sections
> themselves don't have visible borders, so they read as one long page, not
> as discrete frames.

**Action for the next assistant:** when auditing any lesson panel, flag every
content group that lacks a visible frame. When fixing, wrap each group in a
`<div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">`.
On desktop viewports ≥768px, consider two-column grid layouts for grammar
paradigms (liking-verb forms · doing-verb forms side-by-side, like the HTML
reference's `.guide-columns`).

---

## UI/UX audit methodology

For each route, capture both viewports and analyse against these dimensions:

1. **Visible vertical frames** — every content group in a bordered container
2. **Mobile (390px) layout** — no horizontal overflow, no tiny text (≥10px / 0.625rem), tab strip fits, touch targets ≥44px
3. **Desktop (1280px) layout** — uses the width for side-by-side frames where appropriate; not a narrow centered column
4. **Visual hierarchy** — headings distinct from body, the active state visible, the primary action discoverable
5. **Spacing** — consistent `gap` between frames; no orphan headings; no walls of text
6. **Contrast** — text meets WCAG AA against its background
7. **Touch targets** — every interactive element ≥44×44px on mobile

**Tools:**
- `agent-browser set viewport 1280 900` for desktop; `agent-browser set viewport 390 844` for mobile (iPhone 14)
- `agent-browser screenshot --full <path>` for full-page screenshots
- `agent-browser eval "..."` for structural queries (e.g., count of `<section>`, `.border-2`, `text-[0.5rem]`)

**Routes to audit (in priority order):**
1. `/lessons/faire` ✅ (sample done — see findings below)
2. `/lessons/aimer` (the prior-lesson root, simplest Category A)
3. `/lessons/aller` (motion frame, will be the next ported)
4. `/lessons/se-presenter` (Claude just refactored this — verify the new tab structure)
5. Every other `/lessons/<slug>` route (49 total)
6. `/` (welcome), `/home` (dashboard), `/practice/flip-it` (MémoiRecall), `/games/*`

---

## Content / pedagogy audit methodology

For each lesson (`src/content/lessons/native/*.tsx` + `*.gen.ts`), review:

1. **French accuracy** — every example sentence is grammatically correct and idiomatic
2. **English gloss fidelity** — every English reference is idiomatic, NOT word-for-word literal translation of the French construction
3. **Example quality** — every example illustrates the rule being taught; no counter-examples presented as correct
4. **Mémo / Concept consistency** — the Mémo's rule matches the Concept's deeper explanation; no oversimplification that misleads
5. **Buildup integrity** — the lesson properly reuses prior lessons' grammar (per the cumulative verb bank pattern in RECTIFICATION.md)
6. **Self-check questions** — answerable using only what the lesson + prior lessons taught
7. **A1 register** — vocabulary and structures are A1-appropriate; no B1 leaps
8. **Cultural / contextual** — examples make sense in a French cultural context

**Severity scale:**
- **blocking** — French errors, factual mistakes, things that teach the wrong rule
- **pedagogical** — oversimplified rules that contradict the concept, missing buildup, examples that don't illustrate the rule
- **style** — awkward English glosses, inconsistent register, missed opportunities for elision/highlighting

**Output:** one finding per issue, with file + line + severity + current text + problem + suggested fix. See the sample findings below for the shape.

---

## Sample audit — `faire` lesson (SIO-024)

This is the **complete audit** for one lesson, as a template for Zcode to
follow on the other 49. 20 findings total: 10 content + 10 UI/UX.

### Content / pedagogy findings on `faire`

#### F-C-1 · Mémo's negative rule contradicts the Concept tab · **pedagogical** · `faire.tsx:27`

**Current text (Mémo):**
> ⚠️ In the negative, du / de la / des all become `de` (`d'` before a vowel)

**Problem:** This rule is correct for the **partitive** (du/de la/des → de/d'), but it implies ALL articles become "de" in the negative. The definite articles (le/la/l'/les) STAY in the negative — `Je n'aime pas le sport`, not `*Je n'aime pas de sport`. The Concept tab's answer (line 51–58) explains this contrast correctly ("Compare `Je n'aime pas le sport`, where the article stays: preference is about the whole category, not a portion of it"), but the Mémo's rule directly contradicts it. A learner who memorises only the Mémo will write `*Je n'aime pas de sport` for "I don't like sport" — wrong.

**Suggested fix:**
> ⚠️ In the negative, the partitive `du` / `de la` / `des` becomes `de` (`d'` before a vowel). The definite articles `le` / `la` / `l'` / `les` STAY — `Je n'aime pas le sport`. The difference is the lesson: a portion disappears when you say no, a category does not.

This makes the Mémo and Concept consistent, and pre-teaches the aimer-vs-faire contrast that the cumulative verb bank makes live in the Exercise tab.

#### F-C-2 · Awkward literal English glosses in Bonus list · **style** · `faire.tsx:88–99`

**Current examples:**
- `"She does dancing."` for `Elle fait de la danse.`
- `"You (sg.) do swimming."` for `Tu fais de la natation.`
- `"I don't do horse riding."` for `Je ne fais pas d'équitation.`
- `"We do climbing."` for `Nous faisons de l'escalade.`

**Problem:** Word-for-word translations of the `faire + activity` construction, which produces unidiomatic English. Native English says "She dances" / "She does dance"; "I swim" / "I go swimming"; "I don't ride horses" / "I don't go horse riding"; "We climb" / "We go climbing". The Bonus tier is the FREE-TEXT translation tier — the learner types the French from the English prompt. Awkward English prompts awkward French (or confused silence).

**Suggested fix:**
```tsx
{ en: "She dances.", fr: "Elle fait de la danse." },
{ en: "I swim.", fr: "Je fais de la natation." },
{ en: "I don't ride horses.", fr: "Je ne fais pas d'équitation." },
{ en: "We climb.", fr: "Nous faisons de l'escalade." },
```

The mismatch between idiomatic English and the periphrastic French construction IS the lesson — that's what makes it a translation exercise rather than a copy exercise.

#### F-C-3 · `lecture` wrongly excluded from the faire bank · **factual** · `faire.gen.ts` (my retrofit)

**Current code:**
```typescript
const NOT_FAIREABLE = new Set(["films", "livres", "concerts", "piano", "cinéma", "lecture"]);
```

**Problem:** `faire de la lecture` IS valid French — it means "to read" (literally "to do reading"). Excluding `lecture` means a learner who picks `faire` will never see `Je fais de la lecture` as a possible sentence, even though it's correct. The other exclusions are right (you don't `faire` des films / des livres / des concerts / du piano / du cinéma in A1 — those use `voir` / `lire` / `aller à` / `jouer de`), but `lecture` should be allowed.

**Suggested fix:** Remove `"lecture"` from the set. (Self-flagging: my own bug from the 2026-09-17 retrofit, not Claude's. Fix immediately.)

#### F-C-4 · Concept question uses awkward mixed French-English · **style** · `faire.tsx:46–49`

**Current text:**
> You do `du yoga`. Say that you don't. Where does the `du` go?

**Problem:** "You do du yoga" — the French article `du` appears mid-English-sentence without explanation. A learner at A1 doesn't yet recognise `du` in isolation; the question reads as "You do (some French word) yoga".

**Suggested fix:**
> You do yoga. Say that you don't. What happens to the article?

Clearer English; doesn't require the learner to recognise `du` in isolation; the answer (line 51–58) still references `du` and `le` in French with `<i lang="fr">` styling, which is appropriate.

#### F-C-5 · Self-check #1 awkward English · **style** · `faire.tsx:71–72`

**Current text:**
> Q: She does not do dancing.
> A: `Elle ne fait pas de danse.`

**Problem:** Same literal-translation issue as F-C-2 — "She does not do dancing" is awkward English.

**Suggested fix:**
> Q: She doesn't dance.
> A: `Elle ne fait pas de danse.`

#### F-C-6 · Mémo's `masculin` / `féminin` labels are A1-terse · **style** · `faire.tsx:18–21`

**Current bullets:**
- `du + masculin — Je fais du sport.`
- `de la + féminin — Elle fait de la danse.`
- `de l' + voyelle — Nous faisons de l'escalade.`
- `des + pluriel — Ils font des arts martiaux.`

**Problem:** The labels `masculin` / `féminin` / `voyelle` / `pluriel` are French grammar terms a learner at A1 may not recognise on first read. The HTML reference uses "a masculine singular noun" — more readable.

**Suggested fix:**
- `du + a masculine noun — Je fais du sport.`
- `de la + a feminine noun — Elle fait de la danse.`
- `de l' + a vowel-start noun — Nous faisons de l'escalade.`
- `des + a plural noun — Ils font des arts martiaux.`

#### F-C-7 · Mémo's `des + pluriel` bullet is ambiguous · **pedagogical** · `faire.tsx:21`

**Current bullet:**
> `des + pluriel — Ils font des arts martiaux.`

**Problem:** "pluriel" might suggest "any plural-looking word" rather than "several of the thing". A learner could think "Je fais des tennis" (which is wrong — tennis is singular in French, you can't pluralize it). The HTML reference says `des + a plural noun` and uses a clearer example.

**Suggested fix:** Reword as `des + a plural noun (several of the activity) — Ils font des arts martiaux.`

#### F-C-8 · Concept's self-check #2 conflates two lessons · **pedagogical** · `faire.tsx:73–74`

**Current self-check:**
> Q: Why does `aimer` not behave this way?
> A: Its article is not a portion — it names the category, which the negative does not remove.

**Problem:** This question asks the learner to apply a DIFFERENT lesson (aimer, SIO-023) while learning faire (SIO-024). For a learner who hasn't done SIO-023 yet (curriculum order may vary), this is unanswerable. With the cumulative buildup pattern (RECTIFICATION.md), aimer IS learned before faire — so this becomes answerable, but only if the buildup pattern is in force.

**Suggested fix:** Reframe to assume the buildup is in force:
> Q: Now apply: `Je n'aime pas le sport.` Why does the article stay here?
> A: `aimer` names a category (the whole of sport), not a portion of it. The negative doesn't remove the category, so the definite article stays.

#### F-C-9 · Dice instruction is stale (pre-buildup) · **style** · `faire.tsx:84`

**Current text:**
> "Choose the right partitive article after faire (watch the negative!)."

**Problem:** This was written for the OLD single-verb (faire only) lesson. With the cumulative buildup (RECTIFICATION.md, 2026-09-17), the verb bank now includes aimer/adorer/détester + faire, and the article decision is `definite for liking, partitive for faire`. The instruction should reflect this.

**Suggested fix:**
> "Pick the right article for the verb you choose — definite (`le`/`la`/`l'`/`les`) for liking verbs, partitive (`du`/`de la`/`de l'`/`des`) for `faire`. Watch the negative!"

#### F-C-10 · No cultural / contextual framing · **style (missed opportunity)** · `faire.tsx` overall

**Problem:** The activities list (sport, yoga, danse, natation, musique, photographie, peinture, boxe, escalade, équitation, athlétisme, escrime, arts martiaux, ski, vélo, karaté, football, basket, tennis, chant) — many are typical school activities in France, but no cultural framing. A learner doesn't learn that `faire du sport` is the standard school phrase, or that `faire de la musique` implies playing an instrument (not just listening).

**Suggested fix:** Add a one-line cultural note under the Mémo, e.g., `In French schools, "faire du sport" is the standard phrase for PE / sports class — you'll hear it weekly.` (Optional, not blocking.)

---

### UI/UX findings on `/lessons/faire`

#### F-U-1 · Tab panels have no visible vertical frame borders · **pedagogical** · `LessonTabs.tsx`

**Current:** The 4 `<section data-tab="...">` elements have `snap-start` for vertical scroll-snapping but NO visible borders or background. A learner scrolling sees one long undifferentiated column with no visual "you crossed into a new section" marker.

**Verified via agent-browser:**
```
sections: 4, snap-starts: 4, visible borders on sections: 0
```

**Suggested fix:** Each tab panel gets a visible frame:
```tsx
<section data-tab="parcours" className="... rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/50 p-4 m-2 snap-start ...">
```

Or, less invasive: add a `border-t-2 border-[color:var(--cahier-rule)]` between sections so the section boundary is visible when scrolling.

#### F-U-2 · Mémo card IS framed ✓, but the conjugation table is not · **pedagogical** · `faire.tsx:23–25`

**Current:**
```tsx
<p className="mt-2 text-sm text-[color:var(--cahier-ink)]" lang="fr">
  je fais · tu fais · il/elle fait · nous faisons · vous <b>faites</b> · ils/elles <b>font</b>
</p>
```

The Mémo card (line 13) is correctly framed (`rounded-2xl border-2 ...`). But the conjugation table inside it is plain `·`-separated text — not a bordered table like the HTML reference (`.gram-table` with header row + cell borders + alternating row backgrounds).

**Suggested fix:** Render as a proper bordered table:
```tsx
<table className="mt-2 w-full text-sm border-collapse">
  <thead><tr><th className="border-b-2 ...">je</th><th>tu</th>...</tr></thead>
  <tbody><tr><td>fais</td><td>fais</td>...</tr></tbody>
</table>
```

#### F-U-3 · Negative warning has a left border ✓ but could be visually stronger · **style** · `faire.tsx:26–29`

**Current:** `rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5` — a left-border highlight. Decent, but the HTML reference's `.tip` style uses a fuller box: `background:var(--lightblue); border-left:4px solid var(--blue); border-radius:0 8px 8px 0; padding:12px 16px;` — bigger padding, asymmetric rounded corners, full background fill.

**Suggested fix:** Match the HTML: `border-l-4 border-[color:var(--cahier-hl-edge)] rounded-r-lg bg-[color:var(--cahier-hl)]/40 p-3` (more padding, stronger background).

#### F-U-4 · MémoiRecall link is a single row without a visual frame · **pedagogical** · `LessonTabs.tsx` (Form section)

**Current:** `🃏 MÉMOIRECALL — 38 cards — ▶` is a single row in the Form section. It looks like a button but lacks the visual weight of a distinct "frame" — easy to scroll past without noticing.

**Suggested fix:** Wrap in a card:
```tsx
<div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-3 flex items-center justify-between">
  <div className="flex items-center gap-2">
    <span>🃏</span>
    <span className="font-black">MÉMOIRECALL</span>
    <span className="text-sm opacity-70">38 cards</span>
  </div>
  <button className="...">▶</button>
</div>
```

#### F-U-5 · Idea accordion expanded content lacks frame · **style** · `LessonTabs.tsx` (Concept section)

**Current:** The accordion buttons (The idea / Q & A / Traps2 / Steps1 / Check2 / Sum up) are visually distinct as buttons ✓. But when expanded, the content is plain text below the button — no visual frame tying the question to its answer.

**Suggested fix:** Wrap expanded content in a `rounded-lg border-l-4 border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-raised)]/50 p-3 ml-4` (indented, left-bordered — the standard "reply" visual).

#### F-U-6 · Exercise toolbar (🎲/🔊/✏️/🏁) has no frame · **style** · `ExerciseSlotCascade.tsx`

**Current:** The toolbar buttons (`✏️ Refaire` / `🏁 Terminer` / `🎲🎲 Random` / `🔊 Listen`) flow as bare buttons. The slot-cascade sentence area IS framed ✓ (border-2 + bg-white/70), but the toolbar below it isn't.

**Suggested fix:** Wrap the toolbar in a frame:
```tsx
<div className="flex justify-center gap-2 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white/50 p-2">
  <button>✏️ Refaire</button>
  <button>🏁 Terminer</button>
</div>
```

#### F-U-7 · Desktop 1280px layout doesn't use the width · **pedagogical** · `LessonTabs.tsx`

**Current:** At 1280px, the lesson content is centered and constrained to ~mobile width (~640px max). The HTML reference uses two-column grids for grammar paradigms (`.guide-columns`) — e.g., the liking-verb forms and doing-verb forms side-by-side.

**Verified:** The Mémo at desktop 1280px is one narrow column. The conjugation table (when fixed per F-U-2) could be a 6-column-wide table OR a 2-column grid (je/tu/il/elle/on | nous/vous/ils/elles/font).

**Suggested fix:** Add a desktop breakpoint:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>{likingVerbForms}</div>
  <div>{doingVerbForms}</div>
</div>
```

#### F-U-8 · Difficulty banner (★/★★/★★★) could be more prominent · **style** · `ExerciseSlotCascade.tsx`

**Current:** The difficulty banner is a `flex-wrap items-center justify-center gap-2 rounded-xl border-2 border-yellow-300 bg-yellow-50 p-2.5` — decent, but small. At mobile 390px it's the same width as the dropdowns below it.

**Suggested fix:** Make the banner sticky-ish (or visually weightier) at the top of the Exercise tab — increase padding to `p-3`, add a `font-black text-base` label, and consider a subtle shadow `shadow-sm`.

#### F-U-9 · Mobile 390px layout is OK ✓ · **verified**

**Verified via agent-browser at 390×844 viewport:**
- No horizontal overflow ✓
- No tiny text (`text-[0.5rem]` / `text-[0.5625rem]`) on this page ✓
- Tab strip fits 4 tabs without overflow ✓
- No `<button>` below 44×44px touch target on this page ✓ (Claude's PR #193 enforced this)

Mobile is solid on this route. No findings.

#### F-U-10 · No visible "where am I in the lesson" indicator below the sticky tab strip · **style** · `LessonTabs.tsx`

**Current:** The sticky tab strip shows the active tab (e.g., "Form" highlighted). But once the learner scrolls past the strip (it stays sticky at top), there's no visible section title or breadcrumb at the top of each panel saying "Form — the rules and the cards".

**Suggested fix:** Add a section heading at the top of each panel that mirrors the tab name:
```tsx
<section data-tab="formes" className="...">
  <h2 className="sr-only">Form</h2>  {/* or visible: <h2 className="cahier-display text-xl font-black">Form</h2> */}
  ...
</section>
```

A visually-hidden `<h2>` is the minimum (screen reader landmark). A visible `<h2>` at the top of each panel is better — confirms where you are even when the sticky strip scrolls out of view on a long panel.

---

## Scaling instructions for Zcode / Claude Code

### Content audit — port to the other 49 lessons

For each lesson `src/content/lessons/native/*.tsx` + `*.gen.ts`:

1. Read the lesson file + the matching `.gen.ts`
2. Apply the 8 content audit dimensions (French accuracy, English gloss fidelity, example quality, Mémo/Concept consistency, buildup integrity, self-check questions, A1 register, cultural)
3. Write findings in the same shape as F-C-1 through F-C-10 above: file:line, severity, current text, problem, suggested fix
4. Output: append findings to `AUDIT-CONTENT.md` (one section per lesson, ordered by SIO number)
5. For each finding, also add a row to `audit-content.xlsx` (columns: SIO | lesson slug | file | line | severity | one-line summary | suggested fix)

**Estimated time:** 5–10 min per lesson × 49 lessons = 4–8 hours.

**Priority order (Category A first — these are the slot-cascade lessons being ported):**
1. `aimer` (SIO-023) — the cumulative root
2. `aller` (SIO-026)
3. `rendezvous`/`vouloir-inviter` (SIO-029)
4. `pouvoir` (SIO-037)
5. `envies-besoins` (SIO-039)
6. `manger-boire` (SIO-042)
7. `futur-proche` (SIO-047)
8. `conseils`/`modaux-avis` (SIO-048)
9. The remaining 41 lessons (Categories B–E) in SIO order

### UI/UX audit — port to the other routes

For each route in the priority list (see "Routes to audit" above):

1. Restart dev server: `cd /home/z/my-project/fluoduo && NEXT_PUBLIC_OPEN_APP=1 npm run dev`
2. Open the route in agent-browser at desktop 1280×900, take a full-page screenshot
3. Switch to mobile 390×844, reload, take a full-page screenshot
4. Get the page text via `agent-browser get text "body"`
5. Run structural queries: `agent-browser eval "JSON.stringify({sections: document.querySelectorAll('section').length, ...})"`
6. Apply the 7 UI/UX audit dimensions
7. Write findings in the same shape as F-U-1 through F-U-10

**Estimated time:** 15–20 min per route × ~15 routes = 4–5 hours.

### Typography — already done, but re-run on future code

```bash
python3 /home/z/my-project/scripts/typography-fix.py /home/z/my-project/fluoduo --dry-run  # report
python3 /home/z/my-project/scripts/typography-fix.py /home/z/my-project/fluoduo          # apply
```

Re-run this after any new code that introduces `text-[Npx]` literals. The script is idempotent — running it on already-fixed code is a no-op.

---

## Output deliverables (for Zcode to produce)

1. `AUDIT-CONTENT.md` — narrative findings per lesson, in SIO order
2. `audit-content.xlsx` — filterable spreadsheet of all content findings
3. `AUDIT-UIUX.md` — narrative findings per route, with before/after screenshots referenced
4. `audit-uiux.xlsx` — filterable spreadsheet of all UI/UX findings
5. (Typography is done — no further deliverable)

Both xlsx files should have these columns:
- `id` (e.g., `F-C-1`)
- `sio` (e.g., `SIO-024`)
- `lesson_or_route` (e.g., `faire` or `/lessons/faire`)
- `file` (e.g., `src/content/lessons/native/faire.tsx`)
- `line` (e.g., `27`)
- `severity` (`blocking` | `pedagogical` | `style`)
- `dimension` (for content: `french` | `english` | `example` | `consistency` | `buildup` | `selfcheck` | `a1` | `cultural`; for UI/UX: `frames` | `mobile` | `desktop` | `hierarchy` | `spacing` | `contrast` | `touch`)
- `summary` (one line)
- `current_text` (quoted)
- `problem` (paragraph)
- `suggested_fix` (code or replacement text)

---

## TL;DR for Zcode

1. Read `RECTIFICATION.md` first (the architecture) + this `AUDIT-SPEC.md` (the quality bar).
2. Typography is done — don't re-do it.
3. Content audit: 49 lessons × ~5–10 findings each, in the shape of F-C-1 through F-C-10. Priority order: Category A first.
4. UI/UX audit: ~15 routes × ~5–10 findings each, in the shape of F-U-1 through F-U-10. Both mobile (390×844) and desktop (1280×900) viewports.
5. The "visible vertical frames" principle is a STATED RULE — flag every content group that lacks a visible frame.
6. Output: `AUDIT-CONTENT.md` + `audit-content.xlsx` + `AUDIT-UIUX.md` + `audit-uiux.xlsx`, all in the repo root.
