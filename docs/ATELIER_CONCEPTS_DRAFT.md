# The five remaining atelier concepts — drafted ahead of their files

**Concepts lane · 1 Sep 2026.** SIO-010 is written and merged; these are the
other five. **None of these files exists yet** — the atelier lesson files are
Peers' (STATUS line 544). This doc exists so each concept drops in the hour its
file lands rather than the day after: paste the `concept:` block in above
`memo:`, and it is done.

Every argument is built from `ATELIER_DIALOGUES` (`src/content/ateliers.ts`)
alone. **No new French anywhere in this document.** Each concept names its
lines.

## The shape, set by SIO-010

An atelier concept argues **what the model dialogue cannot show**, because a
dialogue only ever runs one version of itself. SIO-010's model runs entirely on
`tu`, so its concept argues the register — the thing that would change if the
audience did. Each of the five below is chosen the same way: the invisible
choice behind the visible script.

## Checked against the 45 for collisions before drafting

The obvious SIO-020 argument — *le Japon · des Japonais · parlent japonais*,
where the capital is the part of speech — **is already taken**, three times
over: `nationalities` ("why français has no capital"), `langues-pays` ("why the
language loses its article") and `articles-pays` ("why a country has a gender").
It is drafted below on a different claim for that reason. Also avoided:
`salutations` (bon/bonne agreement), `le-chemin` (au vs à la), `combien`
(« il y a » never changes), `qu-est-ce-que-c-est` (c'est → il est).

---

## SIO-020 · Présenter un pays

**Claim — why presenting a country takes three different openers, not one.**
The model opens three ways in six lines: « Voici le Japon » shows it, « C'est un
pays asiatique » classifies it, « Ici, il y a des Japonais » says what is there.
A learner reaches for *c'est* all three times. They are not stylistic variants,
and the article follows the job: `voici` takes the country's own article (*le*
Japon), `c'est` takes an indefinite (*un* pays), `il y a` takes *des*.

```tsx
  concept: {
    subtitle: "Why presenting a country takes three openers, not one",
    contrast: (
      <>
        English presents almost anything with the same handful of words &mdash;{" "}
        <i>this is</i>, <i>it&rsquo;s</i>, <i>there are</i>{" "}
        &mdash; and they trade places
        freely. This model uses three in its first three lines and never swaps them.
      </>
    ),
    question: (
      <>
        <i lang="fr">Voici le Japon</i>, <i lang="fr">C&rsquo;est un pays asiatique</i>,{" "}
        <i lang="fr">Ici, il y a des Japonais</i>. All three introduce. Why not{" "}
        <i lang="fr">c&rsquo;est</i> for all of them?
      </>
    ),
    answer: (
      <>
        Because they do three different jobs. <i lang="fr">Voici</i> <b>points</b>{" "}
        &mdash;
        you are showing the thing itself, so it keeps its own article:{" "}
        <i lang="fr">le Japon</i>. <i lang="fr">C&rsquo;est</i> <b>classifies</b>{" "}
        &mdash;
        it puts the thing in a category, so the category is indefinite:{" "}
        <i lang="fr">un pays</i>. <i lang="fr">Il y a</i> <b>inventories</b>{" "}
        &mdash; it
        says what is present, so what it counts is plural and indefinite:{" "}
        <i lang="fr">des Japonais</i>. The article is not decoration on the opener; it
        is the opener&rsquo;s job showing through.
      </>
    ),
    pitfallHeads: ["what one opener for everything gives", "what the job asks for"],
    pitfall: [
      {
        label: <>showing the country</>,
        wrong: <i lang="fr">C&rsquo;est le Japon</i>,
        right: (
          <>
            <i lang="fr">Voici le Japon</i>{" "}
            &mdash; you are pointing at it, not sorting it
          </>
        ),
      },
      {
        label: <>saying what kind</>,
        wrong: <i lang="fr">Voici un pays asiatique</i>,
        right: (
          <>
            <i lang="fr">C&rsquo;est un pays asiatique</i>{" "}
            &mdash; a category, so indefinite
          </>
        ),
      },
      {
        label: <>saying who is there</>,
        wrong: <i lang="fr">C&rsquo;est des Japonais</i>,
        right: (
          <>
            <i lang="fr">Ici, il y a des Japonais</i>{" "}
            &mdash; presence is <i lang="fr">il y a</i>, always
          </>
        ),
      },
    ],
    flow: [
      { depth: 0, text: "Are you showing the thing itself? — Voici + its own article." },
      { depth: 0, text: "Are you saying what KIND it is? — C'est + un / une." },
      { depth: 0, text: "Are you saying what is THERE? — Il y a + des." },
    ],
    check: [
      {
        q: (
          <>
            You put the flag on screen and name it. <i lang="fr">Voici</i> or{" "}
            <i lang="fr">c&rsquo;est</i>?
          </>
        ),
        a: (
          <>
            <i lang="fr">Voici</i>{" "}
        &mdash; you are showing it. Use{" "}
            <i lang="fr">c&rsquo;est</i> for the next sentence, where you say what kind of
            flag it is.
          </>
        ),
      },
      {
        q: <>Why <i lang="fr">un pays</i> but <i lang="fr">le Japon</i>?</>,
        a: (
          <>
            Because <i lang="fr">c&rsquo;est</i> sorts the country into a category, and a
            category is one of many. <i lang="fr">Voici</i> shows the country itself, and
            there is only one Japan.
          </>
        ),
      },
    ],
    inShort: "Voici points · c'est classifies · il y a inventories",
    remember: (
      <>
        <b>The opener decides the article, not the noun.</b> Choose the job first &mdash;
        showing, sorting, or listing &mdash; and the article follows on its own.
      </>
    ),
  },
```

---

## SIO-030 · Un petit e-mail

**Claim — why a French wish names the occasion instead of describing a feeling.**
Four wishes in nine lines: *bon anniversaire*, *bonne chance*, *bon voyage*,
*bonne journée*. English wishes stretch across events (*good luck*, *all the
best*, *have a good one*); French binds each to the noun of its occasion, so you
can only wish what you have a noun for.

**Deliberately NOT the agreement.** `salutations` (SIO-009) already argues why
it is *bonjour* but *bonne nuit*. This one is about which noun you reach for at
all; the agreement then follows from that stop's rule.

```tsx
  concept: {
    subtitle: "Why a French wish names the occasion",
    contrast: (
      <>
        English wishes describe a feeling and stretch to fit &mdash; <i>good luck</i>{" "}
        covers an exam, a journey and a job interview alike. French wishes name{" "}
        <b>the occasion itself</b>, so a wish only exists where there is a noun for
        what is happening.
      </>
    ),
    question: (
      <>
        This message wishes four things &mdash; <i lang="fr">bon anniversaire</i>,{" "}
        <i lang="fr">bonne chance</i>, <i lang="fr">bon voyage</i>,{" "}
        <i lang="fr">bonne journée</i>. Why can none of them be swapped for another?
      </>
    ),
    answer: (
      <>
        Because the second word <b>is</b> the occasion. <i lang="fr">chance</i> is the
        luck an exam needs, <i lang="fr">voyage</i> is the trip to Paris,{" "}
        <i lang="fr">anniversaire</i> is Saturday itself. Wishing{" "}
        <i lang="fr">bonne chance</i> for the trip does not sound odd &mdash; it wishes
        something else entirely. So the work is not translating the feeling; it is
        finding the noun for what the person is about to do.
      </>
    ),
    pitfallHeads: ["translating the feeling", "naming the occasion"],
    pitfall: [
      {
        label: <>before a trip</>,
        wrong: <i lang="fr">bonne chance pour ton voyage</i>,
        right: (
          <>
            <i lang="fr">bon voyage</i>{" "}
            &mdash; the trip has its own noun, so use it
          </>
        ),
      },
      {
        label: <>before an exam</>,
        wrong: <i lang="fr">bon examen</i>,
        right: (
          <>
            <i lang="fr">bonne chance pour ton examen</i>{" "}
            &mdash; you wish the luck, not the exam
          </>
        ),
      },
      {
        label: <>closing the message</>,
        wrong: <i lang="fr">bonne chance</i>,
        right: (
          <>
            <i lang="fr">bonne journée et à bientôt</i>{" "}
            &mdash; the day, plus when you next meet
          </>
        ),
      },
    ],
    flow: [
      { depth: 0, text: "What is the person about to do?" },
      { depth: 1, text: "Find the noun for it — anniversaire, voyage, journée." },
      { depth: 1, text: "No noun for the event? Wish the luck instead — bonne chance pour…" },
      { depth: 0, text: "Then bon or bonne, by that noun's gender (stop 9)." },
    ],
    check: [
      {
        q: (
          <>
            A friend is about to sit an exam. Why not <i lang="fr">bon examen</i>?
          </>
        ),
        a: (
          <>
            Because you are not wishing them a good exam &mdash; you are wishing them the
            luck to get through it: <i lang="fr">bonne chance pour ton examen</i>.
          </>
        ),
      },
      {
        q: <>Why does the message close on <i lang="fr">bonne journée</i>?</>,
        a: (
          <>
            Because the occasion at the end of a message is simply the rest of the
            person&rsquo;s day. Then <i lang="fr">à bientôt</i> says when you next meet.
          </>
        ),
      },
    ],
    inShort: "Find the noun for the occasion; the wish is then decided.",
    remember: (
      <>
        <b>You cannot wish what you have no noun for.</b> Name the occasion and the
        wish writes itself.
      </>
    ),
  },
```

---

## SIO-040 · L'itinéraire

**Claim — why the last step of an itinerary is not a move.**
Four steps carry verbs of motion — *tu prends*, *tu vas*, *tu tournes*. The
fifth carries « est »: « Enfin, la gare est en face du parc. » The route does
not end when you stop walking; it ends when you can **recognise** you have
arrived. A learner who gives four moves and stops has given directions nobody
can complete.

```tsx
  concept: {
    subtitle: "Why the last step of an itinerary is not a move",
    contrast: (
      <>
        A route in English usually ends on its last instruction &mdash;{" "}
        <i>turn left and you&rsquo;re there</i>. This one does not. Its four moves are
        followed by a sentence that tells you to move nowhere at all.
      </>
    ),
    question: (
      <>
        <i lang="fr">tu prends</i>, <i lang="fr">tu vas</i>,{" "}
        <i lang="fr">tu tournes</i>{" "}
        &mdash; then{" "}
        <i lang="fr">la gare est en face du parc</i>. Why does the itinerary end on{" "}
        <i lang="fr">est</i>?
      </>
    ),
    answer: (
      <>
        Because the person following you does not need a fifth move &mdash; they need to
        know they have arrived. <i lang="fr">D&rsquo;abord</i>,{" "}
        <i lang="fr">ensuite</i> and <i lang="fr">puis</i> carry motion;{" "}
        <i lang="fr">enfin</i> carries a <b>landmark</b>. That is what{" "}
        <i lang="fr">enfin</i> means here: not the last thing you do, but the point at
        which you stop doing things.
      </>
    ),
    pitfallHeads: ["a route that is only moves", "a route someone can finish"],
    pitfall: [
      {
        label: <>the ending</>,
        wrong: <i lang="fr">Enfin, tu tournes à gauche.</i>,
        right: (
          <>
            <i lang="fr">Enfin, la gare est en face du parc.</i>{" "}
            &mdash; how they will know
          </>
        ),
      },
      {
        label: <><i lang="fr">enfin</i> mid-route</>,
        wrong: <i lang="fr">Enfin, tu vas tout droit.</i>,
        right: (
          <>
            <i lang="fr">Ensuite, tu vas tout droit.</i>{" "}
            &mdash; <i lang="fr">enfin</i> is spent once, at the arrival
          </>
        ),
      },
      {
        label: <>no landmark at all</>,
        wrong: <>four moves, then nothing</>,
        right: (
          <>
            <i lang="fr">en face du parc</i>{" "}
            &mdash; a route with no end is a route nobody completes
          </>
        ),
      },
    ],
    flow: [
      { depth: 0, text: "Open with where you are going — Pour aller à la gare…" },
      { depth: 0, text: "Then the moves, in order: D'abord · Ensuite · Puis." },
      { depth: 1, text: "Each one a verb of motion — tu prends, tu vas, tu tournes." },
      { depth: 0, text: "Close with Enfin + where the place IS, not another turn." },
      { depth: 1, text: "Enfin, la gare est en face du parc." },
    ],
    check: [
      {
        q: (
          <>
            Why is <i lang="fr">Enfin, tu tournes à gauche</i> a poor last line?
          </>
        ),
        a: (
          <>
            Because it leaves the person walking with nothing to look for.{" "}
            <i lang="fr">Enfin</i> is where you hand them the landmark.
          </>
        ),
      },
      {
        q: (
          <>
            The model adds <i lang="fr">Tu peux aussi prendre le bus numéro cinq.</i>{" "}
            after the landmark. Why is that not a sixth step?
          </>
        ),
        a: (
          <>
            Because it is an alternative to the whole route, not a continuation of it.
            The itinerary was already finished by the landmark.
          </>
        ),
      },
    ],
    inShort: "D'abord · Ensuite · Puis move. Enfin arrives.",
    remember: (
      <>
        <b>End on where the place is, not on what to do next.</b> A route finishes when
        the person can recognise it, not when you run out of turns.
      </>
    ),
  },
```

---

## SIO-049 · Avis de restaurant

**Claim — why the negative sentence is the compliment and the hedged one is the
complaint.** « Ce n'est pas cher » is praise. The only real reservation,
« Parfois, le service est un peu lent », carries no negative at all — it is
wrapped three times instead: *parfois* (not always), *un peu* (not very), and a
closing *mais* that overrules it.

```tsx
  concept: {
    subtitle: "Why the negative sentence is the compliment",
    contrast: (
      <>
        In English a negative in a review reads as a complaint &mdash;{" "}
        <i>it isn&rsquo;t fast</i>, <i>it wasn&rsquo;t good</i>. This review&rsquo;s one
        negative sentence is its warmest praise, and its actual complaint contains no
        negative at all.
      </>
    ),
    question: (
      <>
        <i lang="fr">Ce n&rsquo;est pas cher</i> against{" "}
        <i lang="fr">Parfois, le service est un peu lent</i>. Which of those two is the
        criticism?
      </>
    ),
    answer: (
      <>
        The second. <i lang="fr">Ce n&rsquo;est pas cher</i> denies a fault, which is a
        compliment: cheapness is good news. The complaint is the sentence with no{" "}
        <i lang="fr">ne… pas</i> in it, and it arrives wrapped three times &mdash;{" "}
        <i lang="fr">parfois</i> says not always, <i lang="fr">un peu</i> says not very,
        and <i lang="fr">mais je recommande ce restaurant</i> then overrules it
        outright. A French review does not soften by hedging the grammar; it hedges the
        <b> frequency</b>, the <b>degree</b>, and the <b>verdict</b>.
      </>
    ),
    pitfallHeads: ["reading the grammar", "reading the review"],
    pitfall: [
      {
        label: <>the negative</>,
        wrong: <><i lang="fr">Ce n&rsquo;est pas cher</i> = a complaint</>,
        right: <>praise &mdash; a fault denied</>,
      },
      {
        label: <>the complaint</>,
        wrong: <i lang="fr">Le service est lent.</i>,
        right: (
          <>
            <i lang="fr">Parfois, le service est un peu lent.</i>{" "}
            &mdash; how often, and how much
          </>
        ),
      },
      {
        label: <>the ending</>,
        wrong: <>closing on the complaint</>,
        right: (
          <>
            <i lang="fr">Mais je recommande ce restaurant !</i>{" "}
            &mdash; the verdict is the last line
          </>
        ),
      },
    ],
    flow: [
      { depth: 0, text: "Say what you like, plainly — J'aime beaucoup ce restaurant." },
      { depth: 0, text: "Give the evidence, negatives included: Ce n'est pas cher." },
      { depth: 0, text: "One reservation, wrapped: parfois + un peu." },
      { depth: 0, text: "Then the verdict, with mais — and the verdict wins." },
    ],
    check: [
      {
        q: (
          <>
            Is <i lang="fr">Ce n&rsquo;est pas cher</i> a good thing or a bad thing?
          </>
        ),
        a: (
          <>
            Good. It denies a fault. The negative marks what the place is{" "}
            <em>not</em> guilty of.
          </>
        ),
      },
      {
        q: (
          <>
            You want to say the service is slow without withdrawing the
            recommendation. What do you add?
          </>
        ),
        a: (
          <>
            <i lang="fr">Parfois</i> and <i lang="fr">un peu</i>{" "}
        &mdash; then close on{" "}
            <i lang="fr">mais je recommande</i>, so the verdict is the last thing read.
          </>
        ),
      },
    ],
    inShort: "The negative praises. The hedges criticise. The last line decides.",
    remember: (
      <>
        <b>A complaint is softened by frequency and degree, not by grammar.</b>{" "}
        <i lang="fr">Parfois</i>, <i lang="fr">un peu</i>, and then{" "}
        <i lang="fr">mais</i>.
      </>
    ),
  },
```

---

## SIO-050 · Au restaurant

**Claim — why asking and accepting are two different phrases, not two forms of
one verb.** The dialogue holds both: « Je voudrais un café » asks;
« Oui, je veux bien » accepts. This is the stop where Dan's Tier 3 distinction
is visible in one exchange — « je voudrais » is **transparent** (*vouloir*,
softened), « je veux bien » is **opaque** (it means *yes please*, and is not
*je veux* with a word added).

```tsx
  concept: {
    subtitle: "Why je veux bien is not je veux plus a word",
    contrast: (
      <>
        English uses one verb across the whole counter &mdash; <i>I&rsquo;d like</i> to
        order, <i>yes please</i> to accept, and the second is not a form of the first.
        French does the same, and the two look far more alike than they are.
      </>
    ),
    question: (
      <>
        <i lang="fr">Je voudrais un café</i>, then{" "}
        <i lang="fr">Oui, je veux bien</i>. Both are <i lang="fr">vouloir</i>. Why can
        you not use either one for both turns?
      </>
    ),
    answer: (
      <>
        Because only one of them is a want. <i lang="fr">Je voudrais</i> takes{" "}
        <i lang="fr">vouloir</i> apart and softens it &mdash; it asks for something not
        yet offered, so it needs what you are asking for after it:{" "}
        <i lang="fr">un café</i>. <i lang="fr">Je veux bien</i> comes apart into
        nothing: it does not mean <i>I want well</i>, it means <b>yes please</b>, and it
        answers an offer already made. That is why it is followed by no order at all.
      </>
    ),
    pitfallHeads: ["taking the phrase apart", "what the phrase does"],
    pitfall: [
      {
        label: <>ordering</>,
        wrong: <i lang="fr">Je veux un café.</i>,
        right: (
          <>
            <i lang="fr">Je voudrais un café, s&rsquo;il vous plaît.</i>{" "}
            &mdash; you are asking, not stating
          </>
        ),
      },
      {
        label: <>accepting an offer</>,
        wrong: <i lang="fr">Je voudrais bien.</i>,
        right: (
          <>
            <i lang="fr">Oui, je veux bien.</i>{" "}
            &mdash; the block that means <i>yes please</i>
          </>
        ),
      },
      {
        label: <>accepting, then ordering anyway</>,
        wrong: <i lang="fr">Je veux bien de l&rsquo;eau.</i>,
        right: (
          <>
            <i lang="fr">Oui, je veux bien.</i>{" "}
            &mdash; the offer already named the thing
          </>
        ),
      },
    ],
    flow: [
      { depth: 0, text: "Has the thing been offered to you yet?" },
      { depth: 1, text: "No — ask for it: Je voudrais + what you want, s'il vous plaît." },
      { depth: 1, text: "Yes — accept it whole: Oui, je veux bien." },
      { depth: 0, text: "The server's side is the mirror: Vous désirez ? then Vous voulez… ?" },
    ],
    check: [
      {
        q: (
          <>
            <i lang="fr">Vous voulez de l&rsquo;eau ?</i>{" "}
        &mdash; you do. What do you say?
          </>
        ),
        a: (
          <>
            <i lang="fr">Oui, je veux bien.</i> Nothing after it: the offer already
            named the water.
          </>
        ),
      },
      {
        q: (
          <>
            Why is <i lang="fr">je veux bien</i> not simply a polite{" "}
            <i lang="fr">je veux</i>?
          </>
        ),
        a: (
          <>
            Because it is not a want at all &mdash; it is an acceptance. You cannot open
            with it, only answer with it.
          </>
        ),
      },
    ],
    inShort: "Je voudrais asks. Je veux bien accepts.",
    remember: (
      <>
        <b>Ask with <i lang="fr">je voudrais</i> + the thing. Accept with{" "}
        <i lang="fr">je veux bien</i> + nothing.</b> The second is a block, not a
        conjugation.
      </>
    ),
  },
```

---

## Before any of these ships

1. **Dan reads the claim.** Every pedagogical claim is read before it ships; the
   one-line claim under each heading is the thing to read.
2. **Paste, then drive the page.** `tsc` and the verify suite cannot see a
   jammed dash — `</i> &mdash;` loses its space in some layouts and keeps it in
   others. Every `&mdash;` above is already written with an explicit `{" "}`
   before it for that reason. Run `node scripts/sweep-concept-jams.mjs` against
   a dev server afterwards regardless.
3. **`verify75` will need the same inversion each time.** It asserts an atelier
   lesson leaves `concept` absent while the field is owed; once written, absence
   would mean a merge dropped it. SIO-010's hunk is the model, and it is flagged
   cross-lane in place.
