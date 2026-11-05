import { readFile, writeFile } from 'node:fs/promises';
const sections=[];
for(const pkg of ['@fontsource/space-grotesk','@fontsource/manrope']){
 const meta=JSON.parse(await readFile(`node_modules/${pkg}/package.json`,'utf8'));
 sections.push(`${pkg} ${meta.version}\n${await readFile(`node_modules/${pkg}/LICENSE`,'utf8')}`);
}
const gsap=JSON.parse(await readFile('node_modules/gsap/package.json','utf8'));
const core=await readFile('node_modules/gsap/gsap-core.js','utf8');
const trigger=await readFile('node_modules/gsap/ScrollTrigger.js','utf8');
sections.push(`GSAP ${gsap.version}\n${gsap.license}\n${core.match(/\/\*![\s\S]*?\*\//)?.[0]||''}\n${trigger.match(/\/\*![\s\S]*?\*\//)?.[0]||''}\nCopyright (c) 2008-2026, GreenSock. All rights reserved.\nhttps://gsap.com/standard-license/`);
await writeFile('dist/third-party.txt',sections.join('\n\n'));
console.log('Font and GSAP proprietary notices preserved. Astro is build-time only.');
