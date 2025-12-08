import express from "express";
import type { Request, Response } from "express";
import { computeElo, computeTopicElo, computeTopicEloList } from "../utils/elo.js";
import { weightedChoice, chooseDifficulty } from "../utils/probUtils.js";
import pool from "../db_config.js";
import type { Problem, Topic, TopicHistoryRow } from "../types/types.js";

const router = express.Router();

// placeholder problem data
const sampleProblems: Problem[] = [
  {
    id: 1,
    difficulty: 500,
    topicId: 1,
    problemText: "if $x+5=10$, $x=$",
    isFrq: true,
    answerChoices: { "5": ["correct", "because..."] },
  },
  {
    id: 2,
    difficulty: 600,
    topicId: 1,
    problemText: "What is the derivative of $x^2$?",
    isFrq: false,
    answerChoices: {
      $2x$: ["correct", "because..."],
      $x$: ["incorrect", "because..."],
      "$x^2$": ["incorrect", "because..."],
      $1$: ["incorrect", "because..."],
    },
  },
  {
    id: 3,
    difficulty: 550,
    topicId: 2,
    problemText: "Solve for $y$: $2y - 4 = 10$",
    isFrq: true,
    answerChoices: { "7": ["correct", "because..."] },
  },
  {
    id: 4,
    difficulty: 650,
    topicId: 2,
    problemText: "Integrate $x dx$",
    isFrq: false,
    answerChoices: {
      "$x^2/2 + C$": ["correct", "because..."],
      "$x + C$": ["incorrect", "because..."],
      "$2x + C$": ["incorrect", "because..."],
      "$1 + C$": ["incorrect", "because..."],
    },
  },
  {
    id: 5,
    difficulty: 700,
    topicId: 2,
    problemText: "What is the value of $sin(90)$?",
    isFrq: false,
    answerChoices: {
      $1$: ["correct", "because..."],
      $0$: ["incorrect", "because..."],
      "$0.5$": ["incorrect", "because..."],
      Undefined: ["incorrect", "because..."],
    },
  },
  {
    id: 6,
    difficulty: 400,
    topicId: 3,
    problemText: "What is $12^2$?",
    isFrq: true,
    answerChoices: { "144": ["correct", "because..."] },
  },
  {
    id: 7,
    difficulty: 450,
    topicId: 3,
    problemText: "What is the square root of $81$?",
    isFrq: false,
    answerChoices: {
      $9$: ["correct", "because..."],
      $8$: ["incorrect", "because..."],
      $7$: ["incorrect", "because..."],
      $6$: ["incorrect", "because..."],
    },
  },
];

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

router.post("/submit", (req: Request, res: Response) => {
  const { userId, problemId, answerChoice } = req.body as {
    userId: number;
    problemId: number;
    answerChoice: string | number;
  };

  //SQL query to fetch problem data by problemId goes here
  const problem = sampleProblems.find((p) => p.id === problemId); //mock data logic
  if (!problem) {
    return res.status(404).json({ success: false, message: "Problem not found" });
  }

  const choiceKey = String(answerChoice);
  const isCorrect = problem.answer_choices[choiceKey]?.[0] === "correct";

  //SQL query to submit problem history goes here
  //Also update problem elo. For now ill just send the elo update to the frontend
  //mock logic:
  const userTopicElo = computeTopicElo(userId, problem.topic_id);
  const newUserTopicElo = computeElo(
    userTopicElo,
    problem.difficulty,
    isCorrect
  );
  const eloUpdate = Math.round(newUserTopicElo - userTopicElo);
  
  return res.json({ success: true, eloUpdate, correct: isCorrect });
})

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
