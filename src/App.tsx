import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { Toast } from './components/Toast';
import { COPY } from './data/copy';
import { PARTIES, partyById } from './data/parties';
import { QUESTIONS, QUESTION_COUNT } from './data/questions';
import type { Answer, Answers } from './data/types';
import { track } from './lib/analytics';
import { matchSentence, sharedStances, shareText } from './lib/identity';
import { flavorLine, pickBody } from './lib/microcopy';
import { parseHash, routeToHash, sameRoute, type Route } from './lib/router';
import { computeResult, topMatches } from './lib/score';
import { resultUrl } from './lib/share';
import { clearState, loadState, saveState } from './lib/storage';
import { Intro } from './pages/Intro';
import { Loading } from './pages/Loading';
import { Quiz } from './pages/Quiz';
import { Result } from './pages/Result';
import { Sources } from './pages/Sources';
import { TextPage } from './pages/TextPage';

const LOADING_MS = import.meta.env.MODE === 'test' ? 0 : prefersReducedMotion() ? 600 : 1100;

/** An untouched slider answered with "המשך" means exactly the middle. */
const AXIS_DEFAULT = 50;

export default function App() {
  const [answers, setAnswers] = useState<Answers>(() => loadState(QUESTIONS));
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const result = useMemo(() => computeResult(QUESTIONS, answers), [answers]);
  const firstUnvisited = QUESTIONS.findIndex((q) => answers[q.id] === undefined);
  const allVisited = firstUnvisited === -1;

  useEffect(() => saveState(answers), [answers]);

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

  // Guards: no jumping ahead of unvisited questions; results only after going through the quiz.
  const guarded = useMemo<Route>(() => {
    if (route.name === 'question') {
      const reachable = allVisited ? QUESTION_COUNT - 1 : firstUnvisited;
      return route.index > reachable ? { name: 'question', index: reachable } : route;
    }
    if (route.name === 'result' && !allVisited) return { name: 'question', index: firstUnvisited };
    return route;
  }, [route, allVisited, firstUnvisited]);

  useEffect(() => {
    if (!sameRoute(guarded, route)) navigate(guarded, true);
  }, [guarded, route, navigate]);

  // Move focus to the page heading on every step, so screen readers announce it.
  const screenKey = loading ? 'loading' : routeToHash(guarded);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('page-title')?.focus({ preventScroll: true });
  }, [screenKey]);

  /** After the last question: the short "placing you on the map" beat, then the result. */
  const showResult = useCallback(
    (current: Answers) => {
      track('quiz_complete', { party: computeResult(QUESTIONS, current).winner });
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
      if (from < QUESTION_COUNT - 1) navigate({ name: 'question', index: from + 1 });
      else showResult(current);
    },
    [showResult, navigate],
  );

  const setAnswer = (questionId: string, answer: Answer) => setAnswers((prev) => ({ ...prev, [questionId]: answer }));

  const restart = () => {
    clearState();
    setAnswers({});
    track('retake');
    navigate({ name: 'question', index: 0 });
  };

  const goHome = () => navigate({ name: 'intro' });
  const goMethodology = () => navigate({ name: 'methodology' });
  const clearToast = useCallback(() => setToast(null), []);

  const stances = useMemo(() => sharedStances(QUESTIONS, answers, result.winner), [answers, result.winner]);

  let screen: ReactElement;
  if (loading) {
    screen = <Loading durationMs={LOADING_MS} />;
  } else {
    switch (guarded.name) {
      case 'intro':
        screen = (
          <Intro
            resumeAt={!allVisited && firstUnvisited > 0 ? firstUnvisited : null}
            hasResult={allVisited}
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
            onNext={() => {
              let next = answers;
              if (question.kind === 'axis' && answers[question.id]?.kind !== 'axis') {
                next = { ...answers, [question.id]: { kind: 'axis', value: AXIS_DEFAULT, untouched: true } };
                setAnswers(next);
              }
              advance(index, next);
            }}
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
      case 'result': {
        const party = partyById(result.winner);
        const runnersUp = topMatches(result)
          .slice(1)
          .map((m) => ({ party: partyById(m.party), percent: m.percent }));
        screen = (
          <Result
            party={party}
            percent={result.percent}
            body={pickBody(party, answers)}
            match={matchSentence(party.shortName, stances)}
            flavor={result.answeredIds.length === 0 ? COPY.result.noOpinion : flavorLine(party, answers)}
            shareText={shareText(party.shortName, result.percent, stances)}
            shareUrl={resultUrl(party.id)}
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
            <Sources />
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

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
