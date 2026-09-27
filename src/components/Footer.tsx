import { COPY } from '../data/copy';

interface Props {
  onMethodology?: () => void;
  onAccessibility: () => void;
}

export function Footer({ onMethodology, onAccessibility }: Props) {
  return (
    <footer className="footer">
      {onMethodology && (
        <>
          <button type="button" className="link-button" onClick={onMethodology}>
            {COPY.footer.methodology}
          </button>
          <span aria-hidden="true">·</span>
        </>
      )}
      <button type="button" className="link-button" onClick={onAccessibility}>
        {COPY.footer.accessibility}
      </button>
    </footer>
  );
}
