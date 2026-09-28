import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { Toast } from './components/Toast';
import { COPY } from './data/copy';
import { PARTIES, partyById } from './data/parties';
import { QUESTIONS, QUESTION_COUNT } from './data/questions';
import type { Answer, Answers } from './data/types';
import { track } from './lib/analytics';
import { cardStances, matchSentence, sharedStances, shareText } from './lib/identity';
import { flavorLine, pickBody } from './lib/microcopy';
import { parseHash, routeToHash, sameRoute, type Route } from './lib/router';
import { computeResult, isAnswered, topMatches } from './lib/score';
import { displayUrl, siteUrl } from './lib/share';
import { clearState, loadState, saveState } from './lib/storage';
import { Intro } from './pages/Intro';
import { Loading } from './pages/Loading';
import { Priorities } from './pages/Priorities';
import { Quiz } from './pages/Quiz';
import { Result } from './pages/Result';
import { Sources } from './pages/Sources';
import { TextPage } from './pages/TextPage';

const LOADING_MS = import.meta.env.MODE === 'test' ? 0 : prefersReducedMotion() ? 600 : 1100;

/** "בחרו עד שני נושאים" — the importance step caps how many issues count double. */
const MAX_PRIORITIES = 2;
/** An untouched slider answered with "המשך" means exactly the middle. */
const AXIS_DEFAULT = 50;

export default function App() {
  const [initial] = useState(() => loadState(QUESTIONS));
  const [answers, setAnswers] = useState<Answers>(initial.answers);
  const [priorities, setPriorities] = useState<string[]>(initial.priorities);
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const result = useMemo(() => computeResult(QUESTIONS, answers, priorities), [answers, priorities]);
  const firstUnvisited = QUESTIONS.findIndex((q) => answers[q.id] === undefined);
  const allVisited = firstUnvisited === -1;
  const answeredQuestions = QUESTIONS.filter((q) => isAnswered(answers[q.id]));

  useEffect(() => saveState(answers, priorities), [answers, priorities]);

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
    if ((route.name === 'result' || route.name === 'priorities') && !allVisited) {
      return { name: 'question', index: firstUnvisited };
    }
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

  /** The short "placing you on the map" beat, then the result. */
  const showResult = useCallback(
    (current: Answers, chosen: string[]) => {
      track('quiz_complete', { party: computeResult(QUESTIONS, current, chosen).winner });
      setLoading(true);
      window.setTimeout(() => {
        setLoading(false);
        navigate({ name: 'result' });
      }, LOADING_MS);
    },
    [navigate],
  );

  /** After the last question: the weighting step, unless there is nothing to weigh. */
  const finish = useCallback(
    (current: Answers) => {
      if (QUESTIONS.some((q) => isAnswered(current[q.id]))) navigate({ name: 'priorities' });
      else showResult(current, []);
    },
    [navigate, showResult],
  );

  const advance = useCallback(
    (from: number, current: Answers) => {
      if (from < QUESTION_COUNT - 1) navigate({ name: 'question', index: from + 1 });
      else finish(current);
    },
    [finish, navigate],
  );

  const setAnswer = (questionId: string, answer: Answer) => setAnswers((prev) => ({ ...prev, [questionId]: answer }));

  const restart = () => {
    clearState();
    setAnswers({});
    setPriorities([]);
    track('retake');
    navigate({ name: 'question', index: 0 });
  };

  const goHome = () => navigate({ name: 'intro' });
  const goMethodology = () => navigate({ name: 'methodology' });
  const clearToast = useCallback(() => setToast(null), []);

  const stances = useMemo(
    () => sharedStances(QUESTIONS, answers, result.winner, priorities),
    [answers, result.winner, priorities],
  );
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
      case 'priorities':
        screen = (
          <Priorities
            questions={answeredQuestions}
            selected={priorities}
            max={MAX_PRIORITIES}
            onToggle={(id) =>
              setPriorities((prev) =>
                prev.includes(id) ? prev.filter((p) => p !== id) : prev.length < MAX_PRIORITIES ? [...prev, id] : prev,
              )
            }
            onContinue={() => showResult(answers, priorities)}
            onSkip={() => {
              setPriorities([]);
              showResult(answers, []);
            }}
            onHome={goHome}
          />
        );
        break;
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
            identity={cardStances(stances)}
            shareText={shareText(party.shortName, result.percent, stances, url)}
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
