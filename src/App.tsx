import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { Toast } from './components/Toast';
import { COPY } from './data/copy';
import { PARTIES, partyForArchetype } from './data/parties';
import { QUESTIONS, QUESTION_COUNT } from './data/questions';
import type { Answer, Answers } from './data/types';
import { track } from './lib/analytics';
import { identityParts, identitySentence, shareText } from './lib/identity';
import { matchLine, pickBody } from './lib/microcopy';
import { parseHash, routeToHash, sameRoute, type Route } from './lib/router';
import { computeResult, countAnswered, MIN_ANSWERS, topMatches } from './lib/score';
import { displayUrl, siteUrl } from './lib/share';
import { clearAnswers, loadAnswers, saveAnswers } from './lib/storage';
import { Intro } from './pages/Intro';
import { Loading } from './pages/Loading';
import { NeedMore } from './pages/NeedMore';
import { Quiz } from './pages/Quiz';
import { Result } from './pages/Result';
import { TextPage } from './pages/TextPage';

const LOADING_MS = import.meta.env.MODE === 'test' ? 0 : prefersReducedMotion() ? 600 : 1100;

export default function App() {
  const [answers, setAnswers] = useState<Answers>(() => loadAnswers(QUESTIONS));
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const [loading, setLoading] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const result = useMemo(() => computeResult(QUESTIONS, answers), [answers]);
  const firstUnvisited = QUESTIONS.findIndex((q) => answers[q.id] === undefined);
  const allVisited = firstUnvisited === -1;

  useEffect(() => saveAnswers(answers), [answers]);

  // Browser back/forward and manual hash edits.
  useEffect(() => {
    const sync = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  const navigate = useCallback((next: Route, replace = false) => {
    const depth = Number(window.history.state?.depth ?? 0);
    const hash = routeToHash(next);
    if (replace) window.history.replaceState({ depth }, '', hash);
    else window.history.pushState({ depth: depth + 1 }, '', hash);
    setRoute(next);
  }, []);

  /** In-app back: real history.back() when we pushed the previous step, otherwise replace. */
  const back = useCallback(
    (fallback: Route) => {
      if (Number(window.history.state?.depth ?? 0) > 0) window.history.back();
      else navigate(fallback, true);
    },
    [navigate],
  );

  // Guards: no jumping ahead of unvisited questions, no result without enough answers.
  const guarded = useMemo<Route>(() => {
    if (route.name === 'question') {
      const reachable = allVisited ? QUESTION_COUNT - 1 : firstUnvisited;
      return route.index > reachable ? { name: 'question', index: reachable } : route;
    }
    if (route.name === 'result') {
      if (result) return route;
      return allVisited ? { name: 'needMore' } : { name: 'question', index: firstUnvisited };
    }
    if (route.name === 'needMore' && result) return { name: 'result' };
    return route;
  }, [route, result, allVisited, firstUnvisited]);

  useEffect(() => {
    if (!sameRoute(guarded, route)) navigate(guarded, true);
  }, [guarded, route, navigate]);

  // Move focus to the page heading on every step, so screen readers announce it.
  const screenKey = loading ? 'loading' : routeToHash(guarded);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('page-title')?.focus({ preventScroll: true });
  }, [screenKey]);

  const finish = useCallback(
    (current: Answers) => {
      setReviewMode(false);
      const r = computeResult(QUESTIONS, current);
      if (!r) {
        navigate({ name: 'needMore' });
        return;
      }
      track('quiz_complete', { party: partyForArchetype(r.winner).id });
      setLoading(true);
      window.setTimeout(() => {
        setLoading(false);
        navigate({ name: 'result' });
      }, LOADING_MS);
    },
    [navigate],
  );

  const advance = useCallback(
    (from: number, current: Answers) => {
      if (reviewMode) {
        if (countAnswered(QUESTIONS, current) >= MIN_ANSWERS) return finish(current);
        const next = nextOpenQuestion(current, from);
        return next === -1 ? finish(current) : navigate({ name: 'question', index: next });
      }
      if (from < QUESTION_COUNT - 1) navigate({ name: 'question', index: from + 1 });
      else finish(current);
    },
    [reviewMode, finish, navigate],
  );

  const setAnswer = (questionId: string, answer: Answer) => setAnswers((prev) => ({ ...prev, [questionId]: answer }));

  const restart = () => {
    clearAnswers();
    setAnswers({});
    setReviewMode(false);
    track('retake');
    navigate({ name: 'question', index: 0 });
  };

  const goHome = () => navigate({ name: 'intro' });
  const goMethodology = () => navigate({ name: 'methodology' });
  const clearToast = useCallback(() => setToast(null), []);

  const parts = useMemo(() => identityParts(QUESTIONS, answers), [answers]);
  const url = siteUrl();

  let screen: ReactElement;
  if (loading) {
    screen = <Loading durationMs={LOADING_MS} />;
  } else {
    switch (guarded.name) {
      case 'intro':
        screen = (
          <Intro
            resumeAt={!allVisited && firstUnvisited > 0 ? firstUnvisited : null}
            hasResult={allVisited && result !== null}
            onStart={() => {
              track('quiz_start');
              navigate({ name: 'question', index: 0 });
            }}
            onResume={() => navigate({ name: 'question', index: Math.max(0, firstUnvisited) })}
            onRestart={restart}
            onResult={() => navigate({ name: 'result' })}
            onMethodology={goMethodology}
          />
        );
        break;
      case 'question': {
        const index = guarded.index;
        const question = QUESTIONS[index]!;
        screen = (
          <Quiz
            key={question.id}
            question={question}
            index={index}
            total={QUESTION_COUNT}
            answer={answers[question.id]}
            onAnswer={(a) => setAnswer(question.id, a)}
            onNext={() => advance(index, answers)}
            onSkip={() => {
              const next: Answers = { ...answers, [question.id]: { kind: 'skip' } };
              setAnswers(next);
              advance(index, next);
            }}
            onBack={() => back(index === 0 ? { name: 'intro' } : { name: 'question', index: index - 1 })}
            onHome={goHome}
          />
        );
        break;
      }
      case 'needMore':
        screen = (
          <NeedMore
            answered={countAnswered(QUESTIONS, answers)}
            min={MIN_ANSWERS}
            onContinue={() => {
              setReviewMode(true);
              const first = nextOpenQuestion(answers, -1);
              navigate({ name: 'question', index: first === -1 ? 0 : first });
            }}
            onHome={goHome}
          />
        );
        break;
      case 'result': {
        if (!result) {
          screen = <Loading durationMs={0} />;
          break;
        }
        const party = partyForArchetype(result.winner);
        const runnersUp = topMatches(result)
          .slice(1)
          .map((m) => ({ party: partyForArchetype(m.archetype), percent: m.percent }));
        screen = (
          <Result
            party={party}
            percent={result.percent}
            body={pickBody(party, answers)}
            micro={matchLine(result, QUESTIONS, answers, party)}
            identityParts={parts}
            identity={identitySentence(parts)}
            shareText={shareText(party.name, result.percent, parts, url)}
            displayUrl={displayUrl(url)}
            runnersUp={runnersUp}
            onRetake={restart}
            onMethodology={goMethodology}
            onHome={goHome}
            onToast={setToast}
          />
        );
        break;
      }
      case 'methodology':
        screen = (
          <TextPage title={COPY.methodology.title} onBack={() => back({ name: 'intro' })} onHome={goHome}>
            {COPY.methodology.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {PARTIES.some((p) => p.portrait) && <p>{COPY.methodology.portraits}</p>}
            <p>{COPY.methodology.privacy}</p>
          </TextPage>
        );
        break;
    }
  }

  return (
    <>
      {screen}
      <Toast message={toast} onDone={clearToast} />
    </>
  );
}

/** Next skipped/unvisited question after `from`, wrapping around; -1 if none. */
function nextOpenQuestion(answers: Answers, from: number): number {
  for (let step = 1; step <= QUESTION_COUNT; step++) {
    const i = (from + step + QUESTION_COUNT) % QUESTION_COUNT;
    const a = answers[QUESTIONS[i]!.id];
    if (a === undefined || a.kind === 'skip') return i;
  }
  return -1;
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
