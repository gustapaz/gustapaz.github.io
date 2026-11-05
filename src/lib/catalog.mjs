export const OWNER = 'gustapaz';
export const CATEGORIES = ['all', 'frontend', 'backend', 'fullstack', 'games', 'other'];
const games = new Set('ricochete vagalume apice brasao furtivo sincope tacada semeia vao cifra arremate veletra salao-17 brotar carretel fresta confete'.split(' '));
const fullstack = new Set('vertice-studio caustica vagao postera ima pendular urdume doca rubato chanfro vazao cortejo baliza fagulha ilhota cadencia'.split(' '));
const front = new Set('forma-studio mise cine-aurora tandem brava nomade pulso acervo quadra prorroga margem desvio croma-lab andar-zero codepop orbita refugio alunissagem moagem banca estrato foco-optico trama-material'.split(' '));
export function safeUrl(value, host) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && (!host || url.hostname === host) ? url.href : null; } catch { return null; }
}
export function categoryOf(repo) {
  if (games.has(repo.name)) return 'games';
  if (fullstack.has(repo.name)) return 'fullstack';
  if (repo.name.endsWith('-api')) return 'backend';
  if (front.has(repo.name)) return 'frontend';
  const tags = Array.isArray(repo.topics) ? repo.topics : [];
  if (tags.some(t => ['browser-game', 'game', 'games', 'phaser', 'gamedev'].includes(t))) return 'games';
  if (tags.some(t => ['fullstack', 'full-stack'].includes(t))) return 'fullstack';
  if (tags.some(t => ['backend', 'back-end', 'rest-api', 'api'].includes(t))) return 'backend';
  if (tags.some(t => ['frontend', 'front-end', 'website'].includes(t))) return 'frontend';
  return 'other';
}
export function normalizeRepo(raw) {
  if (!raw || raw.owner?.login?.toLowerCase() !== OWNER || raw.private !== false || raw.fork || raw.archived || raw.disabled) return null;
  if (!/^[A-Za-z0-9_.-]{1,100}$/.test(raw.name || '') || ['gustapaz.github.io', 'gustapaz'].includes(raw.name.toLowerCase())) return null;
  const url = safeUrl(raw.html_url, 'github.com');
  if (!url || new URL(url).pathname.toLowerCase() !== `/${OWNER}/${raw.name}`.toLowerCase()) return null;
  return { name: raw.name, description: String(raw.description || '').slice(0, 600), url, demo: safeUrl(raw.homepage), language: typeof raw.language === 'string' ? raw.language.slice(0, 50) : '', topics: Array.isArray(raw.topics) ? raw.topics.filter(t => typeof t === 'string').slice(0, 20) : [], category: categoryOf(raw), created: validDate(raw.created_at), updated: validDate(raw.pushed_at || raw.updated_at) };
}
function validDate(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : '1970-01-01T00:00:00Z'; }
export function normalizePage(raw) { if (!Array.isArray(raw)) throw new Error('Invalid GitHub response'); return raw.map(normalizeRepo).filter(r => r !== null); }
export function selectRepos(repos, {q = '', category = 'all', sort = 'created'} = {}) {
  const fold = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const words = fold(q).trim().split(/\s+/).filter(Boolean);
  return repos.filter(r => (category === 'all' || r.category === category) && words.every(w => fold(`${r.name} ${r.description} ${r.language} ${r.topics.join(' ')}`).includes(w))).sort((a,b) => sort === 'name' ? a.name.localeCompare(b.name) : Date.parse(b[sort === 'updated' ? 'updated' : 'created']) - Date.parse(a[sort === 'updated' ? 'updated' : 'created']) || a.name.localeCompare(b.name));
}
export function parseState(search) {
  const p = new URLSearchParams(search);
  const category=p.get('category') || 'all',sort=p.get('sort') || 'created';
  return { q: (p.get('q') || '').slice(0, 120), category: CATEGORIES.includes(category) ? category : 'all', sort: ['created','updated','name'].includes(sort) ? sort : 'created', view: p.get('view') === 'list' ? 'list' : 'gallery', selected: (p.get('project') || '').slice(0,100), page: Math.min(100, Math.max(1, Number.parseInt(p.get('page') || '1',10) || 1)) };
}
