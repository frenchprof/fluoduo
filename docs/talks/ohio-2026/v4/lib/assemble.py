"""assemble.py [speed] : slide clips + clone circles -> one MP4, then the whole video sped up by <speed>.
Each scene lasts exactly its timing's `dur`; the clone (cropped head and shoulders) sits in a 300px circle at the
bottom right (cover: right middle). s24 (references) has no clone and no sound."""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
V4 = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); R = os.path.dirname(V4)
OUT = os.environ.get("OUT", "/tmp/claude-0/-home-user-fluoduo/675e2eea-8ec6-53b9-8533-d72e2857df3f/scratchpad/v4out")
ORDER_V4 = ["s01","s02","s03","s04","s05","s06","s07","s08","s09","s11","s12","s13","s14","s15","s16","s18","s19","s21","s22","s23","s24"]
ORDER_V5 = [f"n{i:02d}" for i in range(1, 23)]   # n01-n21 = Dan's own video, n22 = references
ORDER = ORDER_V5 if os.environ.get("V", "5") == "5" else ORDER_V4
NOCLONE = {"s24", "n22"}
D, RING = 240, 6   # Dan: "small circle"
POS = {"s01": (1652, 420), "n01": (1652, 420)}
CROP = "crop=600:600:330:20"   # head and shoulders (Dan's own video, 16 Oct; v4 used 520:520:370:30)
os.makedirs(f"{OUT}/scenes", exist_ok=True)
def scene(s):
    T = json.load(open(f"{V4}/timing/{s}.json")); t = T["dur"]; clip = f"{OUT}/{s}.mp4"; out = f"{OUT}/scenes/{s}.mp4"
    if s in NOCLONE:
        cmd = ["ffmpeg","-loglevel","error","-y","-i",clip,"-f","lavfi","-i","anullsrc=r=48000:cl=stereo","-t",f"{t:.3f}",
               "-map","0:v","-map","1:a","-vf","fps=25,format=yuv420p","-c:v","libx264","-preset","medium","-crf","15","-c:a","aac","-b:a","160k",out]
    else:
        x, y = POS.get(s, (1920 - 28 - D, 1080 - 28 - D))
        fc = (f"[1:v]scale=1280:720,{CROP},scale={D-2*RING}:{D-2*RING},format=rgba[cv];[cv][2:v]alphamerge[c];"
              f"[0:v]scale=1920:1080,fps=25,format=yuv420p[bg];[bg][3:v]overlay={x}:{y}[b1];[b1][c]overlay={x+RING}:{y+RING}:eof_action=repeat,format=yuv420p[v];"
              f"[1:a]aresample=48000,apad[a]")
        cmd = ["ffmpeg","-loglevel","error","-y","-i",clip,"-ss",str(T.get("trim",0)),"-i",f"{V4}/av/{s}.mp4","-loop","1","-i",f"{V4}/lib/mask{D}.png","-loop","1","-i",f"{V4}/lib/ring{D}.png",
               "-filter_complex",fc,"-map","[v]","-map","[a]","-t",f"{t:.3f}","-c:v","libx264","-preset","medium","-crf","15","-r","25",
               "-c:a","aac","-b:a","160k","-ac","2",out]
    subprocess.run(cmd, check=True); return s
if __name__ == "__main__":
    speed = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0
    with ThreadPoolExecutor(4) as ex:
        for s in ex.map(scene, ORDER): print("scene", s, flush=True)
    open(f"{OUT}/list.txt","w").writelines(f"file '{OUT}/scenes/{s}.mp4'\n" for s in ORDER)
    full = f"{OUT}/FluOLinGo-Ohio-2026-natural.mp4"
    subprocess.run(["ffmpeg","-loglevel","error","-y","-f","concat","-safe","0","-i",f"{OUT}/list.txt","-c","copy",full], check=True)
    final = f"{OUT}/FluOLinGo-Ohio-2026.mp4"
    subprocess.run(["ffmpeg","-loglevel","error","-y","-i",full,"-filter_complex",f"[0:v]setpts=PTS/{speed},fps=25[v];[0:a]atempo={speed}[a]",
                    "-map","[v]","-map","[a]","-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p","-c:a","aac","-b:a","160k",
                    "-movflags","+faststart",final], check=True)
    d = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",final]))
    print(f"final {final}  {int(d//60)}:{d%60:04.1f}")
