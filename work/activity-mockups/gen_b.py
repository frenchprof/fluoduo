# -*- coding: utf-8 -*-
"""The four SvPlay games — each keeps its own world, as it does today."""
import io
from base import page

F = {}

# ── 6 · NumBus — hear a French number, type the digits before time runs out ─
F["NumBus.dc.html"] = page("""
.sky{background:linear-gradient(180deg,#8fd3f4 0%,#c7e9fb 58%,#e8f4d9 58%,#dcecc8 100%)}
.road{position:absolute;left:0;right:0;bottom:150px;height:74px;background:#4a4640;
  border-top:4px solid #6b665e}
.road::after{content:"";position:absolute;top:34px;left:0;right:0;height:5px;
  background:repeating-linear-gradient(to right,#f8c20d 0 30px,transparent 30px 56px)}
.bus{position:absolute;left:96px;bottom:176px;font-size:74px;animation:roll 3.4s ease-in-out infinite}
@keyframes roll{0%,100%{transform:translateX(-10px)}50%{transform:translateX(10px)}}
@media (prefers-reduced-motion:reduce){.bus{animation:none}}
.dest{position:absolute;left:0;right:0;top:96px;display:flex;flex-direction:column;
  align-items:center;gap:13px}
.entry{width:214px;height:82px;border-radius:13px;border:3px solid #312620;background:#fefbf7;
  box-shadow:0 4px 0 0 #312620;display:flex;align-items:center;justify-content:center;
  font-size:42px;font-weight:900;letter-spacing:.1em;font-variant-numeric:tabular-nums}
.timer{width:214px;height:11px;border-radius:999px;background:rgba(49,38,32,.16);overflow:hidden}
.timer i{display:block;height:100%;border-radius:999px;background:#f76143;width:58%}
""", """
<div class="game sky">
  <div class="gamebar" style="background:rgba(255,255,255,.55)">
    <span style="font-size:19px;font-weight:900;color:rgba(49,38,32,.5)">✕</span>
    <span class="hud" style="background:#312620;color:#d4f24c">\U0001F68C ligne 42</span>
    <span style="flex:1"></span>
    <span class="hud" style="background:#fff;color:#312620;border:1.5px solid #312620">⭐ 1 240</span>
    <span class="hud" style="background:#ffd5ee;color:#b80071;border:1.5px solid #b80071">\U0001F525 ×2</span>
  </div>
  <div class="dest">
    <div style="font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;
      color:#312620">Which bus was called?</div>
    <div style="display:flex;gap:9px">
      <span class="hud" style="background:#fefbf7;border:2px solid #312620">\U0001F50A Écouter</span>
      <span class="hud" style="background:#fefbf7;border:2px solid #312620">\U0001F422 Lentement</span>
    </div>
    <div class="entry">7<span style="opacity:.28">_</span></div>
    <div class="timer"><i></i></div>
    <div style="font-size:12px;font-weight:700;color:#312620">soixante-dix-sept</div>
  </div>
  <div class="road"></div>
  <div class="bus">\U0001F68C</div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:150px;padding:14px 16px 20px;
    display:flex;flex-direction:column;gap:9px;background:rgba(255,255,255,.72)">
    <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px">
      <div class="tile" style="justify-content:center">1</div>
      <div class="tile" style="justify-content:center">2</div>
      <div class="tile" style="justify-content:center">3</div>
      <div class="tile" style="justify-content:center">4</div>
      <div class="tile" style="justify-content:center">5</div>
      <div class="tile" style="justify-content:center">6</div>
      <div class="tile" style="justify-content:center">7</div>
      <div class="tile" style="justify-content:center">8</div>
      <div class="tile" style="justify-content:center">9</div>
      <div class="tile" style="justify-content:center">0</div>
    </div>
  </div>
</div>
""")

