import express from "express";
import type { Request, Response } from "express";
import { computeElo, computeTopicElo, computeTopicEloList } from "../utils/elo.js";
import { weightedChoice, chooseDifficulty } from "../utils/probUtils.js";
import pool from "../db_config.js";
import type {Problem, Topic, TopicHistoryRow} from "../types/types.js";

const router = express.Router();



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
    console.log("called");
    const { userId, problemId, answerChoice } = req.body as {
        userId: number;
        problemId: number;
        answerChoice: string | number;
    };


    //SQL query to fetch problem data by problemId goes here
    const problem = pool.

    const choiceKey = String(answerChoice);
    const isCorrect = problem.answer_choices[choiceKey]?.[0] === "correct";

    //SQL query to submit problem history goes here
    //Also update problem elo. For now ill just send the elo update to the frontend
    const userTopicElo = computeTopicElo(userId, problem.topic_id);
    const eloUpdate = Math.round(newUserTopicElo - userTopicElo);

    return res.json({ success: true, eloUpdate, correct: isCorrect });
});

export default router;
