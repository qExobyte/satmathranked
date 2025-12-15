import React, { useState, useEffect } from "react";
import { Award, Diamond, TrendingUp } from "lucide-react";
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
          elo: userInfo.elo,
          topicEloData: userInfo.topicEloData || [],
          streak: userInfo.streak || 0,
        };

        setWelcomeUser(user);
        setShowWelcome(true);
        window.history.replaceState({}, document.title, window.location.pathname);

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
      await api.login();
    } catch (err) {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      <ScrollAnimation/>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {showWelcome ? (
        <div className="bg-white/10 dark:bg-white/10 bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-16 w-full max-w-lg relative z-10 border border-white/20 dark:border-white/20 border-gray-200 text-center">
          <h2 className="text-3xl font-bold  dark:text-white text-gray-900 mb-4">
            Welcome, {welcomeUser?.username}!
          </h2>
          <div className="flex items-center justify-center gap-3 text-6xl font-bold  dark:text-indigo-400 text-indigo-600 mb-6">
            <Diamond className="w-16 h-16" />
            <span>{welcomeUser?.elo}</span>
          </div>
          <p className="text-xl  dark:text-indigo-200 text-indigo-700 font-semibold">
            Answer questions to improve your rank!
          </p>
        </div>
      ) : (
        <div className="bg-white/10 dark:bg-white/10 bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-12 w-full max-w-md relative z-10 border border-white/20 dark:border-white/20 border-gray-200">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6">
              <Diamond className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold  dark:text-white text-gray-900 mb-2">satmathranked</h1>
            <p className=" dark:text-indigo-200 text-indigo-700">Infinite scroll for SAT Math Problems</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full  dark:bg-white bg-gray-900 dark:text-gray-900 text-white py-4 px-6 rounded-xl font-semibold dark:hover:bg-gray-100 hover:bg-gray-800 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 dark:border-gray-900 border-white"></div>
                Signing in...
              </>
            ) : (
              "Sign in with Google"
            )}
          </button>

          {error && (
            <div className="mt-4 text-center text-sm dark:text-red-300 text-red-700 bg-red-500/20 dark:bg-red-500/20 bg-red-100 py-2 px-4 rounded-lg border border-red-500/30 dark:border-red-500/30 border-red-300">
              {error}
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/5 dark:bg-white/5 bg-indigo-50 backdrop-blur rounded-xl p-3 border border-white/10 dark:border-white/10 border-indigo-200">
              <TrendingUp className="w-5 h-5  dark:text-indigo-400 text-indigo-600 mx-auto mb-1" />
              <p className="text-xs dark:text-indigo-200 text-indigo-700">Adaptive problem serving tailored to your strengths and weaknesses</p>
            </div>
            <div className="bg-white/5 dark:bg-white/5 bg-purple-50 backdrop-blur rounded-xl p-3 border border-white/10 dark:border-white/10 border-purple-200">
              <Award className="w-5 h-5  dark:text-purple-400 text-purple-600 mx-auto mb-1" />
              <p className="text-xs dark:text-purple-200 text-purple-700">Raise your ELO and climb the leaderboards</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};