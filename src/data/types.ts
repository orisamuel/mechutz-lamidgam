import type { PartyId } from './partyIds';
import type { PositionId } from './positions';

export type Weights = Partial<Record<PartyId, number>>;

export type AxisId = 'parties' | 'service' | 'citizens';

export interface ChoiceOption {
  id: string;
  label: string;
  weights: Weights;
  /** The published positions behind the weights. Every weighted party needs at least one of its own. */
  basis: PositionId[];
  /** Noun phrase that completes "בעד ___" in the result's match line and on the share card. */
  stance: string;
}

interface QuestionBase {
  id: string;
  /** Small label above the question, phrased like a policy domain. */
  category: string;
  prompt: string;
  /** Short name of the issue, listed in the "מה הכי חשוב לכם?" step. */
  topic: string;
}

export interface ChoiceQuestion extends QuestionBase {
  kind: 'choice';
  options: ChoiceOption[];
}

/** A party "sits" at a point on a slider; the closer the answer, the more points (max 3). */
export interface AxisAnchor {
  party: PartyId;
  at: number;
  basis: PositionId[];
}

export interface AxisQuestion extends QuestionBase {
  kind: 'axis';
  axis: AxisId;
  anchors: AxisAnchor[];
}

export type Question = ChoiceQuestion | AxisQuestion;

export type Answer =
  | { kind: 'choice'; optionId: string }
  /** `untouched`: "המשך" on a slider nobody moved. Scored as the middle, but no stance is read into it. */
  | { kind: 'axis'; value: number; untouched?: true }
  | { kind: 'skip' };

/** Keyed by question id. `undefined` = not visited yet. */
export type Answers = Partial<Record<string, Answer>>;
