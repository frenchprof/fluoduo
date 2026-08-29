/**
 * Master switch for the learning-activity sign-in wall (see AuthGate).
 *
 *   true  → learners must sign in with Google to do pretests / practice /
 *           games / the reviser / lessons / mark-as-done (feedback stays open).
 *   false → the wall is SUSPENDED — everything is open (useful while developing).
 *
 * Flip this one line to turn the wall on/off; nothing else needs to change.
 * Remember to re-enable (true) before a real launch.
 */
export const REQUIRE_SIGN_IN = process.env.NEXT_PUBLIC_OPEN_APP !== "1";

/* WHY A BUILD-TIME SWITCH AND NOT A PASSWORD (Dan asked for "a secret sign in
 * method for Claude", 2026-08-27).
 *
 * A password would be worse than useless here: the app is `output: "export"`,
 * so every line of it is downloaded by every student. A shared secret in that
 * bundle is findable in a minute with the developer tools, and it would open
 * the wall into Firestore, where the student records are.
 *
 * This is compile-time instead. NEXT_PUBLIC_OPEN_APP is read when the bundle
 * is BUILT, so a production build — which never sets it — contains no bypass
 * at all, not even a disabled one. An agent that needs to see a gated surface
 * builds its own throwaway copy with the flag on, screenshots it, and deletes
 * it. There is no secret, because there is nothing to keep secret.
 *
 * The flag must NEVER be committed into any config that a deploy reads.
 * verify38-authwall.py fails the build if it appears in one. */
