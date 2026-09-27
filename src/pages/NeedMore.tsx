import { Masthead } from '../components/Masthead';
import { COPY } from '../data/copy';

interface Props {
  answered: number;
  min: number;
  onContinue: () => void;
  onHome: () => void;
}

export function NeedMore({ answered, min, onContinue, onHome }: Props) {
  return (
    <div className="page">
      <Masthead onHome={onHome} />
      <main id="main" className="shell shell--quiz">
        <div className="card notice">
          <h1 id="page-title" className="notice__title" tabIndex={-1}>
            {COPY.needMore.title}
          </h1>
          <p className="notice__body">{COPY.needMore.body(answered, min)}</p>
          <button type="button" className="btn btn--primary btn--block" onClick={onContinue}>
            {COPY.needMore.cta}
          </button>
        </div>
      </main>
    </div>
  );
}
