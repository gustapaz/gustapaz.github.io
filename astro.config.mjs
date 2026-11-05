import { defineConfig } from 'astro/config';
export default defineConfig({ site: 'https://gustapaz.github.io', trailingSlash: 'always', output: 'static', devToolbar: { enabled: false }, vite: { build: { sourcemap: false } } });
