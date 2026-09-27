import type { Question } from './types';

// Short aliases keep the matrix readable. Internal only — never shown to users.
const DA = 'digital_autonomy';
const PO = 'procedural_order';
const HC = 'human_consensus';
const PQ = 'peace_and_quiet';
const CP = 'ceremony_presence';
const PR = 'process_reform';

/**
 * The 12 main questions (ids are stable; display order is ORDER below). Source of truth for GAME_SPEC.md.
 * The old "seventh season" question moved to the reserve bank and was replaced by the sea/desert slider.
 */
const BANK: Question[] = [
  {
    id: 'q1',
    kind: 'axis',
    axis: 'pizzaFalafel',
    category: 'מדיניות מזון',
    prompt: 'איפה אתם על הציר שבין פיצה לפלאפל?',
    topic: 'הפיצה והפלאפל',
    anchors: [
      { archetype: DA, at: 10 },
      { archetype: PR, at: 50 },
      { archetype: CP, at: 90 },
    ],
  },
  {
    id: 'q2',
    kind: 'choice',
    category: 'תקשורת',
    prompt: 'הודעה קולית של 4:38 היא:',
    topic: 'ההודעות הקוליות',
    options: [
      { id: 'a', label: 'לגיטימית לחלוטין', weights: { [CP]: 3, [HC]: 1 }, descriptor: { text: 'קו ליברלי בנושא הודעות קוליות', strength: 2 } },
      { id: 'b', label: 'סבירה רק למשפחה מדרגה ראשונה', weights: { [HC]: 3, [PO]: 1 }, descriptor: { text: 'קו משפחתי בנושא הודעות קוליות', strength: 1 } },
      { id: 'c', label: 'מחייבת תמלול', weights: { [DA]: 3, [PO]: 1 }, descriptor: { text: 'קו קיצוני בנושא הודעות קוליות', strength: 3 } },
      { id: 'd', label: 'אירוע שדורש תיאום מראש', weights: { [PQ]: 3, [PR]: 1 }, descriptor: { text: 'קו נוקשה בנושא הודעות קוליות', strength: 2 } },
    ],
  },
  {
    id: 'q3',
    kind: 'choice',
    category: 'תחבורה',
    prompt: '"אני חמש דקות מגיע" פירושו:',
    topic: 'חמש הדקות',
    options: [
      { id: 'a', label: 'חמש דקות', weights: { [PO]: 3, [PR]: 1 }, descriptor: { text: 'פרשנות מצמצמת ל"חמש דקות"', strength: 3 } },
      { id: 'b', label: 'עד עשר דקות', weights: { [HC]: 3, [PQ]: 1 }, descriptor: { text: 'פרשנות סבירה ל"חמש דקות"', strength: 1 } },
      { id: 'c', label: 'עד עשרים דקות', weights: { [PQ]: 3, [CP]: 1 }, descriptor: { text: 'פרשנות מרחיבה ל"חמש דקות"', strength: 2 } },
      { id: 'd', label: 'אין מדובר ביחידת זמן', weights: { [PR]: 3, [DA]: 1 }, descriptor: { text: 'גישה פוסט־מודרנית ל"חמש דקות"', strength: 3 } },
    ],
  },
  {
    id: 'q4',
    kind: 'axis',
    axis: 'seaDesert',
    category: 'תכנון ארצי',
    prompt: 'איפה אתם על הציר שבין ים למדבר?',
    topic: 'הים והמדבר',
    anchors: [
      { archetype: DA, at: 15 },
      { archetype: PR, at: 50 },
      { archetype: PQ, at: 90 },
    ],
  },
  {
    id: 'q5',
    kind: 'choice',
    category: 'תשתיות',
    prompt: 'אם מישהו כבר לחץ על כפתור המעלית, האם מותר ללחוץ שוב?',
    topic: 'המעלית',
    options: [
      { id: 'a', label: 'כן. זה לא מזיק', weights: { [DA]: 2, [CP]: 2 }, descriptor: { text: 'קו מתירני בסוגיית המעלית', strength: 2 } },
      { id: 'b', label: 'רק אם עבר זמן סביר', weights: { [HC]: 3, [PQ]: 1 }, descriptor: { text: 'קו מתון בסוגיית המעלית', strength: 1 } },
      { id: 'c', label: 'לא. הכפתור קיבל את הבקשה', weights: { [PO]: 3, [PR]: 1 }, descriptor: { text: 'קו ממלכתי בסוגיית המעלית', strength: 3 } },
      { id: 'd', label: 'תלוי אם האור בכפתור נדלק', weights: { [DA]: 3, [PR]: 1 }, descriptor: { text: 'גישה אמפירית לסוגיית המעלית', strength: 2 } },
    ],
  },
  {
    id: 'q6',
    kind: 'axis',
    axis: 'windowAC',
    category: 'אנרגיה',
    prompt: 'איפה אתם על הציר שבין חלון למזגן?',
    topic: 'המזגן',
    anchors: [
      { archetype: PQ, at: 10 },
      { archetype: HC, at: 50 },
      { archetype: DA, at: 90 },
    ],
  },
  {
    id: 'q7',
    kind: 'choice',
    category: 'יחסי חוץ',
    prompt: '"תבואו מתי שנוח לכם" היא:',
    topic: 'ההזמנות הפתוחות',
    options: [
      { id: 'a', label: 'הזמנה אמיתית', weights: { [HC]: 3, [PQ]: 1 }, descriptor: { text: 'קו אופטימי בענייני משפחה', strength: 2 } },
      { id: 'b', label: 'הזמנה עם טווח שעות לא כתוב', weights: { [PR]: 3, [CP]: 1 }, descriptor: { text: 'פרשנות חוקתית בענייני משפחה', strength: 3 } },
      { id: 'c', label: 'בקשה שתשאלו באיזו שעה להגיע', weights: { [PO]: 3, [CP]: 1 }, descriptor: { text: 'קו פורמליסטי בענייני משפחה', strength: 2 } },
      { id: 'd', label: 'מלכודת', weights: { [PQ]: 2, [PO]: 1 }, descriptor: { text: 'קו ניצי בענייני משפחה', strength: 3 } },
    ],
  },
  {
    id: 'q8',
    kind: 'choice',
    category: 'תיירות פנים',
    prompt: 'מעיין שיש בחניה שלו 14 מכוניות עדיין יכול להיחשב "פינה סודית"?',
    topic: 'הפינות הסודיות',
    options: [
      { id: 'a', label: 'כן', weights: { [HC]: 2, [CP]: 2 }, descriptor: { text: 'קו מכיל בסוגיית הפינות הסודיות', strength: 1 } },
      { id: 'b', label: 'רק באמצע שבוע', weights: { [PQ]: 3, [PO]: 1 }, descriptor: { text: 'קו טקטי בסוגיית הפינות הסודיות', strength: 2 } },
      { id: 'c', label: 'לא', weights: { [PR]: 3, [PO]: 1 }, descriptor: { text: 'קו טהרני בסוגיית הפינות הסודיות', strength: 3 } },
      { id: 'd', label: 'תלוי אם יש קליטה', weights: { [DA]: 3, [CP]: 1 }, descriptor: { text: 'גישה טכנולוגית לפינות סודיות', strength: 2 } },
    ],
  },
  {
    id: 'q9',
    kind: 'axis',
    axis: 'flowCalendar',
    category: 'שוק העבודה',
    prompt: 'איפה אתם על הציר שבין "נזרום" ל"שלח זימון ביומן"?',
    topic: 'זימוני היומן',
    anchors: [
      { archetype: HC, at: 20 },
      { archetype: CP, at: 60 },
      { archetype: PO, at: 92 },
    ],
  },
  {
    id: 'q10',
    kind: 'choice',
    category: 'חינוך',
    prompt: 'אדם שאומר "ליטרלי" על דבר שלא קרה ליטרלי:',
    topic: '"ליטרלי"',
    options: [
      { id: 'a', label: 'משתמש בשפה באופן טבעי', weights: { [DA]: 3, [HC]: 1 }, descriptor: { text: 'קו יוני בנושא "ליטרלי"', strength: 2 } },
      { id: 'b', label: 'ראוי לתיקון עדין', weights: { [PR]: 3, [HC]: 1 }, descriptor: { text: 'קו רפורמיסטי בנושא "ליטרלי"', strength: 1 } },
      { id: 'c', label: 'צריך לקבל אזהרה ראשונה', weights: { [PO]: 3, [PR]: 1 }, descriptor: { text: 'קו ניצי בנושא "ליטרלי"', strength: 2 } },
      { id: 'd', label: 'איבד את הזכות להשתמש במילה', weights: { [CP]: 3, [PO]: 1 }, descriptor: { text: 'קו בלתי מתפשר בנושא "ליטרלי"', strength: 3 } },
    ],
  },
  {
    id: 'q11',
    kind: 'choice',
    category: 'דיור',
    prompt: 'כמה כריות נוי על ספה של שלושה מושבים הן יותר מדי?',
    topic: 'כריות הנוי',
    options: [
      { id: 'a', label: '2', weights: { [DA]: 2, [PO]: 2 }, descriptor: { text: 'קו ניצי בנושא כריות נוי', strength: 3 } },
      { id: 'b', label: '4', weights: { [PQ]: 3, [PO]: 1 }, descriptor: { text: 'קו מתון בנושא כריות נוי', strength: 1 } },
      { id: 'c', label: '6', weights: { [HC]: 3, [CP]: 1 }, descriptor: { text: 'קו יוני בנושא כריות נוי', strength: 2 } },
      { id: 'd', label: 'אין מספר כזה', weights: { [CP]: 3, [PR]: 1 }, descriptor: { text: 'קו מקסימליסטי בנושא כריות נוי', strength: 3 } },
    ],
  },
  {
    id: 'q12',
    kind: 'choice',
    category: 'שלטון מקומי',
    prompt: 'מהו תוקפו של כיסא פלסטיק שמונח בחניה?',
    topic: 'הכיסא בחניה',
    options: [
      { id: 'a', label: 'אין לו שום תוקף', weights: { [PO]: 3, [DA]: 1 }, descriptor: { text: 'קו לגליסטי בעניין כיסאות בחניה', strength: 2 } },
      { id: 'b', label: 'עד חצי שעה', weights: { [PQ]: 3, [HC]: 1 }, descriptor: { text: 'קו פרגמטי בעניין כיסאות בחניה', strength: 2 } },
      { id: 'c', label: 'עד שבעל הכיסא חוזר', weights: { [CP]: 3, [PQ]: 1 }, descriptor: { text: 'קו שמרני בעניין כיסאות בחניה', strength: 2 } },
      { id: 'd', label: 'זו שאלה שצריכה להיות מוכרעת ברמה המקומית', weights: { [PR]: 3, [PO]: 1 }, descriptor: { text: 'קו פדרליסטי בעניין כיסאות בחניה', strength: 3 } },
    ],
  },
];

/** Display order: open with the strongest question, sliders spread out, a strong closer. */
const ORDER = ['q12', 'q2', 'q6', 'q5', 'q10', 'q1', 'q8', 'q11', 'q9', 'q7', 'q4', 'q3'];

export const QUESTIONS: Question[] = ORDER.map((id) => {
  const q = BANK.find((b) => b.id === id);
  if (!q) throw new Error(`Unknown question `);
  return q;
});

export const QUESTION_COUNT = QUESTIONS.length;
