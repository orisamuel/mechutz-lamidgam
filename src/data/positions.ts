import type { PartyId } from './partyIds';

/**
 * Where a position was published:
 * platform = the list's platform, charter or goals page · site = another page on the list's own site ·
 * video = the list's or its head's own video · interview = the head's words, as quoted by the press ·
 * profile = a neutral directory (bakalpi) · official = Elections Committee or party-registrar documents ·
 * press = reported by the press.
 */
export type SourceKind = 'platform' | 'site' | 'video' | 'interview' | 'profile' | 'official' | 'press';

export interface Position {
  party: PartyId;
  /** The position in one plain sentence, in our words (never presented as a quote). */
  text: string;
  url: string;
  /** Short label for the source list on the methodology page. */
  outlet: string;
  kind: SourceKind;
  /** When it was published, as precisely as known. Older platforms are marked by year on purpose. */
  date: string;
}

const PIRATES_PLATFORM = 'https://piratim.org/wiki/matza/';
const PIRATES_FLAG = 'https://piratim.org/flag/';
const PIRATES_QUIZ = 'https://piratim.org/games/quiz/';
const SEDER_2019 = 'https://www.idi.org.il/media/13111/%D7%A1%D7%93%D7%A8-%D7%97%D7%93%D7%A9.pdf';
const SEDER_2020 = 'https://www.idi.org.il/media/13908/%D7%A1%D7%93%D7%A8-%D7%97%D7%93%D7%A9.pdf';
const SEDER_2022 =
  'https://web.archive.org/web/20221207145303/https://seder-hadash.org/wp-content/uploads/2022/10/%D7%9E%D7%A6%D7%A2-%D7%9E%D7%A4%D7%9C%D7%92%D7%AA-%D7%A1%D7%93%D7%A8-%D7%97%D7%93%D7%A9-%D7%9C%D7%9E%D7%A2%D7%9F-%D7%94%D7%90%D7%96%D7%A8%D7%97%D7%99%D7%9D-%D7%94%D7%95%D7%95%D7%AA%D7%99%D7%A7%D7%99%D7%9D-%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C.pdf';
const ANI_CHARTER = 'https://drive.google.com/file/d/1l0Vot1NkSKIFyWqUJrnMweyIew7ToIJ8/view';
const GAN_EDEN_PLATFORM = 'https://www.ganeden.org.il/platform';
const SHARSHER_YNET = 'https://www.ynet.co.il/news/elections2026/article/rj4yfhnoze';
const SHARSHER_YNET_2 = 'https://www.ynet.co.il/news/elections2026/article/sjsnags00zg';
const SHARSHER_BAKALPI = 'https://www.bakalpi.co.il/he/parties/sharsher';
const HATIKUN_GOALS = 'https://hatikun.org.il/%d7%9e%d7%98%d7%a8%d7%95%d7%aa-%d7%94%d7%aa%d7%99%d7%a7%d7%95%d7%9f/';
const HATIKUN_HOME = 'https://hatikun.org.il/';

/**
 * Every published position the compass relies on. Answers and slider anchors point here, and a test
 * fails if a party gets points without a position of its own behind them. Checked 28.09.2026.
 */
