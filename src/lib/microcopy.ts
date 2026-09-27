import { bandIndex } from '../data/axes';
import type { FlavorCondition, Party } from '../data/parties';
import type { Answers } from '../data/types';
import { answersHash } from './hash';

export function flavorApplies(conditions: FlavorCondition[], answers: Answers): boolean {
  return conditions.some((c) => {
    if (c.type === 'always') return true;
    const a = answers[c.questionId];
    if (c.type === 'choice') return a?.kind === 'choice' && c.optionIds.includes(a.optionId);
    return a?.kind === 'axis' && c.bands.includes(bandIndex(a.value));
  });
}

/** The party's one-line punch ("בנושא המעלית נמצאה ביניכם תמימות דעים."), only when it's true for these answers. */
export function flavorLine(party: Party, answers: Answers): string | null {
  return flavorApplies(party.flavor.when, answers) ? party.flavor.text : null;
}

export function pickBody(party: Party, answers: Answers): string {
  return party.bodies[answersHash(answers) % party.bodies.length]!;
}
