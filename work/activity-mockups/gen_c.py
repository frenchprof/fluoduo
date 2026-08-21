# -*- coding: utf-8 -*-
"""Review (2) + Skills (6)."""
import io
from base import page, drillbar, bottombar

F = {}

# ── 10 · DéjàRevu — what's due, recognition MCQ ─────────────────────────────
F["DejaRevu.dc.html"] = page("""
.due{display:flex;gap:8px}
.duebox{flex:1;border:1.5px solid #e3ddd1;border-radius:11px;background:#fefbf7;padding:9px;
  text-align:center}
.duebox .n{font-size:21px;font-weight:900;line-height:1.05;font-variant-numeric:tabular-nums}
.duebox .l{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;
  color:#655c55;margin-top:2px}
""", f"""
<div class="screen">
  {drillbar(30, 0, 3, "3/10")}
  <div class="body ruled">
    <div class="due">
      <div class="duebox"><div class="n" style="color:#bb0916">10</div><div class="l">due now</div></div>
      <div class="duebox"><div class="n" style="color:#8b5700">4</div><div class="l">tomorrow</div></div>
      <div class="duebox"><div class="n" style="color:#1e7729">128</div><div class="l">resting</div></div>
    </div>
    <div class="card" style="text-align:center;padding:20px 14px">
      <div class="eyebrow">You last saw this 6 days ago</div>
      <div class="h2" style="font-size:29px;margin-top:7px" lang="fr">la fromagerie</div>
      <div class="chip" style="margin-top:11px;border-color:#312620">\U0001F50A Écouter</div>
    </div>
    <div class="grid2">
      <div class="opt">the cheese shop</div>
      <div class="opt">the bakery</div>
      <div class="opt">the butcher</div>
      <div class="opt">the grocer</div>
    </div>
    <div class="sub" style="margin-top:auto;text-align:center;font-size:12px">
      Answer here and the item is rescheduled, exactly as in any drill.</div>
  </div>
</div>
""")

# ── 11 · GramMarathon — typed cloze over the deck's gaps ────────────────────
F["GramMarathon.dc.html"] = page("""
.sent{font-size:22px;line-height:1.5;font-weight:600}
.gap{display:inline-flex;align-items:center;justify-content:center;min-width:96px;
  border-bottom:3px solid #312620;padding:0 8px;font-weight:800}
.pace{display:flex;align-items:center;gap:9px;border:1.5px solid #e3ddd1;border-radius:11px;
  background:#fefbf7;padding:9px 12px}
""", f"""
<div class="screen">
  {drillbar(72, 2, 3, "18/25")}
  <div class="body">
    <div class="eyebrow">Fill the gap — type it</div>
    <div class="sent" lang="fr">Je ne bois <span class="gap">d’</span> eau le matin.</div>
    <div>
      <div class="eyebrow" style="margin-bottom:7px">Word bank</div>
      <div class="bank">
        <div class="tile" lang="fr">d’</div><div class="tile" lang="fr">de l’</div>
        <div class="tile" lang="fr">du</div><div class="tile" lang="fr">pas de</div>
      </div>
    </div>
    <div class="pace">
      <span style="font-size:19px">\U0001F3C3</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:12.5px;font-weight:800">7 in a row</div>
        <div style="height:8px;border-radius:999px;background:#e3ddd1;overflow:hidden;margin-top:5px">
          <div style="width:72%;height:100%;border-radius:999px;background:#7be650"></div></div>
      </div>
      <span class="mono" style="font-size:13px;font-weight:800;color:#655c55">4:12</span>
    </div>
    <div class="btn btn-accent" style="width:100%;margin-top:auto">Vérifier</div>
  </div>
  <div class="xpf" style="right:30px;top:270px"><b>+60</b><s>40 × 1,5</s></div>
</div>
""")

