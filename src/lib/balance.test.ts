import { describe, expect, it } from 'vitest';
import { PARTY_IDS } from '../data/partyIds';
import { QUESTIONS } from '../data/questions';
import { computeResult } from './score';
import { personaAnswers, quantile, simulate } from './simulate';

describe('every party can win', () => {
  it.each(PARTY_IDS)('%s wins with its own typical answers', (party) => {
    const result = computeResult(QUESTIONS, personaAnswers(QUESTIONS, party));
    expect(result?.winner).toBe(party);
    expect(result!.percent).toBeGreaterThanOrEqual(90);
  });
});

describe('balance under random answering', () => {
  const summary = simulate(QUESTIONS, 20_000, 7, { sliders: 'human', skipRate: 0.08 });

  it.each(PARTY_IDS)('%s wins between 12% and 22% of random respondents', (party) => {
    const share = summary.winners[party] / summary.withResult;
    expect(share).toBeGreaterThan(0.12);
    expect(share).toBeLessThan(0.22);
  });

  it('percentages look like a match quiz, not like a failing grade', () => {
    const sorted = [...summary.percents].sort((a, b) => a - b);
    expect(quantile(sorted, 0.5)).toBeGreaterThanOrEqual(80);
    expect(quantile(sorted, 0.5)).toBeLessThanOrEqual(88);
    expect(sorted[0]).toBeGreaterThanOrEqual(72);
    expect(sorted[sorted.length - 1]).toBeLessThanOrEqual(96);
  });
});
