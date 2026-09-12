/**
 * FAVOURITES, ACROSS DEVICES — the same local-first bargain `progressSync`
 * makes, and for the same reason.
 *
 * Dan, 2026-09-12: *"lemme know how to include firebase for this"*. Here is
 * the shape, and the order of the three rules matters more than the code:
 *
 *   1  LOCAL IS AUTHORITATIVE ON-DEVICE. Everything works signed out, offline,
 *      and in a private window. Firestore is a copy, never the source the page
 *      reads — `FavouritesContent` never awaits the network.
 *   2  A PULL NEVER OVERWRITES BLIND. On sign-in the two sides are MERGED by
 *      href (see `mergeFavourites`), because the learner who starred six pages
 *      on their phone and four on a laptop must end with ten, not with
 *      whichever device synced last. This is the lesson PR 202 wrote into the
 *      progress merge — a sign-in that eats what you did is the worst bug this
 *      app has shipped.
 *   3  A FAILED PUSH IS SILENT AND HARMLESS. Rules hiccup, offline, quota —
 *      the catch swallows it and the local copy stands. A starred page must
 *      never disappear from the screen because a network call failed.
 *
 * ONE DOCUMENT, `users/{uid}/favourites/list`. A rename and a folder move each
 * touch two rows at once; a document per star would need a batch for both, and
 * a query to read. `firestore.rules` caps it at 200 items and 20 folders, and
 * the same two numbers live in `lib/favourites.ts` so the learner meets the
 * limit as a message rather than as a save that quietly fails.
 */

import { auth } from "./client";
import {
  emptyFavourites,
  loadFavourites,
  saveFavourites,
  type Fav,
  type FavFolder,
  type Favourites,
} from "@/lib/favourites";

const DOC_PATH = ["favourites", "list"] as const;

/**
 * Union by href, newest label wins, folders unioned by id. Pure, so a check
 * can run it in node — the same reason `mergeProgress` lives apart from its
 * caller.
 */
export function mergeFavourites(a: Favourites, b: Favourites): Favourites {
  const items = new Map<string, Fav>();
  for (const it of [...a.items, ...b.items]) {
    const seen = items.get(it.href);
    // The later star wins the row, which also carries the later rename and the
    // later folder. Equal timestamps keep the first seen — stable, not random.
    if (!seen || it.at > seen.at) items.set(it.href, it);
  }
  const folders = new Map<string, FavFolder>();
  for (const f of [...a.folders, ...b.folders]) if (!folders.has(f.id)) folders.set(f.id, f);
  return {
    v: Math.max(a.v, b.v),
    items: [...items.values()],
    folders: [...folders.values()],
  };
}

export async function pushFavourites(f: Favourites): Promise<void> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const [{ doc, setDoc }, { db }] = await Promise.all([
      import("firebase/firestore"),
      import("./db"),
    ]);
    await setDoc(doc(db, "users", uid, ...DOC_PATH), {
      v: f.v,
      items: f.items,
      folders: f.folders,
      updatedAt: Date.now(),
    });
  } catch {
    /* offline, or a rules hiccup. The local copy is still authoritative on
       this device, and the next save pushes the whole document again — so a
       missed push costs nothing but a delay. */
  }
}

/** Called on sign-in: merge what is on the server into what is on the device,
 *  save the union locally, and push it back so both sides agree. */
export async function pullAndMergeFavourites(): Promise<Favourites> {
  const local = loadFavourites();
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return local;
    const [{ doc, getDoc }, { db }] = await Promise.all([
      import("firebase/firestore"),
      import("./db"),
    ]);
    const snap = await getDoc(doc(db, "users", uid, ...DOC_PATH));
    const remote = snap.exists() ? ({ ...emptyFavourites(), ...snap.data() } as Favourites) : emptyFavourites();
    const merged = saveFavourites(mergeFavourites(local, remote));
    await pushFavourites(merged);
    return merged;
  } catch {
    return local;
  }
}
