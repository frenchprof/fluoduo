/**
 * Curated pretests — bundled with the app (0 Firestore reads).
 * One pretest per lesson; the id encodes unit + lessonNo + slug.
 * The unit-1..4 sets are generated from docs/planning/PRETESTS_ALL_SIOS_PROPOSAL.md.
 */
import type { Pretest } from "@/lib/pretests/schema";
import weather from "./u3-l1-weather.json";
import cityPreps from "./u3-l2-city-preps.json";
import pu1_sio011 from "./u1-sio011.json";
import pu1_sio012 from "./u1-sio012.json";
import pu1_sio013 from "./u1-sio013.json";
import pu1_sio014 from "./u1-sio014.json";
import pu1_sio015 from "./u1-sio015.json";
import pu1_sio016 from "./u1-sio016.json";
import pu1_sio017 from "./u1-sio017.json";
import pu1_sio018 from "./u1-sio018.json";
import pu1_sio019 from "./u1-sio019.json";
import pu2_sio021 from "./u2-sio021.json";
import pu2_sio022 from "./u2-sio022.json";
import pu2_sio023 from "./u2-sio023.json";
import pu2_sio024 from "./u2-sio024.json";
import pu2_sio025 from "./u2-sio025.json";
import pu2_sio026 from "./u2-sio026.json";
import pu2_sio027 from "./u2-sio027.json";
import pu2_sio028 from "./u2-sio028.json";
import pu2_sio029 from "./u2-sio029.json";
import pu3_sio033 from "./u3-sio033.json";
import pu3_sio034 from "./u3-sio034.json";
import pu3_sio035 from "./u3-sio035.json";
import pu3_sio036 from "./u3-sio036.json";
import pu3_sio037 from "./u3-sio037.json";
import pu3_sio038 from "./u3-sio038.json";
import pu3_sio039 from "./u3-sio039.json";
import pu4_sio041 from "./u4-sio041.json";
import pu4_sio042 from "./u4-sio042.json";
import pu4_sio043 from "./u4-sio043.json";
import pu4_sio044 from "./u4-sio044.json";
import pu4_sio045 from "./u4-sio045.json";
import pu4_sio046 from "./u4-sio046.json";
import pu4_sio047 from "./u4-sio047.json";
import pu4_sio047p from "./u4-sio047-plans.json";
import pu4_sio048a from "./u4-sio048-advice.json";
import pu4_sio045m from "./u4-sio045-marche.json";
import pu4_sio045a from "./u4-sio045a-nombres.json";

export const PRETESTS: Pretest[] = [
  weather as unknown as Pretest,
  cityPreps as unknown as Pretest,
  pu1_sio011 as unknown as Pretest,
  pu1_sio012 as unknown as Pretest,
  pu1_sio013 as unknown as Pretest,
  pu1_sio014 as unknown as Pretest,
  pu1_sio015 as unknown as Pretest,
  pu1_sio016 as unknown as Pretest,
  pu1_sio017 as unknown as Pretest,
  pu1_sio018 as unknown as Pretest,
  pu1_sio019 as unknown as Pretest,
  pu2_sio021 as unknown as Pretest,
  pu2_sio022 as unknown as Pretest,
  pu2_sio023 as unknown as Pretest,
  pu2_sio024 as unknown as Pretest,
  pu2_sio025 as unknown as Pretest,
  pu2_sio026 as unknown as Pretest,
  pu2_sio027 as unknown as Pretest,
  pu2_sio028 as unknown as Pretest,
  pu2_sio029 as unknown as Pretest,
  pu3_sio033 as unknown as Pretest,
  pu3_sio034 as unknown as Pretest,
  pu3_sio035 as unknown as Pretest,
  pu3_sio036 as unknown as Pretest,
  pu3_sio037 as unknown as Pretest,
  pu3_sio038 as unknown as Pretest,
  pu3_sio039 as unknown as Pretest,
  pu4_sio041 as unknown as Pretest,
  pu4_sio042 as unknown as Pretest,
  pu4_sio043 as unknown as Pretest,
  pu4_sio044 as unknown as Pretest,
  pu4_sio045 as unknown as Pretest,
  pu4_sio046 as unknown as Pretest,
  pu4_sio047 as unknown as Pretest,
  pu4_sio045m as unknown as Pretest,
  pu4_sio045a as unknown as Pretest,
  pu4_sio047p as unknown as Pretest,
  pu4_sio048a as unknown as Pretest,
];

export function getPretest(id: string): Pretest | undefined {
  return PRETESTS.find((p) => p.id === id);
}

export function getPretestForLesson(
  unit: number,
  lessonNo: number,
): Pretest | undefined {
  return PRETESTS.find((p) => p.unit === unit && p.lessonNo === lessonNo);
}

/**
 * Explicit SIO -> pretest attachment. Source of truth for which SIO shows
 * which pretest in its popup (the unit/lesson join is fragile — deck lessonNo
 * carries legacy numbering). Add a line whenever a new pretest is authored.
 */
const PRETEST_BY_SIO: Record<string, string> = {
  "SIO-031": "u3-l1-weather",
  "SIO-032": "u3-l2-city-preps",
  "SIO-011": "u1-sio011",
  "SIO-012": "u1-sio012",
  "SIO-013": "u1-sio013",
  "SIO-014": "u1-sio014",
  "SIO-015": "u1-sio015",
  "SIO-016": "u1-sio016",
  "SIO-017": "u1-sio017",
  "SIO-018": "u1-sio018",
  "SIO-019": "u1-sio019",
  "SIO-021": "u2-sio021",
  "SIO-022": "u2-sio022",
  "SIO-023": "u2-sio023",
  "SIO-024": "u2-sio024",
  "SIO-025": "u2-sio025",
  "SIO-026": "u2-sio026",
  "SIO-027": "u2-sio027",
  "SIO-028": "u2-sio028",
  "SIO-029": "u2-sio029",
  "SIO-033": "u3-sio033",
  "SIO-034": "u3-sio034",
  "SIO-035": "u3-sio035",
  "SIO-036": "u3-sio036",
  "SIO-037": "u3-sio037",
  "SIO-038": "u3-sio038",
  "SIO-039": "u3-sio039",
  "SIO-041": "u4-sio041",
  // Unit 4 re-cut (Dan, 2026-07-14): the merged SIO-042 keeps the partitive
  // pretest (u4-sio043/044 stay in content, unmapped); renumbered SIOs keep
  // their original pretests.
  "SIO-042": "u4-sio042",
  "SIO-043": "u4-sio045",
  "SIO-044": "u4-sio047",
  "SIO-045": "u4-sio045-marche",
  "SIO-045A": "u4-sio045a-nombres",
  "SIO-046": "u4-sio046",
  "SIO-047": "u4-sio047-plans",
  "SIO-048": "u4-sio048-advice",
};

export function getPretestForSio(sioId: string): Pretest | undefined {
  const id = PRETEST_BY_SIO[sioId];
  return id ? getPretest(id) : undefined;
}

/** Reverse of the attachment above — which SIO a pretest belongs to. */
export function sioIdForPretest(pretestId: string): string | undefined {
  return Object.keys(PRETEST_BY_SIO).find((s) => PRETEST_BY_SIO[s] === pretestId);
}
