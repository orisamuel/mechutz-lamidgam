import { useCallback, useState } from 'react';
import { Footer } from '../components/Footer';
import { Masthead } from '../components/Masthead';
import { PartyHero } from '../components/PartyHero';
import { COPY } from '../data/copy';
import type { Party } from '../data/parties';
import { track } from '../lib/analytics';
import { asset } from '../lib/assets';
import { canUseNativeShare, copyText, nativeShare, shareTargets } from '../lib/share';

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
  /** "יצא לי גן עדן. ומה יוצא לכם?" — the link travels separately, so messengers build its preview. */
  shareText: string;
  /** The quiz itself, fresh: whoever opens it starts from the beginning. */
  shareUrl: string;
  runnersUp: RunnerUp[];
  onRetake: () => void;
  onMethodology: () => void;
  onHome: () => void;
  onToast: (message: string) => void;
}

export function Result(props: Props) {
  const { party, percent, body, match, flavor, shareText, shareUrl, runnersUp, onToast } = props;

  const [menuOpen, setMenuOpen] = useState(false);

  // Phones: the native share sheet, straight from the click (iOS rejects share() once the gesture is stale).
  // Computers, or if the sheet can't open: our own menu.
  const share = useCallback(async () => {
    track('share', { party: party.id });
    if (canUseNativeShare() && (await nativeShare(shareText, shareUrl)) !== 'unavailable') return;
    setMenuOpen((open) => !open);
  }, [party.id, shareText, shareUrl]);

  const copyLink = useCallback(async () => {
    track('share_target', { target: 'copy' });
    onToast((await copyText(shareUrl)) ? COPY.toast.copied : COPY.toast.failed(shareUrl));
  }, [shareUrl, onToast]);

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
            <button
              type="button"
              className="btn btn--primary btn--block btn--lg"
              aria-expanded={menuOpen}
              aria-controls="share-menu"
              onClick={() => void share()}
            >
              {COPY.result.share}
            </button>
            {menuOpen && (
              <div id="share-menu" className="share-menu" role="group" aria-label={COPY.share.menuLabel}>
                {shareTargets(shareText, shareUrl).map((t) => (
                  <a
                    key={t.id}
                    className={`share-menu__item share-menu__item--${t.id}`}
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('share_target', { target: t.id })}
                  >
                    {t.label}
                  </a>
                ))}
                <button type="button" className="share-menu__item" onClick={() => void copyLink()}>
                  {COPY.share.copyLink}
                </button>
              </div>
            )}
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
