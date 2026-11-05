import test from 'node:test';import assert from 'node:assert/strict';
import {chooseHighlights,localPreview,rankPreviewPaths,documentedLines} from '../src/lib/presentation.mjs';
import {captureUrl,allowedRequest,needsCapture} from '../scripts/capture-policy.mjs';
const repos=Array.from({length:12},(_,i)=>({name:`project-${i}`,category:['fullstack','backend','frontend','games'][i%4]}));const previews=Object.fromEntries(repos.map(r=>[r.name,{src:`/media/projects/${r.name}.webp`,small:`/media/projects/${r.name}-small.webp`}]));
test('highlights select four unique previewed projects, cover categories and avoid previous visit',()=>{const first=chooseHighlights(repos,previews,[],()=>.4);assert.equal(first.length,4);assert.equal(new Set(first.map(r=>r.name)).size,4);assert.equal(new Set(first.map(r=>r.category)).size,4);const next=chooseHighlights(repos,previews,first.map(r=>r.name),()=>.7);assert.ok(next.every(r=>!first.includes(r)));});
test('untrusted or absent preview paths never qualify for dynamic highlights',()=>{assert.equal(localPreview({src:'https://evil.invalid/x',small:'/media/projects/a-small.webp'},'a'),null);assert.equal(chooseHighlights(repos,{}).length,0);assert.equal(localPreview({src:'/media/projects/b.webp',small:'/media/projects/b-small.webp'},'a'),null);});
test('preview discovery prefers actual published screenshots and excludes icons, mobile alternates and oversized files',()=>{const entries=['docs/public-gameplay.png','docs/dashboard.png','public/logo.png','docs/public-mobile.png','../private.png'].map(path=>({path,type:'blob',size:40000}));assert.deepEqual(rankPreviewPaths(entries),['docs/public-gameplay.png','docs/dashboard.png']);assert.deepEqual(rankPreviewPaths([{path:'docs/preview.png',type:'blob',size:9000000}]),[]);});
test('documentation fallback only extracts bounded actual endpoint lines',()=>{assert.deepEqual(documentedLines('POST /reservations\nPOST /reservations\nGET /health\n<script>oops</script>'),['POST /reservations','GET /health']);});
test('preview manifest points only to existing local raster variants and owned public provenance',async()=>{const {readFile,access}=await import('node:fs/promises');const manifest=JSON.parse(await readFile('public/data/previews.json','utf8'));for(const [name,p] of Object.entries(manifest.previews)){assert.ok(localPreview(p,name));assert.ok(p.width>=320&&p.width<=1200);assert.ok(p.height>0&&p.height<=3000);const source=new URL(p.source);if(p.kind==='live'){assert.equal(captureUrl(p.source),p.source);assert.ok(Number.isFinite(Date.parse(p.capturedAt)));}else{assert.equal(source.hostname,'raw.githubusercontent.com');assert.ok(source.pathname.startsWith(`/gustapaz/${name}/HEAD/`));}assert.equal(source.search,'');await access(`public${p.src}`);await access(`public${p.small}`);}assert.deepEqual(documentedLines('| POST | `/api/example` |\nGET /health.'),['POST /api/example','GET /health']);});

test('capture policy rejects arbitrary hosts, credentials, ports and outbound writes',()=>{
 assert.equal(captureUrl('https://gustapaz.github.io/demo/'),'https://gustapaz.github.io/demo/');
 assert.ok(captureUrl('https://lastro-api-gustapaz.starrylinen.chatgpt.site/'));
 for(const u of ['http://gustapaz.github.io/','https://evil.invalid/','https://127.0.0.1/','https://user:secret@gustapaz.github.io/','https://gustapaz.github.io:8443/','https://gustapaz.github.io/?token=x'])assert.equal(captureUrl(u),null);
 assert.equal(allowedRequest('https://gustapaz.github.io/a','GET','https://gustapaz.github.io'),true);
 for(const [url,method] of [['http://169.254.169.254/','GET'],['https://api.github.com/user','GET'],['https://gustapaz.github.io/a','POST']])assert.equal(allowedRequest(url,method,'https://gustapaz.github.io'),false);
});
test('live captures expire or refresh after repo updates while repository screenshots remain usable',()=>{
 const now=Date.now(),repo={demo:'https://gustapaz.github.io/demo/',updated:'a'};
 const p={kind:'live',source:repo.demo,updated:'a',capturedAt:new Date(now).toISOString()};
 assert.equal(needsCapture(p,repo,now),false);assert.equal(needsCapture(p,repo,now+8*86400000),true);
 assert.equal(needsCapture(p,{...repo,updated:'b'},now),true);assert.equal(needsCapture(null,repo,now),true);
 assert.equal(needsCapture({source:'repository screenshot'},repo,now),false);
});
