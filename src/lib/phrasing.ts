/**
 * Phrase-aware line breaking for Hebrew display text. Words that belong together are joined with
 * no-break spaces, so lines only break between phrases: "מי צריך להיות / ראש הממשלה הבא?" and never
 * "מי צריך להיות ראש / הממשלה הבא?". A "\n" in the copy forces a new line.
 *
 * `max` caps a joined phrase (in characters) so it always fits the narrowest phone line at that
 * text size; a phrase that would grow past it is allowed to break after all.
 */

export const NBSP = String.fromCharCode(0xa0);

/** Words that lean on the next one, so a line never ends with them. (Not "עם": it is also "people", as in משאל עם.) */
const LEADING = new Set([
  'של', 'על', 'את', 'אל', 'בין', 'לפי', 'אצל', 'כמו', 'בלי', 'בעד', 'נגד', 'מול', 'ללא', 'עד',
  'לא', 'גם', 'רק', 'כל', 'אף', 'או', 'אם', 'כי', 'מי', 'מה', 'זה', 'זו', 'אין', 'עוד', 'הכי', 'שום', 'ליד',
  'כזה', 'כזו', 'אבל', 'וגם', 'ואם', 'ולא', 'שלא', 'שגם', 'ושל', 'ומי', 'אז', 'איך', 'כמה', 'למי', 'כדי', 'אחרי', 'לפני',
]);

/** Verbs a definite noun does not stick to: "להיות / הצעד הראשון", not "להיות הצעד". */
const NOT_BEFORE_DEFINITE = new Set(['להיות', 'היה', 'הייתה', 'יהיה', 'תהיה', 'לשרת', 'לעשות', 'לשנות']);

/** Expressions that never break inside, wherever they appear (subject to `max`). */
const PHRASES = [
  'קודם כל',
  'אף פעם',
  'אם תרצו',
  'לנשיא טראמפ',
  'בין בחירות לבחירות',
  'חוק יסוד:',
  'כמקדש חי',
  'לאהבה ואחדות העם',
  'מכוניות המחץ',
  'מגילת העצמאות',
  'דירה ראשונה',
  'שכר בסיס',
  'לכל אזרח',
  'שקל דיגיטלי',
  'תחנת רכבת',
  'זוגות צעירים',
  'ניצולי שואה',
  'הלומי קרב',
  'שכר המינימום',
  'קצבת זקנה',
  'בעלי ההון',
  'תקרת שכר',
  'יום לימודים ארוך',
  'בני נוער',
  'בית פוליטי',
  'פתק לבן',
  'כיסא ריק',
  'אחרית הימים',
  'מצילות חיים',
  'שיעמדו ביעד',
  'ומה יוצא לכם?',
  'גם אתם',
  'חובת השירות',
  'בזמן אמת',
  'שתי קדנציות',
  'חברי כנסת',
  'חבר כנסת',
  'ראש ממשלה',
  'לאיזו מפלגה להצביע',
  'שזה כבר',
  'לעשות סדר',
  'שיקבעו רף',
  'רף למחירים',
  'מוצרים חיוניים',
  'אינטרנט מהיר',
  'כזכות בסיסית',
  'רשות ממשלתית',
  'שתפתח תרופות',
  'תוכנית לאומית',
  'לריפוי טראומה',
  'להעניק לנשיא',
  'הסכם שלום',
  'ויתור על שטח',
  'משאל עם',
  'ללמידה על הלוח',
  'ומשכורות למורים',
  'כעדיפות לאומית',
  'הנמוך והבינוני',
  'מסיים את תפקידו',
  'שלום בין',
  'מצביע בעצמו',
  'על כל חוק',
  'לזיהוי פנים',
  'בחירה ישירה',
  'מרפאות לרפואה משלימה',
  'כל אזור בוחר',
  'את הנציגים שלו',
  'יש מגדלי שכירות',
  'תשובה אחת',
  'זמן אחד',
  'מקום אחד',
  'מפעלים ממשלתיים',
  'יותר מפלגות בכנסת',
  'פחות מפלגות בכנסת',
  'רפאל של תרופות',
  'בין ההון לשלטון',
  'מהגן ועד סוף התואר',
  'שהוא גם שר האוצר',
  'שמתחיל ב־1.1.2027',
  'שכר בסיס לכל אזרח',
  'שכר לבכירי הציבור',
  'נתניהו כשר החוץ',
  'להעניק לטראמפ',
  'שממונה כמו מנכ״ל',
  'שמיטת חובות לאומית',
  'רשות רביעית',
  'נבחר אישית',
  'שלומד תורה',
  'כנסת בלי מפלגות',
  'האחוז של שתי המפלגות הבאות',
  'שהעמדה שלה',
  'בסיוע בינה מלאכותית',
];

