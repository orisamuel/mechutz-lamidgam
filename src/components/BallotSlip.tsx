interface Props {
  letters: string | null;
  name: string;
  size: 'large' | 'small' | 'mini' | 'fan';
}

/** Typographic Israeli ballot slip: letters on top, list name below. Decorative (name is in the h1). */
export function BallotSlip({ letters, name, size }: Props) {
  return (
    <div className={`slip slip--${size}${letters ? '' : ' slip--no-letters'}`} aria-hidden="true">
      <div className="slip__frame">
        {letters && <div className="slip__letters">{letters}</div>}
        {size !== 'mini' && <div className="slip__name">{name}</div>}
      </div>
    </div>
  );
}
