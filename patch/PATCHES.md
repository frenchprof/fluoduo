# Fluoduo patch bundle — 8 August 2026

Eight files: four new, four replacements. Plus seven small hand-edits to existing files, listed below.

Nothing here has been applied to your repo. Everything is reversible. Apply in the order given — each step is independently testable, per the non-dismantling guarantee.

```
src/lib/dayKey.ts                              NEW
src/lib/collections/gapSentence.ts             NEW
src/lib/collections/gramMarathonReady.ts       REPLACE
src/content/collections/partitifs.json         REPLACE  (16 → 22 items)
src/content/collections/modaux-plans.json      NEW      (8 items)
src/content/collections/modaux-avis.json       NEW      (9 items)
src/content/sios/sios.json                     REPLACE  (SIO-047/048 repointed)
src/games/compose/banks-production.tsx         NEW      (6 banks)
```

---

## Step 1 — The GramMarathon readiness bug *(highest value, do first)*

**What was wrong.** Five call sites disagreed about which sentence an item's gap lives in:

| File | Rule |
|---|---|
| `gramMarathonReady.ts:16` | `(it.example ?? it.fr)` ← the readiness gate |
| `GramMarathonContent.tsx:56,71,92` | `it.fr` ← the game itself |
| `DicedPractice.tsx:64` | `(it.example ?? it.fr)` |
| `CahierShell.tsx:550` | `it.fr` ← tab visibility |
| `activities/page.tsx:48` | `it.fr` ← tab visibility |

Measured against your actual deck set, three outcomes were broken and none of it was visible:

| Deck | Outcome | Gate says | Game finds | Learner sees |
|---|---|---|---|---|
| `partitifs` | SIO-042 | 3 — below `MIN_GAPPED` | 16 | **no GramMarathon tab at all** |
| `en-au-aux-a` | SIO-032 | 17 — passes | **0** | **an empty marathon** |
| `lieux-letris` | SIO-033 | 23 — passes | **1** | **a one-question "marathon"** |

**The fix.** One shared helper, `gapSentence(it)`, that prefers whichever sentence actually contains the gap — `fr` first, then `example`. Both authoring patterns stay valid: `fr`-as-sentence (partitifs) and `fr`-as-grid-label (en-au-aux-a, lieux-letris).

I checked all 44 decks before and after. **No deck loses a single playable item.** partitifs gains its tab; SIO-032 and SIO-033 get real marathons instead of broken ones.

Copy in `src/lib/collections/gapSentence.ts` and the new `gramMarathonReady.ts`, then make four hand-edits:

**`src/app/practice/grammarathon/[collectionId]/GramMarathonContent.tsx`**
```ts
import { gapSentence, isPlayableGap } from "@/lib/collections/gapSentence";

// lines 56 and 92 — the shuffle filters:
setOrder(shuffle(deck.items.map((it, idx) => (isPlayableGap(it) ? idx : -1)).filter((x) => x >= 0)));

// line 71:
const { before, after } = item ? splitGap(gapSentence(item), gap) : { before: "", after: "" };
```

**`src/games/dice/DicedPractice.tsx`** — line 64, delete the local helper and import instead:
```ts
import { gapSentence } from "@/lib/collections/gapSentence";
// remove: const sentenceOf = (it: Item) => it.example ?? it.fr;
// then replace sentenceOf( with gapSentence(  — 2 call sites
```

**`src/components/CahierShell.tsx:550`** and **`src/app/activities/page.tsx:48`** — swap the inline predicate for the shared one:
```ts
import { isPlayableGap } from "@/lib/collections/gapSentence";
// ...items?.some((it) => it.gap && it.fr?.includes(it.gap))   →   ...items?.some(isPlayableGap)
```

**Verify:** `npx tsc --noEmit && npm run build`, then open `/practice/grammarathon/partitifs` (should now exist and offer 22 items), `/practice/grammarathon/en-au-aux-a` (17, was empty) and `/practice/grammarathon/lieux-letris` (23, was 1).

---

## Step 2 — `les-de` folded into SIO-042

Your call: fold rather than give it `SIO-042A`. The six quantity items are now `partitifs-q01` … `q06` inside `partitifs.json`, taking it 16 → 22.

They were fragments (`"beaucoup de pain"`), so I rewrote them as full sentences with a `gap` on the bare **de**, and gave each a partitive contrast in `example`:

```
fr      "Je mange beaucoup de pain."     gap "de"
example "Je mange du pain."
```

That is the pedagogical point of the merge — after a quantity expression the partitive collapses to bare `de`, and the item now teaches that contrast directly rather than sitting in an unreachable vocabulary deck. Syllables are preserved from the original items.

**Then delete the orphan** and drop its import from `src/content/collections/index.ts`:
```
git rm src/content/collections/les-de.json
```

**Verify:** all 22 partitifs items are gap-playable — I checked.

---

## Step 3 — `modaux` split

`modaux.json` held two outcomes' content: items 01–03 are `aller` (SIO-047, making plans), 04–12 are pouvoir/devoir/falloir (SIO-048, giving advice). Split on the existing `lemma` field, so the allocation is data-driven rather than my judgement.

**One thing needs your eye.** The split leaves `modaux-plans` with only 3 items — below `MIN_GAPPED = 4`, so SIO-047 would have *lost* GramMarathon entirely. I authored five more `aller + infinitif` items in the unit's restaurant/food register to take it to 8:

```
Vous allez commander une entrée.        gap "allez"
Je vais prendre le menu du jour.        gap "vais"
Ils vont réserver pour huit heures.     gap "vont"
Tu vas goûter le dessert.               gap "vas"
On va payer l'addition.                 gap "va"
```

