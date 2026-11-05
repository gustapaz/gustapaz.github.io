import {readdir,readFile,access} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist');let pages=0,images=0;
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=join(dir,entry.name);if(entry.isDirectory()){await walk(file);continue;}if(!file.endsWith('.html'))continue;
 const html=await readFile(file,'utf8');pages++;
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`${file}: one H1`);
 assert.match(html,/<html[^>]+lang="(?:pt-BR|en)"/,`${file}: language`);
 assert.match(html,/<title>[^<]+<\/title>/,`${file}: title`);
 assert.match(html,/<meta name="description" content="[^"]+"/,`${file}: description`);
 assert.match(html,/<link rel="canonical" href="https:\/\/gustapaz.github.io\//,`${file}: canonical`);
 assert.match(html,/<main[^>]+tabindex="-1"/,`${file}: skip target`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,`${file}: duplicate IDs`);
 for(const tag of html.matchAll(/<img\b[^>]*>/g)){images++;assert.match(tag[0],/\balt="[^"]*"/,`${file}: alt`);assert.match(tag[0],/\bwidth="\d+"/,`${file}: image width`);assert.match(tag[0],/\bheight="\d+"/,`${file}: image height`);}
 for(const match of html.matchAll(/<script type="application\/(?:ld\+json|json)"[^>]*>([\s\S]*?)<\/script>/g))JSON.parse(match[1]);
 for(const m of html.matchAll(/\b(?:src|href)="(\/[^"#?]*)/g)){const path=m[1];if(path==='//')continue;const target=join(root,path);assert.ok(resolve(target).startsWith(root));await access(path.endsWith('/')?join(target,'index.html'):target).catch(()=>{throw Error(`${file}: missing ${path}`)});}
 if(file.endsWith('404.html'))assert.match(html,/name="robots" content="noindex,follow"/);
}}
await walk(root);assert.ok(pages>=14);console.log(`Export checks: ${pages} HTML pages, ${images} images; metadata, JSON, IDs, skip targets and local links valid.`);
