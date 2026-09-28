import { PARTY_IDS, emptyScores, type PartyId, type ScoreMap } from '../data/partyIds';
import type { Answer, Answers, AxisQuestion, Question } from '../data/types';
import { answersHash } from './hash';

/** Points an axis anchor gives fall linearly from 3 (exact hit) to 0 at this distance. */
export const AXIS_SPREAD = 35;
export const AXIS_MAX_POINTS = 3;
/**
 * Someone with no position on anything still gets a list, with confidence: the Pirates, who say they
 * speak to people without a political home and want blank ballots counted as empty seats.
 */
export const NO_OPINION_PARTY: PartyId = 'pirates';
export const NO_OPINION_PERCENT = 94;
/** Scores closer than this count as a tie and go to the tie-break cascade. */
export const TIE_EPSILON = 0.25;
/** A question counts as a "primary hit" for a party at this many points or more. */
export const PRIMARY_HIT = 2.5;

/**
 * percent = clamp(round(PCT_BASE + PCT_RANGE × r), PCT_MIN, PCT_MAX), r = winner score / winner max.
 * Calibrated by simulation (GAME_SPEC.md §7): a random respondent lands around 84%,
 * a fully consistent one at 96%. The spec's original 70 + 25r put almost everyone at 80–86%.
 */
export const PCT_BASE = 64;
export const PCT_RANGE = 40;
export const PCT_MIN = 72;
export const PCT_MAX = 96;

export type TieBreak = 'none' | 'axis' | 'primary' | 'hash';

export interface ScoreResult {
  winner: PartyId;
  ranking: { party: PartyId; score: number }[];
  scores: ScoreMap;
  /** Theoretical max per party, over the answered questions only. */
  maxima: ScoreMap;
  /** Points per answered (non-skipped) question. */
  perQuestion: Record<string, ScoreMap>;
  answeredIds: string[];
  skippedIds: string[];
  /** winner score / winner max, 0–1. */
  affinity: number;
  percent: number;
  tieBreak: TieBreak;
}

export function isAnswered(answer: Answer | undefined): boolean {
  return answer !== undefined && answer.kind !== 'skip';
}

export function countAnswered(questions: Question[], answers: Answers): number {
  return questions.filter((q) => isAnswered(answers[q.id])).length;
}

export function axisPoints(question: AxisQuestion, value: number): ScoreMap {
  const points = emptyScores();
  for (const anchor of question.anchors) {
    const distance = Math.abs(value - anchor.at);
    const p = AXIS_MAX_POINTS * Math.max(0, 1 - distance / AXIS_SPREAD);
    points[anchor.party] = Math.max(points[anchor.party], p);
  }
  return points;
}

/** Points the answer gives each party, or null when unanswered/skipped/invalid. */
export function questionPoints(question: Question, answer: Answer | undefined): ScoreMap | null {
  if (!answer || answer.kind === 'skip') return null;
  if (question.kind === 'axis') {
    if (answer.kind !== 'axis') return null;
    return axisPoints(question, clampValue(answer.value));
  }
  if (answer.kind !== 'choice') return null;
  const option = question.options.find((o) => o.id === answer.optionId);
  if (!option) return null;
  const points = emptyScores();
  for (const id of PARTY_IDS) points[id] = option.weights[id] ?? 0;
  return points;
}

/** The most points each party could get from this question. */
export function questionMax(question: Question): ScoreMap {
  const max = emptyScores();
  if (question.kind === 'axis') {
    for (const anchor of question.anchors) max[anchor.party] = AXIS_MAX_POINTS;
    return max;
  }
  for (const option of question.options) {
    for (const id of PARTY_IDS) {
      max[id] = Math.max(max[id], option.weights[id] ?? 0);
    }
  }
  return max;
}

/** Floor of the runner-up scale: runners-up map proportionally onto [RUNNER_UP_MIN, winner). */
export const RUNNER_UP_MIN = 38;

export interface RankedMatch {
  party: PartyId;
  percent: number;
}

/**
 * The winner with its calibrated percent, then the next ones scaled by raw score relative to the
 * winner onto [RUNNER_UP_MIN, winner). Always strictly decreasing, so the list never shows a tie.
 */
