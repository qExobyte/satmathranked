import type {Topic, TopicHistoryRow} from "../types/types.js";
import pool from "../db_config.js";
import type { TopicElo } from "../generated/prisma/client.js";

const BASE_RATING = 500;

function computeElo (
  updateRating: number, //rating of user or problem to be updated
  opposingRating: number, //rating of the opposing user or problem
  isCorrect: boolean) : number {
    const K = 350; //K-factor, we might want to change this
    const expectedScore = 1 / (1 + Math.pow(10, (opposingRating - updateRating) / 400));
    const actualScore = isCorrect ? 1 : 0;
    const newRating = updateRating + K * (actualScore - expectedScore);
    return newRating;
};

function computeAggregateElo(topicElos: TopicElo[], topics: Topic[]): number {
    let totalWeightedElo = 0;
    for (let i = 0; i < topicElos.length; i++) {
        totalWeightedElo += topicElos[i]!.elo * topics[i]!.weight;
    }
    return totalWeightedElo;
}


export { computeAggregateElo, computeElo };
