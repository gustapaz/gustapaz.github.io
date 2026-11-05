import { projects } from '../data/projects';
export function GET(){
 const urls=['pt','en'].flatMap(lang=>[`/${lang}/`,`/${lang}/curriculo/`,...projects.map(p=>`/${lang}/projetos/${p.slug}/`)]);
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(path=>`<url><loc>https://gustapaz.github.io${path}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});
}
