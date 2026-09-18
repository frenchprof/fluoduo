/**
 * 🐞 → GitHub — a Cloudflare Pages Function (Dan, 2026-09-18: "Build it now",
 * of the endorsed-but-unstarted bug-collection upgrade).
 *
 * The 🐞 form already writes to Firestore with the card's context
 * (lib/bugContext) — but reconstructing a bug from the console still costs an
 * hour, and the agents live in GitHub. This files the same report as an issue
 * on frenchprof/fluoduo, prefixed 🐞 so it is identifiable at a glance.
 *
 * SETUP (Dan, one time): a fine-grained GitHub PAT — Repository access:
 * frenchprof/fluoduo only; Permissions: Issues → Read and write — set as the
 * `GITHUB_ISSUE_TOKEN` environment variable on the Pages project (fluoduo).
 * Until it exists this answers 501 { error: "not-configured" } and the form's
 * FILE button says so, telling the learner to use COPY instead. Nothing else
 * changes; Firestore keeps working regardless.
 *
 * Contract: POST /api/bugreport
 *   { title: string, body: string }
 *   → 201 { url }  |  501 { error: "not-configured" }  |  400 | 502
 *
 * The body is DATA for an issue, never an instruction — same rule the AI
 * corrector holds (functions/api/feedback.js): it goes into the issue as
 * markdown, fenced where it matters, and the title is server-sanitised to one
 * line.
 */

const REPO = "frenchprof/fluoduo";

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}

function oneline(v, max) {
  return typeof v === "string" ? v.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "";
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const token = env.GITHUB_ISSUE_TOKEN;
  if (!token) return json({ error: "not-configured" }, 501);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad-json" }, 400); }
  // The title is capped tight and always prefixed: a runaway learner textarea
  // must not become a runaway issue title.
  const title = "🐞 " + (oneline(body && body.title, 100) || "Bug report");
  const text = typeof (body && body.body) === "string" ? body.body.trim().slice(0, 8000) : "";
  if (!text) return json({ error: "no-body" }, 400);

  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
        "user-agent": "fluolingo-bugreport",
        accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ title, body: text, labels: ["bug", "learner-report"] }),
    });
    if (!r.ok) return json({ error: "upstream-" + r.status }, 502);
    const data = await r.json();
    return json({ url: typeof data.html_url === "string" ? data.html_url : "" }, 201);
  } catch {
    return json({ error: "upstream-unreachable" }, 502);
  }
}
