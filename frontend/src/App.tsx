import { useState } from 'react';
import type { User } from './types';
import { LoginPage } from './components/LoginPage';
import { ProblemPage } from './components/ProblemPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return user ? (
    <ProblemPage user={user} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}