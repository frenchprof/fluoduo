const CONJUGAZONE_IDS = new Set(["etre-etudiant"]);

export function isConjugaZoneReadyId(id: string): boolean {
  return CONJUGAZONE_IDS.has(id);
}
