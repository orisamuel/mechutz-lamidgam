import { describe, expect, it } from 'vitest';
import { bandIndex } from '../data/axes';
import { PARTIES, partyForArchetype, type Party } from '../data/parties';
import { QUESTIONS } from '../data/questions';
import type { Answers } from '../data/types';
import { axisReadings, identityParts, identitySentence, mapSummary, shareText } from './identity';
import { agreementCount, matchLine } from './microcopy';
import { computeResult } from './score';
import { mulberry32, personaAnswers, randomAnswers } from './simulate';

describe('bands', () => {
  it.each([
    [0, 0],
    [24, 0],
    [25, 1],
    [44, 1],
    [45, 2],
    [55, 2],
    [56, 3],
    [75, 3],
    [76, 4],
    [100, 4],
  ])('value %i → band %i', (value, band) => {
    expect(bandIndex(value)).toBe(band);
  });

  it('uses the physical poles: falafel and AC are on the right', () => {
    const readings = axisReadings(QUESTIONS, { q1: { kind: 'axis', value: 90 }, q6: { kind: 'axis', value: 10 } });
    expect(readings.map((r) => r.descriptor)).toEqual(['ימין־פלאפל', 'שמאל־חלון']);
  });
});

describe('identity sentence', () => {
  const answers: Answers = {
    q1: { kind: 'axis', value: 30 }, // מרכז־פיצה, 20 from center
    q6: { kind: 'axis', value: 95 }, // ימין־מזגן, 45 from center
    q9: { kind: 'axis', value: 60 }, // נוטה ליומן, 10 from center
    q2: { kind: 'choice', optionId: 'c' }, // strength 3
    q4: { kind: 'skip' },
  };

  it('takes the two most decided axes, then the strongest stance', () => {
    expect(identityParts(QUESTIONS, answers)).toEqual(['ימין־מזגן', 'מרכז־פיצה', 'קו קיצוני בנושא הודעות קוליות']);
    expect(identitySentence(identityParts(QUESTIONS, answers))).toBe(
      'ימין־מזגן. מרכז־פיצה. קו קיצוני בנושא הודעות קוליות.',
    );
  });

  it('builds the default share text', () => {
    const parts = identityParts(QUESTIONS, answers);
    expect(shareText('הפיראטים', 93, parts, 'https://example.co.il/')).toBe(
      'יצא לי הפיראטים, 93%. ימין־מזגן, מרכז־פיצה.\nhttps://example.co.il/',
    );
  });

  it('falls back to stances when no slider was answered', () => {
    const parts = identityParts(QUESTIONS, {
      q2: { kind: 'choice', optionId: 'c' },
      q12: { kind: 'choice', optionId: 'd' },
      q5: { kind: 'choice', optionId: 'b' },
    });
    expect(parts).toHaveLength(3);
    // The two strength-3 stances come first (order decided by the answers hash), then the weaker one.
    expect([...parts.slice(0, 2)].sort()).toEqual(
      ['קו פדרליסטי בעניין כיסאות בחניה', 'קו קיצוני בנושא הודעות קוליות'].sort(),
    );
    expect(parts[2]).toBe('קו מתון בסוגיית המעלית');
  });

  it('leaves skipped axes out of the map summary', () => {
    expect(mapSummary(axisReadings(QUESTIONS, answers))).toBe('מרכז־פיצה · נוטה ליומן · ימין־מזגן');
  });
});

describe('micro-copy', () => {
  it('derives "X מתוך Y" from the percentage, as in the brief (93% of 12 → 11)', () => {
    const fake = { answeredIds: Array.from({ length: 12 }, (_, i) => `q${i}`), percent: 93 };
    expect(agreementCount(fake as never)).toBe(11);
  });

  it('shows the party flavor line when it is true for these answers', () => {
    const answers = personaAnswers(QUESTIONS, 'digital_autonomy'); // picks the elevator answer the flavor needs
    const result = computeResult(QUESTIONS, answers)!;
    const line = matchLine(result, QUESTIONS, answers, partyForArchetype(result.winner));
    expect(line).toContain('בנושא המעלית נמצאה ביניכם תמימות דעים.');
  });

  it('reports an abstention when everything else agrees', () => {
    const answers = personaAnswers(QUESTIONS, 'human_consensus'); // q1 and q4 skipped; q6 centered, so no flavor
    const result = computeResult(QUESTIONS, answers)!;
    const line = matchLine(result, QUESTIONS, answers, partyForArchetype(result.winner));
    expect(line).toBe(`ב־${result.answeredIds.length} מתוך ${result.answeredIds.length} סוגיות נמצאה התאמה. בנושא הפיצה והפלאפל נרשמה הימנעות.`);
  });

  it('never contradicts itself across random respondents', () => {
    const neverFlavor = (p: Party): Party => ({ ...p, flavor: { ...p.flavor, when: [] } });
    const rand = mulberry32(5);
    for (let i = 0; i < 1000; i++) {
      const answers = randomAnswers(QUESTIONS, rand);
      const result = computeResult(QUESTIONS, answers);
      if (!result) continue;
      const answered = result.answeredIds.length;
      const agree = agreementCount(result);
      const line = matchLine(result, QUESTIONS, answers, neverFlavor(partyForArchetype(result.winner)));
      expect(line.startsWith(`ב־${agree} מתוך ${answered} סוגיות נמצאה התאמה.`)).toBe(true);
      const gapLine = /בנושא .+ נרשמו פערים\./;
      if (agree === answered) expect(line).not.toMatch(gapLine);
      else expect(line).toMatch(gapLine);
    }
  });

  it('maps every archetype to exactly one party', () => {
    expect(new Set(PARTIES.map((p) => p.archetype)).size).toBe(PARTIES.length);
  });
});
