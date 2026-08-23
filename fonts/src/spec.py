import sys
from PIL import Image, ImageDraw, ImageFont
path, out, title = sys.argv[1], sys.argv[2], sys.argv[3]
LINES = [
 ("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 58),
 ("abcdefghijklmnopqrstuvwxyz", 58),
 ("0123456789  !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~", 46),
 ("ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ", 46),
 ("àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ", 46),
 ("ĀĂĄĆĈĊČĎĐĒĖĘĚĞĠĢĦĨĪĮİĲĶĹĽŁŃŇŊŌŐŒŔŘŚŞŠŢŤŦŨŮŰŲŴŶŸŹŻŽ", 40),
 ("āăąćĉċčďđēėęěğġģħĩīįıĳķĺľłńňŋōőœŕřśşšţťŧũůűųŵŷÿźżžșț", 40),
 ("¡¿«»‹›„“”‘’•·–—…†‡‰′″§¶©®™°ªº", 44),
 ("¢£¤¥€₹₽₩₺₴₿  ×÷±−≠≤≥≈∞√∑∏∫∂∆∅µπΩ¬", 40),
 ("¼½¾⅓⅔⅛⅜⅝⅞  ⁰¹²³⁴⁵⁶⁷⁸⁹ ₀₁₂₃₄₅₆₇₈₉  ←↑→↓↔↕ ◊★☆♥✓✗", 40),
 ("Français : « Où est le cœur de l'été ? » — Ça va !", 44),
 ("Zażółć gęślą jaźń · Příliš žluťoučký kůň · Größenwahn", 42),
 ("Señor, ¿cuántos años? · Đêm khuya · İstanbul'da · Ærø", 42),
]
W = 1500
H = 70 + sum(int(s*1.65) for _, s in LINES)
img = Image.new("L", (W, H), 255); d = ImageDraw.Draw(img)
y = 24
d.text((30, y), title, font=ImageFont.load_default(), fill=110); y += 26
for text, size in LINES:
    f = ImageFont.truetype(path, size)
    d.text((30, y), text, font=f, fill=0)
    y += int(size*1.65)
img.save(out)
