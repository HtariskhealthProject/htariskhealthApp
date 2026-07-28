import type { UserProfile } from '../types';
import { supabase } from '../lib/supabase';
import { mockUsers } from '../data/mockData';

const STORAGE_KEY = 'hta_risk_auth';
const USE_SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

function getStoredAuth(): UserProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function setStoredAuth(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function mapProfileToUser(profile: { id: string; full_name: string; role: string; created_at: string }, email: string, license_number?: string): UserProfile {
  return {
    id: profile.id,
    email,
    full_name: profile.full_name,
    role: profile.role === 'healthcare_professional' ? 'medico' : (profile.role as 'medico' | 'enfermero'),
    license_number: license_number ?? '',
    created_at: profile.created_at,
  };
}

export const AuthService = {
  async login(email: string, password: string): Promise<UserProfile> {
    if (USE_SUPABASE) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Error al iniciar sesion');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        const user: UserProfile = {
          id: authData.user.id,
          email: authData.user.email ?? email,
          full_name: authData.user.user_metadata?.full_name ?? '',
          role: authData.user.user_metadata?.role ?? 'medico',
          license_number: authData.user.user_metadata?.license_number ?? '',
          created_at: authData.user.created_at,
        };
        setStoredAuth(user);
        return user;
      }

      const user = mapProfileToUser(profile, authData.user.email ?? email, authData.user.user_metadata?.license_number);
      setStoredAuth(user);
      return user;
    }

    // Mock fallback
    await new Promise((r) => setTimeout(r, 500));
    const user = mockUsers.find((u) => u.email === email);
    if (!user) throw new Error('Credenciales invalidas');
    if (password !== 'demo123') throw new Error('Credenciales invalidas');
    setStoredAuth(user);
    return user;
  },

  async register(data: {
    email: string;
    password: string;
    full_name: string;
    role: 'medico' | 'enfermero';
    license_number: string;
  }): Promise<UserProfile> {
    if (USE_SUPABASE) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: data.role,
            license_number: data.license_number,
          },
        },
      });
      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Error al registrar usuario');

      const dbRole = data.role === 'medico' || data.role === 'enfermero'
        ? 'healthcare_professional'
        : data.role;

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        full_name: data.full_name,
        role: dbRole,
      });
      if (profileError) console.error('Profile insert error:', profileError);

      const user: UserProfile = {
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        license_number: data.license_number,
        created_at: authData.user.created_at,
      };
      setStoredAuth(user);
      return user;
    }

    // Mock fallback
    await new Promise((r) => setTimeout(r, 500));
    if (mockUsers.some((u) => u.email === data.email)) {
      throw new Error('El correo ya esta registrado');
    }
    const newUser: UserProfile = {
      id: String(mockUsers.length + 1),
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      license_number: data.license_number,
      created_at: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    setStoredAuth(newUser);
    return newUser;
  },

  async logout(): Promise<void> {
    if (USE_SUPABASE) {
      await supabase.auth.signOut();
    }
    setStoredAuth(null);
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    if (USE_SUPABASE) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile) {
        return mapProfileToUser(profile, session.user.email ?? '', session.user.user_metadata?.license_number);
      }
      return {
        id: session.user.id,
        email: session.user.email ?? '',
        full_name: session.user.user_metadata?.full_name ?? '',
        role: session.user.user_metadata?.role ?? 'medico',
        license_number: session.user.user_metadata?.license_number ?? '',
        created_at: session.user.created_at,
      };
    }
    return getStoredAuth();
  },

  getStoredUser(): UserProfile | null {
    return getStoredAuth();
  },
};
