/**
 * All interface copy in one place (question and party texts live in their own files).
 * Address rule: plural ("אתם") or forms that are gender-neutral in writing ("שלך", "אותך").
 */
export const COPY = {
  productName: 'מחוץ למדגם',
  tagline: 'מצפן המפלגות הקטנות של בחירות 2026',
  mastheadTag: 'מצפן המפלגות הקטנות · בחירות 2026',
  intro: {
    body: '12 שאלות. כמה סוגיות עקרוניות. מפלגה אחת שמתאימה לכם יותר ממה שנעים להודות.',
    meta: '12 שאלות · כ־3 דקות',
    start: 'מתחילים',
    resume: (n: number) => `להמשיך מהשאלה ${n}`,
    restart: 'להתחיל מחדש',
    toResult: 'לתוצאה שלך',
    skipHint: 'אפשר לדלג על שאלות שאין לכם לגביהן עמדה מגובשת.',
  },
  quiz: {
    progress: (n: number, total: number) => `שאלה ${n} מתוך ${total}`,
    next: 'המשך',
    back: 'הקודמת',
    skip: 'אין לי עמדה בנושא',
    sliderHint: 'הקישו על הציר או גררו אותו',
    sliderUnset: 'לא נבחרה עמדה',
  },
  loading: {
    title: 'ממקמים אותך על המפה הפוליטית',
    lines: ['כלכלה וחברה', 'פיצה ופלאפל', 'מוסדות שלטון', 'מזגן וחלון'],
  },
  needMore: {
    title: 'נדרשות עוד עמדות',
    body: (answered: number, min: number) =>
      `כדי למקם אותך על המפה נדרשות לפחות ${min} עמדות. עד עכשיו נרשמו ${answered}.`,
    cta: 'לסוגיות הפתוחות',
  },
  result: {
    eyebrow: 'ההתאמה הגבוהה ביותר שלך',
    percentWord: 'התאמה',
    share: 'שתפו את התוצאה',
    shareStory: 'תמונה לסטורי',
    map: 'תראו לי את המפה שלי',
    retake: 'עשו שוב',
    illustration: 'איור',
    /**
     * Disclosure wording follows the CEC chairman's 2026 rules on digitally generated content
     * (section 2א2, חוק הבחירות (דרכי תעמולה)), phrased for the specific part — the portrait.
     */
    aiDisclosure: 'הדיוקן נוצר באמצעי דיגיטלי ולא תועד במקור',
  },
  map: {
    title: 'המפה שלי',
    lede: 'המיקום שלך על ארבעת הצירים המרכזיים של הזירה.',
    abstained: 'הימנעות',
    back: 'חזרה לתוצאה',
    retake: 'עשו שוב',
  },
  toast: {
    downloaded: 'התמונה נשמרה והטקסט הועתק. אפשר להדביק ולשתף.',
    failed: 'לא הצלחנו להכין את התמונה. נסו שוב.',
  },
  footer: {
    methodology: 'מתודולוגיה',
    accessibility: 'הצהרת נגישות',
    back: 'חזרה',
  },
  methodology: {
    title: 'מתודולוגיה',
    paragraphs: [
      'המצפן ממקם משיבים על פני 12 סוגיות שנבחרו בקפידה, בתחומים שבהם השיח הציבורי בישראל סוער במיוחד.',
      'אחוז ההתאמה מחושב לפי הקרבה בין דפוס התשובות לבין שישה פרופילים פנימיים, שכל אחד מהם משויך לרשימה אחת. המצפן אינו בוחן את מצעי הרשימות, אינו מייצג את עמדותיהן, ולא פנה אליהן בשאלה כמה כריות נוי הן יותר מדי.',
      'ההתאמה אינה המלצת הצבעה. ההחלטה בקלפי נשארת שלכם.',
      'שמות הרשימות וראשיהן לקוחים מהרשימות שהוגשו לוועדת הבחירות המרכזית לכנסת ה־26.',
    ],
    portraits: 'הדיוקנאות באתר הם איורים שנוצרו בסיוע בינה מלאכותית על בסיס תצלומים פומביים. הם אינם צילומים.',
    privacy: 'התשובות נשמרות בדפדפן שלכם בלבד ואינן נשלחות לשום שרת.',
  },
  accessibility: {
    title: 'הצהרת נגישות',
    paragraphs: [
      'האתר נבנה מתוך מחויבות לאפשר שימוש שוויוני לכל המשתמשים, בהתאם להנחיות WCAG 2.1 ברמה AA ולתקן הישראלי 5568.',
      'בין השאר: ניווט מלא במקלדת, כולל בצירים; תמיכה בקוראי מסך; ניגודיות צבעים לפי התקן; טקסט שניתן להגדלה; וביטול אנימציות למי שהגדירו זאת במכשיר.',
      'נתקלתם בבעיית נגישות? נשמח לשמוע ולתקן.',
    ],
    // TODO(before release): name + email/phone of the accessibility contact (required by the regulations).
    contact: null as string | null,
    contactPending: 'פרטי הקשר לפניות בנושא נגישות יפורסמו כאן לפני העלייה לאוויר.',
    updated: 'עדכון אחרון: ספטמבר 2026',
  },
} as const;
