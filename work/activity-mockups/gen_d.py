# -*- coding: utf-8 -*-
"""The three User activities."""
import io
from base import page, bottombar

F = {}

# ── 18 · My Progress — the learner's own analytics ─────────────────────────
TIERS = (["#7be650"]*11 + ["#f8c20d"]*4 + ["#db3834"]*2 + ["#e3ddd1"]*3) * 2 + \
        ["#7be650"]*4 + ["#f8c20d"]*3 + ["#e3ddd1"]*3
heat = "".join(f'<i style="background:{c}"></i>' for c in TIERS[:50])

F["MyProgress.dc.html"] = page("""
.strip{display:flex;gap:7px;padding:9px 14px;border-bottom:1.5px solid #e3ddd1;background:#fefbf7}
.strip .m{flex:1;text-align:center;min-width:0}
.strip .v{font-size:15px;font-weight:900;line-height:1.05;font-variant-numeric:tabular-nums}
.strip .l{font-size:8.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;
  color:#655c55;margin-top:2px}
.heat{display:grid;grid-template-columns:repeat(25,minmax(0,1fr));gap:2px}
.heat i{display:block;height:17px;border-radius:2px}
.segs{display:flex;border:1.5px solid #312620;border-radius:10px;overflow:hidden;background:#fff}
.segs div{flex:1;text-align:center;padding:8px 0;font-size:12.5px;font-weight:800;color:#655c55}
.segs div.on{background:#312620;color:#d4f24c}
.orow{border:1.5px solid #e3ddd1;border-radius:11px;background:#fefbf7;overflow:hidden}
.ohead{display:flex;align-items:center;gap:9px;padding:9px 11px}
.obar{width:52px;height:8px;border-radius:999px;background:#e3ddd1;overflow:hidden;flex-shrink:0}
.oitem{display:flex;gap:9px;padding:7px 11px 7px 30px;border-top:1px solid #f0ece2;font-size:12.5px}
""", f"""
<div class="screen">
  <div class="topbar"><span style="font-weight:900;font-size:17px">\U0001F4CA My Progress</span></div>
  <div class="strip">
    <div class="m"><div class="v" style="color:#b71c0e">N4</div><div class="l">level</div></div>
    <div class="m"><div class="v" style="color:#b80071">12</div><div class="l">streak</div></div>
    <div class="m"><div class="v" style="color:#1e7729">38%</div><div class="l">course</div></div>
    <div class="m"><div class="v mono" style="color:#8b5700">6 420</div><div class="l">XP</div></div>
    <div class="m"><div class="v mono">184</div><div class="l">words</div></div>
  </div>
  <div class="body" style="gap:12px;padding:14px">
    <div>
      <div class="eyebrow" style="margin-bottom:6px">Fifty outcomes — colour is accuracy</div>
      <div class="heat">{heat}</div>
    </div>
    <div class="segs"><div class="on">Fix</div><div>Exercises</div><div>History</div>
      <div>Journey</div></div>
    <div class="eyebrow">Hardest, worst first</div>
    <div class="orow">
      <div class="ohead">
        <span style="flex:1;font-size:13.5px;font-weight:800">SIO-024 · partitive articles</span>
        <span class="obar"><span style="display:block;width:31%;height:100%;
          background:#db3834"></span></span>
        <span class="mono" style="font-size:12px;font-weight:800;color:#bb0916">31%</span>
      </div>
      <div class="oitem"><span style="flex:1" lang="fr">de l’eau</span>
        <span style="color:#bb0916;font-weight:800">4 misses</span></div>
      <div class="oitem"><span style="flex:1" lang="fr">pas de pain</span>
        <span style="color:#bb0916;font-weight:800">3 misses</span></div>
    </div>
    <div class="orow">
      <div class="ohead">
        <span style="flex:1;font-size:13.5px;font-weight:800">SIO-031 · à / en + places</span>
        <span class="obar"><span style="display:block;width:54%;height:100%;
          background:#f8c20d"></span></span>
        <span class="mono" style="font-size:12px;font-weight:800;color:#8b5700">54%</span>
      </div>
    </div>
    <div class="btn" style="width:100%;margin-top:auto;border-color:#bb0916;color:#bb0916;
      box-shadow:0 2px 0 0 #bb0916">CORRIGER MAINTENANT</div>
  </div>
  {bottombar("review")}
</div>
""")

