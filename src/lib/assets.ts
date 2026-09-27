/** Resolve a file in public/ against Vite's base (relative on GitHub Pages and custom domain alike). */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
