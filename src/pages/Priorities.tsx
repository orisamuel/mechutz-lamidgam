import { Masthead } from '../components/Masthead';
import { COPY } from '../data/copy';
import type { Question } from '../data/types';

interface Props {
  questions: Question[];
  selected: string[];
  max: number;
  onToggle: (questionId: string) => void;
  onContinue: () => void;
  onSkip: () => void;
  onHome: () => void;
}

/** The weighting step every serious voting-advice app has: mark the issues that count double. */
export function Priorities({ questions, selected, max, onToggle, onContinue, onSkip, onHome }: Props) {
  const full = selected.length >= max;
  return (
    <div className="page">
      <Masthead onHome={onHome} />
      <main id="main" className="shell shell--quiz">
        <div className="card priorities">
          <p className="priorities__step">{COPY.priorities.step}</p>
          <h1 id="page-title" className="question__prompt" tabIndex={-1}>
            {COPY.priorities.title}
          </h1>
          <p className="priorities__lede">{COPY.priorities.lede}</p>
          <p className="priorities__counter" aria-live="polite">
            {COPY.priorities.counter(selected.length, max)}
          </p>

          <div className="checks" role="group" aria-labelledby="page-title">
            {questions.map((q) => {
              const on = selected.includes(q.id);
              const disabled = full && !on;
              return (
                <label key={q.id} className={`check${on ? ' is-on' : ''}${disabled ? ' is-disabled' : ''}`}>
                  <input type="checkbox" checked={on} disabled={disabled} onChange={() => onToggle(q.id)} />
                  <span className="check__box" aria-hidden="true" />
                  <span className="check__text">
                    <span className="check__topic">{q.topic}</span>
                    <span className="check__category">{q.category}</span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="question__actions">
            <button type="button" className="btn btn--primary" onClick={onContinue}>
              {COPY.priorities.cta}
            </button>
          </div>
          <button type="button" className="link-button question__skip" onClick={onSkip}>
            {COPY.priorities.skip}
          </button>
        </div>
      </main>
    </div>
  );
}
