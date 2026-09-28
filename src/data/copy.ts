/**
 * All interface copy in one place (question and party texts live in their own files).
 * Address rule: plural ("אתם") or forms that are gender-neutral in writing ("שלך", "אותך").
 */
export const COPY = {
  productName: 'מחוץ למדגם',
  tagline: 'מצפן המפלגות הקטנות של בחירות 2026',
  mastheadMeta: 'בחירות לכנסת ה־26 · 27.10.2026',
  intro: {
    edition: 'גיליון בחירות מיוחד',
    lead: 'שאלונים שאומרים לכם לאיזו מפלגה להצביע זה נחמד.',
    body: 'אבל שמתם לב שהם אף פעם לא לוקחים בחשבון מפלגות כמו "הפיראטים"?',
    pullQuote: 'מעניין מאוד למה!',
    // "\n" = forced line break (see components/Phrased.tsx).
    closing: 'אז באנו לתקן.\nהנה השאלון שיגיד לכם מה המפלגה הקטנה\n(או אם תרצו, הבוטיקית)\nשהכי קרובה לדעותיכם!',
    question: 'מוכנים?',
    /** Ends on "מכוניות המחץ" so the aside below reads as being about them (rendered inline, never wrapped apart). */
    candidates: 'בואו נגלה אם אתם צריכים להצביע לפיראטים, לשרשר המלך, או אולי למכוניות המחץ',
    aside: '(אין מפלגה כזו, אבל תודו שזה כבר לא היה כזה מפתיע אם הייתה).',
    partiesLabel: 'המפלגות המשתתפות במצפן',
    start: 'מתחילים',
    resume: (n: number) => `להמשיך מהשאלה ${n}`,
    restart: 'להתחיל מחדש',
    toResult: 'לתוצאה שלך',
  },
  quiz: {
    progress: (n: number, total: number) => `שאלה ${n} מתוך ${total}`,
    next: 'המשך',
    back: 'הקודמת',
    skip: 'אין לי עמדה בנושא',
    sliderHint: 'גררו את הנקודה',
  },
  loading: {
    title: 'ממקמים אותך על המפה הפוליטית',
    lines: ['שיטת הבחירות', 'יוקר המחיה', 'חובת השירות', 'מדיניות החוץ'],
  },
  result: {
    eyebrow: 'זו המפלגה שהכי מתאימה לך',
    cardEyebrow: 'המפלגה שהכי מתאימה לי',
    percentWord: 'התאמה',
    runnersUp: 'ההתאמות הבאות',
    share: 'שתפו את התוצאה',
    platformLink: 'למצע המפלגה',
    profileLink: 'לעמוד המפלגה',
    retake: 'עשו שוב',
    /** The pill on every portrait: it says plainly that these are drawings, not photos. */
    illustration: 'איור',
    /** Instead of the pill, on the anonymous figure (no photo of the list's head exists). */
    noPhotoNote: 'וואלאק, לא מצאנו שום תמונה של ראש המפלגה',
    /** Flavor line for someone who skipped every question (they get the Pirates, see NO_OPINION_PARTY). */
    noOpinion:
      'לא הבעתם עמדה באף נושא. הפיראטים פונים בדיוק למי שאין לו בית פוליטי, ורוצים שגם פתק לבן ייספר, ככיסא ריק בכנסת.',
  },
  toast: {
    copied: 'הקישור הועתק. אפשר להדביק ולשתף.',
    failed: (link: string) => `לא הצלחנו להעתיק. זה הקישור: ${link}`,
  },
  share: {
    /** What a share says. The link (the quiz itself) goes next to it, and the chat shows its preview image. */
    /** Says what this is, names the party, adds its own punchline (parties.ts `sharePunch`), asks back. */
    message: (party: string, punch: string) =>
      `עשיתי את מצפן המפלגות הקטנות, והמפלגה שהכי מתאימה לי היא ${party}. ${punch}\nאיזו מפלגה קטנה מתאימה לכם?`,
    /** Someone who skipped everything still gets the Pirates (NO_OPINION_PARTY). */
    noOpinion: `עשיתי את מצפן המפלגות הקטנות בלי להביע אף עמדה, ועדיין יצאה לי מפלגה: הפיראטים. הם אומרים שהם בדיוק בשביל מי שאין לו בית פוליטי.\nאיזו מפלגה קטנה מתאימה לכם?`,
    menuLabel: 'שיתוף',
    targets: { whatsapp: 'וואטסאפ', facebook: 'פייסבוק', telegram: 'טלגרם', x: 'X', email: 'מייל' },
    copyLink: 'העתקת הקישור',
    /** The per-party pages /r/<slug>/ (older shared links) and their preview images. */
    title: (party: string) => `יצא לי: ${party}`,
    /** Three lines on the preview image; meta tags get it on one line (plain()). */
    description: 'השאלון שיגיד לכם מה המפלגה הקטנה\n(או אם תרצו, הבוטיקית)\nשהכי קרובה לדעותיכם.',
    cta: 'ומה יוצא לכם?',
    domain: 'lo-ovrot.fun',
    open: 'לשאלון',
  },
  footer: {
    methodology: 'איך זה עובד?',
    updated: 'עודכן בספטמבר 2026',
    back: 'חזרה',
  },
  methodology: {
    title: 'איך זה עובד?',
    paragraphs: [
      'כל תשובה במצפן היא עמדה שאחת הרשימות פרסמה: במצע, באתר שלה, בסרטון או בריאיון. ניסחנו את העמדות בקיצור ובמילים שלנו, והקישורים לכל המקורות מופיעים למטה.',
      'תשובה מזכה ב־3 נקודות את הרשימה שהעמדה שלה, ובנקודה או שתיים רשימה שמחזיקה בעמדה קרובה. בסליידרים כל רשימה ממוקמת בנקודה שמתאימה למה שפרסמה, ומקבלת נקודות לפי הקרבה אליה.',
      'אחוז ההתאמה מחושב מתוך הנקודות שהרשימה המובילה יכלה לקבל בשאלות שעניתם עליהן. האחוז של שתי המפלגות הבאות יחסי לניקוד שלהן.',
      'לחלק מהרשימות אין מצע כתוב ל־2026. אצלן השתמשנו במצעים הקודמים שלהן או בהצהרות של ראש הרשימה, והשנה מופיעה ליד המקור. הרשימות לא התבקשו לאשר את הניסוח.',
      'שמות הרשימות, ראשיהן ואותיות הפתק לקוחים מהרשימות שאישרה ועדת הבחירות המרכזית לכנסת ה־26.',
    ],
    portraits:
      'הדיוקנאות באתר הם איורים שנוצרו בסיוע בינה מלאכותית על בסיס תצלומים פומביים. הם אינם צילומים. לרשימה שלא נמצא לה צילום אמין מוצגת דמות אנונימית.',
    privacy: 'התשובות נשמרות בדפדפן שלכם בלבד ואינן נשלחות לשום שרת.',
    sourcesTitle: 'המקורות',
  },
} as const;
