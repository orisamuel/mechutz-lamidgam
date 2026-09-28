import { Fragment } from 'react';
import { phrase } from '../lib/phrasing';

/**
 * Display text that breaks lines only between phrases (see lib/phrasing.ts); "\n" in the copy is a
 * forced line break. `max` is the longest phrase, in characters, that fits a phone line at this size.
 */
export function Phrased({ text, max }: { text: string; max?: number }) {
  const lines = phrase(text, max).split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}
