import express from "express";
import type { Request, Response } from "express";
import { computeUserElo, computeTopicElo } from "../utils/elo.js";
import { weightedChoice, chooseDifficulty } from "../utils/probUtils.js";
import pool from "../db_config.js";
import type { Problem, Topic, TopicHistoryRow } from "../types/types.js";

const router = express.Router();

router.get("/next", async (req: Request, res: Response) => {
  const userId = Number(req.query.userId);

  const [topicRows] = await pool.query(
    `SELECT id, name, weight
       FROM TOPICS
       ORDER BY id`
  );
  const topics = topicRows as Topic[];

  // problem history
  const [historyRows] = await pool.query(
    `SELECT ph.problem_id,
            ph.is_correct,
            ph.timestamp,
            p.topic_id,
            ph.problem_rating AS difficulty
     FROM PROBLEM_HISTORY ph
     JOIN PROBLEMS p ON ph.problem_id = p.id
     WHERE ph.user_id = ?
     ORDER BY ph.timestamp ASC`,
    [userId]
  );
  const history = historyRows as TopicHistoryRow[];

  const topicElos = topics.map((topic) => {
    const topicHistory = history.filter((h) => h.topic_id == topic.id);
    return computeTopicElo(userId, topicHistory);
  });

  // select topic
  const weights = topicElos.map((r) => 1 / r ** 2);
  const selectedTopicIndex = weightedChoice(weights);

  if (selectedTopicIndex < 0 || selectedTopicIndex >= topics.length) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid topic" });
  }

  const selectedTopic = topics[selectedTopicIndex]!;
  const selectedTopicElo = topicElos[selectedTopicIndex]!;
  const selectedTopicID = selectedTopic.id;

  // sample problem difficulty
  const chosenDifficulty = chooseDifficulty(selectedTopicElo);

  // fetch the problem closest to chosenDifficulty AND include starred info
  const [problemRows] = await pool.query(
    `SELECT 
        p.id,
        p.difficulty,
        p.topic_id AS topicId,
        p.problem_text AS problemText,
        p.is_frq AS isFrq,
        p.answer_choices AS answerChoices,
        p.image_url AS imageUrl,
        EXISTS (
            SELECT 1 FROM STARRED_PROBLEMS sp 
            WHERE sp.problem_id = p.id AND sp.user_id = ?
        ) AS starred
     FROM PROBLEMS p
     WHERE p.topic_id = ?
     ORDER BY ABS(p.difficulty - ?) ASC
     LIMIT 1`,
    [userId, selectedTopicID, chosenDifficulty]
  );

  const problems = problemRows as (Problem & { starred: boolean })[];

  if (problems.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No problems found for this topic",
    });
  }

  return res.status(200).json({
    problem: problems[0],
  });
});

router.post("/submit", async (req: Request, res: Response) => {
  const { userId, problemId, answerChoice } = req.body as {
    userId: number;
    problemId: number;
    answerChoice: string | number;
  };

  console.log("ABOUT TO RUN SQL");
  const [results] = await pool.execute(
    "SELECT answer_choices, difficulty, topic_id FROM PROBLEMS WHERE id=?",
    [problemId]
  );

  const resultsArray = results as any[];
  if (!resultsArray || resultsArray.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Problem not found" });
  }

  const topic_id = resultsArray[0].topic_id;
  const answers = resultsArray[0].answer_choices;
  const difficulty = resultsArray[0].difficulty;
  console.log(answers);
  console.log(difficulty);

  let correctAnswer = false;
  if (answerChoice in answers) {
    correctAnswer = answers[answerChoice].isCorrect;
  }

  // Get user's problem history BEFORE adding the new attempt
  const [historyRows] = await pool.query(
    `SELECT ph.problem_id,
              ph.is_correct,
              ph.timestamp,
              p.topic_id,
              ph.problem_rating AS difficulty
       FROM PROBLEM_HISTORY ph
       JOIN PROBLEMS p ON ph.problem_id = p.id
       WHERE ph.user_id = ?
       ORDER BY ph.timestamp ASC`,
    [userId]
  );
  const history = historyRows as TopicHistoryRow[];
  const topicHistory = history.filter((h) => h.topic_id === topic_id);

  // Calculate previous ELOs
  let prevTopicElo = computeTopicElo(userId, topicHistory);
  let prevOverallElo = await computeUserElo(userId);

  // Insert the new result
  const _ = await pool.execute(
    "INSERT INTO PROBLEM_HISTORY (user_id, problem_id, problem_rating, is_correct, answer_text) VALUES (?, ?, ?, ?, ?)",
    [userId, problemId, difficulty, correctAnswer, answerChoice]
  );
  console.log(correctAnswer);

  // Get updated history AFTER adding the new attempt
  const [updatedHistoryRows] = await pool.query(
    `SELECT ph.problem_id,
              ph.is_correct,
              ph.timestamp,
              p.topic_id,
              ph.problem_rating AS difficulty
       FROM PROBLEM_HISTORY ph
       JOIN PROBLEMS p ON ph.problem_id = p.id
       WHERE ph.user_id = ?
       ORDER BY ph.timestamp ASC`,
    [userId]
  );
  const updatedHistory = updatedHistoryRows as TopicHistoryRow[];
  const updatedTopicHistory = updatedHistory.filter(
    (h) => h.topic_id === topic_id
  );

  // Calculate new ELOs
  const newTopicElo = computeTopicElo(userId, updatedTopicHistory);
  const newOverallElo = await computeUserElo(userId);

  // Calculate deltas
  const topicEloDelta = newTopicElo - prevTopicElo;
  const overallEloDelta = newOverallElo - prevOverallElo;
  console.log(topicEloDelta);
  console.log(overallEloDelta);
  const categoryUpdate = [topic_id, topicEloDelta];

  return res.json({
    success: true,
    categoryUpdate: categoryUpdate,
    eloUpdate: overallEloDelta,
    correct: correctAnswer,
  });
});

router.get("/history", async (req: Request, res: Response) => {
  const userId = Number(req.query.userId);
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT 
          ph.id,
          ph.problem_id AS problemId,
          p.problem_text AS problemText,
          p.difficulty,
          ph.answer_text AS userAnswer,
          ph.is_correct AS correct,
          ph.timestamp,
          p.answer_choices AS answerChoices,
          EXISTS(
              SELECT 1 FROM STARRED_PROBLEMS sp
              WHERE sp.problem_id = ph.problem_id AND sp.user_id = ph.user_id
          ) AS starred
      FROM 
          PROBLEM_HISTORY ph
      JOIN 
          PROBLEMS p ON ph.problem_id = p.id
      WHERE 
          ph.user_id = ?
      ORDER BY 
          ph.timestamp DESC;
      `,
      [userId]
    );

    res.status(200).json({ history: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/star", async (req: Request, res: Response) => {
  const { userId, problemId } = req.body as {
    userId: number;
    problemId: number;
  };
  try {
    const [starredProblem] = await pool.query(
      `INSERT INTO STARRED_PROBLEMS (user_id, problem_id, starred_date) VALUES(?, ?, NOW());`,
      [userId, problemId]
    );
    res.status(200).json({
      success: true,
    });
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
    const [removedStar] = await pool.query(
      `DELETE FROM STARRED_PROBLEMS WHERE user_id=? AND problem_id=?;`,
      [userId, problemId]
    );
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
