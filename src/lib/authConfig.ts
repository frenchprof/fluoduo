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
export const REQUIRE_SIGN_IN = false;
