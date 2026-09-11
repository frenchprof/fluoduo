"use client";

/**
 * The pop-up that stands in for a hub gallery (Dan, 2026-09-09, on the new
 * 7-family grid ☰ menu: *"instead of leading to a hub page, each of these
 * will go directly to the relevant page (if there is only one) OR a pop-up
 * will ask if they wish to visit the activity for the current Goal
 * (SIO)"*). Seven activities — MémoiRecall, GramMarathon, VocabulaRain,
 * LexicaLocker, WorDrill, ÉcouTexte, ComposeIt — used to open a deck/unit
 * PICKER of their own; this is the one picker that replaces all seven, so
 * the app has one hub-substitute instead of seven.
 *
 * THE SLIDER, NOT A LIST OF 50 (Dan: "a SIO-slider selector (no words)").
 * It opens already pointing at the learner's current stop — the same
 * number `loadBookmark()`/`nextGoalNumber()` compute for the ☰'s own 🎯
 * badge (SiteTopBar) and Home's well — and can be dragged anywhere from
 * 1 to 50. Confirm hands off to the caller, which resolves stop → deck via
 * `SIOS[stop-1].collectionId`.
 *
 * THE NUMBER IS ALSO TAPPABLE (Dan, same thread: "we must be able to tap
 * on that number to edit it, so it would be good if it could appear as a
 * depressed space"). It sits in a `.neo-well` — the app's existing "value
 * pressed INTO the paper" style (Home's stop well, the map's zoom readout)
 * — and is a real `<input>` under the display digits, so typing "37" and
 * the slider both drive the same number.
 *
 * BUTTONS ARE THE APP'S STANDARD ONES (Dan, 2026-09-09: "can you make the
 * buttons like the others we have on the website" — the first `.neo-key`
 * pass didn't match anything else in the app). Confirm is `.fluo-btn`, the
 * same chunky press-button used by BetaNotice's "Got it!" and
 * FeedbackButton's submit. The NumBus/NumBourse tiles toggle between
 * `.fluo-btn-ghost` (unselected, outline) and `.fluo-btn` (selected,
 * filled) — the app had no existing selectable-tile pattern to copy, so
 * this pairs its two existing button variants rather than inventing a
 * third style.
 *
 * DESKTOP: A CENTRED, CONTENT-SIZED CARD (Dan: "the pop up must only
 * occupy the middle of the page, just sufficient space for the slider and
 * field and OK button") — not `BottomSheet`, which pins to the bottom edge
 * even on desktop. This is its own small modal for exactly that reason:
 * centred at every width, sized to its content, never the full sheet
 * treatment a gallery-replacement popup does not need.
 *
 * ÉCOUTEXTE IS THE ONE GAP. Its content is picked by unit/topic, not by a
 * per-SIO deck route — there is no `/practice/ecoutexte/<id>` to send the
 * slider's answer to. Its Confirm still opens the slider (Dan named it as
 * one of the seven) but always lands on the topic picker itself
 * (`/practice/ecoutexte`); the slider's number does not yet steer it.
 * Flagged here rather than silently faked.
 */
import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { SIOS } from "@/content/sios";
import { playableStops, stopHref, type StopActivityKey } from "@/lib/activityStops";
import { loadBookmark, nextGoalNumber } from "@/lib/continuer";
import { loadProgress } from "@/lib/progress";

const TOTAL = SIOS.length; // 50

/** The learner's current stop, the same computation SiteTopBar's 🎯 badge
 *  and Home's well use — the slider's opening position. */
function currentStop(): number {
  const n = nextGoalNumber(loadProgress(), loadBookmark());
  return n && n >= 1 && n <= TOTAL ? n : 1;
}

/* clampStop retired with the slider (11 Sep). It kept a dragged or typed
   number inside 1-50 — a job that only exists when any number in that range is
   a legal answer. The pad offers a fixed set of goals instead, so there is no
   number to clamp: what is not offered cannot be chosen. */

/** Modal shell shared by both pickers below — centred and content-sized at
 *  every width (see the file header for why this is not BottomSheet).
 *
 *  PORTALLED TO <body>, same as ToolSummon and BottomSheet — found by
 *  driving the built app: rendered inline inside SiteTopBar, the modal's
 *  `fixed` centred itself against the wrong box (an ancestor was breaking
 *  the fixed-positioning containing block) and opened scrolled half off
 *  the top of the screen. Portalling to `<body>` is what the other two
 *  overlays in this app already do to avoid exactly that. */
