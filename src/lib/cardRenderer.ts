/**
 * Share card, drawn directly with Canvas 2D (no html2canvas): predictable on iOS Safari,
 * correct Hebrew shaping, same output on every device. Two formats: 4:5 post and 9:16 story.
 */

export type CardFormat = 'post' | 'story';

export const CARD_SIZE: Record<CardFormat, { width: number; height: number }> = {
  post: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

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
}

const C = {
  navy: '#12233F',
  blue: '#2563EB',
  bg: '#F4F6F9',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#5B6472',
  border: '#DCE2EA',
  grid: '#E6EAF0',
  mastheadSub: '#B8C7E6',
};

const FAMILY = 'Heebo, "Arial Hebrew", Arial, sans-serif';

interface Layout {
  mastheadH: number;
  mastheadBaseline: number;
  cardTop: number;
  heroTop: number;
  heroH: number;
  nameGap: number;
  cardBottomPad: number;
  urlBaseline: number;
}

const LAYOUT: Record<CardFormat, Layout> = {
  post: {
    mastheadH: 132,
    mastheadBaseline: 84,
    cardTop: 168,
    heroTop: 262,
    heroH: 470,
    nameGap: 84,
    cardBottomPad: 44,
    urlBaseline: 1350 - 46,
  },
  story: {
    mastheadH: 330,
    mastheadBaseline: 282,
    cardTop: 372,
    heroTop: 474,
    heroH: 620,
    nameGap: 96,
    cardBottomPad: 56,
    urlBaseline: 1920 - 300,
  },
};

export function font(weight: number, size: number): string {
  return `${weight} ${Math.round(size)}px ${FAMILY}`;
}

export async function ensureFonts(): Promise<void> {
  const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
  if (!fonts?.load) return;
  const sample = 'אבגדהו 93%';
  try {
    await Promise.all([400, 500, 700, 800, 900].map((w) => fonts.load(font(w, 40), sample)));
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
  const innerW = cardW - 96;

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.direction = 'rtl';

  // Page and masthead
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.navy;
  ctx.fillRect(0, 0, W, L.mastheadH);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = font(900, 52);
  ctx.textAlign = 'right';
  ctx.fillText('מחוץ למדגם', W - 64, L.mastheadBaseline);

  ctx.fillStyle = C.mastheadSub;
  ctx.font = font(500, 26);
  ctx.textAlign = 'left';
  ctx.fillText('מצפן המפלגות הקטנות · בחירות 2026', 64, L.mastheadBaseline - 4);

  // Text block, measured first; the hero then grows into whatever vertical space is left.
  const nameLines = fitSingleOrWrap(ctx, data.partyName, 900, 84, 60, innerW);
  const nameLineH = nameLines.size * 1.1;
  const identity = wrapToFit(ctx, data.identity, 800, 48, 38, innerW, 3);
  const identityLineH = identity.size * 1.32;
  const textBlockH =
    nameLineH * (nameLines.lines.length - 1) + 118 + 88 + identityLineH * (identity.lines.length - 1);
  // ≥5% of the tallest possible portrait, so the disclosure always meets the CEC minimum.
  const disclosureSize = Math.max(24, Math.ceil((L.heroH + 200) * 0.05));
  const disclosureExtra = data.disclosure ? disclosureSize + 26 : 0;
  const maxCardBottom = L.urlBaseline - 64;
  const fixedH = L.heroTop + L.nameGap + disclosureExtra + textBlockH + L.cardBottomPad + 16;
  const heroH = Math.min(L.heroH + 200, Math.max(L.heroH, maxCardBottom - fixedH));

  const disclosureBaseline = L.heroTop + heroH + disclosureSize + 22;
  const nameFirst = L.heroTop + heroH + L.nameGap + disclosureExtra;
  const nameLast = nameFirst + nameLineH * (nameLines.lines.length - 1);
  const percentBaseline = nameLast + 118;
  const identityFirst = percentBaseline + 88;
  const identityLast = identityFirst + identityLineH * (identity.lines.length - 1);
  const cardBottom = identityLast + L.cardBottomPad + 16;

  // Card
  ctx.save();
  ctx.shadowColor = 'rgba(18, 35, 63, 0.08)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = C.card;
  roundRect(ctx, cardX, L.cardTop, cardW, cardBottom - L.cardTop, 32);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, L.cardTop, cardW, cardBottom - L.cardTop, 32);
  ctx.stroke();

  // Eyebrow
  ctx.fillStyle = C.blue;
  ctx.font = font(700, 30);
  ctx.textAlign = 'center';
  ctx.fillText('ההתאמה הגבוהה ביותר שלי', W / 2, L.cardTop + 62);

  // Hero: portrait with a ballot slip on its corner, or the slip alone on a compass grid.
  drawHero(ctx, data, W / 2, L.heroTop, heroH);

  if (data.disclosure) {
    ctx.fillStyle = C.navy;
    ctx.font = font(700, disclosureSize);
    ctx.textAlign = 'center';
    ctx.fillText(data.disclosure, W / 2, disclosureBaseline);
  }

  // Party name
  ctx.fillStyle = C.navy;
  ctx.textAlign = 'center';
  ctx.font = font(900, nameLines.size);
  nameLines.lines.forEach((line, i) => ctx.fillText(line, W / 2, nameFirst + i * nameLineH));

  // Percent: big number + word, measured as two runs so the number never flips.
  drawPercent(ctx, data.percent, W / 2, percentBaseline);

  // Identity sentence
  ctx.fillStyle = C.text;
  ctx.font = font(800, identity.size);
  ctx.textAlign = 'center';
  identity.lines.forEach((line, i) => ctx.fillText(line, W / 2, identityFirst + i * identityLineH));

  // URL
  if (data.url) {
    ctx.fillStyle = C.muted;
    ctx.font = font(600, 30);
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.fillText(data.url, W / 2, Math.max(L.urlBaseline, cardBottom + 70));
  }

  ctx.restore();
}

