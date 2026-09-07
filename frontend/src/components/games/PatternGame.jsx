import { useState, useRef } from "react";

// Predefined multi-level pattern challenges
const PATTERNS = [
  {
    id: 1,
    title: "Shape Alternation",
    sequence: [
      { type: "circle", color: "#38bdf8", label: "●" },
      { type: "square", color: "#10b981", label: "■" },
      { type: "circle", color: "#38bdf8", label: "●" },
      { type: "square", color: "#10b981", label: "■" },
      { type: "circle", color: "#38bdf8", label: "●" }
    ],
    correctAnswer: { type: "square", color: "#10b981", label: "■" },
    options: [
      { type: "square", color: "#10b981", label: "■" },
      { type: "triangle", color: "#ef4444", label: "▲" },
      { type: "circle", color: "#38bdf8", label: "●" },
      { type: "star", color: "#f59e0b", label: "★" }
    ]
  },
  {
    id: 2,
    title: "Tri-Color Cycle (Matches Reference)",
    sequence: [
      { type: "circle", color: "#38bdf8", label: "●" },
      { type: "square", color: "#10b981", label: "■" },
      { type: "triangle", color: "#ef4444", label: "▲" },
      { type: "circle", color: "#38bdf8", label: "●" },
      { type: "square", color: "#10b981", label: "■" }
    ],
    correctAnswer: { type: "triangle", color: "#ef4444", label: "▲" },
    options: [
      { type: "triangle", color: "#ef4444", label: "▲" },
      { type: "circle", color: "#38bdf8", label: "●" },
      { type: "square", color: "#10b981", label: "■" },
      { type: "star", color: "#f59e0b", label: "★" }
    ]
  },
  {
    id: 3,
    title: "Numeric Progression",
    sequence: [
      { type: "num", color: "#a855f7", label: "3" },
      { type: "num", color: "#a855f7", label: "6" },
      { type: "num", color: "#a855f7", label: "12" },
      { type: "num", color: "#a855f7", label: "24" },
      { type: "num", color: "#a855f7", label: "48" }
    ],
    correctAnswer: { type: "num", color: "#a855f7", label: "96" },
    options: [
      { type: "num", color: "#a855f7", label: "96" },
      { type: "num", color: "#a855f7", label: "64" },
      { type: "num", color: "#a855f7", label: "84" },
      { type: "num", color: "#a855f7", label: "108" }
    ]
  },
  {
    id: 4,
    title: "Color Spectrum Shifts",
    sequence: [
      { type: "star", color: "#f59e0b", label: "★" },
      { type: "star", color: "#ef4444", label: "★" },
      { type: "star", color: "#a855f7", label: "★" },
      { type: "star", color: "#38bdf8", label: "★" }
    ],
    correctAnswer: { type: "star", color: "#10b981", label: "★" },
    options: [
      { type: "star", color: "#10b981", label: "★" },
      { type: "star", color: "#f59e0b", label: "★" },
      { type: "circle", color: "#38bdf8", label: "●" },
      { type: "star", color: "#ef4444", label: "★" }
    ]
  },
  {
    id: 5,
    title: "Dual Alternation",
    sequence: [
      { type: "mixed", color: "#38bdf8", label: "A1" },
      { type: "mixed", color: "#10b981", label: "B2" },
      { type: "mixed", color: "#38bdf8", label: "C3" },
      { type: "mixed", color: "#10b981", label: "D4" }
    ],
    correctAnswer: { type: "mixed", color: "#38bdf8", label: "E5" },
    options: [
      { type: "mixed", color: "#38bdf8", label: "E5" },
      { type: "mixed", color: "#10b981", label: "F6" },
      { type: "mixed", color: "#ef4444", label: "E6" },
      { type: "mixed", color: "#a855f7", label: "D5" }
    ]
  }
];

export default function PatternGame({ onComplete, challenge, level = 1 }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const maxLevels = 1;
  const currentPattern = challenge || PATTERNS[0];

  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const startTimeRef = useRef(Date.now());
  const finishedRef = useRef(false);

  const handleSelectOption = (opt) => {
    if (selectedOption !== null || finishedRef.current) return;

    setSelectedOption(opt);
    const correct = opt.label === currentPattern.correctAnswer.label &&
                    opt.color === currentPattern.correctAnswer.color;

    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 25);
      setCorrectCount(c => c + 1);
    } else {
      setScore(s => Math.max(0, s - 15));
      setWrongCount(w => w + 1);
    }

    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrect(null);

      finishGame(correct ? correctCount + 1 : correctCount, wrongCount + (correct ? 0 : 1));
    }, 700);
  };

  const finishGame = (finalCorrect, finalWrong) => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const total = finalCorrect + finalWrong;
    const accuracy = total > 0 ? Math.round((finalCorrect / total) * 100) : 0;
    const timeMs = Date.now() - startTimeRef.current;
    const expectedTimeMs = Math.max(5000, 14000 - (level * 500));
    const speedScore = Math.max(0, Math.min(100, Math.round(100 * (expectedTimeMs / Math.max(expectedTimeMs, timeMs)))));
    const difficultyScore = Math.min(100, 50 + (level * 5));
    const finalScore = Math.max(0, Math.min(100, Math.round(
      (accuracy * 0.7) + (speedScore * 0.2) + (difficultyScore * 0.1)
    )));

    onComplete({
      score: finalScore,
      accuracy,
      timeMs,
      metrics: {
        levelsCompleted: maxLevels,
        correctAnswers: finalCorrect,
        wrongAnswers: finalWrong,
        speedScore,
        difficultyScore
      }
    });
  };

  return (
    <div className="game-container game-pattern-theme">
      {/* Header Bar matching reference: Level 2/5 | Score 160 */}
      <div className="game-header-bar">
        <div className="game-header-stat">
          <span className="stat-sub">Level</span>
          <span className="stat-main">{level}/10</span>
        </div>

        <div className="game-header-stat">
          <span className="stat-sub">Category</span>
          <span className="stat-main accent-purple">Logic</span>
        </div>

        <div className="game-header-stat">
          <span className="stat-sub">Score</span>
          <span className="stat-main score-val">{score}</span>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="game-play-area">
        <h2 className="game-prompt-title">What comes next?</h2>

        {/* Pattern Sequence Row matching reference */}
        <div className="pattern-sequence-box">
          {currentPattern.sequence.map((item, idx) => (
            <div key={idx} className="pattern-item-cell" style={{ color: item.color }}>
              <span className="pattern-symbol">{item.label}</span>
            </div>
          ))}

          {/* Missing Item Card with Question Mark '?' */}
          <div className="pattern-item-cell pattern-question-cell">
            <span className="pattern-symbol question-mark">?</span>
          </div>
        </div>

        {/* 4 Option Buttons below sequence matching reference */}
        <div className="pattern-options-row">
          {currentPattern.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const stateClass = isSelected
              ? isCorrect
                ? "option-correct"
                : "option-wrong"
              : "";

            return (
              <button
                key={idx}
                type="button"
                className={`pattern-option-card ${stateClass}`}
                onClick={() => handleSelectOption(opt)}
                disabled={selectedOption !== null}
              >
                <span className="pattern-symbol" style={{ color: opt.color }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        <p className="game-subtext">
          Study the sequence, identify the governing rule, and pick the matching element.
        </p>
      </div>
    </div>
  );
}
