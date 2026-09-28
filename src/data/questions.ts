import type { Question } from './types';

// Short aliases keep the matrix readable. Internal only — never shown to users.
const PIR = 'pirates';
const SDR = 'seder-chadash';
const ANI = 'ani-veata';
const EDN = 'gan-eden';
const SHR = 'sharsher';
const TKN = 'hatikun';

/**
 * The 12 questions (display order is ORDER below). Every answer is a position one of the lists actually
 * published; `basis` points at it in positions.ts. 3 points = the list's own position, 1–2 = a list that
 * holds a close one. Source of truth for GAME_SPEC.md.
 */
const BANK: Question[] = [
  {
    id: 'pm',
    kind: 'choice',
    category: 'משילות',
    topic: 'ראש הממשלה',
    prompt: 'מי צריך להיות ראש הממשלה הבא?',
    options: [
      {
        id: 'a',
        label: 'מי שינצח בבחירות ישירות, ואם אין רוב, בסיבוב שני',
        weights: { [SDR]: 3 },
        basis: ['seder-chadash/direct-pm'],
        stance: 'בחירה ישירה של ראש הממשלה',
      },
      {
        id: 'b',
        label: 'מי שהכנסת תמנה לפי כישורים, כמו דירקטוריון שממנה מנכ״ל',
        weights: { [TKN]: 3 },
        basis: ['hatikun/pm-ceo'],
        stance: 'ראש ממשלה שממונה כמו מנכ״ל',
      },
      {
        id: 'c',
        label: 'מי שיאחד את העם. נתניהו יכול להיות שר החוץ שלו',
        weights: { [SHR]: 3 },
        basis: ['sharsher/pm-netanyahu'],
        stance: 'נתניהו כשר החוץ',
      },
      {
        id: 'd',
        label: 'מי שיהיה גם ראש הממשלה וגם שר האוצר',
        weights: { [EDN]: 3 },
        basis: ['gan-eden/pm-finance'],
        stance: 'ראש ממשלה שהוא גם שר האוצר',
      },
    ],
  },
  {
    id: 'cost',
    kind: 'choice',
    category: 'כלכלה',
    topic: 'יוקר המחיה',
    prompt: 'כיצד צריך להילחם ביוקר המחיה?',
    options: [
      {
        id: 'a',
        label: 'יובל לאומי: שמיטת חובות ושכר בסיס לכל אזרח',
        weights: { [EDN]: 3 },
        basis: ['gan-eden/jubilee', 'gan-eden/basic-wage'],
        stance: 'שמיטת חובות לאומית',
      },
      {
        id: 'b',
        label: 'מפעלים ממשלתיים שיקבעו רף למחירים, ופיקוח על מחירי מוצרים חיוניים',
        weights: { [ANI]: 3 },
        basis: ['ani-veata/state-enterprises'],
        stance: 'מפעלים ממשלתיים שיתחרו בבעלי ההון',
      },
      {
        id: 'c',
        label: 'חינוך, בריאות ואינטרנט מהיר בחינם, כזכות בסיסית',
        weights: { [PIR]: 3 },
        basis: ['pirates/free-services', 'pirates/free-internet'],
        stance: 'אינטרנט מהיר בחינם לכולם',
      },
      {
        id: 'd',
        label: 'מישהו שיבוא לעשות סדר. העם צמא לכסף',
        weights: { [SHR]: 3 },
        basis: ['sharsher/money-order'],
        stance: 'מישהו שיבוא לעשות סדר',
      },
    ],
  },
  {
    id: 'parties',
    kind: 'axis',
    axis: 'parties',
    category: 'שיטת הבחירות',
    topic: 'מספר המפלגות',
    prompt: 'כמה מפלגות צריכות להיות בכנסת?',
    anchors: [
      { party: TKN, at: 0, basis: ['hatikun/no-parties'] },
      { party: SDR, at: 28, basis: ['seder-chadash/regional'] },
      { party: ANI, at: 75, basis: ['ani-veata/threshold'] },
      { party: PIR, at: 95, basis: ['pirates/threshold', 'pirates/blank-ballot'] },
    ],
  },
  {
    id: 'health',
    kind: 'choice',
    category: 'בריאות',
    topic: 'מערכת הבריאות',
    prompt: 'מה הכי דחוף במערכת הבריאות?',
    options: [
      {
        id: 'a',
        label: 'הרחבת סל התרופות, קודם כל בתרופות מצילות חיים',
        weights: { [SHR]: 3, [SDR]: 1 },
        basis: ['sharsher/drug-basket', 'seder-chadash/drug-basket'],
        stance: 'הרחבת סל התרופות',
      },
      {
        id: 'b',
        label: 'רשות ממשלתית שתפתח תרופות בעצמה, כמו רפאל',
        weights: { [ANI]: 3 },
        basis: ['ani-veata/drug-authority'],
        stance: 'רפאל של תרופות',
      },
      {
        id: 'c',
        label: 'רשת גדולה של מרפאות לרפואה משלימה',
        weights: { [SDR]: 3 },
        basis: ['seder-chadash/alt-medicine'],
        stance: 'מרפאות לרפואה משלימה',
      },
      {
        id: 'd',
        label: 'תוכנית לאומית לריפוי טראומה, חרדה ובדידות',
        weights: { [EDN]: 3, [SHR]: 2 },
        basis: ['gan-eden/trauma', 'sharsher/trauma'],
        stance: 'תוכנית לאומית לריפוי טראומה',
      },
    ],
  },
  {
    id: 'foreign',
    kind: 'choice',
    category: 'חוץ וביטחון',
    topic: 'מדיניות החוץ',
    prompt: 'מה צריך להיות הצעד הראשון במדיניות החוץ?',
    options: [
      {
        id: 'a',
        label: 'להגיע לבית הלבן ולהעניק לנשיא טראמפ כתר',
        weights: { [SHR]: 3 },
        basis: ['sharsher/crown-trump'],
        stance: 'כתר לנשיא טראמפ',
      },
      {
        id: 'b',
        label: 'להקים משרד לשלום ולפיוס, לצד ביטחון נחוש ומוסר לחימה',
        weights: { [EDN]: 3 },
        basis: ['gan-eden/peace-ministry'],
        stance: 'משרד לשלום ולפיוס',
      },
      {
        id: 'c',
        label: 'להתחייב שכל הסכם שלום או ויתור על שטח יוכרע במשאל עם',
        weights: { [TKN]: 3, [ANI]: 1 },
        basis: ['hatikun/peace-referendum', 'ani-veata/peace-referendum'],
        stance: 'משאל עם על הסכמי שלום',
      },
      {
        id: 'd',
        label: 'לחתור לשלום בין כל יושבי הארץ',
        weights: { [PIR]: 3 },
        basis: ['pirates/peace'],
        stance: 'שלום בין כל יושבי הארץ',
      },
    ],
  },
  {
    id: 'service',
    kind: 'axis',
    axis: 'service',
    category: 'שוויון בנטל',
    topic: 'חובת השירות',
    prompt: 'מי צריך לשרת את המדינה?',
    anchors: [
      { party: SHR, at: 50, basis: ['sharsher/draft'] },
      { party: ANI, at: 70, basis: ['ani-veata/social-service'] },
      { party: TKN, at: 100, basis: ['hatikun/service-vote'] },
    ],
  },
  {
    id: 'corruption',
    kind: 'choice',
    category: 'שקיפות',
    topic: 'המאבק בשחיתות',
    prompt: 'מה הכי יעזור נגד שחיתות?',
    options: [
      {
        id: 'a',
        label: 'כל שקל ציבורי גלוי ברשת בזמן אמת, כולל הקבלות של הקייטרינג',
        weights: { [PIR]: 3, [SDR]: 1 },
        basis: ['pirates/every-shekel', 'seder-chadash/calendars'],
        stance: 'כל שקל ציבורי גלוי ברשת',
      },
      {
        id: 'b',
        label: 'יומן פגישות גלוי לציבור לכל נבחר ציבור ובכיר',
        weights: { [SDR]: 3, [PIR]: 1 },
        basis: ['seder-chadash/calendars', 'pirates/lobbying'],
        stance: 'יומנים גלויים לנבחרי הציבור',
      },
      {
        id: 'c',
        label: 'אחריות אישית על שחיתות, ותקרת שכר לבכירים',
        weights: { [EDN]: 3 },
        basis: ['gan-eden/clean-government'],
        stance: 'תקרת שכר לבכירים',
      },
      {
        id: 'd',
        label: 'הפרדה בין בעלי ההון לשלטון, גם אחרי שהפקיד מסיים את תפקידו',
        weights: { [ANI]: 3 },
        basis: ['ani-veata/capital-government'],
        stance: 'הפרדת הון ושלטון',
      },
    ],
  },
  {
    id: 'housing',
    kind: 'choice',
    category: 'דיור',
    topic: 'הדיור',
    prompt: 'איך פותרים את משבר הדיור?',
    options: [
      {
        id: 'a',
        label: 'קרקע ראשונה או דירה ראשונה, בחינם, לכל אזרח',
        weights: { [ANI]: 3 },
        basis: ['ani-veata/free-land'],
        stance: 'דירה ראשונה בחינם',
      },
      {
        id: 'b',
        label: 'מגדלי שכירות זולה של המדינה ליד כל תחנת רכבת, לזוגות צעירים',
        weights: { [SDR]: 3 },
        basis: ['seder-chadash/train-rentals'],
        stance: 'מגדלי שכירות ליד תחנות הרכבת',
      },
      {
        id: 'c',
        label: 'יעד מדיד להורדת המחירים, ושר שלא עומד בו מוחלף',
        weights: { [TKN]: 3 },
        basis: ['hatikun/housing-target', 'hatikun/targets'],
        stance: 'שרים שמוחלפים כשהם לא עומדים ביעד',
      },
      {
        id: 'd',
        label: 'שחרור חסמי תכנון ודיור בר השגה',
        weights: { [EDN]: 1 },
        basis: ['gan-eden/housing'],
        stance: 'שחרור חסמי תכנון',
      },
    ],
  },
  {
    id: 'citizens',
    kind: 'axis',
    axis: 'citizens',
    category: 'דמוקרטיה',
    topic: 'כוח האזרחים',
    prompt: 'כמה כוח צריך להיות לאזרחים בין בחירות לבחירות?',
    anchors: [
      { party: TKN, at: 50, basis: ['hatikun/referendums'] },
      { party: EDN, at: 70, basis: ['gan-eden/digital-democracy'] },
      { party: PIR, at: 100, basis: ['pirates/liquid-democracy'] },
    ],
  },
  {
    id: 'education',
    kind: 'choice',
    category: 'חינוך',
    topic: 'מערכת החינוך',
    prompt: 'מה צריך לשנות בחינוך?',
    options: [
      {
        id: 'a',
        label: 'מאבק בחרמות חברתיים על ילדים ובני נוער',
        weights: { [SHR]: 3 },
        basis: ['sharsher/boycotts', 'sharsher/vision'],
        stance: 'מאבק בחרמות על ילדים',
      },
      {
        id: 'b',
        label: 'חינוך פיננסי מגיל צעיר, וגם מלאכה, חקלאות ומוזיקה',
        weights: { [EDN]: 3 },
        basis: ['gan-eden/education'],
        stance: 'חינוך פיננסי מגיל צעיר',
      },
      {
        id: 'c',
        label: 'חזרה ללמידה על הלוח, ויום לימודים ארוך',
        weights: { [ANI]: 3 },
        basis: ['ani-veata/blackboard'],
        stance: 'חזרה ללמידה על הלוח',
      },
      {
        id: 'd',
        label: 'חינוך חינם, ומשכורות למורים כעדיפות לאומית',
        weights: { [PIR]: 3 },
        basis: ['pirates/free-services'],
        stance: 'חינוך חינם ומשכורות גבוהות למורים',
      },
    ],
  },
  {
    id: 'welfare',
    kind: 'choice',
    category: 'רווחה',
    topic: 'הרווחה',
    prompt: 'למי המדינה צריכה לעזור קודם?',
    options: [
      {
        id: 'a',
        label: 'לניצולי שואה, להלומי קרב ולמשפחות שלהם',
        weights: { [SHR]: 3, [SDR]: 1 },
        basis: ['sharsher/vision', 'seder-chadash/allowances'],
        stance: 'עזרה לניצולי שואה ולהלומי קרב',
      },
      {
        id: 'b',
        label: 'לאזרחים הוותיקים: קצבת זקנה בגובה שכר המינימום',
        weights: { [SDR]: 3 },
        basis: ['seder-chadash/pension', 'seder-chadash/allowances'],
        stance: 'קצבת זקנה בגובה שכר המינימום',
      },
      {
        id: 'c',
        label: 'לחיילי החובה, למשוחררים ולמשרתי המילואים',
        weights: { [TKN]: 3 },
        basis: ['hatikun/soldiers'],
        stance: 'הטבות לחיילים ולמשרתי המילואים',
      },
      {
        id: 'd',
        label: 'לכולם, מלידה ועד אחרית הימים',
        weights: { [PIR]: 3 },
        basis: ['pirates/lifecycle'],
        stance: 'שירותים מלידה ועד אחרית הימים',
      },
    ],
  },
  {
    id: 'constitution',
    kind: 'choice',
    category: 'חוקה ומשפט',
    topic: 'החוקה',
    prompt: 'על מה צריכה לעמוד חוקה לישראל?',
    options: [
      {
        id: 'a',
        label: 'על ערכי מגילת העצמאות: שוויון וחירות',
        weights: { [TKN]: 3, [PIR]: 1 },
        basis: ['hatikun/constitution', 'pirates/equality'],
        stance: 'חוקה לפי מגילת העצמאות',
      },
      {
        id: 'b',
        label: 'על חוק יסוד: האדם כמקדש חי',
        weights: { [EDN]: 3 },
        basis: ['gan-eden/living-temple'],
        stance: 'חוק יסוד: האדם כמקדש חי',
      },
      {
        id: 'c',
        label: 'על רשות רביעית, חברתית, שתייצג את המעמד הנמוך והבינוני',
        weights: { [ANI]: 3 },
        basis: ['ani-veata/fourth-branch'],
        stance: 'רשות רביעית למעמד הנמוך והבינוני',
      },
      {
        id: 'd',
        label: 'על הפרדת רשויות: שרים שאינם חברי כנסת, ולכל היותר שתי קדנציות לראש הממשלה',
        weights: { [SDR]: 3 },
        basis: ['seder-chadash/separation', 'seder-chadash/ministers', 'seder-chadash/term-limit'],
        stance: 'הגבלת הקדנציות של ראש הממשלה',
      },
    ],
  },
];

/** Display order: open with the prime minister, spread the sliders, close on the constitution. */
const ORDER = [
  'pm',
  'cost',
  'parties',
  'health',
  'foreign',
  'service',
  'corruption',
  'housing',
  'citizens',
  'education',
  'welfare',
  'constitution',
];

export const QUESTIONS: Question[] = ORDER.map((id) => {
  const q = BANK.find((b) => b.id === id);
  if (!q) throw new Error(`Unknown question ${id}`);
  return q;
});

export const QUESTION_COUNT = QUESTIONS.length;
