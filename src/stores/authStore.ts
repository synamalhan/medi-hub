import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  initialize: () => Promise<void>;
}

const transformSupabaseUser = (profile: Database['public']['Tables']['profiles']['Row']): User => ({
  id: profile.id,
  email: profile.email,
  name: profile.full_name,
  avatar: profile.avatar_url || undefined,
  isPro: profile.is_pro,
  createdAt: new Date(profile.created_at),
  lastLogin: new Date(),
  stats: profile.stats,
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const user = transformSupabaseUser(profile);
          set({ user, isAuthenticated: true });
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          const user = transformSupabaseUser(profile);
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    
    set({ isLoading: false });
    return false;
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Profile will be created automatically via trigger
        const user: User = {
          id: data.user.id,
          email,
          name,
          isPro: false,
          createdAt: new Date(),
          lastLogin: new Date(),
          stats: {
            simulatorAccuracy: 0,
            flashcardsReviewed: 0,
            streakDays: 0,
            totalStudyHours: 0,
          },
        };
        
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
    
    set({ isLoading: false });
    return false;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.name,
          avatar_url: updates.avatar,
          is_pro: updates.isPro,
          stats: updates.stats,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (!error) {
        const updatedUser = { ...user, ...updates };
        set({ user: updatedUser });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  },
}));

// Listen for auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      const user = transformSupabaseUser(profile);
      useAuthStore.setState({ user, isAuthenticated: true });
    }
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  }
});