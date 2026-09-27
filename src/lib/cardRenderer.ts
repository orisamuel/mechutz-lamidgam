/**
 * Share card, drawn directly with Canvas 2D (no html2canvas): predictable on iOS Safari,
 * correct Hebrew shaping, same output on every device. Two formats: 4:5 post and 9:16 story.
 */
import { COPY } from '../data/copy';

export type CardFormat = 'post' | 'story';

export const CARD_SIZE: Record<CardFormat, { width: number; height: number }> = {
  post: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

export interface CardRunnerUp {
  name: string;
  letters: string | null;
  percent: number;
}

export interface CardData {
  partyName: string;
  officialName: string;
  letters: string | null;
  percent: number;
  identity: string;
  /** Already shortened for display: "example.co.il" */
  url: string;
  portrait: CanvasImageSource | null;
  /** Required when a generated portrait is shown (CEC rules: plain background, high contrast, ≥5% of the content height). */
  disclosure: string | null;
  runnersUp: CardRunnerUp[];
}

const C = {
  paper: '#F2EFE8',
  card: '#FFFFFF',
  ink: '#12233F',
  blue: '#2563EB',
  text: '#111827',
  muted: '#5B6472',
  border: '#E2DDD2',
  track: '#ECE8DF',
  grid: '#EAE6DD',
  highlight: '#F2C94C',
  portraitBg: '#F4F1EA',
};

const SANS = 'Heebo, "Arial Hebrew", Arial, sans-serif';
const SERIF = '"Frank Ruhl Libre", "Times New Roman", serif';

interface Layout {
  top: number; // where the nameplate starts
  cardTop: number;
  urlBaseline: number;
  minHero: number;
  maxHero: number;
}

const LAYOUT: Record<CardFormat, Layout> = {
  post: { top: 0, cardTop: 188, urlBaseline: 1350 - 34, minHero: 300, maxHero: 520 },
  // Stories: keep clear of Instagram's top bar and the reply field at the bottom.
  story: { top: 210, cardTop: 420, urlBaseline: 1920 - 290, minHero: 420, maxHero: 640 },
};

const PAD = 40;

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
    // Fall back to whatever is available; the card still renders.
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

export async function renderCardBlob(data: CardData, format: CardFormat): Promise<Blob | null> {
  const { width, height } = CARD_SIZE[format];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  await ensureFonts();
  drawCard(ctx, data, format);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
}

export function drawCard(ctx: CanvasRenderingContext2D, data: CardData, format: CardFormat): void {
  const { width: W, height: H } = CARD_SIZE[format];
  const L = LAYOUT[format];
  const cardX = 48;
  const cardW = W - cardX * 2;
  const innerW = cardW - PAD * 2;
  const cx = W / 2;

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.direction = 'rtl';
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);

  drawNameplate(ctx, W, L.top);

  // Measure the text blocks first; the hero gets whatever height is left.
  const name = fitSingleOrWrap(ctx, data.partyName, serif, 900, 84, 58, innerW);
  const nameLineH = name.size * 1.12;
  const identity = wrapToFit(ctx, data.identity, sans, 800, 40, 32, innerW, 3);
  const identityLineH = identity.size * 1.34;
  const disclosureSize = Math.max(22, Math.ceil(L.maxHero * 0.05));
  const runnerRows = data.runnersUp.slice(0, 2);

  const eyebrowH = 60;
  const disclosureH = data.disclosure ? disclosureSize + 36 : 0;
  const nameH = nameLineH * name.lines.length + 8;
  const percentH = 118;
  const identityH = identityLineH * identity.lines.length + 24;
  const runnersH = runnerRows.length ? 30 + runnerRows.length * 56 : 0;
  const fixedH = PAD + eyebrowH + 16 + disclosureH + nameH + percentH + identityH + runnersH + PAD;
  const maxCardBottom = L.urlBaseline - 58;
  const heroH = Math.round(Math.min(L.maxHero, Math.max(L.minHero, maxCardBottom - L.cardTop - fixedH)));
  const cardH = fixedH + heroH;

  // Card
  ctx.save();
  ctx.shadowColor = 'rgba(18, 35, 63, 0.10)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = C.card;
  roundRect(ctx, cardX, L.cardTop, cardW, cardH, 28);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, L.cardTop, cardW, cardH, 28);
  ctx.stroke();

  let y = L.cardTop + PAD;

  // Eyebrow with a marker highlight
  ctx.font = sans(800, 32);
  const eyebrow = COPY.result.cardEyebrow;
  const ew = ctx.measureText(eyebrow).width;
  ctx.fillStyle = C.highlight;
  ctx.fillRect(cx - ew / 2 - 14, y + 10, ew + 28, 30);
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'center';
  ctx.fillText(eyebrow, cx, y + 36);
  y += eyebrowH + 16;

  drawHero(ctx, data, cx, y, heroH);
  y += heroH;

  if (data.disclosure) {
    ctx.fillStyle = C.ink;
    ctx.font = sans(700, disclosureSize);
    ctx.textAlign = 'center';
    ctx.fillText(data.disclosure, cx, y + disclosureSize + 20);
    y += disclosureH;
  }

  // Party name (newspaper serif)
  ctx.fillStyle = C.ink;
  ctx.font = serif(900, name.size);
  ctx.textAlign = 'center';
  name.lines.forEach((line, i) => ctx.fillText(line, cx, y + name.size * 0.95 + i * nameLineH));
  y += nameH;

  // Percent + result bar
  drawPercent(ctx, data.percent, cx, y + 86);
  drawBar(ctx, cx - 330, y + 102, 660, 14, data.percent);
  y += percentH;

  // Identity sentence
  ctx.fillStyle = C.text;
  ctx.font = sans(800, identity.size);
  ctx.textAlign = 'center';
  identity.lines.forEach((line, i) => ctx.fillText(line, cx, y + identity.size + 8 + i * identityLineH));
  y += identityH;

  // Runners-up
  if (runnerRows.length) {
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 2;
    line(ctx, cardX + PAD, y + 8, cardX + cardW - PAD, y + 8);
    y += 26;
    runnerRows.forEach((r, i) => drawRunner(ctx, r, i + 2, cardX + PAD, cardX + cardW - PAD, y + i * 56));
  }

  // URL
  if (data.url) {
    ctx.fillStyle = C.muted;
    ctx.font = sans(700, 30);
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.fillText(data.url, cx, Math.max(L.urlBaseline, L.cardTop + cardH + 62));
  }
  ctx.restore();
}

