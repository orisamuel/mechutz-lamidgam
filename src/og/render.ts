/**
 * Dev-only entry for og.html: renders the link-preview images (site + one per party) and saves them into
 * public/og/ through the dev server's /__save endpoint. Rerun after changing a portrait, a name or the design.
 */
import '@fontsource/heebo/500.css';
import '@fontsource/heebo/700.css';
import '@fontsource/heebo/800.css';
import '@fontsource/heebo/900.css';
import '@fontsource/frank-ruhl-libre/700.css';
import '@fontsource/frank-ruhl-libre/900.css';
import { PARTIES } from '../data/parties';
import { asset } from '../lib/assets';
import { drawPartyPreview, drawSitePreview, loadImage, toJpeg } from '../lib/previewImage';

async function save(name: string, blob: Blob | null): Promise<string> {
  if (!blob) throw new Error(`no image for ${name}`);
  const res = await fetch(`/__save?target=og&name=${name}`, { method: 'POST', body: blob });
  if (!res.ok) throw new Error(`could not save ${name}`);
  return `${name} (${Math.round(blob.size / 1024)}KB)`;
}

async function run(): Promise<string[]> {
  const saved = [await save('site.jpg', await toJpeg((ctx) => drawSitePreview(ctx, PARTIES)))];
  for (const party of PARTIES) {
    const portrait = party.portrait ? await loadImage(asset(party.portrait)) : null;
    saved.push(await save(`${party.id}.jpg`, await toJpeg((ctx) => drawPartyPreview(ctx, party, portrait))));
  }
  return saved;
}

const status = document.getElementById('status')!;
run().then(
  (saved) => {
    status.textContent = `נשמרו: ${saved.join(' · ')}`;
  },
  (err: unknown) => {
    status.textContent = `שגיאה: ${String(err)}`;
  },
);
