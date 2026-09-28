import type { Answer, Answers, Question } from '../data/types';

export const STORAGE_KEY = 'mechutz-lamidgam/v1';
const SCHEMA_VERSION = 1;

interface Persisted {
  v: number;
  answers: Answers;
  /** Question ids marked "חשוב לי במיוחד". Optional: older saves don't have it. */
  priorities?: string[];
}

export interface SavedState {
  answers: Answers;
  priorities: string[];
}

const EMPTY: SavedState = { answers: {}, priorities: [] };

/**
 * Restores saved progress. Anything that no longer matches the current questions
 * (removed question, renamed option, bad value) is dropped rather than trusted.
 */
export function loadState(questions: Question[]): SavedState {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { ...EMPTY };
  }
  if (!raw) return { ...EMPTY };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...EMPTY };
  }
  if (!isRecord(parsed) || parsed.v !== SCHEMA_VERSION || !isRecord(parsed.answers)) return { ...EMPTY };

  const stored = parsed.answers;
  const answers: Answers = {};
  for (const q of questions) {
    const a = normalizeAnswer(q, stored[q.id]);
    if (a) answers[q.id] = a;
  }
  const ids = new Set(questions.map((q) => q.id));
  const priorities = Array.isArray(parsed.priorities)
    ? parsed.priorities.filter((id): id is string => typeof id === 'string' && ids.has(id))
    : [];
  return { answers, priorities };
}

export function saveState(answers: Answers, priorities: string[]): void {
  const data: Persisted = { v: SCHEMA_VERSION, answers, priorities };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Private mode / storage disabled: the quiz still works, it just won't survive a refresh.
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A clean copy of a stored answer, or null when it doesn't fit this question any more. */
function normalizeAnswer(q: Question, a: unknown): Answer | null {
  if (!isRecord(a)) return null;
  if (a.kind === 'skip') return { kind: 'skip' };
  if (q.kind === 'choice') {
    const id = a.optionId;
    return a.kind === 'choice' && typeof id === 'string' && q.options.some((o) => o.id === id)
      ? { kind: 'choice', optionId: id }
      : null;
  }
  const value = a.value;
  if (a.kind !== 'axis' || typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) return null;
  return a.untouched === true ? { kind: 'axis', value, untouched: true } : { kind: 'axis', value };
}
