/// <reference types="vitest/config" />
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { PARTIES } from './src/data/parties';
import { sharePageHtml, siteMetaTags } from './src/lib/sharePages';

/**
 * Dev-only: POST /__save?name=x.jpg writes a rendered image for review into references/generated/previews,
 * or with &target=og into public/og (the link-preview images, rendered by og.html).
 */
function savePreviews(): Plugin {
  return {
    name: 'dev-save-previews',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__save', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          const params = new URL(req.url ?? '', 'http://localhost').searchParams;
          const name = (params.get('name') ?? 'preview.png').replace(/[^a-z0-9._-]/gi, '_');
          const dir = path.resolve(params.get('target') === 'og' ? 'public/og' : 'references/generated/previews');
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, name), Buffer.concat(chunks));
          res.end('ok');
        });
      });
    },
  };
}

/** Build-only: one static page per party behind the shared result links (/r/<slug>/). */
function sharePages(site: string, noindex: boolean): Plugin {
  return {
    name: 'share-pages',
    apply: 'build',
    generateBundle() {
      for (const party of PARTIES) {
        this.emitFile({ type: 'asset', fileName: `r/${party.id}/index.html`, source: sharePageHtml(party, site, noindex) });
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const noindex = env.VITE_NOINDEX === '1';
  const site = env.VITE_SITE_URL ? env.VITE_SITE_URL.replace(/\/?$/, '/') : '';

  return {
    // Relative base: works both on GitHub Pages (/<repo>/) and on a custom domain root.
    base: './',
    plugins: [
      react(),
      savePreviews(),
      sharePages(site, noindex),
      {
        name: 'site-meta',
        transformIndexHtml(html) {
          const robots = noindex ? '    <meta name="robots" content="noindex, nofollow" />\n' : '';
          return html.replace('  </head>', `${siteMetaTags(site)}${robots}  </head>`);
        },
      },
    ],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  };
});
