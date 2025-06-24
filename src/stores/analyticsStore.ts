import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface StudySession {
  id: string;
  user_id: string;
  session_type: string;
  start_time: string;
  end_time: string | null;
  correct_answers: number;
  incorrect_answers: number;
  total_questions: number;
  created_at: string;
}

interface CategoryPerformance {
  id: string;
  user_id: string;
  category: string;
  accuracy: number;
  total_attempts: number;
  created_at: string;
}

interface TimeDistribution {
  category: string;
  percentage: number;
}

interface WeeklyGoal {
  category: string;
  progress: number;
}

interface AnalyticsState {
  studySessions: StudySession[];
  categoryPerformance: CategoryPerformance[];
  timeDistribution: TimeDistribution[];
  weeklyGoals: WeeklyGoal[];
  isLoading: boolean;
  error: string | null;
  fetchAnalytics: (timeRange: 'week' | 'month' | 'year') => Promise<void>;
  clear: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  studySessions: [],
  categoryPerformance: [],
  timeDistribution: [],
  weeklyGoals: [],
  isLoading: false,
  error: null,

  fetchAnalytics: async (timeRange: 'week' | 'month' | 'year') => {
    //console.log('Starting analytics fetch for time range:', timeRange);
    set({ isLoading: true, error: null });
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user');

      //console.log('Authenticated user:', user.id);

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      if (timeRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      //console.log('Fetching study sessions from:', startDate.toISOString());

      // Fetch study sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching study sessions:', sessionsError);
        throw sessionsError;
      }

      //console.log('Fetched study sessions:', sessions);

      // Fetch category performance
      const { data: performance, error: performanceError } = await supabase
        .from('category_performance')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (performanceError) {
        console.error('Error fetching category performance:', performanceError);
        throw performanceError;
      }

      //console.log('Fetched category performance:', performance);

      // Calculate time distribution
      const timeDistribution = (sessions || []).reduce((acc: TimeDistribution[], session) => {
        const duration = session.end_time 
          ? (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60) // Convert to minutes
          : 0;
        
        const existing = acc.find(item => item.category === session.session_type);
        if (existing) {
          existing.percentage += duration;
        } else {
          acc.push({
            category: session.session_type,
            percentage: duration
          });
        }
        return acc;
      }, []);

      // Calculate total duration for percentage
      const totalDuration = timeDistribution.reduce((acc, item) => acc + item.percentage, 0);
      timeDistribution.forEach(item => {
        item.percentage = (item.percentage / totalDuration) * 100;
      });

      //console.log('Calculated time distribution:', timeDistribution);

      // Calculate weekly goals based on category performance
      const weeklyGoals = (performance || []).map(cat => ({
        category: cat.category,
        progress: cat.accuracy
      }));

      //console.log('Calculated weekly goals:', weeklyGoals);

      set({
        studySessions: sessions || [],
        categoryPerformance: performance || [],
        timeDistribution,
        weeklyGoals,
        isLoading: false
      });

      //console.log('Analytics state updated successfully');
    } catch (error: any) {
      console.error('Error in fetchAnalytics:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  clear: () => {
    set({
      studySessions: [],
      categoryPerformance: [],
      timeDistribution: [],
      weeklyGoals: [],
      isLoading: false,
      error: null
    });
  }
})); 