import { useState, useEffect, useRef } from "react";
import { Clock, Crosshair, Award } from "lucide-react";

function shuffleArray(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function FocusGame({ onComplete, challenge, level = 1 }) {
  const target = challenge?.target || { emoji: "🚗", name: "Car" };
  const targetClicksNeeded = challenge?.targetCount || 3;

  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(Math.max(15, 35 - ((level - 1) * 2)));
  const [gridItems, setGridItems] = useState(challenge?.cells || []);
  const [currentTarget] = useState(target);
  const [lastClickedIndex, setLastClickedIndex] = useState(null);
  const [isWrongIndex, setIsWrongIndex] = useState(null);

  const startTimeRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const performanceRef = useRef({ correct: 0, wrong: 0 });

  useEffect(() => setGridItems(shuffleArray(challenge?.cells || [])), [challenge]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const finishGame = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const { correct, wrong } = performanceRef.current;
    const totalAttempts = correct + wrong;
    const accuracy = totalAttempts > 0 ? Math.round((correct / totalAttempts) * 100) : 0;
    const totalTimeMs = Date.now() - startTimeRef.current;
    const expectedTimeMs = Math.max(15000, (35 - ((level - 1) * 2)) * 1000);
    const speedScore = Math.max(0, Math.min(100, Math.round(100 * (expectedTimeMs / Math.max(expectedTimeMs, totalTimeMs)))));
    const completionScore = Math.round((Math.min(correct, targetClicksNeeded) / targetClicksNeeded) * 100);
    const finalScore = Math.max(0, Math.min(100, Math.round(
      (accuracy * 0.5) + (speedScore * 0.3) + (completionScore * 0.2)
    )));

    onComplete({
      score: finalScore,
      accuracy,
      timeMs: totalTimeMs,
      metrics: {
        correctCount: correct,
        wrongCount: wrong,
        speedScore,
        completionScore,
        levelReached: level,
        totalTimeSeconds: Math.round(totalTimeMs / 1000)
      }
    });
  };

  const handleCellClick = (item, index) => {
    if (finishedRef.current || lastClickedIndex === index) return;

    if (item === currentTarget.emoji) {
      // Correct click
      setLastClickedIndex(index);
      const newScore = score + 20;
      const newCorrect = correctCount + 1;
      performanceRef.current.correct = newCorrect;
      setScore(newScore);
      setCorrectCount(newCorrect);

      setTimeout(() => setLastClickedIndex(null), 150);

      // Check level progression
      if (newCorrect % targetClicksNeeded === 0) {
        setTimeout(() => finishGame(), 300);
      } else {
        // Reshuffle grid to move target position
        setGridItems(shuffleArray(gridItems));
      }
    } else {
      // Wrong click
      setIsWrongIndex(index);
      const newWrong = wrongCount + 1;
      performanceRef.current.wrong = newWrong;
      setWrongCount(newWrong);
      setScore(prev => Math.max(0, prev - 10));
      setTimeout(() => setIsWrongIndex(null), 300);
    }
  };

  // Format timer MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const currentProgress = Math.min(correctCount, targetClicksNeeded);
  const totalNeeded = targetClicksNeeded;

  return (
    <div className="game-container game-focus-theme">
      {/* Top Header Bar matching reference: Level 2/5 | Target Car | Time 00:25 | Score 120 */}
      <div className="game-header-bar">
        <div className="game-header-stat">
          <span className="stat-sub">Level</span>
          <span className="stat-main">{level}/10</span>
        </div>

        <div className="game-header-stat">
          <span className="stat-sub">Target</span>
          <span className="stat-main target-badge">
            <span className="target-emoji">{currentTarget.emoji}</span> {currentTarget.name}
          </span>
        </div>

        <div className="game-header-stat">
          <span className="stat-sub">Time</span>
          <span className="stat-main time-val">{formatTime(timeLeft)}</span>
        </div>

        <div className="game-header-stat">
          <span className="stat-sub">Score</span>
          <span className="stat-main score-val">{score}</span>
        </div>
      </div>

      {/* Main Game Play Area */}
      <div className="game-play-area">
        <h2 className="game-prompt-title">
          Click only on the <span className="highlight-target">{currentTarget.emoji} {currentTarget.name}</span>
        </h2>

        {/* 4x3 Grid matching reference image */}
        <div className="focus-grid-4x3">
          {gridItems.map((item, idx) => {
            const isTarget = item === currentTarget.emoji;
            const isClicked = lastClickedIndex === idx;
            const isWrong = isWrongIndex === idx;

            return (
              <button
                key={idx}
                type="button"
                className={`focus-card-cell ${isClicked ? "cell-correct" : ""} ${isWrong ? "cell-wrong" : ""}`}
                onClick={() => handleCellClick(item, idx)}
              >
                <span className="cell-emoji">{item}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Progress Bar: Progress 6/10 */}
        <div className="game-bottom-progress">
          <div className="progress-labels">
            <span>Progress</span>
              <span>{currentProgress}/{totalNeeded}</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill cyan-fill"
              style={{ width: `${Math.min(100, (currentProgress / totalNeeded) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
