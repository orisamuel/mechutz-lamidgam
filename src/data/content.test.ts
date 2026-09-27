import { describe, expect, it } from 'vitest';
import { ARCHETYPES } from './archetypes';
import { AXES } from './axes';
import { COPY } from './copy';
import { PARTIES } from './parties';
import { QUESTIONS } from './questions';

/** Every string a user can see, including copy functions called with sample values. */
function userFacingStrings(): string[] {
  const out: string[] = [];
  const walk = (value: unknown): void => {
    if (typeof value === 'string') out.push(value);
    else if (typeof value === 'function') out.push(String((value as (...a: number[]) => unknown)(7, 12)));
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(COPY);
  for (const q of QUESTIONS) {
    out.push(q.category, q.prompt, q.topic);
    if (q.kind === 'choice') q.options.forEach((o) => out.push(o.label, o.descriptor.text));
  }
  Object.values(AXES).forEach((a) => out.push(a.left, a.right, ...a.bands, ...a.valueLabels));
  PARTIES.forEach((p) => out.push(p.name, p.officialName, p.title, ...p.bodies, p.flavor.text));
  return out;
}

describe('content rules from the brief', () => {
  const strings = userFacingStrings();

  it('never names or explains the joke', () => {
    const banned = ['פארודיה', 'פרודיה', 'סאטירה', 'בצחוק', 'לצחוק', 'התאמה פארודית'];
    for (const s of strings) for (const word of banned) expect(s, s).not.toContain(word);
  });

  it('addresses users in plural or gender-neutral forms (no "אתה")', () => {
    for (const s of strings) expect(s, s).not.toMatch(/(^|[\s"'(])אתה($|[\s.,!?:"')])/);
  });
});

describe('question bank integrity', () => {
  it('has 12 questions with unique ids', () => {
    expect(QUESTIONS).toHaveLength(12);
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(12);
  });

  it('has one direct slider for each of the four map axes', () => {
    const axes = QUESTIONS.filter((q) => q.kind === 'axis').map((q) => (q.kind === 'axis' ? q.axis : null));
    expect([...axes].sort()).toEqual(Object.keys(AXES).sort());
  });

  it('gives each choice answer 0–3 points to 2–4 archetypes', () => {
    for (const q of QUESTIONS) {
      if (q.kind !== 'choice') continue;
      expect(q.options.length).toBeGreaterThanOrEqual(4);
      expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
      for (const o of q.options) {
        const entries = Object.entries(o.weights);
        expect(entries.length, `${q.id}/${o.id}`).toBeGreaterThanOrEqual(2);
        expect(entries.length, `${q.id}/${o.id}`).toBeLessThanOrEqual(4);
        for (const [archetype, w] of entries) {
          expect(ARCHETYPES).toContain(archetype);
          expect(w).toBeGreaterThanOrEqual(0);
          expect(w).toBeLessThanOrEqual(3);
        }
      }
    }
  });

  it('keeps slider anchors on the axis', () => {
    for (const q of QUESTIONS) {
      if (q.kind !== 'axis') continue;
      expect(new Set(q.anchors.map((a) => a.archetype)).size).toBe(q.anchors.length);
      for (const a of q.anchors) {
        expect(a.at).toBeGreaterThanOrEqual(0);
        expect(a.at).toBeLessThanOrEqual(100);
      }
    }
  });

  it('points party flavor conditions at real questions and options', () => {
    for (const p of PARTIES) {
      for (const c of p.flavor.when) {
        if (c.type === 'always') continue;
        const q = QUESTIONS.find((x) => x.id === c.questionId);
        expect(q, `${p.id} → ${c.questionId}`).toBeDefined();
        if (c.type === 'choice' && q?.kind === 'choice') {
          for (const id of c.optionIds) expect(q.options.map((o) => o.id)).toContain(id);
        }
      }
    }
  });
});
