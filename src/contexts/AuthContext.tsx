import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/nail-studio';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const SESSION_TIMEOUT_MS = 7000;
  const PROFILE_TIMEOUT_MS = 7000;

  const toAuthUser = (authUser: User | null) => {
    if (!authUser) return null;
    return { id: authUser.id, email: authUser.email ?? '' };
  };

  const fallbackProfile = (authUser: User): Profile => ({
    id: authUser.id,
    email: authUser.email ?? '',
    name:
      (typeof authUser.user_metadata?.name === 'string' && authUser.user_metadata.name.trim()) ||
      authUser.email?.split('@')[0] ||
      'Cliente',
    phone_number:
      (typeof authUser.user_metadata?.phone_number === 'string' && authUser.user_metadata.phone_number.trim()) ||
      (typeof authUser.user_metadata?.phone === 'string' && authUser.user_metadata.phone.trim()) ||
      '',
    role: 'costumer',
    created_at: new Date().toISOString(),
  });

  const loadProfile = async (authUser: User | null): Promise<Profile | null> => {
    if (!authUser) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data as Profile;
    }

    const createdProfile = fallbackProfile(authUser);
    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: createdProfile.id,
        email: createdProfile.email,
        name: createdProfile.name,
        phone_number: createdProfile.phone_number,
        role: createdProfile.role,
      })
      .select('*')
      .single();

    if (insertError) {
      return createdProfile;
    }

    return (inserted as Profile) ?? createdProfile;
  };

  const loadProfileWithTimeout = async (authUser: User | null): Promise<Profile | null> => {
    if (!authUser) return null;

    const profileTimeout = new Promise<Profile>((resolve) => {
      setTimeout(() => resolve(fallbackProfile(authUser)), PROFILE_TIMEOUT_MS);
    });

    return Promise.race([loadProfile(authUser), profileTimeout]);
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const sessionTimeout = new Promise<{ data: { session: null }; error: null }>((resolve) => {
          setTimeout(() => resolve({ data: { session: null }, error: null }), SESSION_TIMEOUT_MS);
        });

        const { data, error } = await Promise.race([supabase.auth.getSession(), sessionTimeout]);

        if (error) {
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        const nextSession = data.session;
        const authUser = nextSession?.user ?? null;

        if (isMounted) {
          setSession(nextSession);
          setUser(toAuthUser(authUser));
        }

        const nextProfile = await loadProfileWithTimeout(authUser);
        if (isMounted) {
          setProfile(nextProfile);
        }
      } catch {
        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      const authUser = nextSession?.user ?? null;
      setUser(toAuthUser(authUser));

      if (!authUser) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const nextProfile = await loadProfileWithTimeout(authUser);
        setProfile(nextProfile);
      } catch {
        setProfile(fallbackProfile(authUser));
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message);
    }
  };

  const register = async (email: string, password: string, name: string, phone: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone, phone_number: phone },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      isAuthenticated: !!user,
      isLoading,
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
