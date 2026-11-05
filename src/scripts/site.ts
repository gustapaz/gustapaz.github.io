export {};
const root=document.documentElement;
const lang=document.body.dataset.lang || 'pt';
const storage={ get:(k:string)=>{try{return localStorage.getItem(k)}catch{return null}}, set:(k:string,v:string)=>{try{localStorage.setItem(k,v)}catch{/* Preferences remain usable without storage. */}} };
if(/^\/(pt|en)\//.test(location.pathname))storage.set('gp.lang',lang);
const themeButton=document.querySelector<HTMLButtonElement>('#theme');
const systemTheme=matchMedia('(prefers-color-scheme: light)');
function updateTheme(theme:string){root.dataset.theme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#101014':'#f5f3f8');themeButton?.setAttribute('aria-pressed',String(theme==='light'));document.dispatchEvent(new Event('gp:appearance'));}
updateTheme(root.dataset.theme || 'dark');
themeButton?.addEventListener('click',()=>{const next=root.dataset.theme==='dark'?'light':'dark';storage.set('gp.theme',next);updateTheme(next)});
systemTheme.addEventListener('change',()=>{if(!storage.get('gp.theme'))updateTheme(systemTheme.matches?'light':'dark')});
const motionButton=document.querySelector<HTMLButtonElement>('#motion');
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
function motionState(){const reduced=systemMotion.matches || storage.get('gp.motion')==='reduced';root.dataset.motion=reduced?'reduced':'full';const motionLabel=systemMotion.matches?(lang==='pt'?'Movimento reduzido pelo sistema':'Motion reduced by system'):reduced?(lang==='pt'?'Reproduzir animações':'Play animations'):(lang==='pt'?'Pausar animações':'Pause animations');motionButton?.setAttribute('aria-label',motionLabel);motionButton?.setAttribute('title',motionLabel);motionButton?.setAttribute('aria-pressed',String(reduced));motionButton?.setAttribute('disabled',systemMotion.matches?'': '');if(!systemMotion.matches)motionButton?.removeAttribute('disabled');document.dispatchEvent(new Event('gp:appearance'));}
motionState();systemMotion.addEventListener('change',motionState);
motionButton?.addEventListener('click',()=>{storage.set('gp.motion',root.dataset.motion==='reduced'?'full':'reduced');motionState()});
const menu=document.querySelector<HTMLDialogElement>('#mobile-menu');
const opener=document.querySelector<HTMLButtonElement>('#menu');
function closeMenu(){menu?.close();opener?.setAttribute('aria-expanded','false');opener?.focus()}
opener?.addEventListener('click',()=>{menu?.showModal();opener.setAttribute('aria-expanded','true')});
document.querySelector('#close-menu')?.addEventListener('click',closeMenu);
menu?.addEventListener('cancel',()=>opener?.setAttribute('aria-expanded','false'));
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
menu?.addEventListener('click',e=>{if(e.target===menu){const r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeMenu()}});
const breakpoint=matchMedia('(min-width: 761px)');breakpoint.addEventListener('change',()=>{if(breakpoint.matches&&menu?.open)closeMenu()});
document.querySelector('#print-cv')?.addEventListener('click',()=>window.print());
document.querySelectorAll<HTMLAnchorElement>('.language-switch a').forEach(a=>a.addEventListener('click',()=>{const next=new URL(a.href);next.search=location.search;next.hash=location.hash;a.href=next.href}));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}}),{threshold:0.08});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
// Only hide content after the observer is installed; no-JS and reduced-motion stay visible.
root.classList.add('has-observer');
window.addEventListener('pageshow',()=>document.dispatchEvent(new Event('gp:appearance')));
root.dataset.ready='true';

const scrollbarButton=document.querySelector<HTMLButtonElement>('#scrollbar-toggle');
function scrollbarLabel(){if(scrollbarButton)scrollbarButton.textContent=root.dataset.scrollbar==='visible'?(lang==='pt'?'Ocultar barra de rolagem':'Hide scrollbar'):(lang==='pt'?'Mostrar barra de rolagem':'Show scrollbar');}
scrollbarButton?.addEventListener('click',()=>{root.dataset.scrollbar=root.dataset.scrollbar==='visible'?'hidden':'visible';storage.set('gp.scrollbar',root.dataset.scrollbar);scrollbarLabel()});scrollbarLabel();
