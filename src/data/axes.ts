import type { AxisId } from './types';

/**
 * Physical orientation is fixed regardless of RTL: `left` is drawn on the left (value 0),
 * `right` on the right (value 100). "ימין־מזגן" therefore really is on the right.
 */
export interface AxisDef {
  id: AxisId;
  left: string;
  right: string;
  /** Share/map descriptors per band: 0–24, 25–44, 45–55, 56–75, 76–100. */
  bands: readonly [string, string, string, string, string];
  /** Short value labels shown under the slider and used as aria-valuetext. */
  valueLabels: readonly [string, string, string, string, string];
}

export const AXES: Record<AxisId, AxisDef> = {
  pizzaFalafel: {
    id: 'pizzaFalafel',
    left: 'פיצה',
    right: 'פלאפל',
    bands: ['שמאל־פיצה', 'מרכז־פיצה', 'קול צף בשאלת הפיצה', 'מרכז־פלאפל', 'ימין־פלאפל'],
    valueLabels: ['פיצה', 'נוטה לפיצה', 'מרכז', 'נוטה לפלאפל', 'פלאפל'],
  },
  seaDesert: {
    id: 'seaDesert',
    left: 'ים',
    right: 'מדבר',
    bands: ['שמאל־ים', 'מרכז־ים', 'קול צף בין ים למדבר', 'מרכז־מדבר', 'ימין־מדבר'],
    valueLabels: ['ים', 'נוטה לים', 'מרכז', 'נוטה למדבר', 'מדבר'],
  },
  windowAC: {
    id: 'windowAC',
    left: 'חלון',
    right: 'מזגן',
    bands: ['שמאל־חלון', 'מרכז־חלון', 'קול צף בסוגיית המזגן', 'מרכז־מזגן', 'ימין־מזגן'],
    valueLabels: ['חלון', 'נוטה לחלון', 'מרכז', 'נוטה למזגן', 'מזגן'],
  },
  flowCalendar: {
    id: 'flowCalendar',
    left: 'נזרום',
    right: 'שלח זימון',
    bands: ['גוש הנזרום', 'נוטה לנזרום', 'קול צף בענייני יומן', 'נוטה ליומן', 'גוש היומן'],
    valueLabels: ['נזרום', 'נוטה לנזרום', 'מרכז', 'נוטה לזימון', 'שלח זימון'],
  },
};

/** Map order on "המפה שלי". */
export const AXIS_ORDER: readonly AxisId[] = ['pizzaFalafel', 'flowCalendar', 'seaDesert', 'windowAC'];

export type BandIndex = 0 | 1 | 2 | 3 | 4;

export function bandIndex(value: number): BandIndex {
  if (value <= 24) return 0;
  if (value <= 44) return 1;
  if (value <= 55) return 2;
  if (value <= 75) return 3;
  return 4;
}
