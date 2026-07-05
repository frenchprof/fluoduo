/**
 * Mémo waves 1+2 (Dan, 2026-07-05) — every deck's Lesson opens with a Mémo card.
 * Same card markup style as the native lessons' memos (quand.tsx): rounded-2xl
 * card on --cahier-rule, cahier-display heading, bold pattern lines with
 * glosses, pill rows, one ⚠ line max. Litmus rule: pattern + examples only.
 * All examples are REAL items from the deck JSONs — never invented words.
 */
import type { ReactNode } from "react";

function Card({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">{title}</h2>
      {children}
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span lang="fr" className="rounded-full border border-[color:var(--cahier-rule)] bg-white px-2.5 py-0.5">
      {children}
    </span>
  );
}

function PillRow({ label, items }: { label?: ReactNode; items: string[] }) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] font-bold text-[color:var(--cahier-ink)]">
      {label != null && <span className="mr-0.5">{label}</span>}
      {items.map((s) => (
        <Pill key={s}>{s}</Pill>
      ))}
    </p>
  );
}

function Warn({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[14px] font-bold text-[color:var(--cahier-ink)]">⚠ {children}</p>;
}

const B = ({ children }: { children: ReactNode }) => (
  <b lang="fr" className="text-[color:var(--cahier-la)]">{children}</b>
);

const Lines = ({ children }: { children: ReactNode }) => (
  <ul className="mt-2 space-y-1 text-[15px] text-[color:var(--cahier-ink)]">{children}</ul>
);

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
      <PillRow label="Gratuit (same as English)" items={["bleu", "orange", "violet", "beige", "rose"]} />
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
      <Warn>After a negative: <span lang="fr">pas <b className="text-[color:var(--cahier-la)]">de</b> livres</span>.</Warn>
    </Card>
  ),

  /* ---------- Qui ou quoi ? Un ou une ? ---------- */
  "core-nouns": (
    <Card title="Qui ou quoi ? Un ou une ?">
      <div className="mt-2 grid grid-cols-2 gap-2 text-[15px] text-[color:var(--cahier-ink)]">
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <B>QUI</B> = a person
          <p lang="fr" className="mt-1">un garçon, une fille</p>
        </div>
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <B>QUOI</B> = a thing
          <p lang="fr" className="mt-1">un livre, une table</p>
        </div>
      </div>
      <p className="mt-3 text-[15px] text-[color:var(--cahier-ink)]">
        <B>un</B> = masculine, <B>une</B> = feminine — for people AND things.
      </p>
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
        <li><B>ne … pas de</B> — <span lang="fr">Je fais <b className="text-[color:var(--cahier-la)]">du</b> tennis. → Je ne fais pas <b className="text-[color:var(--cahier-la)]">de</b> tennis.</span></li>
        <li><B>ne … pas de</B> — <span lang="fr">Il y a <b className="text-[color:var(--cahier-la)]">du</b> café. → Il n'y a pas <b className="text-[color:var(--cahier-la)]">de</b> café.</span></li>
        <li><span lang="fr">❤️ aimer · adorer · détester</span> keep <B>le / la / les</B> — <span lang="fr">J'aime <b className="text-[color:var(--cahier-la)]">le</b> tennis. → Je n'aime pas <b className="text-[color:var(--cahier-la)]">le</b> tennis.</span></li>
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
      <PillRow items={["en bus", "en voiture", "en métro", "en train", "en avion"]} />
      <Lines>
        <li><B>à</B> + astride / on foot</li>
      </Lines>
      <PillRow items={["à pied", "à vélo", "à moto"]} />
    </Card>
  ),

  /* ---------- C'est loin ? ---------- */
  "loin-lesson": (
    <Card title="C'est loin ?">
      <Lines>
        <li><span lang="fr">C'est</span> <B>loin</B> ? <span lang="fr">C'est</span> <B>près</B> ?</li>
        <li><span lang="fr">C'est</span> <B>à dix minutes à pied</B>.</li>
        <li><span lang="fr">C'est</span> <B>à deux stations de métro</B>.</li>
      </Lines>
      <p className="mt-3 text-[15px] text-[color:var(--cahier-ink)]">
        <B>c'est à</B> + duration/distance + transport
      </p>
    </Card>
  ),

  /* ---------- Quel temps fait-il ? ---------- */
  "weather-letris": (
    <Card title="Quel temps fait-il ?">
      <Lines>
        <li><B>Il fait</B> + adjective</li>
      </Lines>
      <PillRow items={["beau", "chaud", "froid", "mauvais"]} />
      <Lines>
        <li><B>Il y a</B> + noun</li>
      </Lines>
      <PillRow items={["du soleil", "du vent", "des nuages"]} />
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
      <PillRow items={["vous sortez", "vous continuez", "vous tournez", "vous prenez"]} />
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
        <li>+1 → <B>et un</B> — <span lang="fr">vingt <b className="text-[color:var(--cahier-la)]">et un</b>, trente <b className="text-[color:var(--cahier-la)]">et un</b>, soixante <b className="text-[color:var(--cahier-la)]">et un</b></span></li>
        <li>the rest → hyphen — <span lang="fr">vingt<B>-</B>deux, quarante<B>-</B>sept, soixante<B>-</B>neuf</span></li>
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

/** The Mémo card for a deck, or undefined (ateliers — their Lire is the model dialogue). */
export function memoForDeck(id: string): ReactNode | undefined {
  return DECK_MEMOS[id];
}
