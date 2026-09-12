/**
 * FAVOURITES — the pages a learner chose to keep, in folders they made.
 *
 * Dan, 2026-09-12, after ruling that pinning a single goal stays out: *"what
 * we can do though, is to allow learners to favourite particular pages or
 * activity so they can revisit when want to, like bookmarks"*. Asked what
 * should be starrable: *"i can't think of anything that should not be able to
 * star"*. Asked what a line should say, he took BOTH of the richer options —
 * name, where it sits, when it was starred, AND renameable — *"so long as it
 * is linked, and that the page is presented in a user-friendly way (it should
 * even allow them to organise into folders)"*.
 *
 * ── THIS IS NOT THE OTHER BOOKMARK ────────────────────────────────────────
 * `StopBookmark` (2 Sep) marks ONE thing: the stop a learner left off at, the
 * editable « 22 » in the top bar. It answers *where am I*. This answers *what
 * do I want to come back to*, and there are many. Two features, two names, and
 * nothing in here touches `continuer.ts`.
 *
 * ── THE SHAPE, AND WHY EACH FIELD EARNS ITS PLACE ─────────────────────────
 *   href    the identity. Two stars of the same URL are one star, so
 *           `/practice/say-it/aimer-activites` starred twice does not make two
 *           rows. It is also what makes the row a LINK, which Dan asked for.
 *   label   what the row says. Starts as `auto`; a rename replaces it.
 *   auto    the machine's name for the page, KEPT after a rename — so
 *           "the one with avoir" can be undone back to "WorDrill" without the
 *           learner having to remember what it was called.
 *   where   the context line: « goal 22 ». Null for a page with no goal (the
 *           map, the guide) rather than an invented one.
 *   at      when it was starred. Dan took the option that shows it.
 *   folder  null = loose, at the top. Otherwise a folder id.
 *
 * ── CAPS, AND WHY THEY ARE HERE AND NOT ONLY IN THE RULES ─────────────────
 * The Firestore rules cap the stored document (see firestore.rules), but a cap
 * enforced only at the server is a cap a learner meets as a SILENT FAILED
 * SAVE — the star goes grey and comes back on reload. So the same two numbers
 * live here, where `toggle()` can refuse and say why.
 *
 * Reads are SSR-safe: `output: "export"` prerenders every page, so nothing
 * here may touch `window` at module scope.
 */

const KEY = "fluolingo:favourites";

/** Bumped only for a shape change that needs migrating. */
export const FAV_VERSION = 1;

export const MAX_ITEMS = 200;
export const MAX_FOLDERS = 20;
export const MAX_LABEL = 80;

export type Fav = {
  href: string;
  label: string;
  auto: string;
  emoji: string;
  where: string | null;
  at: number;
  folder: string | null;
};

export type FavFolder = {
  id: string;
  name: string;
  at: number;
};

export type Favourites = {
  v: number;
  items: Fav[];
  folders: FavFolder[];
};

export function emptyFavourites(): Favourites {
  return { v: FAV_VERSION, items: [], folders: [] };
}

/** Anything that is not a well-formed store reads as an empty one — a corrupt
 *  or half-written key must not take the page down with it. */
function coerce(raw: unknown): Favourites {
  if (!raw || typeof raw !== "object") return emptyFavourites();
  const o = raw as Partial<Favourites>;
  const items = Array.isArray(o.items) ? o.items.filter(isFav).slice(0, MAX_ITEMS) : [];
  const folders = Array.isArray(o.folders) ? o.folders.filter(isFolder).slice(0, MAX_FOLDERS) : [];
  // A folder id that no longer exists would orphan its rows out of sight;
  // those rows come home to the top level instead of vanishing.
  const ids = new Set(folders.map((f) => f.id));
  for (const it of items) if (it.folder && !ids.has(it.folder)) it.folder = null;
  return { v: FAV_VERSION, items, folders };
}

function isFav(x: unknown): x is Fav {
  const f = x as Fav;
  return !!f && typeof f.href === "string" && f.href.length > 0
    && typeof f.label === "string" && typeof f.auto === "string"
    && typeof f.emoji === "string" && typeof f.at === "number"
    && (f.where === null || typeof f.where === "string")
    && (f.folder === null || typeof f.folder === "string");
}

function isFolder(x: unknown): x is FavFolder {
  const f = x as FavFolder;
  return !!f && typeof f.id === "string" && f.id.length > 0
    && typeof f.name === "string" && typeof f.at === "number";
}

export function loadFavourites(): Favourites {
  if (typeof window === "undefined") return emptyFavourites();
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? coerce(JSON.parse(raw)) : emptyFavourites();
  } catch {
    return emptyFavourites();
  }
}

export function saveFavourites(f: Favourites): Favourites {
  const next = coerce(f);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
      // Two surfaces read this at once — the ★ in the top bar and the page
      // itself, which may be in an iframe. A plain storage write does not
      // notify the same document, so say so explicitly.
      window.dispatchEvent(new CustomEvent("fluolingo:favourites"));
    } catch {
      /* storage blocked (private window, full quota) — the caller's copy is
         still correct for this session, and the page keeps working. */
    }
  }
  return next;
}

