# Handoff: Dan's Ohio conference video talk (and what follows it)

Written 13 Oct 2026 by the session that built everything below, for whoever picks it up next.
Read this whole file before doing anything. Then read the narration script document (link below).

---

## 0. Who, what, when

- **Dan** = Dr Daniel Chan (call him Dan; he dropped "Dr" from all slides), Senior Lecturer,
  Centre for Language Studies, Faculty of Arts and Social Sciences, National University of Singapore.
  daniel.chan@nus.edu.sg. Teaches French as an Additional Language (25+ years).
- **The talk**: *Digital Approaches to Teaching Less Commonly Taught and Indigenous Languages Conference*,
  Ohio University, 16–17 Oct 2026. Dan's slot: **Saturday 17 Oct, 8:30–9:00, Gordy 311, asynchronous**
  → a **pre-recorded video**, about 25–28 min (the slot is 30 min).
- **Official title (as in the programme)**: *Building Fluency on Linguistic Goals (FluOLinGo): Exploring how an
  objective-driven AI platform for beginners can be re-specified for a typologically distant language,
  Mandarin Chinese*. Dan's new script opening says "can be adapted"; we suggested using the programme's
  wording ("is being re-specified") — not yet decided.
- **The video** = slides (animated) + **Dan's HeyGen clone** in a small circle in a corner, speaking the narration
  in Dan's cloned voice. The clone video must open with an AI disclosure (Dan's own wording, now in the script).
- **Dan's worry**: not to embarrass his employer. Facts must be true; no invented numbers; Chinese version is
  *designed, not built* and the talk must say so.

## 1. How to work with Dan (non-negotiable — these are his rules)

- **Plain English, concrete examples from this project.** No jargon, no unexplained abbreviations.
- **Show, don't describe.** Every visual change → a screenshot or video of the real thing, before/after side by side.
  When offering options, show them.
- **No forced triplets.** Dan rejects "X, Y and Z" rhetorical triads in anything you propose. Use pairs, or four+.
- **Fact-check before claiming**; when unsure, say so and check the textbook. He has caught several errors.
- **Don't change things he didn't ask for**; ask before spending money; confirm before big rebuilds.
- He edits documents himself and asks for help mid-sentence ("help continue: …") — offer 1–2 completions,
  recommend one, and insert only when he says "add" / "put it in".
- Project rules in the repo's `AGENTS.md` also apply (fonts Geist and Work Sans are banned; English never larger
  than the French/Chinese it glosses; etc.).

## 2. Where everything lives

| Thing | Where | Notes |
|---|---|---|
| **Narration script — THE SOURCE OF TRUTH** | Claude Doc: https://claude.ai/code/artifact/c57888d2-ba57-4745-a3c1-34b7deb4430e (project id `c57888d2-ba57-4745-a3c1-34b7deb4430e`, tab body node `a7df0ccb-87e2`) | **Dan is rewriting it now.** Plain text = Dan's English clone voice. `[FR: …]` / `[ZH: …]` = said in Dan's own French voice. Read it with the Claude Docs tools. |
| **Slide deck** | Slides artifact: https://claude.ai/artifact/QGuVvusYHdKcia1NDnQ9XJ (25 slides) | Each slide's `<aside>` holds the **old** narration — out of date now that Dan is rewriting the script. |
| Course plan (French + Chinese) | Claude Doc: https://claude.ai/code/artifact/faac2c8c-7c0f-48b1-bfcf-ca6db86de710 | Rules Dan set for the course (see §8). |
| Tools, data, animation sources | this folder, `docs/talks/ohio-2026/` on branch `claude/intelligent-bardeen-2wrg4v` | See §6. |
| Clone videos already made | Dan's HeyGen account (re-downloadable by video id, §5) | |
| Slide animation clips + stills | uploaded as assets in the deck artifact (ids in the slide files: `data-video` = clip, `src` = still) | |
| Final assembled video (draft) | was built at 27.8 min, NOT delivered — superseded by the script rewrite | Rebuild after the script is final. |

## 3. Current status (13 Oct, evening SGT)

