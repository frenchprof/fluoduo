# Prompt — finish the Test 1 work on FluOLinGo

Paste everything below this line into a new session on the fluoduo repo.

---

Read `AGENTS.md` and `docs/STATUS.md` first, as every session does. Work on
branch `claude/modest-galileo-xstape` (it exists on origin; fetch it and build
on top). Push to origin only; fluoduo-main merges.

## The background, in one paragraph

Dan pasted LAF 1201 Test 1 (Grammaire /25, Compréhension écrite /10,
Expression écrite /15, Compréhension orale /10) on 14 Sep and asked which parts
of the site a learner must do to get full marks. The answer is
`docs/revision/LAF1201-test1-study-path.md`: fourteen goals cover the paper.
That session then built what was missing and pushed it to this branch:

- a ComposeIt scene « Présenter quelqu'un » at goal 23
  (`src/games/compose/banks-production.tsx`, `PRESENT_PERSON_BANK`), eight
  rotating people, six guided questions, a model about the next person, a
  word count against 50–60 words, and its own persona in
  `functions/api/compose.js`;
- Inde, Luxembourg, Italie and Liban in `countries-letris.json` and their
  adjectives in `nationalities.json`;
- « en retard » and « Pardon, je suis en retard ! » in `avoir-etats.json`.

The one ruling from that day that must stay true in everything below:
**the site rehearses the SHAPE of a test question, never its SUBJECT.** The
test's writing task is « présentez votre meilleur ami ». The scene is
« Présenter quelqu'un », and « meilleur ami » appears nowhere in the app.
Dan: *"we don't want to give away the fact that the question in the test is
about my best friend … présenter qqn is the correct framing."*

## What is left to write and add

Do these in order. Each one ships with a screenshot of the real built app
(`NEXT_PUBLIC_OPEN_APP=1 npm run build`, then drive `out/` with Chromium the
way `scripts/guide-shots.mjs` does), or, where there is nothing to see, the
check's output.

### 1. Write the ruling down and put a check behind it

Add a permanent section to `AGENTS.md`, dated 14 Sep, titled something like
*"Rehearse the shape, never the subject"*. Quote Dan's line above. Give the
concrete example: the test asks for a best friend, the app asks for a cousin,
a neighbour, a classmate, and the six questions are the same whoever it is.

Then add a verify script (pick a free number well clear of the frontier, per
the renumbering note in AGENTS.md, and add its `run:` line to
`.github/workflows/verify.yml`) that loads the compose banks through jiti the
way `verify440-compose-french.py` does and fails if any chip, headline, prompt
or model text contains a word from a small list: « meilleur ami »,
« meilleure amie », « best friend ». The list lives at the top of the script
so the next test's subject can be added in one line. A ban that is not checked
is not a ban (the Geist lesson).

### 2. Update the study path to what is now true

`docs/revision/LAF1201-test1-study-path.md` and the published page were
written before the scene existed. Change:

- Expression écrite: the first drill is now ComposeIt at goal 23,
  « Présenter quelqu'un »; goals 20 and 30 become the second pass.
- The "not on the site" list loses l'Italie, le Liban, indien,
  luxembourgeois and « en retard ». It keeps « désolé(e) » and the poster's
  phrases (s'inscrire, ballon, the sign-up condition).
- Section D can now say the four test adjectives are in the deck.

### 3. Give « désolé(e) » a home

It is in listening dialogue A (« Je suis vraiment désolée ! ») and has no
deck. Goal 9's greetings deck sorts hello from goodbye, so it does not fit
there. Put « Désolé ! / Désolée ! » and « Pardon ! » in the deck that already
holds the apology's neighbour: `avoir-etats.json` now has « Pardon, je suis
en retard ! », so add the two words there as `col:il_est` states
(« il est désolé »), with the plural forms the deck's pattern uses. If you
judge another deck fits better, say why in the commit.

### 4. The lessons should mention the words the decks just gained

- `src/content/lessons/native/articles-pays.tsx` uses Italie once and never
  Liban, Inde or Luxembourg. Add « le Liban » and « le Luxembourg » where it
  lists the « le » countries and « l'Inde » where it lists the vowel case, so
  the lesson and the deck agree.
- `src/content/lessons/native/nationalities.tsx`: where it shows the
  -ien/-ienne and -ois/-oise patterns, add indien/indienne and
  luxembourgeois/luxembourgeoise as examples. Run `verify48-three-stops.py`
  afterwards; it cross-reads the countries deck against the langues-pays
  lesson.

### 5. Section E, « find the question », has no drill of its own

The study path points at MneMemo's Bonus level on goal 34, which translates
whole sentences from English. That is the nearest thing, not the thing. Add
to the `question-words` deck (goal 34) six gapped answer-to-question cards
in the test's shape, where the ANSWER is shown and the learner types the
question word:

    « ____ âge elle a ? — Elle a 32 ans. »            Quel
    « ____ est sa nationalité ? — Elle est française. » Quelle
    « Elle habite ____ ? — À Lyon. »                   où
    « ____ langues elle parle ? — Anglais et italien. » Quelles
    « ____ est sa profession ? — Elle est boulangère. » Quelle
    « Elle s'appelle ____ ? — Marie. »                  comment

Use the deck's existing `gap` + `lemma` item shape (see `avoir-etats.json`
items 23 onwards). Do not use the test's exact answers verbatim; change the
names, ages and towns. That makes GramMarathon at goal 34 the drill for
section E; update the study path to say so.

### 6. Listening dialogue E is not on the site either

« Il est super ton nouveau vélo ! Tu veux aller faire un tour au parc ? »
Goal 38 (« Tu y vas comment ? », deck `transport`) has « à vélo »; goal 29
(vouloir) has « Tu veux venir ? ». Add one card to `vouloir-inviter.json`:
« Tu veux aller au parc ? » with its English, so the invitation-to-a-place
shape is dealt in MémoiRecall and WorDrill. Check `verify76` and
`verify74`, which read those two decks.

### 7. Rebuild the guide

`docs/GUIDE.md` already says 13 goals for ComposeIt. After step 5, nothing
in the guide changes, but run `python3 scripts/build-guide.py` anyway so
`docs/guide/index.html` matches, and confirm no guide-reading check fails.

## What NOT to do

- Do not add « meilleur ami » anywhere, including the study path's own
  wording of the drill (name the test section, not the subject).
- Do not filter distractors for being wrong French (the 1 Sep ruling).
- Do not restructure `ComposeSolo.tsx`; the word count is the only change it
  needed and it is in.
- Do not hand-edit `docs/guide/index.html`; it is generated.
- Do not merge. Push, then hand over to fluoduo-main naming every file
  touched and which are shared.

## Done means

`npx tsc --noEmit` clean; `NEXT_PUBLIC_OPEN_APP=1 npm run build` clean;
every `verify/*.py` passing (verify95 needs the Pillow library, which the
container may lack; say so if it is the only red); eslint clean on every
file the branch touches; a STATUS entry; and the screenshots or check
output for each of steps 1–6 in the handover message.
