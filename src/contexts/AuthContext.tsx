import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/types/nail-studio";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  loginAsManager: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_CLIENT: User = {
  id: "u1",
  name: "Laura Bianchi",
  email: "laura@example.com",
  role: "client",
};

const MOCK_MANAGER: User = {
  id: "m1",
  name: "Sofia Nail Studio",
  email: "manager@nailstudio.com",
  role: "manager",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (_email: string, _password: string) => {
    setUser(MOCK_CLIENT);
  };

  const loginAsManager = () => {
    setUser(MOCK_MANAGER);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAsManager, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
