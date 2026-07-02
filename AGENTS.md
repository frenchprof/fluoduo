<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dan's litmus test — permanent design rule (2026-07-02)

**Any TEXT that, when removed, does not prevent the user from finding the
correct answer is REDUNDANT — remove it.** Scope is text ONLY — section
labels, context blurbs, grammar badges, inline explanation prose.
Clarified by Dan the same day:
- Decorative/visual elements (tiles, borders, colours, icons) serve the
  visual and are EXEMPT.
- Progress counters (answered/score) are useful learner feedback — keep.
- Per-question explanations are offered behind a "WHY" button at the top
  right of an answered question — available on demand, never inline by
  default.
