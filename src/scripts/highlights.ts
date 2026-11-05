import {chooseHighlights,localPreview} from '../lib/presentation.mjs';
import {projects} from '../data/projects';
import {copy,type Lang} from '../data/copy';
let chosen=false;let latest:any;let forceShuffle=false;
const shuffle=document.querySelector<HTMLButtonElement>('#shuffle-highlights');
shuffle?.addEventListener('click',()=>{if(!latest)return;chosen=false;forceShuffle=true;document.dispatchEvent(new CustomEvent('gp:repos',{detail:latest}));const status=document.querySelector('.highlight-status');if(status)status.textContent=Array.from(document.querySelectorAll('.film-panel h3')).map(n=>n.textContent).join(', ');});
document.addEventListener('gp:repos',((event:CustomEvent<{repos:any[],manifest:any}>)=>{
 latest=event.detail;if(chosen)return;const {repos,manifest}=event.detail;const lang=(document.body.dataset.lang||'pt') as Lang,t=copy[lang];
 let previous:string[]=[];let reuse=false;
 try{const old=JSON.parse(sessionStorage.getItem('gp.highlights')||'null');previous=Array.isArray(old?.names)?old.names:[];reuse=old?.lang!==lang&&new URL(document.referrer).origin===location.origin;}catch{}
 const pool=repos.filter(r=>localPreview(manifest.previews?.[r.name],r.name));
 const selection=reuse&&!forceShuffle?previous.map(name=>pool.find(r=>r.name===name)).filter(Boolean):chooseHighlights(pool,manifest.previews||{},previous);
 const slots=document.querySelectorAll('.film-panel').length;if(selection.length!==slots||!slots)return;chosen=true;if(shuffle)shuffle.disabled=false;
 try{sessionStorage.setItem('gp.highlights',JSON.stringify({names:selection.map(r=>r.name),lang}));}catch{}
 const story=document.querySelector<HTMLElement>('.featured-story');if(!story)return;
 selection.forEach((repo,i)=>{
  const p=projects.find(p=>p.repo===repo.name),preview=manifest.previews[repo.name];const panel=story.querySelector<HTMLElement>(`[data-film="${i}"]`)!;
  const name=p?.name||repo.name.replace(/[-_]/g,' '),primary=p?`/${lang}/projetos/${p.slug}/`:repo.demo||repo.url;
  panel.dataset.repo=repo.name;panel.querySelector('h3')!.textContent=name;panel.querySelector('.film-tag')!.textContent=p?.[lang].tag||repo.language||t.categories[repo.category as keyof typeof t.categories];
  panel.querySelector('.film-copy>p:not(.film-tag)')!.textContent=p?.[lang].summary||repo.description||t.generic;
  panel.querySelector('.film-copy .eyebrow')!.textContent=`${t.personal} / ${t.categories[repo.category as keyof typeof t.categories]}`;
  const link=panel.querySelector<HTMLAnchorElement>('.film-study')!;link.href=primary;link.replaceChildren(document.createTextNode(p?t.study:repo.demo?t.demo:t.code),Object.assign(document.createElement('span'),{className:'study-line'}));
  const frame=panel.querySelector<HTMLAnchorElement>('.film-frame')!;frame.href=primary;frame.setAttribute('aria-label',`${p?t.study:repo.demo?t.demo:t.code}: ${name}`);frame.style.viewTransitionName=p?`project-${p.slug}`:'none';
  for(const anchor of [link,frame]){if(!p){anchor.target='_blank';anchor.rel='noopener noreferrer';}else{anchor.removeAttribute('target');anchor.removeAttribute('rel');}}
  function image(alt:string){const img=document.createElement('img');img.src=preview.src;if(preview.width>600)img.srcset=`${preview.small} 600w, ${preview.src} ${preview.width}w`;img.sizes='(max-width: 760px) 88vw, 65vw';img.width=preview.width;img.height=preview.height;img.alt=alt;img.loading='lazy';img.decoding='async';return img;}
  // Keep animation targets and text elements stable; only replace the media.
  frame.replaceChildren(image(`${t.previewLabel}: ${name}`));panel.querySelector('.film-ambience')!.replaceChildren(image(''));
  const stack=panel.querySelector('.film-stack')!;stack.replaceChildren(...(p?.stack||[repo.language,...repo.topics.slice(0,3)]).filter(Boolean).map(text=>{const n=document.createElement('span');n.textContent=text;return n;}));
  const motif=panel.querySelector('.film-motif');if(i===0&&motif)motif.textContent=t.categories[repo.category as keyof typeof t.categories].toUpperCase();if(i===1&&motif)motif.querySelectorAll('span').forEach((n,j)=>n.textContent=['01 / IDEA','02 / BUILD','03 / EXPERIENCE'][j]);if(i===2&&motif)motif.textContent='explore.';
  const button=story.querySelector<HTMLButtonElement>(`[data-film-target="${i}"]`)!;button.querySelector('strong')!.textContent=name;button.setAttribute('aria-label',`${i+1} ${name}`);
 });
 story.dataset.dynamic='true';if(forceShuffle){forceShuffle=false;document.querySelector<HTMLButtonElement>('[data-film-target="0"]')?.click();if(document.documentElement.dataset.motion==='reduced')story.querySelector('.film-panel')?.scrollIntoView({behavior:'instant',block:'start'});}
}) as EventListener);
