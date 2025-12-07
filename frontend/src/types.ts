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
    starred: boolean;
    answerChoices: Record<string, [boolean, string]> // map of answer choice to [correctness, explanation]
}

export interface SubmitAnswerResponse {
    eloUpdate: number;
    correct: boolean;
}

export interface ProblemHistoryItem {
  id: number;
  problemId: number;
  problemText: string;
  difficulty: string;
  userAnswer: string;
  correct: boolean;
  answerChoices: Record<string, [boolean, string]>
  timestamp: string;
  starred: boolean;
}