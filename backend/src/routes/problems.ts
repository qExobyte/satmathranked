import express from "express";
import type { Request, Response } from "express";
import { computeElo, computeTopicElo, computeTopicEloList } from "../utils/elo.js";
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
  const selectedTopicID = topics[selectedTopicIndex].id;
  const selectedTopicElo = topicElos[selectedTopicIndex];

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
            SELECT 1 FROM starred_problems sp 
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


/*"choices": {
    "A. $x > 0$ and $y > 0$": [
      true,
      "This is correct. The point (8, 2) is located i
    ],
    "B. $x > 0$ and $y < 0$": [
      false,
      "This is incorrect. This system represents points in the fourth quadrant. While 8 > 0 is true, 2 < 0 is false, so the point (8, 2) does not satisfy this system."
    ],
    "C. $x < 0$ and $y > 0$": [
      false,
      "This is incorrect. This system represents points in the second quadrant. While 2 > 0 is true, 8 < 0 is false, so the point (8, 2) does not satisfy this system."
    ],
    "D. $x < 0$ and $y < 0$": [
      false,
      "This is incorrect. This system represents points in the third quadrant. Both 8 < 0 and 2 < 0 are false, so the point (8, 2) does not satisfy this system."
    ]
  }*/


router.post("/submit", async (req: Request, res: Response) => {
    console.log("SUBMIT CALLED");
    const { userId, problemId, answerChoice } = req.body as {
        userId: number;
        problemId: number;
        answerChoice: string | number;
    };

    console.log("ABOUT TO RUN SQL");
    const [results] = await pool.execute("SELECT answer_choices, difficulty FROM PROBLEMS WHERE id=?", [problemId])
    
    const answers = results[0].answer_choices;
    const difficulty = results[0].difficulty;
    console.log(answers);
    console.log(difficulty);

    let correctAnswer = false;
    if (answerChoice in answers){
        correctAnswer = answers[answerChoice].isCorrect;
    }

    const _ = await pool.execute("INSERT INTO PROBLEM_HISTORY (user_id, problem_id, problem_rating, is_correct) VALUES (?, ?, ?, ?)",[userId, problemId, difficulty, correctAnswer]);

    return res.json({ success: true, eloUpdate: 20, correct: correctAnswer});
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
              SELECT 1 FROM starred_problems sp
              WHERE sp.problem_id = ph.problem_id AND sp.user_id = ph.user_id
          ) AS starred
      FROM 
          problem_history ph
      JOIN 
          problems p ON ph.problem_id = p.id
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
      `INSERT INTO starred_problems (user_id, problem_id, starred_date) VALUES(?, ?, NOW());`,
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
      `DELETE FROM starred_problems WHERE user_id=? AND problem_id=?;`,
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