They cover the persons the original three missed (`allez`, `vont`, `vas`, `va`). Please read them before committing — they're the only content here I invented rather than moved.

`sios.json` is updated to repoint SIO-047 → `modaux-plans`, SIO-048 → `modaux-avis`. Add both files to `collections/index.ts`, remove `modaux.json`.

**Verify:** both decks are GramMarathon-ready (8 and 9 playable). `/sio/SIO-047` and `/sio/SIO-048` should now show different decks.

---

## Step 4 — The day boundary

`src/lib/dayKey.ts` implements both your decisions: **learner-local** zone, **04:00 rollover**.

Then in `src/lib/progress.ts`:

```ts
import { dayKey, previousDay, learnerZone } from "@/lib/dayKey";

// delete todayStr() at line 73

// lines 202-206 become:
const today = dayKey();
if (p.lastActiveDay === today) return p;
const streak = p.lastActiveDay === previousDay(today) ? p.streak + 1 : 1;
return { ...p, streak, lastActiveDay: today, timeZone: learnerZone() };
```

Add `timeZone?: string` to the `Progress` type (line ~54) and to `defaultProgress()`. In `progressSync.ts`'s `mergeProgress`, carry it through: `timeZone: local.timeZone ?? remote.timeZone`.

**Leave historical `lastActiveDay` values alone**, per your decision — the fixed logic corrects forward. Seven learners currently have a wrong stored value; none will after their next session.

**Teacher side:** keep `SG_DAY_KEY` for cohort views ("who's active today in my class" is legitimately *your* day). For per-learner streak and last-active, read the learner's stored `timeZone` and use `dayKey(ts, learnerTz)`.

---

## Step 5 — The six Compose banks

`src/games/compose/banks-production.tsx` — four solo (written production, `aiCheck: true`) and two dialogue:

| Bank | Outcome | Mode | What the learner does |
|---|---|---|---|
| `premiere-rencontre` | SIO-010 | dialogue | greet, introduce, spell name, say goodbye |
| `presenter-pays` | SIO-020 | solo | 3–4 sentences on a francophone country |
| `petit-message` | SIO-030 | solo | short friendly email, ≥2 connectors, good wishes |
| `itineraire` | SIO-040 | solo | journey step by step with ordering connectors |
| `avis-restaurant` | SIO-049 | solo | one good point, one bad, a recommendation |
| `au-restaurant` | SIO-050 | dialogue | full arc: table → order → bill → pay → leave |

Vocabulary is restricted to decks already met at that point in the sequence, so composing is retrieval rather than reading comprehension. `itineraire` is deliberately distinct from the existing `directions` bank (SIO-036): that one is about *asking for* directions, this one about *sequencing* a journey you know — connectors carry the load.

Register them in `banks.tsx`:
```ts
import { PRODUCTION_BANKS } from "./banks-production";
export const BANKS: ComposeBank[] = [ ...EXISTING_BANKS, ...PRODUCTION_BANKS ];
```

**⚠️ One integration point I could not verify statically.** These six SIOs have `collectionId: "atelier-sio-0NN"` and **no deck file exists** for those ids. I set each bank's `deckId` to match, but if the activity rail resolves the deck before rendering the Compose tab, the tab won't appear. Please check `/sio/SIO-050` after wiring; if the rail is deck-gated, it needs a small change to let a bank attach to a deckless production SIO. That is the one thing in this bundle most likely to need a second pass.

**Review these before they reach learners.** They're pedagogical content and you should read the scenarios and phrase banks. Nothing else in this bundle is learner-facing copy.

---

## Step 6 — Safari / Firefox escape hatch

`/practice/wordrill` gates on `SpeechRecognition`, which Safari and Firefox have never implemented, and unlike the per-deck Say It page it offers **no fallback link** — a dead end. Add the same "Use Flip It instead" escape the per-deck page already has. Since the compiled WorDrill page has no single `collectionId`, point it at the SIO index rather than a specific deck.

Also worth auditing the same gate in `SpecuLearnContent.tsx` and `app/tutor/page.tsx`.

---

## Not in this bundle

**The Finale help ladder.** You chose "Finale is practice — add the 5th rung," which means answer reveal plus post-reveal spaced retrieval plus assistance tagging on the evidence. That is a design task, not a patch: it changes what a Finale response *means* evidentially, so it needs the evidence schema underneath it before it can be implemented coherently. I'd rather specify it properly than bolt a reveal button onto 437 items. Next session.

**Still open from your tracker:** TTS auto-play regression · 7 zero-gap SIO decks · roadmap 9px labels · **Firestore service-account key rotation** (still live, flagged twice, and the key is currently sitting in `~/Downloads`).

---

## Suggested commit sequence

```
git checkout -b fluoduo/data-and-curriculum-fixes
# step 1 — tsc, build, click the three marathons
git commit -m "fix: unify gap-sentence rule across GramMarathon call sites (SIO-032/033/042)"
# step 2
git commit -m "content: fold les-de quantity items into SIO-042 partitifs"
# step 3
git commit -m "content: split modaux into modaux-plans (047) and modaux-avis (048)"
# step 4
git commit -m "fix: learner-local day key with 04:00 rollover"
# step 5
git commit -m "content: six Compose banks for the production outcomes"
# step 6
git commit -m "fix: Safari fallback on /practice/wordrill"
```

Run `npx tsc --noEmit && npm run build && npm run lint` after each. Lint should stay at its pre-existing baseline — none of these introduce new issues.