# ── 19 · Leaderboard ───────────────────────────────────────────────────────
F["Leaderboard.dc.html"] = page("""
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
.rk{border-radius:999px;padding:1px 8px;font-size:10.5px;font-weight:800;white-space:nowrap}
""", f"""
<div class="screen">
  <div class="topbar"><span style="font-weight:900;font-size:17px">\U0001F3C6 Leaderboard</span></div>
  <div class="body ruled">
    <div class="tabs"><div class="on">This week</div><div>All term</div></div>
    <div class="soft" style="padding:11px 12px">
      <div class="eyebrow">Around you</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
        <div class="row"><span class="pos">11</span><span class="nm">Priya S.</span>
          <span class="rk" style="color:#fff;background:#2bb6c2">Bavard</span>
          <span class="xp">1 480</span></div>
        <div class="row me"><span class="pos">12</span><span class="nm">You</span>
          <span class="rk" style="color:#1c5e8a;background:#def3f5;
            box-shadow:inset 0 0 0 1.5px #2bb6c2">Voyageur</span>
          <span class="xp">1 320</span></div>
        <div class="row"><span class="pos">13</span><span class="nm">Wei Lin T.</span>
          <span class="rk" style="color:#2a2e6e;background:rgba(123,191,46,.18)">Explorateur</span>
          <span class="xp">1 190</span></div>
      </div>
      <div class="sub" style="margin-top:9px;font-size:12px">160 XP to 11th. About three
        exercises.</div>
    </div>
    <div>
      <div class="eyebrow" style="margin-bottom:7px">Leading</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div class="row"><span class="pos">1</span><span class="nm">Amara O.</span>
          <span class="rk" style="color:#4a3a00;background:linear-gradient(110deg,#ffd34d,#fff3b0,
            #ffd34d);box-shadow:inset 0 0 0 2px #e3a700">Maître</span>
          <span class="xp">3 040</span></div>
        <div class="row"><span class="pos">2</span><span class="nm">Jun H.</span>
          <span class="rk" style="color:#fff;background:linear-gradient(100deg,#e0567f,#e8852e)">
            Virtuose</span><span class="xp">2 875</span></div>
        <div class="row"><span class="pos">3</span><span class="nm">Sofia M.</span>
          <span class="rk" style="color:#fff;background:#8a5fd4">Complice</span>
          <span class="xp">2 610</span></div>
      </div>
    </div>
    <div class="sub" style="text-align:center;font-size:11.5px;margin-top:auto">
      Name and XP only — nothing else about anyone is ever shown here.</div>
  </div>
  {bottombar("review")}
</div>
""")

# ── 20 · Profile — level, badges, the shop ─────────────────────────────────
BADGES = [("\U0001F389","Premier pas",1),("\U0001F9ED","En route",1),("\U0001F3D4️","À mi-chemin",0),
          ("\U0001F525","Assidu",1),("\U0001F525","En feu",1),("\U0001F31F","Inarrêtable",0)]
GEM = "\U0001F48E"
def _badge(e, n, h):
    cls = ' has' if h else ''
    gray = '' if h else ' style="filter:grayscale(1)"'
    price = '✓ earned' if h else GEM + ' 20'
    return (f'<div class="bg{cls}"><span class="e"{gray}>{e}</span>'
            f'<span class="n">{n}</span><span class="p">{price}</span></div>')
badges = "".join(_badge(e, n, h) for e, n, h in BADGES)

F["Profile.dc.html"] = page("""
.lvl{width:66px;height:66px;border-radius:999px;border:4px solid #312620;background:#eef7c0;
  display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
.lvl .k{font-size:9.5px;font-weight:800;line-height:1}
.lvl .v{font-size:25px;font-weight:900;line-height:1}
.xpbar{height:11px;border-radius:999px;border:2px solid #312620;background:#fff;overflow:hidden;
  margin-top:6px}
.xpbar i{display:block;height:100%;width:42%;background:#d4f24c}
.bgs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
.bg{border:1.5px solid #e3ddd1;border-radius:11px;background:#fff;padding:9px 5px;text-align:center;
  opacity:.6;display:flex;flex-direction:column;gap:3px;align-items:center}
.bg.has{border:2px solid #312620;background:#eef7c0;opacity:1}
.bg .e{font-size:20px;line-height:1}
.bg .n{font-size:10.5px;font-weight:800;line-height:1.15}
.bg .p{font-size:9.5px;font-weight:700;color:#655c55}
.shop{display:flex;gap:7px}
.sw{flex:1;height:38px;border-radius:9px;border:2px solid rgba(49,38,32,.3)}
.sw.on{border:2px solid #312620;box-shadow:0 2px 0 0 #312620}
""", f"""
<div class="screen">
  <div class="topbar"><span class="hand" style="font-size:22px;flex:1">\U0001F396️ Your Profile</span>
  </div>
  <div class="body ruled" style="gap:12px;padding:14px">
    <div class="card" style="padding:13px">
      <div style="display:flex;gap:13px;align-items:center">
        <div class="lvl"><span class="k">LVL</span><span class="v">4</span></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:17px;font-weight:900" lang="fr">Voyageur</div>
          <div class="xpbar"><i></i></div>
          <div class="sub" style="font-size:11.5px;margin-top:4px">420 / 1 000 XP → level 5</div>
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px">
        <span class="chip" style="border-color:#8b5700;color:#8b5700">⭐ 6 420 XP</span>
        <span class="chip" style="border-color:#b80071;color:#b80071">\U0001F525 12 d · ×2</span>
        <span class="chip" style="border-color:#0059c4;color:#0059c4">\U0001F48E 85</span>
        <span class="chip">\U0001F4DA 184 words</span>
      </div>
    </div>
    <div>
      <div class="eyebrow" style="margin-bottom:7px">Badges — each pays 💎 once</div>
      <div class="bgs">{badges}</div>
    </div>
    <div>
      <div class="eyebrow" style="margin-bottom:7px">Shop — your accent colour</div>
      <div class="shop">
        <span class="sw on" style="background:#e0384e"></span>
        <span class="sw" style="background:#e0567f"></span>
        <span class="sw" style="background:#2bb6c2"></span>
        <span class="sw" style="background:#8a5fd4"></span>
        <span class="sw" style="background:#2f9e56"></span>
        <span class="sw" style="background:#c8a24b"></span>
      </div>
      <div class="sub" style="font-size:11.5px;margin-top:7px">It repaints your home page only.
        Purely decorative — nothing here blocks learning.</div>
    </div>
  </div>
  {bottombar("review")}
</div>
""")

for n, s in F.items():
    io.open(n, "w", encoding="utf-8").write(s)
print("D:", ", ".join(sorted(F)))
