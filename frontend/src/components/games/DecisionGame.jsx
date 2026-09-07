import { useState, useEffect, useRef } from "react";
import { Check, X } from "lucide-react";

const SCENARIOS = [
  {
    id: 1,
    question: "You discover an accidental $500 overpayment credited to your freelance invoice by a small client. What is the most ethical and sustainable action?",
    options: [
      { key: "A", text: "Keep the money silently and hope they do not notice.", isCorrect: false },
      { key: "B", text: "Notify the client immediately and offer a refund or credit.", isCorrect: true },
      { key: "C", text: "Spend it right away before they can ask for it back.", isCorrect: false },
      { key: "D", text: "Donate the excess to charity without informing them.", isCorrect: false }
    ],
    explanation: "Transparency builds long-term professional trust and avoids legal complications."
  },
  {
    id: 2,
    question: "You receive an email from an unknown sender asking for your password. What should you do?",
    options: [
      { key: "A", text: "Reply with your password", isCorrect: false },
      { key: "B", text: "Open the attachment", isCorrect: false },
      { key: "C", text: "Ignore and report the email", isCorrect: true },
      { key: "D", text: "Forward it to your friends", isCorrect: false }
    ],
    explanation: "Credentials should never be sent over email; reporting prevents wider organizational compromise."
  },
  {
    id: 3,
    question: "A critical database outage occurs during high traffic. You have an untested hotfix and an established rollback snapshot. What should you do?",
    options: [
      { key: "A", text: "Deploy the untested hotfix directly to live production.", isCorrect: false },
      { key: "B", text: "Restore the verified rollback snapshot to stabilize service first.", isCorrect: true },
      { key: "C", text: "Shut down the entire data center and investigate tomorrow.", isCorrect: false },
      { key: "D", text: "Ignore error logs until user complaints exceed threshold.", isCorrect: false }
    ],
    explanation: "Restoring the known stable state minimizes downtime while fixes are safely tested."
  },
  {
    id: 4,
    question: "You find an unlabeled USB flash drive marked 'Executive Salaries' in the company parking lot. What is the correct procedure?",
    options: [
      { key: "A", text: "Plug it into your workstation to see who owns it.", isCorrect: false },
      { key: "B", text: "Hand it directly to IT Security without plugging it in.", isCorrect: true },
      { key: "C", text: "Copy the contents to your personal cloud drive.", isCorrect: false },
      { key: "D", text: "Leave it where you found it so someone else finds it.", isCorrect: false }
    ],
    explanation: "Unknown USBs are classic baiting vectors for malware; IT security must inspect them in a sandbox."
  },
  {
    id: 5,
    question: "You have 1 hour remaining before submitting a major exam and find an ambiguous rubric clause. How do you optimize your time?",
    options: [
      { key: "A", text: "Erase half your work and restart from scratch.", isCorrect: false },
      { key: "B", text: "Thoroughly review and polish completed sections while addressing the clause reasonably.", isCorrect: true },
      { key: "C", text: "Stop working entirely and submit immediately.", isCorrect: false },
      { key: "D", text: "Spend the full hour sending complaint messages.", isCorrect: false }
    ],
    explanation: "Protecting existing earned points while reasonably addressing ambiguity maximizes aggregate score."
  }
];

