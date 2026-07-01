# Units 1–3 Content Plan

Source of truth: `LAF1201_SIOs_Flashcards_v9.csv` (verified 2026-07-02).  
Codebase SIO IDs are the canonical reference; CSV SIO numbers **diverge** from codebase starting at SIO-012 — match by **topic**, not by number.

---

## ⚠️ Critical: SIO numbering drift

The CSV was amended after the codebase SIOs were committed.  
The CSV inserted "Subject pronouns + ÊTRE" as SIO-012, shifting all subsequent Unit 1 SIOs down by one.  
**Codebase is authoritative for IDs** — do not renumber without Dan's decision.

| Topic | Codebase ID | CSV SIO # |
|---|---|---|
| Stress pronouns | SIO-011 | SIO-011 ✅ |
| Professions | SIO-012 | SIO-013 |
| Matières | SIO-013 | SIO-014 |
| **Subject pronouns + ÊTRE** | SIO-014 | SIO-012 |
| Countries | SIO-015 | SIO-015 ✅ |
| Nationalities | SIO-016 | SIO-016 ✅ |
| Languages | SIO-017 | SIO-017 ✅ |
| Numbers 20–69 | SIO-018 | SIO-018 ✅ |
| Avoir — age & states | SIO-019 | SIO-019 ✅ |
| (Unit 2 similarly shifted for some SIOs) | | |

---

## Unit 1 Status

| SIO | Topic | Collection ID | Status | Game |
|---|---|---|---|---|
| SIO-011 | Stress pronouns | `stress-pronouns` | ✅ Built | Letris: SUJET / TONIQUE / LES DEUX |
| SIO-012 | Professions | `professions` | ✅ Built | Letris: IL EST / ELLE EST |
| SIO-013 | Matières | `matieres` | ✅ Built | Letris: LE / LA / L' / LES |
| **SIO-014** | **Subject pronouns + ÊTRE** | — | ❌ **Missing** | Letris + Flip It |
| SIO-015 | Countries | `countries-letris` | ✅ Built | Match It |
| SIO-016 | Nationalities | `nationalities` | ✅ Built | Flip It |
| SIO-017 | Languages | `languages` | ✅ Built | Match It |
| SIO-018 | Numbers 20–69 | `numbers-20-69` | ✅ Built | Flip It |
| SIO-019 | Avoir — age & states | `avoir-etats` | ✅ Built | Letris: J'AI / JE SUIS |
| SIO-020 | Mini-text: present a country | — | ✅ isProduction | In-class |

### Professions label discrepancy
CSV v9 specifies Letris baskets as **UN / UNE** (article-based).  
Built deck uses **IL EST / ELLE EST** (subject-based).  
Both test gender agreement — Dan to confirm preferred label before rebuilding.

---

## ❌ SIO-014 — Subject pronouns + ÊTRE

**CSV spec:** FC Set 1.02 · 14 cards · Letris: 1st/2nd/3rd person OR Singulier/Pluriel

### Flip It cards (14)
Front: English sentence + person label  
Back: French (m and f forms where different)

| # | English (front) | French (back) |
|---|---|---|
| 1 | I am a student (m) — 1st sg | Je suis étudiant. |
| 2 | I am a student (f) — 1st sg | Je suis étudiante. |
| 3 | You are a student (m) — 2nd sg | Tu es étudiant. |
| 4 | You are a student (f) — 2nd sg | Tu es étudiante. |
| 5 | He is a student — 3rd sg m | Il est étudiant. |
| 6 | She is a student — 3rd sg f | Elle est étudiante. |
| 7 | We are students (m/mx) — 1st pl | Nous sommes étudiants. |
| 8 | We are students (f) — 1st pl | Nous sommes étudiantes. |
| 9 | You are students — 2nd pl | Vous êtes étudiants / étudiantes. |
| 10 | They are students (m/mx) — 3rd pl | Ils sont étudiants. |
| 11 | They are students (f) — 3rd pl | Elles sont étudiantes. |
| 12 | I am (je) — verb only | suis |
| 13 | You are (tu) | es |
| 14 | He/she is (il/elle) | est |

(Extend with nous sommes / vous êtes / ils/elles sont as study cards)

### Letris — 2 baskets: SINGULIER / PLURIEL
Tiles (pronouns fall, learner sorts):

| Text | Category |
|---|---|
| JE | singulier |
| TU | singulier |
| IL | singulier |
| ELLE | singulier |
| ON | singulier |
| NOUS | pluriel |
| VOUS | pluriel |
| ILS | pluriel |
| ELLES | pluriel |

**Implementation note:** Pair this with Match It (Conveyor) — pronoun → ÊTRE conjugation:  
je → suis · tu → es · il/elle/on → est · nous → sommes · vous → êtes · ils/elles → sont

