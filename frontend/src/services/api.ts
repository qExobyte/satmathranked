// src/services/api.ts
import type { User, Problem, SubmitAnswerResponse, ProblemHistoryItem } from "../types";


export const api = {
  login: async () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  },

  getProblem: async (userId: number): Promise<Problem> => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/problems/next?userId=${userId}`
    );
    const data = await res.json();
    return data.problem;
  },

  submitAnswer: async (
    problemId: number,
    userId: number,
    answer: string
  ): Promise<SubmitAnswerResponse> => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/problems/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemId,
          userId,
          answerChoice: answer,
        }),
      }
    );
    const data = await res.json();
    return { eloUpdate: data.eloUpdate, correct: data.correct };
  },

  // TODO: Implement backend endpoint
  // POST /problems/star
  // Body: { userId: number, problemId: number }
  // Response: { success: boolean }
  starProblem: async (userId: number, problemId: number): Promise<void> => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/problems/star`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        problemId,
      }),
    });
    if (!res.ok) {
      throw new Error("Failed to star problem");
    }
  },

  // TODO: Implement backend endpoint
  // DELETE /problems/star
  // Body: { userId: number, problemId: number }
  // Response: { success: boolean }
  unstarProblem: async (userId: number, problemId: number): Promise<void> => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/problems/star`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        problemId,
      }),
    });
    if (!res.ok) {
      throw new Error("Failed to unstar problem");
    }
  },

  // TODO: Implement backend endpoint
  // GET /problems/history?userId={userId}
  // Response: { history: ProblemHistoryItem[] }
  // Each item should include:
  //   - id: unique history entry id
  //   - problemId: the problem's id
  //   - problemText: the problem text (for display)
  //   - difficulty: problem difficulty
  //   - isFrq: whether it's FRQ or MCQ
  //   - userAnswer: what the user answered
  //   - correctAnswer: the correct answer
  //   - correct: whether user got it right
  //   - timestamp: when they attempted it
  //   - starred: whether the problem is starred
  getProblemHistory: async (userId: number): Promise<ProblemHistoryItem[]> => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/problems/history?userId=${userId}`
    );
    const data = await res.json();
    return data.history;
  },
};