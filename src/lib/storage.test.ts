import { describe, expect, it, vi } from 'vitest';
import { QUESTIONS } from '../data/questions';
import type { Answers } from '../data/types';
import { clearAnswers, loadAnswers, saveAnswers, STORAGE_KEY } from './storage';

describe('storage', () => {
  it('round-trips answers', () => {
    const answers: Answers = {
      q1: { kind: 'axis', value: 42 },
      q2: { kind: 'choice', optionId: 'c' },
      q3: { kind: 'skip' },
    };
    saveAnswers(answers);
    expect(loadAnswers(QUESTIONS)).toEqual(answers);
    clearAnswers();
    expect(loadAnswers(QUESTIONS)).toEqual({});
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
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    expect(loadAnswers(QUESTIONS)).toEqual({ q5: { kind: 'choice', optionId: 'b' } });
  });

  it('ignores other schema versions and corrupted data', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, answers: { q5: { kind: 'skip' } } }));
    expect(loadAnswers(QUESTIONS)).toEqual({});
    window.localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadAnswers(QUESTIONS)).toEqual({});
  });

  it('keeps working when storage is unavailable (private mode)', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(loadAnswers(QUESTIONS)).toEqual({});
    expect(() => saveAnswers({ q1: { kind: 'skip' } })).not.toThrow();
    get.mockRestore();
    set.mockRestore();
  });
});
