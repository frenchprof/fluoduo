/**
 * The bottom bar — four slots, and why it is four and not five.
 *
 * Dan, 2026-08-10: "there is the FluOLinGo highlighted link back to Home. Is
 * that doing double work with Accueil below; similarly the Moi appears twice
 * (I would suggest using FluOLinGo as the Home link, and to keep the Moi at
 * the top, so that we can use the five (now four) slots below the screen for
 * Index - ReVue - Skills - SvPlay; and not using words on the mobile if
 * possible and let the words appear only when the finger lays on it?)"
 *
 * He was right on both counts. The wordmark was already a link and the account
 * chip was already the profile door, so Accueil and Moi were each the second
 * copy of something the top bar had covered since July.
 *
 * FluOlin Goals is not in this list because Goals IS home — the wordmark. And
 * FluOlin User is not in it because Moi is the account chip, top right.
 */
import { FAMILIES, familyShort, type Family, type FamilyKey } from "@/content/activities";

export type NavSlot = { key: FamilyKey; label: string; emoji: string; href: string };

const slotFor = (f: Family): NavSlot => ({
  key: f.key,
  // "FluOLin Revise" is the family's name; the bar shows the short form,
  // because a 5-slot bar on a 390px phone gives each label ~72px.
  label: familyShort(f),
  emoji: f.emoji,
  href: f.href,
});

/**
 * All six families as bar slots — the pick-list behind the bar. Dan,
 * 2026-09-05: "the bottom bar is optional and users can opt to remove it or
 * to replace the items there (but there should be some defaults)." So the
 * bar a learner sees is `uiPrefs.bottomNav` picking from THIS list — which
 * is how 👤 User, absent from the default below, can be opted back in.
 */
export const ALL_NAV: NavSlot[] = FAMILIES.map(slotFor);

/**
 * FIVE SLOTS, NOT FOUR (Dan, 2026-08-22, on the profile design): "those 6 flap
 * tabs — minus User, i think we should have those 5 emojis as base shortcuts
 * instead". The bar is now the families themselves, in `FAMILIES` order, so
 * the phone bar, the side rail and the ▦ Menu finally name the same five
 * things in the same sequence:
 *
 *   🎯 Goals · ✏️ Practice · 🎮 SvPlay · 🔖 Review · 💪 Skills
 *
 * WHAT CHANGED FROM THE FOUR. Index (📖 /activities) lost its own slot —
 * Dan: "Goals and Index to merge later on as one". Nothing was orphaned:
 * Practice pointed at /activities, which WAS the Index; the Index was
 * retired on 2026-08-29 and Practice now points at /map. So the
 * destination kept a slot even though the name went.
 *
 * User is deliberately absent, unchanged from the four-slot bar: the account
 * chip in the top bar is the profile door, and a second one down here was the
 * duplication that took the bar from six to four in the first place.
 *
 * EVERY SLOT NOW OPENS ITS FAMILY, not a member of it (2026-08-30). Dan:
 * "can we first establish if those are really the five that we need anchored
 * below? the most likely shortcuts needed by learners should go there." The
 * five were right; two of the doors were not. 🎮 opened VocabulaRain and 💪
 * opened ConjugaZone, because those two families had no hub page to open —
 * so the other three games and the other five skills had no shortcut at all.
 * `/games` and `/skills` are that missing page; verify52 fails the build if a
 * slot ever points into a single activity again.
 */
export const BOTTOM_NAV: NavSlot[] = FAMILIES.filter((f) => f.key !== "user").map(slotFor);
