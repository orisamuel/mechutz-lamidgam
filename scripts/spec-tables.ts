/**
 * Prints the GAME_SPEC.md tables straight from src/data, so the spec never drifts from the code.
 * Run: npm run spec:tables
 */
import { AXES } from '../src/data/axes';
import type { PartyId } from '../src/data/partyIds';
import { PARTIES } from '../src/data/parties';
import { POSITIONS, type PositionId } from '../src/data/positions';
import { QUESTIONS } from '../src/data/questions';
import { sourceLabel } from '../src/pages/Sources';

const SHORT: Record<PartyId, string> = {
  pirates: 'פיר',
  'seder-chadash': 'סדר',
  'ani-veata': 'א״א',
  'gan-eden': 'ג״ע',
  sharsher: 'שרשר',
  hatikun: 'תיקון',
};

const pts = (w: Partial<Record<PartyId, number>>) =>
  Object.entries(w)
    .map(([a, n]) => `${SHORT[a as PartyId]} +${n}`)
    .join(' · ');
const cite = (ids: readonly PositionId[]) => ids.map((id) => `\`${id}\` (${sourceLabel(POSITIONS[id])})`).join('<br>');

console.log('### שאלות\n');
console.log('| # | סוג | קטגוריה | שאלה | נושא |');
console.log('|---|---|---|---|---|');
QUESTIONS.forEach((q, i) =>
  console.log(`| ${i + 1} | ${q.kind === 'axis' ? 'ציר' : 'בחירה'} | ${q.category} | ${q.prompt} | ${q.topic} |`),
);

console.log('\n### מטריצה: שאלות בחירה\n');
for (const [i, q] of QUESTIONS.entries()) {
  if (q.kind !== 'choice') continue;
  console.log(`**${i + 1}. ${q.prompt}**\n`);
  console.log('| תשובה | ניקוד | מקור | "בעד ___" |');
  console.log('|---|---|---|---|');
  for (const o of q.options) console.log(`| ${o.label} | ${pts(o.weights)} | ${cite(o.basis)} | ${o.stance} |`);
  console.log('');
}

console.log('### סליידרים: עוגנים\n');
console.log('| # | ציר (0 ← → 100) | עוגנים | מקור |');
console.log('|---|---|---|---|');
QUESTIONS.forEach((q, i) => {
  if (q.kind !== 'axis') return;
  const def = AXES[q.axis];
  const anchors = q.anchors.map((a) => `${SHORT[a.party]} @${a.at}`).join(' · ');
  console.log(`| ${i + 1} | ${def.left} ← → ${def.right} | ${anchors} | ${cite(q.anchors.flatMap((a) => a.basis))} |`);
});

console.log('\n### סליידרים: תוויות ו"בעד ___" לפי טווח\n');
console.log('| ציר | 0–24 | 25–44 | 45–55 | 56–75 | 76–100 |');
console.log('|---|---|---|---|---|---|');
for (const a of Object.values(AXES)) {
  console.log(`| ${a.left}/${a.right} (תווית) | ${a.valueLabels.join(' | ')} |`);
  console.log(`| ${a.left}/${a.right} (בעד) | ${a.stances.join(' | ')} |`);
}

console.log('\n### רשימות\n');
console.log('| קיצור | שם תצוגה | שם בפתק | אותיות | ראש הרשימה | כותרת | שורת טעם |');
console.log('|---|---|---|---|---|---|---|');
for (const p of PARTIES) {
  console.log(
    `| ${SHORT[p.id]} | ${p.name} | ${p.officialName} | ${p.letters ?? '—'} | ${p.leader} | ${p.title} | ${p.flavor.text} |`,
  );
}

console.log('\n### עמדות ומקורות\n');
console.log('| מזהה | רשימה | העמדה (במילים שלנו) | מקור | קישור |');
console.log('|---|---|---|---|---|');
for (const [id, p] of Object.entries(POSITIONS)) {
  console.log(`| \`${id}\` | ${SHORT[p.party]} | ${p.text} | ${sourceLabel(p)} | ${p.url} |`);
}
