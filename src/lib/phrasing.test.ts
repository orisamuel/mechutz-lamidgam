import { describe, expect, it } from 'vitest';
import { NBSP, phrase, plain } from './phrasing';

/** The phrases a line may break between, for readable assertions. */
const phrases = (text: string, max?: number) => phrase(text, max).split(' ').map((p) => p.split(NBSP).join(' '));

describe('phrase-aware line breaking', () => {
  it('keeps the user\'s example together: "מה המפלגה הקטנה / (או אם תרצו, הבוטיקית) / שהכי קרובה…"', () => {
    expect(phrases('הנה השאלון שיגיד לכם מה המפלגה הקטנה (או אם תרצו, הבוטיקית) שהכי קרובה לדעותיכם!')).toEqual([
      'הנה השאלון',
      'שיגיד',
      'לכם',
      'מה המפלגה הקטנה',
      '(או אם תרצו, הבוטיקית)',
      'שהכי',
      'קרובה',
      'לדעותיכם!',
    ]);
  });

  it('never ends a line on a small word or before a definite noun', () => {
    expect(phrases('מי צריך להיות ראש הממשלה הבא?')).toEqual(['מי צריך', 'להיות', 'ראש הממשלה הבא?']);
  });

  it('does not glue across punctuation, and "\\n" still forces a line', () => {
    expect(phrases('מי שיאחד את העם.\nנתניהו יכול להיות שר החוץ שלו').join('|')).toContain('את העם.\nנתניהו');
  });

  it('caps a joined phrase so it fits a phone line', () => {
    for (const p of phrases('במצע של גן עדן: יובל לאומי שמתחיל ב־1.1.2027, שמיטת חובות, שכר בסיס לכל אזרח ושקל דיגיטלי ציבורי.', 12)) {
      expect(p.length).toBeLessThanOrEqual(12 + 12); // a single long word may exceed, a joined phrase may not
    }
    expect(phrases('שרשר לאהבה ואחדות העם', 12)).not.toContain('לאהבה ואחדות העם');
    expect(phrases('שרשר לאהבה ואחדות העם', 24)).toContain('לאהבה ואחדות העם');
  });

  it('gives meta tags and share text plain, one-line copy', () => {
    expect(plain(phrase('השאלון שיגיד לכם\n(או אם תרצו, הבוטיקית)'))).toBe('השאלון שיגיד לכם (או אם תרצו, הבוטיקית)');
  });
});
