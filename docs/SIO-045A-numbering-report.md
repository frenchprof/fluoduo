# The stop numbered 45.5

**FluOLinGo · findings and recommendation** — SIO-045A, and why two surfaces
disagree about what to call it.

Prepared for **Dr Daniel Chan** · 3 September 2026 · Concepts lane (Color review).
*Every claim below was checked in a running browser, not inferred from the source.*

> Converted from `SIO-045A-numbering-report.docx` (3 Sep, fluoduo-main) so the
> repo carries text instead of a 317 KB binary. The two figures — screenshots of
> the postcard reading 45.5 and the 2D map reading 45, taken at commit aa3e417 —
> did not survive the conversion; their italic captions below stand in for them,
> and the report's own evidence note describes how they were taken.

## **In one paragraph**

The recorded syllabus has 50 stops, but they are not numbered 1 to 50. There is **no SIO-045**. In its place sits **SIO-045A**, stored with the numeric value 45.5 so that it sorts between 44 and 46. That value was meant to be a sorting device. It is not staying hidden: **the Home page prints it on the map postcard**, so a learner sees a stop labelled “45.5”. The full-screen 2D map, which numbers stops by position instead, calls the same stop “45”. Same stop, two numbers, depending on where you look.

| **Recommendation** Label every surface by position (i + 1), so the stop reads **45** everywhere, and leave the stored 45.5 to do its ordering job unseen. This is a display change only. No id, route, progress key or stored answer is touched, and the syllabus itself is unchanged — which is why it is safe to do without re-issuing anything to students. |
|---|

## **The finding**

### **1 · What is actually recorded**

In src/content/sios/sios.json there are 50 entries. Sorted by their num field they run:

001 … 044   →   045A (num 45.5)   →   046 … 050

SIO-045A is “Numbers 70–99”, in Unit 4. It is a real stop with a real can-do statement; the only unusual thing about it is its number.

### **2 · The two surfaces disagree**

Two components draw the stop circles, and they derive the label differently.

| **Surface** | **How it labels a stop** | **That stop reads** |
|---|---|---|
| Home — map postcard | the stored num | **45.5** |
| Map — 2D grid | position in the list (i + 1) | **45** |

*Home, map postcard — the circle between 44 and 46 reads 45.5.*

*The full-screen 2D map — the same stop reads 45.*

### **3 · How far it reaches**

Six places print the stored num directly. Two were confirmed on screen; the rest are code paths that will show the same value under the right conditions and are listed here so nothing is missed.

| **Where** | **Prints** | **Status** |
|---|---|---|
| HomeMap — the postcard | stored num | **confirmed on screen** |
| Map2DGrid — the 2D map | position (i + 1) | confirmed correct |
| HomeMap3D — the 3D scene | stored num | in the DOM; off-camera when checked |
| HomePrintSheet — the A4 sheet | stored num | not yet driven |
| DrillShell — the step label | stored num | not yet driven |
| Teacher — Students / Class now | stored num | not yet driven |

The A4 print sheet is the one worth noting: it is the artefact most likely to reach a student on paper, and it takes the stored value.

### **4 · Why it went unnoticed**

- The 2D map is the view most people open, and it happens to be the one that hides the fraction.
- On Home the postcard shows only the current unit; 45.5 is in Unit 4, so it appears only after scrolling.
- Nothing asserts that the two views agree, so no check could fail.
## **Recommendation**

### **Option A — label by position everywhere  (recommended)**

Change the surfaces that print num to print the stop's position instead, as the 2D map already does. Every surface then says **45**.

|  |  |
|---|---|
| **For** | 45.5 was never meant to be read. It is a sorting key that leaked into the interface. Positional numbering also survives any future insertion without inventing another fraction. |
| **Against** | The visible number stops matching the id: a stop labelled 45 has the id SIO-045A. That mismatch already exists for every other stop only by coincidence. |
| **Cost** | Small — the label expression in the components listed above, plus a check asserting no rendered stop label contains a decimal point. |

### **Option B — show 45A everywhere**

Treat it as a named stop rather than a fraction, and print **45A** wherever the number appears — including on the 2D map, which currently says 45.

|  |  |
|---|---|
| **For** | The label then matches the id exactly, and it is honest about the stop being an insertion rather than an original. |
| **Against** | It makes the irregularity visible to every learner on every surface, where today it is visible on one. It also changes the 2D map, which is currently correct and unremarkable. |
| **Cost** | Similar, plus a decision about how the number is spoken and printed in course materials outside the app. |

| **Why A rather than B** The question is what the number on a circle is *for*. It tells a learner where they are in a sequence of fifty — it is a position, not an identifier. The identifier is the id, and learners never see it. Option A makes the number do the job it is doing anyway; Option B promotes a filing detail into the learner's view. If the numbering is ever meant to be citable — in a handout, a syllabus, an email to a student — that argues for B, and the decision is yours rather than mine. |
|---|

## **What was not done**

Nothing has been changed. This is a report on a discrepancy found while answering a question about the recorded list, and either option touches surfaces belonging to other lanes, so the ruling is wanted before the edit.

Evidence: figures are screenshots of the running app at commit aa3e4179 with the auth wall open. The label on each surface was established by locating the element, scrolling it into view and testing its rendered visibility — presence in the DOM alone was not treated as proof, because both map components mount at once and only one is shown.
