import { COPY } from '../data/copy';

export function Masthead({ onHome }: { onHome?: () => void }) {
  return (
    <header className="masthead">
      <div className="masthead__inner">
        {onHome ? (
          <button type="button" className="masthead__name masthead__home" onClick={onHome}>
            {COPY.productName}
          </button>
        ) : (
          <span className="masthead__name">{COPY.productName}</span>
        )}
        <span className="masthead__tag">{COPY.mastheadTag}</span>
      </div>
    </header>
  );
}