# ── 12 · ConjugaZone — one cell typed; the table is the reward ──────────────
F["ConjugaZone.dc.html"] = page("""
.tbl{border:2px solid #312620;border-radius:12px;overflow:hidden;background:#fefbf7}
.tr{display:flex;border-top:1px solid #e3ddd1}
.tr:first-child{border-top:0}
.tr>div{padding:9px 11px;font-size:14px}
.tr .p{flex:0 0 108px;color:#655c55;font-weight:700;border-right:1px solid #e3ddd1}
.tr .f{flex:1;font-weight:700}
.tr.now{background:#d4f24c}
.tr.now .f{display:flex;align-items:center;gap:2px}
.caret{width:2px;height:19px;background:#312620;animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.caret{animation:none}}
""", f"""
<div class="screen">
  {drillbar(50, 0, 3, "3/6")}
  <div class="body">
    <div style="display:flex;align-items:baseline;gap:9px">
      <div class="h2" lang="fr">vouloir</div>
      <span class="chip" style="border-color:#8a5fd4;color:#8a5fd4">irrégulier</span>
    </div>
    <div class="tbl">
      <div class="tr"><div class="p" lang="fr">je</div><div class="f" lang="fr">veux</div></div>
      <div class="tr"><div class="p" lang="fr">tu</div><div class="f" lang="fr">veux</div></div>
      <div class="tr now"><div class="p" lang="fr">il / elle</div>
        <div class="f" lang="fr">veu<span class="caret"></span></div></div>
      <div class="tr"><div class="p" lang="fr">nous</div>
        <div class="f" style="color:#cabfaf">— — —</div></div>
      <div class="tr"><div class="p" lang="fr">vous</div>
        <div class="f" style="color:#cabfaf">— — —</div></div>
      <div class="tr"><div class="p" lang="fr">ils / elles</div>
        <div class="f" style="color:#cabfaf">— — —</div></div>
    </div>
    <div>
      <div class="eyebrow" style="margin-bottom:7px">Word bank — the same verb’s other forms</div>
      <div class="bank">
        <div class="tile" lang="fr">veut</div><div class="tile" lang="fr">veulent</div>
        <div class="tile" lang="fr">voulons</div><div class="tile" lang="fr">voulez</div>
      </div>
    </div>
    <div class="soft" style="margin-top:auto;text-align:center;border-style:dashed">
      <div class="sub" style="font-size:12px">Finish the run and the whole table opens —
        every form, tap to hear it. <b>Study follows proof.</b></div>
    </div>
  </div>
</div>
""")

# ── 13 · ÉcouTexte — generated mini-text, fill what you hear ────────────────
F["EcouTexte.dc.html"] = page("""
.units{display:flex;gap:7px;overflow:hidden}
.uchip{border:1.5px solid #e3ddd1;border-radius:999px;padding:5px 13px;font-size:12.5px;
  font-weight:800;background:#fff;color:#655c55;flex-shrink:0}
.uchip.on{background:#312620;color:#d4f24c;border-color:#312620}
.wave{display:flex;align-items:flex-end;gap:3px;height:44px}
.wave i{flex:1;border-radius:2px;background:#e0567f;display:block}
.txt{font-size:17px;line-height:2.1;font-weight:500}
.blank{display:inline-flex;min-width:78px;border-bottom:2.5px solid #312620;height:24px;
  vertical-align:-4px}
.blank.done{border-bottom-color:#1e7729;color:#1e7729;font-weight:800;align-items:center;
  justify-content:center}
""", f"""
<div class="screen">
  {drillbar(44, 1, 3, "4/9")}
  <div class="body">
    <div class="units">
      <div class="uchip">Unité 0</div><div class="uchip">1</div>
      <div class="uchip on">Unité 2</div><div class="uchip">3</div><div class="uchip">4</div>
    </div>
    <div class="card" style="padding:15px">
      <div class="wave">
        <i style="height:32%"></i><i style="height:64%"></i><i style="height:44%"></i>
        <i style="height:88%"></i><i style="height:56%"></i><i style="height:100%"></i>
        <i style="height:38%"></i><i style="height:72%"></i><i style="height:50%"></i>
        <i style="height:84%"></i><i style="height:30%"></i><i style="height:62%"></i>
        <i style="height:46%"></i><i style="height:76%"></i><i style="height:36%"></i>
      </div>
      <div style="display:flex;gap:9px;margin-top:12px">
        <div class="chip" style="border-color:#312620;flex:1;justify-content:center">▶ Écouter</div>
        <div class="chip" style="border-color:#312620;flex:1;justify-content:center">\U0001F422 ×0,75</div>
      </div>
    </div>
    <div class="txt" lang="fr">Le matin, Camille prend <span class="blank done">du</span> café
      et <span class="blank"></span> pain. Elle ne mange <span class="blank"></span> fromage.</div>
    <div class="soft" style="margin-top:auto;border-style:dashed">
      <div class="sub" style="font-size:12px">Every text is generated from this unit’s own
        vocabulary — no sentence is ever played twice.</div>
    </div>
  </div>
</div>
""")