# ── 7 · NumBourse — the trading floor, ticket expiring ──────────────────────
F["NumBourse.dc.html"] = page("""
.floor{background:radial-gradient(120% 80% at 50% 0%,#1d3b2a 0%,#12251b 60%,#0c1a13 100%)}
.board{margin:0 14px;border:3px solid #2f5a41;border-radius:11px;background:#0a1a11;
  padding:15px 14px;box-shadow:inset 0 0 34px rgba(0,0,0,.62)}
.led{font-family:'IBM Plex Mono',ui-monospace,monospace;color:#f8c20d;font-size:44px;
  font-weight:700;letter-spacing:.07em;text-align:center;font-variant-numeric:tabular-nums;
  text-shadow:0 0 13px rgba(248,194,13,.55)}
.tick{display:flex;justify-content:space-between;font-size:11px;font-weight:700;color:#6fce9a;
  letter-spacing:.09em}
.broker{margin:0 14px;border-radius:13px;background:rgba(255,255,255,.07);
  border:1.5px solid rgba(255,255,255,.16);padding:13px;display:flex;gap:11px;align-items:center}
.ticket{margin:0 14px;border-radius:11px;border:2px dashed #f8c20d;padding:12px;
  background:rgba(248,194,13,.09)}
.expire{height:9px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden;
  margin-top:9px}
.expire i{display:block;height:100%;width:34%;border-radius:999px;background:#f76143;
  animation:drain 2.8s linear infinite}
@keyframes drain{from{width:60%}to{width:6%}}
@media (prefers-reduced-motion:reduce){.expire i{animation:none}}
""", """
<div class="game floor">
  <div class="gamebar">
    <span style="font-size:19px;font-weight:900;color:rgba(255,255,255,.5)">✕</span>
    <span class="hud" style="background:rgba(255,255,255,.12);color:#f8c20d">Niveau 6</span>
    <span style="flex:1"></span>
    <span class="hud" style="background:rgba(255,255,255,.12);color:#6fce9a">\U0001F4B0 84 300 €</span>
    <span class="hud" style="background:rgba(255,255,255,.12);color:#f76143">♥ ♥ ♡</span>
  </div>
  <div style="text-align:center;color:#6fce9a;font-size:11px;font-weight:800;letter-spacing:.16em;
    text-transform:uppercase;margin:6px 0 11px">Bourse de Paris · séance volatile</div>
  <div class="board">
    <div class="tick"><span>ACTION</span><span>SÉANCE 14:32</span></div>
    <div class="led" style="margin-top:9px">4 5 _ _ _ _</div>
    <div class="tick" style="margin-top:9px;color:#f8c20d"><span>SAISIS LA VALEUR</span>
      <span>EUR</span></div>
  </div>
  <div class="broker" style="margin-top:15px">
    <span style="font-size:31px">\U0001F9D1‍\U0001F4BC</span>
    <div style="min-width:0">
      <div style="font-size:11px;font-weight:800;letter-spacing:.1em;color:#6fce9a;
        text-transform:uppercase">Le courtier crie</div>
      <div lang="fr" style="color:#fff;font-size:17px;font-weight:700;margin-top:2px">
        quarante-cinq mille six cent quatre-vingt-douze</div>
    </div>
  </div>
  <div class="ticket" style="margin-top:14px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="color:#f8c20d;font-size:12px;font-weight:800;letter-spacing:.09em">
        TICKET · EXPIRE</span>
      <span style="color:#fff;font-size:12px;font-weight:700">2,4 s</span>
    </div>
    <div class="expire"><i></i></div>
  </div>
  <div style="margin:auto 14px 22px;display:flex;gap:9px">
    <div class="btn" style="flex:1;background:#f8c20d;border-color:#8b5700;color:#3a2b04;
      box-shadow:0 3px 0 0 #8b5700">Verrouiller le trade</div>
  </div>
</div>
""")

# ── 8 · VocabulaRain — tiles fall, sort into the right column ───────────────
COLS = [("le","#2d5bff","#d2eaff"),("la","#d11149","#ffd9d2"),("l’","#655c55","#eceae4")]
cols = "".join(
  f'<div class="col" style="border-color:{b}"><div class="colhead" style="background:{b};'
  f'color:#fff">{lab}</div><div class="colbody" style="background:{t}"></div></div>'
  for lab,b,t in COLS)

F["VocabulaRain.dc.html"] = page("""
.rain{background:linear-gradient(180deg,#4a6fa5 0%,#7fa3cc 45%,#b9d1e8 100%)}
.field{flex:1;min-height:0;display:flex;gap:8px;padding:0 12px 12px;position:relative}
.col{flex:1;display:flex;flex-direction:column;border:2px solid;border-radius:11px;overflow:hidden;
  min-width:0}
.colhead{font-size:17px;font-weight:900;text-align:center;padding:7px 0;font-family:'Work Sans'}
.colbody{flex:1;min-height:0}
.drop{position:absolute;border:2px solid #312620;border-radius:10px;background:#fefbf7;
  box-shadow:0 3px 0 0 #312620;padding:8px 13px;font-size:15px;font-weight:700}
.streak{position:absolute;left:0;right:0;top:0;bottom:0;pointer-events:none;
  background:repeating-linear-gradient(14deg,transparent 0 22px,rgba(255,255,255,.16) 22px 24px)}
""", f"""
<div class="game rain">
  <div class="streak"></div>
  <div class="gamebar" style="background:rgba(255,255,255,.2)">
    <span style="font-size:19px;font-weight:900;color:#fff">✕</span>
    <span class="hud" style="background:rgba(255,255,255,.9);color:#312620">Unité 2</span>
    <span style="flex:1"></span>
    <span class="hud" style="background:rgba(255,255,255,.9);color:#1e7729">✓ 14</span>
    <span class="hud" style="background:rgba(255,255,255,.9);color:#bb0916">✗ 2</span>
  </div>
  <div style="text-align:center;color:#fff;font-size:12px;font-weight:800;letter-spacing:.1em;
    text-transform:uppercase;padding:4px 0 10px">Catch each word in its article</div>
  <div class="field">
    {cols}
    <div class="drop" style="left:26px;top:34px" lang="fr">fromage</div>
    <div class="drop" style="left:138px;top:150px" lang="fr">salade</div>
    <div class="drop" style="left:252px;top:76px" lang="fr">eau</div>
    <div class="drop" style="left:44px;top:268px;border-color:#1e7729;background:#d5f7ca;
      box-shadow:0 3px 0 0 #1e7729" lang="fr">pain ✓</div>
  </div>
</div>
""")

