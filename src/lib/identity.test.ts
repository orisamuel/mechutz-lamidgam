import { describe, expect, it } from 'vitest';
import { bandIndex } from '../data/axes';
import { PARTIES, partyForArchetype } from '../data/parties';
import { QUESTIONS } from '../data/questions';
import type { Answers } from '../data/types';
import { axisReadings, identityParts, identitySentence, shareText } from './identity';
import { flavorLine } from './microcopy';

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
    expect(readings.map((r) => r.descriptor).sort()).toEqual(['ימין־פלאפל', 'שמאל־חלון'].sort());
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

});

describe('flavor line', () => {
  it('shows the party punch line only when it is true for these answers', () => {
    const pirates = partyForArchetype('digital_autonomy'); // needs the elevator answer a or d
    expect(flavorLine(pirates, { q5: { kind: 'choice', optionId: 'd' } })).toBe('בנושא המעלית נמצאה ביניכם תמימות דעים.');
    expect(flavorLine(pirates, { q5: { kind: 'choice', optionId: 'c' } })).toBeNull();
    expect(flavorLine(pirates, {})).toBeNull();
  });

  it('gives the no-opinion winner its line', () => {
    expect(flavorLine(partyForArchetype('peace_and_quiet'), {})).toBe('המערכת זיהתה אצלך נטייה חזקה לשקט.');
  });
  it('maps every archetype to exactly one party', () => {
    expect(new Set(PARTIES.map((p) => p.archetype)).size).toBe(PARTIES.length);
  });
});
