import { COPY } from '../data/copy';

export function Progress({ current, total, category }: { current: number; total: number; category: string }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="progress">
      <div className="progress__row">
        <span className="progress__count">{COPY.quiz.progress(current, total)}</span>
        <span className="progress__category">{category}</span>
      </div>
      <div className="progress__track" aria-hidden="true">
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
