import express from "express";
import type { Request, Response } from "express";
import { computeAggregateElo, computeElo } from "../utils/elo.js";
import { weightedChoice, chooseDifficulty } from "../utils/probUtils.js";
import prisma from "../db_config.js";
import type {
  Problem,
  Topic,
  TopicHistoryRow,
  Streak,
} from "../types/types.js";

const router = express.Router();

router.get("/next", async (req: Request, res: Response) => {
  const userId = Number(req.query.userId);

  const topicElos = await prisma.topicElo.findMany({
    where: { userId },
    orderBy: { topicId: "asc" },
  });

  const topics = await prisma.topic.findMany({
    orderBy: { id: "asc" },
  });

  // select topic
  const weights = topicElos.map((r) => 1 / r.elo ** 2.5);
  const selectedTopicIndex = weightedChoice(weights);

  if (selectedTopicIndex < 0 || selectedTopicIndex >= topics.length) {
    return res.status(500).json({ success: false, message: "Invalid topic" });
  }

  const selectedTopic = topics[selectedTopicIndex]!;
  const selectedTopicElo = topicElos[selectedTopicIndex]!.elo;
  const selectedTopicID = selectedTopic.id;

  // sample problem difficulty
  const chosenDifficulty = chooseDifficulty(selectedTopicElo);

  // fetch the problem closest to chosenDifficulty AND include starred info
  const problemRows = await prisma.$queryRaw`
  SELECT * FROM "Problem"
  WHERE "topicId" = ${selectedTopicID}
  ORDER BY ABS("difficulty"::integer - ${chosenDifficulty}) ASC
  LIMIT 1
`;

  const problems = await prisma.problem.findMany({
    where: {
      topicId: selectedTopicID,
    },
    include: {
      starredBy: {
        where: { userId },
      },
    },
  });

  if (problems.length === 0) {
    return res.status(500).json({
      success: false,
      message: "No problems found for this topic",
    });
  }

  const chosenProblem = problems
    .map((p) => ({
      ...p,
      starred: p.starredBy.length > 0,
      difficultyDiff: Math.abs(p.difficulty - chosenDifficulty),
    }))
    .sort((a, b) => a.difficultyDiff - b.difficultyDiff)[0];

  console.log(problems[0]);

  return res.status(200).json({
    problem: chosenProblem,
  });
});

router.post("/submit", async (req: Request, res: Response) => {
  const { userId, problemId, answerChoice } = req.body as {
    userId: number;
    problemId: number;
    answerChoice: string | number;
  };

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });

  if (!problem) {
    return res
      .status(500)
      .json({ success: false, message: "Problem not found" });
  }
  const answerChoices = problem.answerChoices as Record<
    string,
    { isCorrect: boolean; explanation: string }
  >;

  let correctAnswer = false;
  if (answerChoice in answerChoices) {
    correctAnswer = answerChoices[answerChoice]!.isCorrect;
  }

  // Insert the new result

  await prisma.problemHistory.create({
    data: {
      userId,
      problemId,
      problemDifficulty: problem.difficulty,
      isCorrect: correctAnswer,
      answerText: String(answerChoice),
    },
  });

  //update topic elo
  const oldTopicElo = await prisma.topicElo.findFirst({
    where: { userId, topicId: problem.topicId },
  });
  if (!oldTopicElo) {
    return res.status(500).json({
      success: false,
      message: "Topic ELO not found",
    });
  }
  const updatedTopicElo = computeElo(
    oldTopicElo.elo,
    problem.difficulty,
    correctAnswer
  );

  await prisma.topicElo.update({
    where: { topicId_userId: { userId, topicId: problem.topicId } },
    data: { elo: updatedTopicElo },
  });

  // update overall elo
  const topics = await prisma.topic.findMany({
    orderBy: { id: "asc" },
  });

  const newTopicElos = await prisma.topicElo.findMany({
    where: { userId },
    orderBy: { topicId: "asc" },
  });

  const topicEloData = topics.map((topic, index) => ({
    topicId: topic.id,
    topicName: topic.name,
    elo: Math.round(newTopicElos[index]!.elo || 0),
  }));

  const overallElo = computeAggregateElo(newTopicElos, topics);

  // Update streaks
  const userStreaks = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true },
  });
  if (!userStreaks) {
    return res.status(500).json({
      success: false,
      message: "User streaks not found",
    });
  }
  if (correctAnswer) {
    if (userStreaks.currentStreak + 1 > userStreaks.longestStreak) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          longestStreak: userStreaks.currentStreak + 1,
          currentStreak: { increment: 1 },
        },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { currentStreak: { increment: 1 } },
      });
    }
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { currentStreak: 0 },
    });
  }

  const newStreak = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true },
  });

  return res.json({
    success: true,
    topicElos: topicEloData,
    overallElo: overallElo,
    correct: correctAnswer,
    streak: newStreak?.currentStreak,
  });
});

router.get("/history", async (req: Request, res: Response) => {
  const userId = Number(req.query.userId);
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const history = await prisma.problemHistory.findMany({
      where: {
        userId: userId,
      },
      include: {
        problem: {
          include: {
            starredBy: {
              where: {
                userId: userId,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Transform to match frontend expected format, we can change that later
    const rows = history.map((ph) => ({
      id: ph.id,
      problemId: ph.problemId,
      problemText: ph.problem.problemText,
      difficulty: ph.problem.difficulty,
      userAnswer: ph.answerText,
      correct: ph.isCorrect,
      timestamp: ph.timestamp,
      answerChoices: ph.problem.answerChoices,
      starred: ph.problem.starredBy.length > 0,
    }));

    res.status(200).json({ history: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching history" });
  }
});

router.post("/star", async (req: Request, res: Response) => {
  const { userId, problemId } = req.body as {
    userId: number;
    problemId: number;
  };
  try {
    await prisma.starredProblem.create({
      data: { userId, problemId },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error starring problem: ", error);
    res.status(500).json({
      success: false,
      message: "Error starring problem",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.delete("/star", async (req: Request, res: Response) => {
  const { userId, problemId } = req.body as {
    userId: number;
    problemId: number;
  };
  try {
    await prisma.starredProblem.delete({
      where: { userId_problemId: { userId, problemId } },
    });
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error removing star from problem: ", error);
    res.status(500).json({
      success: false,
      message: "Error removing star from problem",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