1. **Deck**: 25 slides, all designed, 17 of them animated (MP4 that plays once then holds; 4 "picture"
   slides loop by Dan's choice). Cover = option B (light, dartboard logo, NUS + CLS logo, full affiliation).
2. **Script**: Dan is **rewriting the narration in the Claude Doc**. Do not regenerate any voice or video until
   he says the script is final. He said: *"we should confirm what is being said before we design the visuals"*.
3. **Clone videos**: a full set (25 slides) was generated for the OLD script. They will mostly be redone.
4. **HeyGen API wallet: $3.52 left** (was topped up once to ~$58). A full regeneration costs about **$50–55**
   (≈ $0.0365 per second of clone video; audio-only text-to-speech ≈ $0.004 per second). **Dan must top up the
   API wallet (HeyGen → Settings → API) before regenerating.** Always estimate and tell him the cost first.

## 4. Decisions Dan has made (keep them)

**Terminology (throughout script and, later, slides):**
- The template = **frame** (same for any language) + **slots** (each language fills them) + **settings**
  (change with the language: which kinds of linguistic goal exist; where learners go wrong → the key choice in
  each exercise). Old wording "transfer the engine / adapt the mechanics / re-author the goals" and "three moves"
  is retired. Don't recite frame-slots-settings as a triplet in every sentence.
- **Linguistic goals** (was "pieces", then "points") = the building blocks: sounds, script, vocabulary, word forms,
  sentence structure. **Communicative goals** = L'Atelier's "situations". Each unit ends with a **task**
  (L'Atelier's "Mission"). Pragmatics belongs to communicative goals, not linguistic ones.
- In exercises the blank is a **gap** (not a "slot", which now means the template's slots).
- Script now cites Wilkins (1976, synthetic vs analytic) and Yalden (1983, 1987, proportional syllabus):
  FluOLinGo combines structural and communicative elements; its linguistic goals go beyond grammar.
- Script notes that script/writing goals are not universal (many Indigenous languages are learnt by ear).

**Voice and language:**
- **English** = Dan's English clone voice `d8ac22b7d66c4419b49dfbbad3feefd3`.
- **Every French and Chinese word** = a separate take in **Dan's own voice "dan-23aug"**
  `244cb273d5284ec086a30493819f3562` (he confirmed it is him; works for Mandarin too), stitched into one
  soundtrack per slide, then the clone is **lip-synced to that soundtrack** (no pauses, no cuts).
- G-Compris! and ÉcouTexte (app names) are said in French ("J'ai compris !", "Écoutexte"). WorDrill,
  ComposeIt, FluOLinGo stay English.
- **Pinyin is never spoken** (it stays on slides). « L'atelier » is said "Lah-tuh-liay" by the English voice.
- French/Chinese stay as written — no phonetic respelling of foreign words.

**Visual:**
- Clone shown as a **300 px circle** (head and shoulders, cropped from the office look; thin grey-and-white ring)
  placed in whichever corner of each slide is empty (`data/placement.json`).
- Content slides animate once then hold; the four analogy slides (loom, camera, gap/key) loop.
- Cover: light background, FluOLinGo dartboard logo, "Daniel Chan / Centre for Language Studies · Faculty of Arts
  and Social Sciences / National University of Singapore", NUS + CLS logo bottom right (no white circle).
- Slide 2 = daytime 3D scene of the app's entrance (numbered stops); Dan's new intro sentence about
  "a numbered stop" should play over it.

## 5. HeyGen technical notes

- The API key is a **network secret** in this cloud environment: any session in the environment can call
  `https://api.heygen.com` **without** adding a key header (the proxy adds it). Never ask Dan to paste it.
- Avatar look: **"Daniel Kwang Guan Chan, office"** = `5f06a739dafd4e7ca246686f541a8272` (photo avatar; white shirt,
  orange anthurium, laptop). Two other "office" looks exist — not those.
- Endpoints used (v3; v2 is sunset 31 Oct 2026):
  - `POST /v3/voices/speech` {text, voice_id, language} → audio_url (text-to-speech per segment)
  - `POST /v3/assets` (multipart `file=@x.mp3`) → asset_id
  - `POST /v3/videos` {type:"avatar", avatar_id, audio_asset_id | script+voice_id, resolution:"720p", aspect_ratio:"16:9"}
  - `GET /v3/videos/{id}` → status, video_url, duration; `GET /v3/users/me` → wallet balance
- The connected "HyperFrames by HeyGen" MCP is NOT the clone product and its compose/render are disabled here.
- Existing clone videos (old script) — re-download with `GET /v3/videos/{id}` if ever useful:
  - lip-synced to mixed soundtracks: `data/mixed-log.json` (16 slides + an-key)
  - script-voiced: `data/gen-log.json` (cover, claim, moves, an-loom, an-camera, ai, recipe; the others there are
    superseded); slide 2 test = `f74cdd35a09aa33ba43be14d0e45cdbe`.

## 6. The pipeline (files in `tools/`)

The scripts expect the old scratchpad layout (`<S>/hg`, `<S>/motion`, `<S>/comp`,
`<S>/artifact-files/bc7ab302-65c8-4257-b282-303304de8325/project/slides`). Recreate that layout in your
scratchpad, or edit the paths at the top of each script.

1. **Narration → segments**: `segment.py` reads each slide's `<aside>` and splits it into
   `["en"|"fr"|"zh", text]` (French = « … » plus a word list; Chinese = CJK runs; pinyin after Chinese is skipped;
   fixes: "+"→" ", "___"→"…"/"blank", Enchanté(e)→Enchanté, L'Atelier→"Lah-tuh-liay").
   **New source of truth is the Claude Doc**, where foreign parts are already marked `[FR: …]` / `[ZH: …]`
   (a few new ones are unbolded plain text, e.g. `[FR: faire du] or [ZH: 件]`). Simplest path: export each section
   from the doc, parse the bracket markers (bold or not), and write `segments.json` directly.
   Map doc sections to slides by hand — Dan restructured the opening (old slides 2–3 merged into his intro + "1. Two
   typologically distant languages").
2. **Soundtracks**: `mixed.py audio <slide…>` → per-segment text-to-speech (EN voice / dan-23aug voice),
   0.12 s gaps between English pieces, 0.25 s around foreign pieces, loudness-normalised → `hg/mix/<slide>.mp3`.
3. **Clone videos**: `mixed.py video <slide…>` uploads each soundtrack and makes a lip-synced clone video →
   `hg/av/<slide>.mp4`. (`gen.py` is the older script-voiced generator with a balance guard — reuse its guard.)
4. **Slide visuals**: `motion-src/<slide>.html` are the animated slide pages (render with
   `render.mjs <dir> <seconds>` → `clip.mp4` + `still.png`; frame-by-frame, deterministic; clips hold the last
   frame 180 s). `prep.py <slide>` regenerates a slide's base page from the deck file (`blobmap.json` maps deck
   image ids to local files — re-download those images from the deck artifact first). Analogy slides:
   `motion-src/analogy-e1..e4.html` (1664×652 region) overlaid on the slide still (loop).
   Static slides (moves, spiral, mechanics, transfer) use their `still.png`.
   **When the script changes, slide text must be updated to match** (see §7), then re-rendered.
5. **Assemble**: `build.py` overlays the clone circle (`data/mask.png`, `data/ring.png`, `data/placement.json`)
   on each slide visual for exactly the clone video's duration, 4 slides in parallel, then concatenates →
   `comp/FluOLinGo-Ohio-2026.mp4` (1920×1080, 25 fps, AAC). ~8 min for the whole talk.
6. **Check before sending**: sample ~16 frames across the video into one contact sheet and look at it
   (circle must not cover text; Chinese lines must not wrap; mechanics slide needed `white-space:nowrap`).
7. Deliver the MP4 to Dan; also offer the deck link.

Costs: estimate seconds ≈ words ÷ 2.6; clone video ≈ $0.0365/s; TTS ≈ $0.004/s. Tell Dan the total first.

## 7. Open decisions (ask Dan, one at a time, in plain English)

1. Is the script final? (Nothing gets regenerated before this.)
2. ★ exercise "settings" → rename to **"levels"** (5 places) so "settings" only means the template?
3. Slide 8's "First, keep the frame… Second… Third…" — keep, or reduce to two steps (no triplets)?
4. The paragraph after "Linguistic goals can vary…" says the French-vs-Mandarin contrast twice — cut the second?
5. The Wilkins/Yalden paragraph mentions "the grid" before slide 6 introduces it — move it to slide 6?
   Years will be read aloud ("nineteen seventy-six") — keep or move to slide only?
6. Programme wording "is being re-specified" vs Dan's "can be adapted".
7. Chinese units with **no unit task** (NPCR lessons 1–2, 7–9, 10–11; only L6 and L14 are review lessons):
   (a) teacher writes tasks, or (b) say they have none.
8. After the script is final, slides must follow it: e.g. "① ② ③ Pieces" → linguistic goals, "Three moves" →
   frame/slots/settings, "Same slot, different key" → "Same gap, different key", "Move 1/2/3" labels, slide 3
   (old "claim") and slide 2 roles in the new intro. Show Dan before/after.

## 8. Facts and rules already settled (don't re-litigate)

- Books: French **L'atelier+ A1** (Didier, 2022 "+" edition; FR1 = Bienvenue + Units 1–4). Chinese **New Practical
  Chinese Reader (NPCR), 2nd ed., Textbook 1** (14 lessons; grouped by us L1–2, L3–6, L7–9, L10–11, L12–14).
- L'Atelier has numbered situations, grammar/lexique/phonétique boxes, ateliers d'expression, and a Mission per unit.
  NPCR has texts, new words, notes, pronunciation, grammar (not every lesson), characters — **no situations, no tasks**.
- Course rules (Dan): never teach or test beyond the book ("unsure → check the book"); the publisher's unit tests
  count as covered; every taught verb with all 9 subject pronouns (je tu il elle on nous vous ils elles);
  8 stressed pronouns (on and nous share "nous"; soi not in FR1); spiral = Seen · Focus · Scored (only focus and
  scoring are limited); about one part in five may be new, but no answer may be the unknown or depend on it;
  bonus material is labelled and never scored; teacher additions (e.g. « Enchanté(e) ») are taught and scored;
  numbers 0–20 scored in Bienvenue, 21–69 in Unit 1 Situation 3; 12 colours visible in Bienvenue, rouge and bleu
  scored there, agreement never scored; matières, pourquoi/parce que (recognise only), notre/leur and « mon amie »
  are bonus; midi and minuit ARE in the book; combien IS in Bienvenue; et quart / et demie are NOT.
- Chinese examples must come from NPCR1 (e.g. 打球 · 看电影 · 喝咖啡; 一件衣服 not 一个衣服; 中国人 / 英国人 → 卢森堡人).
- Never use pirated book copies. Book page images are for reference, not for slides (covers are fine).

## 9. After the conference: the website (repo `frenchprof/fluoduo`)

Pending work Dan wants on the FluOLinGo site (separate from the talk):
- rebuild MneMemo as the six-tab lesson page (Parcours · Concept · Formes · Exercice ★/★★/★★★ · Bonus · Lexique);
- add the catalogue as data + an automatic build check (French ceilings: `planning/french-catalogue-ceilings.md`;
  Chinese: `planning/chinese-catalogue-*.md`);
- apply the content audit (`planning/audit/`: ~328 real problems; 16 whole-goal questions still to ask Dan one by one);
- fix two French bugs: « Je ne vais pas faire du sport » in `modaux-plans.json`; « deux de baguettes » accepted in
  `au-marche.gen.ts`;
- mobile bug: on a phone, **G-Compris! shows the top bar twice** (seen at 390 px wide on /gcompris/carte-postale);
- record the new rules in `AGENTS.md` with checks; read `docs/STATUS.md` first (repo rule).
Repo practice: develop on your designated branch, push to `origin` only, never merge (fluoduo-main integrates).
