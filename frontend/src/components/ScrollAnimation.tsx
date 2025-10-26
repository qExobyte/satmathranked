import React from "react";

export const ScrollAnimation: React.FC = () => {
  const problems = [
    "2x + 5 = 13",
    "∫ x² dx",
    "sin²θ + cos²θ = 1",
    "y = mx + b",
    "a² + b² = c²",
    "f(x) = x³ - 2x",
    "lim(x→∞) 1/x = 0",
    "√(144) = 12",
  ];

  return (
    <>
      <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
        <div className="grid grid-cols-3 gap-8 animate-scroll">
          {[...problems, ...problems, ...problems].map((problem, i) => (
            <div
              key={i}
              className="text-6xl font-bold text-indigo-900 whitespace-nowrap text-center"
            >
              {problem}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.33%); }
        }
        .animate-scroll {
          animation: scroll 15s linear infinite;
        }
      `}</style>
    </>
  );
};
