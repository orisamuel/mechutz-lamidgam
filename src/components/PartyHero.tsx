import { COPY } from '../data/copy';
import type { Party } from '../data/parties';
import { asset } from '../lib/assets';
import { BallotSlip } from './BallotSlip';
import { Phrased } from './Phrased';

/** Portrait with the ballot slip on its corner, or — until a portrait exists — the slip on a compass grid. */
export function PartyHero({ party }: { party: Party }) {
  if (party.portrait) {
    const alt = party.portraitAnonymous ? 'איור של דמות אנונימית' : `איור דיוקן של ${party.leader}`;
    return (
      <div className="hero hero--portrait">
        <figure className="hero__figure">
          <img src={asset(party.portrait)} alt={alt} width={640} height={800} />
          {party.portraitAnonymous ? (
            <span className="hero__tag hero__tag--note">
              <Phrased text={COPY.result.noPhotoNote} max={16} />
            </span>
          ) : (
            <span className="hero__tag">{COPY.result.illustration}</span>
          )}
        </figure>
        <BallotSlip letters={party.letters} name={party.officialName} size="small" />
      </div>
    );
  }
  return (
    <div className="hero hero--slip">
      <div className="hero__grid" aria-hidden="true">
        <span className="hero__dot" />
      </div>
      <BallotSlip letters={party.letters} name={party.officialName} size="large" />
    </div>
  );
}