function drawHero(ctx: CanvasRenderingContext2D, data: CardData, cx: number, top: number, height: number): void {
  if (data.portrait) {
    const ph = height;
    const pw = Math.round(ph * 0.8);
    const px = cx - pw / 2;
    ctx.save();
    roundRect(ctx, px, top, pw, ph, 24);
    ctx.clip();
    drawCover(ctx, data.portrait, px, top, pw, ph);
    ctx.restore();
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 2;
    roundRect(ctx, px, top, pw, ph, 24);
    ctx.stroke();

    // Small "איור" tag: the portraits are illustrations, not photos.
    ctx.font = font(700, 22);
    const tag = 'איור';
    const tw = ctx.measureText(tag).width + 28;
    ctx.fillStyle = 'rgba(18, 35, 63, 0.72)';
    roundRect(ctx, px + pw - tw - 16, top + 16, tw, 38, 19);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(tag, px + pw - 16 - tw / 2, top + 43);

    const slipW = Math.round(height * 0.42);
    drawSlip(ctx, px - slipW * 0.18, top + ph - slipW * 0.52, slipW, -6, data.letters, data.officialName);
    return;
  }

  // Compass grid behind the slip
  const gw = Math.round(height * 1.25);
  const gx = cx - gw / 2;
  ctx.save();
  ctx.strokeStyle = C.grid;
  ctx.lineWidth = 2;
  for (let i = 0; i <= 6; i++) {
    const x = gx + (gw * i) / 6;
    const y = top + (height * i) / 6;
    line(ctx, x, top, x, top + height);
    line(ctx, gx, y, gx + gw, y);
  }
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 3;
  line(ctx, cx, top, cx, top + height);
  line(ctx, gx, top + height / 2, gx + gw, top + height / 2);
  ctx.restore();

  const slipW = Math.round(height * 0.62);
  drawSlip(ctx, cx, top + height / 2, slipW, -3, data.letters, data.officialName);

  ctx.fillStyle = C.blue;
  ctx.beginPath();
  ctx.arc(cx + gw * 0.36, top + height * 0.2, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 5;
  ctx.stroke();
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
  ctx.shadowColor = 'rgba(18, 35, 63, 0.22)';
  ctx.shadowBlur = w * 0.12;
  ctx.shadowOffsetY = w * 0.04;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, -w / 2, -h / 2, w, h, w * 0.02);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#C9D1DC';
  ctx.lineWidth = Math.max(1.5, w * 0.006);
  ctx.stroke();

  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';

  if (letters) {
    const size = fitFontSize(ctx, letters, 900, w * 0.8, w * 0.52, w * 0.2);
    ctx.font = font(900, size);
    ctx.fillText(letters, 0, -h * 0.05);
    const nameBlock = wrapToFit(ctx, name, 700, w * 0.078, w * 0.058, w * 0.82, 3);
    ctx.font = font(700, nameBlock.size);
    nameBlock.lines.forEach((l, i) => ctx.fillText(l, 0, h * 0.17 + i * nameBlock.size * 1.25));
  } else {
    const block = wrapToFit(ctx, name, 800, w * 0.13, w * 0.08, w * 0.8, 4);
    const lh = block.size * 1.22;
    const first = -((block.lines.length - 1) * lh) / 2 + block.size * 0.35;
    ctx.font = font(800, block.size);
    block.lines.forEach((l, i) => ctx.fillText(l, 0, first + i * lh));
  }

  // Thin rule, like the printed frame on a real slip
  ctx.strokeStyle = '#E3E7ED';
  ctx.lineWidth = Math.max(1, w * 0.004);
  roundRect(ctx, -w / 2 + w * 0.05, -h / 2 + w * 0.05, w * 0.9, h - w * 0.1, w * 0.01);
  ctx.stroke();
  ctx.restore();
}

