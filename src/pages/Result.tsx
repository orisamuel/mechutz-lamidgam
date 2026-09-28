import { useCallback } from 'react';
import { Footer } from '../components/Footer';
import { Masthead } from '../components/Masthead';
import { PartyHero } from '../components/PartyHero';
import { COPY } from '../data/copy';
import type { Party } from '../data/parties';
import { track } from '../lib/analytics';
import { asset } from '../lib/assets';
import { displayUrl, shareLink } from '../lib/share';

export interface RunnerUp {
  party: Party;
  percent: number;
}

interface Props {
  party: Party;
  percent: number;
  body: string;
  /** "כמו {party}, גם אתם בעד…": the user's own answers that match the party. */
  match: string | null;
  /** A true detail about the party, when it applies. */
  flavor: string | null;
  /** "יצא לי …, 91%. בעד …" — the link goes separately, so messengers build its preview. */
  shareText: string;
  /** The party's share page (/r/<slug>/), whose preview shows the party's image. */
  shareUrl: string;
  runnersUp: RunnerUp[];
  onRetake: () => void;
  onMethodology: () => void;
  onHome: () => void;
  onToast: (message: string) => void;
}

export function Result(props: Props) {
  const { party, percent, body, match, flavor, shareText, shareUrl, runnersUp, onToast } = props;

  // Called straight from the click: iOS Safari rejects share() once the user gesture has gone stale.
  const share = useCallback(async () => {
    track('share', { party: party.id });
    const outcome = await shareLink(shareText, shareUrl);
    if (outcome === 'copied') onToast(COPY.toast.copied);
    else if (outcome === 'failed') onToast(COPY.toast.failed(displayUrl(shareUrl)));
  }, [party.id, shareText, shareUrl, onToast]);

  return (
    <div className="page">
      <Masthead onHome={props.onHome} />
      <main id="main" className="shell shell--result">
        <article className="result">
          <p className="result__eyebrow">
            <span>{COPY.result.eyebrow}</span>
          </p>
          <PartyHero party={party} />
          <h1 id="page-title" className="result__party" tabIndex={-1}>
            {party.name}
          </h1>
          <p className="result__leader">
            {party.leaderRole}: {party.leader}
          </p>

          <div className="result__score">
            <p className="result__percent">
              <span className="result__percent-num">{percent}%</span>
              <span className="result__percent-word">{COPY.result.percentWord}</span>
            </p>
            <div className="bar bar--lg" aria-hidden="true">
              <span style={{ width: `${percent}%` }} />
            </div>
          </div>

          {runnersUp.length > 0 && (
            <section className="runners" aria-labelledby="runners-title">
              <h2 id="runners-title" className="runners__title">
                {COPY.result.runnersUp}
              </h2>
              <ol className="runners__list">
                {runnersUp.map(({ party: p, percent: pct }, i) => (
                  <li key={p.id} className="runner">
                    <span className="runner__rank" aria-hidden="true">
                      {i + 2}
                    </span>
                    {p.portrait ? (
                      <img className="runner__face" src={asset(p.portrait)} alt="" width={56} height={70} />
                    ) : (
                      <span className="runner__face" />
                    )}
                    <div className="runner__body">
                      <div className="runner__row">
                        <span className="runner__name">
                          {p.name}
                          {p.letters && <span className="runner__letters">{p.letters}</span>}
                        </span>
                        <span className="runner__pct">{pct}%</span>
                      </div>
                      <div className="bar" aria-hidden="true">
                        <span style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <h2 className="result__title">{party.title}</h2>
          {match && <p className="result__match">{match}</p>}
          <p className="result__body">{body}</p>
          {flavor && <p className="result__flavor">{flavor}</p>}

          <div className="result__actions">
            <button type="button" className="btn btn--primary btn--block btn--lg" onClick={() => void share()}>
              {COPY.result.share}
            </button>
            {party.website && (
              <a className="btn btn--secondary btn--block" href={party.website.url} target="_blank" rel="noopener noreferrer">
                {party.website.kind === 'platform' ? COPY.result.platformLink : COPY.result.profileLink}
              </a>
            )}
          </div>
        </article>

        <div className="result__again">
          <button type="button" className="link-button" onClick={props.onRetake}>
            {COPY.result.retake}
          </button>
        </div>
      </main>
      <Footer onMethodology={props.onMethodology} />
    </div>
  );
}