function drawNameplate(ctx: CanvasRenderingContext2D, W: number, top: number): void {
  const cx = W / 2;
  ctx.save();
  ctx.fillStyle = C.muted;
  ctx.font = sans(600, 24);
  ctx.textAlign = 'center';
  ctx.fillText(COPY.mastheadMeta, cx, top + 46);
  ctx.fillStyle = C.ink;
  ctx.font = serif(900, 78);
  ctx.fillText(COPY.productName, cx, top + 128);
  ctx.fillRect(48, top + 150, W - 96, 4);
  ctx.fillRect(48, top + 160, W - 96, 1.5);
  ctx.restore();
}

function drawHero(ctx: CanvasRenderingContext2D, data: CardData, cx: number, top: number, height: number): void {
  if (data.portrait) {
    const ph = height;
    const pw = Math.round(ph * 0.8);
    const px = cx - pw / 2 + 40; // leave room for the slip on the left
    ctx.save();
    roundRect(ctx, px, top, pw, ph, 18);
    ctx.clip();
    ctx.fillStyle = C.portraitBg;
    ctx.fillRect(px, top, pw, ph);
    drawCover(ctx, data.portrait, px, top, pw, ph);
    ctx.restore();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 3;
    roundRect(ctx, px, top, pw, ph, 18);
    ctx.stroke();

    // "איור" tag
    ctx.font = sans(700, 22);
    const tag = COPY.result.illustration;
    const tw = ctx.measureText(tag).width + 28;
    ctx.fillStyle = C.ink;
    roundRect(ctx, px + pw - tw - 16, top + 16, tw, 38, 19);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(tag, px + pw - 16 - tw / 2, top + 43);

    const slipW = Math.round(height * 0.4);
    // Keep the slip within the portrait's height so it never covers the disclosure line below.
    drawSlip(ctx, px - slipW * 0.1, top + ph - (slipW * 1.32) / 2 - 6, slipW, -7, data.letters, data.officialName);
    return;
  }

  // No portrait: the slip on a compass grid
  const gw = Math.round(height * 1.25);
  const gx = cx - gw / 2;
  ctx.save();
  ctx.strokeStyle = C.grid;
  ctx.lineWidth = 2;
  for (let i = 0; i <= 6; i++) {
    line(ctx, gx + (gw * i) / 6, top, gx + (gw * i) / 6, top + height);
    line(ctx, gx, top + (height * i) / 6, gx + gw, top + (height * i) / 6);
  }
  ctx.restore();
  drawSlip(ctx, cx, top + height / 2, Math.round(height * 0.62), -3, data.letters, data.officialName);
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

function drawPercent(ctx: CanvasRenderingContext2D, percent: number, cx: number, baseline: number): void {
  const num = `${percent}%`;
  const word = COPY.result.percentWord;
  ctx.save();
  ctx.font = sans(900, 104);
  ctx.direction = 'ltr';
  const numW = ctx.measureText(num).width;
  ctx.font = sans(800, 44);
  ctx.direction = 'rtl';
  const wordW = ctx.measureText(word).width;
  const gap = 20;
  const left = cx - (numW + gap + wordW) / 2;
  // RTL reading order: number on the right, word on its left.
  ctx.textAlign = 'left';
  ctx.fillStyle = C.ink;
  ctx.fillText(word, left, baseline);
  ctx.font = sans(900, 104);
  ctx.direction = 'ltr';
  ctx.fillStyle = C.blue;
  ctx.fillText(num, left + wordW + gap, baseline);
  ctx.restore();
}

/** Horizontal result bar that fills from the right, like election-night results in Hebrew media. */
function drawBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, percent: number): void {
  ctx.fillStyle = C.track;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  const fw = Math.max(h, (w * percent) / 100);
  ctx.fillStyle = C.blue;
  roundRect(ctx, x + w - fw, y, fw, h, h / 2);
  ctx.fill();
}

