/**
 * Per-stop Specific Instructional Objectives — the observable behaviour,
 * conditions, and criterion for each of the 50 stops, authored against the
 * ACTUAL deck content (docs/SIO_OBJECTIVES.md is the source; regenerate with
 * scripts/gen-sio-objectives.mjs, don't hand-edit the JSON). Where sios.json's
 * spec text and the deck drifted (SIO-001's 8 subject forms, SIO-006 owning
 * M./Mme, SIO-036's no-imperative directions…), THIS text follows the deck.
 *
 * Kept out of the Sio type on purpose: sios.json is generated from the v9 CSV
 * and this layer is authored on top of it, so the two regenerate independently.
 */
import raw from "./objectives.json";

/** Body text with *…* italic markers (the UI renders those, see SioObjective). */
export const SIO_OBJECTIVES: Record<string, string> = raw;
