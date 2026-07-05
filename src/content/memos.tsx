/**
 * Mémo wave 1 (Dan, 2026-07-05) — every deck's Lesson opens with a Mémo card.
 * Same card markup style as the native lessons' memos (quand.tsx): rounded-2xl
 * card on --cahier-rule, cahier-display heading, bold pattern lines with
 * glosses, pill rows, one ⚠ line max. Litmus rule: pattern + examples only.
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

  /* ---------- Avec qui ? ---------- */
  "avec-qui": (
    <Card title="Avec qui ?">
      <PillRow
        label={<span lang="fr">avec</span>}
        items={["moi", "toi", "lui / elle", "nous", "vous", "eux / elles"]}
      />
      <Lines>
        <li><span lang="fr">Tu vas au cinéma avec qui ?</span> — <span lang="fr">Avec</span> <B>eux</B> !</li>
      </Lines>
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

/** The Mémo card for a deck, or undefined (ateliers + wave-2 decks). */
export function memoForDeck(id: string): ReactNode | undefined {
  return DECK_MEMOS[id];
}
