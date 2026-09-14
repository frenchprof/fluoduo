# Prompt — a study-revision path curated specially for preparing mid-terms

Paste everything below this line into a new session on the fluoduo repo.

---

Read `AGENTS.md` and `docs/STATUS.md` first, as every session does. Work on
branch `claude/modest-galileo-xstape` (it exists on origin; fetch it and build
on top). Push to origin only; fluoduo-main merges.

## The job, in one paragraph

Build a **Mid-term revision path**: a curated route through the site for a
learner preparing the mid-term, covering Unités 0 to 2 — the first half of the
fifty goals. It lists the skills a mid-term at A1 assesses, and for each skill
it names the goal that teaches it and the one drill shaped like that skill.
Everything in it is drawn from the course's own syllabus (the 50 goals in
`src/content/sios/sios.json` and their can-do statements); nothing in it comes
from, quotes, or is adjusted to any particular paper. That last sentence is a
rule, not a preference — see "What NOT to do".

## What is already on the branch

- A ComposeIt scene « Présenter quelqu'un » at goal 23
  (`src/games/compose/banks-production.tsx`, `PRESENT_PERSON_BANK`): eight
  rotating people, six guided questions, a model about the next person, and a
  word count against 50–60 words. Its persona is in `functions/api/compose.js`.
- Inde, Luxembourg, Italie and Liban in the countries and nationalities decks;
  « en retard » in goal 19's states deck.
- Screenshots of the scene in `docs/revision/shots/`.

## What to write and add

Do these in order. Each ships with a screenshot of the real built app
(`NEXT_PUBLIC_OPEN_APP=1 npm run build`, then drive `out/` with Chromium the
way `scripts/guide-shots.mjs` does), or the check's output where there is
nothing to see.

### 1. The revision path as a page in the app

Add a page at `/revision` (route name is Dan's to change) that reads, top to
bottom, as one route through the first half of the course. Follow the
collapse rule: the skill list is open on arrival, the per-skill detail is a
closed `<details>` with a count in its summary (« 5 goals »). The page uses
the cahier shell like every other station, and English chrome.

The skills, each with its goals and its drill — verify every goal number and
drill against `sios.json`, `lessons.ts` and `activityStops.ts` before it goes
in, the way `docs/GUIDE.md` was grepped line by line:

| Skill | Goals | The drill shaped like it |
|---|---|---|
| Conjugating être, avoir, faire, aller, -er verbs, s'appeler | 1, 14, 19, 23, 24 | ConjugaZone, TYPE IT |
| Negation ne…pas / ne…plus | 28 | MneMemo Moyen on « La négation » |
| The article before a country | 15 | MneMemo « Les articles des pays », VocabulaRain |
| Nationality agreement (m/f, plural) | 16 | MémoiRecall, Me tester |
| Asking a question (quel, où, comment, combien) | 34 with 12, 16, 17, 19 | MneMemo Bonus on « Les mots interrogatifs » |
| Possessive adjectives | 22 | MneMemo Moyen on « Mon, ma ou mes ? » |
| Word order in a simple sentence | 16, 23, 28, 39 | MneMemo Facile, the put-in-order cards |
| Reading a short friendly e-mail | 27, 28, 29, 30 | ÉcouTexte Unité 2 |
| Reading a notice (places, times, addresses) | 27, 33, 36 | VocabulaRain on places in town |
| Writing a short portrait of a person | 23, then 20 and 30 | ComposeIt « Présenter quelqu'un », then VoixLà ✏️ check |
| Understanding short everyday dialogues | 1, 7, 9, 12, 19 | ÉcouTexte Unité 0, NumBus prices |
| Understanding a voicemail (day, time, phone number) | 18, 27, 29, 33 | NumBus with phone numbers and times ticked |

Above the table, the order to work each goal, in one line: SpecuLearn →
MneMemo (at least Moyen) → MémoiRecall → the drill named → ErroReview the
next day. Every goal number is a link to `/sio/SIO-0NN`; every drill name is a
link to that drill at that goal (`stopHref` in `activityStops.ts` gives it).

### 2. A door to it

Put the page one tap from Start: a line under Help's five steps, the way the
manual is linked (a line, not a tile — Help was ruled on 9 Sep to open onto a
manual, not another grid). Add the route to the ☰ menu only if Dan says so.

### 3. The lessons should mention the words the decks just gained

- `src/content/lessons/native/articles-pays.tsx`: add « le Liban » and
  « le Luxembourg » where it lists the « le » countries and « l'Inde » where it
  lists the vowel case, so the lesson and the deck agree.
- `src/content/lessons/native/nationalities.tsx`: where it shows the
  -ien/-ienne and -ois/-oise patterns, add indien/indienne and
  luxembourgeois/luxembourgeoise as examples. Run `verify48-three-stops.py`
  afterwards; it cross-reads the countries deck against the langues-pays
  lesson.

### 4. Write the rule down and put a check behind it

Add a permanent section to `AGENTS.md`, dated 14 Sep: **revision content is
drawn from the syllabus, never from a particular paper.** A drill rehearses a
skill's shape with a rotating subject; it never carries a specific
assessment's wording, subject or answers; and no assessment paper is committed
to this repo. Concrete example: the writing scene asks for a cousin, a
neighbour, a classmate, and the six questions are the same whoever it is.

Then add a verify script (pick a free number well clear of the frontier, per
the renumbering note in AGENTS.md, and add its `run:` line to
`.github/workflows/verify.yml`) that fails if any file under `docs/` or `src/`
contains the markers of a paper: « corrigé », « /25 », « [1 pt] », « Nom et
prénom ». Keep the marker list at the top of the script so it can grow. A
rule that is not checked is not a rule (the Geist lesson).

### 5. Rebuild the guide

Add the revision page to `docs/GUIDE.md` under « Also », one line, then run
`python3 scripts/build-guide.py` so `docs/guide/index.html` matches, and
confirm no guide-reading check fails.

## What NOT to do

- Do not quote, paraphrase or shape anything after a specific assessment
  paper. If you find such text on the branch, remove it and say so.
- Do not add or reword deck cards to match any paper's sentences.
- Do not filter distractors for being wrong French (the 1 Sep ruling).
- Do not restructure `ComposeSolo.tsx`; the word count is the only change it
  needed and it is in.
- Do not hand-edit `docs/guide/index.html`; it is generated.
- Do not merge. Push, then hand over to fluoduo-main naming every file
  touched and which are shared.

## Done means

`npx tsc --noEmit` clean; `NEXT_PUBLIC_OPEN_APP=1 npm run build` clean; every
`verify/*.py` passing (verify95 needs the Pillow library, which the container
may lack; say so if it is the only red); eslint clean on every file the branch
touches; a STATUS entry; and a screenshot of the revision page at phone width
and at 1280px, plus the check output for step 4, in the handover message.
