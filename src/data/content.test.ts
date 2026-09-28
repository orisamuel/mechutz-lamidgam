import { describe, expect, it } from 'vitest';
import { AXES } from './axes';
import { COPY } from './copy';
import { PARTY_IDS } from './partyIds';
import { PARTIES } from './parties';
import { POSITIONS, type PositionId } from './positions';
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
    if (q.kind === 'choice') q.options.forEach((o) => out.push(o.label, o.stance));
  }
  Object.values(AXES).forEach((a) => out.push(a.left, a.right, ...a.valueLabels, ...a.stances));
  PARTIES.forEach((p) => out.push(p.name, p.shortName, p.officialName, p.title, ...p.bodies, p.flavor.text));
  Object.values(POSITIONS).forEach((p) => out.push(p.outlet));
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

  it('gives each slider question its own axis', () => {
    const axes = QUESTIONS.flatMap((q) => (q.kind === 'axis' ? [q.axis] : []));
    expect([...axes].sort()).toEqual(Object.keys(AXES).sort());
  });

  it('gives each choice answer 1–3 points to 1–3 lists', () => {
    for (const q of QUESTIONS) {
      if (q.kind !== 'choice') continue;
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
      for (const o of q.options) {
        const entries = Object.entries(o.weights);
        expect(entries.length, `${q.id}/${o.id}`).toBeGreaterThanOrEqual(1);
        expect(entries.length, `${q.id}/${o.id}`).toBeLessThanOrEqual(3);
        for (const [party, w] of entries) {
          expect(PARTY_IDS).toContain(party);
          expect(w).toBeGreaterThanOrEqual(1);
          expect(w).toBeLessThanOrEqual(3);
        }
      }
    }
  });

  it('keeps slider anchors on the axis, one per list', () => {
    for (const q of QUESTIONS) {
      if (q.kind !== 'axis') continue;
      expect(new Set(q.anchors.map((a) => a.party)).size).toBe(q.anchors.length);
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

describe('every point is backed by a published position', () => {
  it('each list that gets points from an answer has a position of its own behind it, and vice versa', () => {
    for (const q of QUESTIONS) {
      if (q.kind !== 'choice') continue;
      for (const o of q.options) {
        const weighted = Object.keys(o.weights).sort();
        const backed = [...new Set(o.basis.map((id) => POSITIONS[id].party))].sort();
        expect(backed, `${q.id}/${o.id}`).toEqual(weighted);
      }
    }
  });

  it('each slider anchor stands on a position of that list', () => {
    for (const q of QUESTIONS) {
      if (q.kind !== 'axis') continue;
      for (const a of q.anchors) {
        expect(a.basis.length, `${q.id}/${a.party}`).toBeGreaterThan(0);
        for (const id of a.basis) expect(POSITIONS[id].party, `${q.id}/${a.party}`).toBe(a.party);
      }
    }
  });

  it("the result texts cite only the list's own positions", () => {
    for (const p of PARTIES) {
      expect(p.basis.length, p.id).toBeGreaterThan(0);
      for (const id of p.basis) expect(POSITIONS[id].party, `${p.id} → ${id}`).toBe(p.id);
    }
  });

  it('keeps no unused positions, and every source is a real https link with a date', () => {
    const used = new Set<PositionId>([
      ...QUESTIONS.flatMap((q) => (q.kind === 'choice' ? q.options.flatMap((o) => o.basis) : q.anchors.flatMap((a) => a.basis))),
      ...PARTIES.flatMap((p) => p.basis),
    ]);
    for (const [id, position] of Object.entries(POSITIONS)) {
      expect(used.has(id as PositionId), `unused position ${id}`).toBe(true);
      expect(position.url, id).toMatch(/^https:\/\/[^\s]+$/);
      expect(position.date, id).toMatch(/^20\d\d(-\d\d-\d\d)?$/);
      expect(id.startsWith(`${position.party}/`), id).toBe(true);
    }
  });

  it('gives every list its own answers in at least five questions', () => {
    for (const party of PARTY_IDS) {
      const own = QUESTIONS.filter((q) =>
        q.kind === 'choice' ? q.options.some((o) => o.weights[party] === 3) : q.anchors.some((a) => a.party === party),
      );
      expect(own.length, party).toBeGreaterThanOrEqual(5);
    }
  });
});
