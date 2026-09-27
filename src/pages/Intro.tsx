import { COPY } from '../data/copy';
import { Footer } from '../components/Footer';

interface Props {
  resumeAt: number | null;
  hasResult: boolean;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onResult: () => void;
  onAccessibility: () => void;
}

export function Intro({ resumeAt, hasResult, onStart, onResume, onRestart, onResult, onAccessibility }: Props) {
  return (
    <div className="page page--intro">
      <main id="main" className="intro">
        <div className="intro__mark" aria-hidden="true">
          <span className="intro__dot" />
        </div>
        <h1 id="page-title" className="intro__title" tabIndex={-1}>
          {COPY.productName}
        </h1>
        <h2 className="intro__subtitle">{COPY.tagline}</h2>
        <p className="intro__body">{COPY.intro.body}</p>
        <p className="intro__meta">{COPY.intro.meta}</p>

        <div className="intro__actions">
          {hasResult ? (
            <>
              <button type="button" className="btn btn--primary btn--block" onClick={onResult}>
                {COPY.intro.toResult}
              </button>
              <button type="button" className="link-button" onClick={onRestart}>
                {COPY.result.retake}
              </button>
            </>
          ) : resumeAt !== null ? (
            <>
              <button type="button" className="btn btn--primary btn--block" onClick={onResume}>
                {COPY.intro.resume(resumeAt + 1)}
              </button>
              <button type="button" className="link-button" onClick={onRestart}>
                {COPY.intro.restart}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn--primary btn--block" onClick={onStart}>
              {COPY.intro.start}
            </button>
          )}
        </div>
        <p className="intro__hint">{COPY.intro.skipHint}</p>
      </main>
      <Footer onAccessibility={onAccessibility} />
    </div>
  );
}
