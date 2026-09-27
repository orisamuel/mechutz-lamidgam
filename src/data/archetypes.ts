/**
 * Internal comic archetypes. Scoring runs against these only; each one is mapped to a
 * real list name at the very end (see parties.ts). Nothing here claims that a real list
 * holds a position on pizza, air conditioning or anything else.
 */
export const ARCHETYPES = [
  'digital_autonomy',
  'procedural_order',
  'human_consensus',
  'peace_and_quiet',
  'ceremony_presence',
  'process_reform',
] as const;

export type ArchetypeId = (typeof ARCHETYPES)[number];

export type ScoreMap = Record<ArchetypeId, number>;

export function emptyScores(): ScoreMap {
  return {
    digital_autonomy: 0,
    procedural_order: 0,
    human_consensus: 0,
    peace_and_quiet: 0,
    ceremony_presence: 0,
    process_reform: 0,
  };
}
