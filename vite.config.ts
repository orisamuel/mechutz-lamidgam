/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const noindex = env.VITE_NOINDEX === '1';

  return {
    // Relative base: works both on GitHub Pages (/<repo>/) and on a custom domain root.
    base: './',
    plugins: [
      react(),
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