function drawRunner(ctx: CanvasRenderingContext2D, r: CardRunnerUp, rank: number, left: number, right: number, top: number): void {
  const mid = top + 30;
  ctx.save();
  // Rank
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(right - 22, mid, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.font = sans(800, 24);
  ctx.textAlign = 'center';
  ctx.fillText(String(rank), right - 22, mid + 9);
  // Name (+ letters)
  ctx.font = sans(700, 32);
  ctx.textAlign = 'right';
  ctx.direction = 'rtl';
  const label = r.letters ? `${r.name} · ${r.letters}` : r.name;
  const nameRight = right - 60;
  const nameMax = 380;
  let shown = label;
  while (ctx.measureText(shown).width > nameMax && shown.length > 4) shown = `${shown.slice(0, -2)}…`;
  ctx.fillText(shown, nameRight, mid + 11);
  // Percent
  ctx.font = sans(800, 32);
  ctx.direction = 'ltr';
  ctx.textAlign = 'left';
  ctx.fillStyle = C.blue;
  ctx.fillText(`${r.percent}%`, left, mid + 11);
  ctx.restore();
  // Bar between them
  const barLeft = left + 100;
  const barRight = nameRight - nameMax - 24;
  if (barRight - barLeft > 60) drawBar(ctx, barLeft, mid - 6, barRight - barLeft, 12, r.percent);
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

function fitSingleOrWrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFn: FontFn,
  weight: number,
  maxSize: number,
  minSize: number,
  maxWidth: number,
): { size: number; lines: string[] } {
  const size = fitFontSize(ctx, text, fontFn, weight, maxWidth, maxSize, minSize);
  ctx.font = fontFn(weight, size);
  if (ctx.measureText(text).width <= maxWidth) return { size, lines: [text] };
  return { size: minSize, lines: wrap(ctx, text, maxWidth, fontFn(weight, minSize)) };
}

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

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
