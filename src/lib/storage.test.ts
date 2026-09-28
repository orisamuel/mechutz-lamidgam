import { describe, expect, it, vi } from 'vitest';
import { QUESTIONS } from '../data/questions';
import type { Answers } from '../data/types';
import { clearState, loadState, saveState, STORAGE_KEY } from './storage';

describe('storage', () => {
  it('round-trips answers and priorities', () => {
    const answers: Answers = {
      parties: { kind: 'axis', value: 42 },
      service: { kind: 'axis', value: 50, untouched: true },
      pm: { kind: 'choice', optionId: 'c' },
      cost: { kind: 'skip' },
    };
    saveState(answers, ['pm', 'parties']);
    expect(loadState(QUESTIONS)).toEqual({ answers, priorities: ['pm', 'parties'] });
    clearState();
    expect(loadState(QUESTIONS)).toEqual({ answers: {}, priorities: [] });
  });

  it('drops anything that no longer matches the questions', () => {
    const stored = {
      v: 1,
      answers: {
        parties: { kind: 'axis', value: 140 }, // out of range
        pm: { kind: 'choice', optionId: 'zz' }, // removed option
        cost: { kind: 'axis', value: 10 }, // wrong kind for a choice question
        health: { kind: 'choice', optionId: 'b', extra: 'dropped' }, // fine, cleaned
        service: { kind: 'axis', value: 30, untouched: 'yes' }, // fine, junk flag dropped
        q5: { kind: 'skip' }, // a question from an older version
      },
      priorities: ['health', 'q5', 7],
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    expect(loadState(QUESTIONS)).toEqual({
      answers: { health: { kind: 'choice', optionId: 'b' }, service: { kind: 'axis', value: 30 } },
      priorities: ['health'],
    });
  });

  it('reads saves from before priorities existed', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, answers: { pm: { kind: 'skip' } } }));
    expect(loadState(QUESTIONS)).toEqual({ answers: { pm: { kind: 'skip' } }, priorities: [] });
  });

  it('ignores other schema versions and corrupted data', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, answers: { pm: { kind: 'skip' } } }));
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
    expect(() => saveState({ pm: { kind: 'skip' } }, [])).not.toThrow();
    get.mockRestore();
    set.mockRestore();
  });
});
