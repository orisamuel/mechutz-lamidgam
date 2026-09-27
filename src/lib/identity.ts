import { AXES, bandIndex, type BandIndex } from '../data/axes';
import type { Answers, AxisId, Question } from '../data/types';
import { answersHash } from './hash';

export interface AxisReading {
  questionId: string;
  axis: AxisId;
  value: number;
  band: BandIndex;
  /** "ימין־מזגן" */
  descriptor: string;
  /** "נוטה למזגן" */
  valueLabel: string;
  /** Distance from the center, 0–50. */
  extremeness: number;
}

export interface TopicReading {
  questionId: string;
  text: string;
  strength: number;
}

export function axisValueLabel(axis: AxisId, value: number): string {
  return AXES[axis].valueLabels[bandIndex(value)];
}

/** Answered sliders, in question order. */
export function axisReadings(questions: Question[], answers: Answers): AxisReading[] {
  const readings: AxisReading[] = [];
  for (const q of questions) {
    const a = answers[q.id];
    if (q.kind !== 'axis' || a?.kind !== 'axis') continue;
    const band = bandIndex(a.value);
    readings.push({
      questionId: q.id,
      axis: q.axis,
      value: a.value,
      band,
      descriptor: AXES[q.axis].bands[band],
      valueLabel: AXES[q.axis].valueLabels[band],
      extremeness: Math.abs(a.value - 50),
    });
  }
  return readings;
}

export function topicReadings(questions: Question[], answers: Answers): TopicReading[] {
  const readings: TopicReading[] = [];
  for (const q of questions) {
    const a = answers[q.id];
    if (q.kind !== 'choice' || a?.kind !== 'choice') continue;
    const option = q.options.find((o) => o.id === a.optionId);
    if (option) readings.push({ questionId: q.id, text: option.descriptor.text, strength: option.descriptor.strength });
  }
  return readings;
}

/**
 * Up to three phrases: the two most decided axes, then the strongest topic stance.
 * Ties between equally strong topic stances are broken by the answers hash, so the same
 * answers always give the same sentence, but different people get variety.
 */
export function identityParts(questions: Question[], answers: Answers): string[] {
  const axes = [...axisReadings(questions, answers)].sort((a, b) => b.extremeness - a.extremeness);
  const parts = axes.slice(0, 2).map((r) => r.descriptor);

  const hash = answersHash(answers);
  const topics = topicReadings(questions, answers);
  const ordered: TopicReading[] = [];
  const remaining = [...topics];
  while (remaining.length > 0) {
    const best = Math.max(...remaining.map((t) => t.strength));
    const top = remaining.filter((t) => t.strength === best);
    const pick = top[(hash + ordered.length) % top.length]!;
    ordered.push(pick);
    remaining.splice(remaining.indexOf(pick), 1);
  }

  for (const topic of ordered) {
    if (parts.length >= 3) break;
    parts.push(topic.text);
  }
  return parts;
}

export function identitySentence(parts: string[]): string {
  return parts.length ? `${parts.join('. ')}.` : '';
}

/** "יצא לי הפיראטים, 93%. מרכז־פיצה, ימין־מזגן." + link */
export function shareText(partyName: string, percent: number, parts: string[], url: string): string {
  const stance = parts.slice(0, 2).join(', ');
  const line = stance ? `יצא לי ${partyName}, ${percent}%. ${stance}.` : `יצא לי ${partyName}, ${percent}%.`;
  return url ? `${line}\n${url}` : line;
}
