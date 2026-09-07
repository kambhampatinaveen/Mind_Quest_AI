import { Link, useNavigate } from "react-router-dom";
import { Eye, Brain, Zap, Puzzle, Target } from "lucide-react";

const GAME_CARDS = [
  {
    key: "focus",
    title: "Focus Game",
    description: "Test your ability to stay focused",
    icon: Eye,
    colorClass: "card-focus",
    accentColor: "#38bdf8"
  },
  {
    key: "memory",
    title: "Memory Game",
    description: "Test your short term memory",
    icon: Brain,
    colorClass: "card-memory",
    accentColor: "#10b981"
  },
  {
    key: "reaction",
    title: "Reaction Game",
    description: "Test your reaction speed",
    icon: Zap,
    colorClass: "card-reaction",
    accentColor: "#f59e0b"
  },
  {
    key: "pattern",
    title: "Pattern Game",
    description: "Test your logical thinking",
    icon: Puzzle,
    colorClass: "card-logic",
    accentColor: "#c084fc"
  },
  {
    key: "decision",
    title: "Decision Game",
    description: "Test your decision making skills",
    icon: Target,
    colorClass: "card-decision",
    accentColor: "#ef4444"
  }
];

export default function GameSelect() {
  const navigate = useNavigate();

  return (
    <section className="game-select-section">
      {/* Header matching reference: Select a Game | Choose a skill to challenge */}
      <div className="select-header-area">
        <h1 className="select-main-title">Select a Game</h1>
        <p className="select-sub-title">Choose a skill to challenge</p>
      </div>

      {/* 5 Vertical Game Cards matching reference image */}
      <div className="select-cards-grid">
        {GAME_CARDS.map((card) => {
          const IconComp = card.icon;
          return (
            <Link
              key={card.key}
              to={`/games/${card.key}`}
              className={`select-game-tile ${card.colorClass}`}
            >
              <div className="select-tile-icon-box" style={{ color: card.accentColor }}>
                <IconComp size={36} />
              </div>
              <h3 className="select-tile-title">{card.title}</h3>
              <p className="select-tile-desc">{card.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Centered Large "Play All Games" Button matching reference image */}
      <div className="select-bottom-action">
        <button
          type="button"
          className="btn-play-all-glow"
          onClick={() => navigate("/challenge")}
        >
          Play All Games
        </button>
      </div>
    </section>
  );
}
