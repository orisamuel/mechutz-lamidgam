import { describe, expect, it } from 'vitest';
import { ARCHETYPES } from '../data/archetypes';
import { QUESTIONS } from '../data/questions';
import { computeResult } from './score';
import { personaAnswers, quantile, simulate } from './simulate';

describe('every archetype can win', () => {
  it.each(ARCHETYPES)('%s wins with its own typical answers', (archetype) => {
    const result = computeResult(QUESTIONS, personaAnswers(QUESTIONS, archetype));
    expect(result?.winner).toBe(archetype);
    expect(result!.percent).toBeGreaterThanOrEqual(90);
  });
});

describe('balance under random answering', () => {
  const summary = simulate(QUESTIONS, 20_000, 7, { sliders: 'human', skipRate: 0.08 });

  it.each(ARCHETYPES)('%s wins between 12% and 22% of random respondents', (archetype) => {
    const share = summary.winners[archetype] / summary.withResult;
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
