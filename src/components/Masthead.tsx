import { COPY } from '../data/copy';

/** Newspaper-style nameplate: serif wordmark between rules. */
export function Masthead({ onHome }: { onHome?: () => void }) {
  return (
    <header className="masthead">
      <div className="masthead__inner">
        {onHome ? (
          <button type="button" className="masthead__name" onClick={onHome}>
            {COPY.productName}
          </button>
        ) : (
          <span className="masthead__name">{COPY.productName}</span>
        )}
        <span className="masthead__meta">{COPY.mastheadMeta}</span>
      </div>
    </header>
  );
}
