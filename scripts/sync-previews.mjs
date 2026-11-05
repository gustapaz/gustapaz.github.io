import {readFile,writeFile,mkdir} from 'node:fs/promises';
import sharp from 'sharp';
import {rankPreviewPaths,documentedLines,localPreview} from '../src/lib/presentation.mjs';
import {normalizeRepo} from '../src/lib/catalog.mjs';
import {captureUrl} from './capture-policy.mjs';
const snapshot=JSON.parse(await readFile('public/data/github.json','utf8'));
let previous={previews:{},documents:{}};try{previous=JSON.parse(await readFile('public/data/previews.json','utf8'));}catch{}
const result={version:1,previews:{},documents:{}};await mkdir('public/media/projects',{recursive:true});
async function limited(url,api=false,max=8_000_000){
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(20000),headers:{Accept:api?'application/vnd.github+json':'image/*','User-Agent':'gustapaz-portfolio',...(api&&process.env.GH_TOKEN?{Authorization:`Bearer ${process.env.GH_TOKEN}`}:{})}});
 if(!response.ok)throw new Error(`HTTP ${response.status}`);if(Number(response.headers.get('content-length'))>max)throw new Error('Size limit');
 const chunks=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>max)throw new Error('Size limit');chunks.push(chunk);}return Buffer.concat(chunks);
}
// Reuse the last published live captures; CI never commits generated files or creates bot authors.
try {
 const published=JSON.parse((await limited('https://gustapaz.github.io/data/previews.json',false,1000000)).toString());
 for(const repo of snapshot.repositories){
  const value=localPreview(published.previews?.[repo.name],repo.name);
  if(value?.kind!=='live'||!captureUrl(value.source)||value.source!==captureUrl(repo.demo)||!Number.isFinite(Date.parse(value.capturedAt)))continue;
  for(const suffix of ['', '-small']){
   const path=`/media/projects/${repo.name}${suffix}.webp`;
   const bytes=await limited(`https://gustapaz.github.io${path}`);const image=sharp(bytes,{limitInputPixels:20000000});
   const meta=await image.metadata();if(meta.format!=='webp'||meta.width>1200||meta.height>3000)throw new Error('Invalid published capture');
   await image.webp({quality:78}).toFile(`public${path}`);
  }
  previous.previews[repo.name]=value;
 }
}catch{console.warn('Published capture cache unavailable; repository screenshots remain available.');}
for(const repo of snapshot.repositories){
 if(!normalizeRepo({name:repo.name,owner:{login:'gustapaz'},html_url:repo.url,private:false,fork:false,archived:false}))continue;
 const old=localPreview(previous.previews?.[repo.name],repo.name);
 if(old){try{await readFile(`public${old.src}`);await readFile(`public${old.small}`);if(old.updated===repo.updated||old.kind==='live'){result.previews[repo.name]=old;continue;}}catch{}}
 try{
  const metadata=JSON.parse((await limited(`https://api.github.com/repos/gustapaz/${repo.name}`,true)).toString());
  if(!normalizeRepo(metadata))continue;
  const tree=JSON.parse((await limited(`https://api.github.com/repos/gustapaz/${repo.name}/git/trees/HEAD?recursive=1`,true)).toString());if(tree.truncated)throw new Error('Incomplete tree');
  let found=false;
  for(const path of rankPreviewPaths(tree.tree||[])){
   try{
    const source=`https://raw.githubusercontent.com/gustapaz/${repo.name}/HEAD/${path.split('/').map(encodeURIComponent).join('/')}`;
    const bytes=await limited(source);const image=sharp(bytes,{limitInputPixels:20_000_000});const meta=await image.metadata();
    if(!['png','jpeg','webp'].includes(meta.format)||meta.width<320||meta.height<240||meta.width*meta.height<120000||meta.width/meta.height<.4||meta.width/meta.height>3)continue;
    for(const [width,suffix] of [[1200,''],[600,'-small']])await image.clone().resize({width,withoutEnlargement:true}).webp({quality:76,effort:4}).toFile(`public/media/projects/${repo.name}${suffix}.webp`);
    const size=await sharp(`public/media/projects/${repo.name}.webp`).metadata();result.previews[repo.name]={src:`/media/projects/${repo.name}.webp`,small:`/media/projects/${repo.name}-small.webp`,width:size.width,height:size.height,source,updated:repo.updated};found=true;break;
   }catch{/* Try the next bounded candidate; do not log remote content. */}
  }
  if(!found){
   const readme=(tree.tree||[]).find(r=>/^readme\.md$/i.test(r.path)&&r.size<200000);
   let lines=[];if(readme){const source=`https://raw.githubusercontent.com/gustapaz/${repo.name}/HEAD/${encodeURIComponent(readme.path)}`;lines=documentedLines((await limited(source,false,200000)).toString());}
   result.documents[repo.name]={lines,updated:repo.updated};if(old)result.previews[repo.name]=old;
  }
 }catch(error){if(old)result.previews[repo.name]=old;if(previous.documents?.[repo.name])result.documents[repo.name]=previous.documents[repo.name];console.warn(`Preview unavailable: ${repo.name} (${error.message})`);}
}
result.previews=Object.fromEntries(Object.entries(result.previews).sort(([a],[b])=>a.localeCompare(b)));result.documents=Object.fromEntries(Object.entries(result.documents).sort(([a],[b])=>a.localeCompare(b)));
await writeFile('public/data/previews.json',JSON.stringify(result,null,2)+'\n');console.log(`Previews: ${Object.keys(result.previews).length}; documentation: ${Object.keys(result.documents).length}. Public source images only; no screenshots service.`);