function drawPercent(ctx: CanvasRenderingContext2D, percent: number, cx: number, baseline: number): void {
  const num = `${percent}%`;
  const word = 'התאמה';
  ctx.save();
  ctx.font = font(900, 112);
  ctx.direction = 'ltr';
  const numW = ctx.measureText(num).width;
  ctx.font = font(700, 50);
  ctx.direction = 'rtl';
  const wordW = ctx.measureText(word).width;
  const gap = 22;
  const left = cx - (numW + gap + wordW) / 2;
  // RTL reading order: number on the right, word on its left.
  ctx.textAlign = 'left';
  ctx.fillStyle = C.navy;
  ctx.fillText(word, left, baseline);
  ctx.font = font(900, 112);
  ctx.direction = 'ltr';
  ctx.fillStyle = C.blue;
  ctx.fillText(num, left + wordW + gap, baseline);
  ctx.restore();
}

function drawCover(ctx: CanvasRenderingContext2D, img: CanvasImageSource, x: number, y: number, w: number, h: number): void {
  const iw = 'naturalWidth' in img ? img.naturalWidth : (img as { width: number }).width;
  const ih = 'naturalHeight' in img ? img.naturalHeight : (img as { height: number }).height;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) * 0.3; // faces sit in the upper part of a portrait
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function fitSingleOrWrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  maxSize: number,
  minSize: number,
  maxWidth: number,
): { size: number; lines: string[] } {
  const size = fitFontSize(ctx, text, weight, maxWidth, maxSize, minSize);
  ctx.font = font(weight, size);
  if (ctx.measureText(text).width <= maxWidth) return { size, lines: [text] };
  return { size: minSize, lines: wrap(ctx, text, maxWidth, font(weight, minSize)) };
}

export function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  maxWidth: number,
  maxSize: number,
  minSize: number,
): number {
  let size = maxSize;
  while (size > minSize) {
    ctx.font = font(weight, size);
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  return minSize;
}

/** Wrap into at most maxLines, shrinking the font down to minSize before truncating. */
export function wrapToFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  maxSize: number,
  minSize: number,
  maxWidth: number,
  maxLines: number,
): { size: number; lines: string[] } {
  for (let size = maxSize; size >= minSize; size -= 2) {
    const lines = wrap(ctx, text, maxWidth, font(weight, size));
    if (lines.length <= maxLines) return { size, lines };
  }
  const lines = wrap(ctx, text, maxWidth, font(weight, minSize));
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
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
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
