import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
import { PARTIES } from './data/parties';
import { COPY } from './data/copy';
import { QUESTIONS } from './data/questions';
import { STORAGE_KEY } from './lib/storage';

const progress = (n: number) => `שאלה ${n} מתוך ${QUESTIONS.length}`;
const partyNames = new RegExp(`^(${PARTIES.map((p) => p.name).join('|')})$`);

async function start(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: /^מתחילים/ }));
  expect(screen.getByText(progress(1))).toBeInTheDocument();
}

/** Answer whatever question is on screen: first option, or the right end of a slider. */
async function answerCurrent(user: UserEvent) {
  const slider = screen.queryByRole('slider');
  if (slider) {
    slider.focus();
    await user.keyboard('{End}');
  } else {
    await user.click(screen.getAllByRole('radio')[0]!);
  }
  await user.click(screen.getByRole('button', { name: 'המשך' }));
}

const skipCurrent = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'אין לי עמדה בנושא' }));
const saved = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');

describe('quiz flow', () => {
  it('opens with the next prime minister', async () => {
    const user = userEvent.setup();
    render(<App />);
    await start(user);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ראש הממשלה הבא');
  });

  it('continuing on an untouched slider records exactly the middle', async () => {
    const user = userEvent.setup();
    render(<App />);
    await start(user);
    while (!screen.queryByRole('slider')) await answerCurrent(user);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
    expect(slider).toHaveAttribute('aria-valuetext', 'בערך כמו היום'); // the middle of "כמה מפלגות"
    const next = screen.getByRole('button', { name: 'המשך' });
    expect(next).toBeEnabled();

    const sliderQuestion = QUESTIONS.find((q) => q.kind === 'axis')!;
    await user.click(next);
    expect(saved().answers[sliderQuestion.id]).toEqual({ kind: 'axis', value: 50, untouched: true });

    // Coming back, it is still untouched (and still says so).
    window.history.back();
    await waitFor(() => expect(screen.getByRole('slider')).toBeInTheDocument());
    expect(screen.getByText(COPY.quiz.sliderHint)).toBeInTheDocument();
  });

  it('dragging with the keyboard sets the value', async () => {
    const user = userEvent.setup();
    render(<App />);
    await start(user);
    while (!screen.queryByRole('slider')) await answerCurrent(user);
    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{End}');
    expect(slider).toHaveAttribute('aria-valuenow', '100');
  });

  it('survives a refresh mid-quiz: same question, same answer', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await start(user);
    await answerCurrent(user);
    expect(screen.getByText(progress(2))).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /מפעלים ממשלתיים/ }));

    unmount(); // "refresh": URL hash and localStorage stay
    render(<App />);
    expect(screen.getByText(progress(2))).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /מפעלים ממשלתיים/ })).toBeChecked();
  });

  it('browser back goes to the previous question', async () => {
    const user = userEvent.setup();
    render(<App />);
    await start(user);
    await answerCurrent(user);
    expect(screen.getByText(progress(2))).toBeInTheDocument();
    window.history.back();
    await waitFor(() => expect(screen.getByText(progress(1))).toBeInTheDocument());
  });

  it('no positions at all still gets a list (and skips the weighting step)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await start(user);
    for (let i = 0; i < QUESTIONS.length; i++) await skipCurrent(user);

    expect(await screen.findByRole('heading', { level: 1, name: 'הפיראטים' })).toBeInTheDocument();
    expect(screen.getByText('94%')).toBeInTheDocument();
    expect(screen.getByText(COPY.result.noOpinion)).toBeInTheDocument();
    // No positions, so nothing to agree on.
    expect(screen.queryByText(/גם אתם בעד/)).not.toBeInTheDocument();
  });

  it('a full run: weighting step, then the winner with two runners-up right under it', async () => {
    const user = userEvent.setup();
    render(<App />);
    await start(user);
    for (let i = 0; i < QUESTIONS.length; i++) await answerCurrent(user);

    expect(await screen.findByRole('heading', { name: 'מה הכי חשוב לכם?' })).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(QUESTIONS.length);
    await user.click(screen.getByRole('checkbox', { name: /ראש הממשלה/ }));
    await user.click(screen.getByRole('checkbox', { name: /יוקר המחיה/ }));
    expect(screen.getByText('נבחרו 2 מתוך 2')).toBeInTheDocument();
    // A third issue can't be added: "בחרו עד שני נושאים".
    const third = screen.getByRole('checkbox', { name: /מספר המפלגות/ });
    expect(third).toBeDisabled();
    expect(saved().priorities).toEqual(['pm', 'cost']);
    await user.click(screen.getByRole('button', { name: 'לתוצאה' }));

    expect(await screen.findByRole('heading', { level: 1, name: partyNames })).toBeInTheDocument();
    expect(screen.getByText('זו המפלגה שהכי מתאימה לך')).toBeInTheDocument();
    // First answer everywhere → Sharsher's four own answers win it.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('שרשר');
    expect(screen.getByText(/^כמו שרשר, גם אתם בעד הרחבת סל התרופות, כתר לנשיא טראמפ ומאבק בחרמות על ילדים\.$/)).toBeInTheDocument();
    expect(screen.queryByText(/סוגיות נמצאה התאמה/)).not.toBeInTheDocument();
    expect(screen.queryByText('המיקום שלך')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /למצע המפלגה|לעמוד המפלגה/ })).toHaveAttribute('target', '_blank');

    const runnersRegion = screen.getByRole('region', { name: 'ההתאמות הבאות' });
    const runners = within(runnersRegion).getAllByRole('listitem');
    expect(runners).toHaveLength(2);
    // Runners-up sit right under the main match, before the party's text and the share button.
    const shareButton = screen.getByRole('button', { name: 'שתפו את התוצאה' });
    expect(runnersRegion.compareDocumentPosition(shareButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const percents = [screen.getAllByText(/^\d{2}%$/)[0]!, ...runners.map((r) => within(r).getByText(/^\d{1,2}%$/))].map(
      (el) => Number(el.textContent!.replace('%', '')),
    );
    expect(percents[0]).toBeGreaterThan(percents[1]!);
    expect(percents[1]).toBeGreaterThan(percents[2]!);

    await user.click(screen.getByRole('button', { name: 'עשו שוב' }));
    expect(screen.getByText(progress(1))).toBeInTheDocument();
  });

  it('does not let a fresh visitor jump ahead via the URL', () => {
    window.history.replaceState(null, '', '#/q/9');
    render(<App />);
    expect(screen.getByText(progress(1))).toBeInTheDocument();
  });
});
