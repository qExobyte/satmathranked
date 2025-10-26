import type { User, Problem, SubmitAnswerResponse } from '../types';

export const api = {
  login: async (): Promise<{ success: boolean; user: User }> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      user: { id: 1, username: "username", email: "email", elo: 500 }
    };
  },
  
  getProblem: async (userId: number): Promise<Problem> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 300));
    const problems: Problem[] = [
      { 
        id: 1, 
        question: "If 3x + 7 = 22, what is the value of x?",
        category: "Algebra",
        difficulty: 600,
        options: [
            "5" ,
            "7" ,
            "15" ,
            "29" ,
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