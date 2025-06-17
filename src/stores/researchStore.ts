import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface ResearchSummary {
  id: string;
  user_id: string;
  paper_title: string;
  paper_author?: string;
  paper_year?: number;
  original_text: string;
  summary_text: string;
  chunk_length: number;
  summary_min_length: number;
  summary_max_length: number;
  model_used: string;
  created_at: string;
}

interface ResearchState {
  summaries: ResearchSummary[];
  isLoading: boolean;
  error: string | null;
  createSummary: (data: Omit<ResearchSummary, 'id' | 'created_at'>) => Promise<void>;
  fetchSummaries: () => Promise<void>;
  deleteSummary: (id: string) => Promise<void>;
}

export const useResearchStore = create<ResearchState>((set, get) => ({
  summaries: [],
  isLoading: false,
  error: null,

  createSummary: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: summary, error } = await supabase
        .from('research_summaries')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        summaries: [...state.summaries, summary],
        isLoading: false,
      }));

      // Update user stats
      const { user } = useAuthStore.getState();
      if (user) {
        await supabase.rpc('update_user_stats', {
          user_id_param: user.id,
          stat_type: 'researchSummariesCreated',
          increment_value: 1
        });
      }
    } catch (error) {
      console.error('Error creating summary:', error);
      set({ error: 'Failed to create summary', isLoading: false });
    }
  },

  fetchSummaries: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: summaries, error } = await supabase
        .from('research_summaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ summaries, isLoading: false });
    } catch (error) {
      console.error('Error fetching summaries:', error);
      set({ error: 'Failed to fetch summaries', isLoading: false });
    }
  },

  deleteSummary: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('research_summaries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        summaries: state.summaries.filter((summary) => summary.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting summary:', error);
      set({ error: 'Failed to delete summary', isLoading: false });
    }
  },
})); 