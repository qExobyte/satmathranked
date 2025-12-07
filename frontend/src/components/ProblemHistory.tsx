// src/components/ProblemHistory.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";
import { api } from "../services/api";
import type { ProblemHistoryItem } from "../types";

interface ProblemHistoryProps {
  userId: number;
  onClose: () => void;
}

export const ProblemHistory: React.FC<ProblemHistoryProps> = ({
  userId,
  onClose,
}) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Problem History</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "oldest")}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterBy}
              onChange={(e) =>
                setFilterBy(
                  e.target.value as "all" | "correct" | "incorrect" | "starred"
                )
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Problems</option>
              <option value="correct">Correct Only</option>
              <option value="incorrect">Incorrect Only</option>
              <option value="starred">Starred Only</option>
            </select>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
            </div>
          ) : filteredAndSortedHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No problems found with the current filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {item.correct ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-sm text-gray-600">
                        {new Date(item.timestamp).toLocaleDateString()} at{" "}
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                      {item.starred && (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                      {item.difficulty}
                    </div>
                  </div>

                  <div className="text-gray-800 mb-2 line-clamp-2">
                    {item.problemText}
                  </div>

                  <div className="flex gap-4 text-sm flex-wrap">
                    <div>
                      <span className="text-gray-600">Your answer: </span>
                      <span
                        className={
                          item.correct
                            ? "text-green-700 font-semibold"
                            : "text-red-700 font-semibold"
                        }
                      >
                        {item.userAnswer}
                      </span>
                    </div>
                    {!item.correct && (
                      <div>
                        <span className="text-gray-600">Correct answer: </span>
                        <span className="text-green-700 font-semibold">
                          {item.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};