# ── 9 · LexicaLater — syllable keys into the chest's keyholes ───────────────
F["LexicaLater.dc.html"] = page("""
.vault{background:linear-gradient(180deg,#3a2a1c 0%,#241a11 62%,#150f0a 100%)}
.chest{margin:0 16px;border:3px solid #c8a24b;border-radius:14px;
  background:linear-gradient(160deg,#6b4a26,#3f2c17);padding:17px 15px;
  box-shadow:0 5px 0 0 rgba(0,0,0,.42),inset 0 0 26px rgba(0,0,0,.4)}
.holes{display:flex;gap:8px;justify-content:center;margin-top:13px}
.hole{flex:1;height:52px;border-radius:8px;border:2px dashed #c8a24b;background:rgba(0,0,0,.34);
  display:flex;align-items:center;justify-content:center;color:#f0dca8;font-size:17px;
  font-weight:800}
.hole.filled{border-style:solid;background:#f8c20d;color:#3a2b04;box-shadow:0 2px 0 0 #8b5700}
.belt{margin-top:auto;border-top:3px solid #c8a24b;background:linear-gradient(180deg,#2b2016,#1a1209);
  padding:15px 0 22px;position:relative;overflow:hidden}
.belt::before{content:"";position:absolute;top:0;left:0;right:0;height:5px;
  background:repeating-linear-gradient(to right,#c8a24b 0 16px,transparent 16px 32px)}
.keys{display:flex;gap:9px;padding:0 14px;animation:slide 6s linear infinite}
@keyframes slide{from{transform:translateX(12px)}to{transform:translateX(-72px)}}
@media (prefers-reduced-motion:reduce){.keys{animation:none}}
.key{border:2px solid #8b5700;border-radius:9px;background:#f8c20d;color:#3a2b04;padding:11px 14px;
  font-size:15px;font-weight:800;flex-shrink:0;box-shadow:0 3px 0 0 #8b5700}
.key.decoy{background:#cabfaf;border-color:#655c55;color:#312620;box-shadow:0 3px 0 0 #655c55}
""", """
<div class="game vault">
  <div class="gamebar">
    <span style="font-size:19px;font-weight:900;color:rgba(255,255,255,.5)">✕</span>
    <span class="hud" style="background:rgba(248,194,13,.16);color:#f8c20d">Niveau 3</span>
    <span style="flex:1"></span>
    <span class="hud" style="background:rgba(248,194,13,.16);color:#f8c20d">\U0001F4B0 7</span>
    <span class="hud" style="background:rgba(247,97,67,.16);color:#f76143">♥ ♥ ♥</span>
  </div>
  <div style="text-align:center;color:#f0dca8;font-size:11px;font-weight:800;letter-spacing:.15em;
    text-transform:uppercase;margin:6px 0 13px">Forge the French from the keys</div>
  <div class="chest">
    <div style="text-align:center;color:#f0dca8;font-size:13px;font-weight:700">the bakery</div>
    <div class="holes">
      <div class="hole filled">bou</div>
      <div class="hole filled">lan</div>
      <div class="hole">?</div>
      <div class="hole">?</div>
    </div>
    <div style="text-align:center;color:#c8a24b;font-size:11px;font-weight:700;margin-top:11px">
      4 syllabes · 2 posées</div>
  </div>
  <div class="belt">
    <div class="keys">
      <div class="key">ge</div><div class="key decoy">lon</div><div class="key">rie</div>
      <div class="key decoy">bou</div><div class="key decoy">tan</div><div class="key">ri</div>
    </div>
  </div>
</div>
""")

for n, s in F.items():
    io.open(n, "w", encoding="utf-8").write(s)
print("B:", ", ".join(sorted(F)))
