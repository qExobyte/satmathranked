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
    // TODO: Replace with actual API call
    const correctAnswer = "5"; // Placeholder
    await new Promise((resolve) => setTimeout(resolve, 500));
    const isCorrect = answer === correctAnswer;
    const eloUpdate = isCorrect
      ? Math.floor(Math.random() * 15) + 5
      : -(Math.floor(Math.random() * 10) + 3);
    return {
      eloUpdate: eloUpdate,
      correct: isCorrect,
    };
  },
};
