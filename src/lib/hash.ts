import type { Answers } from '../data/types';

/** FNV-1a, 32-bit. Deterministic across browsers and Node. */
export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Stable fingerprint of a set of answers: same answers → same number, on every device. */
export function answersHash(answers: Answers): number {
  const parts = Object.keys(answers)
    .sort()
    .map((id) => {
      const a = answers[id];
      if (!a) return `${id}:-`;
      if (a.kind === 'choice') return `${id}:c${a.optionId}`;
      if (a.kind === 'axis') return `${id}:v${a.value}`;
      return `${id}:s`;
    });
  return fnv1a(parts.join('|'));
}