export function isStarred(f: Favourites, href: string): boolean {
  return f.items.some((i) => i.href === href);
}

/** Star or unstar one page. Returns the new store and what happened, so the
 *  caller can say « 200 is the limit » rather than silently doing nothing. */
export function toggleFavourite(
  f: Favourites,
  entry: { href: string; auto: string; emoji: string; where: string | null },
  now: number,
): { next: Favourites; added: boolean; full: boolean } {
  if (isStarred(f, entry.href)) {
    return { next: { ...f, items: f.items.filter((i) => i.href !== entry.href) }, added: false, full: false };
  }
  if (f.items.length >= MAX_ITEMS) return { next: f, added: false, full: true };
  const item: Fav = {
    href: entry.href,
    label: entry.auto.slice(0, MAX_LABEL),
    auto: entry.auto.slice(0, MAX_LABEL),
    emoji: entry.emoji,
    where: entry.where,
    at: now,
    folder: null,
  };
  // Newest first: the thing you just starred is the thing you are most likely
  // to want back, and it is the one you will look for to check it worked.
  return { next: { ...f, items: [item, ...f.items] }, added: true, full: false };
}

export function renameFavourite(f: Favourites, href: string, label: string): Favourites {
  const clean = label.trim().slice(0, MAX_LABEL);
  return {
    ...f,
    // An empty rename is not a blank row — it is "put the original back".
    items: f.items.map((i) => (i.href === href ? { ...i, label: clean || i.auto } : i)),
  };
}

export function removeFavourite(f: Favourites, href: string): Favourites {
  return { ...f, items: f.items.filter((i) => i.href !== href) };
}

export function addFolder(f: Favourites, name: string, now: number): Favourites {
  const clean = name.trim().slice(0, MAX_LABEL);
  if (!clean || f.folders.length >= MAX_FOLDERS) return f;
  const id = `f${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return { ...f, folders: [...f.folders, { id, name: clean, at: now }] };
}

export function renameFolder(f: Favourites, id: string, name: string): Favourites {
  const clean = name.trim().slice(0, MAX_LABEL);
  if (!clean) return f;
  return { ...f, folders: f.folders.map((x) => (x.id === id ? { ...x, name: clean } : x)) };
}

/** Deleting a folder NEVER deletes what is in it — the rows come back to the
 *  top level. Losing a starred page because a folder was tidied away is the
 *  one thing this feature must not do. */
export function removeFolder(f: Favourites, id: string): Favourites {
  return {
    ...f,
    folders: f.folders.filter((x) => x.id !== id),
    items: f.items.map((i) => (i.folder === id ? { ...i, folder: null } : i)),
  };
}

export function moveToFolder(f: Favourites, href: string, folder: string | null): Favourites {
  return { ...f, items: f.items.map((i) => (i.href === href ? { ...i, folder } : i)) };
}

export type Sort = "recent" | "name";

/**
 * WHAT IS IN THIS FOLDER — the one question a file manager asks.
 *
 * REPLACED `grouped()` (2026-09-12, same day). That returned every folder and
 * its contents at once, because the first build drew folders as accordions on
 * one page. Dan sent it back — *"refer to current file management systems in
 * the latest popular OS"* — and no OS does that: a folder is a PLACE you go
 * into, and the list only ever shows one level. So this takes the folder you
 * are IN (null = the top) and returns just that level.
 *
 * FOLDERS FIRST, then pages. Finder, Windows Explorer and iOS Files all do
 * this, and it is not decoration: folders are where you go, pages are where
 * you stop, and mixing them makes a learner read every row to find the way
 * down. Folders always sort by name; pages take the chosen sort.
 */
export function listing(f: Favourites, folderId: string | null, sort: Sort): {
  folders: FavFolder[];
  items: Fav[];
} {
  const folders = folderId === null
    ? [...f.folders].sort((a, b) => a.name.localeCompare(b.name))
    : [];
  const items = f.items.filter((i) => (i.folder ?? null) === folderId);
  items.sort(sort === "name"
    ? (a, b) => a.label.localeCompare(b.label)
    : (a, b) => b.at - a.at);
  return { folders, items };
}

/** How many pages a folder holds — the count on its row, the way a file
 *  manager prints « 12 items » rather than making you open it to find out. */
export function countIn(f: Favourites, folderId: string): number {
  return f.items.filter((i) => i.folder === folderId).length;
}

/** « today » · « yesterday » · « 4 days ago » · « 12 Sep ». Short, because it
 *  is the third thing on a line that already carries a name and a place. */
export function starredWhen(at: number, now: number): string {
  const days = Math.floor((startOfDay(now) - startOfDay(at)) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(at).toLocaleDateString("en-SG", { day: "numeric", month: "short" });
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
