#!/usr/bin/env python3
"""Render docs/GUIDE.md into docs/guide/index.html — the learner manual, in the
app's own cahier (notebook) style, with the screenshots under docs/guide/img.

    python3 scripts/build-guide.py

Figures come from `<!-- fig: name[, name] | caption -->` comment lines in the
markdown (invisible on GitHub). Screenshots are taken by scripts/guide-shots.mjs
against a NEXT_PUBLIC_OPEN_APP=1 build and converted by scripts/guide-webp.mjs.
"""
import re, html, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/GUIDE.md"
OUT = ROOT / "docs/guide/index.html"
SITE = "https://fluolingo.com"

# Where a heading's "Open ↗" chip goes. Keyed by a word that appears in the heading.
ROUTES = {
    "LEARN": "/practice/speculearn", "DRILL": "/reviser", "AMUSE": "/games/vocabularain",
    "SPEAK": "/tts", "WRITE": "/tutor", "TRACK": "/profil",
    "SpecuLearn": "/practice/speculearn", "MneMemo": "/sio/SIO-001", "MémoiRecall": "/practice/flip-it",
    "GramMarathon": "/practice/grammarathon", "ConjugaZone": "/conjugaison", "ErroReview": "/reviser",
    "VocabulaRain": "/games/vocabularain", "Numbers": "/games/numbers", "LexicaLocker": "/games/lexicalater",
    "WorDrill": "/practice/wordrill", "ÉcouTexte": "/practice/ecoutexte", "VoixLà": "/tts",
    "ChaTutor": "/tutor", "ComposeIt": "/games/compose",
    "front door": "/", "Home = the map": "/home", "goal page": "/sio/SIO-005", "Bottom bar": "/reglages",
    "Also": "/favourites",
}
FAM_OF = {"LEARN": "practice", "DRILL": "review", "AMUSE": "svplay", "SPEAK": "oral", "WRITE": "tools", "TRACK": "user"}
# Band colour per top-level section: getting around is Start-yellow, the activity
# chapter is family-coloured inside, connections are Learn-blue, the rest is Track-grey.
SECTION_FAM = {0: "goals", 1: "goals", 2: "goals", 3: "goals", 4: "practice", 5: "practice", 6: "user", 7: "user", 8: "user", 9: "goals"}
SECTION_EMOJI = {0: "🧑‍🏫", 1: "🗺️", 2: "🧭", 3: "👣", 4: "📝", 5: "🔗", 6: "⭐", 7: "🔐", 8: "💡", 9: "⚡"}
DESKTOP = {"menu-desktop", "home-desktop"}

def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", s)
    return s

def table(rows):
    h = "<div class='scroll'><table><thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in rows[0]) + "</tr></thead><tbody>"
    for r in rows[2:]:
        h += "<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>"
    return h + "</tbody></table></div>"

def figure(names, caption):
    imgs = "".join(
        f"<a href='img/{n}.webp' target='_blank' rel='noopener' title='Open full size'>"
        f"<img src='img/{n}.webp' alt='Screenshot: {n}' loading='lazy' class='{'wide' if n in DESKTOP else 'phone'}'></a>" for n in names)
    return f"<figure class='shot'><div class='shots'>{imgs}</div><figcaption>{inline(caption)}</figcaption></figure>"

def open_chip(title):
    for key, route in ROUTES.items():
        if key in title:
            label = "Open on fluolingo.com" if route != "/" else "Open fluolingo.com"
            return f"<a class='open' href='{SITE}{route}' target='_blank' rel='noopener'>{label} ↗</a>"
    return ""

islist = lambda s: re.match(r"^\s*(-|\d+\.) ", s)