# ── 14 · WorDrill — say it out loud, the mic grades you ─────────────────────
F["WorDrill.dc.html"] = page("""
.mic{width:112px;height:112px;border-radius:999px;border:3px solid #1e7729;background:#d5f7ca;
  display:flex;align-items:center;justify-content:center;font-size:46px;align-self:center;
  position:relative;box-shadow:0 3px 0 0 #1e7729}
.mic::after{content:"";position:absolute;inset:-11px;border-radius:999px;
  border:3px solid rgba(30,119,41,.34);animation:ping 1.8s ease-out infinite}
@keyframes ping{0%{transform:scale(.94);opacity:.85}100%{transform:scale(1.16);opacity:0}}
@media (prefers-reduced-motion:reduce){.mic::after{animation:none}}
.grade{display:flex;gap:6px}
.g{flex:1;border-radius:9px;border:1.5px solid #e3ddd1;background:#fefbf7;padding:7px 3px;
  text-align:center;font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;
  color:#655c55}
.g.on{background:#d5f7ca;border-color:#1e7729;color:#1e7729;border-width:2px}
""", f"""
<div class="screen">
  {drillbar(62, 0, 3, "16/26")}
  <div class="body">
    <div class="eyebrow">Say it out loud</div>
    <div class="h2" style="font-size:31px" lang="fr">la boulangerie</div>
    <div class="sub" style="margin-top:-6px">the bakery</div>
    <div class="mic">\U0001F399️</div>
    <div style="text-align:center;font-size:13px;font-weight:800;color:#1e7729">Listening…</div>
    <div class="grade">
      <div class="g on">perfect</div><div class="g">good</div><div class="g">homophone</div>
      <div class="g">close</div><div class="g">miss</div>
    </div>
    <div class="soft" style="margin-top:auto;border-style:dashed">
      <div class="sub" style="font-size:12px">Every Say It item from every deck, in one run.
        The alphabet sits this one out — letters aren’t sayable words.</div>
    </div>
  </div>
</div>
""")

# ── 15 · VoixLà — the TTS studio ────────────────────────────────────────────
F["VoixLa.dc.html"] = page("""
.ta{border:2px solid #a8cdf0;border-radius:16px;background:#fff;padding:15px;font-size:18px;
  line-height:1.5;min-height:132px}
.row{display:flex;gap:8px;align-items:center}
.ctl{border:1.5px solid #312620;border-radius:10px;background:#fefbf7;padding:9px 13px;
  font-size:13.5px;font-weight:700;box-shadow:0 2px 0 0 #312620;min-height:44px;display:flex;
  align-items:center;gap:6px}
.scrub{height:9px;border-radius:999px;background:#e3ddd1;position:relative;margin-top:15px}
.scrub i{display:block;height:100%;width:42%;border-radius:999px;background:#e8852e}
.scrub b{position:absolute;left:42%;top:-6px;width:21px;height:21px;border-radius:999px;
  background:#fefbf7;border:2px solid #312620;transform:translateX(-50%);box-shadow:0 2px 0 0 #312620}
""", f"""
<div class="screen">
  <div class="topbar"><span style="font-weight:900;font-size:17px;flex:1">\U0001F50A VoixLà</span>
    <span class="chip">Le Studio</span></div>
  <div class="body ruled">
    <div class="ta" lang="fr">Je voudrais une baguette et deux croissants, s’il vous plaît.</div>
    <div class="row">
      <div class="ctl">\U0001F469 Voix</div>
      <div class="ctl">×0,75</div>
      <div class="ctl" style="flex:1;justify-content:center;background:#d4f24c;border-color:#a6c130;
        box-shadow:0 2px 0 0 #a6c130">▶ Écouter</div>
    </div>
    <div class="scrub"><i></i><b></b></div>
    <div class="sub" style="font-size:11.5px;text-align:center;margin-top:-4px">
      Drag to any word — speech restarts from the nearest one.</div>
    <div class="soft" style="border-color:#8b5700;background:#ffedc1">
      <div class="row">
        <span style="font-size:22px">\U0001F3A7</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:800;color:#8b5700">Générer le MP3</div>
          <div class="sub" style="font-size:11.5px;color:#8b5700">A real audio file, with true seek
            and a download.</div>
        </div>
      </div>
    </div>
    <div class="soft" style="margin-top:auto;border-style:dashed">
      <div class="sub" style="font-size:12px">Type any French, hear it in the site’s own cast,
        and get the spelling checked on the way.</div>
    </div>
  </div>
  {bottombar("skills")}
</div>
""")

