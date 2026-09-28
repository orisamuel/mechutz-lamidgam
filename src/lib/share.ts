import type { PartyId } from '../data/partyIds';

/** Canonical site URL: VITE_SITE_URL when configured (custom domain), otherwise where we run. */
export function siteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL as string | undefined;
  if (configured) return configured;
  const { origin, pathname } = window.location;
  return `${origin}${pathname.replace(/index\.html$/, '')}`;
}

/** The party's share page. Its Open Graph tags give chats a preview with the party's image (see sharePages.ts). */
export function resultUrl(party: PartyId): string {
  return `${siteUrl()}r/${party}/`;
}

/** "https://example.co.il/r/x/" → "example.co.il/r/x" — for showing a link as text. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

export type ShareOutcome = 'shared' | 'cancelled' | 'copied' | 'failed';

/**
 * Phones: the native share sheet with the text and the link (WhatsApp and friends turn the link into a
 * preview with the image). Everything else: copy both to the clipboard. No files, no downloads.
 */
export async function shareLink(text: string, url: string): Promise<ShareOutcome> {
  if (typeof navigator.share === 'function' && isTouchDevice()) {
    try {
      await navigator.share({ text, url });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    }
  }
  return (await copyText(`${text}\n${url}`)) ? 'copied' : 'failed';
}

/** Desktop share dialogs (Windows, macOS) are clunkier than a copied link, so only phones and tablets get them. */
function isTouchDevice(): boolean {
  try {
    return window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
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
