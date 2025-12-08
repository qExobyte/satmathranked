import type {Topic, TopicHistoryRow} from "../types/types.js";
import pool from "../db_config.js";

const BASE_RATING = 500;

function computeElo (
  updateRating: number, //rating of user or problem to be updated
  opposingRating: number, //rating of the opposing user or problem
  isCorrect: boolean) : number {
    const K = 50; //K-factor, we might want to change this
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

// TODO switch this to a map? Probably better but not a priority
async function computeTopicEloList(userId: number): Promise<number[]> {
    const [topicRows] = await pool.query(
        `SELECT id, name, weight
       FROM TOPICS
       ORDER BY id`
    );
    const topics = topicRows as Topic[];

    // problem history + the topic id
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

    // for each topic id index -> associated elo with each topic
    const topicElos = []
    for (const topic of topics) {
        const topicId = topic.id
        const topicHistory = history.filter(h => h.topic_id == topicId);
        const topicElo = computeTopicElo(userId, topicHistory);
        topicElos.push(topicElo);
    }
    return topicElos;
}

async function computeUserElo(userId: number): Promise<number> {
    const [topicRows] = await pool.query(
        `SELECT id, weight FROM TOPICS ORDER BY id`
    );

    const [historyRows] = await pool.query(
        `SELECT ph.is_correct, ph.problem_rating as difficulty, p.topic_id
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
        console.log(topicElo);
        overallElo += topicElo * topic.weight;
    }

    return Math.round(overallElo);
}

export { computeTopicElo, computeTopicEloList, computeUserElo, computeElo };