# ── 16 · ComposeIt — Au café, compose the reply from chips ──────────────────
F["ComposeIt.dc.html"] = page("""
.cafe{background:linear-gradient(180deg,#f3e4cd 0%,#faf6ee 42%)}
.bub{max-width:78%;border-radius:15px;padding:10px 13px;font-size:15px;line-height:1.4}
.them{align-self:flex-start;background:#fff;border:1.5px solid #e3ddd1;border-bottom-left-radius:5px}
.me{align-self:flex-end;background:#d4f24c;border:1.5px solid #a6c130;border-bottom-right-radius:5px}
.compose{border:2px solid #312620;border-radius:13px;background:#fefbf7;padding:11px;
  min-height:52px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.ct{border:1.5px solid #312620;border-radius:8px;background:#d4f24c;padding:5px 10px;font-size:14px;
  font-weight:700}
""", f"""
<div class="screen cafe">
  <div class="topbar" style="background:transparent;border-bottom-color:#e3ddd1">
    <span style="font-size:22px">☕</span>
    <span style="font-weight:900;font-size:17px;flex:1" lang="fr">Au café</span>
    <span class="chip">4 / 6</span>
  </div>
  <div class="body" style="gap:9px">
    <div class="bub them" lang="fr">Bonjour ! Qu’est-ce que vous prenez ?</div>
    <div class="bub me" lang="fr">Je voudrais un café, s’il vous plaît.</div>
    <div class="bub them" lang="fr">Très bien. Et avec ceci ?</div>
    <div style="margin-top:auto"></div>
    <div class="eyebrow">Compose your reply</div>
    <div class="compose">
      <span class="ct" lang="fr">Je voudrais</span><span class="ct" lang="fr">aussi</span>
      <span class="ct" lang="fr">un croissant</span>
    </div>
    <div class="bank">
      <div class="tile" lang="fr">l’addition</div><div class="tile" lang="fr">merci</div>
      <div class="tile" lang="fr">une eau</div><div class="tile" lang="fr">c’est tout</div>
    </div>
    <div class="btn btn-accent" style="width:100%">Envoyer</div>
  </div>
</div>
""")

# ── 17 · ChaTutor — ask anything, French or English ─────────────────────────
F["ChaTutor.dc.html"] = page("""
.bub{max-width:80%;border-radius:15px;padding:11px 13px;font-size:14.5px;line-height:1.45}
.them{align-self:flex-start;background:#fff;border:1.5px solid #e3ddd1;border-bottom-left-radius:5px}
.me{align-self:flex-end;background:#dae5f9;border:1.5px solid #2d54a0;border-bottom-right-radius:5px}
.ask{border:2px solid #e3ddd1;border-radius:12px;background:#fff;padding:11px 13px;font-size:14px;
  color:#867f78;min-height:48px;display:flex;align-items:center}
.demo{display:flex;gap:7px;overflow:hidden}
.demo span{border:1.5px solid #8a5fd4;color:#8a5fd4;border-radius:999px;padding:5px 11px;
  font-size:11.5px;font-weight:700;flex-shrink:0;background:#ece2fa}
""", f"""
<div class="screen">
  <div class="topbar"><span style="font-size:22px">\U0001F916</span>
    <span style="font-weight:900;font-size:17px;flex:1" lang="fr">Le Tuteur</span></div>
  <div class="body ruled" style="gap:10px">
    <div class="bub me">Why is it <b>de l’eau</b> and not <b>de la eau</b>?</div>
    <div class="bub them">Because <i lang="fr">eau</i> starts with a vowel. French avoids two
      vowel sounds colliding, so <i lang="fr">de la</i> contracts to <i lang="fr">de l’</i> —
      the same reason you get <i lang="fr">l’école</i>, not <i lang="fr">la école</i>.
      <div style="margin-top:8px"><span class="chip" style="border-color:#312620">\U0001F50A
        Écouter</span></div></div>
    <div style="margin-top:auto"></div>
    <div class="eyebrow">Try asking</div>
    <div class="demo">
      <span>Quiz me on Unité 2</span><span>Explain « en » vs « au »</span><span>Correct my sentence</span>
    </div>
    <div class="ask">Ask anything — in French or English…</div>
  </div>
  {bottombar("skills")}
</div>
""")

for n, s in F.items():
    io.open(n, "w", encoding="utf-8").write(s)
print("C:", ", ".join(sorted(F)))
