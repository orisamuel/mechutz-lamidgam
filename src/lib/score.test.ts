import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../data/questions';
import type { Answers, AxisQuestion, ChoiceQuestion, Question, Weights } from '../data/types';
import { mulberry32, randomAnswers } from './simulate';
import {
  axisPoints,
  computeResult,
  MIN_ANSWERS,
  PCT_MAX,
  PCT_MIN,
  percentFromAffinity,
  questionPoints,
  TIE_EPSILON,
} from './score';

const byId = (id: string) => QUESTIONS.find((q) => q.id === id)!;

function choiceQ(id: string, options: Record<string, Weights>): ChoiceQuestion {
  return {
    id,
    kind: 'choice',
    category: 'test',
    prompt: id,
    topic: id,
    options: Object.entries(options).map(([oid, weights]) => ({
      id: oid,
      label: oid,
      weights,
      descriptor: { text: `${id}-${oid}`, strength: 1 },
    })),
  };
}

function axisQ(id: string, anchors: AxisQuestion['anchors']): AxisQuestion {
  return { id, kind: 'axis', axis: 'pizzaFalafel', category: 'test', prompt: id, topic: id, anchors };
}

const pick = (optionId: string) => ({ kind: 'choice', optionId }) as const;

describe('questionPoints', () => {
  it('matches the worked examples in SCORING.md', () => {
    const voice = questionPoints(byId('q2'), pick('c'))!; // הודעה קולית 4:38 → מחייבת תמלול
    expect(voice.digital_autonomy).toBe(3);
    expect(voice.procedural_order).toBe(1);

    const fiveMinutes = questionPoints(byId('q3'), pick('a'))!; // "אני חמש דקות מגיע" → חמש דקות
    expect(fiveMinutes.procedural_order).toBe(3);
    expect(fiveMinutes.process_reform).toBe(1);

    const trap = questionPoints(byId('q7'), pick('d'))!; // "תבואו מתי שנוח" → מלכודת
    expect(trap.peace_and_quiet).toBe(2);
    expect(trap.procedural_order).toBe(1);
  });

  it('returns null for skipped, unanswered, mismatched or unknown answers', () => {
    expect(questionPoints(byId('q2'), { kind: 'skip' })).toBeNull();
    expect(questionPoints(byId('q2'), undefined)).toBeNull();
    expect(questionPoints(byId('q2'), { kind: 'axis', value: 40 })).toBeNull();
    expect(questionPoints(byId('q2'), pick('zzz'))).toBeNull();
  });
});

describe('axisPoints', () => {
  const q = axisQ('a', [{ archetype: 'digital_autonomy', at: 50 }]);

  it('gives 3 at the anchor, falling linearly to 0 at the spread', () => {
    expect(axisPoints(q, 50).digital_autonomy).toBe(3);
    expect(axisPoints(q, 85).digital_autonomy).toBe(0);
    expect(axisPoints(q, 100).digital_autonomy).toBe(0);
    expect(axisPoints(q, 60).digital_autonomy).toBeCloseTo(3 * (1 - 10 / 35));
  });
});

describe('computeResult', () => {
  it(`needs at least ${MIN_ANSWERS} answered questions; skips do not count`, () => {
    const answers: Answers = {};
    QUESTIONS.forEach((q, i) => {
      if (i < MIN_ANSWERS - 1 && q.kind === 'choice') answers[q.id] = pick('a');
      else if (i < MIN_ANSWERS - 1) answers[q.id] = { kind: 'axis', value: 30 };
      else answers[q.id] = { kind: 'skip' };
    });
    expect(computeResult(QUESTIONS, answers)).toBeNull();

    const sixth = QUESTIONS[MIN_ANSWERS - 1]!;
    answers[sixth.id] = sixth.kind === 'choice' ? pick('a') : { kind: 'axis', value: 30 };
    const result = computeResult(QUESTIONS, answers)!;
    expect(result).not.toBeNull();
    expect(result.answeredIds).toHaveLength(MIN_ANSWERS);
    expect(result.skippedIds).toHaveLength(QUESTIONS.length - MIN_ANSWERS);
  });

  it('keeps the percentage between the bounds and never shows 100%', () => {
    expect(percentFromAffinity(0)).toBe(PCT_MIN);
    expect(percentFromAffinity(1)).toBe(PCT_MAX);
    expect(PCT_MAX).toBeLessThan(100);
    const rand = mulberry32(3);
    for (let i = 0; i < 500; i++) {
      const r = computeResult(QUESTIONS, randomAnswers(QUESTIONS, rand));
      if (!r) continue;
      expect(r.percent).toBeGreaterThanOrEqual(PCT_MIN);
      expect(r.percent).toBeLessThanOrEqual(PCT_MAX);
    }
  });

  it('is deterministic: same answers, same result', () => {
    const answers = randomAnswers(QUESTIONS, mulberry32(11), { skipRate: 0 });
    const a = computeResult(QUESTIONS, answers)!;
    const b = computeResult(QUESTIONS, structuredClone(answers))!;
    expect(b.winner).toBe(a.winner);
    expect(b.percent).toBe(a.percent);
  });
});

