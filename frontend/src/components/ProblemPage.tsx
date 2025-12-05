// src/pages/ProblemPage.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  User as UserIcon,
  FileText,
  Calculator,
  Diamond,
  X,
  List,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Rnd } from "react-rnd";
import type { User, Problem, SubmitAnswerResponse } from "../types";
import { api } from "../services/api";
import { ProblemCard } from "./ProblemCard";

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
  const [elo, setElo] = useState(user.elo);
  const [animatedElo, setAnimatedElo] = useState(user.elo);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showDesmos, setShowDesmos] = useState(false);
  const [showFormulaSheet, setShowFormulaSheet] = useState(false);

  // New state for tracking submission flow
  const [firstSubmissionMade, setFirstSubmissionMade] = useState(false);
  const [firstSubmissionCorrect, setFirstSubmissionCorrect] = useState<
      boolean | null
  >(null);
  const [eloUpdateAmount, setEloUpdateAmount] = useState(0);

  const desmosContainerRef = useRef<HTMLDivElement | null>(null);
  const desmosInstanceRef = useRef<any>(null);
  const desmosStateRef = useRef<any>(null);

  const [desmosSize, setDesmosSize] = useState({ width: 500, height: 400 });
  const [desmosPosition, setDesmosPosition] = useState({ x: 50, y: 100 });
  const [formulaSheetSize, setFormulaSheetSize] = useState({ width: 800, height: 600 });
  const [formulaSheetPosition, setFormulaSheetPosition] = useState({x: 50, y: 100});

  // TODO replace topicElo mock with whatever reference we actually have to the topic elos
  // but these categories are the actual categories we should use!
  const categoryStructure = [
    {
      name: "Algebra & Functions",
      subtopics: [
        { name: "Algebra", elo: user.topicElo?.algebra || elo },
        { name: "Equivalent Expressions", elo: user.topicElo?.equivalentExpressions || elo },
        { name: "Solving for Constants", elo: user.topicElo?.solvingForConstants || elo },
        { name: "Translating English to Math", elo: user.topicElo?.translatingEnglishToMath || elo },
        { name: "Linear Functions", elo: user.topicElo?.linearFunctions || elo },
        { name: "Systems of Equations & Inequalities", elo: user.topicElo?.systemsOfEquationsInequalities || elo },
      ]
    },
    {
      name: "Exponential Growth",
      subtopics: [
        { name: "Percentages", elo: user.topicElo?.percentages || elo },
        { name: "Exponents", elo: user.topicElo?.exponents || elo },
        { name: "Exponential Functions", elo: user.topicElo?.exponentialFunctions || elo },
      ]
    },
    {
      name: "Quadratics & Polynomial Functions",
      subtopics: [
        { name: "Factoring", elo: user.topicElo?.factoring || elo },
        { name: "Solving Quadratic Equations", elo: user.topicElo?.solvingQuadraticEquations || elo },
        { name: "Analyzing Quadratic Functions", elo: user.topicElo?.analyzingQuadraticFunctions || elo },
        { name: "Polynomial Functions", elo: user.topicElo?.polynomialFunctions || elo },
        { name: "Rational Functions", elo: user.topicElo?.rationalFunctions || elo },
      ]
    },
    {
      name: "Geometry & Trig",
      subtopics: [
        { name: "Angles", elo: user.topicElo?.angles || elo },
        { name: "Triangles", elo: user.topicElo?.triangles || elo },
        { name: "Circles", elo: user.topicElo?.circles || elo },
        { name: "Area, Surface Area & Volume", elo: user.topicElo?.areaSurfaceAreaVolume || elo },
        { name: "Unit Conversion", elo: user.topicElo?.unitConversion || elo },
      ]
    },
    {
      name: "Statistics",
      subtopics: [
        { name: "Scatterplots", elo: user.topicElo?.scatterplots || elo },
        { name: "Probability", elo: user.topicElo?.probability || elo },
        { name: "Mean, Median & Standard Deviation", elo: user.topicElo?.meanMedianStandardDeviation || elo },
        { name: "Sampling", elo: user.topicElo?.sampling || elo },
      ]
    },
  ];

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  useEffect(() => {
    loadProblem();
  }, []);

  useEffect(() => {
    if (showDesmos && !window.Desmos) {
      const script = document.createElement("script");
      script.src = `https://www.desmos.com/api/v1.9/calculator.js?apiKey=${
          import.meta.env.VITE_DESMOS_API_KEY
      }`;
      script.async = true;
      script.onload = () => initDesmos();
      document.body.appendChild(script);
    } else if (showDesmos && window.Desmos) {
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
    desmosInstanceRef.current = window.Desmos.GraphingCalculator(elt, {
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
      const result = await api.submitAnswer(
          problem.id,
          user.id,
          selectedAnswer
      );

      // Mark that first submission has been made
      setFirstSubmissionMade(true);
      setFirstSubmissionCorrect(result.correct);
      setEloUpdateAmount(result.eloUpdate);

      // Update ELO and animate
      const oldElo = elo;
      const newElo = elo + result.eloUpdate;
      setElo(newElo);

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
    } catch (err) {
      console.error("Failed to submit answer:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    loadProblem();
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Category ELO Dropdown */}
              <div className="relative">
                <button
                    onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Category ELO Breakdown"
                >
                  <List className="w-5 h-5 text-gray-700" />
                </button>
                {showCategoryMenu && (
                    <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 py-3 z-20 max-h-[32rem] overflow-y-auto">
                      <div className="px-5 py-3 border-b border-gray-200 sticky top-0 bg-white">
                        <div className="font-semibold text-gray-900">
                          Topic ELO Breakdown
                        </div>
                      </div>
                      {categoryStructure.map((category) => (
                          <div key={category.name}>
                            {/* Category Header (Collapsible) */}
                            <button
                                onClick={() => toggleCategory(category.name)}
                                className="w-full px-5 py-3 hover:bg-gray-50 transition flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2.5">
                                {expandedCategories.has(category.name) ? (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                )}
                                <span className="font-medium text-gray-900">
                            {category.name}
                          </span>
                              </div>
                            </button>

                            {/* Subtopics (Shown when expanded) */}
                            {expandedCategories.has(category.name) && (
                                <div className="bg-gray-50">
                                  {category.subtopics.map((subtopic) => (
                                      <div
                                          key={subtopic.name}
                                          className="px-5 py-2.5 pl-14 hover:bg-gray-100 transition"
                                      >
                                        <div className="flex items-center justify-between">
                                <span className="text-gray-700">
                                  {subtopic.name}
                                </span>
                                          <div className="flex items-center gap-1.5">
                                            <Diamond className="w-3.5 h-3.5 text-indigo-600" />
                                            <span className="font-semibold text-gray-900">
                                    {subtopic.elo}
                                  </span>
                                          </div>
                                        </div>
                                      </div>
                                  ))}
                                </div>
                            )}
                          </div>
                      ))}
                    </div>
                )}
              </div>

              {/* Overall ELO */}
              <div className="flex items-center gap-2">
                <Diamond className="w-6 h-6 text-indigo-600" />
                <span className="text-2xl font-bold text-gray-900">
                {animatedElo}
              </span>
              </div>
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
                  onClick={() => setShowFormulaSheet(!showFormulaSheet)}
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
                  firstSubmissionMade={firstSubmissionMade}
                  firstSubmissionCorrect={firstSubmissionCorrect}
                  eloUpdateAmount={eloUpdateAmount}
                  animatedElo={animatedElo}
                  onSelectAnswer={setSelectedAnswer}
                  onSubmit={handleSubmit}
                  onNext={handleNext}
                  loading={loading}
              />
          ) : null}
        </div>

        {/* Desmos Calculator Window */}
        {showDesmos && (
            <Rnd
                position = {desmosPosition}
                size={desmosSize}
                minWidth={300}
                minHeight={200}
                bounds="window"
                dragHandleClassName="drag-handle"
                onDragStop = {(_e, d) => {
                  setDesmosPosition({x : d.x, y: d.y})
                }}
                onResizeStop={(_e, _direction, ref) => {
                  setDesmosSize({
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                  });
                }}
                style={{ zIndex: 40 }}
            >
              <div className="bg-white shadow-2xl rounded-lg border border-gray-300 h-full flex flex-col">
                <div className="drag-handle flex items-center justify-between bg-indigo-600 text-white px-3 py-2 rounded-t-lg cursor-move select-none">
                  <span className="font-semibold">Desmos Calculator</span>
                  <button
                      onClick={() => setShowDesmos(false)}
                      className="hover:bg-indigo-500 rounded p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div ref={desmosContainerRef} className="flex-1 rounded-b-lg" />
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
                onDragStop = { (_e, d) => {
                  setFormulaSheetPosition({x: d.x, y: d.y})
                }}
                onResizeStop={(_e, _direction, ref) => {
                  setFormulaSheetSize({
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                  });
                }}
                style={{ zIndex: 40 }}
            >
              <div className="bg-white shadow-2xl rounded-lg border border-gray-300 h-full flex flex-col">
                <div className="drag-handle-formula flex items-center justify-between bg-indigo-600 text-white px-3 py-2 rounded-t-lg cursor-move select-none">
                  <span className="font-semibold">Formula Sheet</span>
                  <button
                      onClick={() => setShowFormulaSheet(false)}
                      className="hover:bg-indigo-500 rounded p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 rounded-b-lg overflow-auto">
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