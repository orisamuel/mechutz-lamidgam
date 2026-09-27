import { COPY } from '../data/copy';

/** "איך זה עובד?" plus the update date, the way Israeli election compasses sign off. */
export function Footer({ onMethodology }: { onMethodology: () => void }) {
  return (
    <footer className="footer">
      <button type="button" className="link-button" onClick={onMethodology}>
        {COPY.footer.methodology}
      </button>
      <span className="footer__updated">{COPY.footer.updated}</span>
    </footer>
  );
}
