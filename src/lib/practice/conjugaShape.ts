/**
 * How a conjugated form comes apart, for ConjugaZone's table.
 *
 * Dan, 2026-09-11: *"Whenever the conjugated forms end with the standard
 * -e -es -e -ons -ez -ent, or some other standard set of verb endings, these
 * verb endings must appear in red and highlighted in yellow. When there are
 * irregular forms like « Je suis » « Tu es » etc. then the entire verb form
 * « suis » or « es » is to be in red."*
 *
 * Two decisions live here, and both were nearly got wrong.
 *
 * ── WHY THE GROUP DECIDES, NOT THE SPELLING ───────────────────────────────
 * The obvious rule is "does this form end with a standard ending?" It breaks
 * on the exact verb Dan named. « suis » ends in -s, and -s IS the standard
 * `tu`/`je` ending for the second and third groups (« je finis », « je
 * vends »), so a spelling test splits it into « sui » + « s » — the opposite
 * of the ruling, on his own example.
 *
 * A stem test fails too, in the other direction. Take the longest common
 * prefix of a verb's six forms and s'appeler gives « appel », so « appelle »
 * splits as « appel » + « le » and the highlighted ending is not an ending.
 * Stem-changing verbs are normal at A1, not an edge case.
 *
 * So the ENDING SET COMES FROM THE VERB'S GROUP, which conjugaison.ts already
 * curates by hand, and a group with no set has no regular endings at all:
 * every one of its forms is irregular, whole and red. être, avoir, aller,
 * faire, falloir and the twenty-four third-group irregulars land there, which
 * is precisely the list a learner has to memorise rather than derive.
 *
 * The irregular groups therefore keep a PARTIAL set rather than none — nous
 * and vous only. « nous allons » carries a real -ons and a learner should see
 * it; « nous sommes », « vous êtes » and « vous faites » do not, and the
 * endsWith test drops them with no special case. je and tu stay out, which is
 * what keeps « suis » and « es » red entire, as Dan asked.
 *
 * ── THE REFLEXIVE PRONOUN IS ITS OWN COLUMN ───────────────────────────────
 * Dan: *"The conjugation should have the subject pronoun right next to the
 * conjugated verb rather than being separated in a different column"*, with
 * three tight columns for a reflexive verb and two for a plain one. The data
 * bakes the object pronoun into the form ("m'appelle", "nous nous appelons")
 * because row headers stay plain subject pronouns everywhere — see
 * conjugaison.ts's own note. Splitting it back out is this file's job, so the
 * stored shape never has to change and `conjSpoken` keeps working untouched.
 */

import { CONJ_GROUPS, type ConjVerb } from "@/content/conjugaison";

/**
 * The regular present-tense endings, per group, in PERSONS order.
 *
 * A group absent from this map has no regular endings: all six of its forms
 * are irregular. That is a statement about French, not a gap — see above.
 */
type EndingSet = readonly [
  string | null, string | null, string | null, string | null, string | null, string | null,
];

/** `null` = this person has no regular ending in this group, so its form is
 *  memorised whole. `""` = a regular ending that happens to be ZERO — « il
 *  vend » is as regular as « je vends » and must not be painted red. The two
 *  were one value in the first cut of this file and « il vend » came out as
 *  an irregular form, which is a lie about the third group. */
const ENDINGS: Record<string, EndingSet> = {
  // 1ᵉʳ groupe · -ER réguliers, and the -eR stem-changers, which take the
  // SAME endings on a shifting stem (appelle / appelons) — which is exactly
  // why the split has to be made from the ending and not from the stem.
  [CONJ_GROUPS[1]]: ["e", "es", "e", "ons", "ez", "ent"],
  [CONJ_GROUPS[2]]: ["e", "es", "e", "ons", "ez", "ent"],
  // 2ᵉ groupe · -IR (…issons)
  [CONJ_GROUPS[3]]: ["is", "is", "it", "issons", "issez", "issent"],
  // 3ᵉ groupe · -RE réguliers — the il/elle/on form takes no ending at all
  // ("il vend"), so its slot is empty and never splits.
  [CONJ_GROUPS[4]]: ["s", "s", "", "ons", "ez", "ent"],
  // ⭐ Essentiels and 3ᵉ irréguliers keep a PARTIAL set: nous and vous only.
  //
  // Those two persons are the most regular in French — « nous allons »,
  // « nous faisons », « vous allez » carry a real -ons and -ez, and hiding
  // that from a learner to keep a rule tidy teaches them less. The three that
  // break it break it on the SPELLING and are caught by the endsWith test
  // below without any special case: « nous sommes » is not -ons, « vous
  // êtes » and « vous faites » are not -ez, so all three stay whole and red.
  //
  // je and tu stay null here on purpose. That is what keeps Dan's own example
  // right: « suis » and « es » are red entire, never « sui »+« s ».
  [CONJ_GROUPS[0]]: [null, null, null, "ons", "ez", null],
  [CONJ_GROUPS[5]]: [null, null, null, "ons", "ez", null],
};

