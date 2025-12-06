import type {TopicHistoryRow} from "../types/types.js";

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

function computeOverallRating (userId: number, history: TopicHistoryRow): number {
    /* placeholder function to compute overall rating for a user 
    real SQL query: CALL get_user_topic_history(userID, topicID); for each topic,
    then compute topic ratings and do weighted average
    Also need to query topicIDs SELECT ID, weight FROM topics;
    */
    const topicIds= [1, 2, 3]; // placeholder topic IDs
    const topicWeights: number[] = [0.5, 0.3, 0.2]; // placeholder weights

    let overallRating = 0;
    for (let i = 0; i < topicIds.length; i++) {
        // compute each rating on the fly and default to 0 if undefined
        const topicId = topicIds[i] ?? 0;
        const rating = computeTopicElo(userId, topicId) ?? 0;
        const weight = topicWeights[i] ?? 0;
        overallRating += rating * weight;
    }
    return overallRating;
};


export { computeTopicElo, computeOverallRating, computeElo };
