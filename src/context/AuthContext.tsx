import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserProfile } from '../types';
import { AuthService } from '../services/AuthService';
import { supabase } from '../lib/supabase';

const USE_SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role: 'medico' | 'enfermero';
    license_number: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_SUPABASE) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          AuthService.getCurrentUser().then((u) => {
            setUser(u);
            setLoading(false);
          });
        } else {
          setUser(null);
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        (async () => {
          if (session?.user) {
            const u = await AuthService.getCurrentUser();
            setUser(u);
          } else {
            setUser(null);
          }
        })();
      });

      return () => subscription.unsubscribe();
    }

    // Mock fallback
    const stored = AuthService.getStoredUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const u = await AuthService.login(email, password);
    setUser(u);
  };

  const register = async (data: Parameters<typeof AuthService.register>[0]) => {
    const u = await AuthService.register(data);
    setUser(u);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
