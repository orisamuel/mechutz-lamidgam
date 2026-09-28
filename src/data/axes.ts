import type { AxisId } from './types';

/**
 * Physical orientation is fixed regardless of RTL: `left` is drawn on the left (value 0),
 * `right` on the right (value 100).
 */
export interface AxisDef {
  id: AxisId;
  left: string;
  right: string;
  /** Value labels shown under the slider and used as aria-valuetext, per band: 0–24, 25–44, 45–55, 56–75, 76–100. */
  valueLabels: readonly [string, string, string, string, string];
  /** Per band, the noun phrase that completes "בעד ___" in the match line and on the share card. */
  stances: readonly [string, string, string, string, string];
}

export const AXES: Record<AxisId, AxisDef> = {
  parties: {
    id: 'parties',
    left: 'אף אחת',
    right: 'כמה שיותר',
    valueLabels: ['בלי מפלגות בכלל', 'מעט מפלגות', 'בערך כמו היום', 'יותר מפלגות', 'בלי אחוז חסימה'],
    stances: ['כנסת בלי מפלגות', 'פחות מפלגות בכנסת', 'שיטת הבחירות הנוכחית', 'יותר מפלגות בכנסת', 'ביטול אחוז החסימה'],
  },
  service: {
    id: 'service',
    left: 'מי שרוצה',
    right: 'כולם',
    valueLabels: ['רק מי שרוצה', 'רוב הציבור', 'מי שלא לומד תורה', 'כולם, גם בשירות אזרחי', 'כולם, ומי שלא, לא מצביע'],
    stances: ['שירות מרצון', 'פטורים רחבים משירות', 'פטור ללומדי תורה', 'שירות לכולם', 'זכות בחירה רק למי ששירת'],
  },
  citizens: {
    id: 'citizens',
    left: 'לנבחרים',
    right: 'לאזרחים',
    valueLabels: [
      'הנבחרים מחליטים',
      'בעיקר הנבחרים',
      'משאל עם בהכרעות גדולות',
      'האזרחים מציעים חוקים',
      'כל אזרח מצביע על כל חוק',
    ],
    stances: [
      'הכרעות בידי הנבחרים',
      'דמוקרטיה ייצוגית',
      'משאלי עם בהכרעות הגדולות',
      'חוקים שהאזרחים מציעים',
      'הצבעה של כל אזרח על כל חוק',
    ],
  },
};

export type BandIndex = 0 | 1 | 2 | 3 | 4;

export function bandIndex(value: number): BandIndex {
  if (value <= 24) return 0;
  if (value <= 44) return 1;
  if (value <= 55) return 2;
  if (value <= 75) return 3;
  return 4;
}
