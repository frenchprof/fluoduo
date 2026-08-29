"use client";

/**
 * Mémo waves 1+2 (Dan, 2026-07-05) — every deck's Lesson opens with a Mémo card.
 * Same card markup style as the native lessons' memos (quand.tsx): rounded-2xl
 * card on --cahier-rule, cahier-display heading, bold pattern lines with
 * glosses, pill rows, one ⚠ line max. Litmus rule: pattern + examples only.
 * All examples are REAL items from the deck JSONs — never invented words.
 */
import type { ReactNode } from "react";
import { speak } from "@/games/letris/speech";
import { ATELIER_DIALOGUES, type DialogueLine } from "@/content/ateliers";

/** `title` is nullable because splitMemo drops it on continuation cards — a
 *  Mémo announces itself once, not on every slice. Render no <h2> at all
 *  then, or the heading's margin leaves a gap where a title used to be. */
function Card({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      {title != null && (
        <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">{title}</h2>
      )}
      {children}
    </div>
  );
}

// Pretest-style pill: tap to hear it (Dan, 2026-07-08 — "relevant phrases in
// pill shaped text boxes that can be tapped to hear TTS, just like in pretest").
// `say` overrides the spoken text: a fragment shown alone but meant inside a
// sentence (« beau », « près de ») is heard in that sentence (Dan, 2026-07-08).
function Pill({ children, say }: { children: ReactNode; say?: string }) {
  return (
    <button
      type="button"
      lang="fr"
      onClick={(e) => speak(say ?? e.currentTarget.textContent ?? "", "fr-FR")}
      className="rounded-full border-2 border-[color:var(--cahier-rule)] bg-white px-2.5 py-0.5 transition hover:border-[color:var(--cahier-gold)] hover:bg-[#fffdf3] active:scale-95"
      title="🔊"
    >
      {children}
    </button>
  );
}

type PillItem = string | { t: string; say: string };

function PillRow({ label, items }: { label?: ReactNode; items: PillItem[] }) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] font-bold text-[color:var(--cahier-ink)]">
      {label != null && <span className="mr-0.5">{label}</span>}
      {items.map((s) =>
        typeof s === "string" ? <Pill key={s}>{s}</Pill> : <Pill key={s.t} say={s.say}>{s.t}</Pill>,
      )}
    </p>
  );
}

