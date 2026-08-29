/**
 * The bottom bar — four slots, and why it is four and not five.
 *
 * Dan, 2026-08-10: "there is the FluOlinGo highlighted link back to Home. Is
 * that doing double work with Accueil below; similarly the Moi appears twice
 * (I would suggest using FluOlinGo as the Home link, and to keep the Moi at
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
import { FAMILIES } from "@/content/activities";

export type NavSlot = { key: string; label: string; emoji: string; href: string };

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
 */
export const BOTTOM_NAV: NavSlot[] = FAMILIES.filter((f) => f.key !== "user").map((f) => ({
  key: f.key,
  // "FluOlin Review" is the family's name; the bar shows the short form,
  // because a 5-slot bar on a 390px phone gives each label ~72px.
  label: f.name.replace(/^FluOlin /, ""),
  emoji: f.emoji,
  href: f.href,
}));
