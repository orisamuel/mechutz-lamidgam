import type { ReactNode } from 'react';
import { Masthead } from '../components/Masthead';
import { COPY } from '../data/copy';

interface Props {
  title: string;
  children: ReactNode;
  onBack: () => void;
  onHome: () => void;
}

/** Methodology / accessibility statement. */
export function TextPage({ title, children, onBack, onHome }: Props) {
  return (
    <div className="page">
      <Masthead onHome={onHome} />
      <main id="main" className="shell shell--quiz">
        <article className="card prose">
          <h1 id="page-title" tabIndex={-1}>
            {title}
          </h1>
          {children}
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            {COPY.footer.back}
          </button>
        </article>
      </main>
    </div>
  );
}
