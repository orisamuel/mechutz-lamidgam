import { Footer } from '../components/Footer';
import { Masthead } from '../components/Masthead';
import { PoliticalMap } from '../components/PoliticalMap';
import { COPY } from '../data/copy';
import type { AxisReading } from '../lib/identity';

interface Props {
  readings: AxisReading[];
  summary: string;
  onBack: () => void;
  onRetake: () => void;
  onMethodology: () => void;
  onAccessibility: () => void;
  onHome: () => void;
}

export function MapPage({ readings, summary, onBack, onRetake, onMethodology, onAccessibility, onHome }: Props) {
  return (
    <div className="page">
      <Masthead onHome={onHome} />
      <main id="main" className="shell shell--result">
        <section className="card mapcard">
          <h1 id="page-title" className="mapcard__title" tabIndex={-1}>
            {COPY.map.title}
          </h1>
          <p className="mapcard__lede">{COPY.map.lede}</p>
          <PoliticalMap readings={readings} />
          {summary && <p className="mapcard__summary">{summary}</p>}
          <div className="result__actions">
            <button type="button" className="btn btn--primary btn--block" onClick={onRetake}>
              {COPY.map.retake}
            </button>
            <button type="button" className="link-button" onClick={onBack}>
              {COPY.map.back}
            </button>
          </div>
        </section>
      </main>
      <Footer onMethodology={onMethodology} onAccessibility={onAccessibility} />
    </div>
  );
}
