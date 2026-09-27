import { AxisQuestion } from '../components/AxisQuestion';
import { Masthead } from '../components/Masthead';
import { Progress } from '../components/Progress';
import { QuestionCard } from '../components/QuestionCard';
import { COPY } from '../data/copy';
import type { Answer, Question } from '../data/types';

interface Props {
  question: Question;
  index: number;
  total: number;
  answer: Answer | undefined;
  onAnswer: (answer: Answer) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onHome: () => void;
}

export function Quiz({ question, index, total, answer, onAnswer, onNext, onBack, onSkip, onHome }: Props) {
  const selectedId = answer?.kind === 'choice' ? answer.optionId : null;
  const value = answer?.kind === 'axis' ? answer.value : null;
  // Sliders can always continue: untouched means exactly the middle.
  const canContinue = question.kind === 'choice' ? selectedId !== null : true;

  return (
    <div className="page">
      <Masthead onHome={onHome} />
      <main id="main" className="shell shell--quiz">
        <div className="card question">
          <Progress current={index + 1} total={total} category={question.category} />
          <h1 id="page-title" className="question__prompt" tabIndex={-1}>
            {question.prompt}
          </h1>

          {question.kind === 'choice' ? (
            <QuestionCard
              question={question}
              selectedId={selectedId}
              onSelect={(optionId) => onAnswer({ kind: 'choice', optionId })}
            />
          ) : (
            <AxisQuestion axis={question.axis} value={value} onChange={(v) => onAnswer({ kind: 'axis', value: v })} />
          )}

          <div className="question__actions">
            <button type="button" className="btn btn--primary" onClick={onNext} disabled={!canContinue}>
              {COPY.quiz.next}
            </button>
            <button type="button" className="btn btn--ghost" onClick={onBack}>
              {COPY.quiz.back}
            </button>
          </div>
          <button type="button" className="link-button question__skip" onClick={onSkip}>
            {COPY.quiz.skip}
          </button>
        </div>
      </main>
    </div>
  );
}
