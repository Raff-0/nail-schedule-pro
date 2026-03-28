import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Profile } from '@/types/nail-studio';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  session: object | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock profiles: use "manager@test.com" to login as manager, anything else is client
const MANAGER_EMAIL = 'manager@test.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const buildProfile = (email: string, name: string): { user: { id: string; email: string }; profile: Profile } => {
    const isManager = email.toLowerCase() === MANAGER_EMAIL;
    const id = isManager ? 'manager-1' : 'client-1';
    return {
      user: { id, email },
      profile: {
        id,
        name,
        email,
        role: isManager ? 'manager' : 'client',
        created_at: new Date().toISOString(),
      },
    };
  };

  const login = async (email: string, _password: string) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500));
    const name = email.toLowerCase() === MANAGER_EMAIL ? 'Maria Gestrice' : 'Laura Bianchi';
    const mock = buildProfile(email, name);
    setUser(mock.user);
    setProfile(mock.profile);
  };

  const register = async (email: string, _password: string, name: string) => {
    await new Promise((r) => setTimeout(r, 500));
    const mock = buildProfile(email, name);
    setUser(mock.user);
    setProfile(mock.profile);
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session: user ? {} : null,
      isAuthenticated: !!user,
      isLoading: false,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