export function topMatches(result: ScoreResult, count = 3): RankedMatch[] {
  const [first, ...rest] = result.ranking;
  const matches: RankedMatch[] = [{ party: first!.party, percent: result.percent }];
  const top = result.scores[first!.party];
  let previous = result.percent;
  for (const entry of rest.slice(0, count - 1)) {
    const ratio = top > 0 ? Math.max(0, entry.score / top) : 0;
    const scaled = Math.round(RUNNER_UP_MIN + (result.percent - RUNNER_UP_MIN) * ratio);
    const percent = Math.max(RUNNER_UP_MIN - 2, Math.min(previous - 1, scaled));
    matches.push({ party: entry.party, percent });
    previous = percent;
  }
  return matches;
}

export function percentFromAffinity(affinity: number): number {
  const raw = Math.round(PCT_BASE + PCT_RANGE * affinity);
  return Math.min(PCT_MAX, Math.max(PCT_MIN, raw));
}

/** Issues the user marks as "חשוב לי במיוחד" count this many times (Wahl-O-Mat style). */
export const PRIORITY_WEIGHT = 2;

export function computeResult(
  questions: Question[],
  answers: Answers,
  priorities: readonly string[] = [],
): ScoreResult {
  const scores = emptyScores();
  const maxima = emptyScores();
  const perQuestion: Record<string, ScoreMap> = {};
  const answeredIds: string[] = [];
  const skippedIds: string[] = [];

  for (const question of questions) {
    const answer = answers[question.id];
    if (answer?.kind === 'skip') skippedIds.push(question.id);
    const points = questionPoints(question, answer);
    if (!points) continue;
    answeredIds.push(question.id);
    const weight = priorities.includes(question.id) ? PRIORITY_WEIGHT : 1;
    const max = questionMax(question);
    for (const id of PARTY_IDS) {
      points[id] *= weight;
      scores[id] += points[id];
      maxima[id] += max[id] * weight;
    }
    perQuestion[question.id] = points;
  }

  const noOpinion = answeredIds.length === 0;
  const { winner, tieBreak } = noOpinion
    ? { winner: NO_OPINION_PARTY, tieBreak: 'none' as const }
    : pickWinner(questions, answers, scores, perQuestion);
  const ranking = PARTY_IDS.map((party) => ({ party, score: scores[party] })).sort(
    (a, b) => (a.party === winner ? -1 : b.party === winner ? 1 : b.score - a.score),
  );
  const affinity = maxima[winner] > 0 ? scores[winner] / maxima[winner] : 0;

  return {
    winner,
    ranking,
    scores,
    maxima,
    perQuestion,
    answeredIds,
    skippedIds,
    affinity,
    percent: noOpinion ? NO_OPINION_PERCENT : percentFromAffinity(affinity),
    tieBreak,
  };
}

/**
 * Tie-break cascade — always terminates with exactly one winner:
 * 1. total score; 2. points from slider questions (the hidden "axis tie-breaker");
 * 3. number of primary hits; 4. deterministic hash of the answers.
 */
function pickWinner(
  questions: Question[],
  answers: Answers,
  scores: ScoreMap,
  perQuestion: Record<string, ScoreMap>,
): { winner: PartyId; tieBreak: TieBreak } {
  let tied = leaders([...PARTY_IDS], (a) => scores[a]);
  if (tied.length === 1) return { winner: tied[0]!, tieBreak: 'none' };

  const axisIds = questions.filter((q) => q.kind === 'axis' && perQuestion[q.id]).map((q) => q.id);
  tied = leaders(tied, (a) => axisIds.reduce((sum, id) => sum + perQuestion[id]![a], 0));
  if (tied.length === 1) return { winner: tied[0]!, tieBreak: 'axis' };

  tied = leaders(tied, (a) => Object.values(perQuestion).filter((p) => p[a] >= PRIMARY_HIT).length);
  if (tied.length === 1) return { winner: tied[0]!, tieBreak: 'primary' };

  const index = answersHash(answers) % tied.length;
  return { winner: tied[index]!, tieBreak: 'hash' };
}

/** Parties whose value is within TIE_EPSILON of the best. Keeps PARTY_IDS order. */
function leaders(candidates: PartyId[], value: (a: PartyId) => number): PartyId[] {
  const best = Math.max(...candidates.map(value));
  return candidates.filter((a) => best - value(a) < TIE_EPSILON);
}

function clampValue(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, Math.round(value)));
}
