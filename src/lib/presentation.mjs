import {safeUrl} from './catalog.mjs';
export function localPreview(value,name){return value&&value.src===`/media/projects/${name}.webp`&&value.small===`/media/projects/${name}-small.webp`?value:null;}
export function chooseHighlights(repos,previews,previous=[],random=Math.random){
 const pool=repos.filter(r=>localPreview(previews[r.name],r.name));
 const fresh=pool.filter(r=>!previous.includes(r.name));const source=fresh.length>=4?fresh:pool;
 const shuffled=[...source];for(let i=shuffled.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const chosen=[];for(const category of ['fullstack','backend','frontend','games']){const item=shuffled.find(r=>r.category===category&&!chosen.includes(r));if(item)chosen.push(item);}
 for(const item of shuffled)if(chosen.length<4&&!chosen.includes(item))chosen.push(item);
 return chosen.slice(0,4);
}
export function rankPreviewPaths(tree){
 return tree.filter(r=>r.type==='blob'&&r.size>2000&&r.size<=8_000_000&&/\.(png|jpe?g|webp)$/i.test(r.path)&&!/(^|\/)(node_modules|\.git|vendor|android|ios|textures?|sprites?|icons?)(\/|$)|logo|favicon|social|opengraph|sprite|mobile|phone|avatar|portrait|license/i.test(r.path)&&!r.path.split('/').some(s=>s==='..'||s.startsWith('.'))).map(r=>({path:r.path,score:(/^docs\//i.test(r.path)?20:0)+(/public[-_ ]?(desktop|gameplay|preview|home)/i.test(r.path)?55:0)+(/experience|dashboard|screenshot|preview|gameplay|desktop|home|demo/i.test(r.path)?30:0)+(/screen|capture|interface|trilha/i.test(r.path)?15:0)-r.path.split('/').length})).filter(r=>r.score>=15).sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path)).slice(0,8).map(r=>r.path);
}
export function documentedLines(readme){
 const endpoints=[...readme.matchAll(/\b(GET|POST|PUT|PATCH|DELETE)[\s|\x60]+(\/[a-zA-Z0-9_{}:/.-]{1,100})/g)].map(m=>`${m[1]} ${m[2].replace(/[.,;:]+$/,'')}`);
 return [...new Set(endpoints)].slice(0,4);
}
export function safeDemo(repo){return safeUrl(repo.demo);}
