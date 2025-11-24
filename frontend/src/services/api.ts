import type { User, Problem, SubmitAnswerResponse } from "../types";

export const api = {
  login: async () => {
    // We just redirect to the backend Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  },

  getProblem: async (userId: number): Promise<Problem> => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/problems/sample?userID=${userId}`
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
      });
    const data = await res.json();
    return {eloUpdate: data.eloUpdate, correct: data.correct}
  },
};
