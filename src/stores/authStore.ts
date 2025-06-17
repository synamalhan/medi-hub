import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { identifyUser, resetUser } from '../lib/revenuecat';
import type { Database } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPro: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: (shouldRedirect?: boolean) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  initialize: () => Promise<void>;
  refreshUserStats: () => Promise<void>;
}

const transformSupabaseUser = (profile: Database['public']['Tables']['profiles']['Row']): User => ({
  id: profile.id,
  email: profile.email,
  name: profile.full_name,
  avatar: profile.avatar_url || undefined,
  isPro: profile.is_pro,
  createdAt: new Date(profile.created_at),
  lastLogin: new Date(),
  stats: {
    simulatorAccuracy: profile.stats?.simulatorAccuracy || 0,
    flashcardsReviewed: profile.stats?.flashcardsReviewed || 0,
    streakDays: profile.stats?.streakDays || 0,
    totalStudyHours: profile.stats?.totalStudyHours || 0,
    simulatorCasesCompleted: profile.stats?.simulatorCasesCompleted || 0,
    mnemonicsCreated: profile.stats?.mnemonicsCreated || 0,
    aiGenerationsUsed: profile.stats?.aiGenerationsUsed || 0,
    researchSummariesCreated: profile.stats?.researchSummariesCreated || 0,
  },
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isPro: false,
  error: null,

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
          set({ 
            user, 
            isAuthenticated: true,
            isPro: user.isPro 
          });
          
          // Initialize RevenueCat with user ID
          try {
            await identifyUser(user.id);
          } catch (error) {
            console.warn('RevenueCat initialization failed:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
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
          set({ 
            user, 
            isAuthenticated: true,
            isPro: user.isPro,
            isLoading: false 
          });
          
          // Initialize RevenueCat
          try {
            await identifyUser(user.id);
          } catch (error) {
            console.warn('RevenueCat initialization failed:', error);
          }
          
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
    set({ isLoading: true, error: null });
    
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
            simulatorCasesCompleted: 0,
            mnemonicsCreated: 0,
            aiGenerationsUsed: 0,
            researchSummariesCreated: 0,
          },
        };
        
        set({ 
          user, 
          isAuthenticated: true,
          isPro: false,
          isLoading: false 
        });
        
        // Initialize RevenueCat
        try {
          await identifyUser(user.id);
        } catch (error) {
          console.warn('RevenueCat initialization failed:', error);
        }
        
        return true;
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
    
    set({ isLoading: false });
    return false;
  },

  logout: async (shouldRedirect = true) => {
    try {
      // Reset RevenueCat user
      await resetUser();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear auth state
      set({ 
        user: null, 
        isAuthenticated: false, 
        isPro: false,
        isLoading: false,
        error: null 
      });

      // Redirect to landing page only if shouldRedirect is true
      if (shouldRedirect) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      set({ error: 'Failed to log out' });
    }
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
        set({ 
          user: updatedUser,
          isPro: updatedUser.isPro 
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  },

  refreshUserStats: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        const updatedUser = transformSupabaseUser(profile);
        set({ 
          user: updatedUser,
          isPro: updatedUser.isPro 
        });
      }
    } catch (error) {
      console.error('Error refreshing user stats:', error);
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
      
      // Initialize RevenueCat
      try {
        await identifyUser(user.id);
      } catch (error) {
        console.warn('RevenueCat initialization failed:', error);
      }
    }
  } else if (event === 'SIGNED_OUT') {
    try {
      await resetUser();
    } catch (error) {
      console.warn('RevenueCat reset failed:', error);
    }
    useAuthStore.setState({ user: null, isAuthenticated: false });
  }
});