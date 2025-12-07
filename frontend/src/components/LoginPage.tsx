import React, { useState, useEffect } from "react";
import { Diamond } from "lucide-react";
import type { User } from "../types";
import { api } from "../services/api";
import { ScrollAnimation } from "./ScrollAnimation";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState<User | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get("user");

    if (userParam) {
      try {
        const userInfo = JSON.parse(decodeURIComponent(userParam));

        const user: User = {
          id: userInfo.id,
          username: userInfo.name || "User",
          email: userInfo.email || "",
          elo: userInfo.elo, // Random ELO between 400-800
        };

        setWelcomeUser(user);
        setShowWelcome(true);

        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // Proceed to main app after 3 seconds
        setTimeout(() => {
          onLogin(user);
        }, 3000);
      } catch (err) {
        console.error("Error parsing user data:", err);
        setError("Failed to process login information");
      }
    }
  }, [onLogin]);

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await api.login(); // This redirects to Google
    } catch (err) {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      <ScrollAnimation />

      {showWelcome ? (
        <div className="bg-white rounded-3xl shadow-2xl p-16 w-full max-w-lg relative z-10 text-center animate-fadeIn">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome, {welcomeUser?.username}!
            </h2>
          </div>
          <div className="flex items-center justify-center gap-3 text-6xl font-bold text-indigo-600 mb-6">
            <Diamond className="w-16 h-16" />
            <span>{welcomeUser?.elo}</span>
          </div>
          <p className="text-xl text-gray-700 font-semibold">
            Answer questions to improve your rank!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-lg relative z-10">
          <div className="text-center mb-10">
            <div className="text-5xl font-bold text-indigo-600 mb-3">
              satmathranked
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Your infinite scroll for SAT math problems
            </h1>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-gray-700">
                Sign in with Google
              </p>
            </div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {error && (
            <div className="text-center text-sm text-red-600 bg-red-50 py-2 px-4 rounded-lg">
              {error}
            </div>
          )}
        </div>
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
