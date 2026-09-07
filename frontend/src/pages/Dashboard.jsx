import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import SkillCard from "../components/SkillCard";
import ScoreRing from "../components/ScoreRing";
import BrainLineArt from "../components/BrainLineArt";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from "recharts";

const SKILL_COLORS = {
  Focus: "#38bdf8",
  Memory: "#10b981",
  Reaction: "#f59e0b",
  Logic: "#a855f7",
  Decision: "#ef4444"
};

const SKILL_BORDER_CLASSES = {
  Focus: "summary-pill-focus",
  Memory: "summary-pill-memory",
  Reaction: "summary-pill-reaction",
  Logic: "summary-pill-logic",
  Decision: "summary-pill-decision"
};

// Custom top label for BarChart bars
const renderCustomBarLabel = ({ x, y, width, value }) => {
  if (value === undefined || value === null) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#ffffff"
      textAnchor="middle"
      fontSize={12}
      fontWeight={600}
    >
      {value}%
    </text>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    api.dashboard()
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading-screen">
        <div className="saving-spinner"></div>
        <p>Loading your brain performance dashboard…</p>
      </div>
    );
  }

  // Fallback / initial scores if new user
  const scores = data?.skillScores || { focus: 0, memory: 0, reaction: 0, logic: 0, decision: 0 };
  const overall = data?.overall || 0;
  const progressByGame = Object.fromEntries((data?.gameProgress || []).map(item => [item.game, item]));

  // Bar chart data formatted for Recharts
  const barChartData = [
    { name: "Focus", score: scores.focus || 0 },
    { name: "Memory", score: scores.memory || 0 },
    { name: "Reaction", score: scores.reaction || 0 },
    { name: "Logic", score: scores.logic || 0 },
    { name: "Decision", score: scores.decision || 0 }
  ];

  return (
    <section className="dashboard-wrapper">
      {/* Dashboard Page Header matching reference */}
      <div className="dashboard-header-area">
        <div>
          <h1 className="dashboard-main-title">Your Performance Dashboard</h1>
          <p className="dashboard-sub-title">Here is your overall brain performance</p>
        </div>

        <button
          type="button"
          className="btn-play-all-glow btn-header-challenge"
          onClick={() => navigate("/challenge")}
        >
          Play Challenge
        </button>
      </div>

      {/* 5 Skill Cards in a row across the top matching reference */}
      <div className="dashboard-skills-row">
        <SkillCard skill="focus" score={scores.focus} level={progressByGame.focus?.level || 1} />
        <SkillCard skill="memory" score={scores.memory} level={progressByGame.memory?.level || 1} />
        <SkillCard skill="reaction" score={scores.reaction} level={progressByGame.reaction?.level || 1} />
        <SkillCard skill="logic" score={scores.logic} level={progressByGame.pattern?.level || 1} />
        <SkillCard skill="decision" score={scores.decision} level={progressByGame.decision?.level || 1} />
      </div>

      {/* Middle Row: Overall Score Ring & Performance Summary */}
      <div className="dashboard-middle-grid">
        {/* Overall Score Circular Ring Card */}
        <div className="dashboard-card score-ring-panel">
          <ScoreRing score={overall} size={190} strokeWidth={14} />
        </div>

        {/* Performance Summary Card matching reference with neon brain line-art */}
        <div className="dashboard-card performance-summary-panel">
          <div className="summary-text-col">
            <h3 className="summary-panel-title">Performance Summary</h3>
            <p className="summary-lead-text">
              {overall >= 85
                ? "Great job! You have a strong and balanced brain performance."
                : overall >= 60
                ? "Good baseline cognitive performance across tested categories."
                : "Complete challenges to evaluate and strengthen your cognitive abilities."}
            </p>
            <p className="summary-sub-text">
              Keep practicing to improve even more!
            </p>

            <button
              type="button"
              className="btn-summary-primary btn-summary-play"
              onClick={() => navigate("/challenge")}
            >
              Play Again
            </button>
          </div>

          {/* Glowing Neon Brain Line Art on Right */}
          <div className="summary-brain-col">
            <BrainLineArt size={135} />
          </div>
        </div>
      </div>

      {/* Bottom Section: DETAILED PERFORMANCE (Skill Performance Comparison) */}
      <div className="dashboard-detailed-performance-card">
        <div className="detailed-card-header">
          <h3 className="detailed-chart-title">Skill Performance Comparison</h3>
        </div>

        {/* Recharts Bar Chart matching reference image */}
        <div className="barchart-container">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={barChartData}
              margin={{ top: 25, right: 20, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#16263f" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#6b7c99"
                tick={{ fill: "#9aa9c3", fontSize: 13, fontWeight: 500 }}
                axisLine={{ stroke: "#1c3253" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
                stroke="#6b7c99"
                tick={{ fill: "#6b7c99", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
                <Tooltip
                contentStyle={{
                  backgroundColor: "#061226",
                  borderColor: "#1e375a",
                  borderRadius: "8px",
                  color: "#fff"
                }}
                formatter={(val) => [`${val}%`, "Skill Score"]}
              />
              <Bar
                dataKey="score"
                radius={[6, 6, 0, 0]}
                label={renderCustomBarLabel}
                animationDuration={1000}
              >
                {barChartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={SKILL_COLORS[entry.name] || "#38bdf8"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 5 Summary Stat Badges below the chart matching reference bottom-center */}
        <div className="detailed-summary-pills-row">
          {barChartData.map((item) => {
            const color = SKILL_COLORS[item.name];
            const skillKey = item.name === "Logic" ? "logic" : item.name.toLowerCase();
            const tier = data?.skillStatus?.[skillKey] || "Not Played";
            const borderClass = SKILL_BORDER_CLASSES[item.name];

            return (
              <div key={item.name} className={`detailed-pill-card ${borderClass}`}>
                <span className="pill-skill-name" style={{ color }}>{item.name}</span>
                <span className="pill-score-val">{item.score}%</span>
                <span className="pill-tier-tag" style={{ color }}>{tier}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
