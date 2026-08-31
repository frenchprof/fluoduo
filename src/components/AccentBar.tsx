"use client";

/**
 * Global French accent keyboard (Dan, 2026-07-05: the accent bar should appear
 * "whenever there is French to be typed, throughout the website"). Mounted once
 * in the root layout. It listens document-wide: whenever a FRENCH text field
 * gains focus, a bar of accented characters docks at the bottom of the screen;
 * tapping a key inserts it at the cursor. A field counts as French if it has
 * lang="fr" OR the shared .cahier-answer class (every typed-answer drill uses
 * it), so it covers pretests, the drills, the café, the tutor, Flip It's
 * self-test, and the deck builder — with zero per-component wiring.
 */
import { useEffect, useRef, useState } from "react";

const LOWER = ["é", "è", "à", "ù", "ç", "ê", "â", "ô", "û", "î", "ï", "ë", "ü", "œ", "æ", "«"];
const UPPER = ["É", "È", "À", "Ù", "Ç", "Ê", "Â", "Ô", "Û", "Î", "Ï", "Ë", "Ü", "Œ", "Æ", "»"];

type Field = HTMLInputElement | HTMLTextAreaElement;

function isFrenchField(el: EventTarget | null): el is Field {
  if (el instanceof HTMLTextAreaElement) {
    return el.lang === "fr" || el.classList.contains("cahier-answer");
  }
  if (el instanceof HTMLInputElement) {
    if (!["text", "search", ""].includes(el.type)) return false;
    return el.lang === "fr" || el.classList.contains("cahier-answer");
  }
  return false;
}

/** Insert at the cursor via the native value setter so React's controlled
 *  onChange fires; keep selection after the inserted char. */
function insertAtCursor(el: Field, ch: string) {
  const s = el.selectionStart ?? el.value.length;
  const e = el.selectionEnd ?? s;
  const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, el.value.slice(0, s) + ch + el.value.slice(e));
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.focus();
  try { el.setSelectionRange(s + ch.length, s + ch.length); } catch {}
}

export default function AccentBar() {
  const [shift, setShift] = useState(false);
  const [visible, setVisible] = useState(false);
  const targetRef = useRef<Field | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  // iOS Safari: React's root touchstart listener is PASSIVE, so preventDefault
  // in the onPointerDown handlers can't stop the tap from blurring the field —
  // the phone keyboard collapsed on every accent tap. A NATIVE non-passive
  // touchstart listener on the bar keeps the field focused, so the phone
  // keyboard and the accent bar stay up together. Pointer events fire before
  // touchstart, so the insert handlers still run.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || !visible) return;
    const keepFocus = (e: TouchEvent) => e.preventDefault();
    bar.addEventListener("touchstart", keepFocus, { passive: false });
    return () => bar.removeEventListener("touchstart", keepFocus);
  }, [visible]);

  useEffect(() => {
    const onIn = (e: FocusEvent) => {
      if (isFrenchField(e.target)) { targetRef.current = e.target as Field; setVisible(true); }
    };
    // Hide shortly after focus leaves a French field — the delay lets a tap on
    // a bar key (which preventDefaults, keeping input focus) win the race.
    const onOut = () => {
      window.setTimeout(() => { if (!isFrenchField(document.activeElement)) setVisible(false); }, 150);
    };
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  if (!visible) return null;
  const keys = shift ? UPPER : LOWER;
  // pointerdown + preventDefault keeps focus in the field so the insert lands.
  const press = (fn: () => void) => (e: React.PointerEvent) => { e.preventDefault(); fn(); };

  return (
    <div ref={barRef} className="fixed inset-x-0 bottom-0 z-[85] border-t-2 border-[color:var(--cahier-ink)]/20 bg-[var(--cahier-paper-2,#fdfbf4)] p-2 shadow-[0_-4px_16px_rgba(34,40,80,0.14)]">
      <div className="mx-auto flex max-w-lg items-stretch gap-2">
        <button type="button" onPointerDown={press(() => setShift((s) => !s))}
          className={`cahier-btn cahier-btn-sm shrink-0 ${shift ? "cahier-btn-primary" : ""}`}
          aria-label="Shift" title="Shift">⇧</button>
        <div className="grid flex-1 grid-cols-8 gap-1">
          {/* The ref is read inside the pointerdown handler `press` wraps —
              at event time, never during render; the rule cannot see through
              the handler factory (it flags the whole map callback). */}
          {/* eslint-disable-next-line react-hooks/refs */}
          {keys.map((ch) => (
            <button key={ch} type="button"
              onPointerDown={press(() => targetRef.current && insertAtCursor(targetRef.current, ch))}
              className="cahier-btn cahier-btn-sm !px-0 text-base" aria-label={`Insert ${ch}`}>{ch}</button>
          ))}
        </div>
        <button type="button" onPointerDown={press(() => setVisible(false))}
          className="cahier-btn cahier-btn-sm shrink-0" aria-label="Hide">✕</button>
      </div>
    </div>
  );
}
