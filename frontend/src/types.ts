export interface User {
    id: number;
    username: string;
    email: string;
    elo: number;
    topicEloData: Array<{
        topicId: number;
        topicName: string;
        elo: number;
    }>;
}

export interface Problem {
    id: number;
    difficulty: number;
    topicId: string;
    problemText: string;
    isFrq: boolean;
    answerChoices: { [key: string]: string[] }; // map of answer choice to [correctness, explanation]
}

export interface SubmitAnswerResponse {
    eloUpdate: number;
    correct: boolean;
}