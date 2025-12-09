// src/services/api.ts
import type { Problem, SubmitAnswerResponse, ProblemHistoryItem } from "../types";


export const api = {
  login: async () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  },

    deleteAccount: async (userId: number): Promise<void> => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users?userId=${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error("Failed to delete account");
    }
  },

  getProblem: async (userId: number): Promise<Problem> => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/problems/next?userId=${userId}`
    );
    const data = await res.json();
    console.log(data.problem)
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
    return { eloUpdate: data.eloUpdate, correct: data.correct, categoryUpdate: data.categoryUpdate };
  },

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


  getProblemHistory: async (userId: number): Promise<ProblemHistoryItem[]> => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/problems/history?userId=${userId}`
    );
    const data = await res.json();
    console.log(data.history);
    return data.history;
  },
};