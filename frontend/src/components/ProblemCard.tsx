// src/components/ProblemCard.tsx
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { Problem, SubmitAnswerResponse } from '../types';

interface ProblemCardProps {
  problem: Problem;
  selectedAnswer?: string | null;
  feedback?: SubmitAnswerResponse | null;
  showFeedback?: boolean;
  disabled?: boolean;
  animatedElo?: number;
  onSelectAnswer?: (answer: string) => void;
  onSubmit?: () => void;
  loading?: boolean;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  selectedAnswer,
  feedback,
  showFeedback = false,
  disabled = false,
  animatedElo,
  onSelectAnswer,
  onSubmit,
  loading = false,
}) => {
  const labels= ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-12 relative overflow-hidden transition-all duration-500">
      {/* Metadata */}
      <div className="absolute top-6 right-6 flex gap-2">
        <div className="bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm font-medium">
          600
        </div>
        <div className="bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm font-medium">
          {problem.category}
        </div>
      </div>

      {/* Feedback Overlay */}
      {showFeedback && feedback && (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center animate-fadeIn">
          <div className="text-center">
            {feedback.correct ? (
              <ArrowUp className="w-32 h-32 text-green-500 mx-auto mb-4" />
            ) : (
              <ArrowDown className="w-32 h-32 text-red-500 mx-auto mb-4" />
            )}
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {animatedElo ?? ''}
            </div>
            <div
              className={`text-xl font-semibold flex items-center justify-center gap-2 ${
                feedback.correct ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {feedback.correct ? (
                <ArrowUp className="w-5 h-5" />
              ) : (
                <ArrowDown className="w-5 h-5" />
              )}
              <span>{problem.category}</span>
              <span>{Math.abs(feedback.eloUpdate)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="mb-8">
        <p className="text-xl text-gray-800 leading-relaxed mb-8">
          {problem.question}
        </p>

        <div className="space-y-3">
          {problem.options.map((option, index) => (
            <button
              key={option}
              onClick={() => !disabled && onSelectAnswer?.(option)}
              disabled={disabled || showFeedback}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedAnswer === option
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              } ${
                showFeedback &&
                selectedAnswer === option &&
                !feedback?.correct
                  ? 'border-red-500 bg-red-50'
                  : ''
              } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                    selectedAnswer === option
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  } ${
                    showFeedback &&
                    selectedAnswer === option &&
                    !feedback?.correct
                      ? 'bg-red-500 text-white'
                      : ''
                  }`}
                >
                  {showFeedback &&
                  selectedAnswer === option &&
                  !feedback?.correct
                    ? '✗'
                    : labels[index]}
                </div>
                <span className="text-lg">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {onSubmit && (
        <button
          onClick={onSubmit}
          disabled={!selectedAnswer || loading || showFeedback}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
      `}</style>
    </div>
  );
};
