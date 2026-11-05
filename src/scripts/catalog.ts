import { copy, type Lang } from '../data/copy';
import { projects } from '../data/projects';
import {localPreview} from '../lib/presentation.mjs';
import { normalizePage, parseState, selectRepos, safeUrl } from '../lib/catalog.mjs';
type Repo={name:string,description:string,url:string,demo:string|null,language:string,topics:string[],category:string,created:string,updated:string};
const container=document.querySelector<HTMLElement>('#catalog');
if(container) initialize(container);
async function initialize(container:HTMLElement){
 const lang=container.dataset.lang as Lang,t=copy[lang];
 const results=document.querySelector<HTMLElement>('#catalog-results')!;
 const input=document.querySelector<HTMLInputElement>('#project-search')!;
 const sort=document.querySelector<HTMLSelectElement>('#project-sort')!;
 const more=document.querySelector<HTMLButtonElement>('#load-more')!;
 const count=document.querySelector<HTMLElement>('#result-count')!;
 const status=document.querySelector<HTMLElement>('#sync-status')!;
 const date=document.querySelector<HTMLTimeElement>('#sync-date')!;
 let repos:Repo[]=[],state=parseState(location.search),renderId=0;
 let manifest:any={previews:{},documents:{}};try{manifest=JSON.parse(document.querySelector('#preview-manifest')?.textContent||'{}')}catch{}
 const notify=()=>document.dispatchEvent(new CustomEvent('gp:repos',{detail:{repos,manifest}}));
 const pageSize=12;
 function el<K extends keyof HTMLElementTagNameMap>(tag:K,cls='',text?:string){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
 function link(label:string,url:string,cls='text-link'){const n=el('a',cls,label);n.href=url;n.target='_blank';n.rel='noopener noreferrer';return n;}
 function curated(r:Repo){return projects.find(p=>p.repo===r.name)}
 function label(r:Repo){return curated(r)?.name || r.name;}
 function category(r:Repo){return t.categories[r.category as keyof typeof t.categories] || t.categories.other;}
 function preview(r:Repo){const p=curated(r),box=el('div',`project-cover cover-${r.category}`);box.dataset.project=r.name;
  const real=localPreview(manifest.previews?.[r.name],r.name);
  if(real||p?.image){const img=el('img');img.src=real?.src||p!.image;img.alt=`${t.previewLabel}: ${label(r)}`;img.width=real?.width||1200;img.height=real?.height||750;img.loading='lazy';img.decoding='async';if(real&&real.width>600){img.srcset=`${real.small} 600w, ${real.src} ${real.width}w`;img.sizes='(max-width: 760px) 90vw, 65vw';}img.addEventListener('error',()=>{img.remove();box.append(el('strong','cover-word',label(r)),el('span','code-caption',lang==='pt'?'Prévia temporariamente indisponível':'Preview temporarily unavailable'));},{once:true});box.append(img);}
  else {const lines=manifest.documents?.[r.name]?.lines||[];box.classList.add('document-preview');box.append(el('span','code-eyebrow',`README / ${r.name}`),el('strong','document-title',label(r)));if(lines.length)for(const line of lines.slice(0,4))box.append(el('code','document-endpoint',String(line)));else box.append(el('p','document-excerpt',r.description||t.generic));box.append(el('span','code-caption',lang==='pt'?'Documentação do projeto · sem captura publicada':'Project documentation · no published screenshot'));}
  return box;
 }
 function info(r:Repo){const p=curated(r),box=el('div','project-description');box.append(el('span','project-kind',category(r)),el('h3','',label(r)),el('p','',p?p[lang].summary:r.description || t.generic));if(!p&&r.description&&lang==='en')box.append(el('small','original-note',t.original));
  const tech=el('div','project-tech');(p?p.stack:[r.language,...r.topics.slice(0,3)]).filter(Boolean).forEach(s=>tech.append(el('span','',s)));box.append(tech);
  const actions=el('div','project-actions');if(p){const a=el('a','text-link',`${t.study}`);a.href=`/${lang}/projetos/${p.slug}/`;actions.append(a)}const demo=safeUrl(p?.demo||r.demo);if(demo)actions.append(link(`${t.demo}`,demo));actions.append(link('GitHub',r.url));box.append(actions);return box;
 }
 function save(){const p=new URLSearchParams();if(state.q)p.set('q',state.q);if(state.category!=='all')p.set('category',state.category);if(state.sort!=='created')p.set('sort',state.sort);if(state.view!=='gallery')p.set('view',state.view);if(state.selected)p.set('project',state.selected);if(state.page>1)p.set('page',String(state.page));history.replaceState(null,'',`${location.pathname}${p.size?'?'+p:''}${location.hash}`);}
 function render(){renderId++;const id=renderId;input.value=state.q;sort.value=state.sort;
  container.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===state.category)));
  document.querySelector('#view-gallery')!.setAttribute('aria-pressed',String(state.view==='gallery'));document.querySelector('#view-list')!.setAttribute('aria-pressed',String(state.view==='list'));
  const filtered=selectRepos(repos,state) as Repo[];count.textContent=`${filtered.length} ${filtered.length===1?(lang==='pt'?'projeto':'project'):t.results}`;
  document.querySelectorAll<HTMLButtonElement>('[data-surface-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.surfaceKind===state.category)));
  const signal=document.querySelector('.catalog-signal');if(signal)signal.textContent=`GITHUB / ${repos.length} ${t.results.toUpperCase()}`;
  document.dispatchEvent(new CustomEvent('gp:catalog',{detail:{category:state.category,seed:repos.map(r=>r.name).join('|')}}));
  results.replaceChildren();results.dataset.view=state.view;more.hidden=filtered.length<=pageSize*state.page;
  if(!filtered.length){document.querySelector('#catalog-progress')!.textContent='';const empty=el('div','catalog-empty');empty.append(el('h3','',t.empty),el('p','',t.emptyBody));const reset=el('button','button outline',t.clear);reset.addEventListener('click',()=>{state={...state,q:'',category:'all',page:1,selected:''};save();render();input.focus()});empty.append(reset);results.append(empty);return;}
  const visible=filtered.slice(0,pageSize*state.page);document.querySelector('#catalog-progress')!.textContent=lang==='pt'?`Exibindo ${visible.length} de ${filtered.length} projetos`:`Showing ${visible.length} of ${filtered.length} projects`;more.textContent=`${t.more} · +${Math.min(pageSize,Math.max(0,filtered.length-visible.length))}`;
  if(state.view==='list'){const list=el('div','technical-list');visible.forEach((r,i)=>{const row=el('article','technical-row');const title=el('a','',label(r));title.href=r.url;title.target='_blank';title.rel='noopener noreferrer';const meta=el('div');meta.append(title,el('p','',curated(r)?.[lang].summary||r.description||t.generic));row.append(el('span','row-index',String(i+1).padStart(2,'0')),meta,el('span','row-category',category(r)),el('span','row-language',r.language),link('GitHub',r.url));list.append(row)});results.append(list);}
  else {let selected=visible.find(r=>r.name===state.selected)||visible[0];state.selected=selected.name;
   const stage=el('div','catalog-stage'),index=el('div','project-index');index.setAttribute('role','group');index.setAttribute('aria-label',t.select);index.tabIndex=0;
   const detail=el('article','project-detail');
   function choose(r:Repo){selected=r;state.selected=r.name;save();document.dispatchEvent(new CustomEvent('gp:catalog',{detail:{category:r.category,seed:r.name}}));index.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.repo===r.name)));detail.classList.remove('switching');detail.replaceChildren(preview(r),info(r));if(document.documentElement.dataset.motion!=='reduced'){requestAnimationFrame(()=>{if(id===renderId)detail.classList.add('switching')})}}
   visible.forEach(r=>{const b=el('button','project-index-item');b.dataset.repo=r.name;b.setAttribute('aria-pressed',String(r===selected));b.append(el('span','',label(r)),el('small','',category(r)));b.addEventListener('click',()=>choose(r));index.append(b)});
   detail.append(preview(selected),info(selected));stage.append(index,detail);results.append(stage);
  }
 }
 const update=()=>{state.page=1;state.selected='';save();render()};
 document.addEventListener('gp:category',((event:CustomEvent<{category:string}>)=>{if(!['frontend','backend','games'].includes(event.detail?.category))return;state.category=event.detail.category;state.q='';update()}) as EventListener);
 let debounce:ReturnType<typeof setTimeout>;input.addEventListener('input',()=>{state.q=input.value;clearTimeout(debounce);debounce=setTimeout(update,160)});
 sort.addEventListener('change',()=>{state.sort=sort.value;update()});
 container.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(b=>b.addEventListener('click',()=>{state.category=b.dataset.category!;update()}));
 for(const view of ['gallery','list'])document.querySelector(`#view-${view}`)!.addEventListener('click',()=>{state.view=view;save();render()});
 more.addEventListener('click',()=>{const previous=pageSize*state.page;state.page++;save();render();const next=results.querySelectorAll<HTMLElement>(state.view==='gallery'?'.project-index-item':'.technical-row')[previous];if(next){next.tabIndex=0;next.focus({preventScroll:true});next.scrollIntoView({behavior:document.documentElement.dataset.motion==='reduced'?'instant':'smooth',block:'nearest'});if(document.documentElement.dataset.motion!=='reduced')next.animate([{opacity:.2,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:400});}});
 window.addEventListener('popstate',()=>{state=parseState(location.search);render()});
 function synced(at:string,label:string){status.replaceChildren(el('i'),document.createTextNode(label));date.dateTime=at;date.textContent=new Date(at).toLocaleDateString(lang==='pt'?'pt-BR':'en-US',{timeZone:'UTC'});date.title=`${t.lastSync} ${new Date(at).toISOString()}`;}
 try {const response=await fetch('/data/github.json');if(!response.ok)throw Error();const data=await response.json();repos=readCacheRepos(data.repositories);if(!repos.length)throw Error();synced(data.fetchedAt,t.snapshot);render();notify();}
 catch{status.textContent=t.unavailable;return;}
 const cacheKey='gp.github.v1';let cache:any;try{cache=JSON.parse(localStorage.getItem(cacheKey)||'null')}catch{}
 // Cached values are revalidated as untrusted data, including links, dates and ownership.
 if(cache?.fetchedAt&&Date.now()-Date.parse(cache.fetchedAt)<3600000&&Date.parse(cache.fetchedAt)<=Date.now()){const valid=readCacheRepos(cache.repositories);if(valid.length){repos=valid;synced(cache.fetchedAt,t.cached);render();notify();return}}
 try{const all:Repo[]=[];for(let page=1;page<=20;page++){const response=await fetch(`https://api.github.com/users/gustapaz/repos?type=owner&per_page=100&sort=created&page=${page}`,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error();const raw=await response.json();all.push(...normalizePage(raw));if(raw.length<100)break;if(page===20)throw Error();}if(!all.length)throw Error();repos=all;const fetchedAt=new Date().toISOString();try{localStorage.setItem(cacheKey,JSON.stringify({fetchedAt,repositories:repos}))}catch{}synced(fetchedAt,t.live);render();notify();}
 catch{status.title=t.unavailable;}
}
function readCacheRepos(data:unknown):Repo[]{if(!Array.isArray(data))return [];return data.slice(0,2000).map(r=>{if(!r||typeof r.name!=='string')return null;return normalizePage([{name:r.name,description:r.description,html_url:r.url,homepage:r.demo,language:r.language,topics:r.topics,owner:{login:'gustapaz'},private:false,fork:false,archived:false,created_at:r.created,pushed_at:r.updated}])[0]}).filter(Boolean) as Repo[];}
