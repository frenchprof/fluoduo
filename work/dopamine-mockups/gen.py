# -*- coding: utf-8 -*-
import io, os

FONTS = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
         'family=Work+Sans:wght@400;500;600;700;800;900&family=Patrick+Hand&display=swap">')

BASE = """
*{box-sizing:border-box}
body{margin:0;width:390px;height:844px;overflow:hidden;
  font-family:'Work Sans',system-ui,-apple-system,sans-serif;color:#312620;background:#e3ddd4;
  -webkit-font-smoothing:antialiased}
a{color:#2d54a0}a:hover{color:#123780}
.screen{width:390px;height:844px;display:flex;flex-direction:column;background:#faf6ee;
  position:relative;overflow:hidden}
.body{flex:1;min-height:0;overflow:hidden;padding:14px;display:flex;flex-direction:column;gap:12px}
.ruled{background-image:repeating-linear-gradient(to bottom,transparent 0 27px,#e3ddd1 27px 28px);
  background-position:0 6px}
.card{background:#fefbf7;border:2px solid #312620;border-radius:14px;box-shadow:0 2px 0 0 #312620;
  padding:14px}
.soft{background:#fefbf7;border:1.5px solid #e3ddd1;border-radius:12px;padding:12px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;
  font-weight:600;font-size:15px;border:1.5px solid #312620;border-radius:10px;padding:10px 18px;
  background:#faf6ee;color:#312620;box-shadow:0 2px 0 0 #312620}
.btn-accent{background:#d4f24c;border-color:#a6c130;box-shadow:0 2px 0 0 #a6c130}
.btn-dark{background:#312620;color:#d4f24c;box-shadow:0 2px 0 0 #191c50}
.topbar{height:56px;display:flex;align-items:center;gap:12px;padding:0 14px;
  border-bottom:2px solid #e3ddd1;background:#fefbf7;flex-shrink:0}
.bottombar{height:64px;display:flex;align-items:stretch;background:#fefbf7;
  border-top:2px solid #cabfaf;flex-shrink:0;margin-top:auto}
.slot{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
  color:#655c55}
.slot .ic{font-size:22px;line-height:1}
.slot .lb{font-size:10px;font-weight:800}
.slot.on{color:#2d54a0}
.hand{font-family:'Patrick Hand',cursive;font-weight:400}
.mono{font-variant-numeric:tabular-nums}
.eyebrow{font-size:10px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:#655c55}
.h2{font-size:19px;font-weight:800;letter-spacing:-.01em;line-height:1.15}
.sub{font-size:13px;line-height:1.45;color:#655c55}
.chip{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:4px 11px;
  font-size:12px;font-weight:700;border:1.5px solid #e3ddd1;background:#fff}
.marks{display:flex;background:#fefbf7;border-top:2px solid #312620}
.marks>div{flex:1;padding:8px 2px;text-align:center;border-left:1px solid #e3ddd1;min-width:0}
.marks>div:first-child{border-left:0}
.mv{font-size:15px;font-weight:900;line-height:1.05}
.ml{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#655c55;
  margin-top:2px}
"""

def page(title, extra_css, body):
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  {FONTS}
  <style>{BASE}{extra_css}</style>
</helmet>
{body}
</x-dc>
</body>
</html>
"""

def bottombar(active="index"):
    items = [("index","\U0001F4D6","Index"),("svplay","\U0001F3AE","SvPlay"),
             ("review","\U0001F501","Review"),("skills","\U0001F4AA","Skills")]
    out = ['<div class="bottombar">']
    for k,ic,lb in items:
        on = " on" if k==active else ""
        out.append(f'<div class="slot{on}"><span class="ic">{ic}</span><span class="lb">{lb}</span></div>')
    out.append('</div>')
    return "".join(out)

def hero_head():
    """The real Home hero: gradient band, greeting, byline."""
    return ('<div style="padding:13px 15px 11px;background:linear-gradient(120deg,#dae5f9 0%,'
            '#f5f0e4 45%,#d4f24c 100%)">'
            '<div style="font-size:21px;font-weight:900;line-height:1.05;letter-spacing:-.02em">'
            'Bienvenue sur <span style="background:#d4f24c;padding:0 4px;border-radius:3px;'
            'box-decoration-break:clone">FluOlinGo</span></div>'
            '<div class="hand" style="font-size:14px;color:#655c55;margin-top:3px">par Dr Chan</div>'
            '</div>')

FILES = {}

# ── 1 · Install ─────────────────────────────────────────────────────────────
FILES["Install.dc.html"] = page("Install", """
.scrim{position:absolute;inset:0;background:rgba(49,38,32,.42)}
.sheet{position:absolute;left:0;right:0;bottom:0;background:#fefbf7;border-top:2px solid #312620;
  border-radius:18px 18px 0 0;padding:20px 18px 24px;display:flex;flex-direction:column;gap:14px}
