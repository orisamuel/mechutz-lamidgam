# מחוץ למדגם

מצפן המפלגות הקטנות של בחירות 2026: React + TypeScript + Vite, סטטי, בלי backend. האתר עונה על ההנחיות ב-[`election-parody-v2/`](election-parody-v2/). את מפרט המשחק המלא (מטריצה, ניקוד, כיול, טקסטים) אפשר למצוא ב-[`GAME_SPEC.md`](election-parody-v2/GAME_SPEC.md).

## הרצה

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build אל dist/
npm run preview    # הגשה מקומית של ה-build
```

## בדיקות וכלים

```bash
npm test             # vitest: ניקוד, שוויון, איזון, זהות, storage, תוכן, זרימה מלאה
npm run typecheck
npm run simulate     # דוח איזון: מי מנצח וכמה, התפלגות אחוזים (100K משיבים)
npm run spec:tables  # מדפיס את טבלאות GAME_SPEC.md מתוך src/data
```

## מבנה

```
src/
  data/        questions.ts (12 השאלות + מטריצה) · parties.ts · axes.ts · copy.ts · archetypes.ts
  lib/         score.ts · identity.ts · microcopy.ts · cardRenderer.ts · share.ts · storage.ts · router.ts
  components/  QuestionCard · AxisQuestion · BallotSlip · PartyHero · Progress · Masthead · …
  pages/       Intro · Quiz · Loading · Result · TextPage · Sources
  og/          render.ts: יוצר את תמונות התצוגה המקדימה (דרך og.html)
scripts/       simulate.ts · spec-tables.ts · portraits.py (דיוקנאות דרך fal)
public/        favicon.svg · party-leaders/ (6 דיוקנאות מאוירים) · og/ (תמונות תצוגה מקדימה לקישורים)
```

- **הניקוד** רשום לפי הרשימות עצמן, וכל נקודה נשענת על עמדה מתועדת ב-`src/data/positions.ts` (מצע, אתר, סרטון או ריאיון, עם קישור ותאריך). בדיקה אוטומטית נכשלת אם רשימה מקבלת נקודות בלי מקור משלה.
- **ההתקדמות** נשמרת ב-localStorage, וכל שאלה היא רשומה בהיסטוריה (`#/q/4`), כך שרענון ו-swipe-back עובדים.
- **שיתוף הוא קישור, בלי הורדות.** בטלפון נפתחת חלונית השיתוף עם טקסט וקישור, ובמחשב הקישור מועתק.
  - הקישור הוא `/r/<slug>/`, עמוד סטטי שנוצר ב-build, עם תגי Open Graph ותמונה (`public/og/<slug>.jpg`, בגודל 1200×630).
  - מי שפותח את הקישור מגיע לשאלון.
  - כדי ליצור את התמונות מחדש: `npm run dev`, ואז לפתוח `http://localhost:5173/og.html`. התמונות נשמרות ב-`public/og/`.

## דיוקנאות

- קובץ הדיוקן נשמר ב-`public/party-leaders/<slug>.webp`, ובשדה `portrait` ב-`src/data/parties.ts` מוסיפים את הנתיב.
- כשיש דיוקן, מופיעים אוטומטית:
  - תג "איור". הוא מה שמסמן שזה איור, ולכן אסור להוריד אותו. אצל דמות אנונימית מופיע במקומו פס "וואלאק, לא מצאנו שום תמונה של ראש המפלגה"
  - שורה בדף המתודולוגיה
- רפרנסים (צילומים מוגנים) נשמרים רק בתיקייה `references/`, שהיא ב-`.gitignore`.

## Deploy

- **איך זה עולה:** כל push ל-`main` מריץ בדיקות ו-build, ומעלה ל-GitHub Pages (`.github/workflows/deploy.yml`).
- **כתובת האתר:** נקבעת ב-`VITE_SITE_URL` (כרגע `https://lo-ovrot.fun/`).
- **noindex:** `VITE_NOINDEX=1` מוסיף `noindex`. להסיר ביום ההשקה.

## לפני השקה

- [ ] לאמת אותיות, שמות וראשי רשימות מול ועדת הבחירות (ב-`parties.ts` יש TODO).
- [ ] לבדוק על אייפון אמיתי: שיתוף (חלונית השיתוף ותצוגה מקדימה בוואטסאפ), סליידר, swipe-back.
- [ ] לבחור ספק analytics (`src/lib/analytics.ts`), cookieless, בלי לשלוח תשובות.
- [ ] להסיר את `VITE_NOINDEX`.
