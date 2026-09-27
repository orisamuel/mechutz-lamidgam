import { COPY } from '../data/copy';

export function Footer({ onMethodology }: { onMethodology: () => void }) {
  return (
    <footer className="footer">
      <button type="button" className="link-button" onClick={onMethodology}>
        {COPY.footer.methodology}
      </button>
    </footer>
  );
}
