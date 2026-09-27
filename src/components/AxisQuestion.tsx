import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { AXES } from '../data/axes';
import { COPY } from '../data/copy';
import type { AxisId } from '../data/types';
import { axisValueLabel } from '../lib/identity';

interface Props {
  axis: AxisId;
  value: number | null;
  onChange: (value: number) => void;
}

const STEP = 5;
const BIG_STEP = 20;

/**
 * Bipolar slider. Always physically left→right (value 0 on the left), even inside the RTL
 * page, so "ימין־מזגן" really is on the right. The dot starts in the middle; pressing "המשך"
 * without touching it records exactly the middle.
 */
export function AxisQuestion({ axis, value, onChange }: Props) {
  const def = AXES[axis];
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    onChange(clamp(Math.round(ratio * 100)));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
    thumbRef.current?.focus({ preventScroll: true });
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) setFromClientX(e.clientX);
  };
  const stopDrag = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const unset = value === null;
    const base = value ?? 50;
    let next: number | null = null;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = unset ? 55 : base + STEP;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = unset ? 45 : base - STEP;
        break;
      case 'PageUp':
        next = base + BIG_STEP;
        break;
      case 'PageDown':
        next = base - BIG_STEP;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = 100;
        break;
      default:
        return;
    }
    e.preventDefault();
    onChange(clamp(next));
  };

  const label = axisValueLabel(axis, value ?? 50);

  return (
    <div className="axis">
      <div className="axis__poles" dir="ltr">
        <span>{def.left}</span>
        <span>{def.right}</span>
      </div>
      <div
        className="axis__hit"
        dir="ltr"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <div className="axis__rail" ref={trackRef}>
          <div className="axis__track" />
          <div
            ref={thumbRef}
            className={`axis__thumb${value === null ? ' is-idle' : ''}`}
            style={{ left: `${value ?? 50}%` }}
            role="slider"
            tabIndex={0}
            aria-labelledby="page-title"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value ?? 50}
            aria-valuetext={label}
            aria-orientation="horizontal"
            onKeyDown={onKeyDown}
          />
        </div>
      </div>
      <p className={`axis__value${value === null ? ' is-hint' : ''}`} aria-hidden="true">
        {value === null ? COPY.quiz.sliderHint : label}
      </p>
    </div>
  );
}

function clamp(v: number): number {
  return Math.min(100, Math.max(0, v));
}
