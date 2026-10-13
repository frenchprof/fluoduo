# Animating conference slides — shared brief

Context: a 25-minute pre-recorded conference talk (Ohio University, 17 Oct 2026) by a French teacher
(Dan) about FluOLinGo, a beginner French platform being re-specified for Mandarin Chinese. Each slide is
shown full screen while an AI voice reads that slide's narration (60–110 s). Dan wants each slide to
ANIMATE in a way that makes its point more punchy — an animation that explains, not decoration.

Work ONLY inside `SCRATCH/motion/<slide-id>/`. SCRATCH = /tmp/claude-0/-home-user-fluoduo/03573aa2-b73d-5a65-81b4-48446cede89a/scratchpad
Do not publish anything, do not touch the repo, do not edit anything outside your slide folders.

## Steps per slide

1. `python3 SCRATCH/motion/prep.py <id>` writes `motion/<id>/base.html`: the slide exactly as published,
   as a 1920×1080 page (fonts Patrick Hand + Roboto load from Google Fonts; images point at local files).
   Read the slide source too: `SCRATCH/artifact-files/bc7ab302-65c8-4257-b282-303304de8325/project/slides/<id>.html`
   — its `<aside>` is the narration; read it, the animation should follow the order the voice talks in.
2. Copy base.html to `motion/<id>/anim.html` and add the animation: CSS @keyframes (preferred) or
   element.animate(). Gate every animation on `body.go` (e.g. `.go .row{animation:…}`) — the renderer adds
   class `go` to `<body>` at t=0 and then scrubs every animation via document.getAnimations(), so:
   - NO setTimeout/requestAnimationFrame/JS timers for motion (they won't be captured). JS may build DOM at load.
   - Use animation-delay for sequencing; `forwards` fill so things stay put.
   - Elements that must be hidden before they appear: set opacity:0 in the base rule, animate to 1.
3. Render: `cd SCRATCH/motion && node render.mjs <id> <seconds>` (seconds = the animated part, 6–12;
   leave ~1.5 s still at the end). Output: `<id>/clip.mp4` (the animation, then holds the final frame for
   3 minutes — the clip plays once and then stays still while the voice continues), `<id>/still.png`
   (last frame), `<id>/mid.png` (a frame ~35% in, 960×540). ~1 s of render per 30 frames.
4. LOOK at still.png and mid.png with the Read tool. Fix anything overlapping, clipped, cut off or ugly,
   and re-render. Do not report a slide you have not looked at.

## Hard rules (Dan's, permanent)

- **The final frame must be the slide as published**: same text, same wording, same layout, same images.
  You may ADD a motion element that explains (a dial, a stamp, a moving counter, an arrow) as long as the
  final frame still reads cleanly; prefer motion elements that are gone or settled by the end. Never add
  new claims, numbers or statistics. Never change wording.
- **English glosses are never bigger or bolder than the French/Chinese they gloss** (italic grey, same or smaller).
- Text ≥ 24 px. Fonts: Patrick Hand (headings), Roboto (everything else). Geist and Work Sans are BANNED.
- Palette already in the slides: ink #1f2430, paper #fbfaf4, blue #006baa / #1ca6ff, teal #00c197 / #00715a,
  yellow #fcdf00, orange #ff9037 / #9f5100, violet #b17eff, grey #6a7179 / #9ca3af / #d7d9de.
- Calm, legible motion: fades, slides of 20–60 px, scale pops, draw-ons. Nothing spins, shakes or flashes
  (one brief camera-style flash is the most). Each beat lasts 0.4–0.8 s; the heading can be on screen at t=0.
- Timing: the whole build finishes within ~10 s. The audience must be able to read the full slide after it.
- No emoji you add yourself unless the slide already uses that emoji.

## Report back (short)

For each slide: the folder path, the seconds you rendered, and ONE plain-English sentence saying what
moves and why it makes the point. Mention anything you could not do.