def parse_list(lines, ind):
    res, k = [], 0
    while k < len(lines):
        m = re.match(r"^(\s*)(-|\d+\.) (.*)", lines[k])
        if m and len(m.group(1)) == ind:
            text = m.group(3); k += 1; sub = []
            while k < len(lines) and not (islist(lines[k]) and len(re.match(r"^(\s*)", lines[k]).group(1)) <= ind):
                sub.append(lines[k]); k += 1
            cont = [x for x in sub if not islist(x) and not x.strip().startswith("|")]
            nested = [x for x in sub if islist(x)]
            tbl = [x for x in sub if x.strip().startswith("|")]
            h = inline(text)
            if cont: h += "<br>" + inline(" ".join(c.strip() for c in cont))
            if nested: h += parse_list(nested, len(re.match(r"^(\s*)", nested[0]).group(1)))
            if tbl: h += table([[c.strip() for c in x.strip().strip("|").split("|")] for x in tbl])
            res.append((m.group(2) != "-", h))
        else:
            k += 1
    tag = "ol" if res and res[0][0] else "ul"
    return f"<{tag}>" + "".join(f"<li>{h}</li>" for _, h in res) + f"</{tag}>"

def render(md):
    src = md.split("\n"); out = []; i = 0; sec = -1; toc = []
    while i < len(src):
        l = src[i]
        fm = re.match(r"^<!-- fig: (.*?) \| (.*?) -->$", l)
        if fm:
            out.append(figure([n.strip() for n in fm.group(1).split(",")], fm.group(2))); i += 1; continue
        if l.startswith("```"):
            j = i + 1; buf = []
            while not src[j].startswith("```"): buf.append(src[j]); j += 1
            out.append("<div class='scroll'><pre>" + html.escape("\n".join(buf)) + "</pre></div>"); i = j + 1; continue
        if l.startswith("---"): i += 1; continue
        m = re.match(r"^(#{1,4}) (.*)", l)
        if m:
            n, t = len(m.group(1)), m.group(2)
            if n == 1:
                out.append(f"<h1>{inline(t)}</h1>")
            elif n == 2:
                if sec >= 0: out.append("</section>")
                sec += 1
                num = re.match(r"(\d+)\. (.*)", t)
                fam = SECTION_FAM.get(sec, "goals")
                title = num.group(2) if num else t
                toc.append((sec, title, fam))
                out.append(f"<section id='s{sec}' class='fam-{fam}'>"
                           f"<div class='band'><span class='band-emoji'>{SECTION_EMOJI.get(sec,'')}</span>"
                           f"<h2>{inline(title)}</h2><span class='band-pill'>{sec}</span></div>")
            elif n == 3:
                fam = next((v for k, v in FAM_OF.items() if k in t), None)
                chip = open_chip(t)
                if fam:
                    out.append(f"<div class='band sub fam-{fam}'><h3>{inline(t)}</h3>{chip}</div>")
                else:
                    out.append(f"<h3 class='plain'>{inline(t)} {chip}</h3>")
            else:
                out.append(f"<h4>{inline(t)} {open_chip(t)}</h4>")
            i += 1; continue
        if l.startswith("|"):
            rows = []
            while i < len(src) and src[i].startswith("|"):
                rows.append([c.strip() for c in src[i].strip().strip("|").split("|")]); i += 1
            out.append(table(rows)); continue
        if islist(l):
            items = []
            while i < len(src) and src[i].strip() and (islist(src[i]) or src[i].startswith("  ")):
                items.append(src[i]); i += 1
            out.append(parse_list(items, len(re.match(r"^(\s*)", items[0]).group(1)))); continue
        if not l.strip(): i += 1; continue
        buf = [l]; i += 1
        while i < len(src) and src[i].strip() and not re.match(r"^(#|\||```|---|<!--|\s*(-|\d+\.) )", src[i]):
            buf.append(src[i]); i += 1
        ptxt = " ".join(b.strip() for b in buf)
        m = re.match(r"^\*(.+)\*$", ptxt)
        out.append(f"<p class='lede'>{inline(m.group(1))}</p>" if m else f"<p>{inline(ptxt)}</p>")
    if sec >= 0: out.append("</section>")
    return "\n".join(out), toc

