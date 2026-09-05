import { MARK_GEOMETRY, markFor, type Mark, type MarkTone } from "@/content/marks";

/**
 * The FluOLinGo mark. One geometry, twenty-four dresses — see `src/content/marks.ts`
 * for what the three blocks mean and why the C is unfinished.
 *
 * NOTHING RENDERS THIS YET. It is kept so the mark survives the session it was
 * designed in (Dan, 2026-09-05: *"can we put the logo and 24 colors in the repo
 * for posterity"*). If you are the one shipping it, you need only pass a key.
 *
 * Two implementation notes, both of which cost an afternoon to find:
 *
 *  · THE IDS ARE INSTANCE-SCOPED. The mask and clipPath are referenced by
 *    `url(#…)`, which resolves against the WHOLE DOCUMENT, not the SVG. Two
 *    marks on one page sharing an id means the second silently reuses the
 *    first's mask — harmless while the geometry is identical, and a bug the
 *    moment it is not. `uid` makes them unique per instance.
 *  · THE RINGS ARE DRAWN AFTER THE MASK, NOT INSIDE IT. The mask knocks a slot
 *    through the page so the ring has somewhere to bite; the ring itself must
 *    sit on top of that hole or it gets knocked out along with the page.
 */
export default function FluoMark({
  mark,
  tone = "pale",
  size = 64,
  title,
  className,
}: {
  /** A key from `MARKS` ("pink", "teal", …) or a full Mark to draw directly. */
  mark: string | Mark;
  /** Ignored when `mark` is a full Mark. */
  tone?: MarkTone;
  /** Rendered size in px. Below ~24 the ring bite closes up; the C survives. */
  size?: number;
  /** Accessible name. Omit for a decorative mark and it is hidden instead. */
  title?: string;
  className?: string;
}) {
  const m = typeof mark === "string" ? markFor(mark, tone) : mark;
  if (!m) return null;

  const g = MARK_GEOMETRY;
  const uid = `mark-${m.key}-${typeof mark === "string" ? tone : "custom"}`;
  const slot = {
    x: g.ring.x - g.bite,
    w: g.ring.w + g.bite * 2,
    h: g.ring.h + g.bite * 2,
    r: (g.ring.h + g.bite * 2) / 2,
  };

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <defs>
        <mask id={`${uid}-bite`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect x="0" y="0" width="100" height="100" fill="#fff" />
          {g.ring.tops.map((top) => (
            <rect
              key={top}
              x={slot.x}
              y={top - g.bite}
              width={slot.w}
              height={slot.h}
              rx={slot.r}
              fill="#000"
            />
          ))}
        </mask>
        <clipPath id={`${uid}-page`}>
          <rect x={g.page.x} y={g.page.y} width={g.page.w} height={g.page.h} rx={g.page.r} />
        </clipPath>
      </defs>

      <g mask={`url(#${uid}-bite)`}>
        <g clipPath={`url(#${uid}-page)`}>
          {/* the L — left column and bottom band */}
          <rect x={g.page.x} y={g.page.y} width={g.page.w} height={g.page.h} fill={m.block} />
          {/* top-right — the C's top stroke, same hue as the L */}
          <rect
            x={g.splitX}
            y={g.page.y}
            width={g.page.x + g.page.w - g.splitX}
            height={g.tintBottomY - g.page.y}
            fill={m.tint}
          />
          {/* middle-right — the mouth, the complement */}
          <rect
            x={g.splitX}
            y={g.tintBottomY}
            width={g.page.x + g.page.w - g.splitX}
            height={g.mouthBottomY - g.tintBottomY}
            fill={m.mouth}
          />
        </g>
      </g>

      {g.ring.tops.map((top) => (
        <rect
          key={top}
          x={g.ring.x}
          y={top}
          width={g.ring.w}
          height={g.ring.h}
          rx={g.ring.h / 2}
          fill={m.ring}
        />
      ))}
    </svg>
  );
}

