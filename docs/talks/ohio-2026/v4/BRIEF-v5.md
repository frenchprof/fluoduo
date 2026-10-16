# v5 slides: what is new (read BRIEF.md first; every rule in it still holds)

Dan recorded the whole talk himself (his clone, his voice). The slides are now `v4/slides/nXX.html`, timed by
`v4/timing/nXX.json` (sentence k = `sent[k-1]`, word times taken from his recording, so cue on words as usual).
The text of each section is in `data/script-v5-as-recorded.txt` — that is what the voice says.

Changes from BRIEF.md:
- **Terminology: "functional goals", never "communicative goals"** (yellow). Linguistic goals stay blue, the task /
  Mission stays orange. The French book's own objectives are its "communicative objectives" (« Objectifs »).
- **Never write "L'Atelier"** anywhere on a slide. Say "the French book"; showing `img/atelier-cover.png` is fine.
- `<section id="nXX">`, render with `cd v4/lib && node render.mjs nXX`.
- The part label at bottom left: `<p class="part">` with the section's title (e.g. "Where the goals come from").
- Keep x > 1540 and y > 700 empty (Dan's circle). n01 only: the circle sits at x 1652–1892, y 420–660 instead.
- Old v4 slides (`v4/slides/s*.html`) hold reusable pieces: copy markup freely, but re-cue everything to the new timing.
- Checked facts you may also use (beyond BRIEF.md's list):
  - French book contents (sources/Atelier-A1-contents.pdf): Bienvenue + Units 1–4 have 3 « Objectifs » each = 15.
    Unit 2 « On fait quoi ce week-end ? »: « Identifier des objets » · « Parler de ses goûts » · « Sortir »; Mission « Identifier la sortie du week-end ».
    Unit 3 « On va où cet été ? »: « Parler de la météo » · « S'informer sur une ville » · « Demander et indiquer son chemin »;
    its Lexique includes « Les lieux de la ville », « Les prépositions de lieu »; Grammaire « Les questions (2) : est-ce que… ? qu'est-ce que… ? »;
    ateliers « Exprimer un besoin, une envie » · « Écrire une e-carte postale »; Mission « Voyager ensemble ».
    Unit 4 « On mange quoi cette semaine ? »: « Parler de ses habitudes alimentaires » · « Faire ses courses » · « Faire des projets »;
    ateliers « Commander au restaurant » · « Donner son appréciation sur un restaurant »; Mission « Planifier des menus ».
    Bienvenue: « Se présenter » · « Saluer, prendre congé » · « Communiquer en classe ».
  - NPCR Book 1 contents (sources/NPCR-1-contents.pdf): Lesson 5 « 餐厅在哪儿 » "Where is the dining hall?",
    grammar "Questions with an interrogative pronoun". The question word takes the place of the answer, word order unchanged:
    那是谁？← 那是我们老师。 · 餐厅在哪儿？← 在二层。 (二层 = second floor). 14 lessons; 6 and 14 are reviews. Lesson 13: the particle 了.
  - First FluOLinGo map: 50 numbered stops. 28 = negation (linguistic), 29 = inviting someone and turning down an invitation
    (functional), 30 = writing an email to arrange an outing (a task). Revised plan: ~60 linguistic goals, ~36 functional goals,
    one task per unit (the Mission).
- Sections run 30–120 s. Change scene (fade a group out, the next in) whenever the narration moves on; never let a slide
  sit still for more than ~15 s without something new appearing or being highlighted.
