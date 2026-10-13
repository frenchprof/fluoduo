"""For slides whose narration mixes languages: speak each piece in the right voice,
join the pieces into one soundtrack, and have HeyGen lip-sync the clone to it.
English = Dan's English clone; French and Chinese = Dan's 'dan-23aug' voice.
usage: python3 mixed.py audio <slide ...>    build soundtracks only (cheap)
       python3 mixed.py video <slide ...>    upload soundtracks and make the clone videos
The API key is added by the network proxy; nothing here holds it."""
import json, os, re, subprocess, sys, time

S = __file__.rsplit("/hg/", 1)[0]
H = f"{S}/hg"
EN, NATIVE = "d8ac22b7d66c4419b49dfbbad3feefd3", "244cb273d5284ec086a30493819f3562"
AVATAR = "5f06a739dafd4e7ca246686f541a8272"
GAP = {"en": 0.12, "fr": 0.25, "zh": 0.25}       # breath before/after a foreign piece
SEG = json.load(open(f"{H}/segments.json"))
LOG = f"{H}/mixed-log.json"
log = json.load(open(LOG)) if os.path.exists(LOG) else {}


def curl(*a):
    return json.loads(subprocess.check_output(["curl", "-sS", "--max-time", "300", *a]))


def tts(text, voice, lang, out):
    if os.path.exists(out):
        return
    body = {"text": text, "voice_id": voice, "language": lang}
    for attempt in range(3):
        r = curl("-X", "POST", "https://api.heygen.com/v3/voices/speech", "-H", "Content-Type: application/json",
                 "-d", json.dumps(body))
        u = (r.get("data") or {}).get("audio_url")
        if u:
            subprocess.run(["curl", "-sS", "--max-time", "300", "-o", out + ".mp3", u], check=True)
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", out + ".mp3", "-ar", "48000", "-ac", "1", out], check=True)
            os.remove(out + ".mp3")
            return
        print("tts retry", text[:40], json.dumps(r)[:200], flush=True)
        time.sleep(5)
    raise SystemExit("tts failed: " + text[:60])


def soundtrack(s):
    d = f"{H}/mix/{s}"
    os.makedirs(d, exist_ok=True)
    parts = []
    for i, (k, text) in enumerate(SEG[s]):
        f = f"{d}/{i:03d}-{k}.wav"
        tts(text, EN if k == "en" else NATIVE, k, f)
        parts.append((k, f))
    # silence between pieces, then concatenate
    sil = {}
    for k, g in GAP.items():
        sil[k] = f"{d}/sil-{k}.wav"
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r=48000:cl=mono",
                        "-t", str(g), sil[k]], check=True)
    seq = []
    for i, (k, f) in enumerate(parts):
        if i:
            seq.append(sil["fr"] if (k != "en" or parts[i - 1][0] != "en") else sil["en"])
        seq.append(f)
    with open(f"{d}/list.txt", "w") as fh:
        fh.writelines(f"file '{p}'\n" for p in seq)
    out = f"{H}/mix/{s}.mp3"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{d}/list.txt",
                    "-af", "loudnorm=I=-16:TP=-1.5", "-ar", "44100", "-ac", "1", "-b:a", "160k", out], check=True)
    return out


def video(s, mp3):
    up = curl("-X", "POST", "https://api.heygen.com/v3/assets", "-F", f"file=@{mp3}")
    aid = up["data"]["asset_id"]
    r = curl("-X", "POST", "https://api.heygen.com/v3/videos", "-H", "Content-Type: application/json", "-d",
             json.dumps({"type": "avatar", "avatar_id": AVATAR, "audio_asset_id": aid,
                         "title": f"Ohio talk — {s} (mixed)", "resolution": "720p", "aspect_ratio": "16:9"}))
    vid = r["data"]["video_id"]
    log[s] = {"asset_id": aid, "video_id": vid}
    json.dump(log, open(LOG, "w"), indent=1)
    return vid


if __name__ == "__main__":
    mode, ids = sys.argv[1], sys.argv[2:]
    if mode == "audio":
        for s in ids:
            print("soundtrack", s, soundtrack(s), flush=True)
    elif mode == "video":
        running = {}
        for s in ids:
            running[s] = video(s, soundtrack(s))
            print("submitted", s, running[s], flush=True)
        while running:
            time.sleep(20)
            for s, vid in list(running.items()):
                d = curl(f"https://api.heygen.com/v3/videos/{vid}").get("data") or {}
                if d.get("status") == "completed":
                    os.makedirs(f"{H}/av", exist_ok=True)
                    subprocess.run(["curl", "-sS", "--max-time", "600", "-o", f"{H}/av/{s}.mp4", d["video_url"]], check=True)
                    print("done", s, d.get("duration"), flush=True)
                    del running[s]
                elif d.get("status") == "failed":
                    print("FAILED", s, json.dumps(d)[:300], flush=True)
                    del running[s]
