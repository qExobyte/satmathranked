export interface User {
    id: number;
    username: string;
    email: string;
    elo: number;
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

export interface ProblemHistoryItem {
  id: number;
  problemId: number;
  problemText: string;
  difficulty: string;
  isFrq: boolean;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
  timestamp: string;
  starred: boolean;
}