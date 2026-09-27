import { useCallback, useEffect, useState } from 'react';
import { Footer } from '../components/Footer';
import { Masthead } from '../components/Masthead';
import { PartyHero } from '../components/PartyHero';
import { COPY } from '../data/copy';
import type { Party } from '../data/parties';
import { track } from '../lib/analytics';
import { asset } from '../lib/assets';
import { loadImage, renderCardBlob, type CardData, type CardFormat } from '../lib/cardRenderer';
import { shareImage } from '../lib/share';

export interface RunnerUp {
  party: Party;
  percent: number;
}

interface Props {
  party: Party;
  percent: number;
  body: string;
  /** The party's one-line punch, when it is true for these answers. */
  flavor: string | null;
  /** Identity sentence for the share card. */
  identity: string;
  shareText: string;
  displayUrl: string;
  runnersUp: RunnerUp[];
  onRetake: () => void;
  onMethodology: () => void;
  onHome: () => void;
  onToast: (message: string) => void;
}

type Blobs = Partial<Record<CardFormat, Blob>>;

export function Result(props: Props) {
  const { party, percent, body, flavor, identity, shareText, displayUrl, runnersUp, onToast } = props;
  const [blobs, setBlobs] = useState<Blobs>({});
  const runnersKey = runnersUp.map((r) => `${r.party.id}:${r.percent}`).join('|');

  // Pre-render both cards so share() runs inside the click gesture (iOS Safari requirement).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const portrait = party.portrait ? await loadImage(asset(party.portrait)) : null;
      const data: CardData = {
        partyName: party.name,
        officialName: party.officialName,
        letters: party.letters,
        percent,
        identity,
        url: displayUrl,
        portrait,
        disclosure: portrait ? (party.portraitAnonymous ? COPY.result.anonymousDisclosure : COPY.result.aiDisclosure) : null,
        runnersUp: runnersUp.map((r) => ({ name: r.party.name, letters: r.party.letters, percent: r.percent })),
      };
      const [post, story] = await Promise.all([renderCardBlob(data, 'post'), renderCardBlob(data, 'story')]);
      if (!cancelled) setBlobs({ post: post ?? undefined, story: story ?? undefined });
    })().catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // runnersKey stands in for runnersUp, which is a fresh array on every render.
  }, [party, percent, identity, displayUrl, runnersKey]);

  const share = useCallback(
    async (format: CardFormat) => {
      const blob = blobs[format];
      if (!blob) {
        onToast(COPY.toast.failed);
        return;
      }
      track(format === 'story' ? 'share_story' : 'share', { party: party.id });
      const outcome = await shareImage(blob, shareText, `mechutz-lamidgam-${party.id}${format === 'story' ? '-story' : ''}.png`);
      if (outcome === 'downloaded') onToast(COPY.toast.downloaded);
    },
    [blobs, shareText, party.id, onToast],
  );

  return (
    <div className="page">
      <Masthead onHome={props.onHome} />
      <main id="main" className="shell shell--result">
        <article className="result">
          <p className="result__eyebrow">
            <span>{COPY.result.eyebrow}</span>
          </p>
          <PartyHero party={party} />
          {party.portrait && (
            <p className="result__disclosure">
              {party.portraitAnonymous ? COPY.result.anonymousDisclosure : COPY.result.aiDisclosure}
            </p>
          )}
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
          <p className="result__body">{body}</p>
          {flavor && <p className="result__flavor">{flavor}</p>}

          <div className="result__actions">
            <button type="button" className="btn btn--primary btn--block btn--lg" onClick={() => void share('post')}>
              {COPY.result.share}
            </button>
            {party.website && (
              <a className="btn btn--secondary btn--block" href={party.website.url} target="_blank" rel="noopener noreferrer">
                {party.website.kind === 'platform' ? COPY.result.platformLink : COPY.result.profileLink}
              </a>
            )}
            <button type="button" className="link-button" onClick={() => void share('story')}>
              {COPY.result.shareStory}
            </button>
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
