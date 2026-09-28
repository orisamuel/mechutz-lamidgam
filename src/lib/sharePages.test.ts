import { describe, expect, it } from 'vitest';
import { PARTIES, partyById } from '../data/parties';
import { sharePageHtml, siteMetaTags } from './sharePages';

const SITE = 'https://lo-ovrot.fun/';

describe('share pages (/r/<slug>/)', () => {
  it('give messengers an absolute preview image and title for the party', () => {
    const html = sharePageHtml(partyById('gan-eden'), SITE, false);
    expect(html).toContain('<meta property="og:title" content="יצא לי: גן עדן" />');
    expect(html).toContain('<meta property="og:image" content="https://lo-ovrot.fun/og/gan-eden.jpg" />');
    expect(html).toContain('<meta property="og:url" content="https://lo-ovrot.fun/r/gan-eden/" />');
    expect(html).toContain('summary_large_image');
    expect(html).not.toContain('noindex');
  });

  it('send people on to the quiz (script redirect, plus a plain link without scripts)', () => {
    const html = sharePageHtml(partyById('pirates'), SITE, false);
    expect(html).toContain("location.replace('../../')");
    expect(html).toContain('<a href="../../">');
  });

  it('escape names and carry the staging noindex', () => {
    for (const party of PARTIES) {
      const html = sharePageHtml({ ...party, name: 'א "ב" <ג> & ד' }, SITE, true);
      expect(html).toContain('יצא לי: א &quot;ב&quot; &lt;ג&gt; &amp; ד');
      expect(html).toContain('<meta name="robots" content="noindex, nofollow" />');
    }
  });

  it('fall back to relative links in local builds without a site URL', () => {
    expect(sharePageHtml(partyById('hatikun'), '', false)).toContain('content="../../og/hatikun.jpg"');
    expect(siteMetaTags('')).toBe('');
    expect(siteMetaTags(SITE)).toContain('content="https://lo-ovrot.fun/og/site.jpg"');
  });
});
