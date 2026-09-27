# לוגיקת התאמה V2

המטרה היא תוצאה עקבית ומשעשעת, לא טענה על עמדות אמיתיות של הרשימות.

## archetypes פנימיים

הניקוד עובד קודם על שישה archetypes קומיים, ורק בסוף כל archetype ממופה לשם רשימה:

- `digital_autonomy` → הפיראטים
- `procedural_order` → סדר חדש
- `human_consensus` → אני ואתה
- `peace_and_quiet` → גן עדן
- `ceremony_presence` → שרשר
- `process_reform` → התיקון

כך קוד השאלות אינו מכיל טענה ש"הפיראטים בעד מזגן" וכד'.

## scoring

כל תשובת multiple-choice מוסיפה 0–3 נקודות ל-2–4 archetypes. sliders מחושבים גם לצירי המפה וגם לניקוד archetype.

דוגמה:

`הודעה קולית 4:38 → מחייבת תמלול`
- digital_autonomy +3
- procedural_order +1

`אני חמש דקות מגיע → חמש דקות`
- procedural_order +3
- process_reform +1

`תבואו מתי שנוח → מלכודת`
- peace_and_quiet +2
- procedural_order +1

אין צורך שהמיפוי יהיה "אמיתי". הוא צריך להיות פנימי, עקבי, ולייצר תוצאות מגוונות.

## אחוז

אחוז התוצאה הוא normalized affinity בתוך המשחק:

`70 + round(25 * winnerScore / theoreticalMaxForAnswered)`

Clamp ל-72–97.

המטרה: תוצאות שנראות כמו שאלון התאמה ולא 34% מדכא. אין להציג 100%.

## tie

אם ההפרש בין מקום 1 ל-2 קטן מ-2 נקודות:
- להשתמש בשאלת הכרעה נסתרת מתוך אחת משאלות הציר שכבר נענו.
- לא להציג tie למשתמש.

## political map

### pizzaFalafel
שאלה 1, 0–100 ישיר.

### windowAC
שאלה 6, 0–100 ישיר.

### flowCalendar
שאלה 9, 0–100 ישיר.

### seaDesert
אם שאלת ים/מדבר אינה ב-12 הראשיות, לחשב proxy קל משאלות טיול/אקלים; עדיף בגרסת production להחליף אחת השאלות ולהכניס slider ישיר.

## share identity

לכל axis:
- 0–24: descriptor קצה שמאל
- 25–44: נוטה שמאל
- 45–55: מרכז
- 56–75: נוטה ימין
- 76–100: descriptor קצה ימין

בנוסף לבחור descriptor נושא אחד מהתשובה עם confidence הגבוה ביותר (למשל הודעות קוליות / מעלית / ליטרלי).
