export interface User {
    id: number;
    username: string;
    email: string;
    elo: number;
}

export interface Problem {
    id: number;
    question: string;
    category: string;
    difficulty: number;
    type: string;
    options: string[];
}

export interface SubmitAnswerResponse {
    eloUpdate: number;
    correct: boolean;
}