/** What conjugaison.ts stores for a person a verb simply does not have —
 *  falloir exists only in « il faut ». It is not an irregular form and must
 *  not be painted like one; the table draws it as absent. */
export const MISSING = "—";

/** The groups whose endings are regular for every person. The other two carry
 *  only a partial set (see ENDINGS) and never have their infinitive coded. */
const REGULAR_GROUPS = new Set<string>([
  CONJ_GROUPS[1], CONJ_GROUPS[2], CONJ_GROUPS[3], CONJ_GROUPS[4],
]);

/** A form's reflexive pronoun, if it has one, and the verb that follows it. */
export type Reflexive = { rp: string; verb: string };

/**
 * Peel a baked-in object pronoun off a stored form.
 *
 * Elided (m' t' s') and full (nous vous) are both handled, and the full ones
 * are doubled in the data ("nous nous appelons"): the first is the subject
 * the row header already shows, the second is the object this returns.
 */
export function splitReflexive(form: string): Reflexive | null {
  const elided = /^([mts]')(.+)$/.exec(form);
  if (elided) return { rp: elided[1], verb: elided[2] };
  const full = /^(nous|vous)\s+(nous|vous)\s+(.+)$/i.exec(form);
  if (full) return { rp: full[2], verb: full[3] };
  return null;
}

/** True when any of a verb's forms carries an object pronoun. */
export function isPronominal(v: ConjVerb): boolean {
  return v.forms.some((f) => splitReflexive(f) !== null);
}

/** A form split into the part a learner must remember and the part they can
 *  derive — or null when the whole form must be remembered. */
export type FormShape = { stem: string; ending: string } | null;

/**
 * Split one form into stem + regular ending, or null if it is irregular.
 *
 * `personIdx` indexes PERSONS. The form passed in must already have had any
 * reflexive pronoun peeled off by `splitReflexive`, or the ending will be
 * measured against a string that starts with one.
 */
export function splitEnding(v: ConjVerb, personIdx: number, verbPart: string): FormShape {
  const set = ENDINGS[v.group];
  if (!set) return null;                       // the group has no regular endings
  const ending = set[personIdx];
  if (ending === null) return null;            // this person is memorised whole
  if (verbPart === MISSING) return null;       // falloir's empty persons
  if (ending === "") return { stem: verbPart, ending: "" };  // « il vend » — regular, nothing to paint
  if (!verbPart.endsWith(ending)) return null; // a rogue form inside a regular group
  const stem = verbPart.slice(0, -ending.length);
  if (!stem) return null;                      // an ending with no stem is a whole form
  return { stem, ending };
}

/** Everything one cell of the table needs, in one call. */
export function shapeCell(v: ConjVerb, personIdx: number): {
  rp: string | null;
  verb: string;
  shape: FormShape;
  /** This verb has no such person at all (falloir). Not the same as irregular. */
  missing: boolean;
} {
  const raw = v.forms[personIdx];
  const refl = splitReflexive(raw);
  const verb = refl ? refl.verb : raw;
  return {
    rp: refl ? refl.rp : null,
    verb,
    shape: splitEnding(v, personIdx, verb),
    missing: raw === MISSING,
  };
}

/**
 * The infinitive, split the same way, so the heading is coded like the column
 * under it (Dan, 2026-09-11: *"the -ER in the infinitive needs to be coded the
 * same as the verb endings"*).
 *
 * A verb whose group has no regular endings returns null and its infinitive
 * is shown wholly irregular — être is red at the top of a red column, which
 * is the whole point of colouring it.
 */
export function shapeInfinitive(v: ConjVerb): FormShape {
  // REGULAR GROUPS ONLY, not "any group with an entry in ENDINGS". The
  // irregular groups gained a partial nous/vous set above, and that promptly
  // made shapeInfinitive paint « êt|re » — être coded as a regular -RE verb
  // at the head of a column of six red forms, which is the one thing the
  // colour is there to deny. An infinitive's ending is a claim about the
  // whole paradigm, so only a group whose whole paradigm is regular gets it.
  if (!REGULAR_GROUPS.has(v.group)) return null;
  const bare = v.inf.replace(/^s[e']\s*/i, "");   // s'appeler -> appeler
  const m = /^(.*?)(er|ir|re)$/i.exec(bare);
  if (!m || !m[1]) return null;
  return { stem: m[1], ending: m[2] };
}
