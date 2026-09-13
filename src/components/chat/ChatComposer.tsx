"use client";

/**
 * The messenger composer — the pill, shared by ChaTutor and ComposeIt.
 *
 * Dan, 2026-09-13: *"adopt the UI UX of how modern messenger works"*.
 *
 * THE THREE THINGS A MESSENGER COMPOSER DOES, none of which either surface
 * did before:
 *   · it STAYS. It is a flex item of `.msgr` with `flex: 0 0 auto`, and the
 *     thread above it takes all the slack, so it cannot scroll off the bottom
 *     of a long conversation. No `position: fixed`, so it never fights the
 *     cahier's own furniture or the iframe every station runs in;
 *   · it GROWS with what you type, one line to five, then scrolls — and it
 *     grows in line-boxes, not pixels, so it follows the type ramp;
 *   · Enter SENDS and Shift+Enter breaks the line. ChaTutor already did this;
 *     ComposeIt made you reach for a button, which is why its input felt like
 *     a form field rather than a chat.
 *
 * WHAT IT DELIBERATELY IS NOT: full width. Dan's standing rule — *"WE NEVER
 * WANT TO HAVE A SINGLE BUTTON OCCUPYING THE ENTIRE WIDTH"* — is why send is a
 * round key beside the pill rather than a bar under it. A text field is not a
 * button, so the pill itself may take the room it needs; the CONTROL may not.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function ChatComposer({
  value,
  onChange,
  onSend,
  placeholder = "Message…",
  disabled = false,
  canSend,
  /** Round icon buttons that live on the left of the pill (mic, sound…). */
  before,
  /** Anything that belongs inside the pill, after the text (undo…). */
  inside,
  sendLabel = "Send",
  sendGlyph = "➤",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** Defaults to "there is something to send"; ComposeIt also counts chips. */
  canSend?: boolean;
  before?: ReactNode;
  inside?: ReactNode;
  sendLabel?: string;
  sendGlyph?: string;
  /** `has-fab` on any surface that also mounts ToolSummon's floating 🛠️, so
   *  the send key is not drawn underneath it. */
  className?: string;
}) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const ready = canSend ?? value.trim().length > 0;

  /* THE ACCENT BAR LANDS ON THE FIELD THAT SUMMONED IT — sometimes. AccentBar
     is `fixed inset-x-0 bottom-0` and publishes its height as `--accent-bar-h`
     while it is showing. Whether it covers THIS composer depends on where the
     composer sits: on /tutor the frame fills the viewport and the bar is
     straight on top of it; inside the cahier's game frame the composer stops
     about 58px above the bar and needs nothing. Measured, per surface, rather
     than padded everywhere — the blanket version cost 83px of thread on every
     exercise page to fix a collision those pages do not have.
     No feedback loop: the padding grows the box UPWARDS (it is the last item
     of a fixed-height column, so its bottom edge cannot move), which is why
     the overlap can be read from the same element it corrects. */
  const [lift, setLift] = useState(0);
  useEffect(() => {
    const root = document.documentElement;
    const measure = () => {
      const el = box.current;
      if (!el) return;
      const h = parseFloat(getComputedStyle(root).getPropertyValue("--accent-bar-h")) || 0;
      if (!h) { setLift(0); return; }
      setLift(Math.max(0, Math.ceil(el.getBoundingClientRect().bottom - (window.innerHeight - h))));
    };
    measure();
    // The bar sets the variable on <html>'s inline style, so watching that
    // attribute is exactly as precise as the thing it is following.
    const mo = new MutationObserver(measure);
    mo.observe(root, { attributes: true, attributeFilter: ["style"] });
    window.addEventListener("resize", measure);
    return () => { mo.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  /* Auto-grow. Reset to `auto` first or the box can only ever get taller:
     scrollHeight is measured against the height already set, so a deleted
     line would leave the field standing at its high-water mark. The cap is
     CSS (`max-height` in `.msgr-input`), so the ramp owns it, not this file. */
  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div
      ref={box}
      className={`msgr-composer ${className}`}
      style={lift ? { paddingBottom: `calc(0.4rem + var(--fs-step) * 0.35 + ${lift}px)` } : undefined}
    >
      {before}
      <div className="msgr-pill">
        <textarea
          ref={ta}
          lang="fr"
          className="msgr-input"
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (ready && !disabled) onSend();
            }
          }}
          /* The accent bar keys off lang="fr"; the four off-switches keep a
             phone keyboard from "helping" with English autocorrect on French. */
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {inside}
      </div>
      <button
        type="button"
        className="msgr-send"
        onClick={onSend}
        disabled={!ready || disabled}
        aria-label={sendLabel}
        title={sendLabel}
      >
        <span aria-hidden>{sendGlyph}</span>
      </button>
    </div>
  );
}
