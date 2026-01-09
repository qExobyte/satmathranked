// src/services/api.ts
import type {
  Problem,
  SubmitAnswerResponse,
  ProblemHistoryItem,
  User,
} from "../types";

const authFetch = async (url: string, options: RequestInit) => {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

export const api = {
  login: async () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  },

  logout: async (): Promise<void> => {
    const res = await authFetch(
      `${import.meta.env.VITE_API_URL}/auth/logout`,
      { method: "POST" }
    );
    if (!res.ok) {
      throw new Error("Logout failed");
    }
  },

  getUser: async (): Promise<User> => {
    const res = await authFetch(
      `${import.meta.env.VITE_API_URL}/auth/me`,
      { method: "GET" }
    );
    const data = await res.json();

    return data.user;
  },

  deleteAccount: async (userId: number): Promise<void> => {
    const res = await authFetch(
      `${import.meta.env.VITE_API_URL}/users?userId=${userId}`,
      {
        method: "DELETE",
      }
    );
    if (!res.ok) {
      throw new Error("Failed to delete account");
    }
  },

  getProblem: async (userId: number): Promise<Problem> => {
    const res = await authFetch(
      `${import.meta.env.VITE_API_URL}/problems/next?userId=${userId}`,
      {
        method: "GET",
      }
    );
    const data = await res.json();
    console.log(data.problem);
    return data.problem;
  },

  submitAnswer: async (
    problemId: number,
    userId: number,
    answer: string
  ): Promise<SubmitAnswerResponse> => {
    const res = await authFetch(
      `${import.meta.env.VITE_API_URL}/problems/submit`,
      {
        method: "POST",
        body: JSON.stringify({
          problemId,
          userId,
          answerChoice: answer,
        }),
      }
    );

    const data = await res.json();
    return {
      topicEloData: data.topicElos,
      correct: data.correct,
      overallElo: data.overallElo,
      streak: data.streak,
    };
  },

  starProblem: async (userId: number, problemId: number): Promise<void> => {
    const res = await authFetch(
      `${import.meta.env.VITE_API_URL}/problems/star`,
      {
        method: "POST",
        body: JSON.stringify({
          userId,
          problemId,
        }),
      }
    );
    if (!res.ok) {
      throw new Error("Failed to star problem");
    }
  },

  unstarProblem: async (userId: number, problemId: number): Promise<void> => {
    const res = await authFetch(
      `${import.meta.env.VITE_API_URL}/problems/star`,
      {
        method: "DELETE",
        body: JSON.stringify({
          userId,
          problemId,
        }),
      }
    );
    if (!res.ok) {
      throw new Error("Failed to unstar problem");
    }
  },

  getProblemHistory: async (userId: number): Promise<ProblemHistoryItem[]> => {
    const res = await authFetch(
      `${import.meta.env.VITE_API_URL}/problems/history?userId=${userId}`,
      {
        method: "GET",
      }
    );
    const data = await res.json();
    return data.history;
  },

  getLongestStreak: async (userId: number): Promise<Number> => {
    const res = await authFetch(
      `${import.meta.env.VITE_API_URL}/users/longest_streak?userId=${userId}`,
      { method: "GET" }
    );
    const data = await res.json();
    console.log(data.longestStreak);
    return data.longestStreak;
  },
};
