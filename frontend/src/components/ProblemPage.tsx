// src/pages/ProblemPage.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  User as UserIcon,
  FileText,
  Calculator,
  Diamond,
  X,
  List,
  Flame,
  LogOut,
} from "lucide-react";
import { Rnd } from "react-rnd";
import type { User, Problem } from "../types";
import { api } from "../services/api";
import { ProblemCard } from "./ProblemCard";
import { ProfilePage } from "./ProfilePage";
import { ScrollAnimation } from "./ScrollAnimation";

declare global {
  interface Window {
    Desmos: any;
  }
}

interface ProblemPageProps {
  user: User;
  onLogout: () => void;
}

export const ProblemPage: React.FC<ProblemPageProps> = ({ user, onLogout}) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elo, setElo] = useState(user.elo);
  const [animatedElo, setAnimatedElo] = useState(user.elo);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDesmos, setShowDesmos] = useState(false);
  const [showFormulaSheet, setShowFormulaSheet] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [topicEloData, setTopicEloData] = useState(user.topicEloData);
  const [streak, setStreak] = useState(user.streak);

  const [firstSubmissionMade, setFirstSubmissionMade] = useState(false);
  const [firstSubmissionCorrect, setFirstSubmissionCorrect] = useState<boolean | null>(null);
  const [eloUpdateAmount, setEloUpdateAmount] = useState(0);

  const desmosContainerRef = useRef<HTMLDivElement | null>(null);
  const desmosInstanceRef = useRef<any>(null);
  const desmosStateRef = useRef<any>(null);

  const [desmosSize, setDesmosSize] = useState({ width: 500, height: 400 });
  const [desmosPosition, setDesmosPosition] = useState({ x: 50, y: 100 });
  const [formulaSheetSize, setFormulaSheetSize] = useState({ width: 800, height: 600 });
  const [formulaSheetPosition, setFormulaSheetPosition] = useState({ x: 50, y: 100 });

  useEffect(() => {
    loadProblem();
  }, []);

  useEffect(() => {
    if (showDesmos && !(window as any).Desmos) {
      const script = document.createElement("script");
      script.src = `https://www.desmos.com/api/v1.9/calculator.js?apiKey=${import.meta.env.VITE_DESMOS_API_KEY}`;
      script.async = true;
      script.onload = () => initDesmos();
      document.body.appendChild(script);
    } else if (showDesmos && (window as any).Desmos) {
      initDesmos();
    }

    return () => {
      if (desmosInstanceRef.current) {
        desmosStateRef.current = desmosInstanceRef.current.getState();
        desmosInstanceRef.current.destroy();
        desmosInstanceRef.current = null;
      }
    };
  }, [showDesmos]);

  const initDesmos = () => {
    if (!desmosContainerRef.current || desmosInstanceRef.current) return;
    const elt = desmosContainerRef.current;
    desmosInstanceRef.current = (window as any).Desmos.GraphingCalculator(elt, {
      expressions: true,
      keypad: true,
      settingsMenu: false,
    });

    if (desmosStateRef.current) {
      desmosInstanceRef.current.setState(desmosStateRef.current);
    }
  };

  const loadProblem = async () => {
    setLoading(true);
    setSelectedAnswer(null);
    setFirstSubmissionMade(false);
    setFirstSubmissionCorrect(null);
    setEloUpdateAmount(0);
    try {
      const newProblem = await api.getProblem(user.id);
      setProblem(newProblem);
      setIsStarred(newProblem.starred);
    } catch (err) {
      console.error("Failed to load problem:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !problem || firstSubmissionMade) return;

    setLoading(true);
    try {
      const result = await api.submitAnswer(problem.id, user.id, selectedAnswer);

      setFirstSubmissionMade(true);
      setFirstSubmissionCorrect(result.correct);
      setTopicEloData(result.topicEloData);
      setStreak(result.streak);

      const oldElo = elo;
      const newElo = result.overallElo;
      const eloUpdate = newElo - oldElo;
      setEloUpdateAmount(eloUpdate);
      setElo(newElo);

      const duration = 1500;
      const steps = 30;
      const increment = eloUpdate / steps;
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
    } catch (err) {
      console.error("Failed to submit answer:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    loadProblem();
  };

  const handleToggleStar = async () => {
    if (!problem) return;

    try {
      if (isStarred) {
        await api.unstarProblem(user.id, problem.id);
      } else {
        await api.starProblem(user.id, problem.id);
      }
      setIsStarred(!isStarred);
    } catch (err) {
      console.error("Failed to toggle star:", err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount(user.id);
      onLogout();
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

  const updatedUser = {
    ...user,
    elo,
    topicEloData,
    streak
  };

  if (showProfile) {
    return (
      <ProfilePage
        user={updatedUser}
        onBack={() => setShowProfile(false)}
        onLogout={onLogout}
        onDeleteAccount={handleDeleteAccount}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-slate-950 dark:to-purple-950 from-slate-50 to-purple-50 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96  dark:bg-indigo-500/20 bg-indigo-300/30 rounded-full blur-3xl top-0 -right-48"></div>
        <div className="absolute w-96 h-96  dark:bg-purple-500/20 bg-purple-300/30 rounded-full blur-3xl bottom-0 -left-48"></div>
      </div>

      {/* Header */}
      <div className="dark:bg-white/5 bg-white/80 backdrop-blur-xl shadow-sm border-b dark:border-white/10 border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="p-2.5 dark:hover:bg-white/10 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
                title="Topic ELO Breakdown"
              >
                <List className="w-5 h-5 dark:text-gray-200 text-gray-700" />
              </button>
              {showCategoryMenu && (
                <div className="absolute left-0 mt-2 w-96  dark:bg-slate-900 bg-white rounded-2xl shadow-xl borderdark:border-white/20 border-gray-200 py-3 z-20 max-h-[32rem] overflow-y-auto">
                  <div className="px-5 py-3 border-b dark:border-white/10 border-gray-200 sticky top-0 dark:bg-slate-900 bg-white">
                    <div className="font-semibold  dark:text-white text-gray-900">Topic ELO Breakdown</div>
                  </div>
                  {topicEloData.map((topic) => (
                    <div
                      key={topic.topicId}
                      className="px-5 py-3 dark:hover:bg-white/5 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className=" dark:text-gray-200 text-gray-700 font-medium">{topic.topicName}</span>
                        <div className="flex items-center gap-2">
                          <Diamond className="w-4 h-4  dark:text-indigo-400 text-indigo-600" />
                          <span className="font-bold dark:text-white text-gray-900">{Math.round(topic.elo)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl shadow-lg">
                <Diamond className="w-5 h-5" />
                <span className="text-xl font-bold">{animatedElo}</span>
              </div>

              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-xl shadow-lg">
                <Flame className="w-5 h-5" />
                <span className="text-xl font-bold">{streak}</span>
              </div>
            </div>
          </div>

          <div className="text-2xl font-bold bg-gradient-to-r dark:from-indigo-400 dark:to-purple-400 from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            satmathranked
          </div>

          <div className="flex items-center gap-3">

            <button
              className={`p-2.5 rounded-xl transition-all hover:scale-110 ${
                showDesmos ? " dark:bg-white/10 bg-indigo-100" : " dark:hover:bg-white/10 hover:bg-gray-100"
              }`}
              title="Desmos Calculator"
              onClick={() => setShowDesmos(!showDesmos)}
            >
              <Calculator className="w-5 h-5  dark:text-gray-200 text-gray-700" />
            </button>

            <button
              className="p-2.5 dark:hover:bg-white/10 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
              title="Formula Sheet"
              onClick={() => setShowFormulaSheet(!showFormulaSheet)}
            >
              <FileText className="w-5 h-5 dark:text-gray-200 text-gray-700" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="p-2.5  dark:hover:bg-white/10 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
                title="Profile"
              >
                <UserIcon className="w-5 h-5  dark:text-gray-200 text-gray-700" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56  dark:bg-slate-900 bg-white rounded-2xl shadow-xl border dark:border-white/20 border-gray-200 py-2 z-20 overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r dark:from-indigo-500/20 dark:to-purple-500/20 from-indigo-50 to-purple-50 border-b dark:border-white/10 border-gray-200">
                    <div className="font-semibold  dark:text-white text-gray-900">{user.username}</div>
                    <div className="text-sm  dark:text-gray-300 text-gray-600">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowProfile(true);
                    }}
                    className="w-full text-left px-4 py-3 dark:text-gray-200 text-gray-700 dark:hover:bg-white/5 hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-3 dark:text-gray-200 text-gray-700  dark:hover:bg-white/5 hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        {loading && !problem ? (
          <div className="dark:bg-white/5 bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-16 text-center border dark:border-white/10 border-gray-200">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto"></div>
            <p className="mt-6 dark:text-gray-300 text-gray-600 text-lg">Loading problem...</p>
          </div>
        ) : problem ? (
          <ProblemCard
            problem={problem}
            selectedAnswer={selectedAnswer}
            firstSubmissionMade={firstSubmissionMade}
            firstSubmissionCorrect={firstSubmissionCorrect}
            eloUpdateAmount={eloUpdateAmount}
            animatedElo={animatedElo}
            isStarred={isStarred}
            onSelectAnswer={setSelectedAnswer}
            onSubmit={handleSubmit}
            onNext={handleNext}
            onToggleStar={handleToggleStar}
            loading={loading}
          />
        ) : null}
      </div>

      {/* Desmos Calculator Window */}
      {showDesmos && (
        <Rnd
          position={desmosPosition}
          size={desmosSize}
          minWidth={300}
          minHeight={200}
          bounds="window"
          dragHandleClassName="drag-handle"
          onDragStop={(_e, d) => {
            setDesmosPosition({ x: d.x, y: d.y });
          }}
          onResizeStop={(_e, _direction, ref) => {
            setDesmosSize({
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            });
          }}
          style={{ zIndex: 40 }}
        >
          <div className="bg-white shadow-2xl rounded-2xl border-2 border-gray-300 h-full flex flex-col overflow-hidden">
            <div className="drag-handle flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 cursor-move select-none">
              <span className="font-semibold">Desmos Calculator</span>
              <button
                onClick={() => setShowDesmos(false)}
                className="hover:bg-white/20 rounded-lg p-1 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div ref={desmosContainerRef} className="flex-1" />
          </div>
        </Rnd>
      )}

      {/* Formula Sheet Window */}
      {showFormulaSheet && (
        <Rnd
          size={formulaSheetSize}
          position={formulaSheetPosition}
          minWidth={400}
          minHeight={300}
          bounds="window"
          dragHandleClassName="drag-handle-formula"
          onDragStop={(_e, d) => {
            setFormulaSheetPosition({ x: d.x, y: d.y });
          }}
          onResizeStop={(_e, _direction, ref) => {
            setFormulaSheetSize({
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            });
          }}
          style={{ zIndex: 40 }}
        >
          <div className="bg-white shadow-2xl rounded-2xl border-2 border-gray-300 h-full flex flex-col overflow-hidden">
            <div className="drag-handle-formula flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 cursor-move select-none">
              <span className="font-semibold">Formula Sheet</span>
              <button
                onClick={() => setShowFormulaSheet(false)}
                className="hover:bg-white/20 rounded-lg p-1 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <img
                src="/assets/formula-sheet.jpg"
                alt="Formula Sheet"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </Rnd>
      )}
    </div>
  );
};