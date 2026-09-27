/// <reference types="vitest/config" />
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** Dev-only: POST /__save?name=x.png writes a rendered share card to references/generated/previews for review. */
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
          const name = new URL(req.url ?? '', 'http://localhost').searchParams.get('name') ?? 'preview.png';
          const dir = path.resolve('references/generated/previews');
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, name.replace(/[^a-z0-9._-]/gi, '_')), Buffer.concat(chunks));
          res.end('ok');
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const noindex = env.VITE_NOINDEX === '1';

  return {
    // Relative base: works both on GitHub Pages (/<repo>/) and on a custom domain root.
    base: './',
    plugins: [
      react(),
      savePreviews(),
      {
        name: 'staging-noindex',
        transformIndexHtml(html) {
          if (!noindex) return html;
          return html.replace('</head>', '    <meta name="robots" content="noindex, nofollow" />\n  </head>');
        },
      },
    ],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  };
});