---

## Unit 2 Status

| SIO | Topic | Collection ID | Status | Game |
|---|---|---|---|---|
| SIO-021 | c'est / ce sont + un/une/des + N | `objets-articles` | ✅ Built | Letris: UN / UNE / DES |
| SIO-022 | Possessives | `possessives` | ✅ Built | Letris: MON·MA·MES / TON… / SON… |
| SIO-023 | aimer — what I like | `aimer-activites` | ✅ Built | Flip It |
| SIO-024 | faire + article contraction | `faire-activites` | ✅ Built | Letris: DU / DE LA / DE L' / DES |
| **SIO-025** | **pourquoi ? parce que** | — | ❌ **Missing** | Flip It only |
| SIO-026 | aller + article contraction | `aller-destinations` | ✅ Built | Letris: AU / À LA / À L' / AUX |
| SIO-027 | Time — when I do it | `quand-time` | ✅ Built | Letris: JOUR / FRÉQUENCE / HEURE |
| SIO-028 | avec — with whom | `avec-qui` | ✅ Built | Flip It |
| **SIO-029** | **vouloir — invite, accept, refuse, reschedule** | — | ❌ **Missing** | Letris + Flip It |
| SIO-030 | Well wishes + connectors | — | ✅ isProduction | In-class |

---

## ❌ SIO-025 — pourquoi ? parce que

**CSV spec:** FC Set 2.08 · ~6 cards · No Letris baskets

### Flip It cards (~8)
Front: English Q + A cue  
Back: French Pourquoi ? → Parce que…

| # | English (front) | French (back) |
|---|---|---|
| 1 | Why? (question word) | Pourquoi ? |
| 2 | Because (connector) | Parce que |
| 3 | Because (written register) | Car |
| 4 | In order to + verb | Pour + infinitif |
| 5 | Why do you like French? → Because it's beautiful. | Pourquoi tu aimes le français ? → Parce que c'est beau. |
| 6 | Why are you in France? → Because I work here. | Pourquoi tu es en France ? → Parce que j'y travaille. |
| 7 | Why do you study? → To learn French. | Pourquoi tu étudies ? → Pour apprendre le français. |
| 8 | Why are you late? → Because there was traffic. | Pourquoi tu es en retard ? → Parce qu'il y avait du trafic. |

**Game:** Flip It only (no Letris — these are full Q+A phrases, not sortable by category).

---

## ❌ SIO-029 — vouloir (invite, accept, refuse, reschedule)

**CSV spec:** FC Set 2.09 · ~8 cards · Letris: 4 baskets — INVITER / ACCEPTER / REFUSER / REPORTER

### Flip It cards
| # | English (front) | French (back) |
|---|---|---|
| 1 | Do you want to come to the cinema? (invite) | Tu veux venir au cinéma ? |
| 2 | Would you like to join us? (invite, formal) | Vous voulez nous rejoindre ? |
| 3 | Yes, gladly! (accept) | Je veux bien ! |
| 4 | Yes, with pleasure! (accept) | Oui, avec plaisir ! |
| 5 | Great, see you tonight! (accept) | D'accord, à ce soir ! |
| 6 | Sorry, I can't. (refuse) | Désolé(e), je ne peux pas. |
| 7 | What a shame, I'm busy. (refuse) | Dommage, je suis pris(e). |
| 8 | Can we meet on Tuesday instead? (reschedule) | On peut se voir mardi plutôt ? |
| 9 | I'm free tomorrow afternoon. (reschedule) | Je suis libre demain après-midi. |
| 10 | What about next week? (reschedule) | Et la semaine prochaine ? |

### Letris — 4 baskets: INVITER / ACCEPTER / REFUSER / REPORTER
Tiles (short phrase labels):

| Text | Category |
|---|---|
| TU VEUX VENIR ? | inviter |
| ON SE RETROUVE ? | inviter |
| VOUS VOULEZ… ? | inviter |
| JE VEUX BIEN ! | accepter |
| AVEC PLAISIR ! | accepter |
| D'ACCORD ! | accepter |
| DÉSOLÉ(E) | refuser |
| JE SUIS PRIS(E) | refuser |
| JE NE PEUX PAS | refuser |
| MARDI PLUTÔT ? | reporter |
| LA SEMAINE PROCHAINE ? | reporter |
| JE SUIS LIBRE… | reporter |

---

## Unit 3 Status

