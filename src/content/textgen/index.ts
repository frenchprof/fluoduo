/**
 * ÉcouTexte generator registry. One entry per unit that has one; the picker
 * and the /practice/ecoutexte/[unit] route are both driven from this list, so
 * adding unité 2 later is one import and one array entry.
 */

import { UNIT3 } from "./unit3";
import { UNIT4 } from "./unit4";
import type { UnitTextGen } from "../../lib/textgen/types";

export const TEXTGENS: UnitTextGen[] = [UNIT3, UNIT4];

export function textGenFor(unit: number): UnitTextGen | undefined {
  return TEXTGENS.find((g) => g.unit === unit);
}