function PickerModal({
  title,
  onClose,
  children,
}: {
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-[color:var(--cahier-ink)]/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="game-sheet w-full max-w-xs rounded-2xl border-2 border-[color:var(--cahier-line-strong)] bg-[color:var(--cahier-paper-raised)] p-5 shadow-[var(--shadow-card)]"
      >
        <div className="mb-4 flex items-center gap-2">
          <p className="min-w-0 flex-1 text-sm font-black text-[color:var(--cahier-ink)]">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg font-black text-[color:var(--cahier-ink)]/50 transition hover:bg-[color:var(--cahier-ink)]/10 hover:text-[color:var(--cahier-ink)]"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/**
 * THE STOP CHOOSER — a pad of the goals this activity can actually play,
 * with a field to find one by name.
 *
 * IT WAS A 1-TO-50 SLIDER, and Dan, 11 Sep: *"Many activities simply do not
 * exist for all the lessons. so replace the slider with choice of stops to
 * pick from"*, then, plainly: ***"just don't allow anyone to land on 'there
 * is nothing here'"***.
 *
 * WHAT THE SLIDER DID. It offered 1-50 for every activity and built a URL from
 * `SIOS[stop-1].collectionId` with no gate at all. Driven on the built export,
 * across the six activities that ask this question, it offered 300 choices and
 * 97 of them went nowhere — and in two different ways, which is why counting
 * 404s alone understates it:
 *
 *     ComposeIt      12/50 playable   the rest 404 — it has café banks, not goals
 *     VocabulaRain   33/50            its sets live in their own registry
 *     GramMarathon   27/50   <- the page EXISTS for all fifty and opens EMPTY
 *     LexicaLocker   31/50   <- likewise
 *     MémoiRecall    50/50
 *     WorDrill       50/50
 *
 * The two marked ones are the dangerous shape: nothing 404s, the activity just
 * has nothing to show. That is `lib/collections/gapSentence.ts`'s recurring bug
 * and it is why the gate here is `lib/activityStops.ts`, which asks each
 * activity's OWN source — never a second opinion re-derived in the UI.
 *
 * WHY A PAD AND A FIELD, both (Dan, shown three candidates: *"can we have
 * multiple of these"*, then picking the combination). The pad shows every
 * playable goal at once and costs one tap; the field is for when you know the
 * word and not the number. One question, two ways to answer it. The gaps in
 * the pad are deliberate — they say, at a glance, that this activity has
 * nothing in that part of the course, which a filtered list would hide.
 *
 * The chosen goal names itself in the `.neo-well` underneath, so the pad stays
 * numeric (the map numbers the stops; the number IS the name a learner
 * carries) without the learner having to guess what 23 is.
 */
export function GoalPadPicker({
  emoji,
  name,
  stops,
  onConfirm,
  onClose,
}: {
  emoji: string;
  name: string;
  /** The goals this activity can play — from `playableStops()`, never 1-50. */
  stops: number[];
  onConfirm: (stop: number) => void;
  onClose: () => void;
}) {
  const live = useMemo(() => new Set(stops), [stops]);
  // Open on the learner's own stop when this activity can play it, else the
  // nearest it can — never on a number that goes nowhere.
  const [stop, setStop] = useState<number>(() => {
    const want = currentStop();
    if (live.has(want)) return want;
    return stops.reduce((b, n) => (Math.abs(n - want) < Math.abs(b - want) ? n : b), stops[0] ?? 1);
  });
  const [q, setQ] = useState("");
  const fieldId = useId();

  const chosen = SIOS[stop - 1];
  const query = q.trim().toLowerCase();
  const hits = query
    ? SIOS.filter((s) => live.has(s.num) && (s.topic.toLowerCase().includes(query) || String(s.num) === query))
    : [];

  if (!stops.length) {
    return (
      <PickerModal title={<><span aria-hidden>{emoji}</span> {name}</>} onClose={onClose}>
        <p className="px-2 py-4 text-center text-sm text-[color:var(--cahier-ink-soft)]">
          Nothing to play here yet.
        </p>
      </PickerModal>
    );
  }

  return (
    <PickerModal title={<><span aria-hidden>{emoji}</span> {name} — which goal?</>} onClose={onClose}>
      {/* THE FIELD. Not full width — the no-full-width-control rule — and it
          narrows to the playable goals only, so a search cannot reach a goal
          the pad refuses to offer. */}
      <label htmlFor={fieldId} className="sr-only">Find a goal by name or number</label>
      <input
        id={fieldId}
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="find a goal…"
        className="neo-well mx-auto mb-3 block w-[80%] rounded-lg px-3 py-1.5 text-sm text-[color:var(--cahier-ink)] focus:outline-none"
      />

      {query ? (
        <div className="mb-4 max-h-[190px] overflow-auto">
          {hits.length ? hits.map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => { setStop(s.num); setQ(""); }}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${s.num === stop ? "neo-well" : ""}`}
            >
              <span className="fluo-mono w-6 shrink-0 text-xs font-bold text-[color:var(--sio-vocab)] [font-variant-numeric:tabular-nums]">{s.num}</span>
              <span className="text-[color:var(--cahier-ink)]">{s.topic}</span>
            </button>
          )) : (
            <p className="px-2 py-3 text-center text-xs text-[color:var(--cahier-ink-faint)]">
              nothing here matches — {name} plays {stops.length} of the {TOTAL}
            </p>
          )}
        </div>
      ) : (
        /* THE PAD. Five rows of ten, in the map's own order, so the shape of
           the course is recognisable. A goal this activity cannot play is a
           gap, not a disabled button: there is nothing to press and nothing
           to explain. */
        <div className="mb-3 space-y-1.5">
          {[0, 1, 2, 3, 4].map((u) => (
            <div key={u} className="flex items-center gap-2">
              <span className="fluo-mono w-[52px] shrink-0 text-[10px] font-bold uppercase text-[color:var(--cahier-ink-faint)]">
                Unité {u}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SIOS.filter((s) => s.unit === u).map((s) =>
                  live.has(s.num) ? (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => setStop(s.num)}
                      aria-label={`Goal ${s.num} — ${s.topic}`}
                      aria-pressed={s.num === stop}
                      className={`${s.num === stop ? "neo-well" : "neo-key"} fluo-mono h-8 w-8 rounded-lg text-[13px] font-bold [font-variant-numeric:tabular-nums]`}
                      style={s.num === stop ? { background: "var(--sio-vocab)", color: "white" } : undefined}
                    >
                      {s.num}
                    </button>
                  ) : (
                    <span key={s.num} aria-hidden className="h-8 w-8 rounded-lg opacity-25" style={{ background: "var(--cahier-line)" }} />
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* The chosen goal says what it is — the pad stays numeric, nobody has
          to guess what 23 was. */}
      <div className="neo-well mb-4 rounded-lg px-3 py-2 text-sm text-[color:var(--cahier-ink)]">
        <b className="fluo-mono [font-variant-numeric:tabular-nums]">{stop}</b>
        {chosen ? <> · {chosen.topic}</> : null}
        {stop === currentStop() ? <span className="ml-1 text-xs text-[color:var(--cahier-ink-faint)]">· your current stop</span> : null}
      </div>

      <div className="flex justify-center">
        <button type="button" onClick={() => onConfirm(stop)} className="fluo-btn px-8 py-2.5 text-base">
          Confirm
        </button>
      </div>
    </PickerModal>
  );
}

/** The simpler two-tile picker, for the one non-SIO choice — NumBus or
 *  NumBourse (Dan: "it will just ask to pick between... --> Confirm"). */
export function TwoChoicePicker({
  title,
  options,
  onConfirm,
  onClose,
}: {
  title: React.ReactNode;
  options: { key: string; emoji: string; name: string }[];
  onConfirm: (key: string) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState(options[0]?.key ?? "");
  return (
    <PickerModal title={title} onClose={onClose}>
      <div className="mb-5 flex gap-3">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => setPicked(o.key)}
            aria-pressed={picked === o.key}
            className={`flex flex-1 flex-col items-center gap-1.5 px-2 py-4 ${picked === o.key ? "fluo-btn" : "fluo-btn-ghost"}`}
          >
            <span aria-hidden className="text-3xl leading-none">{o.emoji}</span>
            <span className="text-sm font-black">{o.name}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <button type="button" onClick={() => onConfirm(picked)} className="fluo-btn px-8 py-2.5 text-base">
          Confirm
        </button>
      </div>
    </PickerModal>
  );
}

/** Stop number → this activity's deck-scoped URL, or its plain hub/page
 *  when the stop has no deck (a Unit 0 stop, a still-unwritten one) — never
 *  a dead end. One place per activity, so MenuGrid stays a list of doors. */
export type SioHrefBuilder = (stop: number) => string;

/**
 * ONE ROUTE TABLE, AND IT IS `lib/activityStops.ts` (2026-09-11).
 *
 * What stood here built a URL from `SIOS[stop-1].collectionId` for all six
 * activities. Two of them do not use deck ids in their URLs at all —
 * VocabulaRain has its own set registry, ComposeIt has café banks — so those
 * two wrote addresses in a namespace their pages never exported, and every
 * such Confirm landed on nothing. The other four's URLs were right, but the
 * table could not say whether the deck behind one was PLAYABLE, so two of them
 * cheerfully opened an empty game.
 *
 * `stopHref` answers both questions at once, from each activity's own source,
 * and returns null where there is nothing. The chooser offers exactly the
 * stops it returns a string for, so "offered" and "reachable" are the same
 * list by construction rather than by agreement.
 */

/** ÉCOUTEXTE NO LONGER ASKS (Dan, 11 Sep: one question, asked once). Its
 *  content is chosen by unit and topic, so there is no per-stop route for the
 *  answer to steer — the old pop-up asked "which goal?", ignored the reply and
 *  opened the topic picker regardless. It now goes straight there. */
export const ECOUTEXTE_HREF = "/practice/ecoutexte";

/** The shape `useActivityPicker` returns — MenuGrid takes it as a prop
 *  rather than calling the hook itself (see SiteTopBar for why: the ☰
 *  dropdown unmounts MenuGrid on every navigate, so the picker's own state
 *  and modal have to live one level up or they would unmount in the same
 *  tick they open). */
export type ActivityPicker = ReturnType<typeof useActivityPicker>;

/** Opens the right picker instead of navigating straight to a hub — the
 *  one piece the ☰ menu wires per affected activity. Call this in
 *  SiteTopBar (the dropdown's PARENT, which does not unmount on navigate),
 *  never inside MenuGrid itself. */
export function useActivityPicker() {
  const router = useRouter();
  const [open, setOpen] = useState<
    | { kind: "pad"; key: StopActivityKey; emoji: string; name: string }
    | { kind: "two"; title: string; emoji1: string; name1: string; href1: string; emoji2: string; name2: string; href2: string }
    | null
  >(null);

  const modal = !open ? null : open.kind === "pad" ? (
    <GoalPadPicker
      emoji={open.emoji}
      name={open.name}
      stops={playableStops(open.key)}
      onClose={() => setOpen(null)}
      onConfirm={(stop) => {
        // Never navigate to a null: the pad only offers stops stopHref
        // answers, so this cannot be null — and if it ever is, staying put
        // beats landing on "there is nothing here" (Dan, 11 Sep).
        const href = stopHref(open.key, stop);
        setOpen(null);
        if (href) router.push(href);
      }}
    />
  ) : (
    <TwoChoicePicker
      title={open.title}
      options={[
        { key: "a", emoji: open.emoji1, name: open.name1 },
        { key: "b", emoji: open.emoji2, name: open.name2 },
      ]}
      onClose={() => setOpen(null)}
      onConfirm={(key) => { const href = key === "a" ? open.href1 : open.href2; setOpen(null); router.push(href); }}
    />
  );

  return {
    modal,
    openSlider: (key: StopActivityKey, emoji: string, name: string) => setOpen({ kind: "pad", key, emoji, name }),
    openTwoChoice: (title: string, a: { emoji: string; name: string; href: string }, b: { emoji: string; name: string; href: string }) =>
      setOpen({ kind: "two", title, emoji1: a.emoji, name1: a.name, href1: a.href, emoji2: b.emoji, name2: b.name, href2: b.href }),
  };
}
