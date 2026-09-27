import { useEffect } from 'react';

/** Polite live region; the message clears itself. */
export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 4500);
    return () => clearTimeout(t);
  }, [message, onDone]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {message && <div className="toast">{message}</div>}
    </div>
  );
}
