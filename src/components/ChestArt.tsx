"use client";

/**
 * THE TREASURE CHEST — the app's chest, on file (Dan, 8 Sep: *"please pass it
 * help replace the chestbox image on file"*).
 *
 * It lived inside Lexicalator.tsx while it was being drawn, over four rounds
 * of Dan sending it back. It is a picture, not a piece of that game, and the
 * thing it replaces — 🧰, the TOOLBOX emoji — was standing in for a chest in
 * six places while also being the real icon of the in-exercise tools tray. One
 * glyph, two meanings, and neither of them a chest.
 *
 * WHAT IT IS, and every line of it was a correction:
 *
 *   · SEEN FROM THE CORNER, not head-on. Dan: *"the chestboxes will look like
 *     chestboxes if they are viewed from the corner rather than from the front
 *     or side"*. A front elevation is a shape; a chest is a box or it is
 *     nothing, and three rounds of fixing what was PAINTED on that flat front
 *     (straps, thinner straps, bent straps) could never have worked.
 *
 *   · THE ARCH IS ON THE END FACE. Dan again: *"the rounded top is only
 *     visible from the side though, you mixed up side and front once again"*.
 *     The lid is a half-cylinder lying LEFT TO RIGHT — along that axis you see
 *     the curved surface, which reads as a band with a straight crown, and the
 *     arch is the cylinder's END CAP. The lock stays on the front, which is the
 *     one piece the early drafts had right.
 *
 *   · NO STRAPS. Dan: *"i mean the chests i know have not straps"*, with a
 *     reference sheet. A chest of that kind is gold trim round wooden panels
 *     and one small lock plate; the straps were mine, not the drawing's.
 *
 * ONE DEPTH VECTOR, (+20, −11), used by the body's end face, the lid's end cap
 * and both gold bands, so the box holds together.
 *
 * THE END CAP IS TWO QUADRATICS AND ITS CONTROLS ARE DERIVED, not eyeballed:
 * the surface leaves the chord vertically at each end and travels along the
 * depth vector at the crown, so each control sits where those two tangents
 * meet — (66, 29) and (86, 18) for a radius of 17.
 *
 * THE METAL IS CONSTANT AND THE LIVERY COLOURS THE WOOD. That keeps a real
 * chest's palette — gold is gold — while LexicaLater's requirement survives:
 * three chests on one lane still tell apart, by their wood.
 */
import { useId } from "react";

/** A chest's wood, in two shades: the lit faces and the ones turned away. */
export type ChestTint = { body: string; lid: string; edge: string };

/** The default, for anywhere a chest is an ICON rather than one of a lane. */
export const CHEST_GOLD: ChestTint = {
  body: "linear-gradient(180deg,#ffe08a,#eaa61c)",
  lid: "linear-gradient(180deg,#c8860f,#96600c)",
  edge: "#7a4e0a",
};

/**
 * SVG, NOT AN IMAGE, and that is what lets one drawing do every job. It is
 * drawn in whatever livery it is handed — the wood takes the colour, the gold
 * stays gold — so LexicaLater's fifteen liveries still tell three chests on a
 * lane apart, and the same component is the 20px chest beside a title and the
 * 96px one on the belt without a second asset or a raster to go blurry.
 *
 * `body` and `lid` arrive as CSS gradients, which SVG cannot take as a fill, so
 * each is rebuilt here as a linearGradient from the two stops in the string. A
 * livery that is not a two-stop gradient falls back to the raw value, which a
 * flat colour already is.
 */
function gradStops(css: string): [string, string] {
  const m = css.match(/(#[0-9a-f]{3,8})[^#]*(#[0-9a-f]{3,8})/i);
  return m ? [m[1], m[2]] : [css, css];
}

export default function ChestArt({ tint, open = false, className = "" }: { tint: ChestTint; open?: boolean; className?: string }) {
  const id = useId();
  const [w1, w2] = gradStops(tint.body);
  // The livery's `lid` value is its own darker shade — what the faces turned
  // away from the light need, so the receding end takes it.
  const [shade] = gradStops(tint.lid);
  // The metal is the same on every chest; the livery colours the WOOD.
  const G1 = "#f7d878";
  const G2 = "#d69f22";
  const ink = "#4a3a12";
  // The lid outline, needed twice: once to draw it and once to clip its planks.
  const LID = "M8 46 Q8 29 18 23.5 L76 23.5 Q86 18 86 35 L66 46 Z";
  return (
    <svg viewBox="0 0 96 88" className={className} aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={w1} /><stop offset="1" stopColor={w2} /></linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={G1} /><stop offset="1" stopColor={G2} /></linearGradient>
        <clipPath id={`${id}c`}><path d={LID} /></clipPath>
      </defs>
      <ellipse cx="47" cy="83" rx="38" ry="3.4" fill="rgba(0,0,0,0.15)" />

      {/* FROM THE CORNER, AND THE ARCH IS ON THE END (Dan, 8 Sep, twice: first
          *"the chestboxes will look like chestboxes if they are viewed from the
          corner rather than from the front or side"*, then *"the rounded top is
          only visible from the side though, you mixed up side and front once
          again"*).
          Both notes are the same geometry, and I had it backwards. A chest lid
          is a half-cylinder lying LEFT TO RIGHT. Along that axis you see the
          curved surface, which reads as a band with a STRAIGHT crown — no arch.
          The arch is the cylinder's END CAP, and it is only ever visible on the
          END face. So the front is flat-topped and the arch belongs to the
          receding right, in the same plane as the body's end face.

          THE DEPTH IS ONE VECTOR, (+20, −11), used by the body's end, the lid's
          end cap and both gold bands, so the box holds together.

          THE END CAP IS TWO QUADRATICS, not an arc, and the control points are
          derived rather than eyeballed: the surface leaves the chord vertically
          at each end and is travelling along the depth vector at the crown, so
          each control sits where those two tangents meet — (66, 29) and
          (86, 18) for a radius of 17. */}
      <path d="M66 46 L86 35 V67 L66 78 Z" fill={shade} stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 46 H66 V78 H8 Z" fill={`url(#${id}w)`} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 56 H64 M10 66 H64" stroke={ink} strokeWidth="0.8" opacity="0.2" />

      <g transform={open ? "rotate(-12 8 46)" : undefined}>
        <path d={LID} fill={`url(#${id}w)`} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
        {/* the planks run along the cylinder, so they are straight and level */}
        <g clipPath={`url(#${id}c)`}>
          <path d="M0 33 H96 M0 40 H96" stroke={ink} strokeWidth="0.8" opacity="0.18" />
        </g>
        <path d="M66 46 Q66 29 76 23.5 Q86 18 86 35 Z" fill={shade} stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
      </g>

      {/* the gold band under the lid, and the one round the foot */}
      <path d="M8 43 H66 L86 32 V37 L66 48 H8 Z" fill={`url(#${id}g)`} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 71 H66 L86 60 V67 L66 78 H8 Z" fill={`url(#${id}g)`} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />

      {/* the lock — on the FRONT face, across the joint, and only there */}
      <rect x="30" y="41" width="13" height="15" rx="2.4" fill={`url(#${id}g)`} stroke={ink} strokeWidth="1.7" />
      <circle cx="36.5" cy="46.5" r="2" fill={ink} />
      <path d="M36.5 47.5 l-1.3 4.6 h2.6 z" fill={ink} />
    </svg>
  );
}
