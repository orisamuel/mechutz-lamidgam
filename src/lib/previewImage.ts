/**
 * Link-preview images (Open Graph, 1200×630): one per party for the shared result links, and one for the
 * site itself. Drawn with Canvas 2D in the browser from the same design tokens as the site, then saved
 * into public/og/ by the dev-only page og.html. The site never renders these at runtime.
 */
import { COPY } from '../data/copy';
import type { Party } from '../data/parties';

export const PREVIEW = { width: 1200, height: 630 } as const;

const C = {
  paper: '#F2EFE8',
  ink: '#12233F',
  text: '#111827',
  muted: '#5B6472',
  highlight: '#F2C94C',
  portraitBg: '#F4F1EA',
};

const SANS = 'Heebo, "Arial Hebrew", Arial, sans-serif';
const SERIF = '"Frank Ruhl Libre", "Times New Roman", serif';

export function sans(weight: number, size: number): string {
  return `${weight} ${Math.round(size)}px ${SANS}`;
}

export function serif(weight: number, size: number): string {
  return `${weight} ${Math.round(size)}px ${SERIF}`;
}

export async function ensureFonts(): Promise<void> {
  const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
  if (!fonts?.load) return;
  const sample = 'אבגדהו 93%';
  try {
    await Promise.all([
      ...[500, 600, 700, 800, 900].map((w) => fonts.load(sans(w, 40), sample)),
      ...[700, 900].map((w) => fonts.load(serif(w, 40), sample)),
    ]);
  } catch {
    // Fall back to whatever is available; the image still renders.
  }
}

export function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** JPEG keeps each image well under the ~300 KB that messengers are happy to fetch. */
export async function toJpeg(draw: (ctx: CanvasRenderingContext2D) => void): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = PREVIEW.width;
  canvas.height = PREVIEW.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  await ensureFonts();
  draw(ctx);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.86));
}

/** "המפלגה שהכי מתאימה לי: גן עדן", with the portrait and ballot slip. The percent is per person, so it stays in the text. */
export function drawPartyPreview(ctx: CanvasRenderingContext2D, party: Party, portrait: CanvasImageSource | null): void {
  const { width: W, height: H } = PREVIEW;
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.direction = 'rtl';
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);

  // Portrait on the left, slip on its corner.
  const ph = 490;
  const pw = Math.round(ph * 0.8);
  const px = 96;
  const py = (H - ph) / 2;
  if (portrait) {
    ctx.save();
    roundRect(ctx, px, py, pw, ph, 18);
    ctx.clip();
    ctx.fillStyle = C.portraitBg;
    ctx.fillRect(px, py, pw, ph);
    drawCover(ctx, portrait, px, py, pw, ph);
    ctx.restore();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 3;
    roundRect(ctx, px, py, pw, ph, 18);
    ctx.stroke();
    if (party.portraitAnonymous) drawNote(ctx, COPY.result.noPhotoNote, px + 16, py + 16, pw - 32);
    else drawTag(ctx, COPY.result.illustration, px + pw - 16, py + 16);
  }
  drawSlip(ctx, px + 4, py + ph - 104, 164, -7, party.letters, party.officialName);

  // Text on the right, right-aligned.
  const right = W - 72;
  const textW = right - (px + pw + 64);
  drawWordmark(ctx, right, 118, textW, 64);

  ctx.font = sans(800, 34);
  ctx.textAlign = 'right';
  const eyebrow = COPY.result.cardEyebrow;
  const ew = ctx.measureText(eyebrow).width;
  ctx.fillStyle = C.highlight;
  ctx.fillRect(right - ew - 10, 250, ew + 20, 30);
  ctx.fillStyle = C.ink;
  ctx.fillText(eyebrow, right, 276);

  // One line up to 96px; a name that needs two lines is set smaller, so it never crowds the call to action.
  const oneLine = wrapToFit(ctx, party.name, serif, 900, 96, 64, textW, 1);
  const name = oneLine.lines.length === 1 && oneLine.size >= 72 ? oneLine : wrapToFit(ctx, party.name, serif, 900, 80, 56, textW, 2);
  ctx.font = serif(900, name.size);
  ctx.fillStyle = C.ink;
  name.lines.forEach((l, i) => ctx.fillText(l, right, 290 + name.size * 1.02 + i * name.size * 1.08));

  ctx.font = sans(800, 34);
  ctx.fillStyle = C.ink;
  ctx.fillText(COPY.share.cta, right, H - 80);
  ctx.font = sans(700, 28);
  ctx.fillStyle = C.muted;
  ctx.direction = 'ltr';
  ctx.fillText(COPY.share.domain, right, H - 40);
  ctx.restore();
}

/** The site's own preview: the nameplate, the promise, and the six ballot slips. */
export function drawSitePreview(ctx: CanvasRenderingContext2D, parties: Party[]): void {
  const { width: W, height: H } = PREVIEW;
  const cx = W / 2;
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.direction = 'rtl';
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.font = sans(800, 24);
  ctx.fillStyle = C.ink;
  ctx.fillText(`★  ${COPY.intro.edition}  ★`, cx, 68);
  ctx.font = serif(900, 124);
  ctx.fillText(COPY.productName, cx, 184);
  ctx.fillRect(90, 208, W - 180, 5);
  ctx.fillRect(90, 220, W - 180, 2);
  ctx.font = sans(600, 26);
  ctx.fillStyle = C.muted;
  ctx.fillText(COPY.mastheadMeta, cx, 264);

  const promise = wrapToFit(ctx, COPY.share.description, sans, 800, 36, 30, W - 220, 2);
  ctx.font = sans(800, promise.size);
  ctx.fillStyle = C.ink;
  promise.lines.forEach((l, i) => ctx.fillText(l, cx, 322 + i * promise.size * 1.3));

  // Fan of slips, first list on the right as on the intro page.
  const n = parties.length;
  parties.forEach((p, i) => {
    const offset = (n - 1) / 2 - i;
    drawSlip(ctx, cx + offset * 128, 496 + Math.abs(offset) * 10, 118, -offset * 5, p.letters, p.officialName);
  });
  ctx.restore();
}

