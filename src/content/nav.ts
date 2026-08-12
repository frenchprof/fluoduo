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

/** Index leads: it belongs to no family and it is the way into all 50 decks. */
export const BOTTOM_NAV: NavSlot[] = [
  { key: "index", label: "Index", emoji: "📖", href: "/activities" },
  ...FAMILIES.filter((f) => f.key === "review" || f.key === "skills" || f.key === "svplay").map((f) => ({
    key: f.key,
    // "FluOlin Review" is the family's name; the bar shows the short form,
    // because a 4-slot bar on a 390px phone gives each label ~90px.
    label: f.name.replace(/^FluOlin /, ""),
    emoji: f.emoji,
    href: f.href,
  })),
];
