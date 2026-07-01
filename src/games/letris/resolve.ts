/**
 * Letris match-3 clearing — pure & testable.
 *
 * A column is the BASE (its category colour, always at the bottom, never removed)
 * plus the stacked tiles (bottom→top). Tiles clear when 3+ of the SAME colour are
 * consecutive — the base may anchor a run (base + 2 of its colour → those 2 clear)
 * but the base itself never vanishes. Runs of 3+ tiles not touching the base clear
 * entirely (this is how a wrong drop is recovered — make the same mistake ×3).
 * After each clear, tiles fall (gravity) and we re-check (cascade).
 */
export function resolveColumn<T>(
  tilesBottomUp: T[],
  baseColor: string,
  colorOf: (t: T) => string,
): { tiles: T[]; cleared: number } {
  let col = tilesBottomUp.slice();
  let cleared = 0;

  for (;;) {
    const seq = [baseColor, ...col.map(colorOf)]; // index 0 = base
    const remove = new Set<number>(); // indices into `col`
    let i = 0;
    while (i < seq.length) {
      let j = i;
      while (j + 1 < seq.length && seq[j + 1] === seq[i]) j++;
      if (j - i + 1 >= 3) {
        for (let k = i; k <= j; k++) if (k >= 1) remove.add(k - 1); // skip base (k=0)
      }
      i = j + 1;
    }
    if (remove.size === 0) break;
    cleared += remove.size;
    col = col.filter((_, idx) => !remove.has(idx)); // gravity: compact toward base
  }

  return { tiles: col, cleared };
}

/**
 * Whole-board match-3 — clears VERTICAL runs (3+ same colour stacked in a column,
 * each column's base colour anchoring the bottom run) AND HORIZONTAL runs (3+ same
 * colour adjacent in a row). After every pass tiles fall (per-column gravity toward
 * the bottom row) and we re-check, so chain-clears cascade. Pure & testable.
 *
 * `board[r][c]` — row 0 is the top, row `rows-1` is the bottom (just above the bases).
 */
export function resolveBoard<T>(
  board: (T | null)[][],
  rows: number,
  cols: number,
  baseColor: (col: number) => string,
  colorOf: (t: T) => string,
): { board: (T | null)[][]; cleared: number } {
  const b = board.map((row) => row.slice());
  let cleared = 0;

  for (;;) {
    const remove: boolean[][] = Array.from({ length: rows }, () => Array<boolean>(cols).fill(false));

    // Vertical: read each column bottom→top, base colour anchors the first run.
    for (let c = 0; c < cols; c++) {
      const stack: { row: number; color: string }[] = [];
      for (let r = rows - 1; r >= 0; r--) if (b[r][c]) stack.push({ row: r, color: colorOf(b[r][c]!) });
      const seq = [baseColor(c), ...stack.map((s) => s.color)]; // index 0 = base
      let i = 0;
      while (i < seq.length) {
        let j = i;
        while (j + 1 < seq.length && seq[j + 1] === seq[i]) j++;
        if (j - i + 1 >= 3) for (let k = Math.max(i, 1); k <= j; k++) remove[stack[k - 1].row][c] = true; // never the base
        i = j + 1;
      }
    }

    // Horizontal: 3+ same-colour adjacent tiles in a row (no base in a row).
    for (let r = 0; r < rows; r++) {
      let i = 0;
      while (i < cols) {
        const cell = b[r][i];
        if (!cell) { i++; continue; }
        const c0 = colorOf(cell);
        let j = i;
        while (j + 1 < cols && b[r][j + 1] && colorOf(b[r][j + 1]!) === c0) j++;
        if (j - i + 1 >= 3) for (let k = i; k <= j; k++) remove[r][k] = true;
        i = j + 1;
      }
    }

    let any = false;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (remove[r][c]) { b[r][c] = null; cleared++; any = true; }
    if (!any) break;

    // Gravity: compact each column toward the bottom row.
    for (let c = 0; c < cols; c++) {
      const kept: T[] = [];
      for (let r = rows - 1; r >= 0; r--) if (b[r][c]) kept.push(b[r][c]!);
      for (let r = 0; r < rows; r++) b[r][c] = null;
      kept.forEach((t, idx) => { b[rows - 1 - idx][c] = t; });
    }
  }

  return { board: b, cleared };
}
