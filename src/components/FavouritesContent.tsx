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
 * ── DRAG AND DROP (Dan, same day: *"add drag and drop"*) ─────────────────
 * Drag a page onto a folder to file it; inside a folder, drag it onto the
 * « ★ Favourites » crumb to bring it back out. Built on POINTER events, not
 * HTML5 `draggable`, and that is the whole reason it works on a phone: the
 * HTML5 drag API does not fire for touch at all, so a `draggable` row is a
 * desktop-only feature wearing a cross-platform name.
 *
 * THE GESTURE IS DIFFERENT PER DEVICE, because the devices are:
 *
 *   mouse   press and move ~6px           a mouse cannot scroll by dragging,
 *                                         so movement can only mean a drag
 *   finger  press and HOLD ~350ms, then   a finger that moves first is
 *           move                          SCROLLING, and stealing that would
 *                                         make the list unscrollable
 *
 * That long-press-to-lift is the iOS Files / Photos gesture, and it is why a
 * plain tap still follows the link.
 *
 * « MOVE TO… » STAYS, and is not a leftover. A drag cannot be done from a
 * keyboard and is hard with a tremor or a trackpad; the menu is the accessible
 * path to the same move. iOS Files ships both for the same reason.
 *
 * ── MULTI-SELECT (Dan, same day: *"add multi-select too"*) ───────────────
 * Two ways in, because the two devices have different hands:
 *
 *   finger  the « ☑︎ Select » button turns the list into a picker: rows stop
 *           navigating and start ticking, and « Done » turns it back. That is
 *           iOS Files, and it is the ONLY workable way on touch — a tap has to
 *           keep meaning "open this", or the page loses its primary action.
 *   mouse   ⌘/Ctrl-click toggles one, Shift-click takes the range from the
 *           last one touched. Both enter Select mode on the spot, the Finder
 *           and Explorer behaviour people try without being told.
 *
 * A SELECTION DRAGS AS ONE. Pick up any row that is ticked and the whole
 * selection comes with it — Finder does this, and a multi-select that still
 * moved one row at a time would be a tick-box with nothing behind it.
 *
 * FOLDERS ARE NOT SELECTABLE. With one level of nesting there is nowhere to
 * move a folder TO, so a ticked folder could only be deleted — and mixing "a
 * folder I am deleting" into a set of "pages I am filing" is how a learner
 * loses something they meant to keep.
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
  moveMany,
  moveToFolder,
  removeFavourite,
  removeMany,
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

/** The menu a ⋯ opens: absolutely positioned against its row, like a context
 *  menu, so opening one never pushes the list around. */
function Menu({ children, align = "right" }: { children: ReactNode; align?: "left" | "right" }) {
  return (
    <div
      data-menu
      role="menu"
      className={`absolute top-full z-20 mt-1 flex min-w-44 flex-col overflow-hidden rounded-lg border-2 shadow-lg ${
        // A row's ⋯ is at the right edge, so its menu hangs from the right. The
        // toolbar's « Move to… » is at the LEFT, and a right-hung menu there
        // lands on top of « Select all » and « Done » — seen at 1440px, where
        // there is room for the buttons to sit apart.
        align === "left" ? "left-0" : "right-0"
      }`}
      style={{ borderColor: LINE, background: PAPER }}
    >
      {children}
    </div>
  );
}

