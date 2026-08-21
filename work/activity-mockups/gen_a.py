# -*- coding: utf-8 -*-
"""Menu + the five Practice activities."""
import io
from base import page, drillbar, bottombar

F = {}

# ── Main = the Menu itself, the hub these twenty hang off ───────────────────
ACTS = [
 ("\U0001F52E","SpecuLearn","#8a5fd4"),("\U0001F4DA","xPlain","#e0567f"),
 ("\U0001F3B2","EtuDice","#e3a700"),("\U0001F0CF","4Mémoire","#2bb6c2"),
 ("✏️","iComplete","#7bbf2e"),
 ("\U0001F68C","NumBus","#e0567f"),("\U0001F4C8","NumBourse","#0f8a5f"),
 ("\U0001F327️","VocabulaRain","#5b8def"),("\U0001F9F0","LexicaLater","#e3a700"),
 ("\U0001F501","DéjàRevu","#7bbf2e"),
 ("\U0001F3C3","GramMarathon","#3b6fd4"),("\U0001F524","ConjugaZone","#2bb6c2"),
 ("\U0001F3A7","ÉcouTexte","#e0567f"),("\U0001F399️","WorDrill","#7bbf2e"),
 ("\U0001F50A","VoixLà","#e8852e"),
 ("\U0001F9E9","ComposeIt","#7bbf2e"),("\U0001F916","ChaTutor","#8a5fd4"),
 ("\U0001F4CA","My Progress","#5b8def"),("\U0001F3C6","Leaderboard","#e3a700"),
 ("\U0001F464","Profile","#8a5fd4"),
]
tiles = "".join(
  f'<div class="tile" style="border-color:{c}"><span class="e">{e}</span>'
  f'<span class="n">{n}</span></div>' for e,n,c in ACTS)

F["Main.dc.html"] = page("""
.wrap{position:absolute;inset:14px;background:#fdfaf2;border:2px solid #312620;border-radius:18px;
  padding:18px 14px;display:flex;flex-direction:column;gap:14px;box-shadow:0 6px 0 0 rgba(49,38,32,.18)}
.head{display:flex;align-items:center;gap:10px}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;flex:1;min-height:0}
.tile{border:2px solid;border-radius:11px;background:#fff;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:5px;padding:6px 3px;min-height:44px}
.tile .e{font-size:20px;line-height:1}
.tile .n{font-size:9.5px;font-weight:800;text-align:center;line-height:1.15;letter-spacing:-.01em}
.x{width:38px;height:38px;border-radius:999px;border:2px solid #312620;display:flex;
  align-items:center;justify-content:center;font-size:17px;font-weight:900;flex-shrink:0}
""", f"""
<div class="screen ruled">
  <div class="wrap">
    <div class="head">
      <div style="flex:1;font-size:27px;font-weight:900;letter-spacing:-.03em">Menu</div>
      <div class="x">✕</div>
    </div>
    <div class="grid">{tiles}</div>
  </div>
</div>
""")

# ── 1 · SpecuLearn — guess before you're taught ─────────────────────────────
F["SpecuLearn.dc.html"] = page("""
.pic{height:186px;border-radius:14px;border:2px solid #312620;box-shadow:0 2px 0 0 #312620;
  background:linear-gradient(160deg,#ffedc1,#f8c20d 60%,#e8952e);display:flex;align-items:center;
  justify-content:center;font-size:86px}
.tag{align-self:flex-start;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:800;
  border:1.5px solid}
""", f"""
<div class="screen">
  {drillbar(24, 0, 3, "4/17")}
  <div class="body">
    <div class="eyebrow">Guess first — you have not been taught this yet</div>
    <div class="pic">\U0001F950</div>
    <span class="tag" style="border-color:#2d5bff;color:#2d5bff;background:#d2eaff">le · masculin</span>
    <div class="grid2" style="margin-top:2px">
      <div class="opt">the croissant</div>
      <div class="opt">the bread roll</div>
      <div class="opt">the pastry</div>
      <div class="opt">the biscuit</div>
    </div>
    <div class="sub" style="margin-top:auto;text-align:center;font-size:12px">
      A wrong guess still earns XP. Guessing is the exercise.</div>
  </div>
</div>
""")

# ── 2 · xPlain — the lesson pager: rule card, then the ramp ─────────────────
F["XPlain.dc.html"] = page("""
.memo{border:2px solid #a6c130;border-left-width:7px;border-radius:12px;background:#eef7c0;
  padding:14px}
.memo li{margin:5px 0}
.dots{display:flex;gap:5px;justify-content:center}
.dots i{width:7px;height:7px;border-radius:999px;background:#cabfaf;display:block}
.dots i.on{background:#312620;width:20px;border-radius:999px}
""", f"""
<div class="screen">
  {drillbar(12, 0, 3, "2/16")}
  <div class="body ruled">
    <div class="eyebrow">Mémo · 2 of 3</div>
    <div class="memo">
      <div class="h2" lang="fr">L’article partitif</div>
      <div class="sub" style="color:#312620;margin-top:3px">A portion you don’t count.</div>
      <ul style="margin:9px 0 0;padding-left:18px;font-size:15px" lang="fr">
        <li><b style="color:#2d5bff">du</b> + masculin — <i>du pain</i></li>
        <li><b style="color:#d11149">de la</b> + féminin — <i>de la salade</i></li>
        <li><b style="color:#655c55">de l’</b> + voyelle — <i>de l’eau</i></li>
        <li><b style="color:#655c55">des</b> + pluriel — <i>des œufs</i></li>
      </ul>
    </div>
    <div class="soft" style="border-color:#c8a24b;background:#fff7e0">
      <div class="eyebrow" style="color:#8b5700">Careful</div>
      <div style="font-size:14px;margin-top:3px" lang="fr">Après une négation, tout devient
        <b>de</b> : <i>Je ne mange <b>pas de</b> pain.</i></div>
    </div>
    <div class="dots" style="margin-top:auto"><i></i><i class="on"></i><i></i></div>
    <div class="btn btn-accent" style="width:100%">Got it — next</div>
  </div>
</div>
""")

