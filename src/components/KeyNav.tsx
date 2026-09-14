"use client";

/**
 * Site-wide keyboard navigation (Dan, 2026-07-14):
 *   • Two-digit SIO jump — typing e.g. "31" opens SIO-031 (weather), "35"
 *     the questions goal. Stands down while a choice exercise is mounted
 *     (digits mean answers there) and while typing in a field.
 *   • Arrow keys move focus spatially between links/buttons; Enter then
 *     activates the focused control natively. Pages whose own gameplay
 *     uses arrows (Vocabularain) opt out with a data-kbnav-off ancestor.
 * Mounted once in the root layout.
 */

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SIOS } from "@/content/sios";
import { choiceKeysBusy } from "@/lib/useChoiceKeys";
import { sioHref } from "@/lib/routes";

const DIGIT_WINDOW_MS = 900;

function inField(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
}

function focusables(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]')].filter(
    (el) => el.offsetParent !== null && !el.closest("[data-kbnav-off]") && el.getBoundingClientRect().width > 0,
  );
}

function moveFocus(dir: "up" | "down" | "left" | "right"): boolean {
  const all = focusables();
  if (all.length === 0) return false;
  const activeEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const cur = activeEl && all.includes(activeEl) ? activeEl : null;
  if (!cur) {
    // Nothing focused yet: start from the first control visible in the viewport.
    const first = all.find((el) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.top < window.innerHeight;
    });
    (first ?? all[0]).focus();
    return true;
  }
  const cr = cur.getBoundingClientRect();
  const cx = (cr.left + cr.right) / 2;
  const cy = (cr.top + cr.bottom) / 2;
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  for (const el of all) {
    if (el === cur) continue;
    const r = el.getBoundingClientRect();
    const dx = (r.left + r.right) / 2 - cx;
    const dy = (r.top + r.bottom) / 2 - cy;
    let primary: number;
    let cross: number;
    if (dir === "down") { primary = dy; cross = Math.abs(dx); }
    else if (dir === "up") { primary = -dy; cross = Math.abs(dx); }
    else if (dir === "right") { primary = dx; cross = Math.abs(dy); }
    else { primary = -dx; cross = Math.abs(dy); }
    if (primary <= 4) continue; // must actually lie in that direction
    const score = primary + cross * 2.5;
    if (score < bestScore) { bestScore = score; best = el; }
  }
  if (best) {
    best.focus();
    best.scrollIntoView({ block: "nearest", inline: "nearest" });
    return true;
  }
  return false;
}

export default function KeyNav() {
  const router = useRouter();
  const buf = useRef("");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const clear = () => {
      buf.current = "";
      if (timer.current !== null) { window.clearTimeout(timer.current); timer.current = null; }
    };
    const h = (e: KeyboardEvent) => {
      if (inField(e) || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;

      // ── two-digit SIO jump ──
      if (/^[0-9]$/.test(e.key) && !choiceKeysBusy()) {
        buf.current += e.key;
        if (timer.current !== null) window.clearTimeout(timer.current);
        if (buf.current.length >= 2) {
          const num = parseInt(buf.current, 10);
          clear();
          const sio = SIOS.find((s) => s.num === num);
          /* IT OPENS THE GOAL'S PAGE, THE SAME DOOR A TAP OPENS (Dan,
             2026-09-14: *"typing on numbers in the map view is bringing up old
             popup SIOs"*).

             THE COMMENT THAT USED TO BE HERE WAS TRUE WHEN IT WAS WRITTEN AND
             HAD BEEN WRONG FOR A WEEK. It read « the outcome lives on The Map
             now (/sio/[id] is only a redirect): ?unit=N#SIO-0NN opens its
             popup », so this set `location.hash` and MapBody's hashchange
             listener drew `StopPopup`. On 7 Sep Dan retired exactly that —
             *"WE ARE STILL SEEING THE POPUPS FROM CLICKING THE MAP, WHERE ARE
             THE FULL PAGED SIOS"* — and `/sio/[id]` became the real
             one-goal-per-screen page. MapBody's own `openSio` was changed to
             push it; this shortcut was not, so the keyboard kept opening the
             retired popup while the finger opened the page.

             MapBody still parses `#SIO-nnn` and still draws the popup for it,
             deliberately: a QR code or a bookmark in the wild must land
             somewhere. Nothing in the app should MINT one of those any more,
             which is what this line stops doing. */
          if (sio) router.push(sioHref(sio.id));
        } else {
          timer.current = window.setTimeout(clear, DIGIT_WINDOW_MS);
        }
        return;
      }

      // ── arrow-key spatial focus ──
      if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (document.querySelector("[data-kbnav-off]")) return; // a game owns the arrows here
        const dir = e.key === "ArrowUp" ? "up" : e.key === "ArrowDown" ? "down" : e.key === "ArrowLeft" ? "left" : "right";
        if (moveFocus(dir)) e.preventDefault();
      }
    };
    window.addEventListener("keydown", h);
    return () => { clear(); window.removeEventListener("keydown", h); };
  }, [router]);

  return null;
}
