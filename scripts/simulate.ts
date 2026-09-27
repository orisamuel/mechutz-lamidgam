/**
 * Balance report for GAME_SPEC.md: who wins, how often, and what percentages people see.
 * Run: npm run simulate
 */
import { ARCHETYPES } from '../src/data/archetypes';
import { QUESTIONS } from '../src/data/questions';
import { computeResult } from '../src/lib/score';
import { personaAnswers, quantile, simulate, type SliderModel } from '../src/lib/simulate';

const RUNS = 100_000;

for (const sliders of ['human', 'uniform'] as SliderModel[]) {
  const s = simulate(QUESTIONS, RUNS, 26, { sliders, skipRate: 0.08 });
  const sorted = [...s.percents].sort((a, b) => a - b);
  console.log(`\n## sliders=${sliders}, skip=8%, runs=${RUNS} (with result: ${s.withResult})`);
  console.log('| archetype | wins |');
  console.log('|---|---|');
  for (const a of ARCHETYPES) console.log(`| ${a} | ${((100 * s.winners[a]) / s.withResult).toFixed(1)}% |`);
  console.log(
    `percent: min ${sorted[0]} · p10 ${quantile(sorted, 0.1)} · p50 ${quantile(sorted, 0.5)} · p90 ${quantile(sorted, 0.9)} · max ${sorted[sorted.length - 1]}`,
  );
  const aff = [...s.affinities].sort((a, b) => a - b);
  console.log(
    `affinity: min ${aff[0]!.toFixed(2)} · p10 ${quantile(aff, 0.1).toFixed(2)} · p50 ${quantile(aff, 0.5).toFixed(2)} · p90 ${quantile(aff, 0.9).toFixed(2)} · p99 ${quantile(aff, 0.99).toFixed(2)}`,
  );
  const tb = s.tieBreaks;
  console.log(
    `tie-breaks: axis ${((100 * tb.axis) / s.withResult).toFixed(2)}% · primary ${((100 * tb.primary) / s.withResult).toFixed(2)}% · hash ${((100 * tb.hash) / s.withResult).toFixed(2)}%`,
  );
}

console.log('\n## personas');
for (const a of ARCHETYPES) {
  const r = computeResult(QUESTIONS, personaAnswers(QUESTIONS, a));
  console.log(`${a}: winner=${r?.winner} percent=${r?.percent} affinity=${r?.affinity.toFixed(2)}`);
}
