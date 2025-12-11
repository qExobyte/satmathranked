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
  streak: number;
}

export interface AnswerChoice {
  isCorrect: boolean;
  explanation: string;
}

export interface Problem {
  id: number;
  difficulty: number;
  topicId: string;
  problemText: string;
  isFrq: boolean;
  starred: boolean;
  answerChoices: Record<string, AnswerChoice>;
}

export interface SubmitAnswerResponse {
  topicEloData: Array<{
    topicId: number;
    topicName: string;
    elo: number;
  }>;
  correct: boolean;
  overallElo: number;
  streak: number;
}

export interface ProblemHistoryItem {
  id: number;
  problemId: number;
  problemText: string;
  difficulty: string;
  userAnswer: string;
  correct: boolean;
  answerChoices: Record<string, AnswerChoice>;
  timestamp: string;
  starred: boolean;
}