function drawWordmark(ctx: CanvasRenderingContext2D, right: number, baseline: number, width: number, size: number): void {
  ctx.save();
  ctx.textAlign = 'right';
  ctx.fillStyle = C.ink;
  ctx.font = serif(900, size);
  ctx.fillText(COPY.productName, right, baseline);
  ctx.fillRect(right - width, baseline + 18, width, 4);
  ctx.fillRect(right - width, baseline + 28, width, 1.5);
  ctx.font = sans(600, 22);
  ctx.fillStyle = C.muted;
  ctx.fillText(COPY.mastheadMeta, right, baseline + 66);
  ctx.restore();
}

/** The dark "איור" pill on the portrait's top-right corner. */
function drawTag(ctx: CanvasRenderingContext2D, text: string, right: number, top: number): void {
  ctx.save();
  ctx.font = sans(700, 22);
  const tw = ctx.measureText(text).width + 28;
  ctx.fillStyle = C.ink;
  roundRect(ctx, right - tw, top, tw, 38, 19);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(text, right - tw / 2, top + 27);
  ctx.restore();
}

/** The anonymous figure's strip: the same dark pill, full width, wrapping onto two lines if needed. */
function drawNote(ctx: CanvasRenderingContext2D, text: string, x: number, top: number, width: number): void {
  const block = wrapToFit(ctx, text, sans, 800, 24, 20, width - 36, 2);
  const lineH = block.size * 1.3;
  const h = lineH * block.lines.length + 22;
  ctx.save();
  ctx.fillStyle = C.ink;
  roundRect(ctx, x, top, width, h, 16);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = sans(800, block.size);
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  block.lines.forEach((l, i) => ctx.fillText(l, x + width / 2, top + 11 + block.size + i * lineH));
  ctx.restore();
}

/** Israeli ballot slip: big letters on top, the list name underneath. */
export function drawSlip(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  angleDeg: number,
  letters: string | null,
  name: string,
): void {
  const h = Math.round(w * 1.32);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((angleDeg * Math.PI) / 180);
  ctx.shadowColor = 'rgba(18, 35, 63, 0.25)';
  ctx.shadowBlur = w * 0.12;
  ctx.shadowOffsetY = w * 0.04;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, -w / 2, -h / 2, w, h, w * 0.02);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#C9CFD8';
  ctx.lineWidth = Math.max(1.5, w * 0.006);
  ctx.stroke();

  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  if (letters) {
    const size = fitFontSize(ctx, letters, sans, 900, w * 0.8, w * 0.52, w * 0.2);
    ctx.font = sans(900, size);
    ctx.fillText(letters, 0, -h * 0.05);
    const block = wrapToFit(ctx, name, sans, 700, w * 0.078, w * 0.056, w * 0.82, 3);
    ctx.font = sans(700, block.size);
    block.lines.forEach((l, i) => ctx.fillText(l, 0, h * 0.17 + i * block.size * 1.25));
  } else {
    const block = wrapToFit(ctx, name, sans, 800, w * 0.13, w * 0.08, w * 0.8, 4);
    const lh = block.size * 1.22;
    const first = -((block.lines.length - 1) * lh) / 2 + block.size * 0.35;
    ctx.font = sans(800, block.size);
    block.lines.forEach((l, i) => ctx.fillText(l, 0, first + i * lh));
  }
  ctx.strokeStyle = '#E3E7ED';
  ctx.lineWidth = Math.max(1, w * 0.004);
  roundRect(ctx, -w / 2 + w * 0.05, -h / 2 + w * 0.05, w * 0.9, h - w * 0.1, w * 0.01);
  ctx.stroke();
  ctx.restore();
}

function drawCover(ctx: CanvasRenderingContext2D, img: CanvasImageSource, x: number, y: number, w: number, h: number): void {
  const iw = 'naturalWidth' in img ? img.naturalWidth : (img as { width: number }).width;
  const ih = 'naturalHeight' in img ? img.naturalHeight : (img as { height: number }).height;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) * 0.3, sw, sh, x, y, w, h);
}

type FontFn = (weight: number, size: number) => string;

export function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFn: FontFn,
  weight: number,
  maxWidth: number,
  maxSize: number,
  minSize: number,
): number {
  for (let size = maxSize; size > minSize; size -= 2) {
    ctx.font = fontFn(weight, size);
    if (ctx.measureText(text).width <= maxWidth) return size;
  }
  return minSize;
}

/** Wrap into at most maxLines, shrinking the font down to minSize before truncating. */
export function wrapToFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFn: FontFn,
  weight: number,
  maxSize: number,
  minSize: number,
  maxWidth: number,
  maxLines: number,
): { size: number; lines: string[] } {
  for (let size = maxSize; size >= minSize; size -= 2) {
    const lines = wrap(ctx, text, maxWidth, fontFn(weight, size));
    if (lines.length <= maxLines) return { size, lines };
  }
  const lines = wrap(ctx, text, maxWidth, fontFn(weight, minSize));
  const kept = lines.slice(0, maxLines);
  if (lines.length > maxLines) kept[maxLines - 1] = `${kept[maxLines - 1]!.replace(/[.,]?$/, '')}…`;
  return { size: minSize, lines: kept };
}

export function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSpec: string): string[] {
  ctx.font = fontSpec;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) current = candidate;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
