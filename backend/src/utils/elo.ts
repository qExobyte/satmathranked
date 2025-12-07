import type {Topic, TopicHistoryRow} from "../types/types.js";
import pool from "../db_config.js";

const BASE_RATING = 500;
const SAMPLE_HISTORY = [
    { problem_id: 1, problem_rating: 450, is_correct: true },
    {problmem_id: 1, problem_rating: 500, is_correct: false },
    { problem_id: 2, problem_rating: 550, is_correct: false },
    {problem_id: 2, problem_rating: 500, is_correct: true },
    { problem_id: 3, problem_rating: 600, is_correct: true },
    {problem_id: 3, problem_rating: 650, is_correct: false },
]; //placeholder


function computeElo (
  updateRating: number, //rating of user or problem to be updated
  opposingRating: number, //rating of the opposing user or problem
  isCorrect: boolean) : number {
    const K = 32; //K-factor, we might want to change this
    const expectedScore = 1 / (1 + Math.pow(10, (opposingRating - updateRating) / 400));
    const actualScore = isCorrect ? 1 : 0;
    const newRating = updateRating + K * (actualScore - expectedScore);
    return newRating;
};

function computeTopicElo(userId: number, topicHistory: TopicHistoryRow[]): number {
    let rating = BASE_RATING;

    for (const problem of topicHistory) {
        rating = computeElo(rating, problem.difficulty, problem.is_correct);
    }
    return rating;
};

async function computeUserElo(userId: number): Promise<number> {
    const [topicRows] = await pool.query(
        `SELECT id, weight FROM TOPICS ORDER BY id`
    );

    const [historyRows] = await pool.query(
        `SELECT ph.is_correct, ph.problem_rating, p.topic_id
     FROM PROBLEM_HISTORY ph
     JOIN PROBLEMS p ON ph.problem_id = p.id
     WHERE ph.user_id = ?
     ORDER BY ph.timestamp ASC`,
        [userId]
    );

    const topics = topicRows as Topic[];
    const history = historyRows as TopicHistoryRow[];

    let overallElo = 0;
    for (const topic of topics) {
        const topicHistory = history.filter(h => h.topic_id === topic.id);
        const topicElo = computeTopicElo(userId, topicHistory);
        overallElo += topicElo * topic.weight;
    }

    return Math.round(overallElo);
}

export { computeTopicElo, computeUserElo, computeElo };
