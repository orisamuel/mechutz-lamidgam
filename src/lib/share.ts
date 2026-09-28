import { COPY } from '../data/copy';

/** Canonical site URL: VITE_SITE_URL when configured (custom domain), otherwise where we run. */
export function siteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL as string | undefined;
  if (configured) return configured;
  const { origin, pathname } = window.location;
  return `${origin}${pathname.replace(/index\.html$/, '')}`;
}

/** "https://example.co.il/" → "example.co.il" — for showing a link as text. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

/**
 * Phones and tablets get their own share sheet (every app they have, one tap). Desktop share dialogs
 * (Windows, macOS) are clunky and often miss WhatsApp, so computers get our share menu instead.
 */
export function canUseNativeShare(): boolean {
  if (typeof navigator.share !== 'function') return false;
  try {
    return window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}

/** 'shared', 'cancelled', or 'unavailable' when the sheet could not open (fall back to the menu). */
export async function nativeShare(text: string, url: string): Promise<'shared' | 'cancelled' | 'unavailable'> {
  try {
    await navigator.share({ text, url });
    return 'shared';
  } catch (err) {
    return err instanceof DOMException && err.name === 'AbortError' ? 'cancelled' : 'unavailable';
  }
}

export interface ShareTarget {
  id: 'whatsapp' | 'facebook' | 'telegram' | 'x' | 'email';
  label: string;
  href: string;
}

/** The share menu's links. Each one opens the service's own share screen with the text and the link filled in. */
export function shareTargets(text: string, url: string): ShareTarget[] {
  const message = `${text}\n${url}`;
  const e = encodeURIComponent;
  return [
    { id: 'whatsapp', label: COPY.share.targets.whatsapp, href: `https://wa.me/?text=${e(message)}` },
    { id: 'facebook', label: COPY.share.targets.facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}` },
    { id: 'telegram', label: COPY.share.targets.telegram, href: `https://t.me/share/url?url=${e(url)}&text=${e(text)}` },
    { id: 'x', label: COPY.share.targets.x, href: `https://twitter.com/intent/tweet?text=${e(text)}&url=${e(url)}` },
    { id: 'email', label: COPY.share.targets.email, href: `mailto:?subject=${e(COPY.productName)}&body=${e(message)}` },
  ];
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
