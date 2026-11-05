import { writeFile, mkdir } from 'node:fs/promises';
import { normalizePage } from '../src/lib/catalog.mjs';
const repos = [];
for (let page=1; page<=20; page++) {
  const response = await fetch(`https://api.github.com/users/gustapaz/repos?type=owner&per_page=100&sort=created&page=${page}`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'gustapaz-portfolio' }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`GitHub sync: HTTP ${response.status}. Previous snapshot preserved.`);
  const raw = await response.json(); repos.push(...normalizePage(raw));
  if (raw.length < 100) break;
  if (page === 20) throw new Error('Pagination limit; snapshot preserved.');
}
if (!repos.length) throw new Error('Empty catalogue; snapshot preserved.');
const snapshot = { version:1, fetchedAt:new Date().toISOString(), repositories:repos };
await mkdir('public/data', {recursive:true});
await writeFile('public/data/github.json', JSON.stringify(snapshot,null,2)+'\n');
console.log(`Synchronized ${repos.length} public original repositories. No credentials used.`);
