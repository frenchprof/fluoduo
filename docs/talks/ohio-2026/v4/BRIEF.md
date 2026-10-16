# Brief: building synced slides for Dan's Ohio talk (v4)

You are building some slides of a pre-recorded 30-minute conference talk by Dan (Daniel Chan, NUS, French teacher)
about FluOLinGo, his goal-based French platform, and how its template is being adapted for Mandarin Chinese.
Each slide is a 1920×1080 HTML page that animates IN STEP WITH THE VOICE: each element appears at the moment the
narration says it. Dan's own words: **"the animation must tell the story with the narration supporting it"**, and
**"so long as the narration is crystal clear there is no need for so much text."**

## Files

- `v4/slides/<id>.html` — one `<section id="<id>">` fragment per slide. Look at `s04.html` and `s05.html`: they are
  approved examples of the style. Copy their patterns.
- `v4/lib/head.html` — shared CSS (`h2.hd` header, `.part` label, `.zh` Chinese font, `.hand` handwriting font,
  `.gl` grey italic gloss, `.abs` = absolute). `v4/lib/cue.js` — the cue engine (read its top comment).
- `v4/timing/<id>.json` — the REAL voice timing: `sent[k-1]` = sentence k with `start`, `end`, `text`, `words[{w,s}]`.
  Print it first: `python3 -c "import json;T=json.load(open('v4/timing/s11.json'));[print(i+1,round(s['start'],1),s['text']) for i,s in enumerate(T['sent'])]"`
