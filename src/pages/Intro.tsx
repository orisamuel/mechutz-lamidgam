import type { CSSProperties } from 'react';
import { BallotSlip } from '../components/BallotSlip';
import { Phrased } from '../components/Phrased';
import { Footer } from '../components/Footer';
import { COPY } from '../data/copy';
import { PARTIES } from '../data/parties';
import { NBSP } from '../lib/phrasing';

interface Props {
  resumeAt: number | null;
  hasResult: boolean;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onResult: () => void;
  onMethodology: () => void;
}

export function Intro({ resumeAt, hasResult, onStart, onResume, onRestart, onResult, onMethodology }: Props) {
  return (
    <div className="page page--intro">
      <header className="nameplate">
        <p className="nameplate__edition">{COPY.intro.edition}</p>
        <h1 id="page-title" className="nameplate__name" tabIndex={-1}>
          {COPY.productName}
        </h1>
        <p className="nameplate__meta">{COPY.mastheadMeta}</p>
      </header>

      <main id="main" className="intro">
        <div className="slipfan" aria-hidden="true">
          {PARTIES.map((p, i) => (
            <div key={p.id} className="slipfan__item" style={fanStyle(i)}>
              <BallotSlip letters={p.letters} name={p.officialName} size="fan" />
            </div>
          ))}
        </div>
        <p className="slipfan__label">{COPY.intro.partiesLabel}</p>

        <article className="intro__article">
          <p className="intro__lead">
            <Phrased text={COPY.intro.lead} max={24} />
          </p>
          <p>
            <Phrased text={COPY.intro.body} />
          </p>
          <p className="intro__quote">
            <span>{COPY.intro.pullQuote}</span>
          </p>
          <p>
            <Phrased text={COPY.intro.closing} />
          </p>
          <p className="intro__question">{COPY.intro.question}</p>
          <p className="intro__candidates">
            <Phrased text={COPY.intro.candidates} />
            {/* No-break space: the parenthesis stays glued to "מכוניות המחץ". */}
            {NBSP}
            <span className="intro__aside">
              <Phrased text={COPY.intro.aside} />
            </span>
          </p>
        </article>
      </main>

      <div className="intro__cta">
        <div className="intro__cta-inner">
          {hasResult ? (
            <>
              <button type="button" className="btn btn--primary btn--block btn--lg" onClick={onResult}>
                {COPY.intro.toResult}
              </button>
              <button type="button" className="link-button" onClick={onRestart}>
                {COPY.result.retake}
              </button>
            </>
          ) : resumeAt !== null ? (
            <>
              <button type="button" className="btn btn--primary btn--block btn--lg" onClick={onResume}>
                {COPY.intro.resume(resumeAt + 1)}
              </button>
              <button type="button" className="link-button" onClick={onRestart}>
                {COPY.intro.restart}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn--primary btn--block btn--lg" onClick={onStart}>
              {COPY.intro.start}
            </button>
          )}
        </div>
      </div>
      <Footer onMethodology={onMethodology} />
    </div>
  );
}

/** First list on the right (RTL), the middle of the fan on top. */
function fanStyle(index: number): CSSProperties {
  const offset = (PARTIES.length - 1) / 2 - index;
  return { '--i': offset, zIndex: 10 - Math.round(Math.abs(offset) * 2) } as CSSProperties;
}
