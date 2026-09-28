/**
 * The six lists. Answer weights, slider anchors and scores are all keyed by these ids, and each
 * id is also the party's slug in parties.ts. Order matters: ties keep this order before the hash.
 */
export const PARTY_IDS = ['pirates', 'seder-chadash', 'ani-veata', 'gan-eden', 'sharsher', 'hatikun'] as const;

export type PartyId = (typeof PARTY_IDS)[number];

export type ScoreMap = Record<PartyId, number>;

export function emptyScores(): ScoreMap {
  return Object.fromEntries(PARTY_IDS.map((id) => [id, 0])) as ScoreMap;
}
