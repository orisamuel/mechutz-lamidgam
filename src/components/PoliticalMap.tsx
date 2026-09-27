import { AXES, AXIS_ORDER } from '../data/axes';
import { COPY } from '../data/copy';
import type { AxisReading } from '../lib/identity';

/** Four absurd axes. Physically left→right like every Israeli TV political map. */
export function PoliticalMap({ readings }: { readings: AxisReading[] }) {
  return (
    <ul className="pmap">
      {AXIS_ORDER.map((axis) => {
        const def = AXES[axis];
        const reading = readings.find((r) => r.axis === axis);
        const text = reading ? reading.descriptor : COPY.map.abstained;
        return (
          <li key={axis} className={`pmap__row${reading ? '' : ' is-abstained'}`}>
            <div className="pmap__poles" dir="ltr" aria-hidden="true">
              <span>{def.left}</span>
              <span>{def.right}</span>
            </div>
            <div className="pmap__track" dir="ltr" aria-hidden="true">
              <span className="pmap__center" />
              {reading && <span className="pmap__marker" style={{ left: `${reading.value}%` }} />}
            </div>
            <p className="pmap__label">
              <span className="sr-only">
                {def.left} מול {def.right}:{' '}
              </span>
              {text}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
