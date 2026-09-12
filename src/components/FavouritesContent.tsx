"use client";

/**
 * THE FAVOURITES PAGE — rebuilt as a FILE MANAGER.
 *
 * Dan, 2026-09-12, on the first build: *"this is not very user friendly,
 * please rethink and redo. refer to current file management systems in the
 * latest popular OS"*. He was right, and the first version's faults are worth
 * naming because they are the ones a form-shaped mind makes:
 *
 *   WAS                                 IS NOW (Finder · Windows 11 · iOS Files)
 *   every row carried ✎, a folder       one ⋯ per row, opening a menu
 *     dropdown and ✕ — three
 *     controls on every line, all
 *     shouting at once
 *   folders were accordions that        a folder is a PLACE you go into, with a
 *     unfolded in place, so two           breadcrumb back. One level on screen.
 *     folders meant two lists
 *     stacked on one page
 *   moving a page meant hunting the     ⋯ → Move to… , the way iOS Files does it
 *     right <select> on the right row
 *   no way to sort                      Recent / Name, like every file list
 *   folder actions were two buttons     they live in the folder's own ⋯
 *     wedged under the folder
 *
 * WHAT IS DELIBERATELY *NOT* COPIED FROM A DESKTOP OS: drag-and-drop to move,
 * and multi-select. Both are mouse-first — dragging is unreliable on a phone,
 * which is what a learner uses, and iOS Files itself leads with « Move to… »
 * for exactly that reason. Multi-select earns its place at hundreds of files;
 * the cap here is 200 and the realistic number is a dozen.
 *
 * ── WHAT SURVIVES FROM THE FIRST BUILD, because Dan asked for it by name ──
 * A row still links, still says where it sits and when it was starred, still
 * renames, and folders still exist. The MACHINERY changed, not the contents.
 *
 * ── THE RULES THIS PAGE IS HELD TO ────────────────────────────────────────
 * · No control spans the whole width (5 Sep) — rows are links; the toolbar's
 *   buttons are content-sized; the rename box is a text input, exempt.
 * · Nothing is nailed to a pixel (12 Sep) — a row's floor is `min-h-11`, a rem
 *   on Tailwind's scale, so it rises with the learner's text setting.
 * · The coil gutter is on an OUTER wrapper and the reading column inside it;
 *   put both on one element and the column shoves its own contents right.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import {
  MAX_FOLDERS,
  addFolder,
  countIn,
  listing,
  loadFavourites,
  moveToFolder,
  removeFavourite,
  removeFolder,
  renameFavourite,
  renameFolder,
  saveFavourites,
  starredWhen,
  type Fav,
  type FavFolder,
  type Favourites,
  type Sort,
} from "@/lib/favourites";

const INK = "var(--cahier-ink)";
const SOFT = "var(--cahier-ink-soft)";
const LINE = "var(--cahier-line-strong)";
const PAPER = "var(--cahier-paper-raised)";
const RULE = "var(--cahier-line)";

/** A row's key in the "which menu is open" state — a page is keyed by href, a
 *  folder by id, and the prefix keeps the two from ever colliding. */
const pageKey = (href: string) => `p:${href}`;
const folderKey = (id: string) => `f:${id}`;

