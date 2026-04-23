import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Role = 'admin' | 'client' | null;

interface AuthContextType {
  role: Role;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const CREDENTIALS: Record<string, { password: string; role: Role }> = {
  makkook: { password: 'makkook2026', role: 'admin' },
  elezaby: { password: 'ezaby2026',   role: 'client' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole]       = useState<Role>(null);
  const [username, setUsername] = useState<string | null>(null);

  const login = (user: string, pass: string): boolean => {
    const cred = CREDENTIALS[user.toLowerCase()];
    if (cred && cred.password === pass) {
      setRole(cred.role);
      setUsername(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ role, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
