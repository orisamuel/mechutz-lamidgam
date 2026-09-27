import { Masthead } from '../components/Masthead';
import { COPY } from '../data/copy';
import type { Question } from '../data/types';

interface Props {
  questions: Question[];
  selected: string[];
  onToggle: (questionId: string) => void;
  onContinue: () => void;
  onSkip: () => void;
  onHome: () => void;
}

/** The weighting step every serious voting-advice app has: mark the issues that count double. */
export function Priorities({ questions, selected, onToggle, onContinue, onSkip, onHome }: Props) {
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

          <div className="checks" role="group" aria-labelledby="page-title">
            {questions.map((q) => {
              const on = selected.includes(q.id);
              return (
                <label key={q.id} className={`check${on ? ' is-on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => onToggle(q.id)} />
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
              {selected.length ? COPY.priorities.ctaCount(selected.length) : COPY.priorities.cta}
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