- `v4/img/` — images you may use: `l08.png` (Dan's original aimer lesson page, exercise tab), `l08wide.png`,
  `gc.png` / `gc-wide.png` (G-Compris! reading screen), `compose.png` (ComposeIt), `atelier-cover.png`,
  `npcr-cover.png`, `fluolingo-logo.png`, `nus-cls-clear.png`, `m-welcome.jpg` / `m-gcompris_carte-postale.jpg` /
  `m-games_compose.jpg` (phone screenshots), `scene-day.png` (3D entrance of the app). LOOK at an image (Read tool)
  before placing it.
- Old slides (previous script, same facts, useful content to reuse): `/tmp/claude-0/-home-user-fluoduo/675e2eea-8ec6-53b9-8533-d72e2857df3f/scratchpad/deck/project/slides/*.html`.
  They are reference only; the old narration in their `<aside>` is OUT OF DATE. Follow the new timing file.

## Cues

`data-in="7"` = appears when sentence 7 starts. `data-in="7:word"` = when that word is said (first word in sentence 7
whose letters contain "word"; use `7:=word` for an exact word match, e.g. single letters). Offsets: `"7:word+0.4"`.
`data-out="9"` fades out when sentence 9 starts. `data-fx` = fade|rise|pop|left|right|drop|draw|wipe.
For anything more (highlight, move, a scene change, a counter), write `window.SLIDE = function(){...}` and use
`CUE('7:word')` (seconds) and `A(el, keyframes, atSeconds, durSeconds, fill)`. NO setTimeout, NO requestAnimationFrame,
NO CSS animations that are not gated — the renderer scrubs `document.getAnimations()` frame by frame.
An element that must start hidden must get its opacity from an `A()`/data-in animation (fill 'both' does that).
Long slides should change SCENE (fade a group out, the next group in) rather than pile everything up.

## Render and LOOK

`cd v4/lib && node render.mjs <id>` → `$OUT/<id>.mp4` and `$OUT/<id>-still.png`
(OUT=/tmp/claude-0/-home-user-fluoduo/675e2eea-8ec6-53b9-8533-d72e2857df3f/scratchpad/v4out). It prints `CUE ERRORS`
if a cue word is not found — fix every one. Then pull frames at several sentence times and LOOK at them with Read:
`ffmpeg -loglevel error -y -ss <t> -i $OUT/<id>.mp4 -frames:v 1 -vf scale=960:540 /tmp/f.png`
Check every scene, not just the end. Nothing overlapping, clipped, or off-screen. Do not report a slide you have not looked at.

## Dan's rules (permanent — breaking one means redoing the slide)

1. **One header only** at the top (`<h2 class="hd">`, the slide's title from the script). No kicker line above it.
   The part label goes small at the bottom-left: `<p class="part">Part 3 · Keep the frame</p>` (the exact label is in
   `data/sentences.json` → "part").
2. **Little text.** Pictures, shapes, arrows, real French/Chinese examples, icons. No sentences copied from the
   narration. A label of 1–5 words is fine.
3. **The clone's circle sits at the bottom right: keep x > 1540 and y > 700 EMPTY** on every frame.
4. **English is never bigger or bolder than the French/Chinese it glosses.** Glosses: `<span class="gl">` same size or smaller.
5. Fonts: Patrick Hand (`.hand`) for headers/big numbers, Roboto for the rest, Noto Sans SC (`.zh`) for Chinese.
   **Geist and Work Sans are banned.** Text ≥ 26px.
6. Palette: ink #1f2430, paper #fbfaf4, blue #006baa / #1ca6ff / tint #eff8ff, teal #00c197 / #00715a / tint #eafbf8,
   yellow #fcdf00 / tint #faf7e2, orange #ff9037 / #9f5100 / tint #fff4ed, violet #b17eff / tint #f8f4ff,
   grey #6a7179 / #9ca3af / #d7d9de. Blue = linguistic goals, yellow = communicative goals / situations, orange = task.
7. **No forced triplets** in any label you write ("X, Y and Z" slogans). Lists that are real lists are fine.
8. **No invented facts, numbers or examples.** Use only what the narration or the old slides already say. Chinese
   examples ONLY from the list below (they are checked against the textbook). French spelled correctly with « ».
9. Calm motion: fades, slides of 20–60px, pops, draw-ons, gentle highlights. Nothing spins, shakes or flashes
   (one camera flash on slide 15 is fine). Beats 0.4–0.8s.
10. No emoji the slide does not need; a few clear icons are fine.

## Checked examples you may show

- Tones (sounds): mā 妈 mother · má 麻 hemp · mǎ 马 horse · mà 骂 scold (pinyin with tone marks shown).
- Same word order: « Je fais du ski. » · 我喝咖啡。 (S · V · O)
- Same verb for every person: 我喝 · 你喝 · 他喝 (vs « je bois · tu bois · il boit » — fine, bois/boit are correct).
- Aspect marker: 买 → 买了 (bought) — NPCR Lesson 13.
- Word order pair (sentence structure): 一斤苹果多少钱？ / 多少钱一斤？ (both = "How much is a jin of apples?") — NPCR Lesson 10.
- Measure words: 一张照片 a photo · 一瓶水 a bottle of water · 一间房子 a room (each takes a different one).
- Gender in French: « le sport » · « la danse »; « un homme » · « une femme ».
- Slide 16: 打球 play ball · 看电影 see a film · 喝咖啡 drink coffee; 一件衣服 ✓ vs 一个衣服 ✗.
- Slide 17: 中国 → 中国人 · 英国 → 英国人 · 卢森堡 → 卢森堡人; « chinois → chinoise » · « luxembourgeois → luxembourgeoise ».
- Slide 19 (NPCR Book 1, Lesson 3, 她是哪国人？): 力波，那是谁？ / 那是我们老师。 / 她是哪国人？ / 她是中国人。 /
  我们老师都是中国人。 Goals: 是 · 不是 · 谁 · 哪国人 · country + 人 · 都 (seen L2, explained L7) · 不 bù → bú before a 4th tone: 不是 búshì.
- Slide 14: 一刻 a quarter · 三刻 three quarters · 半 half (NPCR Lesson 11).
- Vocabulary, no cognates: « étudiant » ≈ student, but 学生 xuésheng.