function MenuItem({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      // A folder name that wraps turns a menu row into two, and the tick of
      // one row into the tick of half of another. Names do not wrap.
      className="min-h-11 whitespace-nowrap px-3 text-left text-sm font-bold hover:opacity-70"
      style={{ color: INK, borderBottom: `1px solid ${RULE}` }}
    >
      {children}
    </button>
  );
}

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
  /** Multi-select. `sel` holds hrefs; `anchor` is the last row touched, which
   *  is what a Shift-click measures its range from. */
  const [selMode, setSelMode] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const [anchor, setAnchor] = useState<string | null>(null);
  /** The page being dragged, and where the pointer is, so the ghost can follow. */
  const [drag, setDrag] = useState<{ href: string; label: string; emoji: string; x: number; y: number } | null>(null);
  /** The drop target under the pointer: a folder id, or "root" for the crumb. */
  const [over, setOver] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  /** Set the moment a drag actually moves, and read by the row's click — a
   *  drop must never also follow the link underneath it. */
  const didDrag = useRef(false);

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

  /** What is under the pointer, asked of the document rather than tracked with
   *  enter/leave handlers — one question at drop time beats N listeners, and it
   *  is the only approach that works the same for a finger and a mouse. */
  const dropAt = (x: number, y: number): string | null => {
    const el = document.elementFromPoint(x, y);
    const hit = el instanceof Element ? el.closest("[data-drop]") : null;
    return hit ? hit.getAttribute("data-drop") : null;
  };

  if (!fav || now === null) {
    return <p className="py-6 pl-12 pr-3 text-sm" style={{ color: SOFT }}>Loading your favourites…</p>;
  }

  const commit = (next: Favourites) => { setFav(saveFavourites(next)); setMenu(null); setMoving(null); };
  // A folder deleted in another tab must not strand us inside it.
  const here = at ? fav.folders.find((f) => f.id === at) ?? null : null;
  const { folders, items } = listing(fav, here ? here.id : null, sort);
  const empty = folders.length === 0 && items.length === 0;

  /**
   * ONE PRESS HANDLER FOR MOUSE, FINGER AND PEN.
   *
   * Listeners go on the DOCUMENT rather than the row, because a drag that
   * leaves the row it started on must keep tracking — and it always does: the
   * whole point is to land somewhere else.
   */
  const pressStart = (e: React.PointerEvent, it: Fav) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target instanceof Element && e.target.closest("[data-menu]")) return;
    const sx = e.clientX, sy = e.clientY;
    let started = false;
    let timer: number | null = null;
    didDrag.current = false;

    /* STOPPING THE PAGE SCROLLING UNDER A DRAG TOOK THREE GOES, and the two
       that failed are worth keeping, because both LOOK right:

         1  `touch-action: none` on the ROWS only — a finger that left a row
            onto the breadcrumb handed the gesture back to the browser, which
            fired `pointercancel`. A page could go INTO a folder and never back
            OUT of one.
         2  `touch-action: none` on the whole page, applied when the drag
            starts — too late. The browser decides at TOUCHSTART what a gesture
            is; changing the property mid-gesture does not take it back, and
            this broke the INTO case that had been working.

       What actually works is preventing the TOUCHMOVE itself. `pointermove`'s
       preventDefault does not stop scrolling — only touchmove's does — and it
       has to be a native non-passive listener, because React's are passive. */
    const stopScroll = (ev: TouchEvent) => ev.preventDefault();

    const begin = (x: number, y: number) => {
      started = true;
      document.addEventListener("touchmove", stopScroll, { passive: false });
      setDrag({ href: it.href, label: it.label, emoji: it.emoji, x, y });
      setOver(dropAt(x, y));
    };

    const move = (ev: PointerEvent) => {
      const dx = Math.abs(ev.clientX - sx), dy = Math.abs(ev.clientY - sy);
      if (!started) {
        if (ev.pointerType === "mouse") {
          // A mouse cannot scroll by dragging, so movement can only be a drag.
          if (dx > 6 || dy > 6) { if (timer) clearTimeout(timer); begin(ev.clientX, ev.clientY); }
        } else if (dx > 10 || dy > 10) {
          // A finger that moves before the hold is SCROLLING. Let it go.
          end();
        }
        return;
      }
      // Non-passive, so this actually stops the page scrolling under the drag.
      ev.preventDefault();
      didDrag.current = true;
      setDrag((d) => (d ? { ...d, x: ev.clientX, y: ev.clientY } : d));
      setOver(dropAt(ev.clientX, ev.clientY));
    };

    const up = (ev: PointerEvent) => {
      if (started) {
        const target = dropAt(ev.clientX, ev.clientY);
        if (target !== null) {
          const dest = target === "root" ? null : target;
          // A DRAG THAT STARTS ON A TICKED ROW CARRIES THE WHOLE SELECTION —
          // Finder's behaviour, and the difference between a multi-select and
          // a row of tick-boxes with nothing behind them.
          const carried = sel.includes(it.href) ? sel : [it.href];
          const changed = fav.items.filter((i) => carried.includes(i.href) && (i.folder ?? null) !== dest);
          // Dropping pages where they already live is not a move, and writing
          // it anyway would bump nothing but the save.
          if (changed.length) { commit(moveMany(fav, changed.map((i) => i.href), dest)); exitSelect(); }
        }
      }
      end();
    };

    const end = () => {
      if (timer) { clearTimeout(timer); timer = null; }
      started = false;
      setDrag(null); setOver(null);
      document.removeEventListener("touchmove", stopScroll);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", end);
    };

    // The hold that lifts a row on a touch screen — the iOS Files gesture.
    timer = window.setTimeout(() => begin(sx, sy), 350);
    document.addEventListener("pointermove", move, { passive: false });
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", end);
  };

  const exitSelect = () => { setSelMode(false); setSel([]); setAnchor(null); };

  /** Toggle one row. `range` is a Shift-click: everything between the last row
   *  touched and this one, in the order the list is CURRENTLY sorted — a range
   *  measured against anything else selects rows the learner cannot see. */
  const pick = (href: string, range: boolean) => {
    setSelMode(true);
    if (range && anchor) {
      const order = items.map((i) => i.href);
      const a = order.indexOf(anchor), b = order.indexOf(href);
      if (a !== -1 && b !== -1) {
        const span = order.slice(Math.min(a, b), Math.max(a, b) + 1);
        setSel((cur) => Array.from(new Set([...cur, ...span])));
        return;
      }
    }
    setAnchor(href);
    setSel((cur) => (cur.includes(href) ? cur.filter((h) => h !== href) : [...cur, href]));
  };

  const BTN = "min-h-11 shrink-0 rounded-lg border-2 px-2.5 text-xs font-extrabold";
  const CHROME = { borderColor: LINE, background: PAPER, color: INK };

  return (
    <div
      className="py-4 pl-12 pr-3"
      ref={rootRef}
      /* THE WHOLE PAGE REFUSES TO PAN WHILE A DRAG IS UP, and it has to be the
         whole page rather than the rows. Measured: with `touch-action: none`
         on the rows only, a finger that left a row onto the breadcrumb handed
         the gesture back to the browser, which fired `pointercancel` and
         killed the drag mid-air — so a page could be dragged INTO a folder
         (folders are rows) and never back OUT of one (the crumb is not). */
      style={{ touchAction: drag ? "none" : undefined }}
    >
      <div className="mx-auto max-w-3xl">

        {/* ── THE PATH BAR. Drawn only INSIDE a folder: at the top there is
            nowhere to go back to, and a breadcrumb with one crumb is
            furniture. ── */}
        {here && (
          <nav aria-label="Where you are" className="mb-2 flex flex-wrap items-center gap-1.5 text-sm">
            <button
              type="button"
              data-drop="root"
              onClick={() => { setAt(null); setMenu(null); }}
              className="min-h-11 rounded-lg px-2 font-extrabold underline"
              style={over === "root"
                ? { color: INK, background: "var(--fam-user-wash)", boxShadow: "inset 0 0 0 2px var(--fam-user-ink)" }
                : { color: INK }}
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
          {/* ── SELECTION BAR. It REPLACES the toolbar rather than joining it:
              while you are picking, "new folder" and the sort are not what the
              bar is for, and iOS Files swaps the bar for exactly this reason.
              Every button is content-sized; none wears the page's width. ── */}
          {selMode ? (
            <>
              <span className="fluo-mono text-[11px] font-black" style={{ color: INK }}>
                {sel.length} SELECTED
              </span>
              <span className="relative">
                <button
                  type="button"
                  className={BTN}
                  style={CHROME}
                  disabled={sel.length === 0}
                  onClick={() => setMenu(menu === "bulk" ? null : "bulk")}
                  data-menu
                  aria-haspopup="menu"
                >
                  📁 Move to…
                </button>
                {menu === "bulk" && (
                  <Menu align="left">
                    <span className="fluo-mono whitespace-nowrap px-3 pt-2 text-[10px] font-black" style={{ color: SOFT }}>
                      MOVE {sel.length} TO
                    </span>
                    {here && (
                      <MenuItem onClick={() => { commit(moveMany(fav, sel, null)); exitSelect(); }}>
                        ★ Favourites (top)
                      </MenuItem>
                    )}
                    {fav.folders.filter((f) => f.id !== (here ? here.id : null)).map((f) => (
                      <MenuItem key={f.id} onClick={() => { commit(moveMany(fav, sel, f.id)); exitSelect(); }}>
                        📁 {f.name}
                      </MenuItem>
                    ))}
                    {fav.folders.length === 0 && (
                      <span className="whitespace-nowrap px-3 py-2 text-xs" style={{ color: SOFT }}>
                        No folders yet — make one first.
                      </span>
                    )}
                  </Menu>
                )}
              </span>
              <button
                type="button"
                className={BTN}
                style={CHROME}
                disabled={sel.length === 0}
                onClick={() => { commit(removeMany(fav, sel)); exitSelect(); }}
              >
                🗑 Remove
              </button>
              <button
                type="button"
                className={BTN}
                style={CHROME}
                onClick={() => setSel(sel.length === items.length ? [] : items.map((i) => i.href))}
              >
                {sel.length === items.length && items.length > 0 ? "Clear" : "Select all"}
              </button>
              <button type="button" className={BTN} style={CHROME} onClick={exitSelect}>Done</button>
            </>
          ) : (
          <>
          {items.length > 0 && (
            <button type="button" className={BTN} style={CHROME} onClick={() => setSelMode(true)}>
              ☑︎ Select
            </button>
          )}
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
          </>
          )}
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
                data-drop={f.id}
                onClick={() => { setAt(f.id); setMenu(null); }}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg py-2 text-left"
                style={over === f.id
                  // The target a drop would land in, said in the family's own
                  // ink rather than a new colour invented for dragging.
                  ? { background: "var(--fam-user-wash)", boxShadow: "inset 0 0 0 2px var(--fam-user-ink)" }
                  : undefined}
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
            <li
              key={it.href}
              className="relative flex items-center gap-2 border-b"
              style={{
                borderColor: RULE,
                // pan-y, ALWAYS: a swipe that is not a drag must still scroll
                // the list. Flipping this to `none` when a drag starts is the
                // fix that did not work — see the note in `begin`.
                touchAction: "pan-y",
                // The row it came from fades while it is in the air — the
                // "this is the thing you are carrying" cue every OS gives.
                opacity: drag?.href === it.href ? 0.4 : 1,
                background: selMode && sel.includes(it.href) ? "var(--fam-user-wash)" : undefined,
              }}
            >
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
                  <Link
                    href={it.href}
                    aria-checked={selMode ? sel.includes(it.href) : undefined}
                    role={selMode ? "checkbox" : undefined}
                    onPointerDown={(e) => pressStart(e, it)}
                    onClickCapture={(e) => {
                      // A drop lands on the row it started from as a CLICK. If
                      // the pointer moved, that click is the tail of a drag and
                      // must not navigate — found the first time a drop opened
                      // the page it was meant to file.
                      if (didDrag.current) { e.preventDefault(); e.stopPropagation(); didDrag.current = false; return; }
                      // IN SELECT MODE A ROW TICKS INSTEAD OF OPENING; outside
                      // it, ⌘/Ctrl-click and Shift-click enter select mode on
                      // the spot, which is what a mouse user tries unprompted.
                      if (selMode || e.metaKey || e.ctrlKey || e.shiftKey) {
                        e.preventDefault(); e.stopPropagation();
                        pick(it.href, e.shiftKey);
                      }
                    }}
                    onDragStart={(e) => e.preventDefault()}
                    className="flex min-h-11 min-w-0 flex-1 cursor-grab select-none items-center gap-2 py-2 no-underline active:cursor-grabbing"
                  >
                    {selMode && (
                      // A drawn box, not an <input>: the row is the control, and
                      // a real checkbox inside a link takes the tap for itself.
                      <span
                        aria-hidden
                        className="grid size-5 shrink-0 place-items-center rounded border-2 text-[11px] font-black"
                        style={sel.includes(it.href)
                          ? { borderColor: "var(--fam-user-ink)", background: "var(--fam-user-ink)", color: PAPER }
                          : { borderColor: LINE, background: PAPER, color: "transparent" }}
                      >
                        ✓
                      </span>
                    )}
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

      {/* THE GHOST — what you are carrying. `fixed` is measured against this
          FRAME's viewport, and the pointer coordinates are too, so the two
          agree even though the page runs inside an iframe. */}
      {drag && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-lg border-2 px-2.5 py-1.5 text-sm font-extrabold shadow-lg"
          style={{ left: drag.x + 14, top: drag.y + 14, borderColor: LINE, background: PAPER, color: INK }}
        >
          <span aria-hidden>{drag.emoji}</span>
          <span className="max-w-52 truncate">
            {sel.includes(drag.href) && sel.length > 1 ? `${sel.length} pages` : drag.label}
          </span>
        </div>
      )}
    </div>
  );
}
