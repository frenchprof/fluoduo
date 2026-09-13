import sharp from "sharp"; import { readdirSync } from "node:fs";
const src=process.argv[2], dst=process.argv[3]; let total=0;
for (const f of readdirSync(src).filter(f=>f.endsWith(".png"))) {
  const out=`${dst}/${f.replace(".png",".webp")}`;
  const info=await sharp(`${src}/${f}`).webp({quality:82}).toFile(out); total+=info.size;
  console.log(f.padEnd(28), Math.round(info.size/1024)+"KB", info.width+"x"+info.height);
}
console.log("total", Math.round(total/1024)+"KB");
