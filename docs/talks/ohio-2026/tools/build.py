"""Assemble the talk: for each slide, the slide visual (animated clip, looping clip or still)
with the clone's video for that slide in a circle, then join all scenes.

usage: python3 build.py [slide-id ...]   (no ids = every slide that has hg/av/<id>.mp4)
"""
import json, os, subprocess, sys

S = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORDER = ["cover", "scene", "claim", "today", "lesson", "axes", "walk", "moves", "an-loom", "engine",
         "catalogue", "spiral", "an-camera", "mechanics", "an-slot", "transfer", "an-key", "reauthor",
         "goals", "bonus", "useit", "mobile", "ai", "recipe", "status"]
PLACE = json.load(open(f"{S}/comp/placement.json"))
D, RING = PLACE["D"], 7           # circle diameter, white ring width


def visual(s):
    m = f"{S}/motion/{s}"
    if os.path.exists(f"{m}/loop.mp4"):
        return ["-stream_loop", "-1", "-i", f"{m}/loop.mp4"]
    if s in ("moves", "spiral", "mechanics", "transfer"):
        return ["-loop", "1", "-i", f"{m}/still.png"]
    return ["-i", f"{m}/clip.mp4"]


def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                          "-of", "csv=p=0", p]).decode())


def scene(s):
    av = f"{S}/hg/av/{s}.mp4"
    out = f"{S}/comp/scenes/{s}.mp4"
    t = dur(av)
    x0, y0 = PLACE["pos"][s]
    r = D // 2
    # the clone's frame is 1280x720 with the face near (645, 200): crop head and shoulders
    fc = (f"[1:v]scale=1280:720,crop=480:480:405:20,scale={D - 2*RING}:{D - 2*RING},format=rgba[cv];"
          f"[cv][2:v]alphamerge[c];"
          f"[0:v]scale=1920:1080,fps=25,format=yuv420p[bg];"
          f"[bg][3:v]overlay={x0}:{y0}[b1];[b1][c]overlay={x0+RING}:{y0+RING},format=yuv420p[v]")
    cmd = (["ffmpeg", "-loglevel", "error", "-y"] + visual(s) + ["-i", av, "-loop", "1", "-i", f"{S}/comp/mask.png",
           "-loop", "1", "-i", f"{S}/comp/ring.png", "-filter_complex", fc,
           "-map", "[v]", "-map", "1:a", "-t", f"{t:.3f}", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
           "-r", "25", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", out])
    subprocess.run(cmd, check=True)
    return out


if __name__ == "__main__":
    os.makedirs(f"{S}/comp/scenes", exist_ok=True)
    ids = sys.argv[1:] or [s for s in ORDER if os.path.exists(f"{S}/hg/av/{s}.mp4")]
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(4) as ex:
        for s, out in zip(ids, ex.map(scene, ids)):
            print("scene", s, out, flush=True)
    done = [s for s in ORDER if os.path.exists(f"{S}/comp/scenes/{s}.mp4")]
    with open(f"{S}/comp/list.txt", "w") as f:
        for s in done:
            f.write(f"file '{S}/comp/scenes/{s}.mp4'\n")
    if len(done) == len(ORDER):
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i",
                        f"{S}/comp/list.txt", "-c", "copy", "-movflags", "+faststart",
                        f"{S}/comp/FluOLinGo-Ohio-2026.mp4"], check=True)
        print("final", f"{S}/comp/FluOLinGo-Ohio-2026.mp4", dur(f"{S}/comp/FluOLinGo-Ohio-2026.mp4"))
