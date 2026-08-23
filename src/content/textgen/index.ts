/**
 * ÉcouTexte generator registry. One entry per unit that has one; the picker
 * and the /practice/ecoutexte/[unit] route are both driven from this list, so
 * adding unité 2 later is one import and one array entry.
 */

import { UNIT0 } from "./unit0";
import { UNIT1 } from "./unit1";
import { UNIT2 } from "./unit2";
import { UNIT3 } from "./unit3";
import { UNIT4 } from "./unit4";
import type { UnitTextGen } from "../../lib/textgen/types";

export const TEXTGENS: UnitTextGen[] = [UNIT0, UNIT1, UNIT2, UNIT3, UNIT4];

export function textGenFor(unit: number): UnitTextGen | undefined {
  return TEXTGENS.find((g) => g.unit === unit);
}
