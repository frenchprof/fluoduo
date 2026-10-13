"""Generate the clone video for each slide (HeyGen v3), in deck order, a few at a time,
never committing more than the wallet holds. Results land in hg/av/<slide>.mp4.
The API key is added by the network proxy; nothing here holds it."""
import json, os, re, subprocess, sys, time

S = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SL = f"{S}/artifact-files/bc7ab302-65c8-4257-b282-303304de8325/project/slides"
ORDER = ["cover", "scene", "claim", "today", "lesson", "axes", "walk", "moves", "an-loom", "engine",
         "catalogue", "spiral", "an-camera", "mechanics", "an-slot", "transfer", "an-key", "reauthor",
         "goals", "bonus", "useit", "mobile", "ai", "recipe", "status"]
AVATAR, VOICE = "5f06a739dafd4e7ca246686f541a8272", "d8ac22b7d66c4419b49dfbbad3feefd3"
PER_SEC = 0.58 / 15.9            # measured on the first test
WPS = 41 / 15.9                  # words per second, measured on the first test
PARALLEL = 4
LOG = f"{S}/hg/gen-log.json"


def api(method, path, body=None):
    cmd = ["curl", "-sS", "--max-time", "120", "-X", method, "https://api.heygen.com" + path,
           "-H", "Content-Type: application/json"]
    if body is not None:
        cmd += ["-d", json.dumps(body)]
    return json.loads(subprocess.check_output(cmd))


def balance():
    return api("GET", "/v3/users/me")["data"]["wallet"]["remaining_balance"]


def script(s):
    t = re.search(r"<aside>(.*?)</aside>", open(f"{SL}/{s}.html").read(), re.S).group(1)
    return re.sub(r"^\(\d+:\d+\s*[–-]\s*\d+:\d+\)\s*", "", t.strip())


def est(s):
    return len(script(s).split()) / WPS * PER_SEC * 1.15


log = json.load(open(LOG)) if os.path.exists(LOG) else {}
todo = [s for s in (sys.argv[1:] or ORDER) if not os.path.exists(f"{S}/hg/av/{s}.mp4")]
running = {}
while todo or running:
    # submit while there is room and money
    while todo and len(running) < PARALLEL:
        s = todo[0]
        committed = sum(est(x) for x in running)
        b = balance()
        if b - committed < est(s) + 0.5:
            print(f"STOP before {s}: balance {b:.2f}, in flight {committed:.2f}, needs {est(s):.2f}", flush=True)
            todo = []
            break
        r = api("POST", "/v3/videos", {"type": "avatar", "avatar_id": AVATAR, "voice_id": VOICE,
                                        "script": script(s), "title": f"Ohio talk — {ORDER.index(s)+1:02d} {s}",
                                        "resolution": "720p", "aspect_ratio": "16:9"})
        vid = (r.get("data") or {}).get("video_id")
        if not vid:
            print("SUBMIT FAILED", s, json.dumps(r)[:300], flush=True)
            todo.pop(0)
            continue
        running[s] = vid
        log[s] = {"video_id": vid}
        json.dump(log, open(LOG, "w"), indent=1)
        print("submitted", s, vid, f"est ${est(s):.2f}", flush=True)
        todo.pop(0)
    time.sleep(20)
    for s, vid in list(running.items()):
        d = api("GET", f"/v3/videos/{vid}").get("data") or {}
        st = d.get("status")
        if st == "completed":
            os.makedirs(f"{S}/hg/av", exist_ok=True)
            subprocess.run(["curl", "-sS", "--max-time", "600", "-o", f"{S}/hg/av/{s}.mp4", d["video_url"]], check=True)
            log[s].update(status="completed", duration=d.get("duration"), subtitle_url=d.get("subtitle_url"))
            print("done", s, d.get("duration"), flush=True)
            del running[s]
        elif st == "failed":
            log[s].update(status="failed", error=json.dumps(d)[:400])
            print("FAILED", s, json.dumps(d)[:300], flush=True)
            del running[s]
        json.dump(log, open(LOG, "w"), indent=1)
print("balance now", balance(), flush=True)
