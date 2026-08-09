# Patch 3 — the evidence model (10 August 2026)

Requires the firestore.rules deploy of the same date (already published).

```bash
cd ~/fluoduo
unzip -o ~/Downloads/fluoduo-patch3.zip
python3 patch3/apply3.py --dry-run     # expect: changed 3, failed 0
python3 patch3/apply3.py
npx tsc --noEmit && npm run build && npm run lint 2>&1 | tail -2
git add -A && git commit -m "feat: evidence model — record how an answer was produced, not just whether it was right"
```

## What it does

`status: met | missed` couldn't distinguish a learner who produced an answer
unaided from one who picked it from four options straight after studying it.
PRD §7 says those are different evidence. Now each stored answer also carries:

| field | meaning |
|---|---|
| `outcomeId` | which curriculum outcome the answer bears on |
| `evidenceType` | recognition · constrained · free · receptive · productive · transfer · delayed · diagnostic · teacher |
| `assistance` | none · nudge · question · scaffold · partial · answer |
| `assistCount` | hints taken before answering |
| `independent` | derived: `assistance === "none"` |

## The join table is the important part

Item ids do **not** reliably encode their outcome. After the 14 July re-cut the
pretest files kept their old names, so `u4-sio045-01` is frequency-adverb
content belonging to **SIO-043**, and `u4-sio047-01` is Commerces belonging to
**SIO-044**. Anything that parses digits out of an id will misattribute them.

`outcomeForItem()` resolves properly, longest-prefix first. Verified against
real ids:

```
finale:SIO-034:2     -> SIO-034     (stated outright)
u4-sio045-01         -> SIO-043     (NOT 045 — the trap)
u4-sio047-01         -> SIO-044     (NOT 047 — the trap)
u4-sio047-plans-01   -> SIO-047     (longest prefix wins)
modaux-plans-05      -> SIO-047     (post-split)
modaux-avis-02       -> SIO-048
partitifs-q03        -> SIO-042     (the folded les-de items)
conj-avoir-3         -> unresolved  (honest: no outcome behind it)
```

**All 50 outcomes are reachable.** Where an item genuinely has no outcome —
some games pass raw French, e.g. `recordItemResult(cur.fr)` — the resolver
returns undefined rather than guessing.

## Deliberately not wired yet

**`assistance` will read `"none"` everywhere.** Nothing outside Finale's clue
ladder counts hints, so there is nothing truthful to report. That is the honest
state: it records *"no help recorded"*, not *"no help taken"*. It becomes real
when the help-ladder work lands, which is the natural next piece.

**`latencyMs`** is plumbed through but no caller times its questions yet.

## Compatibility

Every existing caller keeps working — the new `recordItemResult` argument is
optional, and every new Firestore field is optional in the rules. Nothing has
to change for the trail to start carrying `outcomeId` and `evidenceType` on
every answer from the moment this ships.

## Caveat that travels with the data

The rules deploy that admits these fields also raised the `xp` ceiling from 100
to 2000, fixing the silent rejection of every correct answer from learners on a
7+ day streak. So the response store has a **known-bad window before
2026-08-10**. Any analysis spanning it needs that caveat; anything after is
clean.
