import { useState, useEffect, useRef } from "react";

export default function ReactionGame({ onComplete, challenge, level = 1 }) {
  const [state, setState] = useState("ready"); // "ready" | "waiting" | "readyToClick" | "tooEarly" | "roundResult" | "done"
  const [round, setRound] = useState(1);
  const maxRounds = challenge?.rounds || Math.min(6, 3 + Math.floor(level / 3));

  const [bestTimeMs, setBestTimeMs] = useState(null);
  const [currentRoundTimeMs, setCurrentRoundTimeMs] = useState(null);
  const [timesHistory, setTimesHistory] = useState([]);

  const timerRef = useRef(null);
  const greenTimestampRef = useRef(0);
  const finishedRef = useRef(false);

  // Start next round
  const startRound = () => {
    setState("waiting");
    setCurrentRoundTimeMs(null);

    const minDelay = challenge?.minDelay || 900 + level * 80;
    const maxDelay = challenge?.maxDelay || 2600 + level * 160;
    const delay = minDelay + Math.random() * (maxDelay - minDelay);
    timerRef.current = setTimeout(() => {
      greenTimestampRef.current = performance.now();
      setState("readyToClick");
    }, delay);
  };

  useEffect(() => {
    startRound();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [round]);

  const handleBoxClick = () => {
    if (state === "waiting") {
      // Clicked too early!
      if (timerRef.current) clearTimeout(timerRef.current);
      setState("tooEarly");
      const failedRounds = [...timesHistory, 0];
      setTimeout(() => {
        if (round < maxRounds) {
          setTimesHistory(failedRounds);
          setRound(current => current + 1);
        } else {
          finishGame(failedRounds);
        }
      }, 1200);
      return;
    }

    if (state === "readyToClick") {
      const reactionTime = Math.round(performance.now() - greenTimestampRef.current);
      setCurrentRoundTimeMs(reactionTime);
      const newHistory = [...timesHistory, reactionTime];
      setTimesHistory(newHistory);

      if (!bestTimeMs || reactionTime < bestTimeMs) {
        setBestTimeMs(reactionTime);
      }

      setState("roundResult");

      setTimeout(() => {
        if (round < maxRounds) {
          setRound(r => r + 1);
        } else {
          finishGame(newHistory);
        }
      }, 1000);
    }
  };

  const finishGame = (times) => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const validTimes = times.filter(time => time > 0);
    const totalRounds = Math.max(maxRounds, times.length);
    const successfulRounds = validTimes.length;
    const avgTime = successfulRounds ? Math.round(validTimes.reduce((a, b) => a + b, 0) / successfulRounds) : 0;
    const bestTime = successfulRounds ? Math.min(...validTimes) : 0;
    const accuracy = Math.round((successfulRounds / totalRounds) * 100);
    const expectedTime = Math.max(180, 280 - (level * 8));
    const speedScore = successfulRounds ? Math.max(0, Math.min(100, 100 - Math.max(0, avgTime - expectedTime) * 0.12)) : 0;
    const consistency = successfulRounds > 1
      ? Math.max(0, 100 - Math.sqrt(validTimes.reduce((sum, time) => sum + ((time - avgTime) ** 2), 0) / validTimes.length))
      : successfulRounds ? 70 : 0;
    const calculatedScore = Math.max(0, Math.min(100, Math.round(
      (speedScore * 0.7) + (consistency * 0.15) + (accuracy * 0.15)
    )));

    onComplete({
      score: calculatedScore,
      accuracy,
      timeMs: avgTime,
      metrics: {
        roundsPlayed: maxRounds,
        successfulRounds,
        earlyClicks: totalRounds - successfulRounds,
        bestTimeMs: bestTime,
        averageTimeMs: avgTime,
        speedScore: Math.round(speedScore),
        consistencyScore: Math.round(consistency),
        roundTimes: times
      }
    });
  };

  const formatBestTime = (ms) => {
    if (!ms) return "0.256s";
    return `${(ms / 1000).toFixed(3)}s`;
  };

  return (
    <div className="game-container game-reaction-theme">
      {/* Header Bar matching reference: Best Time 0.256s | Time 00:00 */}
      <div className="game-header-bar">
        <div className="game-header-stat">
          <span className="stat-sub">Best Time</span>
          <span className="stat-main accent-yellow">{formatBestTime(bestTimeMs)}</span>
        </div>

        <div className="game-header-stat">
          <span className="stat-sub">Round</span>
          <span className="stat-main">{round}/{maxRounds}</span>
        </div>

        <div className="game-header-stat">
          <span className="stat-sub">Time</span>
          <span className="stat-main time-val">
            {currentRoundTimeMs ? `${currentRoundTimeMs}ms` : "00:00"}
          </span>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="game-play-area">
        <h2 className="game-prompt-title">
          Click as soon as the screen turns <span className="highlight-green">GREEN</span>
        </h2>

        {/* Big Interactive Card matching reference */}
        <div
          className={`reaction-big-card ${
            state === "readyToClick"
              ? "reaction-state-green"
              : state === "tooEarly"
              ? "reaction-state-early"
              : "reaction-state-red"
          }`}
          onClick={handleBoxClick}
        >
          <div className="reaction-card-content">
            {state === "waiting" && <span className="reaction-card-text">WAIT FOR GREEN</span>}
            {state === "readyToClick" && <span className="reaction-card-text text-green">CLICK NOW!</span>}
            {state === "tooEarly" && <span className="reaction-card-text text-early">TOO EARLY</span>}
            {state === "roundResult" && (
              <span className="reaction-card-text text-result">{currentRoundTimeMs} ms</span>
            )}
          </div>
        </div>

        <p className="game-subtext">
          {state === "tooEarly"
            ? "Patience! Wait until the box turns bright green before clicking."
            : "Keep your finger ready and tap as fast as possible upon color change."}
        </p>
      </div>
    </div>
  );
}
