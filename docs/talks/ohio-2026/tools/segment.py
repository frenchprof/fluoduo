"""Split each slide's narration into English (clone), French and Chinese (native voices).
French = anything in « », plus the bare French words in EXTRA_FR. Chinese = runs of characters.
Pinyin right after a Chinese run is a reading aid on the slide: it is not spoken."""
import json, re, sys

S = __file__.rsplit("/hg/", 1)[0]
SL = f"{S}/artifact-files/bc7ab302-65c8-4257-b282-303304de8325/project/slides"
ORDER = json.load(open(f"{SL}/../deck.json"))["order"]
EXTRA_FR = ["méthode spirale", "ateliers d'expression", "Parcours", "Formes", "Exercice", "Lexique", "Bienvenue", "Merci"]
TONE = "āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ"
CJK = r"[　-〿一-鿿＀-￯]+"
PINYIN = rf"[,，]?\s*(?:[A-Za-z{TONE}ü']*[{TONE}][A-Za-z{TONE}ü']*(?:[\s,]+[A-Za-z{TONE}ü']+)*?)[.?!]?(?=[\s,]|$)"


def narration(s):
    t = re.search(r"<aside>(.*?)</aside>", open(f"{SL}/{s}.html").read(), re.S).group(1).strip()
    t = re.sub(r"^\(\d+:\d+\s*[–-]\s*\d+:\d+\)\s*", "", t)
    # the tone change is heard from the native voice, not spelled out by the English one
    t = t.replace("G-Compris! — said like « j'ai compris », I understood — is for reading", "G-Compris!, I understood, is for reading")
    return t.replace("so 不是 is bú shì.", "so 不是 is said with a rising first tone.")


def skip_pinyin(rest):
    """length of the romanisation that follows a Chinese run (it is on the slide, not spoken)"""
    n, m0 = 0, re.match(r"[,，]?\s*", rest)
    i = m0.end()
    while True:
        m = re.match(rf"([A-Za-z{TONE}ü']+)([,.?!]?)\s*", rest[i:])
        if not m or not (any(c in TONE for c in m.group(1)) or m.group(1).lower() in ("ge",)):
            break
        i += m.end(); n = i
        if m.group(2) in ".?!":
            if m.group(2): break
    return n


def segments(text):
    pat = "|".join([r"«[^»]+»", CJK, r"G-Compris!", r"ÉcouTexte"] + [re.escape(w) + r"\b" for w in EXTRA_FR])
    out, pos = [], 0
    for m in re.finditer(pat, text):
        if m.start() < pos:
            continue
        if m.start() > pos:
            out.append(["en", text[pos:m.start()]])
        frag = m.group(0)
        if re.fullmatch(CJK, frag):
            out.append(["zh", frag])
            pos = m.end() + skip_pinyin(text[m.end():])
        else:
            out.append(["fr", frag.strip("« »")])
            pos = m.end()
    if pos < len(text):
        out.append(["en", text[pos:]])
    # tidy: merge, trim, drop empty English bits made of punctuation only
    clean = []
    for k, v in out:
        v = re.sub(r"\s+", " ", v)
        if k == "en" and not re.search(r"[A-Za-z0-9]", v):
            continue
        if clean and clean[-1][0] == k and k != "en":
            clean.append([k, v.strip()])
        elif clean and clean[-1][0] == k:
            clean[-1][1] += v
        else:
            clean.append([k, v.strip() if k != "en" else v])
    fix = lambda v: {"G-Compris!": "J'ai compris !", "ÉcouTexte": "Écoutexte"}.get(v, v).replace(" + ", " ").replace("___", "…").replace("Enchanté(e)", "Enchanté")
    en = lambda v: re.sub(r"L'[Aa]telier", "Lah-tuh-liay", v.strip().replace("___", "blank"))
    return [[k, fix(v.strip()) if k != "en" else en(v)] for k, v in clean]


if __name__ == "__main__":
    allseg = {s: segments(narration(s)) for s in ORDER}
    json.dump(allseg, open(f"{S}/hg/segments.json", "w"), ensure_ascii=False, indent=1)
    for s in (sys.argv[1:] or ORDER):
        if any(k != "en" for k, _ in allseg[s]):
            print("###", s)
            for k, v in allseg[s]:
                print(f"  {k}: {v}")
