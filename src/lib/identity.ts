import { AXES, bandIndex } from '../data/axes';
import type { PartyId } from '../data/partyIds';
import type { Answer, Answers, AxisId, Question } from '../data/types';
import { questionPoints } from './score';

/** An answer counts as agreeing with a party when it gave that party at least this many points. */
export const SHARED_MIN_POINTS = 2;

export function axisValueLabel(axis: AxisId, value: number): string {
  return AXES[axis].valueLabels[bandIndex(value)];
}

/** The "בעד ___" phrase for one answer; null when skipped, unanswered, or a slider nobody moved. */
export function stanceOf(question: Question, answer: Answer | undefined): string | null {
  if (!answer) return null;
  if (question.kind === 'choice') {
    if (answer.kind !== 'choice') return null;
    return question.options.find((o) => o.id === answer.optionId)?.stance ?? null;
  }
  if (answer.kind !== 'axis' || answer.untouched) return null;
  return AXES[question.axis].stances[bandIndex(answer.value)] || null;
}

/**
 * What the user and a party agree on: answers that gave the party SHARED_MIN_POINTS or more.
 * The user's priority issues come first, then the strongest agreements, then question order.
 */
export function sharedStances(
  questions: Question[],
  answers: Answers,
  party: PartyId,
  priorities: readonly string[] = [],
  max = 3,
): string[] {
  const rows: { stance: string; points: number; priority: boolean; order: number }[] = [];
  questions.forEach((q, order) => {
    const points = questionPoints(q, answers[q.id]);
    const stance = stanceOf(q, answers[q.id]);
    if (!points || !stance || points[party] < SHARED_MIN_POINTS) return;
    rows.push({ stance, points: points[party], priority: priorities.includes(q.id), order });
  });
  rows.sort((a, b) => Number(b.priority) - Number(a.priority) || b.points - a.points || a.order - b.order);
  const out: string[] = [];
  for (const row of rows) if (out.length < max && !out.includes(row.stance)) out.push(row.stance);
  return out;
}

/** "א", "א וב", "א, ב וג". The conjunction joins the last item (with a maqaf before a digit or Latin letter). */
export function joinHebrew(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  const last = items[items.length - 1]!;
  const joined = /^[א-ת]/.test(last) ? `ו${last}` : `ו־${last}`;
  return `${items.slice(0, -1).join(', ')} ${joined}`;
}

/** "כמו גן עדן, גם אתם בעד שמיטת חובות, תקרת שכר לבכירים וחוק יסוד: האדם כמקדש חי." */
export function matchSentence(partyName: string, stances: string[]): string | null {
  return stances.length ? `כמו ${partyName}, גם אתם בעד ${joinHebrew(stances)}.` : null;
}

/** "יצא לי גן עדן, 91%. בעד שמיטת חובות ותקרת שכר לבכירים." The link is shared next to it, not inside. */
export function shareText(partyName: string, percent: number, stances: string[]): string {
  const top = stances.slice(0, 2);
  return top.length ? `יצא לי ${partyName}, ${percent}%. בעד ${joinHebrew(top)}.` : `יצא לי ${partyName}, ${percent}%.`;
}