describe('tie-break cascade', () => {
  const filler = choiceQ('f', { z: { human_consensus: 1 } });
  const fillers = (n: number): [Question[], Answers] => {
    const qs = Array.from({ length: n }, (_, i) => ({ ...filler, id: `f${i}` }));
    return [qs, Object.fromEntries(qs.map((q) => [q.id, pick('z')]))];
  };
  const duel = (id: string) => choiceQ(id, { a: { digital_autonomy: 3 }, b: { procedural_order: 3 } });

  it('equal totals → the slider (axis) points decide', () => {
    const axis = axisQ('ax', [
      { archetype: 'digital_autonomy', at: 10 },
      { archetype: 'procedural_order', at: 90 },
    ]);
    const [fq, fa] = fillers(2);
    const questions = [axis, duel('c1'), duel('c2'), duel('c3'), ...fq];
    // DA: 3 (axis) + 3 = 6 · PO: 3 + 3 = 6
    const answers: Answers = { ax: { kind: 'axis', value: 10 }, c1: pick('b'), c2: pick('b'), c3: pick('a'), ...fa };
    const r = computeResult(questions, answers)!;
    expect(r.scores.digital_autonomy).toBe(r.scores.procedural_order);
    expect(r.winner).toBe('digital_autonomy');
    expect(r.tieBreak).toBe('axis');
  });

  it('equal totals, no slider difference → more primary hits decide', () => {
    const small = choiceQ('s', { p: { procedural_order: 1 } });
    const smalls = ['s1', 's2', 's3'].map((id) => ({ ...small, id }));
    const [fq, fa] = fillers(1);
    const questions = [duel('c1'), duel('c2'), duel('c3'), ...smalls, ...fq];
    // DA: 3 + 3 (two primary hits) · PO: 3 + 1 + 1 + 1 (one primary hit)
    const answers: Answers = { c1: pick('a'), c2: pick('a'), c3: pick('b'), s1: pick('p'), s2: pick('p'), s3: pick('p'), ...fa };
    const r = computeResult(questions, answers)!;
    expect(r.winner).toBe('digital_autonomy');
    expect(r.tieBreak).toBe('primary');
  });

  it('a perfectly symmetric tie → deterministic hash, still exactly one winner', () => {
    const [fq, fa] = fillers(2);
    const questions = [duel('c1'), duel('c2'), duel('c3'), duel('c4'), ...fq];
    const answers: Answers = { c1: pick('a'), c2: pick('a'), c3: pick('b'), c4: pick('b'), ...fa };
    const first = computeResult(questions, answers)!;
    expect(first.tieBreak).toBe('hash');
    expect(['digital_autonomy', 'procedural_order']).toContain(first.winner);
    for (let i = 0; i < 5; i++) expect(computeResult(questions, answers)!.winner).toBe(first.winner);
  });

  it(`scores within ${TIE_EPSILON} of each other count as a tie`, () => {
    const axis = axisQ('ax', [{ archetype: 'digital_autonomy', at: 10 }]);
    const [fq, fa] = fillers(2);
    const questions = [axis, duel('c1'), duel('c2'), duel('c3'), ...fq];
    // DA: 2.914 (axis at distance 1) + 3 = 5.914 · PO: 3 + 3 = 6 → PO ahead by 0.086 = a tie → axis decides
    const answers: Answers = { ax: { kind: 'axis', value: 11 }, c1: pick('b'), c2: pick('a'), c3: pick('b'), ...fa };
    const r = computeResult(questions, answers)!;
    expect(r.scores.procedural_order - r.scores.digital_autonomy).toBeLessThan(TIE_EPSILON);
    expect(r.winner).toBe('digital_autonomy');
    expect(r.tieBreak).toBe('axis');
  });

  it('always yields a winner that is among the top scorers', () => {
    const rand = mulberry32(99);
    for (let i = 0; i < 2000; i++) {
      const r = computeResult(QUESTIONS, randomAnswers(QUESTIONS, rand, { skipRate: 0.3 }));
      if (!r) continue;
      const best = Math.max(...Object.values(r.scores));
      expect(best - r.scores[r.winner]).toBeLessThan(TIE_EPSILON);
    }
  });
});
