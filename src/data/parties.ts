import type { PartyId } from './partyIds';
import type { PositionId } from './positions';

/** When a party's flavor line is true for this user (any-of). */
export type FlavorCondition =
  | { type: 'always' }
  | { type: 'choice'; questionId: string; optionIds: string[] }
  | { type: 'axisBand'; questionId: string; bands: number[] };

export interface Party {
  /** Slug. Also the scoring key, the portrait file name and the future /r/<slug> share page. */
  id: PartyId;
  /** Headline name. */
  name: string;
  /** Name inside a sentence: "כמו {shortName}, גם אתם בעד…". */
  shortName: string;
  /** Name as submitted to the Central Elections Committee — printed on the ballot slip. */
  officialName: string;
  leader: string;
  leaderRole: string;
  /** Ballot letters. Only ever set from a verified Elections Committee source. */
  letters: string | null;
  /** Path under public/, e.g. 'party-leaders/pirates.webp'. null → typographic ballot slip only. */
  portrait: string | null;
  /** True when no reliable photo exists and the portrait is a deliberately anonymous figure. */
  portraitAnonymous?: boolean;
  /** Official platform page or homepage, when one exists. */
  website: { url: string; kind: 'platform' | 'profile' } | null;
  title: string;
  /**
   * What the list stands for, in our words, backed by positions.ts. One is picked per answer set.
   * Built as "במצע של X: …" so it never has to guess a list's grammatical gender.
   */
  bodies: string[];
  /** A true, citable detail about the list, shown under the body when the condition holds. */
  flavor: { text: string; when: FlavorCondition[] };
  /** The punchline in a shared result: "…המפלגה שהכי מתאימה לי היא X. {sharePunch}". Must stay true to `basis`. */
  sharePunch: string;
  /** The positions behind every claim in `bodies` and `flavor`. */
  basis: PositionId[];
}

