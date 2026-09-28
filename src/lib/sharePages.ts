import { COPY } from '../data/copy';
import type { Party } from '../data/parties';
import { PREVIEW } from './previewImage';

/**
 * The static page behind a shared result link (/r/<slug>/), written into the build by vite.config.ts.
 * Messengers read its Open Graph tags and show the party's preview image; people who open it are sent
 * on to the quiz. `site` is the absolute site URL with a trailing slash ('' in local builds → relative).
 */
export function sharePageHtml(party: Party, site: string, noindex: boolean): string {
  const abs = (path: string) => (site ? `${site}${path}` : `../../${path}`);
  const title = COPY.share.title(party.name);
  const alt = `${COPY.result.cardEyebrow}: ${party.name}`;
  return `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)} | ${esc(COPY.productName)}</title>
    <meta name="description" content="${esc(COPY.share.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="he_IL" />
    <meta property="og:site_name" content="${esc(COPY.productName)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(COPY.share.description)}" />
    <meta property="og:url" content="${esc(abs(`r/${party.id}/`))}" />
    <meta property="og:image" content="${esc(abs(`og/${party.id}.jpg`))}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="${PREVIEW.width}" />
    <meta property="og:image:height" content="${PREVIEW.height}" />
    <meta property="og:image:alt" content="${esc(alt)}" />
    <meta name="twitter:card" content="summary_large_image" />
${noindex ? '    <meta name="robots" content="noindex, nofollow" />\n' : ''}    <script>location.replace('../../');</script>
  </head>
  <body>
    <p><a href="../../">${esc(COPY.share.open)}</a></p>
  </body>
</html>
`;
}

/** Open Graph tags for the site's own page (index.html). */
export function siteMetaTags(site: string): string {
  if (!site) return '';
  return [
    `<meta property="og:url" content="${esc(site)}" />`,
    `<meta property="og:image" content="${esc(`${site}og/site.jpg`)}" />`,
    '<meta property="og:image:type" content="image/jpeg" />',
    `<meta property="og:image:width" content="${PREVIEW.width}" />`,
    `<meta property="og:image:height" content="${PREVIEW.height}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ]
    .map((tag) => `    ${tag}\n`)
    .join('');
}

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
