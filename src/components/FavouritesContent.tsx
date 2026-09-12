"use client";

/**
 * THE FAVOURITES PAGE — Dan, 2026-09-12: *"there should be a proper
 * favourites page"*, after asking that a starred line be linked, carry where
 * it sits and when it was starred, be renameable, and that the page *"should
 * even allow them to organise into folders"*.
 *
 * ── WHAT A ROW SAYS, AND WHY ──────────────────────────────────────────────
 *     🎤  WorDrill              goal 22 · 3 days ago      ✎  ⋯  ✕
 * The name is the link — the whole point is getting back. The middle is the
 * two facts Dan asked for, set small and quiet because they are what you scan,
 * not what you read. The three controls only appear as icons with real
 * labels behind them, so the row stays a row.
 *
 * ── FOLDERS ARE `<details>` ───────────────────────────────────────────────
 * The collapse rule (31 Aug) says use native `<details>`/`<summary>`, and that
 * a closed section must say what is behind it — so every folder's summary
 * carries its count. Keyboard and screen-reader behaviour come free, and the
 * page survives with no JavaScript.
 *
 * THE LOOSE ROWS ARE NOT IN A FOLDER AND NOT COLLAPSED. A learner who has
 * never made a folder must see a plain list and no machinery at all: no
 * chevron, no "Unfiled" heading, nothing to learn. The folder controls appear
 * only once there is something to organise.
 *
 * ── NO CONTROL SPANS THE WHOLE WIDTH ──────────────────────────────────────
 * Dan's standing rule (5 Sep). Rows are links with content-sized buttons
 * beside them; the "New folder" control is content-sized; the rename box is a
 * text input, which that rule explicitly exempts.
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  MAX_FOLDERS,
  addFolder,
  grouped,
  loadFavourites,
  moveToFolder,
  removeFavourite,
  removeFolder,
  renameFavourite,
  renameFolder,
  saveFavourites,
  starredWhen,
  type Fav,
  type Favourites,
} from "@/lib/favourites";

const INK = "var(--cahier-ink)";
const SOFT = "var(--cahier-ink-soft)";
const LINE = "var(--cahier-line-strong)";
const PAPER = "var(--cahier-paper-raised)";

export default function FavouritesContent() {
  const [fav, setFav] = useState<Favourites | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [newFolder, setNewFolder] = useState(false);

  const reread = useCallback(() => setFav(loadFavourites()), []);

  useEffect(() => {
    // localStorage cannot be read during render on a static export; `now` is
    // read here too so the server and the first client render agree.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setFav(loadFavourites());
    setNow(Date.now());
    window.addEventListener("storage", reread);
    return () => window.removeEventListener("storage", reread);
  }, [reread]);

  if (!fav || now === null) {
    return <p className="py-6 pl-12 pr-3 text-sm" style={{ color: SOFT }}>Loading your favourites…</p>;
  }

  const commit = (next: Favourites) => setFav(saveFavourites(next));
  const groups = grouped(fav);
  const total = fav.items.length;

  if (total === 0) {
    return (
      <div className="py-6 pl-12 pr-3">
        <div className="mx-auto max-w-3xl">
        {/* An empty state that TEACHES THE GESTURE, because a star nobody
            knows about is a feature nobody has. It names the button and where
            it is, and nothing else. */}
        <p className="text-base font-extrabold" style={{ color: INK }}>Nothing starred yet.</p>
        <p className="mt-2 text-sm" style={{ color: SOFT }}>
          Tap <b style={{ color: INK }}>☆</b> at the top right of any page — a lesson, a game, the
          map — and it lands here.
        </p>
        </div>
      </div>
    );
  }

  const row = (it: Fav) => (
    // THE ROW WRAPS ON A PHONE, and does not shrink to fit. Measured at 390px
    // before this: the name, the ✎, the folder picker and the ✕ on one line
    // pushed the ✕ off the right edge — a control a learner could see half of
    // and never press. The name takes the whole first line under `sm`, the
    // controls sit under it, and at `sm` and up it is one line again. No
    // breakpoint-specific SIZE anywhere: `basis-full` is a proportion.
    <li key={it.href} className="flex flex-wrap items-center gap-2 border-b py-2" style={{ borderColor: "var(--cahier-line)" }}>
      {editing === it.href ? (
        <>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { commit(renameFavourite(fav, it.href, draft)); setEditing(null); }
              if (e.key === "Escape") setEditing(null);
            }}
            aria-label={`Rename ${it.label}`}
            placeholder={it.auto}
            className="min-h-10 min-w-0 flex-1 basis-full rounded-lg border-2 px-2.5 text-sm font-bold sm:basis-auto"
            style={{ borderColor: LINE, background: PAPER, color: INK }}
          />
          <button
            type="button"
            onClick={() => { commit(renameFavourite(fav, it.href, draft)); setEditing(null); }}
            className="min-h-10 shrink-0 rounded-lg border-2 px-2.5 text-xs font-extrabold"
            style={{ borderColor: LINE, background: PAPER, color: INK }}
          >
            Save
          </button>
        </>
      ) : (
        <>
          <Link href={it.href} className="flex min-w-0 flex-1 basis-full items-center gap-2 no-underline sm:basis-auto">
            <span aria-hidden className="shrink-0 text-base">{it.emoji}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-extrabold" style={{ color: INK }}>
              {it.label}
            </span>
            <span className="fluo-mono shrink-0 text-[10px] font-bold" style={{ color: SOFT }}>
              {[it.where, starredWhen(it.at, now)].filter(Boolean).join(" · ")}
            </span>
          </Link>
          {/* Rename — the ✎ Dan's own option sketch put at the end of a row. */}
          <button
            type="button"
            aria-label={`Rename ${it.label}`}
            title={`Rename « ${it.label} »`}
            onClick={() => { setEditing(it.href); setDraft(it.label); }}
            className="min-h-10 shrink-0 rounded-lg border-2 px-2 text-xs"
            style={{ borderColor: LINE, background: PAPER, color: INK }}
          >
            ✎
          </button>
          {fav.folders.length > 0 && (
            <select
              aria-label={`Move ${it.label} to a folder`}
              title="Move to a folder"
              value={it.folder ?? ""}
              onChange={(e) => commit(moveToFolder(fav, it.href, e.target.value || null))}
              className="min-h-10 shrink-0 rounded-lg border-2 px-1 text-xs font-bold"
              style={{ borderColor: LINE, background: PAPER, color: INK }}
            >
              <option value="">— no folder</option>
              {fav.folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          )}
          <button
            type="button"
            aria-label={`Remove ${it.label} from favourites`}
            title={`Remove « ${it.label} »`}
            onClick={() => commit(removeFavourite(fav, it.href))}
            className="min-h-10 shrink-0 rounded-lg border-2 px-2 text-xs"
            style={{ borderColor: LINE, background: PAPER, color: INK }}
          >
            ✕
          </button>
        </>
      )}
    </li>
  );

  return (
    /* THE COILS OVERLAP THE FRAME — every framed page, not just this one.
   Measured on the built app at 390px: the iframe starts at x=18 and the coil
   strip ends at x=56, so the first 38px of ANY framed document sits under the
   rings. globals.css hands that gutter out through
   `html[data-embed] .cahier-foolscap { padding-left: 3rem }`; this page does
   not wear `.cahier-foolscap` (that class also draws ruled paper, which is the
   second sheet the 11 Sep ruling forbids inside a frame), so it takes the same
   3rem itself. `pl-12` IS 3rem on Tailwind's rem scale — the same number, not
   a second one, and it grows with the learner's text like everything else. */
    <div className="py-4 pl-12 pr-3">
      <div className="mx-auto max-w-3xl">
      {groups.map((g) =>
        g.folder === null ? (
          g.items.length > 0 && <ul key="loose" className="list-none p-0">{g.items.map(row)}</ul>
        ) : (
          <details key={g.folder.id} className="mt-3">
            {/* A closed section says what is behind it — the collapse rule. */}
            <summary className="flex cursor-pointer items-center gap-2 rounded-lg border-2 px-2.5 py-2"
                     style={{ borderColor: LINE, background: PAPER }}>
              <span aria-hidden>📁</span>
              <span className="min-w-0 flex-1 truncate text-sm font-extrabold" style={{ color: INK }}>
                {g.folder.name}
              </span>
              <span className="fluo-mono shrink-0 text-[10px] font-black" style={{ color: SOFT }}>
                {g.items.length} {g.items.length === 1 ? "ITEM" : "ITEMS"}
              </span>
            </summary>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-1">
              <button
                type="button"
                onClick={() => {
                  const name = window.prompt("Rename this folder", g.folder!.name);
                  if (name !== null) commit(renameFolder(fav, g.folder!.id, name));
                }}
                className="min-h-10 rounded-lg border-2 px-2.5 text-xs font-bold"
                style={{ borderColor: LINE, background: PAPER, color: INK }}
              >
                ✎ Rename folder
              </button>
              {/* Deleting a folder never deletes what is in it — the rows come
                  back to the top of the page. The label says so, because a ✕
                  next to a count of 6 reads like losing 6 things. */}
              <button
                type="button"
                title="The pages inside come back to the top of this page — nothing is lost"
                onClick={() => commit(removeFolder(fav, g.folder!.id))}
                className="min-h-10 rounded-lg border-2 px-2.5 text-xs font-bold"
                style={{ borderColor: LINE, background: PAPER, color: INK }}
              >
                ✕ Delete folder (keeps the pages)
              </button>
            </div>
            {g.items.length > 0
              ? <ul className="list-none p-0">{g.items.map(row)}</ul>
              : <p className="px-1 py-2 text-xs" style={{ color: SOFT }}>Empty — move something in with the folder picker on a row.</p>}
          </details>
        ),
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {newFolder ? (
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
              className="min-h-10 rounded-lg border-2 px-2.5 text-sm font-bold"
              style={{ borderColor: LINE, background: PAPER, color: INK }}
            />
            <button
              type="button"
              onClick={() => { commit(addFolder(fav, draft, Date.now())); setNewFolder(false); setDraft(""); }}
              className="min-h-10 rounded-lg border-2 px-2.5 text-xs font-extrabold"
              style={{ borderColor: LINE, background: PAPER, color: INK }}
            >
              Add
            </button>
          </>
        ) : (
          fav.folders.length < MAX_FOLDERS && (
            <button
              type="button"
              onClick={() => { setNewFolder(true); setDraft(""); }}
              className="min-h-10 rounded-lg border-2 px-2.5 text-xs font-extrabold"
              style={{ borderColor: LINE, background: PAPER, color: INK }}
            >
              📁 New folder
            </button>
          )
        )}
        <span className="fluo-mono text-[10px] font-bold" style={{ color: SOFT }}>
          {total} STARRED
        </span>
      </div>
      </div>
    </div>
  );
}
