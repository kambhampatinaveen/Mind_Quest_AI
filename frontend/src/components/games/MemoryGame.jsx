import { useState, useEffect, useRef } from "react";

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function MemoryGame({ onComplete, challenge, level = 1 }) {
  const [levelState] = useState(level);
  const [targetItems, setTargetItems] = useState(challenge?.sequence || []);
  const [testChoices, setTestChoices] = useState(challenge?.choices || []);

  const [phase, setPhase] = useState("memorize"); // "memorize" | "recall"
  const [countdown, setCountdown] = useState(challenge?.displaySeconds || 5);
  const [score, setScore] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [correctSelections, setCorrectSelections] = useState(0);
  const [wrongSelections, setWrongSelections] = useState(0);

  const startTimeRef = useRef(Date.now());
  const finishedRef = useRef(false);

  const initChallenge = () => {
    setTargetItems(challenge?.sequence || []);
    setTestChoices(shuffle(challenge?.choices || challenge?.sequence || []));
    setSelectedItems([]);
    setPhase("memorize");
    setCountdown(challenge?.displaySeconds || 5);
  };

  useEffect(() => initChallenge(), [challenge]);

  // Memorize Countdown
  useEffect(() => {
    if (phase !== "memorize") return;

    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setPhase("recall");
    }
  }, [countdown, phase]);

  const finishGame = (finalCorrect, finalWrong) => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const timeMs = Date.now() - startTimeRef.current;
    const finalAttempts = finalCorrect + finalWrong;
    const accuracy = finalAttempts > 0 ? Math.round((finalCorrect / finalAttempts) * 100) : 0;
    const completionScore = Math.round((finalCorrect / Math.max(1, targetItems.length)) * 100);
    const difficultyScore = Math.min(100, 50 + (level * 5));
    const finalScore = Math.max(0, Math.min(100, Math.round(
      (accuracy * 0.65) + (completionScore * 0.2) + (difficultyScore * 0.15)
    )));
    onComplete({
      score: finalScore,
      accuracy,
      timeMs,
      metrics: {
        levelsCompleted: level,
        correctCount: finalCorrect,
        wrongCount: finalWrong,
        sequenceLength: targetItems.length,
        difficultyScore
      }
    });
  };

  const handleSelectItem = (item) => {
    if (phase !== "recall" || selectedItems.includes(item)) return;

    const isCorrect = targetItems.includes(item);
    const newSelected = [...selectedItems, item];
    const correctFound = newSelected.filter(x => targetItems.includes(x)).length;
    setSelectedItems(newSelected);

    if (isCorrect) {
      const finalCorrect = correctSelections + 1;
      setCorrectSelections(finalCorrect);
      setScore(s => s + 20);
    } else {
      const finalWrong = wrongSelections + 1;
      setWrongSelections(finalWrong);
      setScore(s => Math.max(0, s - 10));
    }

    if (correctFound === targetItems.length || newSelected.length >= targetItems.length + 2) {
      setTimeout(() => finishGame(
        correctSelections + (isCorrect ? 1 : 0),
        wrongSelections + (isCorrect ? 0 : 1)
      ), 500);
    }
  };

  const formatCountdown = (secs) => `00:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="game-container game-memory-theme">
      {/* Header Bar matching reference: Level 3/5 | Time 00:05 | Score 180 */}
      <div className="game-header-bar">
        <div className="game-header-stat">
          <span className="stat-sub">Level</span>
          <span className="stat-main">{levelState}/10</span>
        </div>

        <div className="game-header-stat">
          <span className="stat-sub">{phase === "memorize" ? "Memorize Time" : "Phase"}</span>
          <span className="stat-main time-val">
            {phase === "memorize" ? formatCountdown(countdown) : "Recall"}
          </span>
        </div>

        <div className="game-header-stat">
          <span className="stat-sub">Score</span>
          <span className="stat-main score-val">{score}</span>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="game-play-area">
        <h2 className="game-prompt-title">
          {phase === "memorize" ? "Memorize the items" : "Select the items you remember"}
        </h2>

        {/* 4x2 Grid Cards matching reference image */}
        {phase === "memorize" ? (
          <div className="memory-grid-4x2">
            {targetItems.map((item, idx) => (
              <div key={idx} className="memory-card-box">
                <span className="cell-emoji">{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="memory-grid-test">
            {testChoices.map((item, idx) => {
              const isSelected = selectedItems.includes(item);
              const isCorrectTarget = targetItems.includes(item);

              return (
                <button
                  key={idx}
                  type="button"
                  className={`memory-choice-btn ${isSelected ? (isCorrectTarget ? "choice-correct" : "choice-wrong") : ""}`}
                  onClick={() => handleSelectItem(item)}
                  disabled={isSelected}
                >
                  <span className="cell-emoji">{item}</span>
                </button>
              );
            })}
          </div>
        )}

        <p className="game-subtext">
          {phase === "memorize"
            ? "Remember the items. They will disappear soon!"
            : `Selected ${selectedItems.length} of ${targetItems.length} items`}
        </p>
      </div>
    </div>
  );
}
