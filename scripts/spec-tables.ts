/**
 * Prints the GAME_SPEC.md tables straight from src/data, so the spec never drifts from the code.
 * Run: npm run spec:tables
 */
import type { ArchetypeId } from '../src/data/archetypes';
import { AXES, AXIS_ORDER } from '../src/data/axes';
import { PARTIES } from '../src/data/parties';
import { QUESTIONS } from '../src/data/questions';

const SHORT: Record<ArchetypeId, string> = {
  digital_autonomy: 'פיר',
  procedural_order: 'סדר',
  human_consensus: 'א״א',
  peace_and_quiet: 'ג״ע',
  ceremony_presence: 'שרשר',
  process_reform: 'תיקון',
};

const pts = (w: Partial<Record<ArchetypeId, number>>) =>
  Object.entries(w)
    .map(([a, n]) => `${SHORT[a as ArchetypeId]} +${n}`)
    .join(' · ');

console.log('### שאלות\n');
console.log('| # | סוג | קטגוריה | שאלה |');
console.log('|---|---|---|---|');
QUESTIONS.forEach((q, i) => console.log(`| ${i + 1} | ${q.kind === 'axis' ? 'ציר' : 'בחירה'} | ${q.category} | ${q.prompt} |`));

console.log('\n### מטריצה — שאלות בחירה\n');
for (const [i, q] of QUESTIONS.entries()) {
  if (q.kind !== 'choice') continue;
  console.log(`**${i + 1}. ${q.prompt}**\n`);
  console.log('| תשובה | ניקוד | descriptor (עוצמה) |');
  console.log('|---|---|---|');
  for (const o of q.options) console.log(`| ${o.label} | ${pts(o.weights)} | ${o.descriptor.text} (${o.descriptor.strength}) |`);
  console.log('');
}

console.log('### סליידרים — עוגנים\n');
console.log('| # | ציר (0 ← → 100) | עוגנים |');
console.log('|---|---|---|');
QUESTIONS.forEach((q, i) => {
  if (q.kind !== 'axis') return;
  const def = AXES[q.axis];
  console.log(`| ${i + 1} | ${def.left} ← → ${def.right} | ${q.anchors.map((a) => `${SHORT[a.archetype]} @${a.at}`).join(' · ')} |`);
});

console.log('\n### descriptors של צירים\n');
console.log('| ציר | 0–24 | 25–44 | 45–55 | 56–75 | 76–100 |');
console.log('|---|---|---|---|---|---|');
for (const id of AXIS_ORDER) {
  const a = AXES[id];
  console.log(`| ${a.left}/${a.right} | ${a.bands.join(' | ')} |`);
}

console.log('\n### רשימות\n');
console.log('| ארכיטיפ | שם תצוגה | שם בפתק | אותיות | ראש הרשימה | כותרת | שורת טעם (מתי) |');
console.log('|---|---|---|---|---|---|---|');
for (const p of PARTIES) {
  const when = p.flavor.when
    .map((c) => (c.type === 'always' ? 'תמיד' : c.type === 'choice' ? `${c.questionId}∈{${c.optionIds.join(',')}}` : `${c.questionId} band∈{${c.bands.join(',')}}`))
    .join(' או ');
  console.log(`| ${SHORT[p.archetype]} | ${p.name} | ${p.officialName} | ${p.letters ?? '—'} | ${p.leader} | ${p.title} | ${p.flavor.text} (${when}) |`);
}
