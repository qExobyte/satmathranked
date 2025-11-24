import express from "express";
import type { Request, Response } from "express";
import { computeElo, computeTopicRating } from "../utils/elo.js";
import { weightedChoice, sampleRating } from "../utils/probUtils.js";

const router = express.Router();

interface Problem {
  id: number;
  difficulty: number;
  topicId: number;
  problemText: string;
  isFrq: boolean;
  answerChoices: Record<string, string[]>;
}

//placeholder problem data
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

router.get("/next", (req: Request, res: Response) => {
  // placeholder for fetching problem. given user id, need to compute topic ratings
  // and select a topic randomly weighted towards lower-rated topics
  // then select a problem from that topic around that rating
  // need to also query topicIDs

  const userId = Number(req.query.userId);
  const topicIds = [1, 2, 3]; // placeholder topic IDs
  const topicRatings: number[] = [];

  for (const topicId of topicIds) {
    const rating = computeTopicRating(userId, topicId);
    topicRatings.push(rating);
  }

  //select topic
  const topicIndex = Number(weightedChoice(topicRatings.map((r) => 1 / r))); //weight towards lower ratings
  const selectedTopicID = topicIds[topicIndex];
  const selectedTopicRating = Number(topicRatings[topicIndex]);

  //sample problem rating
  const sampledRating = sampleRating(selectedTopicRating);

  //SQL query to fetch problem closest to sampledRating in selectedTopicID goes here
  //placeholder: filter sampleProblems
  const candidateProblems = sampleProblems.filter(
    (p) => p.topicId === selectedTopicID
  );
  candidateProblems.sort(
    (a, b) =>
      Math.abs(a.difficulty - sampledRating) -
      Math.abs(b.difficulty - sampledRating)
  );
  const selectedProblem = candidateProblems[0];

  res.json({ success: true, problem: selectedProblem });
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
  const isCorrect = problem.answerChoices[choiceKey]?.[0] === "correct";

  //SQL query to submit problem history goes here
  //Also update problem elo. For now ill just send the elo update to the frontend
  //mock logic:
  const userTopicElo = computeTopicRating(userId, problem.topicId);
  const newUserTopicElo = computeElo(
    userTopicElo,
    problem.difficulty,
    isCorrect
  );
  const eloUpdate = Math.round(newUserTopicElo - userTopicElo);
  
  return res.json({ success: true, eloUpdate, correct: isCorrect });
});

export default router;
