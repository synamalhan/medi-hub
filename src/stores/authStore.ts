import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { identifyUser, resetUser } from '../lib/revenuecat';
import type { Database } from '../lib/supabase';

// Import other stores for clearing
import { useDataStore } from './dataStore';
import { useResearchStore } from './researchStore';
import { useAnalyticsStore } from './analyticsStore';
import { useSubscriptionStore } from './subscriptionStore';
import { useStudySessionStore } from './studySessionStore';

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
  clearAllStores: () => void;
  debugSession: () => Promise<void>;
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
          
          // Start login session tracking
          try {
            await useStudySessionStore.getState().startLoginSession();
          } catch (error) {
            console.warn('Failed to start login session tracking:', error);
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
    //console.log('🔄 Starting logout process...');
    try {
      // End login session tracking first
      try {
        await useStudySessionStore.getState().endLoginSession();
        //console.log('✓ Study session ended');
      } catch (error) {
        console.warn('Failed to end login session tracking:', error);
      }
      
      // Reset RevenueCat user
      try {
        await resetUser();
        //console.log('✓ RevenueCat user reset');
      } catch (error) {
        console.warn('RevenueCat reset failed:', error);
      }
      
      // Clear Supabase session and cache properly
      //console.log('🔄 Signing out from Supabase...');
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('❌ Supabase signOut error:', signOutError);
        throw signOutError;
      }
      //console.log('✓ Supabase session cleared');
      
      // Wait a moment for the session to clear
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify logout was successful
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.warn('⚠️ Session still exists after logout, forcing clear...');
        // Force clear the session again
        await supabase.auth.signOut();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check again
        const { data: { session: session2 } } = await supabase.auth.getSession();
        if (session2) {
          console.error('❌ Session still persists after second attempt');
        } else {
          //console.log('✓ Session cleared on second attempt');
        }
      } else {
        //console.log('✓ Session verification successful - user is logged out');
      }
      
      // Clear all store caches
      get().clearAllStores();
      
      // Clear auth state
      set({ 
        user: null, 
        isAuthenticated: false, 
        isPro: false,
        isLoading: false,
        error: null 
      });
      //console.log('✓ Auth state cleared');

      // Clear browser cache and storage
      if (typeof window !== 'undefined') {
        //console.log('🔄 Clearing browser storage...');
        
        // Clear localStorage
        localStorage.clear();
        //console.log('✓ localStorage cleared');
        
        // Clear sessionStorage
        sessionStorage.clear();
        //console.log('✓ sessionStorage cleared');
        
        // Clear any cached data
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            //console.log(`✓ ${cacheNames.length} caches cleared`);
          } catch (error) {
            console.warn('Failed to clear caches:', error);
          }
        }
        
        // Clear Supabase session storage specifically
        const supabaseKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('sb-') || key.includes('supabase')
        );
        supabaseKeys.forEach(key => localStorage.removeItem(key));
        //console.log(`✓ ${supabaseKeys.length} Supabase keys cleared`);
        
        // Also clear any session storage keys
        const sessionKeys = Object.keys(sessionStorage).filter(key => 
          key.startsWith('sb-') || key.includes('supabase')
        );
        sessionKeys.forEach(key => sessionStorage.removeItem(key));
        //console.log(`✓ ${sessionKeys.length} Supabase session keys cleared`);
      }

      //console.log('✅ Logout process completed successfully');

      // Force a page reload to ensure complete logout
      if (shouldRedirect) {
        //console.log('🔄 Redirecting to auth page...');
        // Use window.location.replace to prevent back button issues
        window.location.replace('/auth');
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      set({ error: 'Failed to log out' });
      
      // Even if there's an error, try to redirect to auth page
      if (shouldRedirect) {
        //console.log('🔄 Redirecting to auth page despite error...');
        window.location.replace('/auth');
      }
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

  clearAllStores: () => {
    //console.log('Clearing all stores...');
    // Clear all Zustand stores by calling their clear methods
    try {
      useDataStore.getState().clear();
      //console.log('✓ DataStore cleared');
      useResearchStore.getState().clear();
      //console.log('✓ ResearchStore cleared');
      useAnalyticsStore.getState().clear();
      //console.log('✓ AnalyticsStore cleared');
      useSubscriptionStore.getState().clear();
      //console.log('✓ SubscriptionStore cleared');
      useStudySessionStore.getState().clear();
      //console.log('✓ StudySessionStore cleared');
    } catch (error) {
      console.warn('Error clearing stores:', error);
    }
  },

  debugSession: async () => {
    //console.log('🔍 Debugging session status...');
    
    try {
      // Check Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      //console.log('Supabase session:', session ? 'EXISTS' : 'NONE');
      if (session) {
        //console.log('Session user ID:', session.user.id);
        //console.log('Session expires at:', session.expires_at);
      }
      if (error) {
        console.error('Session error:', error);
      }
      
      // Check current auth state
      const currentState = get();
      //console.log('Current auth state:', {
      //   isAuthenticated: currentState.isAuthenticated,
      //   user: currentState.user ? 'EXISTS' : 'NONE',
      //   isLoading: currentState.isLoading
      // });
      
      // Check localStorage for Supabase keys
      if (typeof window !== 'undefined') {
        const supabaseKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('sb-') || key.includes('supabase')
        );
        //console.log('Supabase localStorage keys:', supabaseKeys);
        
        const sessionKeys = Object.keys(sessionStorage).filter(key => 
          key.startsWith('sb-') || key.includes('supabase')
        );
        //console.log('Supabase sessionStorage keys:', sessionKeys);
      }
    } catch (error) {
      console.error('Debug session error:', error);
    }
  },
}));

// Listen for auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  //console.log(`🔄 Auth state change: ${event}`, session ? 'Session exists' : 'No session');
  
  if (event === 'SIGNED_IN' && session?.user) {
    //console.log('🔄 User signed in, fetching profile...');
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        const user = transformSupabaseUser(profile);
        useAuthStore.setState({ user, isAuthenticated: true });
        //console.log('✓ User profile loaded and state updated');
        
        // Initialize RevenueCat
        try {
          await identifyUser(user.id);
          //console.log('✓ RevenueCat user identified');
        } catch (error) {
          console.warn('RevenueCat initialization failed:', error);
        }
      } else {
        console.warn('No profile found for user');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  } else if (event === 'SIGNED_OUT') {
    //console.log('🔄 User signed out, clearing state...');
    try {
      await resetUser();
      //console.log('✓ RevenueCat user reset');
    } catch (error) {
      console.warn('RevenueCat reset failed:', error);
    }
    
    // Only update state if we're not already in the process of logging out
    const currentState = useAuthStore.getState();
    if (currentState.isAuthenticated) {
      useAuthStore.setState({ user: null, isAuthenticated: false });
      //console.log('✓ Auth state cleared via auth state change');
    } else {
      //console.log('Auth state already cleared, skipping update');
    }
  } else if (event === 'TOKEN_REFRESHED') {
    //console.log('🔄 Token refreshed');
  } else if (event === 'USER_UPDATED') {
    //console.log('🔄 User updated');
  }
});