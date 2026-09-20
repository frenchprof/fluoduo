/**
 * Force-sign-out the given accounts on EVERY device (Dan, 28 Aug 2026).
 * Revokes each account's refresh tokens: every signed-in device loses its
 * session as soon as its current 1-hour token expires, and can no longer
 * sync anything until someone signs in again by hand.
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=~/.keys/fluo-admin.json \
 *     node scripts/sign-out-everywhere.mjs email1 email2 ...
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "node:fs";

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) { console.error("Set GOOGLE_APPLICATION_CREDENTIALS"); process.exit(1); }
initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, "utf8"))) });
const auth = getAuth();

for (const email of process.argv.slice(2).filter((a) => a.includes("@"))) {
  try {
    const u = await auth.getUserByEmail(email);
    await auth.revokeRefreshTokens(u.uid);
    console.log(`✓ ${email} — signed out everywhere (takes effect within 1 hour)`);
  } catch {
    console.log(`✗ ${email}: no Auth user`);
  }
}