CSS = """
@font-face{font-family:"FluOLinGo Hand";src:url("FluOlinGoHand-Bold.woff2") format("woff2");font-weight:700;font-display:swap}
:root{--desk:#e3dfd3;--paper:#f9f6ee;--paper-2:#f3efe4;--raised:#fffdf8;--rule:#e4dfd0;--ink:#3f3831;--ink-soft:#6f675d;--hl:#d4f24c;--hl-edge:#a6c130;--code:#efe9db;
--fam-goals:#fcdf00;--fam-goals-ink:#756700;--fam-goals-wash:#f2e8a5;
--fam-practice:#1ca6ff;--fam-practice-ink:#006baa;--fam-practice-wash:#d0e9ff;
--fam-review:#00c197;--fam-review-ink:#005f49;--fam-review-wash:#cdf4e7;
--fam-svplay:#b17eff;--fam-svplay-ink:#9200fe;--fam-svplay-wash:#eae0ff;
--fam-oral:#9398ff;--fam-oral-ink:#3230b0;--fam-oral-wash:#e5e5ff;
--fam-tools:#ff9037;--fam-tools-ink:#9f5100;--fam-tools-wash:#ffdec9;
--fam-user:#9ca3af;--fam-user-ink:#4b5563;--fam-user-wash:#e5e7eb;
--hand:"FluOLinGo Hand","Patrick Hand","Bradley Hand","Segoe Print",cursive;--body:Roboto,system-ui,-apple-system,"Segoe UI",sans-serif;color-scheme:light}
*{box-sizing:border-box}
body{margin:0;background:var(--desk);color:var(--ink);font-family:var(--body);font-size:16px;line-height:1.5;padding-inline:16px;padding-block:20px 60px}
.sheet{position:relative;max-width:1080px;margin:0 auto;background:var(--paper) repeating-linear-gradient(to bottom,transparent 0 31px,var(--rule) 31px 32px);background-position:0 64px;border-radius:4px 16px 16px 4px;box-shadow:0 12px 34px rgba(34,40,80,.20);padding:0 clamp(16px,4vw,44px) 48px clamp(48px,7vw,84px);overflow:clip;overflow-clip-margin:26px}
.binding{position:absolute;top:0;bottom:0;left:-24px;width:62px;pointer-events:none;z-index:3;background-repeat:repeat-y;
background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='62' height='26' viewBox='0 0 62 26'%3E%3Cdefs%3E%3ClinearGradient id='c' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23fbfdff'/%3E%3Cstop offset='0.35' stop-color='%23d8dce2'/%3E%3Cstop offset='0.6' stop-color='%239aa0a8'/%3E%3Cstop offset='1' stop-color='%23565b63'/%3E%3C/linearGradient%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='0'%3E%3Cstop offset='0' stop-color='%23141820' stop-opacity='0.3'/%3E%3Cstop offset='1' stop-color='%23141820' stop-opacity='0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='24' y='0' width='16' height='26' fill='url(%23g)'/%3E%3Cellipse cx='49' cy='13.5' rx='5.2' ry='4.2' fill='%231e1a14' opacity='0.88'/%3E%3Cg transform='rotate(-7 29 13)'%3E%3Cellipse cx='29' cy='13.4' rx='21' ry='5.8' fill='none' stroke='%232c2f35' stroke-width='4.4' opacity='0.3'/%3E%3Cellipse cx='29' cy='12.9' rx='21' ry='5.6' fill='none' stroke='url(%23c)' stroke-width='3.1'/%3E%3C/g%3E%3Cellipse cx='50.8' cy='13.4' rx='2.7' ry='2.4' fill='%231e1a14'/%3E%3C/svg%3E"),linear-gradient(to right,transparent 0 24px,var(--fam-goals) 24px 36px,transparent 36px)}
.binding::after{content:"";position:absolute;top:0;bottom:0;right:0;width:8px;background:linear-gradient(to right,rgba(42,46,110,.10),transparent)}
.sitebar{display:flex;align-items:center;gap:12px;margin:0 calc(-1*clamp(16px,4vw,44px)) 0 calc(-1*clamp(48px,7vw,84px));padding:12px 18px 12px clamp(48px,7vw,84px);background:var(--fam-goals-wash);border-bottom:3px solid var(--ink);position:relative;z-index:4}
.burger{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border:2px solid var(--ink);border-radius:10px;background:var(--raised);box-shadow:0 4px 0 0 var(--ink);font-weight:900}
.wordmark{font-family:var(--hand);font-weight:700;font-size:1.5rem;letter-spacing:.01em;background:var(--hl);padding:.05em .45em;border-radius:6px;transform:rotate(-1deg);display:inline-block;text-decoration:none;color:var(--ink)}
.sitebar .right{margin-left:auto;font-size:.8rem;color:var(--ink-soft);font-weight:500}
h1{font-family:var(--hand);font-weight:700;font-size:clamp(2.2rem,5vw,3.2rem);line-height:1.05;margin:26px 0 4px;text-wrap:balance}
.lede{color:var(--ink-soft);font-style:italic;margin:.2rem 0 1rem;max-width:64ch}
nav.toc{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;margin:14px 0 8px}
nav.toc a{display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--ink);background:var(--raised);border:2px solid var(--ink);border-left-width:8px;border-radius:0 12px 12px 0;padding:.35rem .7rem;font-weight:700;font-size:.9rem;box-shadow:0 3px 0 0 var(--ink)}
nav.toc a:hover,nav.toc a:focus-visible{background:var(--hl);outline:none}
nav.toc a .n{font-family:var(--hand);font-size:1.15rem;min-width:1.2em;text-align:center}
section{margin-top:34px}
.band{display:flex;align-items:center;gap:12px;margin:0 calc(-1*clamp(16px,4vw,44px)) 12px calc(-1*clamp(48px,7vw,84px));padding:12px 18px 12px clamp(48px,7vw,84px);border-bottom:3px solid var(--ink);position:relative;z-index:2}
.band h2,.band h3{margin:0;font-family:var(--hand);font-weight:700;color:#000;font-size:clamp(1.6rem,3.4vw,2.2rem);line-height:1}
.band h3{font-size:clamp(1.3rem,2.6vw,1.7rem)}
.band.sub{margin-top:30px;padding-block:9px}
.band-emoji{font-size:1.6rem;line-height:1}
.band-pill{margin-left:auto;font-family:var(--body);font-weight:900;font-size:.85rem;background:var(--hl);border:2px solid #000;border-radius:999px;min-width:2.1em;text-align:center;padding:.15em .5em;color:#000}
.band .open{margin-left:auto}
.fam-goals>.band,.band.fam-goals{background:var(--fam-goals)} .fam-practice>.band,.band.fam-practice{background:var(--fam-practice)} .fam-review>.band,.band.fam-review{background:var(--fam-review)} .fam-svplay>.band,.band.fam-svplay{background:var(--fam-svplay)} .fam-oral>.band,.band.fam-oral{background:var(--fam-oral)} .fam-tools>.band,.band.fam-tools{background:var(--fam-tools)} .fam-user>.band,.band.fam-user{background:var(--fam-user)}
nav.toc a.fam-goals{border-left-color:var(--fam-goals)} nav.toc a.fam-practice{border-left-color:var(--fam-practice)} nav.toc a.fam-user{border-left-color:var(--fam-user)}
h3.plain{font-family:var(--hand);font-weight:700;font-size:1.45rem;margin:26px 0 4px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
h4{font-family:var(--body);font-weight:900;font-size:1.15rem;margin:24px 0 4px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding-left:.6rem;border-left:6px solid var(--band,var(--ink))}
.fam-practice h4{--band:var(--fam-practice)} .fam-review h4{--band:var(--fam-review)} .fam-svplay h4{--band:var(--fam-svplay)} .fam-oral h4{--band:var(--fam-oral)} .fam-tools h4{--band:var(--fam-tools)} .fam-user h4{--band:var(--fam-user)}
a.open{font-family:var(--body);font-weight:700;font-size:.72rem;letter-spacing:.03em;text-transform:uppercase;text-decoration:none;color:var(--ink);background:var(--raised);border:1.5px solid var(--ink);border-radius:999px;padding:.2em .7em;box-shadow:0 2px 0 0 var(--ink);white-space:nowrap}
a.open:hover,a.open:focus-visible{background:var(--hl);outline:none}
p{margin:.6rem 0;max-width:70ch} ul,ol{margin:.4rem 0;padding-left:1.35rem;max-width:72ch} li{margin:.22rem 0} li>ul,li>ol{margin:.15rem 0}
strong{font-weight:700} a{color:var(--fam-practice-ink)}
code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.88em;background:var(--code);padding:.05em .35em;border-radius:.25em}
.scroll{overflow-x:auto;margin:.7rem 0}
pre{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.78rem;line-height:1.35;background:var(--raised);border:1.5px solid var(--ink);border-left:6px solid var(--fam-goals);border-radius:0 10px 10px 0;padding:.9rem 1rem;margin:0;white-space:pre}
table{border-collapse:collapse;width:100%;font-size:.92rem;font-variant-numeric:tabular-nums;background:var(--raised);border:1.5px solid var(--ink);border-radius:10px;overflow:hidden}
th,td{text-align:left;padding:.4rem .6rem;border-bottom:1px solid var(--rule);vertical-align:top}
th{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-soft);border-bottom:2px solid var(--ink);background:var(--paper-2)}
tr:last-child td{border-bottom:0}
figure.shot{margin:14px 0 18px;padding:12px;background:var(--raised);border:1.5px solid var(--ink);border-radius:14px;box-shadow:0 4px 0 0 var(--ink)}
.shots{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start;justify-content:center}
.shots img{max-width:100%;height:auto;border-radius:14px;border:2px solid var(--ink);box-shadow:0 8px 20px rgba(34,40,80,.18);background:#fff}
.shots img.phone{width:230px} .shots img.wide{width:min(100%,560px)}
figcaption{font-family:var(--hand);font-weight:700;font-size:1.05rem;color:var(--ink-soft);margin-top:10px;text-align:center;text-wrap:balance}
.footer{margin-top:40px;font-size:.8rem;color:var(--ink-soft);border-top:1px solid var(--rule);padding-top:10px}
.totop{position:fixed;right:16px;bottom:16px;z-index:9;width:46px;height:46px;border-radius:50%;background:var(--hl);border:2px solid var(--ink);box-shadow:0 4px 0 0 var(--ink);display:flex;align-items:center;justify-content:center;text-decoration:none;color:var(--ink);font-weight:900}
:focus-visible{outline:3px solid var(--fam-practice);outline-offset:2px}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
@media (max-width:520px){.shots img.phone{width:min(100%,260px)} .band .open,h4 a.open,h3.plain a.open{font-size:.66rem}}
"""

