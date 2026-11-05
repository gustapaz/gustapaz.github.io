import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('tracked snapshot contains only public normalized owned links, no private fields',async()=>{const d=JSON.parse(await readFile('public/data/github.json','utf8'));assert.equal(d.version,1);assert.ok(d.repositories.length>0);for(const r of d.repositories){assert.equal(new URL(r.url).hostname,'github.com');assert.ok(r.url.startsWith('https://github.com/gustapaz/'));assert.deepEqual(Object.keys(r).sort(),['category','created','demo','description','language','name','topics','updated','url'].sort())}});
test('no client credentials or arbitrary HTML insertion in catalogue code',async()=>{const source=await readFile('src/scripts/catalog.ts','utf8');assert.equal(source.includes('innerHTML'),false);assert.equal(source.includes('Authorization'),false);assert.ok(source.includes('textContent'));assert.ok(source.includes('AbortSignal.timeout'))});
