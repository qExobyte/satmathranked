// src/components/ProblemHistory.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
} from "lucide-react";
import { api } from "../services/api";
import type { ProblemHistoryItem } from "../types";

export const ProblemHistory: React.FC<{
  userId: number;
  onClose: () => void;
}> = ({ userId, onClose }) => {
  const [history, setHistory] = useState<ProblemHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
  const [filterBy, setFilterBy] = useState<
    "all" | "correct" | "incorrect" | "starred"
  >("all");

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getProblemHistory(userId);
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedHistory = history
    .filter((item) => {
      if (filterBy === "correct") return item.correct;
      if (filterBy === "incorrect") return !item.correct;
      if (filterBy === "starred") return item.starred;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortBy === "recent" ? dateB - dateA : dateA - dateB;
    });

  const getCorrectAnswer = (
    choices: Record<string, { isCorrect: boolean; explanation: string }>
  ) => {
    const found = Object.entries(choices).find(
      ([, value]) => value.isCorrect === true
    );
    return found ? found[0] : "N/A";
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Problem History
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex gap-4 flex-wrap bg-gray-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "recent" | "oldest")
              }
              className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <select
              value={filterBy}
              onChange={(e) =>
                setFilterBy(
                  e.target.value as
                    | "all"
                    | "correct"
                    | "incorrect"
                    | "starred"
                )
              }
              className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
            >
              <option value="all">All Problems</option>
              <option value="correct">Correct Only</option>
              <option value="incorrect">Incorrect Only</option>
              <option value="starred">Starred Only</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
            </div>
          ) : filteredAndSortedHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No problems found with the current filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedHistory.map((item) => {
                const correctAnswer = getCorrectAnswer(
                  item.answerChoices
                );

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-5 border-2 border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-400 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {item.correct ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(
                            item.timestamp
                          ).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(
                            item.timestamp
                          ).toLocaleTimeString()}
                        </span>
                        {item.starred && (
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-xl text-xs font-semibold">
                        {item.difficulty}
                      </div>
                    </div>

                    <div className="text-gray-800 dark:text-gray-200 mb-3 line-clamp-2">
                      {item.problemText}
                    </div>

                    <div className="flex gap-4 text-sm flex-wrap">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Your answer:{" "}
                        </span>
                        <span
                          className={
                            item.correct
                              ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                              : "text-rose-700 dark:text-rose-400 font-semibold"
                          }
                        >
                          {item.userAnswer}
                        </span>
                      </div>

                      {!item.correct && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Correct answer:{" "}
                          </span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                            {correctAnswer}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
