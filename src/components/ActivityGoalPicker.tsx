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
 * the slider both drive the same number. Every OTHER control here
 * (Confirm, the NumBus/NumBourse tiles) is a `.neo-key` — the paired
 * "stands OUT of the paper" style — per Dan's same message: "the other
 * buttons must be protruding buttons."
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
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { SIOS } from "@/content/sios";
import { loadBookmark, nextGoalNumber } from "@/lib/continuer";
import { loadProgress } from "@/lib/progress";

const TOTAL = SIOS.length; // 50

/** The learner's current stop, the same computation SiteTopBar's 🎯 badge
 *  and Home's well use — the slider's opening position. */
function currentStop(): number {
  const n = nextGoalNumber(loadProgress(), loadBookmark());
  return n && n >= 1 && n <= TOTAL ? n : 1;
}

function clampStop(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(TOTAL, Math.max(1, Math.round(n)));
}

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
 * The 50-stop slider. `onConfirm` receives the chosen stop number; the
 * caller resolves it to a URL (per-activity — see ActivityPickerLink below)
 * and navigates.
 */
export function GoalSliderPicker({
  emoji,
  name,
  onConfirm,
  onClose,
}: {
  emoji: string;
  name: string;
  onConfirm: (stop: number) => void;
  onClose: () => void;
}) {
  const [stop, setStop] = useState<number>(() => currentStop());
  const [editing, setEditing] = useState<string | null>(null);
  const inputId = useId();

  const commitEdit = () => {
    if (editing === null) return;
    if (editing.trim() !== "") setStop(clampStop(Number(editing)));
    setEditing(null);
  };

  return (
    <PickerModal title={<><span aria-hidden>{emoji}</span> {name} — which Goal?</>} onClose={onClose}>
      {/* The well: a depressed space (Dan's own word) holding a real number
          input, so tapping it and typing edits the same value the slider
          drags — two ways to the one number, never two numbers. */}
      <label htmlFor={inputId} className="sr-only">Goal number, 1 to {TOTAL}</label>
      <div className="neo-well mx-auto mb-1 flex w-[7ch] items-baseline justify-center gap-1 rounded-xl px-3 py-2">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          value={editing ?? String(stop).padStart(2, "0")}
          onFocus={(e) => { setEditing(String(stop)); e.target.select(); }}
          onChange={(e) => setEditing(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setEditing(null);
          }}
          aria-label={`Goal number, 1 to ${TOTAL} — tap to type one directly`}
          className="w-[2ch] border-0 bg-transparent p-0 text-center text-[30px] font-black leading-none text-[color:var(--cahier-ink)] [font-variant-numeric:tabular-nums] focus:outline-none"
        />
        <span className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">/{TOTAL}</span>
      </div>
      <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-[color:var(--cahier-ink-faint)]">
        goal {stop === currentStop() ? "· your current stop" : " "}
      </p>

      {/* The slider itself — a plain range input skinned to the family's own
          pen, so no two pickers on the app end up wearing a browser default. */}
      <input
        type="range"
        min={1}
        max={TOTAL}
        step={1}
        value={stop}
        onChange={(e) => setStop(clampStop(Number(e.target.value)))}
        aria-label={`Slide to a different goal, 1 to ${TOTAL}`}
        className="fluo-goal-slider mb-1 w-full"
      />
      <div className="mb-5 flex justify-between text-[10px] font-bold text-[color:var(--cahier-ink-faint)] [font-variant-numeric:tabular-nums]">
        <span>1</span><span>10</span><span>20</span><span>30</span><span>40</span><span>{TOTAL}</span>
      </div>

      <div className="flex justify-center">
        <button type="button" onClick={() => onConfirm(stop)} className="neo-key rounded-xl px-8 py-2.5 text-base font-black text-[color:var(--cahier-ink)]">
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
            className={`neo-key flex flex-1 flex-col items-center gap-1.5 rounded-xl px-2 py-4 ${picked === o.key ? "ring-2 ring-[color:var(--dopa-streak)] ring-offset-2" : ""}`}
          >
            <span aria-hidden className="text-3xl leading-none">{o.emoji}</span>
            <span className="text-sm font-black text-[color:var(--cahier-ink)]">{o.name}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <button type="button" onClick={() => onConfirm(picked)} className="neo-key rounded-xl px-8 py-2.5 text-base font-black text-[color:var(--cahier-ink)]">
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

export const SIO_HREF: Record<string, SioHrefBuilder> = {
  flip: (s) => { const id = SIOS[s - 1]?.collectionId; return id ? `/practice/flip-it/${id}` : "/practice/flip-it"; },
  grammarathon: (s) => { const id = SIOS[s - 1]?.collectionId; return id ? `/practice/grammarathon/${id}` : "/practice/grammarathon"; },
  vocabularain: (s) => { const id = SIOS[s - 1]?.collectionId; return id ? `/games/vocabularain/${id}` : "/games/vocabularain"; },
  lexicalator: (s) => { const id = SIOS[s - 1]?.collectionId; return id ? `/games/lexicalater/${id}` : "/games/lexicalater"; },
  wordrill: (s) => { const id = SIOS[s - 1]?.collectionId; return id ? `/practice/say-it/${id}` : "/practice/wordrill"; },
  compose: (s) => { const id = SIOS[s - 1]?.collectionId; return id ? `/games/compose/${id}` : "/games/compose"; },
  // ÉcouTexte has no per-deck route yet (see file header) — always the picker.
  ecoutexte: () => "/practice/ecoutexte",
};

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
    | { kind: "slider"; key: keyof typeof SIO_HREF; emoji: string; name: string }
    | { kind: "two"; title: string; emoji1: string; name1: string; href1: string; emoji2: string; name2: string; href2: string }
    | null
  >(null);

  const modal = !open ? null : open.kind === "slider" ? (
    <GoalSliderPicker
      emoji={open.emoji}
      name={open.name}
      onClose={() => setOpen(null)}
      onConfirm={(stop) => { const href = SIO_HREF[open.key](stop); setOpen(null); router.push(href); }}
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
    openSlider: (key: keyof typeof SIO_HREF, emoji: string, name: string) => setOpen({ kind: "slider", key, emoji, name }),
    openTwoChoice: (title: string, a: { emoji: string; name: string; href: string }, b: { emoji: string; name: string; href: string }) =>
      setOpen({ kind: "two", title, emoji1: a.emoji, name1: a.name, href1: a.href, emoji2: b.emoji, name2: b.name, href2: b.href }),
  };
}
