import type { ChoiceQuestion } from '../data/types';

/** Answer markers read like ballot letters. */
const MARKS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'];

interface Props {
  question: ChoiceQuestion;
  selectedId: string | null;
  onSelect: (optionId: string) => void;
}

/** Native radios (free keyboard + screen reader support), styled as answer cards. */
export function QuestionCard({ question, selectedId, onSelect }: Props) {
  return (
    <div className="options" role="radiogroup" aria-labelledby="page-title">
      {question.options.map((option, i) => {
        const checked = option.id === selectedId;
        return (
          <label key={option.id} className={`option${checked ? ' is-selected' : ''}`}>
            <input
              type="radio"
              name={question.id}
              value={option.id}
              checked={checked}
              onChange={() => onSelect(option.id)}
            />
            <span className="option__mark" aria-hidden="true">
              {MARKS[i]}
            </span>
            <span className="option__label">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
