import { Router } from "express";
import GameSession from "../../models/GameSession.js";
import GameProgress from "../../models/GameProgress.js";
import { requireAuth } from "../../middleware/auth.js";
import { regenerateChallenge } from "./challenge.service.js";

const router = Router();
const allowed = ["focus", "memory", "reaction", "pattern", "decision"];

router.post("/start", requireAuth, async (req, res) => {
  const { game } = req.body;
  if (!allowed.includes(game)) return res.status(400).json({ message: "Unsupported game." });
  const progress = await GameProgress.findOneAndUpdate(
    { userId: req.user.id, game },
    { $setOnInsert: { userId: req.user.id, game } },
    { upsert: true, new: true }
  );
  const challenge = regenerateChallenge(game, progress.level, progress.recentChallengeIds || []);
  const session = await GameSession.create({
    userId: req.user.id,
    game,
    level: progress.level,
    challengeId: challenge.id,
    challenge
  });
  res.status(201).json({ sessionId: session._id, game, level: progress.level, challenge });
});

export default router;
