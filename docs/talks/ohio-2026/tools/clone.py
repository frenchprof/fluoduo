"""clone.py <slide-id ...> : lip-sync Dan's clone (office look) to v4/audio/<id>.wav -> v4/av/<id>.mp4.
~$0.0365 per second. Refuses to start if the wallet cannot cover every slide asked for."""
import json, os, subprocess, sys, time
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVATAR = "5f06a739dafd4e7ca246686f541a8272"
LOG = f"{R}/v4/clone-log.json"
log = json.load(open(LOG)) if os.path.exists(LOG) else {}
def curl(*a):
    for k in range(4):
        out = subprocess.run(["curl", "-sS", "--max-time", "600", *a], capture_output=True, text=True).stdout
        try: return json.loads(out)
        except ValueError: time.sleep(3 * (k + 1))
    raise SystemExit("HeyGen gave no answer: " + " ".join(a[:3]))
def dur(p): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))
ids = [s for s in sys.argv[1:] if not os.path.exists(f"{R}/v4/av/{s}.mp4")]
need = sum(dur(f"{R}/v4/audio/{s}.wav") for s in ids) * 0.0365
bal = curl("https://api.heygen.com/v3/users/me")["data"]["wallet"]["remaining_balance"]
print(f"{len(ids)} slides, ~${need:.2f}, balance ${bal:.2f}", flush=True)
if need > bal - 1: raise SystemExit("not enough in the wallet")
os.makedirs(f"{R}/v4/av", exist_ok=True); os.makedirs(f"{R}/v4/mp3", exist_ok=True)
running = {}
for s in ids:
    if s in log and log[s].get("video_id") and not log[s].get("failed"):
        running[s] = log[s]["video_id"]; continue
    mp3 = f"{R}/v4/mp3/{s}.mp3"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", f"{R}/v4/audio/{s}.wav", "-ar", "44100", "-ac", "1", "-b:a", "192k", mp3], check=True)
    aid = curl("-X", "POST", "https://api.heygen.com/v3/assets", "-F", f"file=@{mp3}")["data"]["asset_id"]
    r = curl("-X", "POST", "https://api.heygen.com/v3/videos", "-H", "Content-Type: application/json", "-d",
             json.dumps({"type": "avatar", "avatar_id": AVATAR, "audio_asset_id": aid, "title": f"Ohio talk v4 — {s}",
                         "resolution": "720p", "aspect_ratio": "16:9"}))
    vid = (r.get("data") or {}).get("video_id")
    if not vid: print("SUBMIT FAILED", s, r, flush=True); continue
    log[s] = {"asset_id": aid, "video_id": vid}; json.dump(log, open(LOG, "w"), indent=1)
    running[s] = vid; print("submitted", s, vid, flush=True)
while running:
    time.sleep(30)
    for s, vid in list(running.items()):
        d = curl(f"https://api.heygen.com/v3/videos/{vid}").get("data") or {}
        if d.get("status") == "completed":
            subprocess.run(["curl", "-sS", "--max-time", "900", "-o", f"{R}/v4/av/{s}.mp4", d["video_url"]], check=True)
            print("done", s, d.get("duration"), flush=True); del running[s]
        elif d.get("status") == "failed":
            log[s]["failed"] = True; json.dump(log, open(LOG, "w"), indent=1)
            print("FAILED", s, json.dumps(d)[:300], flush=True); del running[s]
print("balance now", curl("https://api.heygen.com/v3/users/me")["data"]["wallet"]["remaining_balance"], flush=True)
