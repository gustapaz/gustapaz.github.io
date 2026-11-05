// CI-only browser worker: no accounts, credentials, form submissions or repo execution.
import {readFile, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import sharp from 'sharp';
import {captureUrl, allowedRequest, needsCapture} from './capture-policy.mjs';
if (!process.env.CI) throw new Error('Run browser captures in the isolated CI job, not on the user computer.');
const snapshot = JSON.parse(await readFile('public/data/github.json', 'utf8'));
const manifest = JSON.parse(await readFile('public/data/previews.json', 'utf8'));
// Each launch has a temporary profile and only the executable's minimum environment.
const env = Object.fromEntries(['PATH','HOME','TMPDIR','LANG','LD_LIBRARY_PATH'].filter(k=>process.env[k]).map(k=>[k,process.env[k]]));
const browser = await chromium.launch({headless:true, chromiumSandbox:true, env});
const report = [];
try {
  for (const repo of snapshot.repositories) {
    const url = captureUrl(repo.demo), old = manifest.previews[repo.name];
    if (!/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,99}$/.test(repo.name) || !url || !needsCapture(old, repo)) continue;
    const context = await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:1,serviceWorkers:'block',acceptDownloads:false,reducedMotion:'reduce'});
    try {
      const origin = new URL(url).origin;
      await context.route('**/*', route=>allowedRequest(route.request().url(),route.request().method(),origin)?route.continue():route.abort());
      await context.routeWebSocket(/.*/, socket=>socket.close());
      const page = await context.newPage();
      page.on('dialog', dialog=>dialog.dismiss());
      const response = await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
      if (!response?.ok() || !captureUrl(page.url()) || new URL(page.url()).origin !== origin) throw new Error('Demo unavailable');
      await page.waitForLoadState('networkidle',{timeout:8000}).catch(()=>{});
      await page.evaluate(()=>document.fonts.ready);
      // Let canvas and initial visual transitions settle without interacting with the app.
      await page.waitForTimeout(2500);
      const state = await page.evaluate(()=>({title:document.title,text:document.body?.innerText?.slice(0,10000)||'',password:!!document.querySelector('input[type=password]'),visual:!!document.querySelector('canvas, img, svg, pre')}));
      if (state.password || /^(404|502|503|access denied|application error|site not found)/i.test(state.title) || (!state.visual && state.text.trim().length<50)) throw new Error('Capture not representative');
      const bytes = await page.screenshot({type:'png',fullPage:false,timeout:15000});
      const image = sharp(bytes,{limitInputPixels:20000000});
      const stats = await image.stats();
      if (Math.max(...stats.channels.slice(0,3).map(c=>c.stdev))<3) throw new Error('Blank capture');
      for (const [width,suffix] of [[1200,''],[600,'-small']]) await image.clone().resize({width}).webp({quality:78}).toFile(`public/media/projects/${repo.name}${suffix}.webp`);
      manifest.previews[repo.name]={src:`/media/projects/${repo.name}.webp`,small:`/media/projects/${repo.name}-small.webp`,width:1200,height:800,source:url,kind:'live',capturedAt:new Date().toISOString(),updated:repo.updated};
      delete manifest.documents[repo.name];
      report.push({name:repo.name,status:'captured'});
    } catch {
      report.push({name:repo.name,status:old?'retained':'unavailable'});
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
manifest.previews=Object.fromEntries(Object.entries(manifest.previews).sort(([a],[b])=>a.localeCompare(b)));
await writeFile('public/data/previews.json',JSON.stringify(manifest,null,2)+'\n');
await writeFile('capture-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
