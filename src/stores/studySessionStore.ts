import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface StudySession {
  id: string;
  user_id: string;
  session_type: 'login_session' | 'study_session';
  start_time: string;
  end_time: string | null;
  duration_hours?: number | null;
  activity_type?: string;
  created_at: string;
}

interface StudySessionState {
  currentSession: StudySession | null;
  sessions: StudySession[];
  isLoading: boolean;
  error: string | null;
  
  // Session management
  startLoginSession: () => Promise<void>;
  endLoginSession: () => Promise<void>;
  startStudySession: (activityType: string) => Promise<void>;
  endStudySession: (activityType: string) => Promise<void>;
  
  // Data fetching
  fetchSessions: (timeRange?: 'day' | 'week' | 'month' | 'year') => Promise<void>;
  
  // Analytics
  getTotalStudyHours: (timeRange?: 'day' | 'week' | 'month' | 'year') => number;
  getAverageSessionLength: () => number;
  getStudyStreak: () => number;
  
  // Utility
  clear: () => void;
}

export const useStudySessionStore = create<StudySessionState>((set, get) => ({
  currentSession: null,
  sessions: [],
  isLoading: false,
  error: null,

  startLoginSession: async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      console.log('Starting login session tracking...');
      
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          session_type: 'login_session',
          start_time: new Date().toISOString(),
          end_time: null,
          correct_answers: 0,
          incorrect_answers: 0,
          total_questions: 0
        })
        .select()
        .single();

      if (error) throw error;

      const session: StudySession = {
        id: data.id,
        user_id: data.user_id,
        session_type: data.session_type as 'login_session',
        start_time: data.start_time,
        end_time: data.end_time,
        duration_hours: data.duration_hours || null,
        activity_type: data.activity_type || 'login',
        created_at: data.created_at
      };

      set({ currentSession: session });
      console.log('✓ Login session started:', session.id);

      // Set up page visibility tracking
      if (typeof document !== 'undefined') {
        const handleVisibilityChange = () => {
          if (document.hidden) {
            console.log('Page hidden - pausing session tracking');
          } else {
            console.log('Page visible - resuming session tracking');
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
      }
    } catch (error) {
      console.error('Error starting login session:', error);
      set({ error: 'Failed to start login session' });
    }
  },

  endLoginSession: async () => {
    try {
      const { currentSession } = get();
      if (!currentSession) {
        console.log('No current session to end');
        return;
      }

      console.log('Ending login session...');
      
      const endTime = new Date();
      const startTime = new Date(currentSession.start_time);
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString()
        })
        .eq('id', currentSession.id);

      if (error) throw error;

      // Update user stats with study hours
      const { user } = useAuthStore.getState();
      if (user && durationHours > 0) {
        await supabase.rpc('update_user_stats', {
          user_id_param: user.id,
          stat_type: 'totalStudyHours',
          increment_value: durationHours
        });
        
        // Update local auth store
        const updatedStats = {
          ...user.stats,
          totalStudyHours: user.stats.totalStudyHours + durationHours
        };
        useAuthStore.getState().updateUser({ stats: updatedStats });
      }

      console.log(`✓ Login session ended. Duration: ${durationHours.toFixed(2)} hours`);
      set({ currentSession: null });
    } catch (error) {
      console.error('Error ending login session:', error);
      set({ error: 'Failed to end login session' });
    }
  },

  startStudySession: async (activityType: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      console.log(`Starting study session for: ${activityType}`);
      
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          session_type: 'study_session',
          start_time: new Date().toISOString(),
          end_time: null,
          correct_answers: 0,
          incorrect_answers: 0,
          total_questions: 0
        })
        .select()
        .single();

      if (error) throw error;

      const session: StudySession = {
        id: data.id,
        user_id: data.user_id,
        session_type: data.session_type as 'study_session',
        start_time: data.start_time,
        end_time: data.end_time,
        duration_hours: data.duration_hours || null,
        activity_type: data.activity_type || activityType,
        created_at: data.created_at
      };

      set(state => ({ 
        sessions: [...state.sessions, session],
        currentSession: session 
      }));
      
      console.log('✓ Study session started:', session.id);
    } catch (error) {
      console.error('Error starting study session:', error);
      set({ error: 'Failed to start study session' });
    }
  },

  endStudySession: async (activityType: string) => {
    try {
      const { currentSession, sessions } = get();
      if (!currentSession || currentSession.activity_type !== activityType) {
        console.log(`No current study session for ${activityType} to end`);
        return;
      }

      console.log(`Ending study session for: ${activityType}`);
      
      const endTime = new Date();
      const startTime = new Date(currentSession.start_time);
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString()
        })
        .eq('id', currentSession.id);

      if (error) throw error;

      // Update user stats with study hours
      const { user } = useAuthStore.getState();
      if (user && durationHours > 0) {
        await supabase.rpc('update_user_stats', {
          user_id_param: user.id,
          stat_type: 'totalStudyHours',
          increment_value: durationHours
        });
        
        // Update local auth store
        const updatedStats = {
          ...user.stats,
          totalStudyHours: user.stats.totalStudyHours + durationHours
        };
        useAuthStore.getState().updateUser({ stats: updatedStats });
      }

      // Update local state
      const updatedSession = { ...currentSession, end_time: endTime.toISOString(), duration_hours: durationHours };
      set(state => ({
        sessions: state.sessions.map(s => s.id === currentSession.id ? updatedSession : s),
        currentSession: null
      }));

      console.log(`✓ Study session ended. Duration: ${durationHours.toFixed(2)} hours`);
    } catch (error) {
      console.error('Error ending study session:', error);
      set({ error: 'Failed to end study session' });
    }
  },

  fetchSessions: async (timeRange: 'day' | 'week' | 'month' | 'year' = 'week') => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      set({ isLoading: true, error: null });

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sessions: StudySession[] = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        session_type: item.session_type as 'login_session' | 'study_session',
        start_time: item.start_time,
        end_time: item.end_time,
        duration_hours: item.duration_hours || null,
        activity_type: item.activity_type || 'general',
        created_at: item.created_at
      }));

      set({ sessions, isLoading: false });
      console.log(`✓ Fetched ${sessions.length} sessions for ${timeRange}`);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      set({ error: 'Failed to fetch sessions', isLoading: false });
    }
  },

  getTotalStudyHours: (timeRange: 'day' | 'week' | 'month' | 'year' = 'week') => {
    const { sessions } = get();
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return sessions
      .filter(session => {
        const sessionDate = new Date(session.created_at);
        return sessionDate >= startDate;
      })
      .reduce((total, session) => {
        // If duration_hours is available, use it
        if (session.duration_hours) {
          return total + session.duration_hours;
        }
        
        // Otherwise calculate from start and end times
        if (session.end_time) {
          const startTime = new Date(session.start_time);
          const endTime = new Date(session.end_time);
          const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          return total + durationHours;
        }
        
        return total;
      }, 0);
  },

  getAverageSessionLength: () => {
    const { sessions } = get();
    const completedSessions = sessions.filter(session => {
      // Check if session has duration_hours or can calculate from start/end times
      if (session.duration_hours) return true;
      if (session.end_time) return true;
      return false;
    });
    
    if (completedSessions.length === 0) return 0;
    
    const totalHours = completedSessions.reduce((sum, session) => {
      // If duration_hours is available, use it
      if (session.duration_hours) {
        return sum + session.duration_hours;
      }
      
      // Otherwise calculate from start and end times
      if (session.end_time) {
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time);
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        return sum + durationHours;
      }
      
      return sum;
    }, 0);
    
    return totalHours / completedSessions.length;
  },

  getStudyStreak: () => {
    const { sessions } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    while (true) {
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.created_at);
        sessionDate.setHours(0, 0, 0, 0);
        
        // Check if session is from the current date and has study activity
        if (sessionDate.getTime() !== currentDate.getTime()) return false;
        
        // Include sessions that have duration_hours > 0 OR have end_time (completed sessions)
        if (session.duration_hours && session.duration_hours > 0) return true;
        if (session.end_time) return true;
        
        return false;
      });
      
      if (daySessions.length === 0) break;
      
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  },

  clear: () => {
    set({
      currentSession: null,
      sessions: [],
      isLoading: false,
      error: null
    });
  }
})); 