.grab{width:44px;height:4px;border-radius:999px;background:#cabfaf;align-self:center}
.appicon{width:64px;height:64px;border-radius:15px;border:2px solid #312620;background:#faf6ee;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  box-shadow:0 2px 0 0 #312620;overflow:hidden}
""", f"""
<div class="screen">
  {hero_head()}
  <div class="marks">
    <div><div class="mv mono">19/50</div><div class="ml">course</div></div>
    <div><div class="mv">12<b style="color:#bc4945">×2</b></div><div class="ml">streak</div></div>
  </div>
  <div class="body ruled"></div>
  {bottombar()}
  <div class="scrim"></div>
  <div class="sheet">
    <div class="grab"></div>
    <div style="display:flex;gap:14px;align-items:center">
      <div class="appicon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <rect x="9" y="5" width="24" height="30" rx="2.5" fill="#d4f24c" stroke="#312620"
            stroke-width="2.2"/>
          <path d="M15 13h12M15 19h12M15 25h7" stroke="#312620" stroke-width="2.2"
            stroke-linecap="round"/>
          <path d="M7 9h5M7 15h5M7 21h5M7 27h5" stroke="#312620" stroke-width="2.6"
            stroke-linecap="round"/>
        </svg>
      </div>
      <div style="min-width:0">
        <div class="h2">Keep FluOlinGo a thumb away</div>
        <div class="sub" style="margin-top:4px">Add it to your home screen — one tap into
          your revision, no link to hunt for.</div>
      </div>
    </div>
    <div style="display:flex;gap:9px">
      <div class="btn btn-accent" style="flex:1">Add</div>
      <div class="btn" style="flex:0 0 auto">Later</div>
    </div>
    <div style="font-size:11px;color:#867f78;text-align:center">
      Shown once, after your third visit.</div>
  </div>
</div>
""")

# ── 2 · Objectif du jour (Main) ─────────────────────────────────────────────
FILES["Main.dc.html"] = page("Objectif du jour", """
.ring{transform:rotate(-90deg)}
.ringwrap{position:relative;width:92px;height:92px;flex-shrink:0}
.ringnum{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
  justify-content:center}
""", f"""
<div class="screen">
  {hero_head()}
  <div class="marks">
    <div><div class="mv mono">19/50</div><div class="ml">course</div></div>
    <div><div class="mv">12<b style="color:#bc4945">×2</b></div><div class="ml">streak</div></div>
  </div>
  <div class="body ruled">
    <div class="card" style="display:flex;gap:15px;align-items:center;padding:16px">
      <div class="ringwrap">
        <svg class="ring" width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">
          <circle cx="46" cy="46" r="38" fill="none" stroke="#e3ddd1" stroke-width="11"/>
          <circle cx="46" cy="46" r="38" fill="none" stroke="#7be650" stroke-width="11"
            stroke-linecap="round" stroke-dasharray="238.8" stroke-dashoffset="95.5"/>
        </svg>
        <div class="ringnum">
          <div style="font-size:25px;font-weight:900;line-height:1">3</div>
          <div style="font-size:11px;font-weight:700;color:#655c55;line-height:1">sur 5</div>
        </div>
      </div>
      <div style="min-width:0">
        <div class="eyebrow">Objectif du jour</div>
        <div class="h2" style="margin-top:3px">2 answers to go</div>
        <div class="sub" style="margin-top:4px">About two minutes. Finish it and your streak holds.</div>
      </div>
    </div>
    <div class="btn btn-accent" style="width:100%">Continue &nbsp;▶</div>
    <div class="soft" style="display:flex;gap:11px;align-items:center">
      <span style="font-size:20px">\U0001F5FA️</span>
      <div style="min-width:0;flex:1">
        <div style="font-size:15px;font-weight:800">The Map</div>
        <div class="sub" style="font-size:12px">Unité 3 · Identity Heights</div>
      </div>
      <span style="font-weight:900;color:#655c55">›</span>
    </div>
  </div>
  {bottombar()}
</div>
""")

# ── 3 · Celebrations ────────────────────────────────────────────────────────
CONFETTI = "".join(
    f'<i style="left:{x}px;top:{y}px;background:{c};animation-delay:{d}s;'
    f'transform:rotate({r}deg)"></i>'
    for x,y,c,d,r in [(38,92,"#f8c20d",0,18),(96,58,"#7be650",.35,-24),(150,104,"#d42a8f",.15,40),
                      (212,66,"#00c5c9",.5,-12),(268,110,"#f76143",.25,30),(322,74,"#f8c20d",.45,-38),
                      (66,140,"#0075e3",.6,22),(190,148,"#7be650",.7,-30),(300,152,"#d42a8f",.55,14),
                      (128,186,"#f8c20d",.8,-20),(248,192,"#00c5c9",.9,34)])

FILES["Celebrations.dc.html"] = page("Celebrations", """
.scrim{position:absolute;inset:0;background:rgba(49,38,32,.34)}
.conf{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.conf i{position:absolute;width:9px;height:13px;border-radius:2px;opacity:.95;
  animation:fall 2.6s linear infinite}
@keyframes fall{0%{transform:translateY(-14px) rotate(0)}100%{transform:translateY(620px) rotate(400deg)}}
@media (prefers-reduced-motion:reduce){.conf i{animation:none}}
.big{position:absolute;left:22px;right:22px;top:212px;background:#fefbf7;border:2px solid #312620;
  border-radius:18px;box-shadow:0 4px 0 0 #312620;padding:22px 20px;text-align:center;
  display:flex;flex-direction:column;gap:9px;align-items:center}
.tier{display:flex;align-items:center;gap:10px;border:1.5px solid #e3ddd1;border-radius:11px;
  background:#fefbf7;padding:9px 11px}
.dot{width:9px;height:9px;border-radius:999px;flex-shrink:0}
""", f"""
<div class="screen">
  <div class="topbar"><span style="font-weight:900;font-size:17px">Unité 3</span></div>
  <div class="body ruled"></div>
  {bottombar()}
  <div class="scrim"></div>
  <div class="conf">{CONFETTI}</div>
  <div class="big">
    <div style="font-size:44px;line-height:1">\U0001F3D4️</div>
    <div style="font-size:23px;font-weight:900;letter-spacing:-.02em;color:#b71c0e">
      Unit 3 complete!</div>
    <div class="sub">Ten objectives, all of them done. Identity Heights is yours.</div>
    <div style="display:flex;gap:8px;margin-top:3px">
      <span class="chip" style="border-color:#8b5700;color:#8b5700">⭐ +1 200 XP</span>
      <span class="chip" style="border-color:#0059c4;color:#0059c4">\U0001F48E +20</span>
    </div>
    <div class="btn btn-accent" style="width:100%;margin-top:5px">Continue</div>
  </div>
  <div style="position:absolute;left:22px;right:22px;bottom:84px;display:flex;flex-direction:column;
    gap:7px">
    <div class="eyebrow" style="color:#fefbf7">The celebration ladder</div>
    <div class="tier"><span class="dot" style="background:#00c5c9"></span>
      <span style="font-size:12.5px;font-weight:700;flex:1">Word mastered</span>
      <span style="font-size:11px;color:#655c55">chime</span></div>
    <div class="tier"><span class="dot" style="background:#d42a8f"></span>
      <span style="font-size:12.5px;font-weight:700;flex:1">Streak · ×1.5 tier</span>
      <span style="font-size:11px;color:#655c55">flame + sound</span></div>
    <div class="tier"><span class="dot" style="background:#7be650"></span>
      <span style="font-size:12.5px;font-weight:700;flex:1">Daily goal hit</span>
      <span style="font-size:11px;color:#655c55">short confetti</span></div>
    <div class="tier" style="border-color:#312620;box-shadow:0 2px 0 0 #312620">
      <span class="dot" style="background:#f76143"></span>
      <span style="font-size:12.5px;font-weight:800;flex:1">Unit finished</span>
      <span style="font-size:11px;font-weight:700">full fanfare</span></div>
  </div>
</div>
""")

# ── 4 · +XP float ───────────────────────────────────────────────────────────
FILES["XpFloat.dc.html"] = page("XP float", """
.opt{display:flex;align-items:center;justify-content:center;min-height:48px;border-radius:12px;
  border:2px solid rgba(42,46,110,.22);background:#fff;font-weight:600;font-size:15px;
  box-shadow:0 2px 0 0 rgba(42,46,110,.18);padding:10px 12px}
.opt.ok{border-color:#1e7729;background:#d5f7ca;box-shadow:0 2px 0 0 #1e7729}
.float{position:absolute;right:34px;top:196px;display:flex;flex-direction:column;align-items:center;
  gap:2px;animation:rise 2.4s ease-out infinite}
@keyframes rise{0%{transform:translateY(16px);opacity:0}
  18%{opacity:1}70%{opacity:1}100%{transform:translateY(-52px);opacity:0}}
@media (prefers-reduced-motion:reduce){.float{animation:none}}
.xpbig{font-size:27px;font-weight:900;color:#8b5700;letter-spacing:-.02em;
  text-shadow:0 1px 0 #fefbf7}
.xpmul{font-size:12px;font-weight:800;color:#b80071;background:#ffd5ee;border:1.5px solid #b80071;
  border-radius:999px;padding:1px 8px}
.tray{position:absolute;left:0;right:0;bottom:0;background:#d5f7ca;border-top:2px solid #1e7729;
  padding:15px 16px 20px;display:flex;align-items:center;gap:12px}
.hintdots{display:flex;gap:3px;align-items:center}
.hintdots i{width:6px;height:6px;border-radius:999px;background:rgba(49,38,32,.25);display:block}
""", """
<div class="screen">
  <div class="topbar" style="border-bottom-color:rgba(49,38,32,.1)">
    <span style="font-size:19px;font-weight:900;color:rgba(49,38,32,.5)">✕</span>
    <div style="flex:1;height:14px;border-radius:999px;background:rgba(49,38,32,.1);overflow:hidden">
      <div style="width:62%;height:100%;border-radius:999px;background:#10b981"></div>
    </div>
    <div style="display:flex;align-items:center;gap:6px;color:rgba(49,38,32,.7)">
      <span style="font-size:18px;font-weight:900">?</span>
      <span class="hintdots"><i></i><i></i><i></i></span>
    </div>
  </div>
  <div class="body" style="padding:26px 18px;gap:16px">
    <div class="eyebrow">Complete the sentence</div>
    <div style="font-size:22px;font-weight:700;line-height:1.35" lang="fr">
      Je bois <span style="border-bottom:2.5px dashed #cabfaf;padding:0 26px">&nbsp;</span> eau.</div>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:6px">
      <div class="opt">du</div>
      <div class="opt ok">de l’</div>
      <div class="opt">de la</div>
      <div class="opt">des</div>
    </div>
  </div>
  <div class="float">
    <span class="xpbig">+60</span>
    <span class="xpmul">40 × 1,5</span>
  </div>
  <div class="tray">
    <span style="font-size:26px">✅</span>
    <div style="flex:1;min-width:0">
      <div style="font-size:16px;font-weight:900;color:#1e7729">Nice!</div>
      <div style="font-size:12.5px;color:#1e7729">Before a vowel, always <b>de l’</b>.</div>
    </div>
    <div class="btn" style="border-color:#1e7729;background:#7be650;box-shadow:0 2px 0 0 #1e7729">
      Next</div>
  </div>
</div>
""")

# ── 5 · Streak ──────────────────────────────────────────────────────────────
FILES["Streak.dc.html"] = page("Streak", """
.flame{width:54px;height:54px;border-radius:999px;background:#ffd5ee;border:2px solid #d42a8f;
  display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;
  animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
@media (prefers-reduced-motion:reduce){.flame{animation:none}}
.days{display:flex;gap:6px}
.day{flex:1;height:38px;border-radius:9px;border:1.5px solid #e3ddd1;background:#fff;display:flex;
  flex-direction:column;align-items:center;justify-content:center;gap:1px}
.day.on{background:#ffd5ee;border-color:#d42a8f}
.day .d{font-size:10px;font-weight:800;color:#655c55}
.day.on .d{color:#b80071}
""", f"""
<div class="screen">
  <div class="topbar"><span style="font-weight:900;font-size:17px">Your streak</span></div>
  <div class="body ruled">
    <div class="card" style="display:flex;gap:14px;align-items:center;border-color:#d42a8f;
      box-shadow:0 2px 0 0 #d42a8f">
      <div class="flame">\U0001F525</div>
      <div style="min-width:0">
        <div class="h2" style="color:#b80071">3 days in a row</div>
        <div class="sub" style="margin-top:3px">Everything you do now earns
          <b style="color:#b80071">1.5×</b> the XP.</div>
      </div>
    </div>
    <div class="days">
      <div class="day on"><span class="d">LUN</span><span style="font-size:13px">\U0001F525</span></div>
      <div class="day on"><span class="d">MAR</span><span style="font-size:13px">\U0001F525</span></div>
      <div class="day on"><span class="d">MER</span><span style="font-size:13px">\U0001F525</span></div>
      <div class="day"><span class="d">JEU</span><span style="font-size:13px;color:#cabfaf">•</span></div>
      <div class="day"><span class="d">VEN</span><span style="font-size:13px;color:#cabfaf">•</span></div>
      <div class="day"><span class="d">SAM</span><span style="font-size:13px;color:#cabfaf">•</span></div>
      <div class="day"><span class="d">DIM</span><span style="font-size:13px;color:#cabfaf">•</span></div>
    </div>
    <div class="soft" style="display:flex;gap:12px;align-items:center;border-color:#0059c4;
      background:#d2eaff">
      <span style="font-size:24px">\U0001F9CA</span>
      <div style="min-width:0;flex:1">
        <div style="font-size:14.5px;font-weight:800;color:#0059c4">1 streak freeze in reserve</div>
        <div class="sub" style="font-size:12px;color:#0059c4">A missed day is covered automatically.
          Recharges every fortnight.</div>
      </div>
    </div>
    <div class="soft">
      <div class="eyebrow">Next tier</div>
      <div style="display:flex;align-items:center;gap:9px;margin-top:7px">
        <div style="flex:1;height:11px;border-radius:999px;background:#e3ddd1;overflow:hidden">
          <div style="width:43%;height:100%;border-radius:999px;background:#d42a8f"></div></div>
        <span style="font-size:12px;font-weight:800;color:#b80071">7 j → ×2</span>
      </div>
    </div>
  </div>
  {bottombar("review")}
</div>
""")

# ── 6 · Coloured reward cues ────────────────────────────────────────────────
FILES["HeroMarks.dc.html"] = page("Hero marks", """
.legend{display:flex;flex-direction:column;gap:6px}
.lrow{display:flex;align-items:center;gap:9px;font-size:12.5px}
.lsw{width:13px;height:13px;border-radius:3px;border:1px solid rgba(49,38,32,.3);flex-shrink:0}
""", f"""
<div class="screen">
  {hero_head()}
  <div class="marks">
    <div><div class="mv mono" style="color:#1e7729">19/50</div><div class="ml">course</div></div>
    <div><div class="mv" style="color:#b80071">12<span style="font-size:11px">×2</span></div>
      <div class="ml">streak</div></div>
  </div>
  <div class="body ruled">
    <div class="soft">
      <div class="eyebrow">One colour per role</div>
      <div class="legend" style="margin-top:9px">
        <div class="lrow"><span class="lsw" style="background:#7be650"></span>
          <b style="flex:1">course</b><span style="color:#655c55">progress · #1e7729 · 5.26:1</span></div>
        <div class="lrow"><span class="lsw" style="background:#d42a8f"></span>
          <b style="flex:1">streak</b><span style="color:#655c55">streak · #b80071 · 5.96:1</span></div>
      </div>
      <div class="sub" style="margin-top:11px;padding-top:10px;border-top:1px solid #e3ddd1">
        Two marks since round 12 — the rest derive, and moved to /moi and /profil.
        The multiplier stops borrowing <b>--fluo-danger</b>, the error token.</div>
    </div>
    <div class="soft" style="display:flex;gap:11px;align-items:center">
      <span style="font-size:20px">\U0001F501</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:15px;font-weight:800">DéjàRevu</div>
        <div class="sub" style="font-size:12px">7 words to review</div>
      </div>
      <span style="background:#db3834;color:#fff;border-radius:999px;padding:2px 9px;font-size:12px;
        font-weight:800">7</span>
    </div>
  </div>
  {bottombar()}
</div>
""")

# ── 7 · Variable reward ─────────────────────────────────────────────────────
FILES["Variable.dc.html"] = page("Variable reward", """
.banner{border:2px solid #8b5700;border-radius:14px;background:linear-gradient(120deg,#ffedc1,#f8c20d);
  padding:15px;display:flex;gap:13px;align-items:center;box-shadow:0 2px 0 0 #8b5700}
.gold{position:relative;border:2px solid #c8a24b;border-radius:12px;padding:13px;
  background:linear-gradient(135deg,#fff7e0,#ffeaa8 55%,#fff7e0);box-shadow:0 2px 0 0 #c8a24b}
.goldtag{position:absolute;top:-9px;right:11px;background:#c8a24b;color:#3a2b04;font-size:10px;
  font-weight:900;letter-spacing:.06em;border-radius:999px;padding:2px 9px;
  border:1.5px solid #8b5700}
.opt{display:flex;align-items:center;justify-content:center;min-height:46px;border-radius:12px;
  border:2px solid rgba(42,46,110,.22);background:#fff;font-weight:600;font-size:15px;
  box-shadow:0 2px 0 0 rgba(42,46,110,.18)}
""", f"""
<div class="screen">
  <div class="topbar"><span style="font-weight:900;font-size:17px">4Mémoire</span></div>
  <div class="body">
    <div class="banner">
      <span style="font-size:30px">\U0001F31E</span>
      <div style="min-width:0">
        <div style="font-size:17px;font-weight:900;color:#8b5700;letter-spacing:-.01em">
          First of the day — ×3</div>
        <div class="sub" style="font-size:12.5px;color:#8b5700">Your first right answer today counts triple.
          The multiplier changes every day.</div>
      </div>
    </div>
    <div class="gold" style="margin-top:4px">
      <span class="goldtag">MOT EN OR</span>
      <div class="eyebrow" style="color:#8b5700">Translate</div>
      <div style="font-size:24px;font-weight:800;margin-top:5px" lang="fr">la boulangerie</div>
      <div class="sub" style="margin-top:5px;color:#8b5700">About one card in thirty is gilded — it pays triple.</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:2px">
      <div class="opt">the bakery</div>
      <div class="opt">the butcher</div>
      <div class="opt">the grocer</div>
      <div class="opt">the chemist</div>
    </div>
    <div class="soft" style="margin-top:auto;display:flex;gap:11px;align-items:center">
      <span style="font-size:20px">\U0001F4E6</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:800">Weekly chest</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:5px">
          <div style="flex:1;height:9px;border-radius:999px;background:#e3ddd1;overflow:hidden">
            <div style="width:71%;height:100%;border-radius:999px;background:#7be650"></div></div>
          <span style="font-size:11px;font-weight:800;color:#1e7729">5 j / 7</span>
        </div>
      </div>
    </div>
  </div>
  {bottombar("review")}
</div>
""")

# ── 8 · Session receipt ─────────────────────────────────────────────────────
FILES["Receipt.dc.html"] = page("Session receipt", """
.line{display:flex;align-items:baseline;gap:9px;padding:8px 0;border-bottom:1px dashed #e3ddd1}
.line:last-child{border-bottom:0}
.line .k{font-size:13.5px;color:#655c55;flex:1}
.line .v{font-size:16px;font-weight:900;font-variant-numeric:tabular-nums}
""", f"""
<div class="screen">
  <div class="topbar"><span style="font-weight:900;font-size:17px">Session complete</span></div>
  <div class="body ruled">
    <div class="card">
      <div class="hand" style="font-size:26px;line-height:1.1">Nice work.</div>
      <div style="margin-top:9px">
        <div class="line"><span class="k">XP earned</span>
          <span class="v" style="color:#8b5700">+740</span></div>
        <div class="line"><span class="k">of that, the ×1.5 multiplier</span>
          <span class="v" style="color:#b80071;font-size:14px">+246</span></div>
        <div class="line"><span class="k">Right</span>
          <span class="v" style="color:#1e7729">11 / 14</span></div>
        <div class="line"><span class="k">Streak</span>
          <span class="v" style="color:#b80071">12 d \U0001F525</span></div>
      </div>
    </div>
    <div class="soft" style="border-color:#1e7729;background:#d5f7ca">
      <div class="eyebrow" style="color:#1e7729">What’s improving</div>
      <div style="font-size:14.5px;font-weight:700;margin-top:4px;color:#1e7729">
        Partitive articles — 4 of 4 today.</div>
    </div>
    <div class="soft" style="border-color:#bb0916;background:#ffd9d2">
      <div class="eyebrow" style="color:#bb0916">One thing to fix</div>
      <div style="font-size:14.5px;font-weight:700;margin-top:4px;color:#bb0916" lang="fr">
        au / à la / à l’ before places</div>
      <div class="btn" style="margin-top:10px;width:100%;border-color:#bb0916;background:#fff;
        color:#bb0916;box-shadow:0 2px 0 0 #bb0916">Corriger maintenant</div>
    </div>
    <div style="display:flex;gap:9px;margin-top:auto">
      <div class="btn btn-accent" style="flex:1">Again</div>
      <div class="btn" style="flex:1">Home</div>
    </div>
  </div>
</div>
""")

# ── 9 · Weekly leaderboard ──────────────────────────────────────────────────
FILES["Leaderboard.dc.html"] = page("Leaderboard", """
.tabs{display:flex;border:1.5px solid #312620;border-radius:999px;overflow:hidden;background:#fff}
.tabs div{flex:1;text-align:center;padding:8px 0;font-size:13px;font-weight:800;color:#655c55}
.tabs div.on{background:#312620;color:#d4f24c}
.row{display:flex;align-items:center;gap:11px;padding:10px 12px;border:1.5px solid #e3ddd1;
  border-radius:11px;background:#fff}
.row.me{border:2px solid #312620;background:#d4f24c;box-shadow:0 2px 0 0 #312620}
.pos{font-size:14px;font-weight:900;width:24px;text-align:right;font-variant-numeric:tabular-nums;
  color:#655c55}
.nm{flex:1;font-size:14.5px;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap}
.xp{font-size:13.5px;font-weight:900;font-variant-numeric:tabular-nums}
""", f"""
<div class="screen">
  <div class="topbar"><span style="font-weight:900;font-size:17px">\U0001F3C6 Leaderboard</span></div>
  <div class="body ruled">
    <div class="tabs"><div class="on">This week</div><div>All term</div></div>
    <div class="soft" style="padding:11px 12px">
      <div class="eyebrow">Around you</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
        <div class="row"><span class="pos">11</span><span class="nm">Priya S.</span>
          <span class="xp">1 480</span></div>
        <div class="row me"><span class="pos">12</span><span class="nm">You</span>
          <span class="xp">1 320</span></div>
        <div class="row"><span class="pos">13</span><span class="nm">Wei Lin T.</span>
          <span class="xp">1 190</span></div>
      </div>
      <div class="sub" style="margin-top:9px;font-size:12px">160 XP to 11th. About three exercises.</div>
    </div>
    <div>
      <div class="eyebrow" style="margin-bottom:7px">Leading</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div class="row"><span class="pos">1</span><span class="nm">Amara O.</span>
          <span class="xp">3 040</span></div>
        <div class="row"><span class="pos">2</span><span class="nm">Jun H.</span>
          <span class="xp">2 875</span></div>
        <div class="row"><span class="pos">3</span><span class="nm">Sofia M.</span>
          <span class="xp">2 610</span></div>
      </div>
    </div>
    <div class="sub" style="text-align:center;font-size:11.5px;margin-top:auto">
      Resets Monday at 00:00. Nobody drops — everyone starts level.</div>
  </div>
  {bottombar("review")}
</div>
""")

# ── 10 · Boutique ───────────────────────────────────────────────────────────
FILES["Boutique.dc.html"] = page("Boutique", """
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
.item{border:1.5px solid #e3ddd1;border-radius:11px;background:#fff;padding:8px;display:flex;
  flex-direction:column;gap:6px;align-items:center}
.item .sw{width:100%;height:44px;border-radius:7px;border:1.5px solid rgba(49,38,32,.28)}
.item .nm{font-size:11px;font-weight:800;text-align:center;line-height:1.2}
.item .pr{font-size:11px;font-weight:800;color:#0059c4}
.week{border:2px solid #c8a24b;border-radius:13px;background:linear-gradient(120deg,#fff7e0,#ffeaa8);
  padding:13px;display:flex;gap:12px;align-items:center;box-shadow:0 2px 0 0 #c8a24b}
""", f"""
<div class="screen">
  <div class="topbar">
    <span style="font-weight:900;font-size:17px;flex:1">Shop</span>
    <span class="chip" style="border-color:#0059c4;color:#0059c4">\U0001F48E 85</span>
  </div>
  <div class="body ruled" style="gap:14px">
    <div class="week">
      <span style="font-size:28px">\U0001F5DD️</span>
      <div style="min-width:0;flex:1">
        <div style="font-size:10px;font-weight:900;letter-spacing:.1em;color:#8b5700">
          THIS WEEK ONLY</div>
        <div style="font-size:15.5px;font-weight:900;margin-top:2px">« Marseille » cover</div>
        <div class="sub" style="font-size:11.5px;color:#8b5700">Leaves Sunday ·
          \U0001F48E 40</div>
      </div>
    </div>
    <div>
      <div class="eyebrow" style="margin-bottom:8px">Notebook covers</div>
      <div class="grid">
        <div class="item"><span class="sw" style="background:linear-gradient(135deg,#2d54a0,#123780)"></span>
          <span class="nm">Navy</span><span class="pr">\U0001F48E 20</span></div>
        <div class="item"><span class="sw" style="background:linear-gradient(135deg,#e0caae,#a78967)"></span>
          <span class="nm">Kraft</span><span class="pr">\U0001F48E 20</span></div>
        <div class="item"><span class="sw" style="background:linear-gradient(135deg,#d42a8f,#b80071)"></span>
          <span class="nm">Magenta</span><span class="pr">\U0001F48E 30</span></div>
      </div>
    </div>
    <div>
      <div class="eyebrow" style="margin-bottom:8px">Tab sets</div>
      <div class="grid">
        <div class="item">
          <span class="sw" style="background:linear-gradient(90deg,#cbb7e6 0 33%,#8fd3cd 33% 66%,#f3cba0 66%)"></span>
          <span class="nm">Pastel</span><span class="pr">✓ owned</span></div>
        <div class="item">
          <span class="sw" style="background:linear-gradient(90deg,#f8c20d 0 33%,#f76143 33% 66%,#d42a8f 66%)"></span>
          <span class="nm">Citrus</span><span class="pr">\U0001F48E 25</span></div>
        <div class="item">
          <span class="sw" style="background:linear-gradient(90deg,#312620 0 33%,#655c55 33% 66%,#cabfaf 66%)"></span>
          <span class="nm">Ink</span><span class="pr">\U0001F48E 25</span></div>
      </div>
    </div>
    <div>
      <div class="eyebrow" style="margin-bottom:8px">Desk</div>
      <div class="grid">
        <div class="item"><span class="sw" style="background:linear-gradient(135deg,#8b6a48,#6e4f33)"></span>
          <span class="nm">Wood</span><span class="pr">\U0001F48E 30</span></div>
        <div class="item"><span class="sw" style="background:linear-gradient(135deg,#1e7729,#0f4f1a)"></span>
          <span class="nm">Felt</span><span class="pr">\U0001F48E 30</span></div>
        <div class="item"><span class="sw" style="background:linear-gradient(135deg,#e3ddd4,#cabfaf)"></span>
          <span class="nm">Lino</span><span class="pr">✓ owned</span></div>
      </div>
    </div>
  </div>
  {bottombar("review")}
</div>
""")

for name, src in FILES.items():
    io.open(name, "w", encoding="utf-8").write(src)
print("wrote", len(FILES), "artboards:", ", ".join(sorted(FILES)))
