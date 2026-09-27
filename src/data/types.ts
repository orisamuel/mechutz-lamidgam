import type { ArchetypeId } from './archetypes';

export type Weights = Partial<Record<ArchetypeId, number>>;

export type AxisId = 'pizzaFalafel' | 'seaDesert' | 'windowAC' | 'flowCalendar';

/** A share-sentence phrase attached to a multiple-choice answer ("קו ניצי בנושא..."). */
export interface Descriptor {
  text: string;
  /** 1–3. The identity sentence prefers the strongest descriptor the user earned. */
  strength: 1 | 2 | 3;
}

export interface ChoiceOption {
  id: string;
  label: string;
  weights: Weights;
  descriptor: Descriptor;
}

interface QuestionBase {
  id: string;
  /** Small label above the question, phrased like a policy domain. */
  category: string;
  prompt: string;
  /** Noun phrase used in computed micro-copy: "בנושא {topic} נרשמו פערים." */
  topic: string;
}

export interface ChoiceQuestion extends QuestionBase {
  kind: 'choice';
  options: ChoiceOption[];
}

/** An archetype "sits" at a point on a slider; the closer the answer, the more points (max 3). */
export interface AxisAnchor {
  archetype: ArchetypeId;
  at: number;
}

export interface AxisQuestion extends QuestionBase {
  kind: 'axis';
  axis: AxisId;
  anchors: AxisAnchor[];
}

export type Question = ChoiceQuestion | AxisQuestion;

export type Answer =
  | { kind: 'choice'; optionId: string }
  | { kind: 'axis'; value: number }
  | { kind: 'skip' };

/** Keyed by question id. `undefined` = not visited yet. */
export type Answers = Partial<Record<string, Answer>>;
