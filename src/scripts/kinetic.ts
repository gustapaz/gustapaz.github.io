import './light-field';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const root=document.documentElement;
const experience=document.querySelector<HTMLElement>('.experience');
const story=document.querySelector<HTMLElement>('.featured-story');
let context:gsap.Context|undefined;
let version='';
let firstMount=true;

function setup(){
 const reduced=root.dataset.motion==='reduced';const mobile=innerWidth<=760;
 const key=`${reduced}:${mobile}`;if(key===version)return;version=key;
 context?.revert();root.classList.toggle('motion-ready',!reduced);
 document.querySelectorAll<HTMLElement>('.film-panel').forEach(n=>{n.inert=false;n.removeAttribute('aria-hidden')});

 if(reduced){firstMount=false;if(experience){experience.style.setProperty('--journey','0');experience.querySelector<HTMLElement>('.identity-actions')!.inert=false;}gsap.set('.film-panel,.film-frame,.film-copy>*',{clearProps:'all'});return;}
 context=gsap.context(()=>{
  if(experience){
   const opening=experience.querySelector<HTMLElement>('.identity-actions');
   const timeline=gsap.timeline({scrollTrigger:{trigger:experience,start:'top top',end:'bottom bottom',scrub:.9,invalidateOnRefresh:true},onUpdate(){const p=timeline.progress();experience!.style.setProperty('--journey',String(p));experience!.dataset.act=p<.25?'0':p<.62?'1':'2';if(opening)opening.inert=p>.2;const chapter=experience!.querySelector('.identity-chapter b');if(chapter)chapter.textContent=p<.25?'00':p<.62?'01':'02';}});
   timeline.to('.name-gustavo i',{xPercent:-80,yPercent:-160,z:500,rotationY:-60,rotationZ:-8,opacity:0,stagger:.012,duration:.22,ease:'power2.in'},.035)
    .to('.name-paz i,.name-paz b',{xPercent:100,yPercent:150,z:300,rotationX:45,rotationZ:12,opacity:0,stagger:.025,duration:.24,ease:'power2.in'},.04)
    .to('.identity-eyebrow,.identity-intro,.identity-actions',{autoAlpha:0,y:-30,duration:.12},.07)
    .fromTo('.identity-underlay',{autoAlpha:0,rotation:-12,scale:1.2},{autoAlpha:.12,rotation:0,scale:1,duration:.2},.16)
    .fromTo('.act-two',{autoAlpha:0,y:100,scale:.85},{autoAlpha:1,y:0,scale:1,duration:.18},.24)
    .fromTo('.act-two em',{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.12,ease:'power2.inOut'},.28)
    .to('.act-two',{autoAlpha:0,scale:1.8,z:700,filter:'blur(12px)',duration:.16,ease:'power2.in'},.49)
    .to('.identity-underlay',{autoAlpha:0,xPercent:-35,scale:1.8,duration:.2},.48)
    .fromTo('.act-three',{autoAlpha:0,scale:.75},{autoAlpha:1,scale:1,duration:.15},.65)
    .fromTo('.act-three h2>*',{yPercent:120,rotationX:-65,opacity:0},{yPercent:0,rotationX:0,opacity:1,stagger:.045,duration:.14},.67)
    .to('.act-three',{scale:1.04,duration:.15,ease:'none'},.84)
    .to({}, {duration:.001},1);
  }
  if(story){
   const screen=story.querySelector<HTMLElement>('.project-screen')!;
   const panels=gsap.utils.toArray<HTMLElement>('.film-panel');
   const buttons=Array.from(story.querySelectorAll<HTMLButtonElement>('[data-film-target]'));
   const timeline=gsap.timeline({scrollTrigger:{trigger:screen,start:'top top',end:'bottom bottom',scrub:.75,invalidateOnRefresh:true},onUpdate(){const position=timeline.progress()*panels.length;const current=Math.min(panels.length-1,Math.floor(position));story!.dataset.project=String(current);story!.style.setProperty('--film-progress',String(position-current));panels.forEach((panel,i)=>{if(i!==current&&panel.contains(document.activeElement))buttons[current]?.focus({preventScroll:true});panel.inert=i!==current;panel.setAttribute('aria-hidden',String(i!==current))});buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));}});
   panels.forEach((panel,i)=>{
    const frame=panel.querySelector('.film-frame'),copy=panel.querySelectorAll('.film-copy>*'),ambience=panel.querySelector('.film-ambience');
    const poses=[{x:12,y:18,ry:-22,rz:-3,scale:1.18,mask:'inset(0% 0% 100% 0%)'},{x:-25,y:0,ry:0,rz:0,scale:.96,mask:'inset(0% 100% 0% 0%)'},{x:0,y:38,ry:0,rz:0,scale:1,mask:'inset(10% 0% 0% 0%)'},{x:0,y:25,ry:0,rz:-16,scale:.7,mask:'circle(15% at 50% 50%)'}];
    const pose=poses[i];
    timeline.fromTo(panel,{autoAlpha:0},{autoAlpha:1,duration:.1},i)
     .fromTo(frame,{xPercent:mobile?0:pose.x,yPercent:pose.y,rotationY:mobile?0:pose.ry,rotationZ:pose.rz,scale:pose.scale,clipPath:pose.mask},{xPercent:0,yPercent:0,rotationY:0,rotationZ:0,scale:1,clipPath:i===3?'circle(75% at 50% 50%)':'inset(0% 0% 0% 0%)',duration:.36,ease:i===3?'back.out(1.1)':'power3.out'},i+.02)
     .fromTo(copy,{y:i===2?0:40,x:i===2?-40:0,opacity:0},{y:0,x:0,opacity:1,stagger:.025,duration:.2},i+.09)
     .fromTo(ambience,{scale:1.4},{scale:1.05,duration:.9},i);
    if(i===1)timeline.fromTo(panel.querySelectorAll('.film-motif>*'),{opacity:.15,scaleX:.6},{opacity:1,scaleX:1,stagger:.09,duration:.13},i+.12);
    if(i===3)timeline.fromTo(panel.querySelectorAll('.film-motif i'),{y:130,rotation:-90,scale:0},{y:0,rotation:0,scale:1,stagger:.025,duration:.5,ease:'back.out(1.4)'},i+.04);
    if(i<panels.length-1)timeline.to(frame,{xPercent:i===1?35:0,yPercent:i===1?0:-18,scale:i===0?1.12:.95,opacity:0,duration:.12},i+.87).to(copy,{y:-18,opacity:0,duration:.1},i+.89).to(panel,{autoAlpha:0,duration:.05},i+.97);
   });
   timeline.to({}, {duration:.001},panels.length);
   panels.forEach((panel,i)=>{panel.inert=i!==0;panel.setAttribute('aria-hidden',String(i!==0))});
  }
  gsap.utils.toArray<HTMLElement>('.layer-details>div').forEach((node,i)=>gsap.fromTo(node,{y:45,rotationX:-15,opacity:0},{y:0,rotationX:0,opacity:1,duration:.8,delay:i*.1,scrollTrigger:{trigger:node,start:'top 90%',toggleActions:'play none none reverse'}}));
  gsap.fromTo('.archive-heading h2',{clipPath:'inset(0 0 100% 0)',y:50},{clipPath:'inset(0 0 0% 0)',y:0,duration:1.2,ease:'power3.out',scrollTrigger:{trigger:'.archive',start:'top 75%'}});
  gsap.fromTo('.work-seam i',{scaleY:.15,opacity:.2},{scaleY:1,opacity:1,scrollTrigger:{trigger:'.layer-details',start:'top bottom',end:'bottom top',scrub:.7}});
  gsap.fromTo('.story-opening h2>span',{yPercent:60,opacity:.2},{yPercent:0,opacity:1,stagger:.12,scrollTrigger:{trigger:'.story-opening',start:'top 85%',end:'bottom 55%',scrub:.6}});
  gsap.fromTo('.signature-light',{scaleX:4,xPercent:-140,opacity:.65},{scaleX:.04,xPercent:0,opacity:0,scrollTrigger:{trigger:'.closing-signature',start:'top 90%',end:'bottom 90%',scrub:.8}});
  gsap.fromTo('.signature-dot i',{scale:.2,opacity:.3},{scale:1,opacity:1,scrollTrigger:{trigger:'.closing-signature',start:'top 85%',end:'bottom 85%',scrub:.7}});
 });
 ScrollTrigger.refresh();
 if(firstMount){firstMount=false;if(location.hash){requestAnimationFrame(()=>{try{const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));target?.scrollIntoView({behavior:'instant',block:'start'});ScrollTrigger.update()}catch{}})}}
}
document.querySelectorAll<HTMLButtonElement>('[data-film-target]').forEach(button=>button.addEventListener('click',()=>{if(root.dataset.motion==='reduced'){document.querySelector(`[data-film="${button.dataset.filmTarget}"]`)?.scrollIntoView({behavior:'instant',block:'start'});return;}const screen=document.querySelector<HTMLElement>('.project-screen');if(!screen)return;const i=Number(button.dataset.filmTarget);const range=screen.offsetHeight-innerHeight;const top=screen.getBoundingClientRect().top+scrollY+range*((i+.53)/document.querySelectorAll('.film-panel').length);window.scrollTo({top,behavior:'smooth'})}));
document.addEventListener('gp:appearance',setup);window.addEventListener('pageshow',()=>{setup();ScrollTrigger.refresh()});let resizeTimer:ReturnType<typeof setTimeout>;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(setup,180)});setup();
