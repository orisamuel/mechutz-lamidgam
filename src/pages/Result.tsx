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

interface Props {
  party: Party;
  percent: number;
  body: string;
  micro: string;
  identity: string;
  shareText: string;
  displayUrl: string;
  onMap: () => void;
  onRetake: () => void;
  onMethodology: () => void;
  onAccessibility: () => void;
  onHome: () => void;
  onToast: (message: string) => void;
}

type Blobs = Partial<Record<CardFormat, Blob>>;

export function Result(props: Props) {
  const { party, percent, body, micro, identity, shareText, displayUrl, onToast } = props;
  const [blobs, setBlobs] = useState<Blobs>({});

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
        disclosure: portrait ? COPY.result.aiDisclosure : null,
      };
      const [post, story] = await Promise.all([renderCardBlob(data, 'post'), renderCardBlob(data, 'story')]);
      if (!cancelled) setBlobs({ post: post ?? undefined, story: story ?? undefined });
    })().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [party, percent, identity, displayUrl]);

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
        <article className="card result">
          <p className="result__eyebrow">{COPY.result.eyebrow}</p>
          <PartyHero party={party} />
          {party.portrait && <p className="result__disclosure">{COPY.result.aiDisclosure}</p>}
          <h1 id="page-title" className="result__party" tabIndex={-1}>
            {party.name}
          </h1>
          <p className="result__leader">
            {party.leaderRole}: {party.leader}
          </p>
          <p className="result__percent">
            <span className="result__percent-num">{percent}%</span> {COPY.result.percentWord}
          </p>
          <h2 className="result__title">{party.title}</h2>
          <p className="result__body">{body}</p>
          <p className="result__micro">{micro}</p>

          <div className="result__actions">
            <button type="button" className="btn btn--primary btn--block" onClick={() => void share('post')}>
              {COPY.result.share}
            </button>
            <button type="button" className="btn btn--secondary btn--block" onClick={props.onMap}>
              {COPY.result.map}
            </button>
            <button type="button" className="link-button" onClick={() => void share('story')}>
              {COPY.result.shareStory}
            </button>
          </div>
        </article>
      </main>
      <Footer onMethodology={props.onMethodology} onAccessibility={props.onAccessibility} />
    </div>
  );
}
