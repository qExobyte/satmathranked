// src/pages/ProblemPage.tsx
import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  FileText,
  Calculator,
  Diamond,
} from 'lucide-react';
import type { User, Problem, SubmitAnswerResponse } from '../types';
import { api } from '../services/api';
import { ProblemCard } from '../components/ProblemCard';

interface ProblemPageProps {
  user: User;
  onLogout: () => void;
}

export const ProblemPage: React.FC<ProblemPageProps> = ({ user, onLogout }) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<SubmitAnswerResponse | null>(null);
  const [elo, setElo] = useState(user.elo);
  const [animatedElo, setAnimatedElo] = useState(user.elo);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    loadProblem();
  }, []);

  const loadProblem = async () => {
    setLoading(true);
    setFeedback(null);
    setSelectedAnswer(null);
    setShowFeedback(false);
    try {
      const newProblem = await api.getProblem(user.id);
      setProblem(newProblem);
    } catch (err) {
      console.error('Failed to load problem:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !problem) return;
    setLoading(true);
    try {
      const result = await api.submitAnswer(problem.id, user.id, selectedAnswer);
      const oldElo = elo;
      const newElo = elo + result.eloUpdate;
      setFeedback(result);
      setElo(newElo);
      setShowFeedback(true);

      // Animate ELO change
      const duration = 1500;
      const steps = 30;
      const increment = result.eloUpdate / steps;
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setAnimatedElo(Math.round(oldElo + increment * currentStep));
        } else {
          setAnimatedElo(newElo);
          clearInterval(interval);
        }
      }, duration / steps);

      setTimeout(() => {
        loadProblem();
      }, 2500);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-2">
            <Diamond className="w-6 h-6 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">{elo}</span>
          </div>

          {/* Center */}
          <div className="text-3xl font-bold text-indigo-700 tracking-tight">
            satmathranked
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Desmos Calculator">
              <Calculator className="w-6 h-6 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Formula Sheet">
              <FileText className="w-6 h-6 text-gray-700" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Profile"
              >
                <UserIcon className="w-6 h-6 text-gray-700" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="font-semibold text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-sm text-gray-600">ELO: {elo}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {loading && !problem ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg">Loading problem...</p>
          </div>
        ) : problem ? (
          <ProblemCard
            problem={problem}
            selectedAnswer={selectedAnswer}
            feedback={feedback}
            showFeedback={showFeedback}
            animatedElo={animatedElo}
            onSelectAnswer={setSelectedAnswer}
            onSubmit={handleSubmit}
            loading={loading}
          />
        ) : null}
      </div>
    </div>
  );
};
