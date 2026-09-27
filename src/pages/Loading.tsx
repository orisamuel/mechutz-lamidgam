import { useEffect, useState } from 'react';
import { COPY } from '../data/copy';

/** 800–1300 ms beat before the result. Lines flip fast; purely decorative. */
export function Loading({ durationMs }: { durationMs: number }) {
  const lines = COPY.loading.lines;
  const [i, setI] = useState(0);

  useEffect(() => {
    if (durationMs <= 0) return;
    const step = Math.max(120, Math.floor(durationMs / lines.length));
    const t = setInterval(() => setI((n) => (n + 1) % lines.length), step);
    return () => clearInterval(t);
  }, [durationMs, lines.length]);

  return (
    <div className="page page--loading">
      <main id="main" className="loading">
        <h1 id="page-title" className="loading__title" tabIndex={-1}>
          {COPY.loading.title}
        </h1>
        <div className="loading__bar" aria-hidden="true">
          <div className="loading__fill" style={{ animationDuration: `${durationMs}ms` }} />
        </div>
        <p className="loading__line" aria-hidden="true">
          {lines[i]}
        </p>
      </main>
    </div>
  );
}
