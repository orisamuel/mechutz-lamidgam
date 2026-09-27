import { COPY } from '../data/copy';

/** One segment per question, like a tally board. */
export function Progress({ current, total, category }: { current: number; total: number; category: string }) {
  return (
    <div className="progress">
      <div className="progress__row">
        <span className="progress__category">{category}</span>
        <span className="progress__count">{COPY.quiz.progress(current, total)}</span>
      </div>
      <ol className="progress__segments" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <li key={i} className={i < current - 1 ? 'is-done' : i === current - 1 ? 'is-current' : undefined} />
        ))}
      </ol>
    </div>
  );
}
