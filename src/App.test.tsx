import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
import { PARTIES } from './data/parties';
import { QUESTIONS } from './data/questions';

const progress = (n: number) => `שאלה ${n} מתוך ${QUESTIONS.length}`;

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

describe('quiz flow', () => {
  it('keeps "המשך" disabled on a slider until a position is chosen', async () => {
    const user = userEvent.setup();
    render(<App />);
    await start(user);
    const next = screen.getByRole('button', { name: 'המשך' });
    expect(next).toBeDisabled();
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuetext', 'לא נבחרה עמדה');
    slider.focus();
    await user.keyboard('{End}');
    expect(slider).toHaveAttribute('aria-valuenow', '100');
    expect(slider).toHaveAttribute('aria-valuetext', 'פלאפל');
    expect(next).toBeEnabled();
  });

  it('survives a refresh mid-quiz: same question, same answer', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await start(user);
    await answerCurrent(user);
    expect(screen.getByText(progress(2))).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'מחייבת תמלול' }));

    unmount(); // "refresh": URL hash and localStorage stay
    render(<App />);
    expect(screen.getByText(progress(2))).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'מחייבת תמלול' })).toBeChecked();
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

  it('with fewer than 6 answers asks for more, then continues to a result', async () => {
    const user = userEvent.setup();
    render(<App />);
    await start(user);
    for (let i = 0; i < 5; i++) await answerCurrent(user);
    for (let i = 5; i < QUESTIONS.length; i++) await skipCurrent(user);

    expect(await screen.findByRole('heading', { name: 'נדרשות עוד עמדות' })).toBeInTheDocument();
    expect(screen.getByText(/עד עכשיו נרשמו 5/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'לסוגיות הפתוחות' }));
    expect(screen.getByText(progress(6))).toBeInTheDocument();
    await answerCurrent(user);

    const heading = await screen.findByRole('heading', { level: 1 });
    expect(PARTIES.map((p) => p.name)).toContain(heading.textContent);
    expect(screen.getByText(/סוגיות נמצאה התאמה/)).toBeInTheDocument();
  });

  it('a full run shows the winner plus two runners-up; retake starts over', async () => {
    const user = userEvent.setup();
    render(<App />);
    await start(user);
    for (let i = 0; i < QUESTIONS.length; i++) await answerCurrent(user);

    const heading = await screen.findByRole('heading', { level: 1 });
    expect(PARTIES.map((p) => p.name)).toContain(heading.textContent);
    expect(screen.getByText('זו המפלגה שהכי מתאימה לך')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'שתפו את התוצאה' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /למצע המפלגה|לעמוד המפלגה/ })).toHaveAttribute('target', '_blank');

    const runners = within(screen.getByRole('region', { name: 'ההתאמות הבאות' })).getAllByRole('listitem');
    expect(runners).toHaveLength(2);
    const percents = [screen.getAllByText(/^\d{2}%$/)[0]!, ...runners.map((r) => within(r).getByText(/^\d{1,2}%$/))].map(
      (el) => Number(el.textContent!.replace('%', '')),
    );
    expect(percents[0]).toBeGreaterThan(percents[1]!);
    expect(percents[1]).toBeGreaterThan(percents[2]!);

    await user.click(screen.getByRole('button', { name: 'עשו שוב' }));
    expect(screen.getByText(progress(1))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'המשך' })).toBeDisabled();
  });

  it('does not let a fresh visitor jump ahead via the URL', () => {
    window.history.replaceState(null, '', '#/q/9');
    render(<App />);
    expect(screen.getByText(progress(1))).toBeInTheDocument();
  });
});
