import { useState } from "react";
import type { User } from "../types";
import {
  Award,
  Diamond,
  Flame,
  TrendingUp,
  UserIcon,
  History,
  LogOut,
  Trash2,
} from "lucide-react";
import { ProblemHistory } from "./ProblemHistory";

export const ProfilePage: React.FC<{
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}> = ({ user, onBack, onLogout, onDeleteAccount }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="
      min-h-screen p-6
      bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-100
      dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950
    ">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="
            mb-6 px-4 py-2 rounded-xl transition border
            bg-gray-200 text-gray-900 border-gray-300 hover:bg-gray-300
            dark:bg-white/10 dark:text-white dark:border-white/20 dark:hover:bg-white/20
          "
        >
          ← Back to Problems
        </button>

        <div className="
          rounded-3xl shadow-2xl overflow-hidden border
          bg-white border-gray-200
          dark:bg-white/10 dark:border-white/20 dark:backdrop-blur-xl
        ">
          {/* Profile Header */}
          <div className="
            p-8
            bg-gradient-to-r from-indigo-500 to-purple-500
            dark:from-indigo-600 dark:to-purple-600
          ">
            <div className="flex items-center gap-6">
              <div className="
                w-24 h-24 rounded-2xl flex items-center justify-center
                bg-white/70
                dark:bg-white/20 dark:backdrop-blur
              ">
                <UserIcon className="w-12 h-12 text-indigo-700 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {user.username}
                </h1>
                <p className="text-indigo-100 dark:text-indigo-100">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                {
                  label: "Overall ELO",
                  value: user.elo,
                  icon: <Diamond className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />,
                  text: "text-indigo-700 dark:text-indigo-200",
                },
                {
                  label: "Current Streak",
                  value: user.streak,
                  icon: <Flame className="w-6 h-6 text-orange-500 dark:text-orange-400" />,
                  text: "text-orange-700 dark:text-orange-200",
                },
                
              ].map(({ label, value, icon, text }) => (
                <div
                  key={label}
                  className="
                    rounded-2xl p-6 border
                    bg-gray-50 border-gray-200
                    dark:bg-white/5 dark:border-white/10 dark:backdrop-blur
                  "
                >
                  <div className={`flex items-center gap-3 mb-2 ${text}`}>
                    {icon}
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Topic ELO Breakdown */}
            <div className="
              rounded-2xl p-6 mb-6 border
              bg-gray-50 border-gray-200
              dark:bg-white/5 dark:border-white/10 dark:backdrop-blur
            ">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <TrendingUp className="w-6 h-6" />
                Topic ELO Breakdown
              </h2>

              <div className="space-y-3">
                {user.topicEloData.map(topic => (
                  <div
                    key={topic.topicId}
                    className="
                      flex items-center justify-between p-4 rounded-xl border transition
                      bg-white border-gray-200 hover:bg-gray-100
                      dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10
                    "
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {topic.topicName}
                    </span>
                    <div className="flex items-center gap-2">
                      <Diamond className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round(topic.elo)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Problem History */}
            <button
              onClick={() => setShowHistory(true)}
              className="
                w-full py-4 px-6 rounded-xl font-semibold mb-6 transition border flex items-center justify-center gap-3
                bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600
                dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/20
              "
            >
              <History className="w-5 h-5" />
              View Problem History
            </button>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={onLogout}
                className="
                  flex-1 py-3 px-6 rounded-xl font-semibold transition border flex items-center justify-center gap-2
                  bg-gray-200 text-gray-900 hover:bg-gray-300 border-gray-300
                  dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:border-white/20
                "
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="
                  flex-1 py-3 px-6 rounded-xl font-semibold transition border flex items-center justify-center gap-2
                  bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-300
                  dark:bg-rose-500/20 dark:text-rose-300 dark:hover:bg-rose-500/30 dark:border-rose-500/30
                "
              >
                <Trash2 className="w-5 h-5" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {showHistory && (
        <ProblemHistory userId={user.id} onClose={() => setShowHistory(false)} />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Delete Account
            </h2>
            <p className="text-gray-700 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteAccount();
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
