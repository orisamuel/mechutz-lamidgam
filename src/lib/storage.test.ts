import { describe, expect, it, vi } from 'vitest';
import { QUESTIONS } from '../data/questions';
import type { Answers } from '../data/types';
import { clearState, loadState, saveState, STORAGE_KEY } from './storage';

describe('storage', () => {
  it('round-trips answers and priorities', () => {
    const answers: Answers = {
      q1: { kind: 'axis', value: 42 },
      q2: { kind: 'choice', optionId: 'c' },
      q3: { kind: 'skip' },
    };
    saveState(answers, ['q2', 'q1']);
    expect(loadState(QUESTIONS)).toEqual({ answers, priorities: ['q2', 'q1'] });
    clearState();
    expect(loadState(QUESTIONS)).toEqual({ answers: {}, priorities: [] });
  });

  it('drops anything that no longer matches the questions', () => {
    const stored = {
      v: 1,
      answers: {
        q1: { kind: 'axis', value: 140 }, // out of range
        q2: { kind: 'choice', optionId: 'zz' }, // removed option
        q3: { kind: 'axis', value: 10 }, // wrong kind for a choice question
        q5: { kind: 'choice', optionId: 'b' }, // fine
        q99: { kind: 'skip' }, // removed question
      },
      priorities: ['q5', 'q99', 7],
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    expect(loadState(QUESTIONS)).toEqual({ answers: { q5: { kind: 'choice', optionId: 'b' } }, priorities: ['q5'] });
  });

  it('reads saves from before priorities existed', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, answers: { q5: { kind: 'skip' } } }));
    expect(loadState(QUESTIONS)).toEqual({ answers: { q5: { kind: 'skip' } }, priorities: [] });
  });

  it('ignores other schema versions and corrupted data', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, answers: { q5: { kind: 'skip' } } }));
    expect(loadState(QUESTIONS).answers).toEqual({});
    window.localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadState(QUESTIONS).answers).toEqual({});
  });

  it('keeps working when storage is unavailable (private mode)', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(loadState(QUESTIONS)).toEqual({ answers: {}, priorities: [] });
    expect(() => saveState({ q1: { kind: 'skip' } }, [])).not.toThrow();
    get.mockRestore();
    set.mockRestore();
  });
});
