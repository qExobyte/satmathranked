import express from "express";
import type { Request, Response } from "express";
import { computeElo, computeTopicElo, computeTopicEloList } from "../utils/elo.js";
import { weightedChoice, chooseDifficulty } from "../utils/probUtils.js";
import pool from "../db_config.js";
import type {Problem, Topic, TopicHistoryRow} from "../types/types.js";

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
      "$2x$": ["correct", "because..."],
      "$x$": ["incorrect", "because..."],
      "$x^2$": ["incorrect", "because..."],
      "$1$": ["incorrect", "because..."],
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
      "$1$": ["correct", "because..."],
      "$0$": ["incorrect", "because..."],
      "$0.5$": ["incorrect", "because..."],
      "Undefined": ["incorrect", "because..."],
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
      "$9$": ["correct", "because..."],
      "$8$": ["incorrect", "because..."],
      "$7$": ["incorrect", "because..."],
      "$6$": ["incorrect", "because..."],
    },
  },
];

router.get("/next", async (req: Request, res: Response) => {
  // 1. Computes user's current elos for every topic.
  // 2. Determines weights for every topic based on current elos
  // 3. Chooses topic probabilistically based on these weights
  // 4. Fetches next problem from this topic at the optimal difficulty

  const userId = Number(req.query.userId);

  const [topicRows] = await pool.query(
      `SELECT id, name, weight FROM TOPICS ORDER BY id`
  );
  const topics = topicRows as Topic[];

  const topicElos = await computeTopicEloList(userId);

  //select topic
  const weights = topicElos.map((r) => 1 / (r ** 2));
  const selectedTopicIndex = weightedChoice(weights);
  const selectedTopicID = topics[selectedTopicIndex].id;
  const selectedTopicElo = topicElos[selectedTopicIndex];

  //sample problem rating
  const chosenDifficulty = chooseDifficulty(selectedTopicElo);

  console.log(selectedTopicID)
  console.log(chosenDifficulty)

  //SQL query to fetch problem closest to sampledRating in selectedTopicID goes here
  //placeholder: filter sampleProblems
  const [problemRows] = await pool.query(
      `SELECT id,
              difficulty,
              topic_id       as topicId,
              problem_text   as problemText,
              is_frq         as isFrq,
              answer_choices as answerChoices,
              image_url      as imageUrl
       FROM PROBLEMS
       WHERE topic_id = ?
       ORDER BY ABS(difficulty - ?) ASC LIMIT 1`,
      [selectedTopicID, chosenDifficulty]
  );

  const problems = problemRows as Problem[];

  if (problems.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No problems found for this topic"
    });
  }
  console.log(problems[0]);
  return res.status(200).json({
    problem: problems[0]
  })
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
});

export default router;