export const POSITIONS = {
  // ── הפיראטים ─────────────────────────────────────────────
  'pirates/threshold': {
    party: 'pirates',
    text: 'ביטול אחוז החסימה, כדי שקולות שלא נשמעים ייכנסו לכנסת.',
    url: PIRATES_PLATFORM,
    outlet: 'המצע',
    kind: 'platform',
    date: '2026',
  },
  'pirates/blank-ballot': {
    party: 'pirates',
    text: 'פתק לבן ייספר כהצבעה לכיסא ריק בכנסת.',
    url: 'https://piratim.org/wiki/shealot/',
    outlet: 'שאלות ותשובות',
    kind: 'site',
    date: '2026',
  },
  'pirates/liquid-democracy': {
    party: 'pirates',
    text: 'כל אזרח יוכל להצביע ישירות על כל חוק, או להאציל את קולו ולקחת אותו בחזרה בכל רגע.',
    url: PIRATES_QUIZ,
    outlet: 'החידון באתר',
    kind: 'site',
    date: '2026',
  },
  'pirates/every-shekel': {
    party: 'pirates',
    text: 'כל שקל של כספי ציבור גלוי ברשת בזמן אמת, כולל הקבלות של הקייטרינג.',
    url: PIRATES_QUIZ,
    outlet: 'החידון באתר',
    kind: 'site',
    date: '2026',
  },
  'pirates/cameras': {
    party: 'pirates',
    text: 'נגד רשת מצלמות לזיהוי פנים ברחובות: שיעקבו אחרי נבחרי הציבור, לא אחרי האזרחים.',
    url: PIRATES_QUIZ,
    outlet: 'החידון באתר',
    kind: 'site',
    date: '2026',
  },
  'pirates/copying': {
    party: 'pirates',
    text: 'העתקה ושיתוף של ידע אינם גניבה.',
    url: PIRATES_QUIZ,
    outlet: 'החידון באתר',
    kind: 'site',
    date: '2026',
  },
  'pirates/free-services': {
    party: 'pirates',
    text: 'חינוך ובריאות חינם במוסדות ממשלתיים, והעלאת המשכורות בהם כעדיפות לאומית.',
    url: PIRATES_FLAG,
    outlet: 'הדגל',
    kind: 'platform',
    date: '2026',
  },
  'pirates/free-internet': {
    party: 'pirates',
    text: 'אינטרנט מהיר חינם לכל, כזכות דמוקרטית בסיסית.',
    url: PIRATES_FLAG,
    outlet: 'הדגל',
    kind: 'platform',
    date: '2026',
  },
  'pirates/lifecycle': {
    party: 'pirates',
    text: 'שירותים לאזרח לכל מחזור החיים, מלידה ועד אחרית הימים.',
    url: PIRATES_PLATFORM,
    outlet: 'המצע',
    kind: 'platform',
    date: '2026',
  },
  'pirates/peace': {
    party: 'pirates',
    text: 'שלום בין כל יושבי הארץ. פרק הביטחון במצע ריק.',
    url: PIRATES_PLATFORM,
    outlet: 'המצע',
    kind: 'platform',
    date: '2026',
  },
  'pirates/lobbying': {
    party: 'pirates',
    text: 'שקיפות בקבלת ההחלטות, וגם לגבי האינטרסים והכוחות שפועלים לקדם אותן.',
    url: PIRATES_PLATFORM,
    outlet: 'המצע',
    kind: 'platform',
    date: '2026',
  },
  'pirates/equality': {
    party: 'pirates',
    text: 'שוויון לכל אדם, ללא הבדל דת, גזע, מין או מערכת הפעלה.',
    url: PIRATES_PLATFORM,
    outlet: 'המצע',
    kind: 'platform',
    date: '2026',
  },
  'pirates/political-home': {
    party: 'pirates',
    text: 'מי שיש לו בית פוליטי מתבקש להצביע לו. הפיראטים פונים למי שאין לו.',
    url: 'https://piratim.org/',
    outlet: 'דף הבית',
    kind: 'site',
    date: '2026',
  },

  // ── סדר חדש ─────────────────────────────────────────────
  'seder-chadash/direct-pm': {
    party: 'seder-chadash',
    text: 'בחירה ישירה של ראש הממשלה ברוב של יותר מ־50%, ואם אין רוב, סיבוב שני. גם שם הרשימה ב־2026 כולל בחירות ישירות.',
    url: SEDER_2020,
    outlet: 'מצע 2020',
    kind: 'platform',
    date: '2020',
  },
  'seder-chadash/regional': {
    party: 'seder-chadash',
    text: 'בחירות אישיות ואזוריות לכנסת, בלי רשימות מפלגתיות ארציות.',
    url: SEDER_2020,
    outlet: 'מצע 2020',
    kind: 'platform',
    date: '2020',
  },
  'seder-chadash/ministers': {
    party: 'seder-chadash',
    text: 'ראש הממשלה ימנה 11 שרים מקצועיים שאינם חברי כנסת.',
    url: SEDER_2019,
    outlet: 'מצע 2019',
    kind: 'platform',
    date: '2019',
  },
  'seder-chadash/term-limit': {
    party: 'seder-chadash',
    text: 'ראש ממשלה יכהן לכל היותר שתי קדנציות רצופות.',
    url: SEDER_2020,
    outlet: 'מצע 2020',
    kind: 'platform',
    date: '2020',
  },
  'seder-chadash/separation': {
    party: 'seder-chadash',
    text: 'חוקה והפרדת רשויות: כך נקראת הרשימה ב־2026.',
    url: 'https://www.idi.org.il/media/32331/%D7%A1%D7%93%D7%A8-%D7%97%D7%93%D7%A9.pdf',
    outlet: 'הרשימה בוועדת הבחירות',
    kind: 'official',
    date: '2026-09-07',
  },
  'seder-chadash/calendars': {
    party: 'seder-chadash',
    text: 'לוחות הפגישות של כל נבחרי הציבור והבכירים יהיו גלויים לציבור, וספרי התקציב פתוחים עד השקל.',
    url: SEDER_2020,
    outlet: 'מצע 2020',
    kind: 'platform',
    date: '2020',
  },
  'seder-chadash/train-rentals': {
    party: 'seder-chadash',
    text: 'בכל עיר עם תחנת רכבת המדינה תבנה מגדלים עם דירות בשכירות ארוכת טווח וזולה לזוגות צעירים.',
    url: SEDER_2020,
    outlet: 'מצע 2020',
    kind: 'platform',
    date: '2020',
  },
  'seder-chadash/drug-basket': {
    party: 'seder-chadash',
    text: 'הגדלת סל התרופות מצילות החיים, ותוספת תקנים לרופאים ולאחיות.',
    url: SEDER_2020,
    outlet: 'מצע 2020',
    kind: 'platform',
    date: '2020',
  },
  'seder-chadash/alt-medicine': {
    party: 'seder-chadash',
    text: 'הקמה מסיבית של מרפאות לטיפול משלים אלטרנטיבי.',
    url: SEDER_2020,
    outlet: 'מצע 2020',
    kind: 'platform',
    date: '2020',
  },
  'seder-chadash/allowances': {
    party: 'seder-chadash',
    text: 'העלאת קצבאות הזקנה והסיעוד, ודאגה לנכים ולניצולי השואה.',
    url: SEDER_2020,
    outlet: 'מצע 2020',
    kind: 'platform',
    date: '2020',
  },
  'seder-chadash/pension': {
    party: 'seder-chadash',
    text: 'קצבת זקנה בגובה שכר המינימום.',
    url: SEDER_2022,
    outlet: 'מצע 2022',
    kind: 'platform',
    date: '2022',
  },
  'seder-chadash/no-false-promises': {
    party: 'seder-chadash',
    text: 'המצע נפתח בהצהרה שהמפלגה לא תבטיח הבטחות שווא, כי בשיטה הנוכחית אף מפלגה לא יכולה לקיים אותן.',
    url: SEDER_2020,
    outlet: 'מצע 2020',
    kind: 'platform',
    date: '2020',
  },

  // ── אני ואתה ─────────────────────────────────────────────
  'ani-veata/threshold': {
    party: 'ani-veata',
    text: 'ביטול אחוז החסימה או הורדה משמעותית שלו.',
    url: ANI_CHARTER,
    outlet: 'אמנת היסוד',
    kind: 'platform',
    date: '2016',
  },
  'ani-veata/social-service': {
    party: 'ani-veata',
    text: 'שוויון בנטל: כל מי שלא מתגייס, כולל חרדים וערבים, יעשה "שירות ישראלי חברתי".',
    url: 'https://youtu.be/MPoyuwJi6ZY',
    outlet: 'יוטיוב: שירות חברתי',
    kind: 'video',
    date: '2026-08-17',
  },
  'ani-veata/state-enterprises': {
    party: 'ani-veata',
    text: 'מפעלים ממשלתיים בענפים חיוניים שיקבעו רף למחירים ולשכר, ופיקוח מחירים על מוצרים חיוניים.',
    url: ANI_CHARTER,
    outlet: 'אמנת היסוד',
    kind: 'platform',
    date: '2016',
  },
  'ani-veata/free-education': {
    party: 'ani-veata',
    text: 'חינוך חינם מהגן ועד סוף התואר.',
    url: ANI_CHARTER,
    outlet: 'אמנת היסוד',
    kind: 'platform',
    date: '2016',
  },
  'ani-veata/free-land': {
    party: 'ani-veata',
    text: 'המדינה תבנה ותחלק קרקעות, כך שלכל אזרח תהיה קרקע ראשונה או דירה ראשונה בחינם.',
    url: 'https://youtu.be/op71SGTHEB8',
    outlet: 'יוטיוב: דירה ראשונה',
    kind: 'video',
    date: '2026-09-10',
  },
  'ani-veata/drug-authority': {
    party: 'ani-veata',
    text: 'רשות ממשלתית לפיתוח תרופות ואמצעי רפואה, בדומה לרפאל.',
    url: 'https://youtu.be/8fDxSgRzc9E',
    outlet: 'יוטיוב: פיתוח תרופות',
    kind: 'video',
    date: '2026-09-10',
  },
  'ani-veata/blackboard': {
    party: 'ani-veata',
    text: 'חזרה ללמידה על הלוח בשילוב האינטרנט, ויום לימודים ארוך.',
    url: ANI_CHARTER,
    outlet: 'אמנת היסוד',
    kind: 'platform',
    date: '2016',
  },
  'ani-veata/capital-government': {
    party: 'ani-veata',
    text: 'הפרדה בין בעלי ההון לרשויות הציבור, גם אחרי שעובדי ציבור מסיימים את תפקידם.',
    url: ANI_CHARTER,
    outlet: 'אמנת היסוד',
    kind: 'platform',
    date: '2016',
  },
  'ani-veata/peace-referendum': {
    party: 'ani-veata',
    text: 'כל הסכם שלום יובא למשאל עם.',
    url: ANI_CHARTER,
    outlet: 'אמנת היסוד',
    kind: 'platform',
    date: '2016',
  },
  'ani-veata/fourth-branch': {
    party: 'ani-veata',
    text: 'רשות רביעית: רשות חברתית עצמאית שתייצג את המעמד הנמוך והבינוני לצד שלוש הרשויות.',
    url: 'https://youtu.be/hZ-NBydJWNo',
    outlet: 'יוטיוב: הרשות הרביעית',
    kind: 'video',
    date: '2026-05-20',
  },
  'ani-veata/polls': {
    party: 'ani-veata',
    text: 'סקרים צריכים להציג לנשאלים את כל הרשימות, ולא רק את הגדולות ו"אחר".',
    url: 'https://youtu.be/BlDde2KQUrc',
    outlet: 'יוטיוב: הסקרים',
    kind: 'video',
    date: '2026-06-23',
  },

  // ── גן עדן ─────────────────────────────────────────────
  'gan-eden/pm-finance': {
    party: 'gan-eden',
    text: 'יו"ר הרשימה מתמודד לראשות הממשלה ולתפקיד שר האוצר.',
    url: 'https://www.ganeden.org.il/team',
    outlet: 'דף הנבחרת',
    kind: 'site',
    date: '2026',
  },
  'gan-eden/digital-democracy': {
    party: 'gan-eden',
    text: 'מערכת הצבעות ציבורית מאובטחת שבה האזרחים מציעים חוקים וקובעים סדרי עדיפויות.',
    url: GAN_EDEN_PLATFORM,
    outlet: 'המצע',
    kind: 'platform',
    date: '2026',
  },
  'gan-eden/jubilee': {
    party: 'gan-eden',
    text: 'תוכנית "היובל הלאומי" החל מ־1.1.2027, עם שמיטה מדורגת של חובות שאי אפשר להחזיר ושל ריביות חריגות.',
    url: GAN_EDEN_PLATFORM,
    outlet: 'המצע',
    kind: 'platform',
    date: '2026',
  },
  'gan-eden/basic-wage': {
    party: 'gan-eden',
    text: 'שכר בסיס לקיום בכבוד לכל אזרח, ושקל דיגיטלי ציבורי לחלוקת "השפע הלאומי".',
    url: GAN_EDEN_PLATFORM,
    outlet: 'המצע',
    kind: 'platform',
    date: '2026',
  },
  'gan-eden/housing': {
    party: 'gan-eden',
    text: 'דיור בר השגה ושחרור של חסמים תכנוניים.',
    url: GAN_EDEN_PLATFORM,
    outlet: 'המצע',
    kind: 'platform',
    date: '2026',
  },
  'gan-eden/trauma': {
    party: 'gan-eden',
    text: 'חוק ריפוי הטראומה הלאומית: תוכנית לאומית לטיפול בפוסט־טראומה, בחרדה ובבדידות.',
    url: GAN_EDEN_PLATFORM,
    outlet: 'המצע',
    kind: 'platform',
    date: '2026',
  },
  'gan-eden/education': {
    party: 'gan-eden',
    text: 'חוק חינוך האדם השלם: חינוך פיננסי מגיל צעיר, לימודי משפט וכלכלה, מלאכה, חקלאות ומוזיקה, וחיזוק מעמד המורים.',
    url: GAN_EDEN_PLATFORM,
    outlet: 'המצע',
    kind: 'platform',
    date: '2026',
  },
  'gan-eden/clean-government': {
    party: 'gan-eden',
    text: 'אחריות אישית של נושאי משרה על שחיתות ורשלנות, ותקרת שכר לבכירי הציבור.',
    url: GAN_EDEN_PLATFORM,
    outlet: 'המצע',
    kind: 'platform',
    date: '2026',
  },
  'gan-eden/peace-ministry': {
    party: 'gan-eden',
    text: 'משרד השלום והפיוס הלאומי, לצד ביטחון נחוש ושמירה על מוסר הלחימה.',
    url: GAN_EDEN_PLATFORM,
    outlet: 'המצע',
    kind: 'platform',
    date: '2026',
  },
  'gan-eden/living-temple': {
    party: 'gan-eden',
    text: 'חוק יסוד: האדם כמקדש חי. הכרה חוקתית בכבוד האדם, בחירותו, בגופו, בנפשו, במשפחתו, באמונתו ובקניינו.',
    url: GAN_EDEN_PLATFORM,
    outlet: 'המצע',
    kind: 'platform',
    date: '2026',
  },
  'gan-eden/letters': {
    party: 'gan-eden',
    text: 'הרשימה ביקשה את האותיות "יה", וועדת הבחירות סירבה וקבעה "ה".',
    url: 'https://www.walla.co.il/news/politics/383955473',
    outlet: 'וואלה',
    kind: 'press',
    date: '2026-09-27',
  },

  // ── שרשר ─────────────────────────────────────────────
  'sharsher/pm-netanyahu': {
    party: 'sharsher',
    text: 'שרשר מתמודד לראשות הממשלה, ובממשלה שלו נתניהו יהיה שר החוץ.',
    url: SHARSHER_YNET,
    outlet: 'ynet',
    kind: 'interview',
    date: '2026-09-07',
  },
  'sharsher/money-order': {
    party: 'sharsher',
    text: 'העם צמא לכסף, ושרשר בא לעשות סדר.',
    url: SHARSHER_YNET,
    outlet: 'ynet',
    kind: 'interview',
    date: '2026-09-07',
  },
  'sharsher/draft': {
    party: 'sharsher',
    text: 'מוכן לשבת עם החרדים: מי שלומד, שילמד, ומי שלא לומד, שילך לשרת.',
    url: 'https://www.kikar.co.il/political-news/tkzyl4',
    outlet: 'כיכר השבת',
    kind: 'interview',
    date: '2026-09-07',
  },
  'sharsher/drug-basket': {
    party: 'sharsher',
    text: 'הרחבת סל התרופות בתרופות מצילות חיים.',
    url: SHARSHER_YNET_2,
    outlet: 'ynet',
    kind: 'interview',
    date: '2026-09-06',
  },
  'sharsher/trauma': {
    party: 'sharsher',
    text: 'להיות הפה של מאות אלפי פוסט־טראומטיים והלומי קרב.',
    url: SHARSHER_YNET,
    outlet: 'ynet',
    kind: 'interview',
    date: '2026-09-07',
  },
  'sharsher/vision': {
    party: 'sharsher',
    text: 'החזון: הלומי קרב ומשפחותיהם, ניצולי שואה, ילדים ובני נוער שסובלים מחרם, והרחבת סל התרופות.',
    url: SHARSHER_BAKALPI,
    outlet: 'בקלפי',
    kind: 'profile',
    date: '2026-09-21',
  },
  'sharsher/boycotts': {
    party: 'sharsher',
    text: 'מאבק בחרמות חברתיים על ילדים ובני נוער.',
    url: SHARSHER_YNET_2,
    outlet: 'ynet',
    kind: 'interview',
    date: '2026-09-06',
  },
  'sharsher/crown-trump': {
    party: 'sharsher',
    text: 'יגיע לבית הלבן ויעניד לנשיא טראמפ את הכתר שלו.',
    url: 'https://www.mako.co.il/tv-avri_and_sherki/articles/Article-df80d373ebd70a1026.htm',
    outlet: 'mako',
    kind: 'interview',
    date: '2026-09-08',
  },

  // ── התיקון ─────────────────────────────────────────────
  'hatikun/no-parties': {
    party: 'hatikun',
    text: 'ביטול מוסד המפלגות והוצאתן מחוץ לחוק, וכל חבר כנסת נבחר אישית באזור שלו.',
    url: HATIKUN_HOME,
    outlet: 'אתר הרשימה',
    kind: 'platform',
    date: '2026-09-16',
  },
  'hatikun/pm-ceo': {
    party: 'hatikun',
    text: 'ראש הממשלה לא נבחר ישירות: נבחרי הציבור ממנים אותו לפי כישורים, כמו דירקטוריון שממנה מנכ"ל.',
    url: 'https://hatikun.org.il/?p=1132',
    outlet: 'ממשלה מקצועית',
    kind: 'site',
    date: '2026-07-15',
  },
  'hatikun/targets': {
    party: 'hatikun',
    text: 'ביטול המושג קדנציה: שרים ממשיכים כל עוד הם עומדים ביעדים מדידים, ומוחלפים כשלא.',
    url: HATIKUN_HOME,
    outlet: 'אתר הרשימה',
    kind: 'platform',
    date: '2026-09-16',
  },
  'hatikun/housing-target': {
    party: 'hatikun',
    text: 'הגדלת היצע הדיור והורדת מחירי הדיור כיעד לאומי מדיד של הממשלה.',
    url: 'https://hatikun.org.il/?p=1138',
    outlet: 'ניהול לפי יעדים',
    kind: 'site',
    date: '2026-07-15',
  },
  'hatikun/referendums': {
    party: 'hatikun',
    text: 'משאלי עם בסוגיות לאומיות מרכזיות, בהצבעה דיגיטלית מאובטחת.',
    url: 'https://hatikun.org.il/?p=1135',
    outlet: 'משאלי עם',
    kind: 'site',
    date: '2026-07-15',
  },
  'hatikun/peace-referendum': {
    party: 'hatikun',
    text: 'הסכמי שלום וויתורים טריטוריאליים יוכרעו במשאל עם, ולא בידי פוליטיקאים בלבד.',
    url: 'https://hatikun.org.il/?p=1135',
    outlet: 'משאלי עם',
    kind: 'site',
    date: '2026-07-15',
  },
  'hatikun/service-vote': {
    party: 'hatikun',
    text: 'חובת שירות לכל אזרח (צבאי, לאומי או תרומה משמעותית אחרת), והתניית זכות הבחירה בעמידה בה.',
    url: HATIKUN_GOALS,
    outlet: 'מטרות התיקון',
    kind: 'platform',
    date: '2026-08-10',
  },
  'hatikun/soldiers': {
    party: 'hatikun',
    text: 'הטבות משמעותיות לחיילי חובה, למשוחררים ולמשרתי המילואים.',
    url: 'https://www.gov.il/BlobFolder/news/the-correction/he/parties_The-correction.pdf',
    outlet: 'בקשת הרישום',
    kind: 'official',
    date: '2025',
  },
  'hatikun/constitution': {
    party: 'hatikun',
    text: 'חוק יסוד שיבסס חוקה על שוויון, על חירות ועל ערכי מגילת העצמאות.',
    url: HATIKUN_GOALS,
    outlet: 'מטרות התיקון',
    kind: 'platform',
    date: '2026-08-10',
  },
  'hatikun/obsolete': {
    party: 'hatikun',
    text: 'אם השיטה תשתנה, גם "התיקון" עצמה תהפוך ללא רלוונטית ותסיים את דרכה.',
    url: 'https://hatikun.org.il/?p=757',
    outlet: 'למה מסכות',
    kind: 'site',
    date: '2026-06-28',
  },
} as const satisfies Record<string, Position>;

export type PositionId = keyof typeof POSITIONS;

export function positionById(id: PositionId): Position {
  return POSITIONS[id];
}
