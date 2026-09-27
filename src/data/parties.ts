import type { ArchetypeId } from './archetypes';

/** When a party's flavor line is true for this user (any-of). */
export type FlavorCondition =
  | { type: 'always' }
  | { type: 'choice'; questionId: string; optionIds: string[] }
  | { type: 'axisBand'; questionId: string; bands: number[] };

export interface Party {
  /** Slug. Also the portrait file name and the future /r/<slug> share page. */
  id: string;
  archetype: ArchetypeId;
  /** Headline name. */
  name: string;
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
  /** Picked deterministically per answer set. Describe the user, never the list's platform. */
  bodies: string[];
  flavor: { text: string; when: FlavorCondition[] };
}

// Letters and approved names: CEC approval of 27.09.2026, as quoted identically by 8 news outlets
// (ynet, i24, Kipa, Srugim, Arutz 7, N12, ice, zman). The CEC site itself was unreachable from here.
// TODO(before release): confirm against the CEC primary source; check the spelling שוילי / שווילי.
export const PARTIES: Party[] = [
  {
    id: 'pirates',
    archetype: 'digital_autonomy',
    name: 'הפיראטים',
    officialName: 'הפיראטים – צפים לטוב',
    leader: 'אוהד יעקב שם טוב',
    leaderRole: 'ראש הרשימה',
    letters: 'צף',
    portrait: 'party-leaders/pirates.webp',
    website: { url: 'https://piratim.org/wiki/matza/', kind: 'platform' },
    title: 'אין צורך להמשיך לחפש.',
    bodies: [
      'אתם מאמינים בחופש הפרט, בכפתורים ברורים ובזכות הבסיסית לא להאזין להודעה קולית של 4:38.',
      'אתם מעדיפים מערכות שאפשר להבין, אנשים שאפשר להשתיק והתראות שאפשר לבטל.',
    ],
    flavor: {
      text: 'בנושא המעלית נמצאה ביניכם תמימות דעים.',
      when: [{ type: 'choice', questionId: 'q5', optionIds: ['a', 'd'] }],
    },
  },
  {
    id: 'seder-chadash',
    archetype: 'procedural_order',
    name: 'סדר חדש',
    officialName: 'סדר חדש לכינון חוקה, להפרדת רשויות ולבחירות ישירות',
    leader: 'עו"ד אביטל חי אופק',
    leaderRole: 'ראש הרשימה', // brief said ראשת; every source uses masculine forms for him
    letters: 'קך',
    portrait: 'party-leaders/seder-chadash.webp',
    website: { url: 'https://www.bakalpi.co.il/he/parties/seder-chadash', kind: 'profile' },
    title: 'סוף סוף מישהו עושה פה סדר.',
    bodies: [
      'קשה לכם עם עמימות, "בערך", אנשים שלא מאשרים הגעה והעובדה שעדיין אין הגדרה מוסכמת ל"עוד מעט".',
      'אתם מאמינים שלכל תור יש סוף, לכל כפתור יש מצב, ולכל "נדבר" צריך להיות תאריך.',
    ],
    flavor: {
      text: 'התאמה גבוהה במיוחד בסוגיות זמן, תורים וכפתורים שכבר נלחצו.',
      when: [
        { type: 'choice', questionId: 'q3', optionIds: ['a'] },
        { type: 'choice', questionId: 'q5', optionIds: ['c'] },
      ],
    },
  },
  {
    id: 'ani-veata',
    archetype: 'human_consensus',
    name: 'אני ואתה',
    officialName: 'אני ואתה – מפלגת העם הישראלית',
    leader: 'ד"ר אלון גלעדי',
    leaderRole: 'ראש הרשימה',
    letters: 'פה',
    portrait: 'party-leaders/ani-veata.webp',
    website: { url: 'https://www.bakalpi.co.il/he/parties/ani-veata', kind: 'profile' },
    title: 'אפשר עדיין לפתור את זה בינינו.',
    bodies: [
      'לפני תקן, אפליקציה או ועדה, אתם מעדיפים שמישהו פשוט ישאל את האנשים בחדר מה נוח להם.',
      'אתם מאמינים שרוב המחלוקות נפתרות כשכולם יושבים, מישהו חותך אבטיח ואף אחד לא פותח ב"אני רק אומר".',
    ],
    flavor: {
      text: 'בסוגיית המזגן נדרש עדיין דיאלוג.',
      when: [{ type: 'axisBand', questionId: 'q6', bands: [0, 1, 3, 4] }],
    },
  },
  {
    id: 'gan-eden',
    archetype: 'peace_and_quiet',
    name: 'גן עדן',
    officialName: 'גן עדן בראשות ישוע ישראל בן דוד',
    leader: 'ישוע ישראל בן דוד',
    leaderRole: 'ראש הרשימה',
    letters: 'ה',
    portrait: 'party-leaders/gan-eden.webp',
    website: { url: 'https://www.ganeden.org.il/platform', kind: 'platform' },
    title: 'באופן מפתיע, יש לך בית פוליטי.',
    bodies: [
      'אתם בעד פחות הודעות, פחות ישיבות, יותר צל, ושבין 14:00 ל־16:00 פשוט לא יקרה שום דבר.',
      'אתם לא נגד אף אחד. אתם רק מבקשים שזה יקרה בשקט, בצל, ובלי קבוצת וואטסאפ.',
    ],
    flavor: { text: 'המערכת זיהתה אצלך נטייה חזקה לשקט.', when: [{ type: 'always' }] },
  },
  {
    id: 'sharsher',
    archetype: 'ceremony_presence',
    name: 'שרשר לאהבה ואחדות העם',
    officialName: 'שרשר לאהבה ואחדות העם',
    leader: 'איתן שוילי',
    leaderRole: 'ראש הרשימה',
    letters: 'צדק',
    portrait: 'party-leaders/sharsher.webp',
    website: { url: 'https://www.bakalpi.co.il/he/parties/sharsher', kind: 'profile' },
    title: 'יש דברים שראויים למעמד.',
    bodies: [
      'אתם לא מחפשים רק פתרון. אתם מחפשים כניסה, נוכחות ורגע שבו כולם מבינים שהאירוע התחיל.',
      'אצלכם אין "סתם ארוחה". יש קבלת פנים, יש נאום קצר, ויש כרית אחת נוספת לכל מקרה.',
    ],
    flavor: {
      text: 'בסוגיית כריות הנוי נמצאה עמדה בלתי מתפשרת.',
      when: [{ type: 'choice', questionId: 'q11', optionIds: ['d'] }],
    },
  },
  {
    id: 'hatikun',
    archetype: 'process_reform',
    name: 'התיקון',
    officialName: 'התיקון לשיטת הבחירות והממשל',
    leader: 'משה סלמוביץ',
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
      'אין לכם בעיה עם התוצאה. יש לכם כמה שאלות לגבי ההליך, מי היה מוסמך לקבוע אותו ומתי נסגרה ההרשמה.',
      'לפני שעונים על השאלה, אתם רוצים לדעת מי ניסח אותה, באיזה הליך, והאם אפשר היה לערער.',
    ],
    flavor: { text: 'התוצאה אושרה ברוב רגיל של האלגוריתם.', when: [{ type: 'always' }] },
  },
];

export function partyForArchetype(archetype: ArchetypeId): Party {
  const party = PARTIES.find((p) => p.archetype === archetype);
  if (!party) throw new Error(`No party mapped to archetype ${archetype}`);
  return party;
}
