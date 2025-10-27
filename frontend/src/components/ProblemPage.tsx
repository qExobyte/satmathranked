import React, { useState, useEffect, useRef } from "react";
import {
  User as UserIcon,
  FileText,
  Calculator,
  Diamond,
  Minus,
  X,
} from "lucide-react";
import type { User, Problem, SubmitAnswerResponse } from "../types";
import { api } from "../services/api";
import { ProblemCard } from "../components/ProblemCard";

declare global {
  interface Window {
    Desmos: any;
  }
}

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
  const [showDesmos, setShowDesmos] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const desmosContainerRef = useRef<HTMLDivElement | null>(null);
  const desmosInstanceRef = useRef<any>(null);

  // position state for dragging
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  useEffect(() => {
    loadProblem();
  }, []);

  useEffect(() => {
    if (showDesmos && !window.Desmos) {
      const script = document.createElement("script");
      script.src = "https://www.desmos.com/api/v1.9/calculator.js";
      script.async = true;
      script.onload = () => initDesmos();
      document.body.appendChild(script);
    } else if (showDesmos && window.Desmos) {
      initDesmos();
    }

    return () => {
      if (desmosInstanceRef.current) {
        desmosInstanceRef.current.destroy();
        desmosInstanceRef.current = null;
      }
    };
  }, [showDesmos]);

  const initDesmos = () => {
    if (!desmosContainerRef.current || desmosInstanceRef.current) return;
    const elt = desmosContainerRef.current;
    desmosInstanceRef.current = window.Desmos.GraphingCalculator(elt, {
      expressions: true,
      keypad: true,
      settingsMenu: false,
    });
  };

  const loadProblem = async () => {
    setLoading(true);
    setFeedback(null);
    setSelectedAnswer(null);
    setShowFeedback(false);
    try {
      const newProblem = await api.getProblem(user.id);
      setProblem(newProblem);
    } catch (err) {
      console.error("Failed to load problem:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !problem) return;
    setLoading(true);
    try {
      const result = await api.submitAnswer(
        problem.id,
        user.id,
        selectedAnswer
      );
      const oldElo = elo;
      const newElo = elo + result.eloUpdate;
      setFeedback(result);
      setElo(newElo);
      setShowFeedback(true);

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
      console.error("Failed to submit answer:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- DRAG HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDraggingRef.current) {
      setPosition({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Diamond className="w-6 h-6 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">{elo}</span>
          </div>

          <div className="text-3xl font-bold text-indigo-700 tracking-tight">
            satmathranked
          </div>

          <div className="flex items-center gap-4">
            <button
              className={`p-2 rounded-lg transition ${
                showDesmos ? "bg-indigo-100" : "hover:bg-gray-100"
              }`}
              title="Desmos Calculator"
              onClick={() => setShowDesmos(!showDesmos)}
            >
              <Calculator className="w-6 h-6 text-gray-700" />
            </button>

            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Formula Sheet"
            >
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
                    <div className="font-semibold text-gray-900">
                      {user.username}
                    </div>
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

      {showDesmos && (
        <div
          className="fixed z-40 w-[500px] bg-white shadow-2xl rounded-lg border border-gray-300"
          style={{ top: position.y, left: position.x }}
        >
          <div
            className="flex items-center justify-between bg-indigo-600 text-white px-3 py-2 rounded-t-lg cursor-move select-none"
            onMouseDown={handleMouseDown}
          >
            <span className="font-semibold">Desmos Calculator</span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-indigo-500 rounded p-1"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDesmos(false)}
                className="hover:bg-indigo-500 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
            <div
              ref={desmosContainerRef}
              className={`w-full transition-all duration-200 rounded-b-lg ${
                isMinimized ? "h-0 overflow-hidden" : "h-[400px]"
              }`}
            />
        </div>
      )}
    </div>
  );
};
