/* Clear the emulator's data before a suite runs — and survive the handover.
 *
 * WHY THIS IS NOT ONE LINE. `env.clearFirestore()` on its own throws when a
 * suite starts immediately after another one exits:
 *
 *     Error: {"code":499,"message":"call already cancelled...","status":"CANCELLED"}
 *
 * The previous process's gRPC streams are still winding down, and the clear
 * request lands in that window and is cancelled. It is a HANDOVER race, not a
 * broken emulator — the same clear succeeds a moment later. Found by running
 * the runner exactly as CI runs it: the attacks suite passed 6/6, then
 * legit-paths crashed before printing a line and the runner exited 1, which
 * would have made the new workflow permanently red on a green rules file.
 *
 * THE RETRY IS NARROW ON PURPOSE. Only a cancelled/unavailable call is worth
 * trying again; anything else is a real failure and is rethrown immediately,
 * so this can never turn a broken emulator into a silent pass. That is the
 * same rule scripts/lib/settle.mjs follows — retry a handover, never a
 * verdict.
 */
export async function clearWithRetry(env, tries = 5) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      await env.clearFirestore();
      return;
    } catch (err) {
      const msg = String(err?.message ?? err);
      const handover = /CANCELLED|already cancelled|UNAVAILABLE|ECONNRESET|socket hang up/i.test(msg);
      if (!handover || attempt === tries) throw err;
      await new Promise((r) => setTimeout(r, 200 * attempt));
    }
  }
}
