// src/components/ProblemCard.tsx
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

export const ProblemCard: React.FC<ProblemCardProps> = ({
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
    loading,
}) => {
    const labels = ["A", "B", "C", "D"];
    const [showEloAnimation, setShowEloAnimation] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(true);

    const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
    const [currentAttemptAnswer] = useState<string | null>(null);

    const questionRef = useRef<HTMLDivElement>(null);
    const answerChoiceRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const mcqAnswerExplanationRefs = useRef<(HTMLDivElement | null)[]>([]);
    const frqAnswerExplanationRef = useRef<(HTMLDivElement)>(null);

    function katexRender(textDiv: HTMLDivElement | HTMLSpanElement) {
        renderMathInElement(textDiv, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
            ],
            throwOnError: false,
        });
    }

    //Display current question with text
    useEffect(() => {
        if (questionRef.current) {
            katexRender(questionRef.current);
        }
    }, [problem.problemText]);

    // display answer choices in latex
    useEffect(() => {
        answerChoiceRefs.current.forEach((ref) => {
            if (ref) {
                katexRender(ref);
            }
        });
    }, [problem.answerChoices]);

    // Display explanations for submitted answers
    useEffect(() => {
        mcqAnswerExplanationRefs.current.forEach((ref) => {
            if (ref) {
                katexRender(ref);
            }
        })
    }, [submittedAnswer, problem.answerChoices]);

    useEffect(() => {
        if (frqAnswerExplanationRef.current) {
            katexRender(frqAnswerExplanationRef.current);
        }
    }, [firstSubmissionMade, problem.answerChoices]);

    // Reset submitted answer when problem changes
    useEffect(() => {
        setSubmittedAnswer(null);
        setAnimationComplete(true);
    }, [problem.id]);

    // When the first answer is submitted, show the elo animation and add it to the submitted answers set
    //TODO: rejigger this with submitted answer
    useEffect(() => {
        if (firstSubmissionMade) {
            setShowEloAnimation(true);
            setAnimationComplete(false);
            if (selectedAnswer) {
                setSubmittedAnswers(new Set([selectedAnswer]));
            }
            const timer = setTimeout(() => {
                setShowEloAnimation(false);
                setAnimationComplete(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [firstSubmissionMade, selectedAnswer]);

    //TODO: move all of this to just take logic from submission 
    const correctAnswerKey = Object.keys(problem.answerChoices || {}).find(
        (key) => problem.answerChoices[key][0] === "correct"
    );

    const mcqCorrectAnswerFound = !problem.isFrq && submittedAnswers.has(correctAnswerKey || "");
    const showNextButton = firstSubmissionMade && (problem.isFrq || mcqCorrectAnswerFound);

    const handleSelectAnswer = (answer: string) => {
        onSelectAnswer(answer);
    };

    const handleSubmitClick = () => {
        onSubmit();
    };

    return (
        <div className="relative">
            {showEloAnimation && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-6 z-50 pointer-events-none">
                    <div
                        className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl shadow-2xl ${
firstSubmissionCorrect
? "bg-gradient-to-r from-green-500 to-green-600"
: "bg-gradient-to-r from-red-500 to-red-600"
} animate-slideDown`}
                    >
                        {firstSubmissionCorrect ? (
                            <ArrowUp className="w-8 h-8 text-white animate-bounce" />
                        ) : (
                                <ArrowDown className="w-8 h-8 text-white animate-bounce" />
                            )}
                        <div className="flex items-center gap-2">
                            <div className="text-5xl font-bold text-white overflow-hidden h-16 flex items-center">
                                <div className="animate-slotMachine">
                                    {animatedElo}
                                </div>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {eloUpdateAmount > 0 ? `+${eloUpdateAmount}` : eloUpdateAmount}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl p-12 relative overflow-hidden transition-all duration-500">
                {/* Metadata with Star Button */}
                <div className="absolute top-6 right-6 flex gap-2">
                    <button
                        onClick={onToggleStar}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title={isStarred ? "Unstar problem" : "Star problem"}
                    >
                        <Star
                            className={`w-6 h-6 ${
isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
}`}
                        />
                    </button>
                    <div className="bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm font-medium">
                        {problem.difficulty}
                    </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                    <div
                        className="text-xl text-gray-800 leading-relaxed mb-8"
                        ref={questionRef}
                    >
                        {problem.problemText}
                    </div>

                    <div className="space-y-3">
                        {problem.isFrq ? (
                            <div className="space-y-3">
                                <input
                                    value={selectedAnswer ?? ""}
                                    onChange={(e) => !firstSubmissionMade && onSelectAnswer(e.target.value)}
                                    disabled={firstSubmissionMade}
                                    className={`w-full p-3 rounded-xl border-2 text-lg leading-snug transition-all h-12
${
firstSubmissionMade
? firstSubmissionCorrect
? "border-green-500 bg-green-50 cursor-not-allowed"
: "border-red-500 bg-red-50 cursor-not-allowed"
: "border-gray-300 hover:border-gray-400 bg-white"
}
`}
                                    placeholder="Type your answer..."
                                />

                                {correctAnswerKey && (
                                    <div
                                        className={`mt-4 p-4 rounded-lg border ${
firstSubmissionCorrect
? "bg-green-50 border-green-200"
: "bg-blue-50 border-blue-200"
}`}
                                    >
                                        {!firstSubmissionCorrect && (
                                            <div className="font-semibold text-blue-900 mb-2">
                                                Correct answer: {correctAnswerKey}
                                            </div>
                                        )}
                                        <div className="font-semibold text-green-900 mb-2">
                                            {firstSubmissionCorrect ? "Correct!" : "Explanation:"}
                                        </div>
                                        <div
                                            className="text-sm text-gray-800"
                                            ref={frqAnswerExplanationRef}
                                        >
                                            {problem.answerChoices[correctAnswerKey][1]}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                                <>
                                    {problem.answerChoices &&
                                        Object.keys(problem.answerChoices).map((option, index) => {
                                            const isSelected = selectedAnswer === option

                                            const isCorrect = option === correctAnswerKey;
                                            const wasSubmitted = submittedAnswers.has(option);

                                            const showAsCorrect = wasSubmitted && isCorrect;
                                            const showAsIncorrect = wasSubmitted && !isCorrect;

                                            return (
                                                <div key={option}>
                                                    <button
                                                        onClick={() => !mcqCorrectAnswerFound && handleSelectAnswer(option)}
                                                        disabled={mcqCorrectAnswerFound}
                                                        className={`w-full text-left p-4 rounded-xl border-2 transition ${
showAsCorrect
? "border-green-500 bg-green-50"
: showAsIncorrect
? "border-red-500 bg-red-50"
: isSelected
? "border-indigo-600 bg-indigo-50"
: "border-gray-300 hover:border-gray-400 bg-white"
} ${
mcqCorrectAnswerFound ? "cursor-not-allowed" : "cursor-pointer"
}`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
showAsCorrect
? "bg-green-500 text-white"
: showAsIncorrect
? "bg-red-500 text-white"
: isSelected
? "bg-indigo-600 text-white"
: "bg-gray-100 text-gray-700"
}`}
                                                            >
                                                                {showAsCorrect ? "✓" : showAsIncorrect ? "✗" : labels[index]}
                                                            </div>
                                                            <span
                                                                className="text-lg"
                                                                ref={(choice) => {
                                                                    answerChoiceRefs.current[index] = choice;
                                                                }}
                                                            >
                                                                {option}
                                                            </span>
                                                        </div>
                                                    </button>

                                                    {wasSubmitted && problem.answerChoices[option][1] && (
                                                        <div className={`mt-2 p-3 rounded-lg border ${
isCorrect 
? "bg-green-50 border-green-200"
: "bg-red-50 border-red-200"
}`}>
                                                            <div className={`font-semibold mb-1 ${
isCorrect ? "text-green-900" : "text-red-900"
}`}>
                                                                {isCorrect ? "Correct!" : "Incorrect"}
                                                            </div>
                                                            <div className={`text-sm ${
isCorrect ? "text-green-800" : "text-red-800"
}`}
                                                                ref = {(el) => {
                                                                    frqAnswerExplanationRef.current[index] = el;
                                                                }}
                                                            >
                                                                {problem.answerChoices[option][1]}
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

                {/* Submit or Next Button */}
                {showNextButton ? (
                    <button
                        onClick={onNext}
                        disabled={!animationComplete}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next Problem
                    </button>
                ) : (
                        <button
                            onClick={handleSubmitClick}
                            disabled={
                                loading || 
                                    (!firstSubmissionMade && !selectedAnswer) ||
                                    (firstSubmissionMade && !currentAttemptAnswer)
                            }
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? "Submitting..." : "Submit"}
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
