/**
 * Importer parser for the bulk-paste path (v2 — no eligibility).
 *
 * Input grammar (one row per line):
 *   fr | en | tag1 tag2 …        (pipe — easy to type; also accepts tab)
 *
 * Pipe is the preferred separator because Tab in a textarea moves focus by default;
 * the UI also intercepts Tab to insert a literal "\t" for users who paste from a
 * spreadsheet. We also accept 2+ consecutive spaces, but only when neither pipe nor
 * tab is present AND the resulting field count is 2 or 3 — to avoid mangling sentences.
 *
 * v2: items no longer carry an `eligible` field — each game filters at its own renderer
 * via structural data (col: tags, gameConfig.matching.pairs, example presence).
 * The importer's job is just to parse fr/en/tags and surface errors/warnings.
 */
import type { Item } from "@/lib/collections/schema";

export type ParsedRow = {
  /** 1-based line number in the original paste. */
  line: number;
  /** Verbatim source line. */
  raw: string;
  /** `null` if the row was blank or unparseable; details in `errors`. */
  item: Item | null;
  errors: string[];
  warnings: string[];
};

export type ParseResult = {
  rows: ParsedRow[];
  items: Item[];
  /** True iff at least one row produced a usable Item. */
  hasAny: boolean;
};

const RESERVED_PREFIXES = ["col:", "role:"];

export function parseImporterPaste(text: string, collectionTags: string[] = []): ParseResult {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const rows: ParsedRow[] = [];
  const usedIds = new Set<string>();

  lines.forEach((raw, i) => {
    const line = i + 1;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const fields = splitFields(raw, warnings);

    if (fields.length < 2) {
      errors.push("Need at least `fr` and `en` separated by `|` or a tab.");
      rows.push({ line, raw, item: null, errors, warnings });
      return;
    }

    const fr = fields[0].trim();
    const en = fields[1].trim();
    const tagField = (fields[2] ?? "").trim();
    const rowTags = tagField ? tagField.split(/\s+/).filter(Boolean) : [];

    if (!fr) errors.push("`fr` is empty.");
    if (!en) errors.push("`en` is empty.");

    rowTags.forEach((t) => {
      if (RESERVED_PREFIXES.some((p) => t.startsWith(p))) {
        warnings.push(
          `Tag \`${t}\` uses a reserved namespace — structural games need their own editor step; ignored by the simple importer.`,
        );
      }
    });

    if (errors.length) {
      rows.push({ line, raw, item: null, errors, warnings });
      return;
    }

    const tags = mergeTags(collectionTags, rowTags);
    const id = uniqueId(fr, usedIds, line);
    const item: Item = { id, fr, en, tags };
    rows.push({ line, raw, item, errors, warnings });
  });

  const items = rows.map((r) => r.item).filter((it): it is Item => it !== null);

  return { rows, items, hasAny: items.length > 0 };
}

function splitFields(raw: string, warnings: string[]): string[] {
  if (raw.includes("|")) {
    const parts = raw.split("|").map((p) => p.trim());
    if (parts.length > 3) {
      warnings.push(
        `Row has ${parts.length} pipe-separated fields; only the first 3 are read (fr, en, tags).`,
      );
    }
    return parts.slice(0, 3);
  }
  if (raw.includes("\t")) {
    const parts = raw.split("\t");
    if (parts.length > 3) {
      warnings.push(
        `Row has ${parts.length} tab-separated fields; only the first 3 are read (fr, en, tags).`,
      );
    }
    return parts.slice(0, 3);
  }
  const spaced = raw.split(/ {2,}/);
  if (spaced.length === 2 || spaced.length === 3) {
    warnings.push("No `|` or tab found — split on multiple spaces. Use `|` for safety.");
    return spaced;
  }
  return [raw];
}

function mergeTags(collectionTags: string[], rowTags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of [...collectionTags, ...rowTags]) {
    if (!t || RESERVED_PREFIXES.some((p) => t.startsWith(p))) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

function uniqueId(fr: string, used: Set<string>, line: number): string {
  const base = `${String(line).padStart(2, "0")}-${slugify(fr) || "item"}`;
  let candidate = base;
  let n = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${n++}`;
  }
  used.add(candidate);
  return candidate;
}
