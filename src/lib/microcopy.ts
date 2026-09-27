import { bandIndex } from '../data/axes';
import { ARCHETYPES } from '../data/archetypes';
import type { FlavorCondition, Party } from '../data/parties';
import type { Answers, Question } from '../data/types';
import { answersHash } from './hash';
import type { ScoreResult } from './score';

export function flavorApplies(conditions: FlavorCondition[], answers: Answers): boolean {
  return conditions.some((c) => {
    if (c.type === 'always') return true;
    const a = answers[c.questionId];
    if (c.type === 'choice') return a?.kind === 'choice' && c.optionIds.includes(a.optionId);
    return a?.kind === 'axis' && c.bands.includes(bandIndex(a.value));
  });
}

/**
 * The count is derived from the percentage so the two never contradict each other
 * (93% of 12 answered → "ב־11 מתוך 12"). The second sentence is computed from the actual answers.
 */
export function agreementCount(result: ScoreResult): number {
  const answered = result.answeredIds.length;
  return Math.min(answered, Math.max(1, Math.round((answered * result.percent) / 100)));
}

/** The answered question where the winner and this user diverged most. */
export function widestGap(result: ScoreResult, questions: Question[]): Question | null {
  let best: { q: Question; own: number; other: number } | null = null;
  for (const q of questions) {
    const points = result.perQuestion[q.id];
    if (!points) continue;
    const own = points[result.winner];
    const other = Math.max(...ARCHETYPES.filter((a) => a !== result.winner).map((a) => points[a]));
    if (!best || own < best.own || (own === best.own && other > best.other)) best = { q, own, other };
  }
  return best?.q ?? null;
}

export function matchLine(result: ScoreResult, questions: Question[], answers: Answers, party: Party): string {
  const answered = result.answeredIds.length;
  const agree = agreementCount(result);
  const first = `ב־${agree} מתוך ${answered} סוגיות נמצאה התאמה.`;

  if (flavorApplies(party.flavor.when, answers)) return `${first} ${party.flavor.text}`;

  if (agree < answered) {
    const gap = widestGap(result, questions);
    if (gap) return `${first} בנושא ${gap.topic} נרשמו פערים.`;
  }

  const skipped = questions.find((q) => result.skippedIds.includes(q.id));
  if (skipped) return `${first} בנושא ${skipped.topic} נרשמה הימנעות.`;

  return `${first} לא נרשמו פערים מהותיים.`;
}

export function pickBody(party: Party, answers: Answers): string {
  return party.bodies[answersHash(answers) % party.bodies.length]!;
}
