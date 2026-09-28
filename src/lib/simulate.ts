import { PARTY_IDS, type PartyId } from '../data/partyIds';
import type { Answers, Question } from '../data/types';
import { computeResult, type ScoreResult } from './score';

/** Small seeded PRNG so simulations and tests are reproducible. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SliderModel = 'uniform' | 'human';

/**
 * Random respondent. 'human' sliders cluster the way people actually use sliders:
 * a lot of extremes, a bump in the middle, the rest spread out.
 */
export function randomAnswers(
  questions: Question[],
  rand: () => number,
  { skipRate = 0.08, sliders = 'human' as SliderModel } = {},
): Answers {
  const answers: Answers = {};
  for (const q of questions) {
    if (rand() < skipRate) {
      answers[q.id] = { kind: 'skip' };
      continue;
    }
    if (q.kind === 'choice') {
      const option = q.options[Math.floor(rand() * q.options.length)]!;
      answers[q.id] = { kind: 'choice', optionId: option.id };
    } else {
      answers[q.id] = { kind: 'axis', value: sliderValue(rand, sliders) };
    }
  }
  return answers;
}

function sliderValue(rand: () => number, model: SliderModel): number {
  if (model === 'uniform') return Math.round(rand() * 100);
  const r = rand();
  if (r < 0.2) return Math.round(rand() * 12);
  if (r < 0.4) return 88 + Math.round(rand() * 12);
  if (r < 0.55) return 45 + Math.round(rand() * 10);
  return Math.round(rand() * 100);
}

/**
 * The most party-typical answer set: for every choice question the option that favors
 * the party most over everyone else; sliders at its anchor; no-anchor sliders skipped.
 */
export function personaAnswers(questions: Question[], party: PartyId): Answers {
  const answers: Answers = {};
  for (const q of questions) {
    if (q.kind === 'axis') {
      const anchor = q.anchors.find((a) => a.party === party);
      answers[q.id] = anchor ? { kind: 'axis', value: anchor.at } : { kind: 'skip' };
      continue;
    }
    let best = q.options[0]!;
    let bestMargin = -Infinity;
    for (const option of q.options) {
      const own = option.weights[party] ?? 0;
      const others = Math.max(0, ...PARTY_IDS.filter((a) => a !== party).map((a) => option.weights[a] ?? 0));
      const margin = own * 10 + (own - others);
      if (margin > bestMargin) {
        bestMargin = margin;
        best = option;
      }
    }
    answers[q.id] = (best.weights[party] ?? 0) > 0 ? { kind: 'choice', optionId: best.id } : { kind: 'skip' };
  }
  return answers;
}

export interface SimulationSummary {
  runs: number;
  withResult: number;
  winners: Record<PartyId, number>;
  percents: number[];
  affinities: number[];
  tieBreaks: Record<ScoreResult['tieBreak'], number>;
}

export function simulate(
  questions: Question[],
  runs: number,
  seed = 26,
  options: { skipRate?: number; sliders?: SliderModel; priorityRate?: number } = {},
): SimulationSummary {
  const rand = mulberry32(seed);
  const winners = Object.fromEntries(PARTY_IDS.map((a) => [a, 0])) as Record<PartyId, number>;
  const tieBreaks = { none: 0, axis: 0, primary: 0, hash: 0 };
  const percents: number[] = [];
  const affinities: number[] = [];
  let withResult = 0;
  for (let i = 0; i < runs; i++) {
    const answers = randomAnswers(questions, rand, options);
    // The weighting step is gone from the UI (28.09); priorityRate > 0 still models it for experiments.
    const priorities = questions.filter(() => rand() < (options.priorityRate ?? 0)).map((q) => q.id);
    const result = computeResult(questions, answers, priorities);
    if (!result) continue;
    withResult++;
    winners[result.winner]++;
    tieBreaks[result.tieBreak]++;
    percents.push(result.percent);
    affinities.push(result.affinity);
  }
  return { runs, withResult, winners, percents, affinities, tieBreaks };
}

export function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return NaN;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))));
  return sorted[index]!;
}
