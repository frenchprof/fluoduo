"use client";

/**
 * Client entry for /games/compose/[bankId] — resolves the bank here (banks
 * carry functions, which can't cross the server→client prop boundary) and
 * picks the solo or dialogue engine.
 */

import { getComposeBank } from "@/games/compose/banks";
import ComposeSolo from "@/games/compose/ComposeSolo";
import ComposeDialogue from "@/games/compose/ComposeDialogue";
import ComposeUnscramble from "@/games/compose/ComposeUnscramble";

export default function ComposeGame({ bankId }: { bankId: string }) {
  const bank = getComposeBank(bankId);
  if (!bank) return null; // the route 404s before this can happen
  if (bank.mode === "dialogue") return <ComposeDialogue bank={bank} />;
  if (bank.mode === "unscramble") return <ComposeUnscramble bank={bank} />;
  return <ComposeSolo bank={bank} />;
}
