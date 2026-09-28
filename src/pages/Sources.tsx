import { COPY } from '../data/copy';
import type { PartyId } from '../data/partyIds';
import { PARTIES } from '../data/parties';
import { POSITIONS, type Position } from '../data/positions';

/** "המקורות" on the methodology page: every source behind the answers, grouped by list. */
export function Sources() {
  return (
    <section className="sources" aria-labelledby="sources-title">
      <h2 id="sources-title">{COPY.methodology.sourcesTitle}</h2>
      <ul className="sources__list">
        {PARTIES.map((party) => (
          <li key={party.id} className="sources__party">
            <span className="sources__name">{party.shortName}:</span>{' '}
            {sourcesFor(party.id).map((source, i) => (
              <span key={source.url}>
                {i > 0 && ' · '}
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {sourceLabel(source)}
                </a>
              </span>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** One entry per URL, oldest first (ties keep registry order). */
export function sourcesFor(party: PartyId): Position[] {
  const seen = new Set<string>();
  const out: Position[] = [];
  for (const position of Object.values(POSITIONS) as Position[]) {
    if (position.party !== party || seen.has(position.url)) continue;
    seen.add(position.url);
    out.push(position);
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** "ynet, 7.9.2026" for dated items; "אמנת היסוד (2016)" for older documents; the outlet alone otherwise. */
export function sourceLabel(position: Position): string {
  const [year, month, day] = position.date.split('-');
  if (day && month) return `${position.outlet}, ${Number(day)}.${Number(month)}.${year}`;
  if (year && year !== '2026' && !position.outlet.includes(year)) return `${position.outlet} (${year})`;
  return position.outlet;
}
