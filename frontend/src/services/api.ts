import type { User, Problem, SubmitAnswerResponse } from '../types';

export const api = {
  login: async () => {
    // We just redirect to the backend Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  },
  
  getProblem: async (userId: number): Promise<Problem> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 300));
    const problems: Problem[] = [
      { 
        id: 1, 
        question: "If $3x + 7 = 22$, what is the value of $x$?",
        category: "Algebra",
        difficulty: 600,
        options: [
            "$5$",
            "$7$",
            "$15$",
            "$29$",
        ],
        type: "mcq"
      },
    ];
    return problems[Math.floor(Math.random() * problems.length)];
  },
  
  submitAnswer: async (
    problemId: number, 
    userId: number, 
    answer: string, 
  ): Promise<SubmitAnswerResponse> => {
    // TODO: Replace with actual API call
    const correctAnswer = "5"; // Placeholder
    await new Promise(resolve => setTimeout(resolve, 500));
    const isCorrect = answer === correctAnswer;
    const eloUpdate = isCorrect 
      ? Math.floor(Math.random() * 15) + 5 
      : -(Math.floor(Math.random() * 10) + 3);
    return {
        eloUpdate: eloUpdate,
        correct: isCorrect,
    };
  }
};