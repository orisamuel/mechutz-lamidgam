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
  components/  QuestionCard · AxisQuestion · BallotSlip · PartyHero · PoliticalMap · Progress · …
  pages/       Intro · Quiz · Loading · NeedMore · Result · MapPage · TextPage
scripts/       simulate.ts · spec-tables.ts
public/        favicon.svg · party-leaders/ (דיוקנאות, כשיהיו)
```

- **הניקוד** עובר רק דרך ארכיטיפים פנימיים. אף מקום בקוד לא טוען שלרשימה אמיתית יש עמדה על פיצה או מזגן.
- **ההתקדמות** נשמרת ב-localStorage, וכל שאלה היא רשומה בהיסטוריה (`#/q/4`), כך שרענון ו-swipe-back עובדים.
- **כרטיס השיתוף** מצויר ב-Canvas 2D בשני פורמטים: פוסט 1080×1350 וסטורי 1080×1920. השיתוף עובר דרך Web Share API, ואם הוא לא זמין, התמונה יורדת והטקסט מועתק.

## דיוקנאות

- קובץ הדיוקן נשמר ב-`public/party-leaders/<slug>.webp`, ובשדה `portrait` ב-`src/data/parties.ts` מוסיפים את הנתיב.
- כשיש דיוקן, מופיעים אוטומטית:
  - תג "איור"
  - שורת הגילוי שנדרשת לפי כללי ועדת הבחירות
  - שורה בדף המתודולוגיה
- רפרנסים (צילומים מוגנים) נשמרים רק בתיקייה `references/`, שהיא ב-`.gitignore`.

## Deploy

- **איך זה עולה:** כל push ל-`main` מריץ בדיקות ו-build, ומעלה ל-GitHub Pages (`.github/workflows/deploy.yml`).
- **כתובת האתר:** נקבעת ב-`VITE_SITE_URL` (כרגע `https://lo-ovrot.fun/`).
- **noindex:** `VITE_NOINDEX=1` מוסיף `noindex`. להסיר ביום ההשקה.

## לפני השקה

- [ ] לאמת אותיות, שמות וראשי רשימות מול ועדת הבחירות (ב-`parties.ts` יש TODO).
- [ ] להוסיף פרטי קשר של אחראי הנגישות (`COPY.accessibility.contact`).
- [ ] לבדוק על אייפון אמיתי: שיתוף, יצירת תמונה, סליידר, swipe-back.
- [ ] לבחור ספק analytics (`src/lib/analytics.ts`), cookieless, בלי לשלוח תשובות.
- [ ] להסיר את `VITE_NOINDEX`.
