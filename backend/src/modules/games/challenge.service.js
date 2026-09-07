const TARGETS = [
  ["car", "🚗", "Car"], ["bus", "🚌", "Bus"], ["bike", "🚲", "Bicycle"], ["football", "⚽", "Football"],
  ["apple", "🍎", "Apple"], ["book", "📘", "Book"], ["laptop", "💻", "Laptop"], ["phone", "📱", "Phone"],
  ["camera", "📷", "Camera"], ["clock", "🕒", "Clock"], ["headphones", "🎧", "Headphones"], ["bottle", "🧴", "Bottle"],
  ["backpack", "🎒", "Backpack"], ["umbrella", "☂️", "Umbrella"], ["shoe", "👟", "Shoe"], ["guitar", "🎸", "Guitar"],
  ["key", "🔑", "Key"], ["pizza", "🍕", "Pizza"], ["balloon", "🎈", "Balloon"], ["star", "⭐", "Star"],
  ["dog", "🐕", "Dog"], ["cat", "🐈", "Cat"], ["plane", "✈️", "Plane"], ["rocket", "🚀", "Rocket"],
  ["tree", "🌳", "Tree"], ["crown", "👑", "Crown"], ["gift", "🎁", "Gift"], ["coffee", "☕", "Coffee"],
  ["sun", "☀️", "Sun"], ["moon", "🌙", "Moon"]
];

const SHAPES = [
  { type: "circle", color: "#38bdf8", label: "●" },
  { type: "square", color: "#10b981", label: "■" },
  { type: "triangle", color: "#ef4444", label: "▲" },
  { type: "star", color: "#f59e0b", label: "★" }
];

const DECISION_TEMPLATES = [
  ["Your team is behind schedule and one member is overloaded. What is the best first move?", "Redistribute tasks after checking priorities and capacity.", "Ignore the workload and hope the deadline moves.", "Assign every remaining task to the fastest person.", "Cancel the project without reviewing the scope.", "Clear planning protects quality while sharing work fairly."],
  ["A classmate sends you source code containing credentials by mistake. What should you do?", "Tell them privately, ask them to rotate the credentials, and avoid using them.", "Try the credentials to see whether they work.", "Post them in the team chat for visibility.", "Save a copy in personal notes.", "Responsible handling limits exposure and gives the owner a chance to secure the account."],
  ["You have three important tasks due tomorrow but only enough time for two. What is the strongest approach?", "Rank them by impact and deadline, then communicate the trade-off early.", "Work randomly until time runs out.", "Promise all three without checking feasibility.", "Do the easiest task regardless of impact.", "Prioritization and early communication make constraints manageable."],
  ["A production alert appears after a deployment, but the cause is unclear. What should you do first?", "Check the deployment diff and metrics, then follow the rollback plan if impact is confirmed.", "Delete the monitoring alerts.", "Make several unrelated changes at once.", "Wait for users to report the issue.", "Evidence-based diagnosis and a known rollback reduce risk."],
  ["Two teammates disagree about a design decision. How should you help?", "Define the decision criteria and compare both proposals against them.", "Choose the proposal from the most senior person automatically.", "Avoid the decision until the deadline.", "Ask everyone to vote without discussing constraints.", "Shared criteria turn disagreement into a useful evaluation."],
  ["You find a billing error that benefits your club budget. What is the right response?", "Report the error and request a corrected invoice.", "Keep quiet because the amount is small.", "Spend the extra money immediately.", "Move the charge to another account.", "Accurate records and transparency protect trust."],
  ["A suspicious link arrives in a message that appears to be from a manager. What is safest?", "Verify through a separate trusted channel before opening it.", "Open it quickly because it may be urgent.", "Forward it to several teammates.", "Reply with your login details.", "Independent verification helps prevent social-engineering attacks."],
  ["You are asked to present findings before the analysis is complete. What should you do?", "State what is known, label assumptions, and explain what remains to be verified.", "Invent missing numbers to make the presentation complete.", "Hide uncertainty from the audience.", "Refuse to share any preliminary information.", "Clear uncertainty boundaries preserve credibility and support decisions."],
  ["A teammate is repeatedly interrupted during a meeting. What is a constructive response?", "Invite them to finish their point and keep the discussion balanced.", "Interrupt them again to speed things up.", "Ignore it because meetings are competitive.", "End the meeting without recording decisions.", "Balanced participation improves both inclusion and decision quality."],
  ["You have an exam and a part-time shift scheduled at the same time. What should you do?", "Raise the conflict early and work with the relevant people on a realistic plan.", "Skip both without notifying anyone.", "Wait until the exam begins to mention it.", "Ask a friend to impersonate you.", "Early communication creates legitimate options without shifting surprise costs to others."]
];

function randomInt(max) { return Math.floor(Math.random() * max); }
function shuffle(items) { return [...items].sort(() => Math.random() - 0.5); }
function clampLevel(level) { return Math.max(1, Math.min(10, Number(level) || 1)); }

function makeFocus(level, index) {
  const target = TARGETS[index % TARGETS.length];
  const distractors = shuffle(TARGETS.filter(item => item[0] !== target[0])).slice(0, Math.min(7 + level, 18));
  const totalCells = Math.min(18, 9 + level);
  const targetCount = level >= 7 ? 2 : 3;
  const cells = Array.from({ length: targetCount }, () => target[1]);
  while (cells.length < totalCells) cells.push(distractors[cells.length % distractors.length][1]);
  return { id: `focus_${String(index + 1).padStart(3, "0")}`, level, target: { id: target[0], emoji: target[1], name: target[2] }, cells: shuffle(cells), targetCount, totalCells };
}

