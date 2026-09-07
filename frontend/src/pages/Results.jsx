import { useEffect, useState } from "react";
import { api } from "../api";
import { Eye, Brain, Zap, Puzzle, Target, Calendar, Clock, Award } from "lucide-react";

const GAME_ICONS = {
  focus: Eye,
  memory: Brain,
  reaction: Zap,
  pattern: Puzzle,
  logic: Puzzle,
  decision: Target
};

const GAME_COLORS = {
  focus: "#38bdf8",
  memory: "#10b981",
  reaction: "#f59e0b",
  pattern: "#c084fc",
  logic: "#c084fc",
  decision: "#ef4444"
};

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.results()
      .then(res => setResults(res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? results
    : results.filter(r => r.game?.toLowerCase() === filter);

  return (
    <section className="results-history-page">
      <div className="results-header-row">
        <div>
          <h1 className="results-main-title">Challenge History</h1>
          <p className="results-sub-title">Detailed records of your cognitive performance</p>
        </div>

        {/* Filter buttons */}
        <div className="filter-pills-row">
          {["all", "focus", "memory", "reaction", "pattern", "decision"].map(f => (
            <button
              key={f}
              type="button"
              className={`filter-pill ${filter === f ? "filter-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="results-table-card">
        <div className="results-table-header">
          <span>Game</span>
          <span>Game Score</span>
          <span>Accuracy</span>
          <span>Time</span>
          <span>Date</span>
        </div>

        {loading ? (
          <div className="table-loading-row">Loading past attempts…</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty-state">
            <p>No completed challenges recorded yet.</p>
            <small>Play any game or take the full challenge to build your history.</small>
          </div>
        ) : (
          filtered.map((item) => {
            const gameKey = item.game?.toLowerCase();
            const IconComp = GAME_ICONS[gameKey] || Eye;
            const color = GAME_COLORS[gameKey] || "#38bdf8";
            const dateStr = new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            });
            const timeSecs = ((item.timeMs || 0) / 1000).toFixed(2);

            return (
              <div key={item._id} className="results-table-row">
                <div className="row-game-cell">
                  <span className="row-game-icon" style={{ color }}>
                    <IconComp size={16} />
                  </span>
                  <span className="row-game-name">
                    {gameKey === "pattern" ? "Pattern (Logic)" : gameKey[0].toUpperCase() + gameKey.slice(1)}
                  </span>
                </div>

                <div className="row-score-cell">
                  <span className="row-score-badge" style={{ borderColor: color, color }}>
                    {item.score}%
                  </span>
                </div>

                <div className="row-accuracy-cell">
                  <span>{item.accuracy}%</span>
                </div>

                <div className="row-time-cell">
                  <span>{timeSecs}s</span>
                </div>

                <div className="row-date-cell">
                  <span>{dateStr}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
