"""patch.py <slide> <sentence#> "<new text>" <name> : re-say one sentence of a slide.
The slide's own visual for that sentence's window is reused (held on its last frame if the new line runs longer);
new voice + new lip-synced clone; output sped up like the final video."""
import json, os, subprocess, sys
V4 = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); R = os.path.dirname(V4)
sys.path.insert(0, f"{V4}/lib"); import assemble
O = assemble.OUT; SP = 1.1056
sid, k, text, name = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]
T = json.load(open(f"{V4}/timing/{sid}.json")); s = T["sent"][k-1]
a = max(0, s["start"] - 0.15)
voice = text.replace("L'Atelier", "La-tuh-li-eh")
r = json.loads(subprocess.run(["curl","-sS","-X","POST","https://api.heygen.com/v3/voices/speech","-H","Content-Type: application/json","-d",
    json.dumps({"text": voice, "voice_id": "d8ac22b7d66c4419b49dfbbad3feefd3", "language": "en"})], capture_output=True, text=True).stdout)["data"]
pid = f"p_{name}"
subprocess.run(["curl","-sS","-o",f"{V4}/audio/{pid}.wav",r["audio_url"]], check=True)
dur = round(r["duration"] + 0.5, 2)
json.dump({"real": True, "dur": dur, "sent": []}, open(f"{V4}/timing/{pid}.json", "w"))
# the slide's own visual for this window, held if needed
subprocess.run(["ffmpeg","-loglevel","error","-y","-ss",f"{a:.2f}","-i",f"{O}/{sid}.mp4","-vf",f"tpad=stop_mode=clone:stop_duration={dur}","-t",f"{dur}",
                "-c:v","libx264","-preset","medium","-crf","15","-pix_fmt","yuv420p","-r","25",f"{O}/{pid}.mp4"], check=True)
subprocess.run(["python3", f"{R}/tools/clone.py", pid], check=True)
assemble.scene(pid)
out = f"{O}/extract-{name}.mp4"
subprocess.run(["ffmpeg","-loglevel","error","-y","-i",f"{O}/scenes/{pid}.mp4","-filter_complex",f"[0:v]setpts=PTS/{SP},fps=25[v];[0:a]atempo={SP}[a]",
                "-map","[v]","-map","[a]","-c:v","libx264","-preset","slow","-crf","14","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-movflags","+faststart",out], check=True)
print("done", out)