function makeMemory(level, index) {
  const count = Math.min(12, 3 + Math.ceil((level - 1) * 1));
  const itemPool = TARGETS.map(item => item[1]);
  const offset = (index * 3) % itemPool.length;
  const pool = itemPool.slice(offset).concat(itemPool.slice(0, offset));
  const sequence = pool.slice(0, count);
  const distractors = pool.slice(count, count + Math.min(5, 2 + Math.floor(level / 2)));
  return { id: `memory_${String(index + 1).padStart(3, "0")}`, level, sequence, choices: shuffle([...sequence, ...distractors]), displaySeconds: Math.max(2, 6 - Math.floor((level - 1) / 2)) };
}

function makeReaction(level, index) {
  return { id: `reaction_${String(index + 1).padStart(3, "0")}`, level, rounds: Math.min(6, 3 + Math.floor(level / 3)), minDelay: 900 + level * 80, maxDelay: 2600 + level * 160, targetType: ["green", "cyan", "amber"][index % 3] };
}

function makePattern(level, index) {
  const mode = level <= 2 ? index % 2 : index % 4;
  if (mode === 0) {
    const start = 2 + (index % 7); const step = 2 + (level % 4); const length = Math.min(7, 4 + Math.floor(level / 3));
    const sequence = Array.from({ length }, (_, n) => ({ type: "num", color: "#a855f7", label: String(start + n * step) }));
    const answer = start + length * step;
    return patternResult(index, level, sequence, { type: "num", color: "#a855f7", label: String(answer) }, [answer, answer + step, answer - step, answer * 2]);
  }
  if (mode === 1) {
    const start = 1 + (index % 5); const step = 1 + (level % 3); const length = Math.min(7, 4 + Math.floor(level / 3));
    const sequence = Array.from({ length }, (_, n) => ({ type: "num", color: "#38bdf8", label: String(start + n * step) }));
    const answer = start + length * step;
    return patternResult(index, level, sequence, { type: "num", color: "#38bdf8", label: String(answer) }, [answer, answer + 1, answer + step * 2, Math.max(0, answer - step)]);
  }
  if (mode === 2) {
    const offset = index % 4; const length = Math.min(7, 4 + Math.floor(level / 3));
    const sequence = Array.from({ length }, (_, n) => ({ type: "mixed", color: n % 2 ? "#10b981" : "#38bdf8", label: String.fromCharCode(65 + offset + n) }));
    const answer = String.fromCharCode(65 + offset + length);
    const answerColor = length % 2 ? "#10b981" : "#38bdf8";
    return patternResult(index, level, sequence, { type: "mixed", color: answerColor, label: answer }, [answer, String.fromCharCode(answer.charCodeAt(0) + 1), String.fromCharCode(answer.charCodeAt(0) - 1), "Z"]);
  }
  const shapeOffset = index % SHAPES.length; const length = Math.min(7, 4 + Math.floor(level / 3));
  const sequence = Array.from({ length }, (_, n) => SHAPES[(shapeOffset + n) % SHAPES.length]);
  const answer = SHAPES[(shapeOffset + length) % SHAPES.length];
  return patternResult(index, level, sequence, answer, [answer, SHAPES[(shapeOffset + length + 1) % 4], SHAPES[(shapeOffset + length + 2) % 4], SHAPES[(shapeOffset + length + 3) % 4]]);
}

function patternResult(index, level, sequence, correctAnswer, optionValues) {
  const options = shuffle(optionValues.map(value => typeof value === "number" ? { type: "num", color: correctAnswer.color, label: String(value) } : value));
  return { id: `pattern_${String(index + 1).padStart(3, "0")}`, level, title: "Adaptive Sequence", sequence, correctAnswer, options };
}

function makeDecision(level, index) {
  const template = DECISION_TEMPLATES[index % DECISION_TEMPLATES.length];
  const contexts = [
    "for a student project",
    "during a workplace handoff",
    "while coordinating a volunteer event",
    "in a software release",
    "when planning a shared budget",
    "during a research assignment"
  ];
  const answerTexts = template.slice(1, 5);
  const correctText = answerTexts[0];
  const context = contexts[Math.floor(index / DECISION_TEMPLATES.length) % contexts.length];
  const options = shuffle(answerTexts.map((text, optionIndex) => ({ key: String.fromCharCode(65 + optionIndex), text, isCorrect: text === correctText })));
  return { id: `decision_${String(index + 1).padStart(3, "0")}`, level, category: ["teamwork", "security", "planning", "problem solving", "communication"][index % 5], question: `${template[0]} This is ${context}.`, options, explanation: template[5], timeSeconds: Math.max(8, 18 - (level - 1)) };
}

export function generateChallenge(game, level, index = randomInt(60)) {
  const safeLevel = clampLevel(level);
  if (game === "focus") return makeFocus(safeLevel, index);
  if (game === "memory") return makeMemory(safeLevel, index);
  if (game === "reaction") return makeReaction(safeLevel, index);
  if (game === "pattern") return makePattern(safeLevel, index);
  return makeDecision(safeLevel, index);
}

export function challengePoolIds(game) {
  return Array.from({ length: 60 }, (_, index) => `${game}_${String(index + 1).padStart(3, "0")}`);
}

export function regenerateChallenge(game, level, excludedIds) {
  const available = challengePoolIds(game).filter(id => !excludedIds.includes(id));
  const selectedId = available[randomInt(Math.max(1, available.length))] || challengePoolIds(game)[randomInt(60)];
  const selectedIndex = Number(selectedId.split("_").pop()) - 1;
  return generateChallenge(game, level, Math.max(0, selectedIndex));
}
