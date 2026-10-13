"""prep.py <slide-id>: write motion/<id>/base.html = the slide as published, as a 1920x1080 local page (images mapped to local files)."""
import sys,json,os,re
S=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(S)
sid=sys.argv[1]
sec=open(f'{ROOT}/artifact-files/bc7ab302-65c8-4257-b282-303304de8325/project/slides/{sid}.html').read()
for k,v in json.load(open(f'{S}/blobmap.json')).items(): sec=sec.replace(f'/_blob/{k}',f'{ROOT}/{v}')
sec=re.sub(r'<aside>.*?</aside>','',sec,flags=re.S)
head=('<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">'
 '<style>body{margin:0;background:#fbfaf4}section{width:1920px;height:1080px;box-sizing:border-box;position:relative;overflow:hidden}section *{margin:0}aside{display:none}'
 'table{border-collapse:collapse;width:100%}td,th{padding:10px 16px;border-bottom:1px solid #ddd;text-align:left}x-shape{display:block}'
 'x-shape[kind=arrow-right]{clip-path:polygon(0 30%,60% 30%,60% 0,100% 50%,60% 100%,60% 70%,0 70%)}</style></head><body>')
os.makedirs(f'{S}/{sid}',exist_ok=True)
open(f'{S}/{sid}/base.html','w').write(head+sec+'</body></html>')
print(f'{S}/{sid}/base.html')
