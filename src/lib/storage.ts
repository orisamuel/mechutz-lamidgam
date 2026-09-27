import type { Answer, Answers, Question } from '../data/types';

export const STORAGE_KEY = 'mechutz-lamidgam/v1';
const SCHEMA_VERSION = 1;

interface Persisted {
  v: number;
  answers: Answers;
}

/**
 * Restores saved answers. Anything that no longer matches the current questions
 * (removed question, renamed option, bad value) is dropped rather than trusted.
 */
export function loadAnswers(questions: Question[]): Answers {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return {};
  }
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!isRecord(parsed) || parsed.v !== SCHEMA_VERSION || !isRecord(parsed.answers)) return {};

  const stored = parsed.answers;
  const answers: Answers = {};
  for (const q of questions) {
    const a = stored[q.id];
    if (isValidAnswer(q, a)) answers[q.id] = a;
  }
  return answers;
}

export function saveAnswers(answers: Answers): void {
  const data: Persisted = { v: SCHEMA_VERSION, answers };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Private mode / storage disabled: the quiz still works, it just won't survive a refresh.
  }
}

export function clearAnswers(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidAnswer(q: Question, a: unknown): a is Answer {
  if (!isRecord(a)) return false;
  if (a.kind === 'skip') return true;
  if (q.kind === 'choice') return a.kind === 'choice' && q.options.some((o) => o.id === a.optionId);
  return a.kind === 'axis' && typeof a.value === 'number' && Number.isFinite(a.value) && a.value >= 0 && a.value <= 100;
}
