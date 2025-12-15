import { useState, useEffect } from "react";
import type { User } from "./types";
import { LoginPage } from "./components/LoginPage";
import { ProblemPage } from "./components/ProblemPage";
import { Moon, Sun } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-6 right-6 p-3  dark:bg-white/10 bg-gray-200/50 backdrop-blur-xl rounded-xl  dark:hover:bg-white/20 hover:bg-gray-300/50 transition z-20 border border-white/20 dark:border-white/20 border-gray-300"
      >
        {darkMode ? (
          <Sun className="w-5 h-5 text-white" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {user ? (
        <ProblemPage user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
}