export function phrase(text: string, max = 22): string {
  return text
    .split('\n')
    .map((line) => phraseLine(line, max))
    .join('\n');
}

/** For places that need the text on one line with ordinary spaces (meta tags, share text, tests). */
export function plain(text: string): string {
  return text.replace(/\s*\n\s*/g, ' ').replace(new RegExp(NBSP, 'g'), ' ');
}

function phraseLine(line: string, max: number): string {
  const words = line.split(/ +/).filter(Boolean);
  if (words.length < 2) return line;

  // Which gaps are glued: fixed expressions and short parentheticals first, then the word rules.
  const glued = new Array<boolean>(words.length - 1).fill(false);
  const forced = new Array<boolean>(words.length - 1).fill(false);
  markExpressions(words, glued, forced, max);
  markParentheticals(words, glued, forced, max);
  for (let i = 0; i < words.length - 1; i++) {
    if (!forced[i]) glued[i] = gluesToNext(words[i]!, words[i + 1]!);
  }

  // Build phrases, never letting one grow past `max` (forced joins count too, so nothing overflows).
  const phrases: string[] = [];
  let current = words[0]!;
  for (let i = 1; i < words.length; i++) {
    const next = words[i]!;
    if (glued[i - 1] && current.length + 1 + next.length <= max) current += NBSP + next;
    else {
      phrases.push(current);
      current = next;
    }
  }
  phrases.push(current);
  return phrases.join(' ');
}

function gluesToNext(word: string, next: string): boolean {
  if (/[.,;:!?)]$/.test(word)) return false;
  const bare = word.replace(/^["'(]+/, '');
  if (LEADING.has(bare)) return true;
  // Numbers stay with their neighbours: "11 שרים", "עד 2 נושאים".
  if (/^\d/.test(next) || /^\d[\d.,%־]*$/.test(bare)) return true;
  // A definite noun or adjective sticks to the word before it: "ראש הממשלה", "המפלגה הקטנה".
  if (/^ה[א-ת]{2,}/.test(next) && !NOT_BEFORE_DEFINITE.has(bare)) return true;
  return false;
}

function markExpressions(words: string[], glued: boolean[], forced: boolean[], max: number): void {
  for (const expression of PHRASES) {
    const parts = expression.split(' ');
    for (let i = 0; i + parts.length <= words.length; i++) {
      const matches = parts.every((p, k) => (k === 0 ? words[i]!.endsWith(p) : words[i + k]!.startsWith(p)));
      if (!matches) continue;
      const length = words.slice(i, i + parts.length).join(' ').length;
      if (length > max) continue;
      for (let k = 0; k < parts.length - 1; k++) {
        glued[i + k] = true;
        forced[i + k] = true;
      }
    }
  }
}

/** "(או אם תרצו, הבוטיקית)" stays whole when it fits. */
function markParentheticals(words: string[], glued: boolean[], forced: boolean[], max: number): void {
  for (let i = 0; i < words.length; i++) {
    if (!words[i]!.startsWith('(')) continue;
    const end = words.findIndex((w, k) => k >= i && /\)[.,;:!?]?$/.test(w));
    if (end <= i) continue;
    if (words.slice(i, end + 1).join(' ').length > max) continue;
    for (let k = i; k < end; k++) {
      glued[k] = true;
      forced[k] = true;
    }
  }
}
