/** Canonical site URL: VITE_SITE_URL when configured (custom domain), otherwise where we run. */
export function siteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL as string | undefined;
  if (configured) return configured;
  const { origin, pathname } = window.location;
  return `${origin}${pathname.replace(/index\.html$/, '')}`;
}

/** "https://example.co.il/" → "example.co.il" — for printing on the card. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

export type ShareOutcome = 'shared' | 'cancelled' | 'downloaded';

/**
 * Native share sheet with the image (WhatsApp, Instagram…). Falls back to downloading the
 * image and copying the text. Call it straight from the click handler with a ready blob:
 * iOS Safari rejects share() if the user gesture has gone stale.
 */
export async function shareImage(blob: Blob, text: string, filename: string): Promise<ShareOutcome> {
  const file = new File([blob], filename, { type: 'image/png' });
  if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    }
  }
  downloadBlob(blob, filename);
  await copyText(text);
  return 'downloaded';
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