export default function DecisionGame({ onComplete, challenge, level = 1 }) {
  const [qIndex, setQIndex] = useState(0);
  const maxQuestions = 1;
  const currentScenario = challenge || SCENARIOS[0];

  const [timeLeft, setTimeLeft] = useState(challenge?.timeSeconds || 15);
  const [score, setScore] = useState(0);
  const [selectedOptionKey, setSelectedOptionKey] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const startTimeRef = useRef(Date.now());
  const finishedRef = useRef(false);

  // Countdown timer for each question
  useEffect(() => {
    setTimeLeft(currentScenario.timeSeconds || 15);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qIndex]);

  const handleTimeOut = () => {
    if (selectedOptionKey !== null || finishedRef.current) return;
    setWrongCount(w => w + 1);
    setScore(s => Math.max(0, s - 20));
    advanceQuestion(correctCount, wrongCount + 1);
  };

  const handleSelect = (option) => {
    if (selectedOptionKey !== null || finishedRef.current) return;

    setSelectedOptionKey(option.key);
    const isCorrect = option.isCorrect;

    if (isCorrect) {
      setScore(s => s + 25);
      setCorrectCount(c => c + 1);
    } else {
      setScore(s => Math.max(0, s - 15));
      setWrongCount(w => w + 1);
    }

    setTimeout(() => {
      setSelectedOptionKey(null);
      advanceQuestion(
        isCorrect ? correctCount + 1 : correctCount,
        isCorrect ? wrongCount : wrongCount + 1
      );
    }, 900);
  };

  const advanceQuestion = (curCorrect, curWrong) => {
    finishGame(curCorrect, curWrong);
  };

  const finishGame = (finalCorrect, finalWrong) => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const total = finalCorrect + finalWrong;
    const accuracy = total > 0 ? Math.round((finalCorrect / total) * 100) : 0;
    const timeMs = Date.now() - startTimeRef.current;
    const allowedTimeMs = (currentScenario.timeSeconds || 15) * 1000;
    const speedScore = Math.max(0, Math.min(100, Math.round(100 * (allowedTimeMs / Math.max(allowedTimeMs, timeMs)))));
    const difficultyScore = Math.min(100, 50 + (level * 5));
    const finalScore = Math.max(0, Math.min(100, Math.round(
      (accuracy * 0.65) + (speedScore * 0.2) + (difficultyScore * 0.15)
    )));

    onComplete({
      score: finalScore,
      accuracy,
      timeMs,
      metrics: {
        questionsTotal: maxQuestions,
        correctAnswers: finalCorrect,
        wrongAnswers: finalWrong,
        speedScore,
        difficultyScore
      }
    });
  };

  const formatTimer = (secs) => `00:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="game-container game-decision-theme">
      {/* Header Bar matching reference: Question 2/5 | Time 00:15 | Score 140 */}
      <div className="game-header-bar">
        <div className="game-header-stat">
          <span className="stat-sub">Question</span>
          <span className="stat-main">Level {level}</span>
        </div>

        <div className="game-header-stat">
          <span className="stat-sub">Time</span>
          <span className="stat-main time-val">{formatTimer(timeLeft)}</span>
        </div>

        <div className="game-header-stat">
          <span className="stat-sub">Score</span>
          <span className="stat-main score-val">{score}</span>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="game-play-area">
        {/* Scenario Card */}
        <div className="decision-scenario-card">
          <p className="decision-scenario-text">{currentScenario.question}</p>
        </div>

        {/* 4 Sleek Choice Options (A, B, C, D) matching reference */}
        <div className="decision-options-list">
          {currentScenario.options.map((opt) => {
            const isSelected = selectedOptionKey === opt.key;
            let statusClass = "";
            if (selectedOptionKey !== null) {
              if (opt.isCorrect) {
                statusClass = "decision-opt-correct";
              } else if (isSelected && !opt.isCorrect) {
                statusClass = "decision-opt-wrong";
              }
            }

            return (
              <button
                key={opt.key}
                type="button"
                className={`decision-option-card ${statusClass}`}
                onClick={() => handleSelect(opt)}
                disabled={selectedOptionKey !== null}
              >
                <div className="decision-opt-inner">
                  <span className="decision-opt-letter">{opt.key}.</span>
                  <span className="decision-opt-text">{opt.text}</span>
                </div>

                {selectedOptionKey !== null && opt.isCorrect && (
                  <div className="decision-check-icon">
                    <Check size={18} strokeWidth={3} />
                  </div>
                )}
                {selectedOptionKey === opt.key && !opt.isCorrect && (
                  <div className="decision-wrong-icon">
                    <X size={18} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p className="game-subtext">
          Evaluate risk, ethics, and consequences before making your choice.
        </p>
      </div>
    </div>
  );
}