def main():
    import sys
    artifact = sys.argv[1] if len(sys.argv) > 1 else None
    body, toc = render(SRC.read_text())
    toc_html = "".join(f"<a href='#s{n}' class='fam-{fam}'><span class='n'>{n}</span>{inline(t)}</a>" for n, t, fam in toc)
    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>FluOLinGo Plain Guide</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Roboto:wght@400;500;700;900&display=swap">
<style>{CSS}</style></head><body>
<main class="sheet"><div class="binding" aria-hidden="true"></div>
<div class="sitebar"><span class="burger" aria-hidden="true">☰</span><a class="wordmark" href="{SITE}/home" target="_blank" rel="noopener">FluOLinGo</a><span class="right">the plain guide · <a href="{SITE}" target="_blank" rel="noopener">fluolingo.com</a></span></div>
{body.replace('</p>', '</p><nav class="toc" aria-label="Contents">' + toc_html + '</nav>', 1)}
<p class="footer">Every screen above is a real screenshot of the app as built on 13 Sep 2026, at phone width (390px) unless it says desktop. Text checked against the code the same day. Source: <code>docs/GUIDE.md</code> in the fluoduo repository.</p>
</main>
<a class="totop" href="#top" aria-label="Back to contents" onclick="window.scrollTo({{top:0,behavior:'smooth'}});return false;">↑</a>
</body></html>"""
    OUT.write_text(page)
    print(f"wrote {OUT.relative_to(ROOT)} ({len(page)//1024} KB, {len(toc)} sections, {page.count('<figure')} figures)")
    if artifact:
        # The Artifact host supplies doctype/html/head/body; it wants <title> and <style> first.
        inner = page.split("<head>", 1)[1].split("</head>", 1)
        head, rest = inner[0], inner[1]
        head = re.sub(r'<meta[^>]*>', '', head)
        bodyhtml = rest.split("<body>", 1)[1].rsplit("</body>", 1)[0]
        pathlib.Path(artifact).write_text(head.strip() + "\n" + bodyhtml)
        print(f"wrote {artifact}")

if __name__ == "__main__":
    main()