function Warn({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[14px] font-bold text-[color:var(--cahier-ink)]">⚠ {children}</p>;
}

const B = ({ children }: { children: ReactNode }) => (
  <b lang="fr" className="text-[color:var(--gram-neutral)]">{children}</b>
);

const Lines = ({ children }: { children: ReactNode }) => (
  <ul className="mt-2 space-y-1 text-[15px] text-[color:var(--cahier-ink)]">{children}</ul>
);

/**
 * THE ATELIER MÉMO — the model, before you are asked to produce it.
 *
 * The six production stops (SIO-010, 020, 030, 040, 049, 050) had no Mémo at
 * all: a learner opened « Première rencontre » and landed on CHOOSE THE FRENCH
 * with nothing to have read first. Every other stop opens on something to
 * learn from; these opened on a test.
 *
 * What they need is not a grammar table — nothing here is new grammar, it is
 * all assembled from what the unit has already covered. What they need is the
 * MODEL, which has existed in ateliers.ts all along and was only ever used to
 * cut up into flip-cards. Dan, 2026-07-02, said as much when the ateliers were
 * designed: "they should look like the mini-dialogue in 010, then an option
 * either to play all integrally at once or to play only selected lines."
 *
 * So: the dialogue, whole, every line tappable to hear, plus one button that
 * plays it through. Two speakers are marked A/B and coloured apart, because a
 * role-play you are about to perform needs to show whose turn is whose; a
 * monologue (the e-mail, the country) has one speaker and no marks — a label
 * that says nothing is exactly the text the litmus rule removes.
 */
function AtelierMemo({ sioId }: { sioId: string }) {
  const lines: DialogueLine[] = ATELIER_DIALOGUES[sioId] ?? [];
  const twoVoices = lines.some((l) => l.who === "B");
  const playAll = () => {
    // Sequential, not all at once: the browser queues utterances, so pushing
    // them in order is enough and keeps each line's own `say` override.
    for (const l of lines) speak(l.say ?? l.fr, "fr-FR");
  };
  return (
    <ul className="space-y-1.5">
      {lines.map((l, i) => (
        <li key={i} className="flex gap-2">
          {twoVoices && (
            <span
              aria-hidden
              className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-black"
              style={
                l.who === "A"
                  ? { background: "var(--cahier-hl)", color: "var(--cahier-ink)" }
                  : { background: "var(--cahier-ink)", color: "#fff" }
              }
            >
              {l.who}
            </span>
          )}
          <span className="min-w-0">
            <button
              type="button"
              lang="fr"
              onClick={() => speak(l.say ?? l.fr, "fr-FR")}
              className="text-left text-[15px] font-bold text-[color:var(--cahier-ink)] underline decoration-dotted underline-offset-4 transition hover:decoration-solid active:scale-[0.99]"
              title="🔊"
            >
              {l.fr}
            </button>
            <span className="block text-[13px] text-[color:var(--cahier-ink-soft)]">{l.en}</span>
          </span>
        </li>
      ))}
      <li className="pt-1">
        <button
          type="button"
          onClick={playAll}
          className="cahier-btn cahier-btn-sm cahier-btn-accent font-black"
        >
          🔊 Tout écouter
        </button>
      </li>
    </ul>
  );
}

export const DECK_MEMOS: Record<string, ReactNode> = {
  /* ---------- L'alphabet ---------- */
  alphabet: (
    <Card title="L'alphabet — 7 familles de sons">
      <PillRow label={<span lang="fr">[a]</span>} items={["A", "H", "K"]} />
      <PillRow label={<span lang="fr">[e]</span>} items={["B", "C", "D", "G", "P", "T", "V", "W"]} />
      <PillRow label={<span lang="fr">[ɛ]</span>} items={["F", "L", "M", "N", "R", "S", "Z"]} />
      <PillRow label={<span lang="fr">[i]</span>} items={["I", "J", "X", "Y"]} />
      <PillRow label={<span lang="fr">[o]</span>} items={["O"]} />
      <PillRow label={<span lang="fr">[y]</span>} items={["Q", "U"]} />
      <PillRow label={<span lang="fr">[ə]</span>} items={["E"]} />
      <p className="mt-3 text-[14px] text-[color:var(--cahier-ink-soft)]">Learn 7 sounds, not 26 noises.</p>
    </Card>
  ),

  /* ---------- De quelle couleur ? ---------- */
  colors: (
    <Card title="De quelle couleur ?">
      <PillRow label="Gratuit (same as English)" items={["le bleu", "l'orange", "le violet", "le beige", "le rose"]} />
      <p className="mt-2 text-[13px] font-bold text-[color:var(--cahier-ink)]">Caché en anglais (hidden in English)</p>
      <Lines>
        <li><B>noir</B> → film noir</li>
        <li><B>vert</B> → verdant</li>
        <li><B>blanc</B> → blank</li>
        <li><B>rouge</B> → rouge</li>
        <li><B>marron</B> → maroon</li>
      </Lines>
      <p className="mt-2 text-[13px] font-bold text-[color:var(--cahier-ink)]">À apprendre (the only two to learn)</p>
      <Lines>
        <li><B>jaune</B> — yellow</li>
        <li><B>gris</B> — grey</li>
      </Lines>
    </Card>
  ),

  /* ---------- Les commerces ---------- */
  commerces: (
    <Card title="Les commerces">
      <PillRow
        label="-erie = the shop of the maker (feminine)"
        items={["la boulangerie", "la pâtisserie", "la boucherie", "l'épicerie", "la librairie"]}
      />
      <PillRow label={<span lang="fr">la famille marché</span>} items={["le marché", "le supermarché"]} />
      <PillRow label={<span lang="fr">les autres</span>} items={["le café", "la banque", "la poste", "la pharmacie"]} />
      <Warn><span lang="fr">la librairie</span> = bookshop, NOT library.</Warn>
    </Card>
  ),

  /* ---------- Au marché — qui dit quoi ? ---------- */
  "au-marche": (
    <Card title="Au marché — qui dit quoi ?">
      <Lines>
        <li lang="fr">🧑‍🌾 Bonjour, vous désirez ?</li>
        <li lang="fr">🧺 <B>Je voudrais</B> deux kilos de pommes de terre, s&rsquo;il vous plaît.</li>
        <li lang="fr">🧑‍🌾 <B>Et avec ceci ?</B></li>
        <li lang="fr">🧺 <B>C&rsquo;est tout</B>, merci ! <B>Ça fait combien ?</B></li>
        <li lang="fr">🧑‍🌾 <B>Ça fait</B> 5,89 euros. … Voici votre monnaie !</li>
      </Lines>
      <Warn><span lang="fr">Ça fait combien ?</span> = the client asking · <span lang="fr">Ça fait 5,89 €</span> = the marchand answering.</Warn>
    </Card>
  ),

  /* ---------- Tu ou vous ? ---------- */
  "tu-vous": (
    <Card title="Tu ou vous ?">
      <Lines>
        <li><B>Tu</B> <span lang="fr">parles</span> — one person you know well (friend, family, child)</li>
        <li><B>Vous</B> <span lang="fr">parlez</span> — one person, polite (stranger, teacher, shop)</li>
        <li><B>Vous</B> <span lang="fr">parlez</span> — any group, even friends</li>
      </Lines>
      <Warn>Unsure → <span lang="fr">vous</span>. Nobody is offended by polite.</Warn>
    </Card>
  ),

  /* ---------- Un, une ou des ? ---------- */
  "objets-articles": (
    <Card title="Un, une ou des ?">
      <Lines>
        <li><B>un</B> <span lang="fr">livre</span> — masculine</li>
        <li><B>une</B> <span lang="fr">table</span> — feminine</li>
        <li><B>des</B> <span lang="fr">livres</span>, <B>des</B> <span lang="fr">tables</span> — any plural</li>
      </Lines>
      <Warn>After a negative: <span lang="fr">pas <b className="text-[color:var(--gram-neutral)]">de</b> livres</span>.</Warn>
    </Card>
  ),

  /* ---------- Qui ou quoi ? Un ou une ? ---------- */
  "core-nouns": (
    <Card title="Some nouns">
      <div className="mt-2 grid grid-cols-2 gap-2 text-[15px] text-[color:var(--cahier-ink)]">
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <B>un</B> / <B>le</B> — masculine
          <p lang="fr" className="mt-1">un homme, un sport, le football</p>
        </div>
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <B>une</B> / <B>la</B> — feminine
          <p lang="fr" className="mt-1">une femme, une activité, la danse</p>
        </div>
      </div>
      <p className="mt-3 text-[15px] text-[color:var(--cahier-ink)]">
        Every French noun is one or the other, and the article is what tells you.
        You cannot hear it from the word — <span lang="fr"><i>un groupe</i></span> and{" "}
        <span lang="fr"><i>une classe</i></span> end the same way.
      </p>
      <Lines>
        <li><B>C&rsquo;est où ?</B> — <i lang="fr">C&rsquo;est un café. C&rsquo;est une région.</i></li>
        <li><B>C&rsquo;est qui ?</B> — <i lang="fr">C&rsquo;est une étudiante. C&rsquo;est un groupe.</i></li>
        <li><B>C&rsquo;est quoi ?</B> — <i lang="fr">C&rsquo;est un croissant. C&rsquo;est la danse.</i></li>
      </Lines>
      <p className="mt-3 text-[15px] text-[color:var(--cahier-ink)]">
        A general word takes <B>un</B>/<B>une</B>; the named one takes <B>le</B>/<B>la</B> —{" "}
        <i lang="fr">un sport → le football</i>, <i lang="fr">une activité → la danse</i>.
      </p>
      <Warn>
        These words are nearly English — so the only new thing to learn is the{" "}
        <B>gender</B>. Learn each noun WITH its article, never on its own.
      </Warn>
    </Card>
  ),

  /* ---------- Pourquoi ? Parce que… ---------- */
  "parce-que": (
    <Card title="Pourquoi ? Parce que…">
      <Lines>
        <li><span lang="fr">Pourquoi tu étudies le français ?</span> — <B>Parce que</B> <span lang="fr">j'aime la France.</span></li>
        <li><span lang="fr">Pourquoi… ?</span> — <B>Parce qu'</B><span lang="fr">il fait beau.</span></li>
      </Lines>
      <Warn><span lang="fr">parce que</span> + <span lang="fr">il</span> → <span lang="fr">parce qu'il</span>.</Warn>
    </Card>
  ),

  /* ---------- Négation : pas de ou pas le ? (SIO-028 rededicated,
     2026-07-05 — the old avec-qui content lives in the stress-pronouns
     memo's "after prepositions" line) ---------- */
  "negation-pas": (
    <Card title="Pas de ou pas le ?">
      <Lines>
        <li><B>ne … pas de</B> — <span lang="fr">Je fais <b className="text-[color:var(--gram-neutral)]">du</b> tennis. → Je ne fais pas <b className="text-[color:var(--gram-neutral)]">de</b> tennis.</span></li>
        <li><B>ne … pas de</B> — <span lang="fr">Il y a <b className="text-[color:var(--gram-neutral)]">du</b> café. → Il n'y a pas <b className="text-[color:var(--gram-neutral)]">de</b> café.</span></li>
        <li><span lang="fr">❤️ aimer · adorer · détester</span> keep <B>le / la / les</B> — <span lang="fr">J'aime <b className="text-[color:var(--gram-neutral)]">le</b> tennis. → Je n'aime pas <b className="text-[color:var(--gram-neutral)]">le</b> tennis.</span></li>
      </Lines>
      <Warn><span lang="fr">de</span> + vowel → <span lang="fr">d'</span> : <span lang="fr">pas d'eau</span>.</Warn>
    </Card>
  ),

  /* ---------- Envies et besoins ---------- */
  "envies-besoins": (
    <Card title="Envies et besoins">
      <Lines>
        <li><span lang="fr">J'ai</span> <B>envie de</B> <span lang="fr">dormir</span> — I feel like…</li>
        <li><span lang="fr">J'ai</span> <B>besoin d'</B><span lang="fr">un café</span> — I need…</li>
      </Lines>
      <Warn><span lang="fr">de</span> + vowel → <span lang="fr">d'</span>.</Warn>
    </Card>
  ),

  /* ---------- Comment tu y vas ? ---------- */
  transport: (
    <Card title="Comment tu y vas ?">
      <Lines>
        <li><B>en</B> + vehicle you sit inside</li>
      </Lines>
      <PillRow
        items={[
          { t: "en bus", say: "J'y vais en bus." },
          { t: "en voiture", say: "J'y vais en voiture." },
          { t: "en métro", say: "J'y vais en métro." },
          { t: "en train", say: "J'y vais en train." },
          { t: "en avion", say: "J'y vais en avion." },
        ]}
      />
      <Lines>
        <li><B>à</B> + astride / on foot</li>
      </Lines>
      <PillRow
        items={[
          { t: "à pied", say: "J'y vais à pied." },
          { t: "à vélo", say: "J'y vais à vélo." },
          { t: "à moto", say: "J'y vais à moto." },
        ]}
      />
    </Card>
  ),

  /* ---------- C'est loin ? — the 3 families of place words (Dan, 2026-07-07) */
  "loin-lesson": (
    <Card title="C'est loin ?">
      <Lines>
        <li><B>___ + (art) noun</B> — <span lang="fr">devant <B>la gare</B>, sous <B>le pont</B></span></li>
      </Lines>
      <PillRow
        items={[
          { t: "devant", say: "C'est devant la gare." },
          { t: "derrière", say: "C'est derrière la gare." },
          { t: "sur", say: "C'est sur le pont." },
          { t: "sous", say: "C'est sous le pont." },
          { t: "dans", say: "C'est dans la rue." },
          { t: "entre", say: "C'est entre le café et la gare." },
        ]}
      />
      <Lines>
        <li><B>___ + de + (art) noun</B> — <span lang="fr">près <B>de la gare</B>, à côté <B>du parc</B></span></li>
      </Lines>
      <PillRow
        items={[
          { t: "à côté de", say: "C'est à côté du parc." },
          { t: "près de", say: "C'est près de la gare." },
          { t: "loin de", say: "C'est loin de la gare." },
          { t: "en face de", say: "C'est en face de la gare." },
          { t: "à gauche de", say: "C'est à gauche de la banque." },
          { t: "à droite de", say: "C'est à droite de la banque." },
        ]}
      />
      <Lines>
        <li><B>(no noun)</B> — <span lang="fr">C'est <B>là-bas</B> !</span></li>
      </Lines>
      <PillRow
        items={[
          { t: "ici", say: "C'est ici !" },
          { t: "là", say: "C'est là." },
          { t: "là-bas", say: "C'est là-bas !" },
          { t: "partout", say: "Il y en a partout." },
        ]}
      />
      <p className="mt-3 text-[15px] text-[color:var(--cahier-ink)]">
        Distance: <B>c'est à</B> + duration — <span lang="fr">C'est <B>à dix minutes</B> à pied.</span>
      </p>
    </Card>
  ),

  /* ---------- Quel temps fait-il ? ---------- */
  "weather-letris": (
    <Card title="Quel temps fait-il ?">
      <Lines>
        <li><B>Il fait</B> + adjective</li>
      </Lines>
      <PillRow
        items={[
          { t: "beau", say: "Il fait beau." },
          { t: "chaud", say: "Il fait chaud." },
          { t: "froid", say: "Il fait froid." },
          { t: "mauvais", say: "Il fait mauvais." },
        ]}
      />
      <Lines>
        <li><B>Il y a</B> + noun</li>
      </Lines>
      <PillRow
        items={[
          { t: "du soleil", say: "Il y a du soleil." },
          { t: "du vent", say: "Il y a du vent." },
          { t: "des nuages", say: "Il y a des nuages." },
        ]}
      />
      <Lines>
        <li>verb alone — <span lang="fr">Il</span> <B>pleut</B>, <span lang="fr">il</span> <B>neige</B></li>
      </Lines>
    </Card>
  ),

  /* ---------- Quel est le chemin pour … ? ---------- */
  "directions-matching": (
    <Card title="Quel est le chemin… ?">
      <Lines>
        <li><B>Vous</B> + verb</li>
      </Lines>
      <PillRow
        items={[
          { t: "vous sortez", say: "Vous sortez de la station." },
          { t: "vous continuez", say: "Vous continuez tout droit." },
          { t: "vous tournez", say: "Vous tournez à gauche." },
          { t: "vous prenez", say: "Vous prenez la première rue à droite." },
        ]}
      />
      <p className="mt-3 text-[15px] text-[color:var(--cahier-ink)]">
        <B>d'abord</B> → <B>puis</B> → <B>ensuite</B> → <B>enfin</B>
      </p>
    </Card>
  ),

  /* ---------- Moi, toi, lui... ---------- */
  "stress-pronouns": (
    <Card title="Moi, toi, lui… — three jobs">
      <Lines>
        <li>emphasis — <B>Moi</B>, <span lang="fr">j'aime le café</span></li>
        <li>after prepositions — <span lang="fr">avec</span> <B>lui</B>, <span lang="fr">pour</span> <B>elle</B></li>
        <li>alone — <span lang="fr">Et</span> <B>toi</B> ?</li>
      </Lines>
    </Card>
  ),

  /* ---------- Quel jour on est ? ---------- */
  days: (
    <Card title="Les jours — la famille -di">
      <p lang="fr" className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] font-bold text-[color:var(--cahier-ink)]">
        <Pill>lun<B>di</B></Pill>
        <Pill>mar<B>di</B></Pill>
        <Pill>mercre<B>di</B></Pill>
        <Pill>jeu<B>di</B></Pill>
        <Pill>vendre<B>di</B></Pill>
        <Pill>same<B>di</B></Pill>
      </p>
      <Lines>
        <li><span lang="fr">dimanche</span> flips it — <B>di</B><span lang="fr">manche</span></li>
      </Lines>
      <Warn>No capitals in French: <span lang="fr">lundi</span>, not <span lang="fr">Lundi</span>.</Warn>
    </Card>
  ),

  /* ---------- 0 à 20 ---------- */
  "numbers-0-20": (
    <Card title="0 à 20">
      <PillRow
        label="0–16 — unique words"
        items={[
          "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit",
          "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
        ]}
      />
      <PillRow
        label={<span>17–19 = <B>dix</B> + …</span>}
        items={["dix-sept", "dix-huit", "dix-neuf"]}
      />
    </Card>
  ),

  /* ---------- 20 à 69 ---------- */
  "numbers-20-69": (
    <Card title="20 à 69 — cinq dizaines">
      <PillRow items={["vingt", "trente", "quarante", "cinquante", "soixante"]} />
      <Lines>
        <li>+1 → <B>et un</B> — <span lang="fr">vingt <b className="text-[color:var(--gram-neutral)]">et un</b>, trente <b className="text-[color:var(--gram-neutral)]">et un</b>, soixante <b className="text-[color:var(--gram-neutral)]">et un</b></span></li>
        <li>the rest → hyphen — <span lang="fr">vingt<B>-</B>deux, quarante<B>-</B>sept, soixante<B>-</B>neuf</span></li>
      </Lines>
    </Card>
  ),

  /* ---------- Numbers 70-99 (SIO-045A, 2026-07-20: the soixante-dix /
     quatre-vingts system — the missing bridge to real market prices) ------ */
  "numbers-70-99": (
    <Card title="70 à 99 — le système change !">
      <PillRow items={["soixante-dix", "quatre-vingts", "quatre-vingt-dix"]} />
      <Lines>
        <li>70–79 = <B>soixante + 10…19</B> — <span lang="fr">soixante-<b className="text-[color:var(--gram-neutral)]">douze</b> (72), soixante-<b className="text-[color:var(--gram-neutral)]">dix-neuf</b> (79)</span></li>
        <li>71 garde le <B>et</B> — <span lang="fr">soixante <b className="text-[color:var(--gram-neutral)]">et onze</b></span> · mais 81, 91 : <span lang="fr">quatre-vingt-un, quatre-vingt-onze</span> — <B>sans et !</B></li>
        <li>80 = 4 × 20 → <span lang="fr">quatre-vingt<b className="text-[color:var(--gram-neutral)]">s</b></span> avec un <B>-s</B>… qui <B>disparaît</B> devant un nombre : <span lang="fr">quatre-vingt-cinq (85)</span></li>
        <li>90–99 = <B>quatre-vingt + 10…19</B> — <span lang="fr">quatre-vingt-<b className="text-[color:var(--gram-neutral)]">quinze</b> (95), quatre-vingt-<b className="text-[color:var(--gram-neutral)]">dix-neuf</b> (99)</span></li>
        <li>Au marché : <span lang="fr">« Ça fait quatre-vingt-cinq euros. » (85 €)</span></li>
      </Lines>
    </Card>
  ),

  /* ---------- Salutations ---------- */
  salutations: (
    <Card title="Salutations">
      <div className="mt-2 grid grid-cols-2 gap-2 text-[14px] text-[color:var(--cahier-ink)]">
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <B>→ arriver</B>, poli
          <p lang="fr" className="mt-1">Bonjour ! Bonsoir !</p>
        </div>
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <B>→ arriver</B>, copains
          <p lang="fr" className="mt-1">Salut ! Coucou !</p>
        </div>
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <B>partir →</B>, poli
          <p lang="fr" className="mt-1">Au revoir ! Bonne journée ! À demain ! À bientôt !</p>
        </div>
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <B>partir →</B>, copains
          <p lang="fr" className="mt-1">Salut ! À plus tard ! À plus !</p>
        </div>
      </div>
    </Card>
  ),

  /* ---------- Les consignes de classe ---------- */
  consignes: (
    <Card title="La classe parle en -ez">
      <p lang="fr" className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] font-bold text-[color:var(--cahier-ink)]">
        <Pill>Écout<B>ez</B> !</Pill>
        <Pill>Regard<B>ez</B> !</Pill>
        <Pill>Répét<B>ez</B> !</Pill>
        <Pill>Lis<B>ez</B> !</Pill>
        <Pill>Écriv<B>ez</B> !</Pill>
        <Pill>Parl<B>ez</B> !</Pill>
        <Pill>Not<B>ez</B> !</Pill>
        <Pill>Compt<B>ez</B> !</Pill>
      </p>
      <p className="mt-3 text-[15px] text-[color:var(--cahier-ink)]">
        verb + <B>-ez</B> = polite command to the class
      </p>
    </Card>
  ),

  /* ---------- Quelles langues parlez-vous ? ---------- */
  languages: (
    <Card title="Quelles langues ?">
      <Lines>
        <li>language = <B>le</B> + masculine nationality, no capital</li>
        <li><B>le</B> <span lang="fr">français</span>, <B>le</B> <span lang="fr">chinois</span>, <B>l'</B><span lang="fr">anglais</span>, <B>l'</B><span lang="fr">espagnol</span></li>
      </Lines>
      <PillRow items={["français", "anglais", "chinois", "espagnol", "japonais", "russe", "coréen"]} />
      <Warn><span lang="fr">Je parle français</span> — no article after <span lang="fr">parler</span>.</Warn>
    </Card>
  ),

  /* ---------- C'est quel adjectif ? ---------- */
  nationalities: (
    <Card title="C'est quel adjectif ? — feminine endings">
      <Lines>
        <li><B>-ais → -aise</B> — <span lang="fr">français / française, portugais / portugaise</span></li>
        <li><B>-ien → -ienne</B> — <span lang="fr">indonésien / indonésienne, tunisien / tunisienne</span></li>
        <li><B>-ain → -aine</B> — <span lang="fr">américain / américaine, mexicain / mexicaine</span></li>
        <li>ends in <B>-e</B> → no change — <span lang="fr">russe, suisse, belge</span></li>
      </Lines>
    </Card>
  ),

  /* ---------- Quelle matière ? ---------- */
  matieres: (
    <Card title="Quelle matière ?">
      <PillRow
        label="Gratuit (same as English)"
        items={["la géographie", "la biologie", "l'histoire", "les mathématiques", "la musique", "le sport"]}
      />
      <p className="mt-2 text-[13px] font-bold text-[color:var(--cahier-ink)]">À apprendre (the few to learn)</p>
      <Lines>
        <li><B>le dessin</B> — art</li>
        <li><B>l'informatique</B> — computer science</li>
        <li><B>les langues</B> — languages</li>
      </Lines>
    </Card>
  ),

  /* ---------- Quel est votre lieu préféré ? ---------- */
  "lieux-letris": (
    <Card title="Les lieux — le, la ou l' ?">
      <PillRow label={<B>le</B>} items={["le parc", "le café", "le cinéma", "le musée", "le marché"]} />
      <PillRow label={<B>la</B>} items={["la gare", "la banque", "la poste", "la piscine", "la pharmacie"]} />
      <PillRow label={<span><B>l'</B> + vowel</span>} items={["l'hôtel", "l'école", "l'hôpital", "l'église", "l'université"]} />
    </Card>
  ),

  /* ---------- Les repas et les aliments ---------- */
  aliments: (
    <Card title="Les aliments — du, de la, des">
      <Lines>
        <li><B>le</B> <span lang="fr">pain</span> → <B>du</B> <span lang="fr">pain</span> — <span lang="fr">du café, du lait, du fromage</span></li>
        <li><B>la</B> <span lang="fr">salade</span> → <B>de la</B> <span lang="fr">salade</span> — <span lang="fr">de la viande</span></li>
        <li><B>l'</B><span lang="fr">eau</span> → <B>de l'</B><span lang="fr">eau</span></li>
        <li><B>les</B> <span lang="fr">pâtes</span> → <B>des</B> <span lang="fr">pâtes</span></li>
      </Lines>
      <p className="mt-3 text-[15px] text-[color:var(--cahier-ink)]">
        "some of it" = <B>du</B> / <B>de la</B> / <B>des</B>
      </p>
    </Card>
  ),

  /* ---------- Quelle profession ? ---------- */
  professions: (
    <Card title="Quelle profession ? — feminine endings">
      <Lines>
        <li><B>-ien → -ienne</B> — <span lang="fr">musicien / musicienne</span></li>
        <li><B>-eur → -euse</B> — <span lang="fr">serveur / serveuse</span></li>
        <li><B>-teur → -trice</B> — <span lang="fr">acteur / actrice</span></li>
        <li><B>+ e</B> or no change — <span lang="fr">étudiant / étudiante, journaliste</span></li>
      </Lines>
      <Warn>No article: <span lang="fr">Il est médecin. Elle est actrice.</span></Warn>
    </Card>
  ),
};

// The six ateliers get theirs from ATELIER_DIALOGUES rather than by hand, so a
// line edited in the model cannot drift out of the Mémo that teaches it — and
// a seventh atelier added later is covered without anyone remembering to.
for (const sioId of Object.keys(ATELIER_DIALOGUES)) {
  DECK_MEMOS[`atelier-${sioId.toLowerCase()}`] = (
    <Card title="Le modèle">
      <AtelierMemo sioId={sioId} />
    </Card>
  );
}


/** The Mémo card for a deck, or undefined. The ateliers have one since
 *  2026-08-28: theirs IS the model dialogue, which is what a production stop
 *  needs to read before it is asked to produce. */
export function memoForDeck(id: string): ReactNode | undefined {
  return DECK_MEMOS[id];
}
