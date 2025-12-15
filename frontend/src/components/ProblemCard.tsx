import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, Star } from "lucide-react";
import type { Problem } from "../types";
import renderMathInElement from "katex/contrib/auto-render";
import "katex/dist/katex.min.css";

interface ProblemCardProps {
  problem: Problem;
  selectedAnswer: string | null;
  firstSubmissionMade: boolean;
  firstSubmissionCorrect: boolean | null;
  eloUpdateAmount: number;
  animatedElo: number;
  isStarred: boolean;
  onSelectAnswer: (answer: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  onToggleStar: () => void;
  loading: boolean;
}

export const ProblemCard: React.FC<{
  problem: Problem;
  selectedAnswer: string | null;
  firstSubmissionMade: boolean;
  firstSubmissionCorrect: boolean | null;
  eloUpdateAmount: number;
  animatedElo: number;
  isStarred: boolean;
  onSelectAnswer: (answer: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  onToggleStar: () => void;
  loading: boolean;
}> = ({
  problem,
  selectedAnswer,
  firstSubmissionMade,
  firstSubmissionCorrect,
  eloUpdateAmount,
  animatedElo,
  isStarred,
  onSelectAnswer,
  onSubmit,
  onNext,
  onToggleStar,
  loading
}) => {
  const labels = ["A", "B", "C", "D"];
  const [showEloAnimation, setShowEloAnimation] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(true);

  const questionRef = useRef<HTMLDivElement>(null);
  const answerChoiceRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const mcqAnswerExplanationRefs = useRef<(HTMLDivElement | null)[]>([]);

  function katexRender(textDiv: HTMLDivElement | HTMLSpanElement) {
    renderMathInElement(textDiv, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
    });
  }

  // Display current question with text
  useEffect(() => {
    if (questionRef.current) {
      katexRender(questionRef.current);
    }
  }, [problem.problemText]);

  // Display answer choices in latex
  useEffect(() => {
    answerChoiceRefs.current.forEach((ref) => {
      if (ref) {
        katexRender(ref);
      }
    });
  }, [problem.answerChoices]);

  // Display explanations for submitted MCQ answers
  useEffect(() => {
    if (firstSubmissionMade) {
      mcqAnswerExplanationRefs.current.forEach((ref) => {
        if (ref) {
          katexRender(ref);
        }
      });
    }
  }, [firstSubmissionMade, problem.answerChoices]);

  useEffect(() => {
    setAnimationComplete(true);
  }, [problem.id]);

  useEffect(() => {
    if (firstSubmissionMade) {
      setShowEloAnimation(true);
      setAnimationComplete(false);
      const timer = setTimeout(() => {
        setShowEloAnimation(false);
        setAnimationComplete(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [firstSubmissionMade]);

  return (
    <div className="relative">
      {showEloAnimation && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-full mb-6 z-50 pointer-events-none">
          <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
            firstSubmissionCorrect
              ? "bg-emerald-500/90 border-emerald-400/50"
              : "bg-rose-500/90 border-rose-400/50"
          } animate-slideDown`}>
            {firstSubmissionCorrect ? (
              <ArrowUp className="w-8 h-8 text-white animate-bounce" />
            ) : (
              <ArrowDown className="w-8 h-8 text-white animate-bounce" />
            )}
            <div className="text-5xl font-bold text-white animate-slotMachine">{animatedElo}</div>
            <div className="text-2xl font-bold text-white">
              {eloUpdateAmount > 0 ? `+${eloUpdateAmount}` : eloUpdateAmount}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/5 dark:bg-white/5 bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-12 relative overflow-hidden border border-white/10 dark:border-white/10 border-gray-200">
        <div className="absolute top-6 right-6 flex gap-2">
          <button
            onClick={onToggleStar}
            className="p-2.5 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
            title={isStarred ? "Unstar problem" : "Star problem"}
          >
            <Star
              className={`w-6 h-6 transition-all ${
                isStarred ? "fill-yellow-400 text-yellow-400" : "dark:text-gray-400 text-gray-500"
              }`}
            />
          </button>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">
            {problem.difficulty}
          </div>
        </div>

        <div className="mb-8">
          <div
            className="text-xl dark:text-white text-gray-900 leading-relaxed mb-8 pr-32"
            ref={questionRef}
          >
            {problem.problemText}
          </div>

          <div className="space-y-3">
            {problem.isFrq ? (
              <input
                value={selectedAnswer ?? ""}
                onChange={(e) => !firstSubmissionMade && onSelectAnswer(e.target.value)}
                disabled={firstSubmissionMade}
                className={`w-full p-4 rounded-xl border-2 text-lg transition-all ${
                  firstSubmissionMade
                    ? firstSubmissionCorrect
                      ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/10 bg-emerald-50 cursor-not-allowed dark:text-white text-gray-900"
                      : "border-rose-500 bg-rose-500/10 dark:bg-rose-500/10 bg-rose-50 cursor-not-allowed dark:text-white text-gray-900"
                    : "dark:border-white/20 border-gray-300 hover:border-indigo-400 dark:hover:border-indigo-400 dark:focus:border-indigo-500 focus:border-indigo-500 focus:ring-4 dark:focus:ring-indigo-700 focus:ring-indigo-200 dark:bg-white/5 bg-white dark:text-white text-gray-900"
                }`}
                placeholder="Type your answer..."
              />
            ) : (
              <>
                {problem.answerChoices &&
                  Object.keys(problem.answerChoices).map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const wasSubmitted = selectedAnswer === option && firstSubmissionMade;
                    const showAsCorrect = wasSubmitted && firstSubmissionCorrect;
                    const showAsIncorrect = wasSubmitted && !firstSubmissionCorrect;

                    return (
                      <div key={option}>
                        <button
                          onClick={() => !firstSubmissionMade && onSelectAnswer(option)}
                          disabled={firstSubmissionMade}
                          className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                            showAsCorrect
                              ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/10 bg-emerald-50 shadow-lg shadow-emerald-500/20"
                              : showAsIncorrect
                              ? "border-rose-500 bg-rose-500/10 dark:bg-rose-500/10 bg-rose-50 shadow-lg shadow-rose-500/20"
                              : isSelected
                              ? "border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/10 bg-indigo-50 shadow-lg shadow-indigo-500/20 scale-[1.02]"
                              : "dark:border-white/20 border-gray-300 hover:border-indigo-400 hover:shadow-md bg-white/5 dark:bg-white/5 bg-white"
                          } ${
                            firstSubmissionMade ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                                showAsCorrect
                                  ? "bg-emerald-500 text-white shadow-lg"
                                  : showAsIncorrect
                                  ? "bg-rose-500 text-white shadow-lg"
                                  : isSelected
                                  ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg"
                                  : "bg-white/10 dark:bg-white/10 bg-gray-100 dark:text-white text-gray-700"
                              }`}
                            >
                              {showAsCorrect ? "✓" : showAsIncorrect ? "✗" : labels[index]}
                            </div>
                            <span
                              className="text-lg flex-1 dark:text-white text-gray-900"
                              ref={(choice) => {
                                answerChoiceRefs.current[index] = choice;
                              }}
                            >
                              {option}
                            </span>
                          </div>
                        </button>

                        {wasSubmitted && problem.answerChoices[option].explanation && (
                          <div
                            className={`mt-3 p-4 rounded-xl border-2 ${
                              firstSubmissionCorrect
                                ? "bg-emerald-500/10 dark:bg-emerald-500/10 bg-emerald-50 border-emerald-500/30 dark:border-emerald-500/30 border-emerald-300"
                                : "bg-rose-500/10 dark:bg-rose-500/10 bg-rose-50 border-rose-500/30 dark:border-rose-500/30 border-rose-300"
                            }`}
                          >
                            <div
                              className={`font-semibold mb-2 ${
                                firstSubmissionCorrect ? " dark:text-emerald-400 text-emerald-700" : "dark:text-rose-400 text-rose-700"
                              }`}
                            >
                              {firstSubmissionCorrect ? "✓ Correct!" : "✗ Incorrect"}
                            </div>
                            <div
                              className={`text-sm leading-relaxed ${
                                firstSubmissionCorrect ? "dark:text-emerald-200 text-emerald-800" : "dark:text-rose-200 text-rose-800"
                              }`}
                              ref={(el) => {
                                mcqAnswerExplanationRefs.current[index] = el;
                              }}
                            >
                              {problem.answerChoices[option].explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </>
            )}
          </div>
        </div>

        {firstSubmissionMade ? (
          <button
            onClick={onNext}
            disabled={!animationComplete}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Problem
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={loading || !selectedAnswer}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slotMachine {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-slotMachine {
          animation: slotMachine 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};
