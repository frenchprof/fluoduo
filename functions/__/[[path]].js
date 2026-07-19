/**
 * First-party Firebase auth handler (2026-07-20, the proper fix for the
 * Safari sign-in fallback).
 *
 * WHY: signInWithRedirect bounces through `authDomain`. When that was
 * laf1201.firebaseapp.com, Safari's tracking prevention treated the hop as
 * third-party and dropped the session — the "signed out on return" bug. The
 * fix is to serve Firebase's reserved /__/auth/* endpoints (and the
 * /__/firebase/init.json config they load) from OUR OWN domain, so the whole
 * round trip stays first-party. Firebase Hosting does this automatically;
 * Cloudflare Pages does not — and Pages' _redirects file cannot proxy
 * cross-origin — so this Pages Function does it: any request to /__/* is
 * fetched from laf1201.firebaseapp.com and returned as if it were ours.
 *
 * SEQUENCING (do not reorder): deploy this FIRST — it is inert while
 * authDomain still points at laf1201.firebaseapp.com. Verify
 * https://fluolingo.withdrchan.com/__/firebase/init.json returns JSON, THEN
 * flip authDomain in src/lib/firebase/client.ts to fluolingo.withdrchan.com.
 * Rollback at any time = revert that one authDomain line.
 *
 * Prereqs already configured (Dan, 2026-07-19): fluolingo.withdrchan.com in
 * Firebase Auth authorized domains; OAuth redirect URI
 * https://fluolingo.withdrchan.com/__/auth/handler on the Web client.
 */

const UPSTREAM = "https://laf1201.firebaseapp.com";

export async function onRequest({ request }) {
  const url = new URL(request.url);
  const upstream = UPSTREAM + url.pathname + url.search;
  // new Request(upstream, request) carries over method, headers and body;
  // the Host header is derived from the upstream URL, not forwarded.
  // redirect:"manual" hands any 30x straight back to the browser instead of
  // following it server-side — redirects are part of the auth choreography.
  return fetch(new Request(upstream, request), { redirect: "manual" });
}
