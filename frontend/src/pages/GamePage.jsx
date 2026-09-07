import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import FocusGame from "../components/games/FocusGame";
import MemoryGame from "../components/games/MemoryGame";
import ReactionGame from "../components/games/ReactionGame";
import PatternGame from "../components/games/PatternGame";
import DecisionGame from "../components/games/DecisionGame";
import { Eye, Brain, Zap, Puzzle, Target, ArrowLeft } from "lucide-react";

const GAME_INFO = {
  focus: {
    title: "Focus Game",
    skill: "Focus",
    icon: Eye,
    color: "#38bdf8",
    description: "Click only on the target while ignoring moving distractions.",
    comp: FocusGame
  },
  memory: {
    title: "Memory Game",
    skill: "Memory",
    icon: Brain,
    color: "#10b981",
    description: "Memorize the items, then recall them after they disappear.",
    comp: MemoryGame
  },
  reaction: {
    title: "Reaction Game",
    skill: "Reaction",
    icon: Zap,
    color: "#f59e0b",
    description: "Click as soon as the screen turns bright green.",
    comp: ReactionGame
  },
  pattern: {
    title: "Pattern Game",
    skill: "Logic",
    icon: Puzzle,
    color: "#c084fc",
    description: "Analyze the sequence and deduce what element comes next.",
    comp: PatternGame
  },
  decision: {
    title: "Decision Game",
    skill: "Decision",
    icon: Target,
    color: "#ef4444",
    description: "Choose the best course of action in real-world scenarios.",
    comp: DecisionGame
  }
};

export default function GamePage() {
  const { game } = useParams();
  const navigate = useNavigate();
  const info = GAME_INFO[game?.toLowerCase()];

  const [phase, setPhase] = useState("ready"); // "ready" | "playing" | "completed"
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!info) return undefined;
    setSessionInfo(null);
    api.start(game?.toLowerCase())
      .then(session => { if (!cancelled) setSessionInfo(session); })
      .catch(error => console.error("Game session start failed:", error));
    return () => { cancelled = true; };
  }, [game]);

  if (!info) {
    return (
      <div className="empty-state-card">
        <h2>Game Not Found</h2>
        <p>The selected skill challenge does not exist.</p>
        <Link to="/games" className="btn-summary-primary">Back to Games</Link>
      </div>
    );
  }

  const handleStart = () => {
    setPhase("playing");
  };

  const handleReplay = async () => {
    setSessionInfo(null);
    try {
      const session = await api.start(game.toLowerCase());
      setSessionInfo(session);
      setResult(null);
      setPhase("playing");
    } catch (error) {
      console.error("Replay session start failed:", error);
    }
  };

  const handleComplete = async (gameData) => {
    setSubmitting(true);
    try {
      const res = await api.result({
        game: game.toLowerCase(),
        sessionId: sessionInfo?.sessionId,
        challengeId: sessionInfo?.challenge?.id,
        level: sessionInfo?.level,
        score: gameData.score,
        accuracy: gameData.accuracy,
        timeMs: gameData.timeMs,
        metrics: gameData.metrics || {}
      });

      setResult({
        ...gameData,
        overall: res?.analysis?.overall
      });

      const rec = res?.analysis?.suggestions?.find(s => s.skill === (game === "pattern" ? "logic" : game));
      if (rec?.text) setSuggestion(rec.text);

      setPhase("completed");
    } catch (e) {
      console.error("Game submission failed:", e);
      setResult(gameData);
      setPhase("completed");
    } finally {
      setSubmitting(false);
    }
  };

  const IconComp = info.icon;
  const GameComponent = info.comp;

  return (
    <section className="game-screen-wrapper">
      {/* Top Bar with Back Button and Skill Identity */}
      <div className="game-screen-topbar">
        <button
          type="button"
          className="back-games-btn"
          onClick={() => navigate("/games")}
        >
          <ArrowLeft size={16} />
          <span>All Games</span>
        </button>

        <div className="game-title-badge">
          <IconComp size={20} style={{ color: info.color }} />
          <span className="badge-text" style={{ color: info.color }}>{info.title}</span>
        </div>
      </div>

      {/* Ready Phase */}
      {phase === "ready" && (
        <div className="game-intro-card">
          <div className="game-intro-icon-box" style={{ borderColor: info.color, color: info.color }}>
            <IconComp size={48} />
          </div>
          <h1 className="game-intro-title">{info.title}</h1>
          <p className="game-intro-desc">{info.description}</p>
          <button
            type="button"
            className="btn-summary-primary btn-large-start"
            onClick={() => sessionInfo && handleStart()}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* Playing Phase */}
      {phase === "playing" && (
        <div className="game-active-stage">
          {submitting ? (
            <div className="saving-overlay">
              <div className="saving-spinner"></div>
              <p>Analyzing performance and saving result…</p>
            </div>
          ) : (
            <GameComponent
              onComplete={handleComplete}
              challenge={sessionInfo?.challenge}
              level={sessionInfo?.level}
            />
          )}
        </div>
      )}

      {/* Completed Phase */}
      {phase === "completed" && result && (
        <div className="game-finish-card">
          <div className="finish-trophy-icon">🏆</div>
          <h2 className="finish-title">Challenge Completed!</h2>
          <div className="finish-score-display">
            <span className="finish-score-num">{result.score}</span>
            <span className="finish-score-denom">/100</span>
          </div>

          <div className="finish-stats-strip">
            <div className="finish-stat-item">
              <span className="stat-name">Accuracy</span>
              <span className="stat-value">{result.accuracy}%</span>
            </div>
            <div className="finish-stat-item">
              <span className="stat-name">Duration</span>
              <span className="stat-value">{(result.timeMs / 1000).toFixed(2)}s</span>
            </div>
            <div className="finish-stat-item">
              <span className="stat-name">Skill</span>
              <span className="stat-value" style={{ color: info.color }}>{info.skill}</span>
            </div>
          </div>

          {suggestion && (
            <div className="finish-recommendation-box">
              <span className="rec-badge">Performance Insight</span>
              <p className="rec-text">{suggestion}</p>
            </div>
          )}

          <div className="finish-actions">
            <button
              type="button"
              className="btn-summary-primary"
              onClick={handleReplay}
            >
              Play Again
            </button>
            <button
              type="button"
              className="btn-summary-outline"
              onClick={() => navigate("/dashboard")}
            >
              View Dashboard
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