# ── 3 · EtuDice — the d12 that sets where you start on the ramp ─────────────
pips = "".join(f'<span class="pip"></span>' for _ in range(5))
F["EtuDice.dc.html"] = page("""
.die{width:150px;height:150px;border-radius:22px;border:3px solid #312620;background:#fefbf7;
  box-shadow:0 5px 0 0 #312620;display:flex;align-items:center;justify-content:center;
  font-size:62px;font-weight:900;align-self:center;animation:tilt 3s ease-in-out infinite}
@keyframes tilt{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
@media (prefers-reduced-motion:reduce){.die{animation:none}}
.ramp{display:flex;flex-direction:column;gap:5px}
.step{display:flex;align-items:center;gap:9px;border:1.5px solid #e3ddd1;border-radius:10px;
  background:#fefbf7;padding:8px 11px;font-size:13px;font-weight:600}
.step.done{opacity:.42}
.step.here{border:2px solid #312620;background:#d4f24c;box-shadow:0 2px 0 0 #312620}
.step b{width:18px;text-align:right;font-variant-numeric:tabular-nums;color:#655c55}
""", f"""
<div class="screen">
  {drillbar(6, 0, 3, "roll")}
  <div class="body ruled">
    <div class="eyebrow" style="text-align:center">Roll the d12 — it sets where you start</div>
    <div class="die">5</div>
    <div class="h2" style="text-align:center">Start at card 5 of 12</div>
    <div class="sub" style="text-align:center;margin-top:-6px">sentence building</div>
    <div class="ramp">
      <div class="step done"><b>1</b> MCQ</div>
      <div class="step done"><b>2</b> MCQ</div>
      <div class="step done"><b>4</b> gap-fill</div>
      <div class="step here"><b>5</b> sentence building &nbsp;←&nbsp; you start here</div>
      <div class="step"><b>6</b> translation</div>
    </div>
    <div class="btn btn-accent" style="width:100%;margin-top:auto">Play from card 5</div>
    <div class="sub" style="text-align:center;font-size:11.5px;margin-top:-4px">
      Roll low and you get the full ramp — never a punishment, just a longer run.</div>
  </div>
</div>
""")

# ── 4 · 4Mémoire — flashcard, Étudier / Me tester ───────────────────────────
F["Memoire.dc.html"] = page("""
.flip{flex:1;min-height:0;border:2px solid #312620;border-radius:18px;background:#fefbf7;
  box-shadow:0 3px 0 0 #312620;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:11px;padding:22px}
.sw{display:inline-flex;border:1.5px solid #312620;border-radius:999px;overflow:hidden;
  background:#fff;align-self:center}
.sw div{padding:6px 14px;font-size:12.5px;font-weight:800;color:#655c55}
.sw div.on{background:#312620;color:#d4f24c}
""", f"""
<div class="screen">
  {drillbar(38, 0, 3, "9/24")}
  <div class="body">
    <div class="sw"><div class="on">\U0001F4D6 Étudier</div><div>✍️ Me tester</div></div>
    <div class="flip">
      <div style="font-size:74px;line-height:1">\U0001F9C0</div>
      <div class="h2" style="font-size:23px">the cheese</div>
      <div class="sub" style="text-align:center">Tap to turn it over.</div>
    </div>
    <div class="btn btn-accent" style="width:100%">Retourner</div>
    <div style="display:flex;gap:9px">
      <div class="btn" style="flex:1;border-color:#1e7729;color:#1e7729;
        box-shadow:0 2px 0 0 #1e7729">✓ Je le sais</div>
      <div class="btn" style="flex:1;border-color:#8b5700;color:#8b5700;
        box-shadow:0 2px 0 0 #8b5700">↺ À revoir</div>
    </div>
  </div>
</div>
""")

# ── 5 · iComplete — read the English, type the French ───────────────────────
F["IComplete.dc.html"] = page("""
.field{border:2px solid #312620;border-radius:11px;background:#fff;padding:13px 14px;font-size:19px;
  font-weight:600;display:flex;align-items:center;gap:2px;min-height:56px}
.caret{width:2px;height:23px;background:#312620;animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.caret{animation:none}}
""", f"""
<div class="screen">
  {drillbar(56, 1, 3, "13/23")}
  <div class="body">
    <div class="eyebrow">Type it in French</div>
    <div class="h2" style="font-size:25px">the water</div>
    <div class="field" lang="fr">de l’ea<span class="caret"></span></div>
    <div>
      <div class="eyebrow" style="margin-bottom:7px">Word bank</div>
      <div class="bank">
        <div class="tile" lang="fr">de l’</div><div class="tile" lang="fr">eau</div>
        <div class="tile" lang="fr">du</div><div class="tile" lang="fr">la</div>
        <div class="tile" lang="fr">pain</div><div class="tile" lang="fr">des</div>
      </div>
    </div>
    <div class="btn btn-accent" style="width:100%;margin-top:auto">Vérifier</div>
  </div>
</div>
""")

for n, s in F.items():
    io.open(n, "w", encoding="utf-8").write(s)
print("A:", ", ".join(sorted(F)))