export default function FavouritesContent() {
  const [fav, setFav] = useState<Favourites | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [at, setAt] = useState<string | null>(null); // the folder we are IN
  const [sort, setSort] = useState<Sort>("recent");
  const [menu, setMenu] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [newFolder, setNewFolder] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const reread = useCallback(() => setFav(loadFavourites()), []);

  useEffect(() => {
    // localStorage cannot be read during render on a static export.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setFav(loadFavourites());
    setNow(Date.now());
    window.addEventListener("storage", reread);
    return () => window.removeEventListener("storage", reread);
  }, [reread]);

  // A menu closes on a click elsewhere or on Escape — what every OS menu does,
  // and the first thing anyone tries to get out of one.
  useEffect(() => {
    if (!menu) return;
    const away = (e: MouseEvent) => {
      const t = e.target;
      if (t instanceof Element && t.closest("[data-menu]")) return;
      setMenu(null); setMoving(null);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenu(null); setMoving(null); } };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [menu]);

  if (!fav || now === null) {
    return <p className="py-6 pl-12 pr-3 text-sm" style={{ color: SOFT }}>Loading your favourites…</p>;
  }

  const commit = (next: Favourites) => { setFav(saveFavourites(next)); setMenu(null); setMoving(null); };
  // A folder deleted in another tab must not strand us inside it.
  const here = at ? fav.folders.find((f) => f.id === at) ?? null : null;
  const { folders, items } = listing(fav, here ? here.id : null, sort);
  const empty = folders.length === 0 && items.length === 0;

  const BTN = "min-h-11 shrink-0 rounded-lg border-2 px-2.5 text-xs font-extrabold";
  const CHROME = { borderColor: LINE, background: PAPER, color: INK };

  /** The menu a ⋯ opens: absolutely positioned against its row, like a context
   *  menu, so opening one never pushes the list around. */
  const Menu = ({ children }: { children: ReactNode }) => (
    <div
      data-menu
      role="menu"
      className="absolute right-0 top-full z-20 mt-1 flex min-w-44 flex-col overflow-hidden rounded-lg border-2 shadow-lg"
      style={{ borderColor: LINE, background: PAPER }}
    >
      {children}
    </div>
  );

  const MenuItem = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="min-h-11 px-3 text-left text-sm font-bold hover:opacity-70"
      style={{ color: INK, borderBottom: `1px solid ${RULE}` }}
    >
      {children}
    </button>
  );

  return (
    <div className="py-4 pl-12 pr-3" ref={rootRef}>
      <div className="mx-auto max-w-3xl">

        {/* ── THE PATH BAR. Drawn only INSIDE a folder: at the top there is
            nowhere to go back to, and a breadcrumb with one crumb is
            furniture. ── */}
        {here && (
          <nav aria-label="Where you are" className="mb-2 flex flex-wrap items-center gap-1.5 text-sm">
            <button
              type="button"
              onClick={() => { setAt(null); setMenu(null); }}
              className="min-h-11 rounded-lg px-2 font-extrabold underline"
              style={{ color: INK }}
            >
              ★ Favourites
            </button>
            <span aria-hidden style={{ color: SOFT }}>›</span>
            <span className="font-extrabold" style={{ color: INK }}>📁 {here.name}</span>
          </nav>
        )}

        {/* ── THE TOOLBAR: a new folder, and how the list is ordered. Both
            content-sized; neither wears the page's width. ── */}
        <div className="mb-2 flex flex-wrap items-center gap-2 border-b pb-2" style={{ borderColor: RULE }}>
          {!here && (newFolder ? (
            <>
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { commit(addFolder(fav, draft, Date.now())); setNewFolder(false); setDraft(""); }
                  if (e.key === "Escape") setNewFolder(false);
                }}
                aria-label="Name the new folder"
                placeholder="Folder name"
                className="min-h-11 min-w-0 flex-1 basis-full rounded-lg border-2 px-2.5 text-sm font-bold sm:basis-auto"
                style={CHROME}
              />
              <button type="button" className={BTN} style={CHROME}
                      onClick={() => { commit(addFolder(fav, draft, Date.now())); setNewFolder(false); setDraft(""); }}>
                Add
              </button>
            </>
          ) : (
            fav.folders.length < MAX_FOLDERS && (
              <button type="button" className={BTN} style={CHROME}
                      onClick={() => { setNewFolder(true); setDraft(""); }}>
                📁 New folder
              </button>
            )
          ))}

          {/* Two states, so it is a toggle and not a menu: a menu of two is a
              menu nobody opens twice. */}
          {items.length > 1 && (
            <button
              type="button"
              className={BTN}
              style={CHROME}
              aria-label={`Sorted by ${sort === "recent" ? "most recent" : "name"} — tap to change`}
              onClick={() => setSort(sort === "recent" ? "name" : "recent")}
            >
              ⇅ {sort === "recent" ? "Recent" : "Name"}
            </button>
          )}

          <span className="fluo-mono ml-auto text-[10px] font-bold" style={{ color: SOFT }}>
            {here ? `${items.length} ${items.length === 1 ? "ITEM" : "ITEMS"}` : `${fav.items.length} STARRED`}
          </span>
        </div>

        {empty && (
          <div className="py-6">
            {here ? (
              <p className="text-sm" style={{ color: SOFT }}>
                This folder is empty. Move something in with <b style={{ color: INK }}>⋯ → Move to…</b> on any row.
              </p>
            ) : (
              <>
                {/* The empty state TEACHES THE GESTURE — a star nobody knows
                    about is a feature nobody has. */}
                <p className="text-base font-extrabold" style={{ color: INK }}>Nothing starred yet.</p>
                <p className="mt-2 text-sm" style={{ color: SOFT }}>
                  Tap <b style={{ color: INK }}>☆</b> at the top right of any page — a lesson, a game,
                  the map — and it lands here.
                </p>
              </>
            )}
          </div>
        )}

        <ul className="list-none p-0">
          {/* ── FOLDERS FIRST, and a folder row is a way IN, not a disclosure.
              The count is on the row so nobody opens it to find out whether it
              is worth opening. ── */}
          {folders.map((f: FavFolder) => (
            <li key={f.id} className="relative flex items-center gap-2 border-b" style={{ borderColor: RULE }}>
              <button
                type="button"
                onClick={() => { setAt(f.id); setMenu(null); }}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-2 py-2 text-left"
              >
                <span aria-hidden className="shrink-0 text-base">📁</span>
                <span className="min-w-0 flex-1 truncate text-sm font-extrabold" style={{ color: INK }}>{f.name}</span>
                <span className="fluo-mono shrink-0 text-[10px] font-bold" style={{ color: SOFT }}>
                  {countIn(fav, f.id)} {countIn(fav, f.id) === 1 ? "item" : "items"}
                </span>
                <span aria-hidden className="shrink-0 text-sm" style={{ color: SOFT }}>›</span>
              </button>
              <button
                type="button"
                data-menu
                aria-label={`Actions for the folder ${f.name}`}
                aria-haspopup="menu"
                onClick={() => setMenu(menu === folderKey(f.id) ? null : folderKey(f.id))}
                className="min-h-11 shrink-0 rounded-lg px-2 text-sm font-black"
                style={{ color: SOFT }}
              >
                ⋯
              </button>
              {menu === folderKey(f.id) && (
                <Menu>
                  <MenuItem onClick={() => {
                    const name = window.prompt("Rename this folder", f.name);
                    if (name !== null) commit(renameFolder(fav, f.id, name));
                  }}>✎ Rename</MenuItem>
                  {/* The label carries the promise, because a 🗑 beside « 6
                      items » reads like losing six things. */}
                  <MenuItem onClick={() => commit(removeFolder(fav, f.id))}>
                    🗑 Delete folder — keeps the pages
                  </MenuItem>
                </Menu>
              )}
            </li>
          ))}

          {/* ── PAGES. The row IS the link; everything else is behind the ⋯. ── */}
          {items.map((it: Fav) => (
            <li key={it.href} className="relative flex items-center gap-2 border-b" style={{ borderColor: RULE }}>
              {renaming === it.href ? (
                <>
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { commit(renameFavourite(fav, it.href, draft)); setRenaming(null); }
                      if (e.key === "Escape") setRenaming(null);
                    }}
                    aria-label={`Rename ${it.label}`}
                    placeholder={it.auto}
                    className="my-1 min-h-11 min-w-0 flex-1 rounded-lg border-2 px-2.5 text-sm font-bold"
                    style={CHROME}
                  />
                  <button type="button" className={BTN} style={CHROME}
                          onClick={() => { commit(renameFavourite(fav, it.href, draft)); setRenaming(null); }}>
                    Save
                  </button>
                </>
              ) : (
                <>
                  <Link href={it.href} className="flex min-h-11 min-w-0 flex-1 items-center gap-2 py-2 no-underline">
                    <span aria-hidden className="shrink-0 text-base">{it.emoji}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-extrabold" style={{ color: INK }}>
                      {it.label}
                    </span>
                    <span className="fluo-mono shrink-0 text-[10px] font-bold" style={{ color: SOFT }}>
                      {[it.where, starredWhen(it.at, now)].filter(Boolean).join(" · ")}
                    </span>
                  </Link>
                  <button
                    type="button"
                    data-menu
                    aria-label={`Actions for ${it.label}`}
                    aria-haspopup="menu"
                    onClick={() => { setMenu(menu === pageKey(it.href) ? null : pageKey(it.href)); setMoving(null); }}
                    className="min-h-11 shrink-0 rounded-lg px-2 text-sm font-black"
                    style={{ color: SOFT }}
                  >
                    ⋯
                  </button>
                  {menu === pageKey(it.href) && (
                    <Menu>
                      {moving === it.href ? (
                        <>
                          {/* « Move to… » opens its destinations in place — the
                              iOS Files shape. With a cap of 20 folders, a flat
                              list IS the whole picker. */}
                          <span className="fluo-mono px-3 pt-2 text-[10px] font-black" style={{ color: SOFT }}>
                            MOVE TO
                          </span>
                          {it.folder !== null && (
                            <MenuItem onClick={() => commit(moveToFolder(fav, it.href, null))}>
                              ★ Favourites (top)
                            </MenuItem>
                          )}
                          {fav.folders.filter((f) => f.id !== it.folder).map((f) => (
                            <MenuItem key={f.id} onClick={() => commit(moveToFolder(fav, it.href, f.id))}>
                              📁 {f.name}
                            </MenuItem>
                          ))}
                          {fav.folders.filter((f) => f.id !== it.folder).length === 0 && it.folder === null && (
                            <span className="px-3 py-2 text-xs" style={{ color: SOFT }}>
                              No folders yet — make one first.
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <MenuItem onClick={() => { setRenaming(it.href); setDraft(it.label); setMenu(null); }}>
                            ✎ Rename
                          </MenuItem>
                          <MenuItem onClick={() => setMoving(it.href)}>📁 Move to…</MenuItem>
                          <MenuItem onClick={() => commit(removeFavourite(fav, it.href))}>🗑 Remove</MenuItem>
                        </>
                      )}
                    </Menu>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