| SIO | Topic | Collection ID | Status | Game |
|---|---|---|---|---|
| SIO-031 | Weather | `weather-letris` | ✅ Built | Letris |
| SIO-032 | être/aller/venir + city/country prepositions | `en-au-aux-a` | ✅ Built | Letris: EN / AU / AUX / À |
| SIO-033 | être/aller/venir + places in town | `lieux-letris` | ✅ Built | Letris |
| SIO-034 | Locating places + article contraction | `loin-lesson` | ✅ Built | Letris |
| SIO-035 | Yes/no and open-ended questions | `question-words` | ✅ Built | Flip It |
| SIO-036 | Directions + ordinal numbers | `directions-matching` | ✅ Built | Match It |
| **SIO-037** | **pouvoir — what one can do** | — | ❌ **Missing** | Flip It only |
| SIO-038 | How to get somewhere + prendre + y | `transport` | ✅ Built | Match It |
| **SIO-039** | **Wants and needs** | — | ❌ **Missing** | Letris + Flip It |
| SIO-040 | Describe itinerary steps | — | ✅ isProduction | In-class |

---

## ❌ SIO-037 — pouvoir (what one can do)

**CSV spec:** FC Set 3.07 · ~8 cards · No Letris baskets — focus on pouvoir conjugation + infinitive

### Flip It cards
| # | English (front) | French (back) |
|---|---|---|
| 1 | Can I eat here? | Je peux manger ici ? |
| 2 | You can visit the museum. | On peut visiter le musée. |
| 3 | You can park there. | Tu peux te garer là. |
| 4 | We can go out tonight. | Nous pouvons sortir ce soir. |
| 5 | He can't come back. | Il ne peut pas rentrer. |
| 6 | You may take photos. | Vous pouvez prendre des photos. |
| 7 | They can come tomorrow. | Ils peuvent venir demain. |
| 8 | Can we visit? | Est-ce qu'on peut visiter ? |

**Game:** Flip It only (CSV says "no baskets" — production focus, not sorting).  
Consider pairing with Match It: pronoun → pouvoir conjugation.

---

## ❌ SIO-039 — Wants and needs

**CSV spec:** FC Set 3.09 · ~8 cards · Letris: 4 baskets — VOUDRAIS / AIMERAIS / BESOIN DE / VEUX

### Flip It cards
| # | English (front) | French (back) |
|---|---|---|
| 1 | I would like a coffee. | Je voudrais un café. |
| 2 | I would like to book a room. | Je voudrais réserver une chambre. |
| 3 | I'd love to visit Paris. | J'aimerais visiter Paris. |
| 4 | I'd prefer to leave later. | J'aimerais mieux partir plus tard. |
| 5 | I need a hotel. | J'ai besoin d'un hôtel. |
| 6 | I need your help. | J'ai besoin de votre aide. |
| 7 | I want to leave now! | Je veux partir maintenant ! |
| 8 | I want a return ticket. | Je veux un billet aller-retour. |

### Letris — 4 baskets: VOUDRAIS / AIMERAIS / BESOIN DE / VEUX
Tiles:

| Text | Category |
|---|---|
| UN CAFÉ | voudrais |
| UNE CHAMBRE | voudrais |
| PARTIR | voudrais |
| VISITER | aimerais |
| MIEUX ATTENDRE | aimerais |
| RESTER | aimerais |
| UN HÔTEL | besoin-de |
| DE L'AIDE | besoin-de |
| DU TEMPS | besoin-de |
| PARTIR | veux |
| UN BILLET | veux |
| RENTRER | veux |

---

## Build priority order (suggested)

1. **SIO-014** — Subject pronouns + ÊTRE (Unit 1, early; foundational grammar)
2. **SIO-029** — vouloir / social phrases (Unit 2; high communicative value)
3. **SIO-039** — Wants and needs (Unit 3; high communicative value)
4. **SIO-037** — pouvoir (Unit 3; flip-only, quick build)
5. **SIO-025** — pourquoi/parce que (Unit 2; flip-only, quick build)

---

## Other notes

- **SIO-021** (c'est / ce sont): `objets-articles` deck probably needs more items — CSV says ~10 cards with everyday objects (📱 téléphone, 📚 livres, 🎒 sac à dos, etc.). Verify current deck has these.
- **SIO-030** (Well wishes): NOT production-only — CSV shows two card types: ① well wishes (~6: Bon anniversaire! / Bon voyage! / Bonne chance!) AND ② connectors (~5: d'abord / ensuite / puis / mais / donc). These need a Flip It deck, even if the email-writing itself is in-class.
- **Numbers deck**: CSV says the deck includes a "pattern card" for the composite rule (21→61 pattern with et un). Verify `numbers-20-69` includes this.
- **transport deck**: CSV says Letris baskets should be **LE / LA / L'** (for prendre + transport article). Verify current `transport` deck has this Letris config.
