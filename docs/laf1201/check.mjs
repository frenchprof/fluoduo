import { sheets, themes } from "./data/index.ts";
const BL="_____"; let n=0, bad=[];
const tok=a=>(a.split(" / ")[0]).replace(/\*+|~~/g,"").trim().split(/\s+|(?<=['’])/).filter(Boolean);
for (const s of sheets) for (const sec of s.sections) {
  const ex=sec.exercise; if(!ex){bad.push(sec.id+" no exercise");continue}
  if (ex.items.length!==ex.answers.length) bad.push(sec.id+" items/answers");
  ex.items.forEach((it,i)=>{ n++; if(it.text.split(BL).length-1!==1) bad.push(sec.id+" blank "+i);
    const a=ex.answers[i].replace(/^\s*([a-z]|\d+)\.\s+/i,""); if(tok(a).length>14) bad.push(sec.id+" long "+i+" "+tok(a).length)});
  if(!themes.find(t=>t.id===sec.theme)) bad.push(sec.id+" theme");
}
console.log(sheets.length,"units",sheets.reduce((a,s)=>a+s.sections.length,0),"sections",n,"items");
console.log(bad.length?bad:"all checks pass");
for (const t of themes) console.log(t.label, sheets.flatMap(s=>s.sections).filter(x=>x.theme===t.id).map(x=>x.id).join(" "));
