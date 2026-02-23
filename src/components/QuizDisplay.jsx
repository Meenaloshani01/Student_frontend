import { useState } from 'react';
import './QuizDisplay.css';

export default function QuizDisplay({ data }) {
  const [selectedOptions, setSelectedOptions] = useState({});

  if (!data) return null;

  const {
    mcqs = [],
    coding_problem,
    conceptual_explanation,
  } = data;

  const setOption = (qIndex, option) => {
    setSelectedOptions((prev) => ({ ...prev, [qIndex]: option }));
  };

  return (
    <div className="quiz-display">
      {mcqs.length > 0 && (
        <section className="quiz-section">
          <h3 className="quiz-section-title">Multiple Choice</h3>
          <div className="quiz-mcqs">
            {mcqs.map((q, i) => (
              <div key={i} className="quiz-mcq-card">
                <p className="quiz-mcq-question">
                  <span className="quiz-mcq-num">Q{i + 1}.</span> {q.question || q}
                </p>
                {Array.isArray(q.options) ? (
                  <div className="quiz-mcq-options">
                    {q.options.map((opt, j) => (
                      <button
                        key={j}
                        type="button"
                        className={`quiz-mcq-opt ${
                          selectedOptions[i] === opt ? 'selected' : ''
                        }`}
                        onClick={() => setOption(i, opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  (() => {
                    const opts = q.options_dict || q.choices || [];
                    return (
                      <div className="quiz-mcq-options">
                        {opts.map((opt, j) => (
                          <button
                            key={j}
                            type="button"
                            className={`quiz-mcq-opt ${
                              selectedOptions[i] === opt ? 'selected' : ''
                            }`}
                            onClick={() => setOption(i, opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {coding_problem && (
        <section className="quiz-section">
          <h3 className="quiz-section-title">Coding Problem</h3>
          <pre className="quiz-code-block">
            <code>{typeof coding_problem === 'string' ? coding_problem : JSON.stringify(coding_problem, null, 2)}</code>
          </pre>
        </section>
      )}

      {conceptual_explanation && (
        <section className="quiz-section">
          <h3 className="quiz-section-title">Conceptual Explanation</h3>
          <div className="quiz-explanation-card">
            {typeof conceptual_explanation === 'string'
              ? conceptual_explanation
              : JSON.stringify(conceptual_explanation)}
          </div>
        </section>
      )}
    </div>
  );
}
