import { chromium } from '/home/user/fluoduo/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport:{width:1920,height:1080}, timezoneId:'Pacific/Auckland', recordVideo:{dir:'motion/scene/raw', size:{width:1920,height:1080}} });
const p = await ctx.newPage();
await p.goto('http://localhost:4174/welcome', { waitUntil:'domcontentloaded' });
await p.waitForTimeout(9000);
await ctx.close(); await b.close();