// Letters and approved names: CEC approval of 27.09.2026, as quoted identically by 8 news outlets
// (ynet, i24, Kipa, Srugim, Arutz 7, N12, ice, zman). The CEC site itself was unreachable from here.
// TODO(before release): confirm against the CEC primary source; check the spellings שוילי / שווילי
// and סלומוביץ (candidate list) / סלמוביץ (the list's own site).
export const PARTIES: Party[] = [
  {
    id: 'pirates',
    name: 'הפיראטים',
    shortName: 'הפיראטים',
    officialName: 'הפיראטים – צפים לטוב',
    leader: 'אוהד יעקב שם טוב',
    leaderRole: 'ראש הרשימה',
    letters: 'צף',
    portrait: 'party-leaders/pirates.webp',
    website: { url: 'https://piratim.org/wiki/matza/', kind: 'platform' },
    title: 'הרוח נכנסה למפרש.',
    bodies: [
      'במצע של הפיראטים: כל אזרח מצביע בעצמו על כל חוק, כל שקל ציבורי גלוי ברשת בזמן אמת, ואין מצלמות לזיהוי פנים ברחובות.',
      'במצע של הפיראטים: ביטול אחוז החסימה, אינטרנט מהיר בחינם לכולם, והכרה בכך שהעתקה ושיתוף של ידע אינם גניבה.',
    ],
    flavor: {
      text: 'הפיראטים מבקשים ממי שיש לו בית פוליטי ללכת לשם. מסתבר שהבית שלכם כאן.',
      when: [{ type: 'always' }],
    },
    sharePunch: 'הם מבקשים ממי שיש לו בית פוליטי ללכת לשם, אז כנראה שאין לי.',
    basis: ['pirates/liquid-democracy', 'pirates/every-shekel', 'pirates/cameras', 'pirates/threshold', 'pirates/free-internet', 'pirates/copying', 'pirates/political-home'],
  },
  {
    id: 'seder-chadash',
    name: 'סדר חדש',
    shortName: 'סדר חדש',
    officialName: 'סדר חדש לכינון חוקה, להפרדת רשויות ולבחירות ישירות',
    leader: 'עו"ד אביטל חי אופק',
    leaderRole: 'ראש הרשימה', // brief said ראשת; every source uses masculine forms for him
    letters: 'קך',
    portrait: 'party-leaders/seder-chadash.webp',
    website: { url: 'https://www.bakalpi.co.il/he/parties/seder-chadash', kind: 'profile' },
    title: 'סוף סוף מישהו עושה פה סדר.',
    bodies: [
      'במצע של סדר חדש: בחירה ישירה של ראש הממשלה, 11 שרים מקצועיים שאינם חברי כנסת, ולכל היותר שתי קדנציות לראש ממשלה.',
      'במצע של סדר חדש: כל אזור בוחר את הנציגים שלו, היומנים של נבחרי הציבור גלויים לכולם, וליד כל תחנת רכבת יש מגדלי שכירות לזוגות צעירים.',
    ],
    flavor: { text: 'המצע שלהם נפתח בהבטחה אחת: לא להבטיח הבטחות שווא.', when: [{ type: 'always' }] },
    sharePunch: 'הם מבטיחים לא להבטיח הבטחות שווא, וזה כבר יותר ממה שקיבלתי מכל השאר.',
    basis: ['seder-chadash/direct-pm', 'seder-chadash/ministers', 'seder-chadash/term-limit', 'seder-chadash/regional', 'seder-chadash/calendars', 'seder-chadash/train-rentals', 'seder-chadash/no-false-promises'],
  },
  {
    id: 'ani-veata',
    name: 'אני ואתה',
    shortName: 'אני ואתה',
    officialName: 'אני ואתה – מפלגת העם הישראלית',
    leader: 'ד"ר אלון גלעדי',
    leaderRole: 'ראש הרשימה',
    letters: 'פה',
    portrait: 'party-leaders/ani-veata.webp',
    website: { url: 'https://www.bakalpi.co.il/he/parties/ani-veata', kind: 'profile' },
    title: 'תשובה אחת. זמן אחד. מקום אחד.',
    bodies: [
      'במצע של אני ואתה: הפרדה בין ההון לשלטון, קרקע ראשונה או דירה ראשונה בחינם לכל אזרח, ורשות רביעית שתייצג את המעמד הנמוך והבינוני.',
      'במצע של אני ואתה: מפעלים ממשלתיים שיקבעו רף למחירים, רשות ממשלתית לפיתוח תרופות, וחינוך חינם מהגן ועד סוף התואר.',
    ],
    flavor: {
      text: 'אני ואתה גם דורשים שהסקרים יציגו את כל הרשימות, ולא רק את הגדולות ו"אחר".',
      when: [{ type: 'always' }],
    },
    sharePunch: 'בינתיים זה בעיקר אני.',
    basis: ['ani-veata/capital-government', 'ani-veata/free-land', 'ani-veata/fourth-branch', 'ani-veata/state-enterprises', 'ani-veata/drug-authority', 'ani-veata/free-education', 'ani-veata/polls'],
  },
  {
    id: 'gan-eden',
    name: 'גן עדן',
    shortName: 'גן עדן',
    officialName: 'גן עדן בראשות ישוע ישראל בן דוד',
    leader: 'ישוע ישראל בן דוד',
    leaderRole: 'ראש הרשימה',
    letters: 'ה',
    portrait: 'party-leaders/gan-eden.webp',
    website: { url: 'https://www.ganeden.org.il/platform', kind: 'platform' },
    title: 'ישראל יכולה להיות גן עדן.',
    bodies: [
      'במצע של גן עדן: יובל לאומי שמתחיל ב־1.1.2027, שמיטת חובות, שכר בסיס לכל אזרח ושקל דיגיטלי ציבורי.',
      'במצע של גן עדן: משרד לשלום ולפיוס, חוק יסוד: האדם כמקדש חי, ותקרת שכר לבכירי הציבור.',
    ],
    flavor: { text: 'על הפתק היה אמור להיות כתוב יה. ועדת הבחירות אישרה רק ה.', when: [{ type: 'always' }] },
    sharePunch: 'יש להם כבר תאריך לשמיטת החובות, 1.1.2027, ואצלי זה כבר ביומן.',
    basis: ['gan-eden/jubilee', 'gan-eden/basic-wage', 'gan-eden/peace-ministry', 'gan-eden/living-temple', 'gan-eden/clean-government', 'gan-eden/letters'],
  },
  {
    id: 'sharsher',
    name: 'שרשר לאהבה ואחדות העם',
    shortName: 'שרשר',
    officialName: 'שרשר לאהבה ואחדות העם',
    leader: 'איתן שוילי',
    leaderRole: 'ראש הרשימה',
    letters: 'צדק',
    portrait: 'party-leaders/sharsher.webp',
    website: { url: 'https://www.bakalpi.co.il/he/parties/sharsher', kind: 'profile' },
    title: 'יש מי שיאחד את העם.',
    bodies: [
      'בהצהרות של שרשר: לאחד את העם, להרחיב את סל התרופות ולהילחם בחרמות על ילדים ובני נוער. את נתניהו הוא מבטיח למנות לשר החוץ.',
      'בהצהרות של שרשר: להיות הפה של הלומי הקרב, של ניצולי השואה ושל ילדים שסובלים מחרם. ומי שלומד תורה, שימשיך ללמוד.',
    ],
    flavor: {
      text: 'שרשר גם הבטיח להגיע לבית הלבן ולהעניק לטראמפ את הכתר שלו.',
      when: [{ type: 'always' }],
    },
    sharePunch: 'אם הוא ייבחר, טראמפ מקבל כתר ונתניהו מקבל את משרד החוץ.',
    basis: ['sharsher/vision', 'sharsher/drug-basket', 'sharsher/boycotts', 'sharsher/pm-netanyahu', 'sharsher/trauma', 'sharsher/draft', 'sharsher/crown-trump'],
  },
  {
    id: 'hatikun',
    name: 'התיקון',
    shortName: 'התיקון',
    officialName: 'התיקון לשיטת הבחירות והממשל',
    leader: 'משה סלומוביץ',
    leaderRole: 'ראש הרשימה',
    letters: 'נקי',
    portrait: 'party-leaders/hatikun.webp',
    portraitAnonymous: true, // no reliable photo exists
    website: {
      url: 'https://hatikun.org.il/%d7%9e%d7%98%d7%a8%d7%95%d7%aa-%d7%94%d7%aa%d7%99%d7%a7%d7%95%d7%9f/',
      kind: 'platform',
    },
    title: 'קודם נחליט איך מחליטים.',
    bodies: [
      'במצע של התיקון: כנסת בלי מפלגות, ראש ממשלה שממונה לפי כישורים כמו מנכ"ל, ושרים שממשיכים רק כל עוד הם עומדים ביעדים.',
      'במצע של התיקון: כל חבר כנסת נבחר אישית באזור שלו, משאל עם על ההכרעות הגדולות, וזכות בחירה למי שעמד בחובת השירות.',
    ],
    flavor: {
      text: 'ואם השיטה תשתנה, גם התיקון עצמה מתכננת להפוך ללא רלוונטית.',
      when: [{ type: 'always' }],
    },
    sharePunch: 'הם רוצים לבטל את כל המפלגות, כולל את עצמם. סוף סוף מישהו עקבי.',
    basis: ['hatikun/no-parties', 'hatikun/pm-ceo', 'hatikun/targets', 'hatikun/referendums', 'hatikun/service-vote', 'hatikun/obsolete'],
  },
];

export function partyById(id: PartyId): Party {
  const party = PARTIES.find((p) => p.id === id);
  if (!party) throw new Error(`Unknown party ${id}`);
  return party;
}
