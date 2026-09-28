import { describe, expect, it } from 'vitest';
import { bandIndex } from '../data/axes';
import { PARTIES, partyById } from '../data/parties';
import { QUESTIONS } from '../data/questions';
import type { Answers } from '../data/types';
import { joinHebrew, matchSentence, sharedStances, shareText, stanceOf } from './identity';
import { flavorLine } from './microcopy';

const byId = (id: string) => QUESTIONS.find((q) => q.id === id)!;
const pick = (optionId: string) => ({ kind: 'choice', optionId }) as const;

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
});

describe('stances', () => {
  it('reads the chosen answer, or the slider band', () => {
    expect(stanceOf(byId('foreign'), pick('a'))).toBe('כתר לנשיא טראמפ');
    expect(stanceOf(byId('service'), { kind: 'axis', value: 100 })).toBe('זכות בחירה רק למי ששירת');
    expect(stanceOf(byId('service'), { kind: 'axis', value: 50 })).toBe('פטור ללומדי תורה');
  });

  it('reads nothing into skips or a slider nobody moved', () => {
    expect(stanceOf(byId('foreign'), { kind: 'skip' })).toBeNull();
    expect(stanceOf(byId('foreign'), undefined)).toBeNull();
    expect(stanceOf(byId('service'), { kind: 'axis', value: 50, untouched: true })).toBeNull();
  });

  const answers: Answers = {
    pm: pick('d'), // גן עדן 3
    cost: pick('a'), // גן עדן 3
    health: pick('d'), // גן עדן 3, שרשר 2
    housing: pick('d'), // גן עדן 1: too weak to count as agreement
    constitution: pick('b'), // גן עדן 3
    foreign: pick('a'), // שרשר only
  };

  it('keeps only what the party itself holds, strongest first, in question order', () => {
    expect(sharedStances(QUESTIONS, answers, 'gan-eden')).toEqual([
      'ראש ממשלה שהוא גם שר האוצר',
      'שמיטת חובות לאומית',
      'תוכנית לאומית לריפוי טראומה',
    ]);
    // Sharsher: its own answer (3) before the one it shares with Gan Eden (2).
    expect(sharedStances(QUESTIONS, answers, 'sharsher')).toEqual(['כתר לנשיא טראמפ', 'תוכנית לאומית לריפוי טראומה']);
  });

  it('puts the issues marked important first', () => {
    expect(sharedStances(QUESTIONS, answers, 'gan-eden', ['constitution'])[0]).toBe('חוק יסוד: האדם כמקדש חי');
  });

  it('joins Hebrew lists with the conjunction on the last item', () => {
    expect(joinHebrew([])).toBe('');
    expect(joinHebrew(['א'])).toBe('א');
    expect(joinHebrew(['א', 'ב'])).toBe('א וב');
    expect(joinHebrew(['א', 'ב', 'ג'])).toBe('א, ב וג');
    expect(joinHebrew(['א', '11 שרים'])).toBe('א ו־11 שרים');
  });

  it('builds the match line and the share text', () => {
    const stances = sharedStances(QUESTIONS, answers, 'gan-eden');
    expect(matchSentence('גן עדן', stances)).toBe(
      'כמו גן עדן, גם אתם בעד ראש ממשלה שהוא גם שר האוצר, שמיטת חובות לאומית ותוכנית לאומית לריפוי טראומה.',
    );
    expect(matchSentence('גן עדן', [])).toBeNull();
    expect(shareText('גן עדן', 91, stances)).toBe('יצא לי גן עדן, 91%. בעד ראש ממשלה שהוא גם שר האוצר ושמיטת חובות לאומית.');
    expect(shareText('גן עדן', 91, [])).toBe('יצא לי גן עדן, 91%.');
  });
});

describe('party texts', () => {
  it('shows each flavor line when its condition holds', () => {
    for (const p of PARTIES) expect(flavorLine(p, {}), p.id).toBe(p.flavor.text);
  });

  it('gives every party a unique id and a short name for sentences', () => {
    expect(new Set(PARTIES.map((p) => p.id)).size).toBe(PARTIES.length);
    expect(partyById('sharsher').shortName).toBe('שרשר');
  });
});
